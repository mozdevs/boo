// Deal with web components before anything else
require('webcomponents-lite');
require('./moz-select').register('moz-select');

var Boo = require('./Boo.js');

window.onload = function () {
    var boo;
    var vfxCombo = document.getElementById('vfx');
    var downloadButton = document.getElementById('download');
    var recordButton = document.getElementById('record');
    var countdown = document.getElementById('countdown');
    var videoData;

    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then(function (stream) {
        var boo = new Boo(
            stream,
            document.getElementById('booth-original'),
            document.getElementById('booth-filtered'),
            document.getElementById('booth-progress')
        );

        boo.on('ready', function () {
            recordButton.disabled = false;
            downloadButton.disabled = true;
            countdown.style = 'display:none';

			vfxCombo.options = boo.getVideoEffects();
			// 0 is none--start with some effect applied already!
			vfxCombo.selectedIndex = 1;
            vfxCombo.disabled = false;
			vfxCombo.addEventListener('selectedIndex', function(ev) {
				boo.applyVideoEffect(ev.detail.value);
			});
        });

        boo.on('finished', function (data) {
            recordButton.disabled = false;
            downloadButton.disabled = false;
            videoData = data;
        });

        recordButton.addEventListener('click', function () {
            videoData = null;
            recordButton.disabled = true;
            downloadButton.disabled = true;
            countdown.style = '';

            var number = countdown.querySelector('.number');
            var countdownTime = 5; // seconds
            number.innerHTML = countdownTime;

            var interval = setInterval(function () {
                countdownTime--;
                number.innerHTML = countdownTime;
                if (countdownTime <= 0) {
                    clearInterval(interval);
                    countdown.style = 'display:none';

                    boo.record();
                }
            }, 1000);
        });

        downloadButton.addEventListener('click', function () {
            downloadButton.disabled = true;

            var link = document.createElement('a');
            link.setAttribute('href', window.URL.createObjectURL(videoData));
            link.setAttribute('download', 'video.webm');
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });

        /*vfxCombo.addEventListener('change', function (evt) {
            boo.applyVideoEffect(parseInt(vfxCombo.value, 10));
        });*/
    });
};
