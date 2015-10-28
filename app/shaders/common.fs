#ifdef GL_ES
precision mediump float;
#endif

/**

  OpenGL_ES (the OpenGL "flavour" that WebGL uses) doesn't allow to use expressions
  for array indices.
  So the following code, from http://devlog-martinsh.blogspot.com.es/2011/03/glsl-dithering.html
  has to be adapted in order to work on WebGL devices.

  vec4 dither[4];

  dither[0] = vec4( 1.0, 33.0, 9.0, 41.0);
  dither[1] = vec4(49.0, 17.0, 57.0, 25.0);
  dither[2] = vec4(13.0, 45.0, 5.0, 37.0);
  dither[3] = vec4(61.0, 29.0, 53.0, 21.0);

  float limit = 0.0;
  if(x < 4) {
  limit = (dither[x][y]+1.0)/64.0;
  }
 */
float find_closest(int x, int y, float c0) {

    vec4 dither0 = vec4( 1.0, 33.0, 9.0, 41.0);
    vec4 dither1 = vec4(49.0, 17.0, 57.0, 25.0);
    vec4 dither2 = vec4(13.0, 45.0, 5.0, 37.0);
    vec4 dither3 = vec4(61.0, 29.0, 53.0, 21.0);

    float limit = 0.0;
    float value = 0.0;

    vec4 dither;

    if(x == 0) {
        dither = dither0;
    } else if(x == 1) {
        dither = dither1;
    } else if(x == 2) {
        dither = dither2;
    } else if(x == 3) {
        dither = dither3;
    }

    if(x < 4) {
        if(y == 0) {
            value = dither[0];
        } else if(y == 1) {
            value = dither[1];
        } else if(y == 2) {
            value = dither[2];
        } else if(y == 3) {
            value = dither[3];
        }

        limit = (value + 1.0) / 64.0;
    }

    if(c0 < limit) {
        return 0.0;
    } else {
        return 1.0;
    }
}

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec2 pixellateCoords(vec2 uv, float numTiles) {
   return floor(uv * numTiles) / numTiles;
}


