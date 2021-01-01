import React, {useEffect} from 'react';
import { withRouter } from 'react-router';
import { makeStyles } from '@material-ui/core/styles';
import post from './Utils';

const useStyles = makeStyles({
  root: {
     display: "flex",
     flexDirection: "row",
     flexWrap: "wrap",
     justifyContent: "center",
     alignItems: "center",
     height: "100%",
     width: "100%",
  },
});

const FinScreen = props => {
  const classes = useStyles();

  const _post = () => {
    const currentTime = new Date().getTime();
    const log = {
      at: currentTime,
      participant_name: participantName,
      event_name: `experiment_completed`,
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

  const participantName = props.location.state.participantName;

  return(
    <div className={classes.root}>
        <div>
          <b>{participantName}さん、ご協力ありがとうございました！！！</b>
        </div>
    </div>
  );
}

export default withRouter(FinScreen);
