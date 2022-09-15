varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float step;

void main(void) {
    vec2 uv = vTextureCoord;
    int realYTile = int(uv.y * 7.0);
    float yTileOffset = mod(uv.y, 1.0 / 7.0);
    int yTile = realYTile - int(step / 2.0);
    if (realYTile >= 5 && int(mod(step, 2.0)) == 1) {
  		yTile -= 1;
    }
    if (yTile < 0) {
        gl_FragColor = vec4(0.0);
    } else {
        gl_FragColor = texture2D(uSampler, vec2(uv.x, float(yTile) / 7.0 + yTileOffset));
    }
}
