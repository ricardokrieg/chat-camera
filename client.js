let peerConnection = null;
let wsConnection = null;

const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
let stream = null;
let partnerId = null;

function setStatus(status) {
  $('#status').text(status);
}

function start() {
  getUserMedia({ video: true, audio: true }, onUserMedia, function (err) {
    console.error('Failed to get local stream', err);
    if (err.message.toLowerCase() === 'permission denied') {
      // TODO handle better
      alert('Você precisa ativar sua webcam para usar o site');
    }
  });
}

function onUserMedia(mediaStream) {
  stream = mediaStream;
  setVideoElement('video', stream);

  console.log('Connecting to Peer Server');
  peerConnection = new Peer();

  peerConnection.on('open', peerOnOpen);
  peerConnection.on('connection', peerOnConnection);
  peerConnection.on('call', peerOnCall);
}

function setVideoElement(id, stream) {
  const video = document.getElementById(id);

  video.srcObject = stream;
  // video.play();
}

function peerOnOpen(id) {
  console.log('Peer Server ID: ' + id);

  connectWithServer();
}

function peerOnConnection(connection) {
  console.log('Peer Connection');
  console.log(connection);
}

function peerOnCall(call) {
  console.log('Call Received');

  if (call.peer === partnerId) {
    call.answer(stream);

    call.on('stream', callOnStream);
  } else {
    // TODO handle
  }
}

function callOnStream(remoteStream) {
  setStatus('Conectado');
  setVideoElement('partner-video', remoteStream);
}

function skip() {
  sendData({ type: 'skip' });
}

function connectWithServer() {
  console.log('Connecting to WebSocket Server');
  setStatus('Conectando');

  const connection = new WebSocket('ws://192.168.2.8:8080');

  connection.onerror = wsOnError;
  connection.onclose = wsOnClose;
  connection.onopen = function (event) {
    wsOnOpen(event, connection);
  };
  connection.onmessage = wsOnMessage;
}

function wsOnError(event) {
  console.error('WebSocket Error: ' + event);

  // TODO handle
  connectionAlert();
}

function wsOnClose(event) {
  console.log('Closed connection to WebSocket Server');

  // TODO handle
  if (wsConnection) {
    connectionAlert();
  }
}

function wsOnOpen(event, connection) {
  console.log('Connected to WebSocket Server');

  wsConnection = connection;

  sendData({ id: peerConnection.id });
}

function wsOnMessage(event) {
  console.log('WebSocket Message: ' + event.data);

  const data = JSON.parse(event.data);

  switch (data.type) {
    case 'partner':
      handlePartnerMessage(data);
      break;
    case 'reset':
      handleResetMessage(data);
      break;
    default:
      // TODO handle
      console.error('Invalid message: ' + event.data);
  }
}

function sendData(data) {
  if (!wsConnection) {
    // TODO handle
    return;
  }

  wsConnection.send(JSON.stringify(data));
}

function handlePartnerMessage(data) {
  if (!data.id) {
    // TODO handle
    console.error('Invalid partner message: ' + JSON.stringify(data));
  }

  partnerId = data.id;

  if (data.caller) {
    console.log('Calling ' + data.id);

    const call = peerConnection.call(data.id, stream);
    call.on('stream', callOnStream);
  }
}

function handleResetMessage() {
  setStatus('Conectando');
  setVideoElement('partner-video', null);
}

function connectionAlert() {
  alert('Problema de conexão. Tente novamente em alguns minutos.');
  window.location.reload(true);
}
