#define N vec2(-1, -1)

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform int step;
uniform vec4 inputPixel;

vec2 map(vec2 tile, int step) {
    if (step == 0) {
        return N;
    } else if (step == 1) {
        // top left corner
        if (tile == vec2(2.0, 5.0)) return vec2(0.0, 1.0);
        // top right corner
        if (tile == vec2(3.0, 5.0)) return vec2(5.0, 1.0);
        // bottom left corner
        if (tile == vec2(2.0, 6.0)) return vec2(0.0, 6.0);
        // bottom right corner
        if (tile == vec2(3.0, 6.0)) return vec2(5.0, 6.0);
        return N;
    } else if (step == 2) {
        // top left corner
        if (tile == vec2(1.0, 3.0)) return vec2(0.0, 1.0);
        // top chunk
        if (tile == vec2(2.0, 3.0)) return vec2(2.0, 1.0);
        if (tile == vec2(3.0, 3.0)) return vec2(3.0, 1.0);
        // top right corner
        if (tile == vec2(4.0, 3.0)) return vec2(5.0, 1.0);
        // left chunk
        if (tile == vec2(1.0, 4.0)) return vec2(0.0, 3.0);
        if (tile == vec2(1.0, 5.0)) return vec2(0.0, 4.0);
        // middle chunk
        if (tile == vec2(2.0, 4.0)) return vec2(2.0, 3.0);
        if (tile == vec2(3.0, 4.0)) return vec2(3.0, 3.0);
        if (tile == vec2(2.0, 5.0)) return vec2(2.0, 4.0);
        if (tile == vec2(3.0, 5.0)) return vec2(3.0, 4.0);
        // right chunk
        if (tile == vec2(4.0, 4.0)) return vec2(5.0, 3.0);
        if (tile == vec2(4.0, 5.0)) return vec2(5.0, 4.0);
        // bottom left corner
        if (tile == vec2(1.0, 6.0)) return vec2(0.0, 6.0);
        // bottom chunk
        if (tile == vec2(2.0, 6.0)) return vec2(2.0, 6.0);
        if (tile == vec2(3.0, 6.0)) return vec2(3.0, 6.0);
        // bottom right corner
        if (tile == vec2(4.0, 6.0)) return vec2(5.0, 6.0);
        return N;
    }
    return tile;
}

void main(void) {
    vec2 tileSize = 8.0 / inputPixel.xy;
    vec2 offset = vec2(tileSize.x / 2.0, 0);
    vec2 uv = vTextureCoord - offset;
    vec2 tile = map(floor(uv / tileSize), step);
    if (tile.x < 0.0) {
        gl_FragColor = vec4(0);
    } else {
        gl_FragColor = texture2D(uSampler, tileSize * tile + mod(uv, tileSize) + offset);
    }
}