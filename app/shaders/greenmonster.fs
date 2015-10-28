uniform sampler2D map;

varying vec2 vUv;

void main() {
    vec3 finalRGB;
    vec3 rgb = texture2D(map, vUv).rgb;

    gl_FragColor = vec4(rgb.b, rgb.r, rgb.g, 1.0);
}
