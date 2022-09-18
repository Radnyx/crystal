varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform int step;
uniform vec4 inputPixel;

void main(void) {
    vec2 uv = vec2(vTextureCoord.xy);
    vec4 col = texture2D(uSampler, uv);
    float t = -cos(2.0 * 3.14 * float(step) / 80.0 * 3.0) * 0.5 + 0.5;
    col.xy = mix(col.xy, vec2(0.9725), t);
    col.z = mix(col.z, (0.9725), t * t);
    gl_FragColor = col;
}