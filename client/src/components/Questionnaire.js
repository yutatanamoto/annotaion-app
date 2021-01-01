import React, { useState, useEffect } from 'react';
import MyRadioGroup from './MyRadioGroup';
import { Button, makeStyles } from '@material-ui/core';
import post from './Utils';

const useStyles = makeStyles({
  root: {
    height: "100%",
    width: "100%",
    display: "grid",
  },
  questionnaireContainer: {
    display: "grid",
    "grid-template-rows": "1fr",
    "grid-template-columns": "fr",
    width: "90%",
    margin: "auto",
  },
  labels: {
    width: "100%",
    display: "grid",
    "grid-template-rows": "1fr",
    "grid-template-columns": "2fr 1fr 1fr 1fr 1fr 1fr",
    marginBottom: 10
  },
  label: {
      margin: "auto",
      fontSize: 14,
  },
  questionnaires: {
    width: "100%",
  },
  sliderContainer: {
    width: "100%",
  },
  button: {
    margin: "auto",
    height: "2.5rem",
    width: 100,
  },
});
const questionnaires = [
  "頭が重い",
  "いらいらする",
  "目がかわく",
  "気分が悪い",
  "落ち着かない気分だ",
  "頭が痛い",
  "目が痛い",
  "肩がこる",
  "頭がぼんやりする",
  "あくびが出る",
  "手や指が痛い",
  "めまいがする",
  "ねむい",
  "やる気が乏しい",
  "不安な感じがする",
  "物がぼやける",
  "全身がだるい",
  "ゆううつな気分だ",
  "腕がだるい",
  "考えがまとまりにくい",
  "横になりたい",
  "目が疲れる",
  "腰が痛い",
  "目がしょぼつく",
  "足がだるい"
];

const Questionnaire = props =>  {
  const classes = useStyles();

  const participantName = props.location.state.participantName;
  const type = props.location.state.type;

  const initialAnswers = questionnaires.map((questionnaire, key)=>{
    return null
  });
  const [answers, setAnswers] = useState(initialAnswers);
  const [isSubmitButtonAnabled, setIsSubmitButtonAnabled] = useState(false);

  const postAnswers = () => {
    const currentTime = new Date().getTime();
    const obj = {
        answered_at: currentTime,
        participant_name: participantName,
        answers: answers
    }
    const body = JSON.stringify(obj);
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };
    const method = "POST";
    const fetch = require('node-fetch');
    fetch(`${process.env.REACT_APP_DEV_API_URL}/api/questionnaire?type=${type}`, {method, headers, body})
        .catch(error => console.log(error));
  };
  const handleChange = newAnswers => {
      setAnswers(newAnswers);
  };
  // const toPreparation = () => {
  //   props.history.push({
  //     pathname: "/experiment/preparation",
  //     state: {participantName: participantName}
  //   });
  // };
  const toTask = () => { 
    props.history.push({
      pathname: "/experiment/task",
      state: {participantName: participantName}
    });
  };
  const toRest = () => {
    props.history.push({
      pathname: "/experiment/rest",
      state: {participantName: participantName, type: "post"}
    });
  };
  const handleClick = () => {
    postAnswers();
    if (type==="pre") {
      toTask();
    } else {
      toRest();
    }
  };
  const _post = () => {
    const currentTime = new Date().getTime();
    const log = {
      at: currentTime,
      participant_name: participantName,
      event_name: `${type}_questionnaire_started`,
    };
    const obj = {
      participant_name: participantName,
      log: log,
    };
    post(obj);
  };

  useEffect(() => {
    _post();
  }, []);

  return (
    <div className={classes.root}>
      <div className={classes.questionnaireContainer}>
          <div className={classes.labels}>
            <div></div><div className={classes.label}>全く当てはまらない</div><div className={classes.label}>わずかに当てはまる</div><div className={classes.label}>少し当てはまる</div><div className={classes.label}>かなり当てはまる</div><div className={classes.label}>非常によく当てはまる</div>
          </div>
          <div className={classes.questionnaires}>
            {questionnaires.map((questionnaire, questionnaireIndex)=>
                <div className={classes.sliderContainer} key={questionnaireIndex}>
                <MyRadioGroup
                    questionnaire={questionnaire}
                    questionnaireIndex={questionnaireIndex}
                    answers={answers}
                    handleChange={handleChange}
                    setIsSubmitButtonAnabled={setIsSubmitButtonAnabled}
                />
                </div>
            )}
            <Button
                variant="contained" 
                color="secondary"
                className={classes.button}
                onClick={handleClick}
                disabled={!isSubmitButtonAnabled}
            >
                次に進む
            </Button>
          </div>
      </div>
    </div>
  );
}

export default Questionnaire;