// Deal with web components before anything else
require('webcomponents-lite');
require('./moz-select').register('moz-select');

var Boo = require('./Boo.js');

window.onload = function () {
    var boo;
    var loader = document.getElementById('loader');
    var controls = document.querySelector('footer');
    var videoEffectSelector = document.getElementById('videoEffect');
    var audioEffectSelector = document.getElementById('audioEffect');
    var downloadButton = document.getElementById('download');
    var recordButton = document.getElementById('record');
    var countdown = document.getElementById('countdown');
    var videoData;


    var missingFeatures = getMissingFeatures();

    if(missingFeatures.length === 0) {
      navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
      }).then(initBooth);
    } else {
        displayUnsupported(missingFeatures);
    }


    function getMissingFeatures() {

        // First detect all features we need for the booth to work,
        // and store them in tuples of [title, boolean true/false for support]
        var features = [];

        features.push(['navigator.mediaDevices.getUserMedia', navigator.mediaDevices !== undefined && navigator.mediaDevices.getUserMedia !== undefined]);
        features.push(['unprefixed Web Audio', window.AudioContext !== undefined]);
        features.push(['canvas.captureStream', window.CanvasCaptureMediaStream !== undefined]);

        // Then return only the ones we're missing so we can show a
        // bulleted list with info to the user/developer
        return features.filter(function(f) {
          return f[1] === false;
        });
    }


    function displayUnsupported(features) {

        var list = features.map(function(f) {
            return '- ' + f[0];
        }).join('\n');

        var str = 'The following features are not supported in this browser: \n\n' + list;

        alert(str);
    }


    function initBooth(stream) {

        boo = new Boo(
            stream,
            document.getElementById('booth-filtered'),
            document.getElementById('booth-progress')
        );

        boo.on('ready', function () {
            loader.classList.add('hidden');
            controls.classList.remove('hidden');
            recordButton.disabled = false;
            downloadButton.disabled = true;
            countdown.style = 'display:none';

            videoEffectSelector.options = boo.getVideoEffects();
            // 0 is none--start with some effect applied already!
            videoEffectSelector.selectedIndex = 1;
            videoEffectSelector.disabled = false;
            videoEffectSelector.addEventListener('selectedIndex', function(ev) {
                boo.selectVideoEffect(ev.detail.value);
            });

            audioEffectSelector.options = boo.getAudioEffects();
            audioEffectSelector.addEventListener('selectedIndex', function(ev) {
                boo.selectAudioEffect(ev.detail.value);
            });

            // Set the listener for resize events, but also
            // make sure we're making the best use of the space already
            window.addEventListener('resize', function() {
                updateSize();
            });
            updateSize();

        });

        boo.on('finished', function (data) {
            recordButton.disabled = false;
            recordButton.classList.remove('active');
            downloadButton.disabled = false;
            videoData = data;
        });

        recordButton.addEventListener('click', function () {
            videoData = null;
            recordButton.disabled = true;
            downloadButton.disabled = true;
            countdown.style = '';

            var number = countdown.querySelector('.number');
            var countdownTime = 3; // seconds
            number.innerHTML = countdownTime;

            var interval = setInterval(function () {
                countdownTime--;
                number.innerHTML = countdownTime;
                if (countdownTime <= 0) {
                    clearInterval(interval);
                    countdown.style = 'display:none';
                    recordButton.classList.add('active');
                    boo.record();
                }
            }, 1000);
        });

        downloadButton.addEventListener('click', function () {
            downloadButton.disabled = true;

            var link = document.createElement('a');
            link.setAttribute('href', window.URL.createObjectURL(videoData));
            link.setAttribute('download', 'video_' + generateTimestamp() + '.webm');
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });

    }

    function updateSize() {
        boo.setSize(window.innerWidth, window.innerHeight);
    }

    function generateTimestamp() {
      var now = new Date()
      var ymd = now.getFullYear() + ("00" + (now.getMonth() + 1)).substr(-2) + ("00" + now.getDate()).substr(-2);
      var hms = ("00" + now.getHours()).substr(-2) + ("00" + now.getMinutes()).substr(-2) + ("00" + now.getSeconds()).substr(-2)

      return ymd + '_' + hms;
    }
};
