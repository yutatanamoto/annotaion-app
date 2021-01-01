import React, {useEffect} from 'react';
import { withRouter } from 'react-router';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import post from './Utils';

const useStyles = makeStyles({
  root: {
     display: "flex",
     flexDirection: "column",
     alignItems: "center",
     justifyContent: "center",
     height: "100%",
     width: "100%",
  },
});

const InstructionScreen = props => {
  const classes = useStyles();

  const participantName = props.location.state.participantName;

  const toPreparation = () => {
    props.history.push({
      pathname: "/experiment/preparation",
      state: {participantName: participantName}
    });
  };

  const _post = () => {
    const currentTime = new Date().getTime();
    const log = {
      at: currentTime,
      participant_name: participantName,
      event_name: "instruction_started",
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

  return(
    <div className={classes.root}>
        <b>{participantName}さん、本日はお忙しい中実験に参加していただきありがとうございます🙇‍♂️</b>
        <br/>
        <b>実験について</b>
        <p>
        　この実験ではディスプレイ上に表示される線のトレースを繰り返し(50回)行っていただきます。<br/>
          実験の大まかな流れは以下の通りです。<br/>
            　　1. レスト(1分)<br/>
            　　2. アンケート<br/>
            　　3. タスク(15~30分)<br/>
            　　4. アンケート<br/>
            　　5. レスト(1分)<br/>
        </p>
        <br/>
        <b>注意事項</b>
        <p>
        <p>＊ 実験中は頭を動かさないようにしてください。</p>
        </p>
        <br/>
        <b>実験データの取り扱いについて</b>
        <p>
          実験データ作業成績等は匿名化された上で解析されます。<br/>
          個人を特定しうる情報が紐づいた状態で実験データが公表されたりすることはないので、<br/>
          安心して取り組んでください。<br/>
        </p>
        <br/>
        <b>実験開始</b>
        <p>
          上記内容を確認できましたら、↓の開始ボタンを押してください。<br/>
          開始ボタンを押下してするとアンケート画面に遷移します。<br/>
        </p>
        <Button variant="contained" color="secondary" onClick={toPreparation}>実験をはじめる</Button>
    </div>
  );
}

export default withRouter(InstructionScreen);
