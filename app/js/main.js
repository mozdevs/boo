var Boo = require('./boo.js');

window.onload = function () {
    var boo;

    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then(function (stream) {
        var boo = new Boo(
            stream,
            document.getElementById('booth-original'),
            document.getElementById('booth-filtered')
        );

        var button = document.getElementById('download');
        boo.on('ready', function () {
            button.disabled = false;
        });
        button.addEventListener('click', function () {
            button.disabled = true;
            boo.download();
        });
    });
};
