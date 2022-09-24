varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform int step;
uniform float yPos;
uniform vec4 inputPixel;

void main(void) {
    vec2 uv = vec2(vTextureCoord.xy);
    float scaled = uv.y / 0.4;
    if (uv.y * 160.0 > 50.0 + 0.6 * yPos) {
        uv.y += sin(2.0 * 3.14159 * 14.0 + float(step) / 8.0 +  uv.y * 64.0) * 0.005; 
        
    }
    vec4 col = texture2D(uSampler, uv);
    gl_FragColor = col;
}