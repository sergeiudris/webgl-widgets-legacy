//vertex shader
attribute vec3 aVertexPosition;
attribute vec4 aVertexColor;

varying vec3 vSurfacePosition;
varying vec4 vColor;

void main(void){
gl_Position = vec4(aVertexPosition,1.0);
vSurfacePosition = aVertexPosition;
vColor = aVertexColor;
}
