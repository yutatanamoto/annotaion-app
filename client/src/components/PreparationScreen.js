import React, { useState, useEffect, useRef } from 'react';
import { withRouter } from 'react-router';
import { makeStyles } from '@material-ui/core/styles';
import post from './Utils';

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
  },
});

const step = 1000;
const duration = 10000;

const PeparationScreen = props => {
  const classes = useStyles();

  const participantName = props.location.state.participantName;

  const remainingTimeRef = useRef(duration);
  const timerRef = useRef(null);

  const [remainingTime, setRemainingTime] = useState(duration);

  const updateTime = () => {
      if (remainingTimeRef.current > step) {
          remainingTimeRef.current -= step;
          let newRemainingTime = remainingTimeRef.current;
          setRemainingTime(newRemainingTime);
      } else {
        toRest();
        clearInterval(timerRef.current);
      }
  };
  const toRest = () => {
    props.history.push({
      pathname: "/experiment/rest",
      state: {participantName: participantName, type: "pre"}
    });
  };
  const _post = () => {
    const currentTime = new Date().getTime();
    const log = {
      at: currentTime,
      participant_name: participantName,
      event_name: "preparation_started",
    };
    const obj = {
      participant_name: participantName,
        log: log,
    };
    post(obj);
  };

  useEffect(() => {
    _post();
    timerRef.current = setInterval(updateTime, step);
  }, []);

  return(
    <div className={classes.root}>
      <b>
        レストまであと{remainingTime/1000}秒です。
      </b>
      <br/>
      <b>
        レスト中は中央に表示される十字を注視していてください。
      </b>
    </div>
  );
}

export default withRouter(PeparationScreen);
