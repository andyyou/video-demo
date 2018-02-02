// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const {
  desktopCapturer
} = require('electron')
var $ = require('jquery')

var screenVideo = {
  recorder: null,
  chunks: null,
  el: document.querySelector('#screen-video'),
  stream: null,
  url: null
}

var cameraVideo = {
  recorder: null,
  chunks: null,
  el: document.querySelector('#camera-video'),
  stream: null,
  url: null
}

$('#start').on('click', function (e) {
  screenVideo.recorder.start()
  cameraVideo.recorder.start()
})

$('#stop').on('click', function (e) {
  screenVideo.recorder.stop()
  cameraVideo.recorder.stop()
})

$('#reset').on('click', function (e) {
  updateScreenVideo()
  updateCameraVideo()
})


$(function () {
  updateScreenVideo()
  updateCameraVideo()
})


function updateScreenVideo () {

  desktopCapturer.getSources({
    types: ['window', 'screen']
  }, function (error, sources) {
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: sources[0].id,
          minWidth: 1280,
          maxWidth: 1280,
          minHeight: 720,
          maxHeight: 720
        }
      }
    })
    .then(function (stream) {
      screenVideo.stream = stream
      screenVideo.url = URL.createObjectURL(stream)
      screenVideo.el.src = screenVideo.url
      screenVideo.recorder = new MediaRecorder(stream)
      screenVideo.chunks = []
      screenVideo.recorder.ondataavailable = function (e) {
        screenVideo.chunks.push(e.data)
      }
      screenVideo.recorder.addEventListener('stop', function (e) {
        screenVideo.el.controls = true
        var blob = new Blob(screenVideo.chunks, {
          type: 'video/webm;codecs=vp9'
        })
        screenVideo.el.src = URL.createObjectURL(blob)
      })
    })
  })
}

function updateCameraVideo () {
  navigator.mediaDevices.enumerateDevices()
  .then(function (devices) {
    var audio = devices.find(function (device) {
      return device.kind === 'audioinput'
    })
    var camera = devices.find(function (device) {
      return device.kind === 'videoinput'
    })
    navigator.mediaDevices.getUserMedia({
      audio: {
        optional: [{
          sourceId: audio.deviceId
        }]
      },
      video: {
        optional: [{
          sourceId: camera.deviceId
        }]
      }
    })
    .then(function (stream) {
      cameraVideo.stream = stream
      cameraVideo.url = URL.createObjectURL(stream)
      cameraVideo.el.src = cameraVideo.url
      cameraVideo.chunks = []
      cameraVideo.recorder = new MediaRecorder(stream)
      cameraVideo.recorder.ondataavailable = function (e) {
        cameraVideo.chunks.push(e.data)
      }
      cameraVideo.recorder.addEventListener('stop', function (e) {
        cameraVideo.el.controls = true
        cameraVideo.el.muted = false
        var blob = new Blob(cameraVideo.chunks, {
          type: 'video/webm;codecs=vp9'
        })
        cameraVideo.el.src = URL.createObjectURL(blob)
      })
    })
  })
}
