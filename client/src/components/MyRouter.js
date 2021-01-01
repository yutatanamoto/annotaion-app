import React from 'react';
import Home from './Home';
import Editor from './Editor';
import FinScreen from './FinScreen';
import SampleList from './SampleList';
import RestScreen from './RestScreen';
import TaskScreen from './TaskScreen';
import SettingScreen from './SettingScreen';
import Questionnaire from './Questionnaire';
import PreparationScreen from './PreparationScreen';
import InstructionScreen from './InstructionScreen';
import { BrowserRouter as Router, Route } from "react-router-dom";

export default function MyRouter() {
  return (
    <Router>
      <Route path="/" exact component={Home} />
      <Route path="/samples" exact component={SampleList} />
      <Route path="/edit" exact component={Editor} />
      <Route path="/experiment/setting" exact component={SettingScreen} />
      <Route path="/experiment/questionnaire" exact component={Questionnaire} />
      <Route path="/experiment/instruction" exact component={InstructionScreen} />
      <Route path="/experiment/preparation" exact component={PreparationScreen} />
      <Route path="/experiment/rest" exact component={RestScreen} />
      <Route path="/experiment/task" exact component={TaskScreen} />
      <Route path="/experiment/fin" exact component={FinScreen} />
    </Router>
  );
}
