import React, { useState, useEffect, useRef } from 'react';
import Button from '@material-ui/core/Button';
import { FaUndo, FaRedo } from 'react-icons/fa'
import { makeStyles } from '@material-ui/core/styles';
import post from './Utils';

const useStyles = makeStyles({
    root: {
        display: "flex",
        flexDirection: "column",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: 'center',
        height: "100%",
        width: "100%",
    },
    button: {
        margin: 10,
    },
});

const imageExt = ".png";
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
    "41",
    "42",
    "43",
    "44",
    "45",
    "46",
    "47",
    "48",
    "49",
    "50",
    // "51",
    // "52",
    // "53",
    // "54",
    // "55",
    // "56",
    // "57",
    // "58",
    // "59",
    // "60",
];

const TaskScreen = props =>  {
    const classes = useStyles();

    const participantName = props.location.state.participantName;

    const originX = 0;
    const originY = 0;
    const time = new Date().getMinutes();

    const [sampleName, setSampleName] = useState(sampleNames[0]);
    const [sampleIndex, SetSampleIndex] = useState(0);
    const [isTaskOngoing, setIsTaskOngoing] = useState(false);
    const [color, setColor] = useState("#0F0");
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
    const colorRef = useRef(color);
    const editLogsRef = useRef(editLogs);
    const sampleIndexRef = useRef(0);
    const sampleNameRef = useRef(sampleName);

    useEffect(() => {
        _post();
        initialize();
        canvasRef.current.addEventListener("touchstart", startDrawing, {passive:false});
        canvasRef.current.addEventListener("touchmove", draw, {passive:false});
        canvasRef.current.addEventListener("touchend", endDrawing, {passive:false});
    }, []);
    useEffect(() => {
        if (saving) {
            postResult();
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
        let x = (event.touches[0].pageX-event.target.getBoundingClientRect().left);
        let y = (event.touches[0].pageY-event.target.getBoundingClientRect().top);
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
                editted_by: participantName
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
                editted_by: participantName
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
        setDrawing(true);
        let x=(event.touches[0].pageX-event.target.getBoundingClientRect().left);
        let y=(event.touches[0].pageY-event.target.getBoundingClientRect().top);
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
            editted_by: participantName
        };
        const newEditLogs = [...editLogsRef.current, editLog];
        updateEditLogs(newEditLogs);
        event.stopPropagation();
        event.preventDefault();
    };
    const endDrawing = event => {
        const currentTime = new Date().getTime();
        const timeOrigin = performance.timeOrigin;
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
            // eraseInsideLine(coordinatesRef.current);
            if (colorRef.current !== '#FFF') {
                fillInsideLine(colorRef.current, coordinatesRef.current);
            }
            const newEditings = [...editingsRef.current, {editor: participantName, color:colorRef.current, coordinates: coordinatesRef.current}];
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
                editted_by: participantName
            };
            const newEditLogs = [...editLogsRef.current, editLog];
            updateEditLogs(newEditLogs);
        } else {
            const newEditings = [...editingsRef.current, {editor: participantName, color:colorRef.current, coordinates: coordinatesRef.current}];
            updateEditings(newEditings);
            coordinatesRef.current = [];
            setRedoStack([]);
            const editLog = {
                editted_at: currentTime,
                editted_at_: timeOrigin+event.timeStamp,
                sample_name: sampleNameRef.current,
                operation_type: 'stop_drawing',
                x: NaN,
                y: NaN,
                color: NaN,
                force: NaN,
                editted_by: participantName
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
        // ctx.fill();
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
                editted_by: participantName
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
                editted_by: participantName
            };
            const newEditLogs = [...editLogsRef.current, editLog];
            updateEditLogs(newEditLogs);
        }
    };
    const fromData = data => {
        for(let index in data){
            const editLog_ = data[index];
            // eraseInsideLine(editLog_.coordinates);
            if (editLog_.color !== '#FFF') {
                fillInsideLine(editLog_.color, editLog_.coordinates);
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
    const start = event => {
        const currentTime = new Date().getTime();
        const timeOrigin = performance.timeOrigin;
        const editLog = {
            editted_at: currentTime,
            editted_at_: timeOrigin+event.timeStamp,
            sample_name: sampleName,
            operation_type: 'start',
            x: NaN,
            y: NaN,
            color: NaN,
            force: NaN,
            editted_by: participantName
        }
        setIsTaskOngoing(true);
        const newEditLogs = [...editLogsRef.current, editLog];
        updateEditLogs(newEditLogs);
    }
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
            editted_by: participantName
        }
        setSaving(true);
        const newEditLogs = [...editLogsRef.current, editLog];
        updateEditLogs(newEditLogs);
    };
    const postResult = () => {
        const dataURL = canvasRef.current.toDataURL();
        const obj = {
            participant_name: participantName,
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
            .then(setIsTaskOngoing(false))
            .catch(error => console.log(error));
    };
    const handleErrors = response => {
        if (!response.ok) {
            throw Error(response.statusText);
        }
        return response;
    };
    const updateSampleName = () => {
        if (sampleNames.length-1 > sampleIndexRef.current) {
            sampleIndexRef.current += 1;
            SetSampleIndex(sampleIndexRef.current);
            sampleNameRef.current = sampleNames[sampleIndexRef.current]
            setSampleName(sampleNames[sampleIndexRef.current]);
        } else {
            toQuestionnaire();
        }
    };
    // const toRest = () => {
    //     props.history.push({
    //         pathname: "/experiment/rest",
    //         state: {participantName: participantName, type: "post"}
    //     });
    // };
    const toQuestionnaire = () => {
        props.history.push({
          pathname: "/experiment/questionnaire",
          state: {participantName: participantName, type: "post"}
        });
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
            editted_by: participantName
        };
        const newEditLogs = [editLog];
        updateEditLogs(newEditLogs);
    };
    const _post = () => {
        const currentTime = new Date().getTime();
        const log = {
          at: currentTime,
          participant_name: participantName,
          event_name: "task_started",
        };
        const obj = {
            participant_name: participantName,
            log: log,
        };
        post(obj);
      };

    const styles = {
        nameForm:{border:"solid 0px"},
        magnification:{marginLeft:"0px",width:"50px", border:"solid 0px"},

        canvasContainer: {overflow:"hidden", position: 'relative', width:"640px", height:"640px", marginRight:"30px", display:isTaskOngoing?"block":"none"},
        canvas:{position:'absolute', opacity:1, transformOrigin:`${originX}% ${originY}%`, display:isTaskOngoing?"block":"none"},
        img: {position:'absolute', width:"630px", height:"630px", transformOrigin:`${originX}% ${originY}%`, display:isTaskOngoing?"block":"none"},

        buttonContainer: {width:"100%", height:80, display: "flex", flexDirection: "row", justifyContent: "center"},
        button: {cursor: 'pointer', margin: '5px', width:"40px", height:"40px"},
        greenButton: {cursor: 'pointer', margin: '5px', color: 'green',width:"40px",height:"40px"},
        blueButton: {cursor: 'pointer', margin: '5px', color: 'blue',width:"40px",height:"40px"},
        blueGreenButton: {cursor: 'pointer', margin: '5px', color: '#0FF',width:"40px",height:"40px"},
        blackButton: {cursor: 'pointer', margin: '5px', color: 'black',width:"40px",height:"40px"},
        startPoint:{zIndex:"10", position:"absolute", border: 'solid', marginLeft:`${initialCoordinate.x-startPointSize/2}px`,  marginTop:`${initialCoordinate.y-startPointSize/2}px`, width:`${startPointSize}px`, height:`${startPointSize}px`, borderRadius: '50%', opacity:`${drawing ? 1 : 0}`},
    };
    
    return (
        <div className={classes.root}>
            <div style = {{display:isTaskOngoing?"none":"block"}}>
                {sampleIndex+1}/{sampleNames.length}
            </div>
            <div style = {{width:"100%", display: "flex", flexDirection: "row", justifyContent: "center"}}>
                <div style={styles.canvasContainer} ref={canvasContainerRef}>
                    <img src={process.env.REACT_APP_DEV_API_URL+"/static/image/"+sampleName+imageExt+"?"+time.toString()} style={styles.img} alt={sampleName}/>
                    <canvas
                        className="canvas"
                        ref={canvasRef}
                        width="630px"
                        height="630px"
                        style={styles.canvas}
                    >
                    </canvas>
                {/* <div style={styles.startPoint}></div> */}
            </div>
            </div>
            <div style={styles.buttonContainer}>
                <Button variant="contained" color="secondary" className={classes.button} style = {{display:isTaskOngoing?"block":"none"}} onClick={undo}><FaUndo style = {{margin:"auto"}}/></Button>
                <Button variant="contained" color="secondary" className={classes.button} style = {{display:isTaskOngoing?"block":"none"}} onClick={redo}><FaRedo style = {{margin:"auto"}} /></Button>
                <Button variant="contained" color="secondary" className={classes.button} style = {{display:isTaskOngoing?"block":"none"}} onClick={save}>次へ</Button>
                <Button variant="contained" color="secondary" className={classes.button} style = {{display:isTaskOngoing?"none":"block"}} onClick={start}>はじめる</Button>
            </div>
        </div>
    );
    
}

export default TaskScreen;

