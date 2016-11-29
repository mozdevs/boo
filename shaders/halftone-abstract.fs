// Based on the halftone shader, which is based on the tutorial at 
// http://webstaff.itn.liu.se/~stegu/webglshadertutorial/shadertutorial.html

uniform sampler2D map;
varying vec2 vUv;

float frequency = 60.0;

float aastep(float threshold, float value) {
  float afwidth = 0.01;
  return smoothstep(threshold-afwidth, threshold+afwidth, value);
}

void main() {
    // Distance to nearest point in a grid of
    // (frequency x frequency) points over the unit square
    vec2 st2 = mat2(0.707, -0.707, 0.707, 0.707) * vUv;
    vec2 nearest = 2.0 * fract(frequency * st2) - 1.0;
    float dist = length(nearest) * 3.0;

    // Use a texture to modulate the size of the dots
    vec3 rgb = texture2D(map, vUv).rgb; // Unrotated coords
	float avg = length(rgb) / 3.0;
	avg = avg > 0.2 ? 1.0 : 0.0;
    float radius = sqrt(1.0 - avg);
    vec3 white = vec3(1.0, 1.0, 1.0);
    vec3 black = vec3(0.0, 0.0, 0.0);
    vec3 fragcolor = mix(black, white, aastep(radius, dist));
    gl_FragColor = vec4(fragcolor, 1.0);
}

