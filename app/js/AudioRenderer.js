var AudioEffect = require('./AudioEffect');
var effectConstructors = [
    require('./audioEffects/Echo'),
    require('./audioEffects/Chorus')
];

module.exports = function AudioRenderer(context) {
    
    AudioEffect.call(this, context);

    this.input.disconnect();

    var effects = [];
    var currentEffect = null;
    var currentEffectIndex = -1;

    for(var i = 0; i < effectConstructors.length; i++) {
        var constructor = effectConstructors[i];
        var instance = new constructor(context);
        effects.push(instance);
    }

    this.nextEffect = function() {
        
        var newIndex = currentEffectIndex + 1;
        if(newIndex >= effects.length) {
          newIndex = 0;
        }
        currentEffectIndex = newIndex;

        this.input.disconnect();

        if(currentEffect !== null) {
            currentEffect.output.disconnect();
        }

        currentEffect = effects[currentEffectIndex];

        this.input.connect(currentEffect.input);
        currentEffect.output.connect(this.output);

    };

};
