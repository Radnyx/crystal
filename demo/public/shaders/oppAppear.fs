#define N vec2(-1, -1)

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform int step;
uniform vec4 inputPixel;

vec2 map(vec2 tile, int step) {
    if (step == 0) {
        if (tile == vec2(2.0, 4.0)) return vec2(0, 0);
        if (tile == vec2(3.0, 4.0)) return vec2(3.0, 0);
        if (tile == vec2(4.0, 4.0)) return vec2(6.0, 0);
        if (tile == vec2(2.0, 5.0)) return vec2(0, 3.0);
        if (tile == vec2(3.0, 5.0)) return vec2(3.0, 3.0);
        if (tile == vec2(4.0, 5.0)) return vec2(6.0, 3.0);
        if (tile == vec2(2.0, 6.0)) return vec2(0, 6.0);
        if (tile == vec2(3.0, 6.0)) return vec2(3.0, 6.0);
        if (tile == vec2(4.0, 6.0)) return vec2(6.0, 6.0);
        return N;
    } else if (step == 1) {
        if (tile.y <= 1.0 || tile.x == 0.0 || tile.x == 6.0) return N;
        vec2 result = N;
        if (tile.x == 1.0) result.x = 0.0;
        else if (tile.x == 2.0) result.x = 1.0;
        else if (tile.x == 3.0) result.x = 3.0;
        else if (tile.x == 4.0) result.x = 5.0;
        else if (tile.x == 5.0) result.x = 6.0;
        if (tile.y == 2.0) result.y = 0.0;
        else if (tile.y == 3.0) result.y = 1.0;
        else if (tile.y == 4.0) result.y = 3.0;
        else if (tile.y == 5.0) result.y = 5.0;
        else if (tile.y == 6.0) result.y = 6.0;
        return result;
    }
    return tile;
}

void main(void) {
    vec2 tileSize = 8.0 / inputPixel.xy;
    vec2 tile = map(floor(vTextureCoord / tileSize), step);
    if (tile.x < 0.0) {
        gl_FragColor = vec4(0);
    } else {
        gl_FragColor = texture2D(uSampler, tileSize * tile + mod(vTextureCoord, tileSize));
    }
}