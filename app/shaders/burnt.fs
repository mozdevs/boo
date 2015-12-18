uniform sampler2D map;
varying vec2 vUv;

void main() {
    vec3 rgb = texture2D(map, vUv).rgb;

    float red = rgb.r > 0.5 ? 1.0 : 0.0;
    float green = rgb.g > 0.5 ? 1.0 : 0.0;
    float blue = rgb.b > 0.5 ? 1.0 : 0.0;

    gl_FragColor = vec4(red, green, blue, 1.0);
}
