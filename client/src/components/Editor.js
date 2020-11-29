import React, { useState, useEffect, useRef } from 'react';
import Button from '@material-ui/core/Button';
import { FaCircle, FaPen, FaFillDrip, FaHandPointUp, FaCompressArrowsAlt, FaExpandArrowsAlt, FaEraser, FaUndo, FaRedo, FaEyeSlash, FaEye } from 'react-icons/fa'

const imageExt = ".jpg";
const editor = "tanamoto";
const distanceTreshold = 10;
const startPointSize = 16;

const Editor = props =>  {

  const originX = 0;
  const originY = 0;

  const [display, setDisplay] = useState(true);
  const [scale, setScale] = useState(1);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [operation, setOperation] = useState("draw");
  const [color, setColor] = useState("#0F0");
  const [alpha, setAlpha] = useState(0.3);
  const [redoStack, setRedoStack] = useState([]);
  const [editings, setEditings] = useState([]);
  const [editLogs, setEditLogs] = useState([]);
  const [initialCoordinate, setInitialCoordinate] = useState({});
  const [drawing, setDrawing] = useState(false);

  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const coordinatesRef = useRef([]);
  const editingsRef = useRef(editings);
  const scaleRef = useRef(scale);
  const colorRef = useRef(color);
  const alphaRef = useRef(alpha);
  const operationRef = useRef(operation);
  const displayRef = useRef(display);
  const editLogsRef = useRef(editLogs);

  useEffect(() => {
    canvasContainerRef.current.addEventListener("scroll", ()=>{
      setScrollLeft(canvasContainerRef.current.scrollLeft);
      setScrollTop(canvasContainerRef.current.scrollTop);
    })
    canvasRef.current.addEventListener("touchstart", event =>{
      if(operationRef.current === "draw" & displayRef.current){startDrawing(event)}
      else if(operationRef.current==="fill"){touchAndFill(event)}},
      {passive:false}
    )
    canvasRef.current.addEventListener("touchmove", event =>{
      if(operationRef.current === "draw" & displayRef.current){draw(event)}},
      {passive:false}
    )
    canvasRef.current.addEventListener("touchend", event =>{
      if(operationRef.current === "draw" & displayRef.current){endDrawing(event)}},
      {passive:false}
    )
  }, []);

  const getContext = () => {
    return canvasRef.current.getContext('2d');
  };
  const startDrawing = event => {
    const currentTime = new Date().getTime();
    let force = event.targetTouches[0].force;
    let x = (event.touches[0].pageX-event.target.getBoundingClientRect().left)/scaleRef.current
    let y = (event.touches[0].pageY-event.target.getBoundingClientRect().top)/scaleRef.current
    if(x < 0){x = 0}
    else if(x > canvasRef.current.width){x = canvasRef.current.width;}
    if(y < 0){y = 0}
    else if(y > canvasRef.current.width){y = canvasRef.current.width}
    const ctx = getContext();
    if (coordinatesRef.current.length !== 0) {
      ctx.lineTo(x, y);
      ctx.stroke();
      coordinatesRef.current = [...coordinatesRef.current, {x:x, y:y}];
      let editLog = {
        editted_at: currentTime,
        operation_type: 'draw_line',
        x: x,
        y: y,
        force: force,
        editted_by: editor
      }
      setEditLogs([...editLogsRef.current, editLog]);
      editLogsRef.current = [...editLogsRef.current, editLog];
    } else {
      setInitialCoordinate({x: x, y: y});
      ctx.beginPath();
      ctx.moveTo(x, y);
      coordinatesRef.current = [{x:x, y:y}];
      let editLog = {
        editted_at: currentTime,
        operation_type: 'start_drawing',
        x: x,
        y: y,
        force: force,
        editted_by: editor
      }
      setEditLogs([...editLogsRef.current, editLog]);
      editLogsRef.current = [...editLogsRef.current, editLog];
    }
    event.stopPropagation();
    event.preventDefault();
  };
  const draw = event => {
    setDrawing(true);
    let x=(event.touches[0].pageX-event.target.getBoundingClientRect().left)/scaleRef.current;
    let y=(event.touches[0].pageY-event.target.getBoundingClientRect().top)/scaleRef.current;
    if(x < 0){x = 0}
    else if(x > canvasRef.current.width){x = canvasRef.current.width;}
    if(y < 0){y = 0}
    else if(y > canvasRef.current.width){y = canvasRef.current.width;}
    const ctx = getContext();
    ctx.strokeStyle = colorRef.current;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineTo(x, y);
    ctx.stroke();
    coordinatesRef.current = [...coordinatesRef.current, {x:x, y:y}];
    const currentTime = new Date().getTime();
    let force = event.targetTouches[0].force;
    let editLog = {
      editted_at: currentTime,
      operation_type: 'draw_line',
      x: x,
      y: y,
      force: force,
      editted_by: editor
    }
    setEditLogs([...editLogsRef.current, editLog]);
    editLogsRef.current = [...editLogsRef.current, editLog];
    event.stopPropagation();
    event.preventDefault();
  };
  const endDrawing = event => {
    const currentTime = new Date().getTime();
    let lastCoordinate = coordinatesRef.current[coordinatesRef.current.length-1];
    let lastX = lastCoordinate.x;
    let lastY = lastCoordinate.y;
    let startCoordinate = coordinatesRef.current[0];
    let startX = startCoordinate.x;
    let startY = startCoordinate.y;
    let distance = Math.sqrt((lastX - startX)**2 + (lastY - startY)**2)
    if (distance < distanceTreshold) {
      setDrawing(false);
      const ctx = getContext();
      ctx.closePath();
      eraseInsideLine(coordinatesRef.current);
      if (colorRef.current !== '#FFF') {
        fillInsideLine(colorRef.current, coordinatesRef.current);
      }
      const newEditings = [...editingsRef.current, {editor: editor, operation: operationRef.current, color:colorRef.current, coordinates: coordinatesRef.current}];
      updateEditings(newEditings);
      coordinatesRef.current = [];
      setRedoStack([]);
      let editLog = {
        editted_at: currentTime,
        operation_type: 'end_drawing',
        x: NaN,
        y: NaN,
        force: NaN,
        editted_by: editor
      }
      setEditLogs([...editLogsRef.current, editLog]);
      editLogsRef.current = [...editLogsRef.current, editLog];
    }
  };
  const fillInsideLine = (color_, coordinates_) => {
    const ctx = getContext();
    ctx.strokeStyle = color_;
    ctx.fillStyle = color_;
    ctx.globalAlpha = 0.3;
    ctx.globalCompositeOperation = "source-over";
    ctx.beginPath();
    ctx.moveTo(coordinates_[0].x, coordinates_[0].y);
    for (let coordinate_property in coordinates_.slice(1)){
      ctx.lineTo(coordinates_[coordinate_property].x, coordinates_[coordinate_property].y);
      ctx.stroke();
    }
    ctx.closePath();
    ctx.fill();
  };
  const eraseInsideLine = coordinates_ => {
    const ctx = getContext();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.moveTo(coordinates_[0].x, coordinates_[0].y);
    for (let coordinateProperty in coordinates_.slice(1)){
      ctx.lineTo(coordinates_[coordinateProperty].x, coordinates_[coordinateProperty].y);
      ctx.stroke();
    }
    ctx.closePath();
    ctx.fill();
  };
  const touchAndFill = event => {
    const startX= parseInt((event.touches[0].pageX-event.target.getBoundingClientRect().left)/scale);
    const startY= parseInt((event.touches[0].pageY-event.target.getBoundingClientRect().top)/scale);
    floodFill(colorRef.current, [startX, startY]);
    const newEditings = [...editingsRef.current, {editor: editor, operation: operationRef.current, color:colorRef.current, coordinate: [startX, startY]}];
    updateEditings(newEditings)
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
    if (color==="#0FF"){colorList = [0, 255, 255, 255 * alphaRef.current]}
    else if (color==="#0F0") {colorList = [0,255, 0, 255 * alphaRef.current]}
    else if (color==="#00F") {colorList = [0,0, 255, 255 * alphaRef.current]}
    else if (color==="#000") {colorList = [0, 0, 0, 255 * alphaRef.current]}
    else if (color==="#FFF") {colorList = [255, 255, 255, 0]}
    return colorList
  }
  const clearCanvas = () => {
    const ctx = getContext();
    ctx.clearRect(0,0,canvasRef.current.width,canvasRef.current.height);
  };
  const undo = () => {
    if(editings.length>0){
      eraseInsideLine([{x:0,y:0}, {x:canvasRef.current.width,y:0}, {x:canvasRef.current.width,y:canvasRef.current.height}, {x:0,y:canvasRef.current.height}, {x:0,y:0}])
      const newEditings = editings.slice(0,-1);
      const newRedoStack = [...redoStack, editings.slice(-1)[0]]
      updateEditings(newEditings);
      setRedoStack(newRedoStack);
      fromData(newEditings);
    }
  };
  const redo = () => {
    if(redoStack.length > 0){
      const newEditings = [...editings, redoStack.slice(-1)[0]];
      const newRedoStack = redoStack.slice(0, -1)
      updateEditings(newEditings);
      setRedoStack(newRedoStack);
      fromData(newEditings);
    }
  };
  const fromData = data => {
    for(let index in data){
      const editLog_ = data[index];
      if (editLog_.operation === "draw") {
        eraseInsideLine(editLog_.coordinates);
        if (editLog_.color !== '#FFF') {
          fillInsideLine(editLog_.color, editLog_.coordinates);
        }
      }
      else if (editLog_.operation === "fill") {
        floodFill(editLog_.color, editLog_.coordinate);
      }
    }
  }
  const toggleMask = () => {
    const newVisiblity = !display;
    setDisplay(newVisiblity);
    displayRef.current = newVisiblity;
  };
  const setMask = src => {
    const ctx = getContext();
    const maskImage = new Image()
    maskImage.src = src
    maskImage.onload = ()=> {
      clearCanvas();
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.drawImage(maskImage,0,0,canvasRef.current.width,canvasRef.current.height);

    }
  };
  const scaleUp = () => {
    const newScale = scale + 0.25;
    setScale(newScale);
    scaleRef.current = newScale;
  };
  const scaleDown = () => {
    if(scale > 1.00){
      const newScale = scale - 0.25;
      setScale(newScale);
      scaleRef.current = newScale;
    }
  };
  const updateColor = newColor => {
    setColor(newColor);
    colorRef.current = newColor;
  };
  const updateAlpha = newAlpha => {
    setAlpha(newAlpha);
    alphaRef.current = newAlpha;
  };
  const updateEditings = newEditings => {
    setEditings(newEditings);
    editingsRef.current = newEditings;
  };
  const updateOperation = newOperation => {
    setOperation(newOperation);
    operationRef.current = newOperation;
  };
  const save = () => {
    const dataURL = canvasRef.current.toDataURL();
    const obj = {
      editor: editor,
      image: dataURL,
      sampleName: props.location.state.sampleName,
      editLogs: editLogs,
    }
    const body = JSON.stringify(obj);
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    const method = "POST";
    const fetch = require('node-fetch');
    fetch(`${process.env.REACT_APP_DEV_API_URL}/api/save`, {method, headers, body})
      .then(res => res.json())
      .then(json => console.log(json))
  };

  const styles = {
    nameForm:{border:"solid 0px"},
    magnification:{marginLeft:"0px",width:"50px", border:"solid 0px"},

    canvasContainer: {overflow:`${scale !== 1 ? "scroll" : "hidden"}`, position: 'relative', width:"640px", height:"640px", marginRight:"30px"},
    canvas:{position:'absolute', opacity:`${display ? 1 : 0}`, transformOrigin:`${originX}% ${originY}%`, transform:`scale(${scale})`},
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
    startPoint:{zIndex:"10", position:"absolute", border: 'solid', marginLeft:`${(initialCoordinate.x-startPointSize/2)*scale}px`,  marginTop:`${(initialCoordinate.y-startPointSize/2)*scale}px`, width:`${startPointSize}px`, height:`${startPointSize}px`, borderRadius: '50%', opacity:`${drawing ? 1 : 0}`},
  }
  const iconSize="50%";
  return (
    <div>
     <input type="text" value={props.location.state.sampleName} style={styles.nameForm}/>
     <input type="text" value={`x${scale}`} style={styles.magnification}/>
     <div style = {{width:"100%", display: "flex", flexDirection: "row", justifyContent: "center"}}>
       <div style={styles.canvasContainer} ref={canvasContainerRef}>
         <img src={process.env.REACT_APP_DEV_API_URL+"/static/image/"+props.location.state.sampleName+imageExt} style={styles.img} alt={props.location.state.sampleName}/>
         <canvas
           className="canvas"
           ref={canvasRef}
           width="630px"
           height="630px"
           style={styles.canvas}
         >
         </canvas>
         <div style={styles.startPoint}></div>
       </div>
       <div style={styles.subImageContainer}>
         <div style={styles.rect1}></div>
         <div style={styles.rect2}></div>
         <div style={styles.rect3}></div>
         <div style={styles.rect4}></div>
         <img src={process.env.REACT_APP_DEV_API_URL+"/static/image/"+props.location.state.sampleName+imageExt} style={styles.subImage} alt={props.location.state.sampleName}/>
       </div>
     </div>
     <div style={styles.buttonContainer}>
     <Button variant="outline-secondary" style={styles.button}>{operation === "scroll"?<FaHandPointUp size={iconSize}/>:operation==="fill"?<FaFillDrip size={iconSize} style={{color:color}}/>:<FaPen size={iconSize} style={{color:color}}/>}</Button>
     <Button variant="outline-secondary" style={styles.button} onClick={() => {updateOperation("draw")}}><FaPen style = {{margin:"auto"}} size={iconSize}/></Button>
     <Button variant="outline-secondary" style={styles.button} onClick={() => {updateOperation("fill")}}><FaFillDrip style = {{margin:"auto"}}size={iconSize}/></Button>
     <Button variant="outline-secondary" style={styles.button} onClick={() => {updateOperation("scroll")}}><FaHandPointUp style = {{margin:"auto"}}size={iconSize}/></Button>
     <Button variant="outline-secondary" style={styles.button} onClick={scaleDown}><FaCompressArrowsAlt style = {{margin:"auto"}} size={iconSize}/></Button>
     <Button variant="outline-secondary" style={styles.button} onClick={scaleUp}><FaExpandArrowsAlt style = {{margin:"auto"}} size={iconSize}/></Button>
     <Button variant="outline-secondary" style={styles.greenButton} onClick={() => updateColor("#0F0")}><FaCircle style = {{margin:"auto"}} size={iconSize}/></Button>
     <Button variant="outline-secondary" style={styles.blueButton} onClick={() => updateColor("#00F")}><FaCircle style = {{margin:"auto"}} size={iconSize}/></Button>
     <Button variant="outline-secondary" style={styles.blueGreenButton} onClick={() => updateColor("#0FF")}><FaCircle style = {{margin:"auto"}} size={iconSize}/></Button>
     <Button variant="outline-secondary" style={styles.blackButton} onClick={() => updateColor("#000")}><FaCircle style = {{margin:"auto"}} size={iconSize}/></Button>
     <Button variant="outline-secondary" style={styles.button} onClick={() => updateColor("#FFF")}><FaEraser style = {{margin:"auto"}} size={iconSize}/></Button>
     <Button variant="outline-secondary" style={styles.button} onClick={() => {undo(this)}}><FaUndo style = {{margin:"auto"}} size={iconSize}/></Button>
     <Button variant="outline-secondary" style={styles.button} onClick={() => {redo(this)}}><FaRedo style = {{margin:"auto"}} size={iconSize}/></Button>
     <Button variant="outline-secondary" style={styles.button} onClick={() => {toggleMask(this)}}>{display ? <FaEyeSlash style = {{margin:"auto"}} size={iconSize}/> : <FaEye size={iconSize}/>}</Button>
     <Button variant="contained" style={styles.button} onClick={()=>save()}>Save</Button>
     </div>
   </div>
 );
}

export default Editor;

