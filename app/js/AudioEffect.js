module.exports = function AudioEffect(context) {
    var inputGain = context.createGain();
    var outputGain = context.createGain();

    this.input = inputGain;
    this.output = outputGain;

    // pass-through by default (i.e. doesn't filter anything)
    inputGain.connect(outputGain);
};
