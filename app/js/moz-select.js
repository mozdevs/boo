(function() {

    var setterGetterify = require('setter-getterify');
    var safeRegisterElement = require('safe-register-element');

    var proto = Object.create(HTMLElement.prototype);

    proto.createdCallback = function() {

        var that = this;

        // Values
        var properties = {
            disabled: false,
            selectedIndex: 0,
            options: []
        };

      setterGetterify(this, properties, {
          afterSetting: function(property, value) {

              // Make sure only a valid option index is assigned
              if(property === 'selectedIndex') {
                  var numOptions = that.options.length;
                  value = value * 1.0;
                  
                  if(value < 0) {
                      value = 0;
                  } else if(value >= numOptions) {
                      value = numOptions - 1;
                  }

                  properties[property] = value;

                  // Using this instead of fancy EventEmitter because I can't
                  // figure out how to make it work with the custom element 
                  // prototype, argh!
                  // I guess it will all be cool when we have the new
                  // fancy custom elements with ES6 classes 8-)
                  var e = new CustomEvent('selectedIndex', { detail: { value: value } });
                  that.dispatchEvent(e);
              }

              updateDisplay(that);
          }
      });

      this._properties = properties;


      // Markup
      var selectedOption = document.createElement('span');
      selectedOption.innerHTML = '...';

      var prevButton = document.createElement('button');
      prevButton.innerHTML = '<';

      var nextButton = document.createElement('button');
      nextButton.innerHTML = '>';


      this._selectedOption = selectedOption;
      this._prevButton = prevButton;
      this._nextButton = nextButton;

      this.appendChild(prevButton);
      this.appendChild(selectedOption);
      this.appendChild(nextButton);

      prevButton.addEventListener('click', function() {
          that.selectPreviousOption();
      });

      nextButton.addEventListener('click', function() {
          that.selectNextOption();
      });


    };


    proto.selectPreviousOption = function() {
        this.offsetOption(-1);
    };


    proto.selectNextOption = function() {
        this.offsetOption(+1);
    };


    proto.offsetOption = function(offset) {
        var newIndex = this.selectedIndex + offset;
        this.selectedIndex = newIndex;
    };


    proto.attachedCallback = function() {
        updateDisplay(this);
    };


    function updateDisplay(compo) {

        // Propagate the 'disabled' value to the buttons
        compo._prevButton.disabled = compo.disabled;
        compo._nextButton.disabled = compo.disabled;

        // Render the selected option
        var options = compo.options;
        var selectedIndex = compo.selectedIndex;
        var selectedOption = compo._selectedOption;
        var currentValue = '...';

        if(options.length > 0) {
          currentValue = options[selectedIndex];
        }

        selectedOption.textContent = currentValue;
        
    }

    //

    var component = {};
    component.prototype = proto;
    component.register = function(name) {
        safeRegisterElement(name, proto);
    };


    if(typeof define === 'function' && define.amd) {
        define(function() { return component; });
    } else if(typeof module !== 'undefined' && module.exports) {
        module.exports = component;
    } else {
        component.register('moz-select'); // automatic registration
    }

}).call(this);


