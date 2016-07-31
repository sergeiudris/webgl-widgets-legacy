//vertex shader

attribute vec3 aVertexPosition;
attribute vec2 aUV;

uniform mat4 uPMatrix;
uniform mat4 uMMatrix;
uniform mat4 uVMatrix;

varying vec2 vUV;

void main(void){

gl_PointSize = 1.0; // default point size is 0 so pint are not visible
   
gl_Position = uPMatrix*uVMatrix*uMMatrix* vec4(aVertexPosition,1.0);
vUV = aUV;
}
