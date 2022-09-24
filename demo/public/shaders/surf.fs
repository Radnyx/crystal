varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform int step;
uniform vec4 inputPixel;

float yPos(float t) {
	const float totalTime = 330.0;
	const float riseTime = totalTime - 105.0;
    if (t >= riseTime / totalTime) {
        float t2 = (t * totalTime - riseTime) / (totalTime - riseTime);
        return (-96.0 - 32.0) * (1.0 - t2);
    } else {
        float t2 = t / (riseTime / totalTime);
        return (-96.0 - 16.0) * t2 + sin(2.0 * 3.14159 * t2 * 2.9) * 16.0;
    }
}

void main(void) {
    vec2 uv = vec2(vTextureCoord.xy);
    float scaled = uv.y / 0.4;
    if (uv.y * 160.0 > 50.0 + 0.6 * yPos(float(step) / 330.0)) {
        uv.y += sin(2.0 * 3.14159 * 14.0 + float(step) / 8.0 +  uv.y * 64.0) * 0.005; 
        
    }
    vec4 col = texture2D(uSampler, uv);
    gl_FragColor = col;
}