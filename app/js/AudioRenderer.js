var AudioEffect = require('./AudioEffect');
var effectDefinitions = [
    { name: 'Echo', constructor: require('./audioEffects/Echo') },
    { name: 'Chorus', constructor: require('./audioEffects/Chorus') }
];

module.exports = function AudioRenderer(context) {
    
    AudioEffect.call(this, context);

    this.input.disconnect();

    var effects = [];
    var currentEffect = null;
    var currentEffectIndex = -1;

    effectDefinitions.forEach(function(def) {
        var constructor = def.constructor;
        var instance = new constructor(context);
        effects.push({ name: def.name, instance: instance });
    });


    this.getEffects = function() {
        return effects.map(function (x) {
            return x.name;
        });
    };


    this.selectEffect = function(index) {

        this.input.disconnect();

        if(currentEffect !== null) {
            currentEffect.output.disconnect();
        }

        currentEffect = effects[index].instance;
        currentEffectIndex = index;

        this.input.connect(currentEffect.input);
        currentEffect.output.connect(this.output);

    };
};
