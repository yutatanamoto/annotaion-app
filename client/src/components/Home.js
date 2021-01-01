import React from 'react';
import { withRouter } from 'react-router';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles({
  root: {
     display: "flex",
     flexDirection: "row",
     flexWrap: "wrap",
     justifyContent: "space-around",
     height: "100%",
     width: "100%",
     padding: 20,
  },
  button:{
    height: 60
  },
});

const RestScreen = props => {
  const classes = useStyles();

  const toExperiment = () => {
    props.history.push({
      pathname: "/experiment/setting",
    });
  }
  const toSampleList = () => {
    props.history.push({
      pathname: "/samples",
    });
  }

  return(
    <div className={classes.root}>
        <Button variant="contained" color="secondary" className={classes.button} onClick={toExperiment}>Experiment</Button>
        <Button variant="contained" color="secondary" className={classes.button} onClick={toSampleList}>Annotation</Button>
    </div>
  );
}

export default withRouter(RestScreen);
