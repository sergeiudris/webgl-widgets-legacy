//fragment shader

precision mediump float;

varying vec2 vUV;
uniform sampler2D uSampler;

void main(void){
vec4 color  = texture2D(uSampler, vUV);
gl_FragColor = vec4(color.rgb, 0.5);
}