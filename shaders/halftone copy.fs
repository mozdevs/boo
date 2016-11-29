#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif

uniform float uScale; // For imperfect, isotropic anti-aliasing in
uniform float uYrot;  // absence of dFdx() and dFdy() functions

uniform sampler2D map;
varying vec2 vUv;

float frequency = 40.0;

float aastep(float threshold, float value) {
#ifdef GL_OES_standard_derivatives
  float afwidth = 0.7 * length(vec2(dFdx(value), dFdy(value)));
#else
  //float afwidth = frequency * (1.0/200.0) / uScale / cos(uYrot);
  float afwidth = 1.0;
#endif
  return smoothstep(threshold-afwidth, threshold+afwidth, value);
}

void main() {
    // Distance to nearest point in a grid of
    // (frequency x frequency) points over the unit square
    vec2 st2 = mat2(0.707, -0.707, 0.707, 0.707) * vUv;
    vec2 nearest = 2.0 * fract(frequency * st2) - 1.0;
    float dist = length(nearest);

    // Use a texture to modulate the size of the dots
    vec3 rgb = texture2D(map, vUv).rgb; // Unrotated coords
	float avg = length(rgb) / 3.0;
    //float radius = sqrt(1.0 - rgb.g);
    float radius = 1.0 - rgb.g;
    vec3 white = vec3(1.0, 1.0, 1.0);
    vec3 black = vec3(0.0, 0.0, 0.0);
    vec3 fragcolor = mix(black, white, aastep(radius, dist));
    gl_FragColor = vec4(fragcolor, 1.0);

	// debugging //
	// float stepp = aastep(radius, dist);
	// gl_FragColor = vec4(radius, radius, radius, 1.0);
	//gl_FragColor = vec4(vec3(stepp), 1.0);
}
