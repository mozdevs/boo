function Boo(stream, original, filtered) {
    this.stream = stream;
    this.video = original;
    this.canvas = filtered;
    this.ctx = this.canvas.getContext('2d');

    this.video.src = window.URL.createObjectURL(stream);
    this.video.play();

    this.video.onloadeddata = function () {
        window.requestAnimationFrame(this._tick.bind(this));
    }.bind(this);
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

window.onload = function () {
    var boo;

    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
    }).then(function (stream) {
        boo = new Boo(
            stream,
            document.getElementById('booth-original'),
            document.getElementById('booth-filtered')
        );
    });
};
