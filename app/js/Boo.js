var Renderer = require('./Renderer.js');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

function errorHandler(msg) {
    throw new Error(msg);
}

function Boo(stream, originalCanvas, filteredCanvas, progressBar) {

    var self = this;
    var video;
    var originalRenderer, filteredRenderer;
    var canvasStream;
    var recorder;
    var RECORD_TIME = 6; // in seconds
    var isRecording = false;
    var recordingStartTime;

    EventEmitter.call(this);

    originalRenderer = new Renderer(originalCanvas, errorHandler, null);
    filteredRenderer = new Renderer(filteredCanvas, errorHandler, onStreamReady);

    function onStreamReady() {
        // create a muted, invisible video element to stream 
        // the camera/mic output to
        video = document.createElement('video');
        video.style = 'display:none';
        video.muted = true;
        video.src = window.URL.createObjectURL(stream);
        document.body.appendChild(video);
        video.play();

        video.addEventListener('loadedmetadata', function () {
            var w = video.videoWidth;
            var h = video.videoHeight;
            filteredRenderer.setSize(w, h);
            originalRenderer.setSize(w, h);
        });

        filteredRenderer.nextEffect();

        video.addEventListener('loadeddata', function () {
            self.emit('ready');
            requestAnimationFrame(animate);
            canvasStream = filteredCanvas.captureStream(12);
            canvasStream.addTrack(stream.getAudioTracks()[0]);
            recorder = new MediaRecorder(canvasStream);
        });
    }


    function animate(elapsedTime) {

        requestAnimationFrame(animate);

        if (isRecording) { // update progress bar when recording
            if (!recordingStartTime) {
                recordingStartTime = elapsedTime;
            } else {
                progressBar.value = (elapsedTime - recordingStartTime) / 1000;
            }
        }

        originalRenderer.updateTexture(video);
        filteredRenderer.updateTexture(video);
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


    this.applyVideoEffect = function (index) {
        filteredRenderer.selectEffect(index);
    };

}

util.inherits(Boo, EventEmitter);

module.exports = Boo;
