export default function post(obj) {
    const body = JSON.stringify(obj);
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };
    const method = "POST";
    const fetch = require('node-fetch');
    fetch(`${process.env.REACT_APP_DEV_API_URL}/api/logging`, {method, headers, body})
        .then(handleErrors)
        .catch(error => console.log(error));
};

const handleErrors = response => {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
};

export const QUESTIONNAIRES = [
    {
      id: 0,
      descriptionRight: "好き",
      descriptionLeft: "嫌い",
    },
    {
      id: 1,
      descriptionRight: "快",
      descriptionLeft: "不快",
    },
    {
      id: 2,
      descriptionRight: '面白い',
      descriptionLeft: '退屈な',
    },
    {
      id:3,
      descriptionRight: '豊である',
      descriptionLeft: '豊でない',
    },
    {
      id: 4,
      descriptionRight: "ポジティブである",
      descriptionLeft: "ポジティブでない",
    },
    {
      id: 5,
      descriptionRight: "明るい",
      descriptionLeft: "暗い",
    },
    {
      id: 6,
      descriptionRight: "弱々しい",
      descriptionLeft: "力強い",
    },
    {
      id: 7,
      descriptionRight: "平凡な",
      descriptionLeft: "独創的な",
    },
    {
      id: 8,
      descriptionRight: "感情的な",
      descriptionLeft: "理性的な",
    },
  ];
  
  export const MARKS = [
    {
      value: 1,
      label: "1",
    },
    {
      value: 2,
      label: "2",
    },
    {
      value: 3,
      label: "3",
    },
    {
      value: 4,
      label: "4",
    },
    {
      value: 5,
      label: "5",
    },
  ];