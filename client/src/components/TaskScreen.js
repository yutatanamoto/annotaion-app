import React, { useState, useEffect, useRef } from 'react';
import Button from '@material-ui/core/Button';
import { FaUndo, FaRedo } from 'react-icons/fa'
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  button: {
     margin: 10,
  },
});

const imageExt = ".jpg";
const editor = "tanamoto";
const distanceTreshold = 20;
const startPointSize = 40;
const sampleNames = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
    "29",
    "30",
    "31",
    "32",
    "33",
    "34",
    "35",
    "36",
    "37",
    "38",
    "39",
    "40",
];

const TaskScreen = props =>  {
    const classes = useStyles();

    const originX = 0;
    const originY = 0;

    const [sampleName, setSampleName] = useState(sampleNames[0])
    const [display, setDisplay] = useState(true);
    const [scale, setScale] = useState(1);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);
    const [operation, setOperation] = useState("draw");
    const [color, setColor] = useState("#000");
    const [alpha, setAlpha] = useState(0.3);
    const [redoStack, setRedoStack] = useState([]);
    const [editings, setEditings] = useState([]);
    const [editLogs, setEditLogs] = useState([]);
    const [initialCoordinate, setInitialCoordinate] = useState({});
    const [drawing, setDrawing] = useState(false);
    const [saving, setSaving] = useState(false);

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
    const sampleIndexRef = useRef(0);
    const sampleNameRef = useRef(sampleName);

    useEffect(() => {
        initialize();
        canvasContainerRef.current.addEventListener("scroll", ()=>{
            setScrollLeft(canvasContainerRef.current.scrollLeft);
            setScrollTop(canvasContainerRef.current.scrollTop);
        });
        canvasRef.current.addEventListener("touchstart", event =>{
            if(operationRef.current === "draw" & displayRef.current){startDrawing(event)}
            else if(operationRef.current==="fill"){touchAndFill(event)}},
            {passive:false}
        );
        canvasRef.current.addEventListener("touchmove", event =>{
            if(operationRef.current === "draw" & displayRef.current){draw(event)}},
            {passive:false}
        );
        canvasRef.current.addEventListener("touchend", event =>{
            if(operationRef.current === "draw" & displayRef.current){endDrawing(event)}},
            {passive:false}
        );
    }, []);
    useEffect(() => {
        if (saving) {
            post();
            setSaving(false);
        }
    }, [saving, editLogs]);
    useEffect(() => {
            initialize();
    }, [sampleName]);

    const getContext = () => {
        return canvasRef.current.getContext('2d');
    };
    const startDrawing = event => {
        const currentTime = new Date().getTime();
        const timeOrigin = performance.timeOrigin;
        const force = event.targetTouches[0].force;
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
            const editLog = {
                editted_at: currentTime,
                editted_at_: timeOrigin+event.timeStamp,
                sample_name: sampleNameRef.current,
                operation_type: 'resume_drawing',
                x: x,
                y: y,
                color: colorRef.current,
                force: force,
                editted_by: editor
            };
            const newEditLogs = [...editLogsRef.current, editLog];
            updateEditLogs(newEditLogs);
        } else {
            setInitialCoordinate({x: x, y: y});
            ctx.beginPath();
            ctx.moveTo(x, y);
            coordinatesRef.current = [{x:x, y:y}];
            const editLog = {
                editted_at: currentTime,
                editted_at_: timeOrigin+event.timeStamp,
                sample_name: sampleNameRef.current,
                operation_type: 'start_drawing',
                x: x,
                y: y,
                color: colorRef.current,
                force: force,
                editted_by: editor
            }
            const newEditLogs = [...editLogsRef.current, editLog];
            updateEditLogs(newEditLogs);
        }
        event.stopPropagation();
        event.preventDefault();
    };
    const draw = event => {
        const currentTime = new Date().getTime();
        const timeOrigin = performance.timeOrigin;
        console.log("diff -> ", timeOrigin+event.timeStamp-currentTime);
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
        const force = event.targetTouches[0].force;
        const editLog = {
            editted_at: currentTime,
            editted_at_: timeOrigin+event.timeStamp,
            sample_name: sampleNameRef.current,
            operation_type: 'draw_line',
            x: x,
            y: y,
            color: colorRef.current,
            force: force,
            editted_by: editor
        };
        const newEditLogs = [...editLogsRef.current, editLog];
        updateEditLogs(newEditLogs);
        event.stopPropagation();
        event.preventDefault();
    };
    const endDrawing = event => {
        const currentTime = new Date().getTime();
        const timeOrigin = performance.timeOrigin;
        console.log("diff -> ", timeOrigin+event.timeStamp-currentTime);
        const lastCoordinate = coordinatesRef.current[coordinatesRef.current.length-1];
        const lastX = lastCoordinate.x;
        const lastY = lastCoordinate.y;
        const startCoordinate = coordinatesRef.current[0];
        const startX = startCoordinate.x;
        const startY = startCoordinate.y;
        const distance = Math.sqrt((lastX - startX)**2 + (lastY - startY)**2)
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
            const editLog = {
                editted_at: currentTime,
                editted_at_: timeOrigin+event.timeStamp,
                sample_name: sampleNameRef.current,
                operation_type: 'end_drawing',
                x: NaN,
                y: NaN,
                color: NaN,
                force: NaN,
                editted_by: editor
            };
            const newEditLogs = [...editLogsRef.current, editLog];
            updateEditLogs(newEditLogs);
        } else {
            const editLog = {
                editted_at: currentTime,
                editted_at_: timeOrigin+event.timeStamp,
                sample_name: sampleNameRef.current,
                operation_type: 'stop_drawing',
                x: NaN,
                y: NaN,
                color: NaN,
                force: NaN,
                editted_by: editor
            };
            const newEditLogs = [...editLogsRef.current, editLog];
            updateEditLogs(newEditLogs);
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
        const startIndex = coord2index(startX, startY);
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
    };
    const clearCanvas = () => {
        const ctx = getContext();
        ctx.clearRect(0,0,canvasRef.current.width,canvasRef.current.height);
    };
    const undo = event => {
        if(editings.length>0){
            const currentTime = new Date().getTime();
            const timeOrigin = performance.timeOrigin;
            eraseInsideLine([{x:0,y:0}, {x:canvasRef.current.width,y:0}, {x:canvasRef.current.width,y:canvasRef.current.height}, {x:0,y:canvasRef.current.height}, {x:0,y:0}])
            const newEditings = editings.slice(0,-1);
            const newRedoStack = [...redoStack, editings.slice(-1)[0]]
            updateEditings(newEditings);
            setRedoStack(newRedoStack);
            fromData(newEditings);
            const editLog = {
                editted_at: currentTime,
                editted_at_: timeOrigin+event.timeStamp,
                sample_name: sampleName,
                operation_type: 'undo',
                x: NaN,
                y: NaN,
                color: NaN,
                force: NaN,
                editted_by: editor
            };
            const newEditLogs = [...editLogsRef.current, editLog];
            updateEditLogs(newEditLogs);
        }
    };
    const redo = event => {
        if(redoStack.length > 0){
            const currentTime = new Date().getTime();
            const timeOrigin = performance.timeOrigin;
            const newEditings = [...editings, redoStack.slice(-1)[0]];
            const newRedoStack = redoStack.slice(0, -1)
            updateEditings(newEditings);
            setRedoStack(newRedoStack);
            fromData(newEditings);
            const editLog = {
                editted_at: currentTime,
                editted_at_: timeOrigin+event.timeStamp,
                sample_name: sampleName,
                operation_type: 'redo',
                x: NaN,
                y: NaN,
                color: NaN,
                force: NaN,
                editted_by: editor
            };
            const newEditLogs = [...editLogsRef.current, editLog];
            updateEditLogs(newEditLogs);
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
            } else if (editLog_.operation === "fill") {
                floodFill(editLog_.color, editLog_.coordinate);
            }
        }
    };
    const updateEditings = newEditings => {
        setEditings(newEditings);
        editingsRef.current = newEditings;
    };
    const updateEditLogs = newEditLogs => {
        setEditLogs(newEditLogs);
        editLogsRef.current = newEditLogs;
    };
    const save = event => {
        const currentTime = new Date().getTime();
        const timeOrigin = performance.timeOrigin;
        const editLog = {
            editted_at: currentTime,
            editted_at_: timeOrigin+event.timeStamp,
            sample_name: sampleName,
            operation_type: 'save',
            x: NaN,
            y: NaN,
            color: NaN,
            force: NaN,
            editted_by: editor
        }
        setSaving(true);
        const newEditLogs = [...editLogsRef.current, editLog];
        updateEditLogs(newEditLogs);
    };
    const post = () => {
        const dataURL = canvasRef.current.toDataURL();
        const obj = {
            editor: editor,
            image: dataURL,
            sample_name: sampleName,
            edit_logs: editLogs,
        }
        const body = JSON.stringify(obj);
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
        const method = "POST";
        const fetch = require('node-fetch');
        fetch(`${process.env.REACT_APP_DEV_API_URL}/api/save?mode=write`, {method, headers, body})
            .then(handleErrors)
            .then(updateSampleName)
            .catch(error => console.log(error));
    };
    const handleErrors = response => {
        if (!response.ok) {
            throw Error(response.statusText);
        }
        return response;
    };
    const updateSampleName = () => {
        sampleIndexRef.current += 1;
        sampleNameRef.current = sampleNames[sampleIndexRef.current]
        setSampleName(sampleNames[sampleIndexRef.current]);
    };
    const initialize = () => {
        const currentTime = new Date().getTime();
        clearCanvas();
        setEditings([]);
        setRedoStack([]);
        coordinatesRef.current = [];
        editingsRef.current = [];
        const editLog = {
            editted_at: currentTime,
            editted_at_: currentTime,
            sample_name: sampleName,
            operation_type: 'initialize',
            x: NaN,
            y: NaN,
            color: NaN,
            force: NaN,
            editted_by: editor
        };
        const newEditLogs = [editLog];
        updateEditLogs(newEditLogs);
    };

    const styles = {
        nameForm:{border:"solid 0px"},
        magnification:{marginLeft:"0px",width:"50px", border:"solid 0px"},

        canvasContainer: {overflow:`${scale !== 1 ? "scroll" : "hidden"}`, position: 'relative', width:"640px", height:"640px", marginRight:"30px"},
        canvas:{position:'absolute', opacity:`${display ? 1 : 0}`, transformOrigin:`${originX}% ${originY}%`, transform:`scale(${scale})`},
        img: {position:'absolute', width:"630px", height:"630px", transformOrigin:`${originX}% ${originY}%`, transform:`scale(${scale})`},

        buttonContainer: {width:"100%", height:80, display: "flex", flexDirection: "row", justifyContent: "center"},
        button: {cursor: 'pointer', margin: '5px', width:"40px", height:"40px"},
        greenButton: {cursor: 'pointer', margin: '5px', color: 'green',width:"40px",height:"40px"},
        blueButton: {cursor: 'pointer', margin: '5px', color: 'blue',width:"40px",height:"40px"},
        blueGreenButton: {cursor: 'pointer', margin: '5px', color: '#0FF',width:"40px",height:"40px"},
        blackButton: {cursor: 'pointer', margin: '5px', color: 'black',width:"40px",height:"40px"},
        startPoint:{zIndex:"10", position:"absolute", border: 'solid', marginLeft:`${(initialCoordinate.x-startPointSize/2)*scale}px`,  marginTop:`${(initialCoordinate.y-startPointSize/2)*scale}px`, width:`${startPointSize}px`, height:`${startPointSize}px`, borderRadius: '50%', opacity:`${drawing ? 1 : 0}`},
    };
  
    return (
        <div>
            <div style = {{width:"100%", display: "flex", flexDirection: "row", justifyContent: "center"}}>
                <div style={styles.canvasContainer} ref={canvasContainerRef}>
                    <img src={process.env.REACT_APP_DEV_API_URL+"/static/image/"+sampleName+imageExt} style={styles.img} alt={sampleName}/>
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
            </div>
            <div style={styles.buttonContainer}>
                <Button variant="outlined" color="primary" className={classes.button} onClick={undo}><FaUndo style = {{margin:"auto"}} /></Button>
                <Button variant="outlined" color="primary" className={classes.button} onClick={redo}><FaRedo style = {{margin:"auto"}} /></Button>
                <Button variant="outlined" color="primary" className={classes.button} onClick={save}>Next</Button>
            </div>
        </div>
    );
}

export default TaskScreen;

