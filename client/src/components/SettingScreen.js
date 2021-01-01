import React, {useState, useRef, useEffect} from 'react';
import { withRouter } from 'react-router';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import post from './Utils';

const step = 50;
const duration = 10000;
const useStyles = makeStyles({
  root: {
     display: "flex",
     flexDirection: "column",
     flexWrap: "wrap",
     justifyContent: "space-around",
     alignItems: "space-around",
     height: "100%",
     width: "100%",
     padding: 20,
  },
  butons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  time: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center'
  }
});

const SettingScreen = props => {
  const classes = useStyles();

  const [remainingTime, setRemainingTime] = useState(duration);
  const [participantName, setParticipantName] = useState("");

  const remainingTimeRef = useRef(duration);
  const timerRef = useRef(null);

  const _setParticipantName = e => {
    setParticipantName(e.target.value);
  };
  const toInstruction = () => {
    props.history.push({
      pathname: "/experiment/instruction",
      state: {participantName: participantName}
    });
  };
  const startTimer = () => {
    timerRef.current = setInterval(updateTime, step);
  };
  const updateTime = () => {
      remainingTimeRef.current -= step;
      let newRemainingTime = remainingTimeRef.current;
      setRemainingTime(newRemainingTime);
};
  const _post = () => {
    const currentTime = new Date().getTime();
    const log = {
      at: currentTime,
      participant_name: participantName,
      event_name: "measurement_started",
    };
    const obj = {
      participant_name: participantName,
        log: log,
    };
    post(obj);
  };

  useEffect(() => {
    if (remainingTime === 0) {
      _post();
      clearInterval(timerRef.current);
    }
  }, [remainingTime]);

  return(
    <div className={classes.root}>
      <div className={classes.butons}>
        <TextField label="実験協力者名" variant="outlined" color="secondary" onChange={_setParticipantName} value={participantName}/>
        <Button variant="contained" color="secondary" onClick={startTimer}>タイマー起動</Button>
        <Button variant="contained" color="secondary" onClick={toInstruction} disabled={remainingTime!==0 || participantName.length===0}>準備完了</Button>
      </div>
      <div className={classes.time}>
        {(remainingTime/1000).toFixed(2)}
      </div>
    </div>
  );
}

export default withRouter(SettingScreen);
