import React, { useState, useEffect, useRef } from 'react';
import Button from 'react-bootstrap/Button'
import { FaCircle, FaPen, FaFillDrip, FaHandPointUp, FaCompressArrowsAlt, FaExpandArrowsAlt, FaEraser, FaUndo, FaRedo, FaBrain, FaEyeSlash, FaEye, FaTh } from 'react-icons/fa'

const serverAddress = "http://localhost:5000";
const imageExt = ".jpg";
const maskImageExt = ".png";
const fillAlpha = 0.3;

const Editor = props =>  {
  // const classes = useStyles();

  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);

  const sampleName = props.location.state.sampleName;
  const annotatedSampleNames = props.location.state.annotatedSampleNames;

  const [drawing, setDrawing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [display, setDisplay] = useState(true);
  const [scale, setScale] = useState(1);
  const [originX, setOriginX] = useState(0);
  const [originY, setOriginY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [editor, setEditor] = useState("");
  const [operation, setOperation] = useState("draw");
  const [color, setColor] = useState("#0F0");
  const [coordinates, setCoordinates] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [editLog, setEditLog] = useState([]);
  const [editLogAll, setEditLogAll] = useState([]);
  const [canvasOpacity, setCanvasOpacity] = useState(1);

  useEffect(() => {
    const time = new Date().getTime();
    setStartTime(time);
    canvasContainerRef.current.addEventListener("scroll", ()=>{
      setScrollLeft(canvasContainerRef.current.scrollLeft);
      setScrollTop(canvasContainerRef.current.scrollTop);
    })
    canvasRef.current.addEventListener("touchstart", (e)=>{
      if(operation==="draw"){startDrawing(e)}
      else if(operation==="fill"){touchAndFill(e)}},
      {passive:false}
    )
    canvasRef.current.addEventListener("touchmove", (e)=>{
      if(operation==="draw"){draw(e)}},
      {passive:false}
    )
    canvasRef.current.addEventListener("touchend", (e)=>{
      if(operation==="draw"){endDrawing(e)}},
      {passive:false}
    )
  }, []);

  const getContext = () => {
    return canvasRef.current.getContext('2d');
  };
  const startDrawing = event => {
    const scale = scale;
    let x = (event.touches[0].pageX-event.target.getBoundingClientRect().left)/scale
    let y=(event.touches[0].pageY-event.target.getBoundingClientRect().top)/scale
    if(x < 0){x = 0}
    else if(x > canvasRef.current.width){
      x = canvasRef.width;
    };
    if(y < 0){y = 0}
    else if(y > canvasRef.current.width){y = canvasRef.current.width}
    const ctx = getContext();
    setDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
    event.stopPropagation();
    event.preventDefault();
    const time = new Date().getTime();
    setCoordinates([[x, y, scale, time]])
  };
  const draw = event => {
    const scale = scale;
    if(!drawing){
      return
    }
    let x=(event.touches[0].pageX-event.target.getBoundingClientRect().left)/scale
    let y=(event.touches[0].pageY-event.target.getBoundingClientRect().top)/scale
    if(x < 0){x = 0}
    else if(x > canvasRef.current.width){
      x = canvasRef.current.width;
    }
    if(y < 0){y = 0}
    else if(y > canvasRef.current.height){
      y = canvasRef.current.height;
    }
    const ctx = getContext();
    ctx.strokeStyle = color;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineTo(x, y);
    ctx.stroke();
    const time = new Date().getTime();
    setCoordinates(coordinates+[[x, y, scale, time]]);
    event.stopPropagation();
    event.preventDefault();
  };
  const endDrawing = event => {
    const ctx = getContext();
    ctx.closePath();
    setEditLog(editLog+[{editor: editor, operation: operation, color:color, coordinates: coordinates}]);
    setEditLogAll(editLogAll+[{editor: editor, operation: operation, color:color, coordinates: coordinates}]);
    fillInsideLine(color, coordinates);
    setDrawing(false);
    setCoordinates([]);
    setRedoStack([]);
  };
  const fillInsideLine = (color, coordinates) => {
    const ctx = getContext();
    ctx.fillStyle = color;
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.moveTo(coordinates[0][0], coordinates[0][1]);
    for (let coordinateProperty in coordinates.slice(1)){
      ctx.lineTo(coordinates[coordinateProperty][0], coordinates[coordinateProperty][1]);
      ctx.stroke();
    }
    ctx.closePath();
    ctx.fill();
    if(color!=="#FFF"){
      ctx.strokeStyle=color;
      ctx.fillStyle=color;
      if (color==="#000"){
        ctx.globalAlpha=1;
      }else{ctx.globalAlpha=fillAlpha}
      ctx.globalCompositeOperation = "source-over";
      ctx.beginPath();
      ctx.moveTo(coordinates[0][0], coordinates[0][1]);
      for (let coordinate_property in coordinates.slice(1)){
        ctx.lineTo(coordinates[coordinate_property][0], coordinates[coordinate_property][1]);
        ctx.stroke();
      }
      ctx.closePath();
      ctx.fill();
    }
  };
  const touchAndFill = event => {
    const startX= parseInt((event.touches[0].pageX-event.target.getBoundingClientRect().left)/scale);
    const startY= parseInt((event.touches[0].pageY-event.target.getBoundingClientRect().top)/scale);
    const time = new Date().getTime();
    floodFill(color, [startX, startY]);
    setEditLog(editLog+[{editor: editor, operation: operation, color:color, coordinates: coordinates}]);
    setEditLogAll(editLogAll+[{editor: editor, operation: operation, color:color, coordinates: coordinates}]);
    setRedoStack([]);
  };
  const floodFill = (color, coordinate) => {
    const startX = coordinate[0];
    const startY = coordinate[1];
    const ctx = getContext();
    const src = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    let startIndex = coord2index(startX, startY);
    const point = {x: startX, y: startY};
    const buf = [];
    const targetColorList = [src.data[startIndex], src.data[startIndex+1], src.data[startIndex+2],  src.data[startIndex+3]];
    buf.push(point);
    let count = 0;
    while (buf.length > 0){
      const target = buf.pop();
      const index = coord2index(target.x, target.y);
      const colorList=[src.data[index], src.data[index+1], src.data[index+2], src.data[index+3]];
      if (target.x < 0 || target.x >= canvasRef.current.width || target.y < 0 || target.y >= canvasRef.current.height){
        continue
      }
      if (((colorList[0] === targetColorList[0]) && (colorList[1] === targetColorList[1]) && (colorList[2] === targetColorList[2]) && (targetColorList[0]+targetColorList[1]+targetColorList[2])!==0) ||
       ((colorList[0] === targetColorList[0]) && (colorList[1] === targetColorList[1]) && (colorList[2] === targetColorList[2]) && (colorList[3] === targetColorList[3]) && (targetColorList[0]+targetColorList[1]+targetColorList[2])===0)) {
        src.data[index] = color2list(color)[0];
        src.data[index+1] = color2list(color)[1];
        src.data[index+2] = color2list(color)[2];
        src.data[index+3] = color2list(color)[3];
        buf.push({ x: target.x - 1, y: target.y });
        buf.push({ x: target.x, y: target.y + 1 });
        buf.push({ x: target.x + 1, y: target.y });
        buf.push({ x: target.x, y: target.y - 1 });
     }
     count ++;
     if(count > 2000000){break}
    }
    ctx.putImageData(src, 0, 0);
  };
  const coord2index = (x, y) => {
    return 4*y*canvasRef.current.width+4*x
  }
  const color2list = color => {
    let colorList=[]
    if (color==="#0FF"){colorList = [0, 255, 255, 255 * fillAlpha]}
    else if (color==="#0F0") {colorList = [0,255, 0, 255 * fillAlpha]}
    else if (color==="#00F") {colorList = [0,0, 255, 255 * fillAlpha]}
    else if (color==="#000") {colorList = [0, 0, 0, 255 * fillAlpha]}
    else if (color==="#FFF") {colorList = [255, 255, 255, 0]}
    return colorList
  }
  const clearCanvas = () => {
    const ctx = getContext();
    ctx.clearRect(0,0,canvasRef.current.width,canvasRef.current.height);
  };
  const resetState = () => {
    setCanvasOpacity(1);
    setEditLog([]);
    setEditLogAll([]);
    setCoordinates([]);
    setColor("#0F0");
    setRedoStack([]);
    setScale(1);
  };
  const addToLog = data => {
    setEditLogAll(editLogAll+[data]);
  };
  const undo = () => {
    if(editLog.length>0){
      const time = new Date().getTime()
      setEditLog(editLog+[{editor: editor, operation: "undo", time: time}]);
      setEditLogAll(editLogAll+[{editor: editor, operation: "undo", time: time}]);
      setRedoStack(redoStack+[editLog.pop()]);
      const ctx = this.getContext()
      const maskImage = new Image()
      if(annotatedSampleNames.indexOf(sampleName+maskImageExt) >= 0){
        maskImage.src = `${serverAddress}/static/mask/"${sampleName}${maskImageExt}`;
      }else{
        maskImage.src = `${serverAddress}/static/maskFromUnet/"${sampleName}${maskImageExt}`;
      }
      maskImage.onload = ()=> {
        this.fillInsideLine("#FFF", [[0,0], [canvasRef.current.width,0], [canvasRef.current.width,canvasRef.current.height], [0,canvasRef.current.height], [0,0]])
        ctx.globalCompositeOperation = "source-over"
        ctx.globalAlpha=1
        ctx.drawImage(maskImage,0,0,canvasRef.current.width,canvasRef.current.height)
        this.fromData(editLog);
      }
    }
  };
  const redo = () => {
    if(redoStack.length > 0){
      setEditLog(editLog+[redoStack.pop()]);
      setRedoStack(redoStack.slice(-1));
      setEditLogAll(editLogAll+[{editor: editor, operation: "redo", time: time}]);
      const time = new Date().getTime()
      fromData(editLog);
    }
  };
  const fromData = data => {
    const maskImage = new Image()
    maskImage.src = "/static/maskFromUnet/"+sampleName+maskImageExt;
    maskImage.onload = ()=> {
      for(let index in data){
        const editLog_ = data[index];
        const operation = editLog_.operation;
        if(operation === "draw"){
          const color = editLog_.color;
          const coordinates = editLog_.coordinates;
          fillInsideLine(color, coordinates);
        }else if (operation === "fill") {
          const color = editLog_.color;
          const coordinate = editLog_.coordinate;
          floodFill(color, coordinate);
        }else if (operation === "setMaskFromUnet"){
          const ctx = this.getContext();
          this.clearCanvas(this);
          ctx.globalCompositeOperation = "source-over";
          ctx.globalAlpha=1;
          ctx.drawImage(maskImage,0,0,this.refs.canvas.width,this.refs.canvas.height);
        }
      }
    }
  }
  const toggleMask = () => {
    if (display){
      setCanvasOpacity(0);
      setDisplay(false);
    }
    else if (!display){
      setCanvasOpacity(1);
      setDisplay(true);
    }
  };
  const setMask = src => {
    const ctx = getContext()
    const maskImage = new Image()
    maskImage.src = src
    maskImage.onload = ()=> {
      clearCanvas();
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.drawImage(maskImage,0,0,canvasRef.current.width,canvasRef.current.height);

    }
  };
  const setMaskLogger = () => {
    const time = new Date().getTime();
    setEditLog(editLog+[{editor: editor, operation: "setMaskFromUnet", time: time}]);
    setEditLogAll(editLogAll+[{editor: editor, operation: "setMaskFromUnet", time: time}]);
  };
  const toSampleList = () => {
    const time = new Date().getTime();
    const canvas=canvasRef.current;
    const dataURL = canvas.toDataURL();
    const fetch = require('node-fetch');
    this.setState({endTime:time}, ()=>{
      fetch('/api/save', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          startTime: startTime,
          endTime: endTime,
          image:dataURL,
          sampleName:sampleName,
          editLog:editLogAll,
        }),
      })
      .then(()=>{console.log("back to sample list")})
    })
  };

  const styles = {
    nameForm:{border:"solid 0px"},
    magnification:{marginLeft:"0px",width:"50px", border:"solid 0px"},

    canvasContainer: {overflow:`${scale !== 1 ? "scroll" : "hidden"}`, position: 'relative', width:"640px", height:"640px", marginRight:"30px"},
    canvas:{position:'absolute', opacity:`${canvasOpacity}`, transformOrigin:`${originX}% ${originY}%`, transform:`scale(${scale})`},
    img: {position:'absolute', width:"630px", height:"630px", transformOrigin:`${originX}% ${originY}%`, transform:`scale(${scale})`},

    subImageContainer:{position:"relative", overflow:"hidden", width:"630px", height:"630px"},
    subImage: {zIndex:"1", position:"absolute", width:"630px", height:"630px", marginTop:"0px", marginLeft:"0px", transformOrigin:`${originX}% ${originY}%`,},
    rect1:{zIndex:"10", position:"absolute", backgroundColor:"rgba(0,0,0,0.5)", marginLeft:`0px`,  marginTop:`0px`, width:`630px`, height:`${scrollTop/scale}px`},
    rect2:{zIndex:"10", position:"absolute", backgroundColor:"rgba(0,0,0,0.5)", marginLeft:`0px`,  marginTop:`${scrollTop/scale}px`, width:`${scrollLeft/scale}px`, height:`${630/scale}px`},
    rect3:{zIndex:"10", position:"absolute", backgroundColor:"rgba(0,0,0,0.5)", marginLeft:`${scrollLeft/scale+630/scale}px`,  marginTop:`${scrollTop/scale}px`, width:`${630-scrollLeft/scale-630/scale}px`, height:`${630/scale}px`},
    rect4:{zIndex:"10", position:"absolute", backgroundColor:"rgba(0,0,0,0.5)", marginLeft:`0px`,  marginTop:`${scrollTop/scale+630/scale}px`, width:`630px`, height:`${630-scrollTop/scale-630/scale}px`},

    buttonContainer: {margin: '0px', marginLeft:'40px'},
    button: {cursor: 'pointer', margin: '5px', width:"40px", height:"40px", color: "#444"},
    greenButton: {cursor: 'pointer', margin: '5px', color: 'green',width:"40px",height:"40px"},
    blueButton: {cursor: 'pointer', margin: '5px', color: 'blue',width:"40px",height:"40px"},
    blueGreenButton: {cursor: 'pointer', margin: '5px', color: '#0FF',width:"40px",height:"40px"},
    blackButton: {cursor: 'pointer', margin: '5px', color: 'black',width:"40px",height:"40px"},
    brain: {cursor: 'pointer', margin: '5px', width:"40px", height:"40px", color:"#0FF"},
  }
  const iconSize="80%"
  return (
    <div>
     <input type="text" value={props.location.state.sampleName} style={styles.nameForm}/>
     <input type="text" value={`x${scale}`} style={styles.magnification}/>
     <div style = {{width:"100%", display: "flex", flexDirection: "row", justifyContent: "center"}}>
       <div style={styles.canvasContainer} ref={canvasContainerRef}>
         <img src={serverAddress+"/static/image/"+props.location.state.sampleName+imageExt} style={styles.img} alt={props.location.state.sampleName}/>
         <canvas
           className="canvas"
           ref={canvasRef}
           width="630px"
           height="630px"
           style={styles.canvas}
         >
         </canvas>
       </div>
       <div style={styles.subImageContainer}>
         <div style={styles.rect1}></div>
         <div style={styles.rect2}></div>
         <div style={styles.rect3}></div>
         <div style={styles.rect4}></div>
         <img src={serverAddress+"/static/image/"+props.location.state.sampleName+imageExt} style={styles.subImage} alt={props.location.state.sampleName}/>
       </div>
     </div>
     <div style={styles.buttonContainer}>
     <Button variant="outline-secondary" style={styles.button}>{operation === "scroll"?<FaHandPointUp size={iconSize}/>:operation==="fill"?<FaFillDrip size={iconSize} style={{color:color}}/>:<FaPen size={iconSize} style={{color:color}}/>}</Button>
     <Button variant="outline-secondary" style={styles.button} onClick={() => {setOperation("draw")}}><FaPen style = {{margin:"auto"}} size={iconSize}/></Button>
     <Button variant="outline-secondary" style={styles.button} onClick={() => {setOperation("fill")}}><FaFillDrip style = {{margin:"auto"}}size={iconSize}/></Button>
     <Button variant="outline-secondary" style={styles.button} onClick={() => {setOperation("scroll")}}><FaHandPointUp style = {{margin:"auto"}}size={iconSize}/></Button>
     <Button variant="outline-secondary" style={styles.button} onClick={() => {if(scale>=1.25){setScale(scale-0.25)}}}><FaCompressArrowsAlt style = {{margin:"auto"}} size={iconSize}/></Button>
     <Button variant="outline-secondary" style={styles.button} onClick={() => {setScale(scale+0.25)}}><FaExpandArrowsAlt style = {{margin:"auto"}} size={iconSize}/></Button>
     <Button variant="outline-secondary" style={styles.greenButton} onClick={() => {setColor("#0F0")}}><FaCircle style = {{margin:"auto"}} size={iconSize}/></Button>
     <Button variant="outline-secondary" style={styles.blueButton} onClick={() => {setColor("#00F")}}><FaCircle style = {{margin:"auto"}} size={iconSize}/></Button>
     <Button variant="outline-secondary" style={styles.blueGreenButton} onClick={() => {setColor("#0FF")}}><FaCircle style = {{margin:"auto"}} size={iconSize}/></Button>
     <Button variant="outline-secondary" style={styles.blackButton} onClick={() => {setColor("#000")}}><FaCircle style = {{margin:"auto"}} size={iconSize}/></Button>
     <Button variant="outline-secondary" style={styles.button} onClick={() => {setColor("#FFF")}}><FaEraser style = {{margin:"auto"}} size={iconSize}/></Button>
     <Button variant="outline-secondary" style={styles.button} onClick={() => {undo(this)}}><FaUndo style = {{margin:"auto"}} size={iconSize}/></Button>
     <Button variant="outline-secondary" style={styles.button} onClick={() => {redo(this)}}><FaRedo style = {{margin:"auto"}} size={iconSize}/></Button>
     <Button variant="outline-secondary" style={styles.button} onClick={() => {toggleMask(this)}}>{display ? <FaEyeSlash style = {{margin:"auto"}} size={iconSize}/> : <FaEye size={iconSize}/>}</Button>
     <Button
      variant="outline-secondary"
      style={styles.brain}
      onClick={() => {
       clearCanvas(this);
       setDrawing(false);
       setCoordinates([]);
       setRedoStack([]);
      }}>
      <FaBrain style = {{margin:"auto"}} size={iconSize}/>
     </Button>
     </div>
   </div>
 );
}

export default Editor;
function newFunction() {
  const ;
}

