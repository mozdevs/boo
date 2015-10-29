/**
 * The Renderer is the part of the app that accepts unprocessed images as input
 * and processes them to produce different visual "effects", using WebGL shaders.
 * Finally the result is output into a Canvas that we provide when creating the
 * renderer instance.
 *
 * Each effect requires a vertex and a fragment shader. These are little pieces of
 * code that are compiled and sent to the graphics card, and are executed by it,
 * instead of your CPU.
 *
 * All WebGL related code in the application is here and in ImageEffect.js
 *
 * Visit http://webgl.org if you want to learn more about WebGL.
 */

var ImageEffect = require('./ImageEffect.js');
var glMatrix = require('gl-matrix');

var Renderer = function(canvas, errorCallback, readyCallback) {

    var gl;
    var effects = [];
    var effectDefinitions = {
        'None': { vertex: 'plane.vs', fragment: 'none.fs' },
        'Witch': { vertex: 'plane.vs', fragment: 'greenmonster.fs' },
        'Lo-Fi Purple': { vertex: 'plane.vs', fragment: 'lofipurple.fs' }
    };
    var activeEffect = null;
    var shadersReady = false;
    var shaderProgram;
    var vertexPositionBuffer;
    var uvBuffer;
    var mvMatrix;
    var pMatrix;
    var texture;
    var onErrorCallback = errorCallback || function() {};
    var onReadyCallback = readyCallback || function() {};

    this.domElement = canvas;

    gl = initWebGL(canvas);

    if (gl === null) {
        errorCallback('Looks like WebGL is not available in this browser');
        return;
    }

    initWebGLBuffers();
    initTexture();
    loadEffects();

    /**
     * Here we just obtain a webgl context from the canvas we get passed
     * The context is then used for calling its provided gl functions
     */
    function initWebGL(canvas) {

        var gl = null;
        var options = { preserveDrawingBuffer: true };

        gl = canvas.getContext("webgl", options);

        if (gl) {
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;

            gl.shadersCache = {};
        }

        return gl;
    }

    /**
     * Before we can draw anything with WebGL we need to set up what to draw.
     * WebGL uses the concept of buffers, which are similar to arrays. These are
     * very GPU friendly and allow WebGL to run very fast, but are a bit more
     * inconvenient to setup than plain JavaScript arrays.
     *
     * We will need a buffer for the vertices, and another for the texture UVs
     * (this is a way of specifying which part of the texture is drawn on the
     * output plane).
     *
     * As we just want to draw a somewhat rectangular output, we just need to
     * define four vertices on each buffer.
     * Note how the buffers have no notion of x, y or z coordinates --it's just
     * float values for them.
     *
     * We also create a couple of 4x4 matrices that are used to transform the
     * abstract 3D vertices into 2D.
     *
     * When you use a 3D framework like three.js, this kind of things are
     * abstracted away via the Camera and Scene classes.
     */
    function initWebGLBuffers() {

        vertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
        var vertices = [
             1.0,  1.0,  0.0,
            -1.0,  1.0,  0.0,
             1.0, -1.0,  0.0,
            -1.0, -1.0,  0.0
        ];

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        vertexPositionBuffer.itemSize = 3;
        vertexPositionBuffer.numItems = 4;

        uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);

        var uvs = [
            1.0, 1.0,
            0.0, 1.0,
            1.0, 0.0,
            0.0, 0.0
        ];

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
        uvBuffer.itemSize = 2;
        uvBuffer.numItems = 4;

        mvMatrix = glMatrix.mat4.create();
        pMatrix = glMatrix.mat4.create();

    }


    /**
     * Since we will just be processing one source of images, we will only
     * need to upload to the graphics card an image each time. The "target" of these
     * uploads is the texture we create here
     */
    function initTexture() {

        texture = gl.createTexture();

    }


    /**
     * Here we'll load first each effect's vertex and fragment shader's source
     * from their separate files, and when we have all files loaded we'll create
     * the actual effects, and call the onReadyCallback function to signify we are
     * ready to process images.
     *
     * The vertex shader works over vertices, so it can transform and move them in
     * 3D space; the fragment shader works over each pixel, and it's responsible for
     * determining which colour to use (or whether to draw a given pixel at all!)
     *
     * For this particular app, the vertex shader is very simple, as it just ensures
     * that we draw a 2D plane--that's why all of the effects use the same vertex shader.
     * The fragment shader is what is really interesting here, and also differs between
     * each effect.
     */
    function loadEffects() {
        // We always need to load some common shader code, so add those to the
        // list to start with
        var files = ['common.vs', 'common.fs'];

        // then collect all file names from the effect definitions
        for(var k in effectDefinitions) {

            var def = effectDefinitions[k];
            files.push(def.vertex);
            files.push(def.fragment);

        }

        // And load each shader file. When done, we can initialise the effects.
        loadShaders(files, onErrorCallback, function(shaders) {
            initialiseEffects(shaders);
        });

    }


    /**
     * We will be loading shader files sequentially. If any of the shaders
     * is not found, we'll just cancel the whole thing and report an error
     * via errorCallback
     */
    function loadShaders(files, errorCallback, doneCallback) {

        var directory = 'shaders/';
        var loaded = {};
        var filesToLoad = files.slice(0);

        loadNextShader();

        //

        function loadNextShader() {

            if(filesToLoad.length > 0) {
                setTimeout(function() {
                    loadShader(filesToLoad.shift());
                }, 1);
            } else {
                doneCallback(loaded);
            }

        }

        function loadShader(filename) {

            // Don't load shaders twice
            if(loaded.hasOwnProperty(filename)) {
                loadNextShader(filename);
            } else {
                var fullpath = directory + filename;
                var request = new XMLHttpRequest();

                request.open('GET', fullpath, true);
                request.responseType = 'text';
                request.onload = function() {
                    if(request.status === 404) {
                        errorCallback('Shader file not found: ' + filename);
                    } else {
                        loaded[filename] = request.response;
                        loadNextShader();
                    }
                };

                request.send();
            }

        }

    }


    /**
     * We have taken out the parts common to all shaders onto
     * common.vs (for the vertex shaders) and common.fs (ditto, but for the fragment
     * shaders).
     */
    function initialiseEffects(shadersData) {

        var vertexCommonShader = shadersData['common.vs'];
        var fragmentCommonShader = shadersData['common.fs'];

        for(var k in effectDefinitions) {

            var def = effectDefinitions[k];
            var vertexShader = shadersData[def.vertex];
            var fragmentShader = shadersData[def.fragment];

            vertexShader = vertexCommonShader + vertexShader;
            fragmentShader = fragmentCommonShader + fragmentShader;

            var effect = new ImageEffect({
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                attributes: {
                    uv: {},
                    position: {}
                },
                uniforms: {
                    projectionMatrix: {},
                    modelViewMatrix: {},
                    map: {}
                },
                name: k
            });

            effects.push(effect);
            effect.initialise(gl);

        }

        activeEffect = effects[0];
        setTimeout(onEffectsInitialised, 1);

    }


    /**
     * Called when all effects are loaded and ready
     */
    function onEffectsInitialised() {

        shadersReady = true;
        onReadyCallback();

    }


    /**
     * Each time this function is called it will clear everything on our output canvas
     * and draw a processed image on it, using the currently active effect.
     *
     * This involves a bit of matrix math for positioning our plane in front of the
     * 'camera', and some amount of "state setting". What this means is that WebGL
     * works by making very simple calls for enabling and disabling 'things',
     * instead of calling complex functions that take many parameters.
     *
     * For example, instead of invoking a function called "drawTextureWithEffect"
     * that takes a list of vertices, a texture, a list of texture coordinates and a
     * position, we do the following:
     * - calculate the positions with the mat4 matrix library,
     * - activate a texture unit or "slot" (texture0),
     * - enable the particular texture we want to use, with bindTexture,
     * - then enable the effect, which involves telling WebGL to use the shaders
     *   associated to the effect
     * - tell WebGL to use the matrices we calculated before
     * - tell WebGL to draw a series of triangles, by reading its positions from the
     *   vertexPositionBuffer we initialised early on.
     * - and finally disable the effect
     *
     * Again, 3D frameworks abstract all this for you by providing some 'syntatic sugar'.
     */
    function render() {

        if(!shadersReady) {
            return;
        }

        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        glMatrix.mat4.ortho(pMatrix, -1, 1, -1, 1, 0.1, 1000);

        glMatrix.mat4.identity(mvMatrix);
        glMatrix.mat4.translate(mvMatrix, mvMatrix, [0.0, 0.0, -1.0]);

        activeEffect.enable(gl);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.uniform1i(activeEffect.uniforms.map.id, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.vertexAttribPointer(activeEffect.attributes.uv.id, uvBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
        gl.vertexAttribPointer(activeEffect.attributes.position.id, vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.uniformMatrix4fv(activeEffect.uniforms.projectionMatrix.id, false, pMatrix);
        gl.uniformMatrix4fv(activeEffect.uniforms.modelViewMatrix.id, false, mvMatrix);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexPositionBuffer.numItems);

        activeEffect.disable(gl);

    }


    this.setSize = function(w, h) {

        gl.viewportWidth = w;
        gl.viewportHeight = h;

        canvas.width = w;
        canvas.height = h;

    };

    this.getEffects = function () {
        return effects.map(function (x) {
            return x.name;
        });
    };

    this.previousEffect = function() {

        var index = effects.indexOf(activeEffect);
        var newIndex = --index < 0 ? effects.length - 1 : index;

        activeEffect = effects[newIndex];

    };


    this.nextEffect = function() {

        var index = effects.indexOf(activeEffect);
        var newIndex = ++index % effects.length;

        activeEffect = effects[newIndex];

    };

    this.selectEffect = function (index) {
        activeEffect = effects[index % effects.length];
    };


    /**
     * This is used to upload a copy of the current appearance of the video element
     * onto our WebGL texture.
     *
     * As it happens on the render method, we need to make a lot of small, simple
     * function calls to get the image in WebGL-land, and then disable the texture
     * (passing 'null' as texture parameter).
     *
     */
    this.updateTexture = function(video) {

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);

        render();
    };
};


module.exports = Renderer;
