function Boo(stream, original, filtered) {
    this.stream = stream;
    this.video = original;
    this.canvas = filtered;
    this.ctx = this.canvas.getContext('2d');

    this.video.src = window.URL.createObjectURL(stream);
    this.video.play();


    this.video.addEventListener('loadeddata', function () {
        window.requestAnimationFrame(this._tick.bind(this));
        this.canvasStream = this.canvas.captureStream(12);
        this.canvasStream.addTrack(this.stream.getAudioTracks()[0]);
        this.recorder = new MediaRecorder(this.canvasStream, { mimeType: 'video/mp4' });
        this.recorder.start();
    }.bind(this), false);
}

Boo.prototype._tick = function () {
    window.requestAnimationFrame(this._tick.bind(this));
    this.render();
};

Boo.prototype.render = function () {
    var width, height, offsetX, offsetY;
    var ratio = this.video.videoWidth / this.video.videoHeight;

    if (ratio > 0) { // landscape
        height = this.canvas.height;
        width = ratio * this.canvas.width;
        offsetX = (this.canvas.width - width) / 2;
        offsetY = 0;
    }
    else { // portrait
        width = this.canvas.width;
        height = ratio * this.canvas.height;
        offsetY = (this.canvas.height - height) / 2;
        offsetX = 0;
    }

    this.ctx.drawImage(
        this.video,
        0, 0,
        this.video.videoWidth, this.video.videoHeight,
        offsetX, offsetY,
        width, height);
};

Boo.prototype.download = function () {
    this.recorder.stop();
    this.recorder.ondataavailable = function (evt) {
        var link = document.createElement('a');
        link.setAttribute('href', window.URL.createObjectURL(evt.data));
        link.setAttribute('download', 'video.webm');
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
};

window.onload = function () {
    var boo;

    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then(function (stream) {
        var video = document.getElementById('booth-original');
        var boo = new Boo(
            stream,
            video,
            document.getElementById('booth-filtered')
        );

        var button = document.getElementById('download');
        video.addEventListener('loadeddata', function () {
            button.disabled = false;
        });
        button.addEventListener('click', function () {
            button.disabled = true;
            boo.download();
        });

    });
};
