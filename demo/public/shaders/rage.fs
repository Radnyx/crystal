varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform int step;
uniform vec4 inputPixel;

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453);
}

void main(void) {
    vec4 col = texture2D(uSampler, vTextureCoord);
    if (col.x + col.y + col.z > 2.9) return;
    if (col.w == 0.0) return;
    // Pick colors from visible texture
    vec2 rat = 56.0 / inputPixel.xy;
    // Only 4 colors to pick!
    // find a non-transparent color in the texture
    for (int i = 0; i < 8; i++) {
        float t = float(step + i);
        vec2 uv2 = vec2(rand(col.xy + t), rand(col.yx + t));
        vec4 col2 = texture2D(uSampler, vec2(0.5, 0.5) + (uv2 - 0.3));
        if (col2.w >= 0.9 && (col2.x <= 0.9 || col2.y <= 0.9 || col2.z <= 0.9)) {
            gl_FragColor = col2;
            return;
        }
    }
    
}