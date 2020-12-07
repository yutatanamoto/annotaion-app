import React, { useEffect } from 'react';
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

const RestScreen = props => {
  const classes = useStyles();

  const toTask = () => { 
    props.history.push({
      pathname: "/experiment/task",
      state: {sampleName: "sample_image", annotatedSampleNames: []}
    });
  }

  useEffect(() => {
    setTimeout(toTask, 6000);
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
