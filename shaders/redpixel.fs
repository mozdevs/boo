uniform sampler2D map;

varying vec2 vUv;

void main() {
    vec3 finalRGB;

    vec3 rgb = texture2D(map, pixellateCoords(vUv, 80.0)).rgb;
    float avg = length(rgb) / 3.0;

    gl_FragColor = vec4(avg * 2.0, avg * 0.20, avg * 0.35, 1.0);
}
