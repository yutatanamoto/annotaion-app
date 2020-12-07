import React, { useState, useEffect, useRef } from 'react';
import { withRouter } from 'react-router';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  root: {
      height: "100%",
      width: "100%",
  },
  crossContainer: {
      margin: "auto",
      marginTop: 200,
      position: "relative",
      height: 300,
      width: 300,
  },
  horizontalRect: {
      position: "absolute",
      marginTop: "45%",
      height: "10%",
      width: "100%",
      backgroundColor: "gray",
  },
  verticalRect: {
      position: "absolute",
      marginLeft: "45%",
      height: "100%",
      width: "10%",
      backgroundColor: "gray",
  },
});

const PeparationScreen = props => {
  const classes = useStyles();

  const remainingTimeRef = useRef(10000);
  const timerRef = useRef(null);

  const [remainingTime, setRemainingTime] = useState(10000);

  const updateTime = () => {
      if (remainingTimeRef.current > 100) {
          remainingTimeRef.current -= 100;
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
    });
  }

  useEffect(() => {
    timerRef.current = setInterval(updateTime, 100);
  }, []);

  return(
    <div className={classes.root}>
      <div className={classes.crossContainer}>
  レストまで{remainingTime/1000}秒
      </div>
    </div>
  );
}

export default withRouter(PeparationScreen);
