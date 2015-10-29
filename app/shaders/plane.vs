uniform sampler2D map;

varying vec2 vUv;

void main() {

    vUv = uv;

    vec4 pos = vec4( position.xy, 0.0, 1.0 );

    gl_Position = projectionMatrix * modelViewMatrix * pos;

}
