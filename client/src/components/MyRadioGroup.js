import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import { MARKS } from './Utils';

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    height: "100%",
  },
  container: {
    width: "100%",
    display: "grid",
    "grid-template-rows": "1fr",
    "grid-template-columns": "2fr 5fr",
  },
  descriptionLeft: {
    gridRow: 1,
    gridColumn: 1,
    display: "flex",
    flexDirection: "column",
    textAlign: 'center',
    justifyContent: "space-around",
  },
  radioContainer: {
    display: "flex",
    flexDirection: "row",
    textAlign: 'center',
    justifyContent: "space-around",
  },
}));

const MyRadioGroup = (props) => {
  const classes = useStyles();
  const { questionnaire, questionnaireIndex, answers, handleChange, setIsSubmitButtonAnabled } = props;
  const _handleChange = e => {
  const newAnswers = answers.map((answer, index)=>{
      if (index === questionnaireIndex) {
        return parseInt(e.target.value);
      }
      else {
        return answer;
      }
    });
    if (newAnswers.filter($0 => $0).length === answers.length) {
      setIsSubmitButtonAnabled(true);
    }
  handleChange(newAnswers);
};

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <div className={classes.descriptionLeft}>
          <p>{questionnaire}</p>
        </div>
        <RadioGroup
          value={answers[questionnaireIndex]}
          onChange={_handleChange}
          >
          <div className={classes.radioContainer}>
            {MARKS.map((mark, key) => {
              return (
                <Radio
                  value={mark.value}
                  key={key}
                />
              );
            })}
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}

export default MyRadioGroup