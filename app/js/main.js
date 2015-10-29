var Boo = require('./boo.js');

window.onload = function () {
    var boo;
    var vfxCombo = document.getElementById('vfx');
    var button = document.getElementById('download');

    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then(function (stream) {
        var boo = new Boo(
            stream,
            document.getElementById('booth-original'),
            document.getElementById('booth-filtered')
        );

        boo.on('ready', function () {
            button.disabled = false;
            var vfx = boo.getVideoEffects();
            vfxCombo.innerHTML = '';
            vfx.forEach(function (x, index) {
                var el = document.createElement('option');
                el.value = index;
                el.innerHTML = x;
                if (index === 1 && vfx.length) {
                    el.selected = true;
                }
                vfxCombo.appendChild(el);
            });
            vfxCombo.disabled = false;
        });

        button.addEventListener('click', function () {
            button.disabled = true;
            boo.download();
        });

        vfxCombo.addEventListener('change', function (evt) {
            boo.applyVideoEffect(parseInt(vfxCombo.value, 10));
        });
    });
};
