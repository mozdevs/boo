var AudioEffect = require('../AudioEffect');

module.exports = function AudioEffectEcho(context) {
    AudioEffect.call(this, context);

    this.input.disconnect();

    var now = context.currentTime;
    var delay = context.createDelay();
    var mixed = context.createGain();
    var wetGain = context.createGain();

    this.input.connect(mixed);
    mixed.connect(this.output);

    delay.connect(mixed);
    delay.delayTime.setValueAtTime(0.5, now);

    mixed.connect(wetGain);
    wetGain.connect(delay);
    wetGain.gain.setValueAtTime(0.9, now);
};
