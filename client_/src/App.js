import React from 'react';
import './App.css';
import MyRouter from './components/MyRouter';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  root: {
    height: "100%",
    width: "100%",
  },
});

function App() {
  const classes = useStyles();
  return (
    <div classesname={classes.root}>
      <MyRouter />
    </div>
  );
}

export default App;
