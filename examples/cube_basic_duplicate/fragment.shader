//fragment shader

precision mediump float;

uniform float uGreyscality;



varying vec3 vColor;

void main(void){

float greyscaleValue = (vColor.r+vColor.g+vColor.b)/3.0;
vec3 greyscaleColor = vec3(greyscaleValue,greyscaleValue,greyscaleValue);

vec3 color = mix(greyscaleColor, vColor, uGreyscality);

gl_FragColor = vec4(color,1.0); 
}