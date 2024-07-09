import * as base64 from "base-64";
import CryptoJs from "crypto-js";

let isLoading = false;
let requestObj = {
  APPID: "d67aabc2",
  APISecret: "MDU0OGM0N2YwZDQxMmRiMDlkYzg5Yjhh",
  APIKey: "50c5ab8bb0cc9044df531471f3f7e640",
  Uid: "星火网页测试",
  sparkResult: "", // 存储对话记录的变量
};

let msgEle = document.querySelector("#msg");
let btnEle = document.querySelector("#btn");
let contentEle = document.querySelector("#content");

// 点击发送信息按钮
btnEle.addEventListener("click", (e) => {
  sendMsg();
});

// 输入完信息点击Enter发送信息
msgEle.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    sendMsg();
  }
});

// 发送消息
const sendMsg = async () => {
  if (isLoading) {
    alert("等待回复中！！！");
    return;
  }

  // 获取请求地址
  let myUrl = await getWebsocketUrl();
  // 获取输入框中的内容
  let inputVal = msgEle.value;
  if (!inputVal) {
    alert("请输入内容");
    return;
  }

  // 每次发送问题都是一个新的WebSocket请求
  let socket = new WebSocket(myUrl);

  // 监听WebSocket的各阶段事件并做相应处理
  socket.addEventListener("open", (event) => {
    isLoading = true;
    console.log("开启连接！！", event);
    // 发送消息
    let params = {
      header: {
        app_id: requestObj.APPID,
        uid: requestObj.Uid,
      },
      parameter: {
        chat: {
          domain: "generalv3.5",
          temperature: 0.5,
          max_tokens: 1024,
        },
      },
      payload: {
        message: {
          text: [
            { role: "user", content: inputVal }, // 将用户的问题作为新的消息记录
          ],
        },
      },
    };
    console.log("发送消息");
    socket.send(JSON.stringify(params));
  });

  // 定义存储 AI 回复的变量
  let aiResponses = "";

  socket.addEventListener("message", (event) => {
    isLoading = false;
    let data = JSON.parse(event.data);
    console.log("收到消息！！", data);

    if (data.header.code !== 0) {
      console.log("出错了", data.header.code, ":", data.header.message);
      // 出错了手动关闭连接
      socket.close();
      return;
    }

    // 每次收到 AI 的回复都追加到 aiResponses 中
    let response = data.payload.choices.text.map(choice => choice.content).join(" ");
    aiResponses += response + " ";

    if (data.header.code === 0 && data.header.status === 2) {
      // 对话已经完成，手动关闭连接
      socket.close();
      // 将完整的对话内容显示在对话框中
      requestObj.sparkResult += `<div class="message user-message">${inputVal}</div>`; // 用户的问题
      requestObj.sparkResult += `<div class="message assistant-message">AI: ${aiResponses}</div>`; // AI的回答
      addMsgToTextarea(requestObj.sparkResult);
      // 清空对话记录变量
      requestObj.sparkResult = "";
    }
  });

  socket.addEventListener("close", (event) => {
    isLoading = false;
    console.log("连接关闭！！", event);
  });

  socket.addEventListener("error", (event) => {
    isLoading = false;
    console.log("连接发生错误！！", event);
  });
};

// 获取鉴权URL地址
const getWebsocketUrl = () => {
  return new Promise((resolve, reject) => {
    let url = "wss://spark-api.xf-yun.com/v3.5/chat";
    let host = "spark-api.xf-yun.com";
    let apiKeyName = "api_key";
    let date = new Date().toGMTString();
    let algorithm = "hmac-sha256";
    let headers = "host date request-line";

    let signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v3.5/chat HTTP/1.1`;
    let signatureSha = CryptoJs.HmacSHA256(signatureOrigin, requestObj.APISecret);
    let signature = CryptoJs.enc.Base64.stringify(signatureSha);

    let authorizationOrigin = `${apiKeyName}="${requestObj.APIKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
    let authorization = base64.encode(authorizationOrigin);

    url = `${url}?authorization=${authorization}&date=${encodeURIComponent(date)}&host=${host}`;

    resolve(url);
  });
};

// 将消息添加到对话框中
const addMsgToTextarea = (text) => {
  contentEle.innerHTML += text;
  // 清空输入框
  msgEle.value = "";
};
