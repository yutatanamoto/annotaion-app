import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const imageExt = ".jpg";

const useStyles = makeStyles({
  root: {
     display: "flex",
     flexDirection: "row",
     flexWrap: "wrap",
     justifyContent: "space-around",
  },
  card: {
     maxWidth: 200,
  },
});

const SampleList = props => {
  const classes = useStyles();

  const [sampleNames, setSampleNames] = useState([]);
  const [annotatedSampleNames, setAnnotatedSampleNames] = useState([]);

  const getSampleNames = () => {
    const fetch = require('node-fetch')
    fetch(`${process.env.REACT_APP_DEV_API_URL}/api/samples`)
      .then(res =>res.json())
      .then(json=>{
        setSampleNames(json["sampleNames"]);
        setAnnotatedSampleNames(json["annotatedSampleNames"]);
      })
  };
  const buttonClick = (sampleName) => {
    props.history.push({
      pathname: "/edit",
      state: {sampleName: sampleName, annotatedSampleNames: annotatedSampleNames}
    });
  }

  useEffect(() => {
    getSampleNames();
  }, []);

  return(
    <div className={classes.root}>
      {sampleNames.map((sampleName, index) => {
        return (
          <Card className={classes.card} key={index}>
            <CardMedia
              component="img"
              alt="sample image"
              height="200"
              image={`${process.env.REACT_APP_DEV_API_URL}/static/thumbnail/${sampleName}${imageExt}`}
              title="Contemplative Reptile"
            />
            <CardContent>
              <Typography gutterBottom variant="p" component="p">
                {sampleName}
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                color="primary"
                onClick={() => {buttonClick(sampleName)}}>
                Edit
              </Button>
            </CardActions>
          </Card>
        );
      })}
    </div>
  );
}

export default withRouter(SampleList);
