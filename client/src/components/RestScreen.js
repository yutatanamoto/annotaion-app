import React, { useEffect } from 'react';
import { withRouter } from 'react-router';
import { makeStyles } from '@material-ui/core/styles';
import post from './Utils';

const duration = 60000;
const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
  },
  crossContainer: {
      margin: "auto",
      position: "relative",
      height: 100,
      width: 100,
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

const RestScreen = props => {
  const classes = useStyles();

  const participantName = props.location.state.participantName;
  const type = props.location.state.type;

  const toQuestionnaire = () => {
    props.history.push({
      pathname: "/experiment/questionnaire",
      state: {participantName: participantName, type: "pre"}
    });
  }
  const toFin = () => {
    props.history.push({
      pathname: "/experiment/fin",
      state: {participantName: participantName}
    });
  };
  const _post = () => {
    const currentTime = new Date().getTime();
    const log = {
      at: currentTime,
      participant_name: participantName,
      event_name: `${type}_rest_started`,
    };
    const obj = {
      participant_name: participantName,
        log: log,
    };
    post(obj);
  };

  useEffect(() => {
    _post();
    if (type === "pre") {
      setTimeout(toQuestionnaire, duration);
    } else {
      setTimeout(toFin, duration);
    }
  }, []);

  return(
    <div className={classes.root}>
      <div className={classes.crossContainer}>
        <div className={classes.horizontalRect}></div>
        <div className={classes.verticalRect}></div>
      </div>
    </div>
  );
}

export default withRouter(RestScreen);
