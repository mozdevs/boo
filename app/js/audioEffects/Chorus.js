var AudioEffect = require('../AudioEffect');

module.exports = function Chorus(context) {
    AudioEffect.call(this, context);

    this.input.disconnect();

    var totalDelay = 1;
    var numUnits = totalDelay * 10;
    var increase = totalDelay / (numUnits - 1);
    var amount = increase; // start with *some* delay already
    var unitGain = 1.0 / numUnits;
    var now = context.currentTime;
    var wetGain = context.createGain();
    wetGain.gain.setValueAtTime(0.9, now);

    this.input.connect(wetGain);
    wetGain.connect(this.output);

    for(var i = 0; i < numUnits; i++) {
        var delay = context.createDelay();
        var gain = context.createGain();

        delay.delayTime.setValueAtTime(amount, now);
        gain.gain.setValueAtTime(unitGain, now);

        wetGain.connect(delay);
        delay.connect(gain);
        gain.connect(wetGain);

        amount += increase;
    }
};
