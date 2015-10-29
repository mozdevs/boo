var Renderer = require('./Renderer.js');
var EventEmitter = require('events');

function errorHandler(msg) {
    throw new Error(msg);
}

function Boo(stream, original, filtered) {
    // inherit from EventEmitter
    EventEmitter.call(this);

    this.originalRenderer = new Renderer(original, errorHandler, null);

    this.filteredRenderer = new Renderer(filtered, errorHandler, function () {
        // create a muted, invisible video element tostream the camera/mic
        // output to
        this.video = document.createElement('video');
        this.video.style = 'display:none';
        this.video.muted = true;
        this.video.src = window.URL.createObjectURL(stream);
        document.body.appendChild(this.video);
        this.video.play();

        this.filteredRenderer.nextEffect();

        this.video.addEventListener('loadeddata', function () {
            this.emit('ready');
            window.requestAnimationFrame(this._tick.bind(this));
            this.canvasStream = filtered.captureStream(12);
            this.canvasStream.addTrack(this.stream.getAudioTracks()[0]);
            this.recorder = new MediaRecorder(this.canvasStream);
        }.bind(this), false);
    }.bind(this));

    this.stream = stream;
}

// inherit from EventEmitter
Boo.prototype = Object.create(EventEmitter.prototype);
Boo.prototype.constructor = Boo;

Boo.RECORD_TIME = 6; // in seconds

Boo.prototype._tick = function () {
    window.requestAnimationFrame(this._tick.bind(this));
    this.originalRenderer.updateTexture(this.video);
    this.filteredRenderer.updateTexture(this.video);
};

Boo.prototype.record = function () {
    this.recorder.start();

    this.recorder.ondataavailable = function (evt) {
        this.emit('finished', evt.data);
    }.bind(this);

    setTimeout(function () {
        this.recorder.stop();
    }.bind(this), Boo.RECORD_TIME * 1000);
};

Boo.prototype.getVideoEffects = function ()  {
    return this.filteredRenderer.getEffects();
};

Boo.prototype.applyVideoEffect = function (index) {
    this.filteredRenderer.selectEffect(index);
};

// Boo.prototype.render = function () {
//     var width, height, offsetX, offsetY;
//     var ratio = this.video.videoWidth / this.video.videoHeight;
//
//     if (ratio > 0) { // landscape
//         height = this.original.height;
//         width = ratio * this.original.width;
//         offsetX = (this.original.width - width) / 2;
//         offsetY = 0;
//     }
//     else { // portrait
//         width = this.original.width;
//         height = ratio * this.original.height;
//         offsetY = (this.original.height - height) / 2;
//         offsetX = 0;
//     }
//
//     this.ctx.drawImage(
//         this.video,
//         0, 0,
//         this.video.videoWidth, this.video.videoHeight,
//         offsetX, offsetY,
//         width, height);
// };

module.exports = Boo;
