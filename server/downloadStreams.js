function download() {
  for (let chunk of window.recordedChunks) {
    var blob = new Blob([chunk], {
      type: 'video/webm'
    });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';
    a.href = url;
    a.download = Date.now().toString() + '.webm';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}

function start() {
  if (window.recordedChunks === undefined) {
    window.recordedChunks = [];
  }

  let video = document.getElementById('remote_video');
  let stream = video.captureStream();

  if (stream.active) {
    console.log('Stream is active');

    window.mediaRecorder = new MediaRecorder(stream, {mimeType: 'video/webm; codecs=vp9'});
    window.mediaRecorder.start();

    window.mediaRecorder.ondataavailable = function (event) {
      console.log('ondataavailable: ' + event.data.size);

      if (event.data.size > 0) {
        window.recordedChunks.push(event.data);
        console.log('Total chunks: ' + window.recordedChunks.length);
      }
    };

    stream.oninactive = function (event) {
      console.log(event);

      if (window.mediaRecorder) {
        console.log('Stopping MediaRecorder');
        window.mediaRecorder.stop();
      }
    };
  }
}
