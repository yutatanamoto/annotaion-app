import React from 'react';
import Editor from './Editor';
import SampleList from './SampleList';
import { BrowserRouter as Router, Route } from "react-router-dom";

export default function MyRouter() {
  return (
    <Router>
      <Route path="/" exact component={SampleList} />
      <Route path="/edit" exact component={Editor} />
    </Router>
  );
}
