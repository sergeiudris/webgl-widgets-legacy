//fragment shader

precision mediump float;


varying vec3 vVL;
varying vec3 vColor;

void main(void){
gl_FragColor = vec4(vVL*vColor, 1.0);
}