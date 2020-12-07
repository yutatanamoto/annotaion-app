import React from 'react';
import Home from './Home';
import Editor from './Editor';
import SampleList from './SampleList';
import RestScreen from './RestScreen';
import TaskScreen from './TaskScreen';
import PreparationScreen from './PreparationScreen';
import { BrowserRouter as Router, Route } from "react-router-dom";

export default function MyRouter() {
  return (
    <Router>
      <Route path="/" exact component={Home} />
      <Route path="/samples" exact component={SampleList} />
      <Route path="/edit" exact component={Editor} />
      <Route path="/experiment/preparation" exact component={PreparationScreen} />
      <Route path="/experiment/rest" exact component={RestScreen} />
      <Route path="/experiment/task" exact component={TaskScreen} />
    </Router>
  );
}
