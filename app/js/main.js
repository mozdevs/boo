var Boo = require('./boo.js');

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
