varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform int step;
uniform vec4 inputPixel;

void main(void) {
    vec2 uv = vec2(vTextureCoord.xy);
    uv.x += sin(2.0 * 3.14 * uv.y * 14.0 + float(step) / 8.0) * 0.02; 
    vec4 col = texture2D(uSampler, uv);
    if (col.w >= 0.9 && (col.x <= 0.95 || col.y <= 0.95 || col.z <= 0.95)) {
        float t = sin(float(step) / 4.0) * 0.5 + 0.5;
        col.x = mix(col.x, (0.9725), t * t);
        col.yz = mix(col.yz, vec2(0.9725), t);
    }
    gl_FragColor = col;
}