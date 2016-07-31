//vertex shader

attribute vec3 aVertexPosition;
attribute vec2 aUV;
attribute vec3 aNormalPosition;

uniform mat4 uPMatrix;
uniform mat4 uMMatrix;
uniform mat4 uVMatrix;

varying vec2 vUV;
varying vec3 vNormalPosition;
varying vec3 vView;

void main(void){
gl_Position = uPMatrix*uVMatrix*uMMatrix* vec4(aVertexPosition,1.0);
vNormalPosition = vec3(uMMatrix*vec4(aNormalPosition, 0.0));
vView = vec3(uVMatrix*uMMatrix*vec4(aVertexPosition,1.0));
vUV = aUV;
}
