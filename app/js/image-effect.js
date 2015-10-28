var ImageEffect = function (params) {
	params = params || {};

	var self = this;
	this.vertexShaderScript = params.vertexShader;
	this.fragmentShaderScript = params.fragmentShader;
	this.shaderProgram = null;
	this.uniforms = params.uniforms || {};
	this.attributes = params.attributes || {};

	// ~~~

	function initShader(gl, type, script) {
		if( gl.shadersCache[ script ] === undefined ) {

			var shader = gl.createShader( type );
			gl.shaderSource( shader, script );
			gl.compileShader( shader );

			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				throw new Error('Shader <strong>' + script + '</strong> could not be compiled\n' + gl.getShaderInfoLog(shader));
			}

			gl.shadersCache[ script ] = shader;

			return shader;

		}

		return gl.shadersCache[ script ];

	}

	function initUniforms(gl, program, pairs) {
		for(var k in pairs) {
			pairs[k].id = gl.getUniformLocation(program, k);
		}
	}

	function initAttributes(gl, program, pairs) {
		for(var k in pairs) {
			pairs[k].id = gl.getAttribLocation(program, k);
		}
	}

	// ~~~

	this.initialise = function(gl) {

		var vertexShader, fragmentShader;
		var shaderProgram = gl.createProgram();

		vertexShader = initShader(gl, gl.VERTEX_SHADER, this.vertexShaderScript);
		fragmentShader = initShader(gl, gl.FRAGMENT_SHADER, this.fragmentShaderScript);

		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);
		gl.linkProgram(shaderProgram);

		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			throw new Error('Shaders could not be linked');
		}

		gl.useProgram(shaderProgram);

		initUniforms(gl, shaderProgram, this.uniforms);
		initAttributes(gl, shaderProgram, this.attributes);

		this.shaderProgram = shaderProgram;

	};


	this.enable = function(gl) {
		// TODO: from this.attributes
		gl.useProgram(this.shaderProgram);
		gl.enableVertexAttribArray(this.attributes.uv.id);
		gl.enableVertexAttribArray(this.attributes.position.id);
	};

	this.disable = function(gl) {
		// TODO: from this.attributes
		gl.enableVertexAttribArray(this.attributes.uv.id);
		gl.enableVertexAttribArray(this.attributes.position.id);
	};
};

module.exports = ImageEffect;
