var Renderer = require('./Renderer.js');
var AudioRenderer = require('./AudioRenderer.js');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

function errorHandler(msg) {
    throw new Error(msg);
}

function Boo(stream, filteredCanvas, progressBar) {

    var self = this;
    var video;
    var videoWidth = 640, videoHeight = 480;
    var filteredRenderer;
    var audioRenderer;
    var recorder;
    var RECORD_TIME = 6; // in seconds
    var isRecording = false;
    var recordingStartTime;
    var audioTrack, videoTrack;
    var audioContext;

    EventEmitter.call(this);


    // Init audio pipeline
    audioContext = new AudioContext();
    audioRenderer = new AudioRenderer(audioContext);
    inputSource = audioContext.createMediaStreamSource(stream);
    streamDestination = audioContext.createMediaStreamDestination();
    audioTrack = streamDestination.stream.getAudioTracks()[0];

    inputSource.connect(audioRenderer.input);
    audioRenderer.output.connect(streamDestination);
    // audioRenderer.output.connect(audioContext.destination);
    audioRenderer.selectEffect(0);


    // Extract only the video track to a new stream for the
    // video to WebGL renderer pipeline so we don't hear both
    // the dry and wet audio tracks (i.e. unprocessed + processed)
    videoTrack = stream.getVideoTracks()[0];
    var videoStream = new MediaStream();
    videoStream.addTrack(videoTrack);


    var mutedVideo = document.createElement('video');
    // TODO: move to a corner, or maybe even just hide it
    // mutedVideo.style = 'display: none';
    mutedVideo.style = 'opacity: 0.5; width: 320px; height; auto;';
    mutedVideo.src = URL.createObjectURL(videoStream);
    // If MediaStreamTrack.getCapabilities() was implemented,
    // we would not need to wait for this event.
    mutedVideo.addEventListener('loadedmetadata', onVideoMetadata);
    mutedVideo.play();

    filteredRenderer = new Renderer(filteredCanvas, errorHandler, onRendererReady);

    var canvasStream = filteredCanvas.captureStream(15);
    var canvasVideoTrack = canvasStream.getVideoTracks()[0];

    var finalStream = new MediaStream();
    finalStream.addTrack(canvasVideoTrack);
    finalStream.addTrack(audioTrack);

    video = document.createElement('video');
    video.src = URL.createObjectURL(finalStream);
    video.play();

    recorder = new MediaRecorder(finalStream);


    function onVideoMetadata(e) {
        var v = e.currentTarget;
        videoWidth = v.videoWidth;
        videoHeight = v.videoHeight;
        console.log('video size', videoWidth, videoHeight);
    }


    function onRendererReady() {
      
        filteredRenderer.setSize(videoWidth, videoHeight);
        filteredRenderer.nextEffect();
        animate();

        self.emit('ready');
    }


    function animate(elapsedTime) {

        requestAnimationFrame(animate);

        // Update progress bar while recording
        if (isRecording) { 
            if (!recordingStartTime) {
                recordingStartTime = elapsedTime;
            } else {
                progressBar.value = (elapsedTime - recordingStartTime) / 1000;
            }
        }

        filteredRenderer.updateTexture(mutedVideo);
    }


    function onRecordingTimeOver() {
        isRecording = false;
        recorder.stop();
        progressBar.value = progressBar.max;
    }


    this.record = function () {
        recorder.start();
        recordingStartTime = null;

        progressBar.max = RECORD_TIME;
        progressBar.value = 0;

        isRecording = true;

        recorder.ondataavailable = function (evt) {
            self.emit('finished', evt.data);
        };

        setTimeout(onRecordingTimeOver, RECORD_TIME * 1000);
    };


    this.getVideoEffects = function ()  {
        return filteredRenderer.getEffects();
    };


    this.selectVideoEffect = function (index) {
        filteredRenderer.selectEffect(index);
    };


    this.getAudioEffects = function() {
      return audioRenderer.getEffects();
    };


    this.selectAudioEffect = function(index) {
      audioRenderer.selectEffect(index);
    };

}

util.inherits(Boo, EventEmitter);

module.exports = Boo;
