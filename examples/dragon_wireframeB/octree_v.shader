attribute vec3 aVertexPosition;

uniform mat4 uPMatrix, uVMatrix, uMMatrix;
uniform vec3 uSizeCell, uCenterCell;

void main(void) { 
gl_Position = uPMatrix*uVMatrix*uMMatrix*vec4(uCenterCell+(aVertexPosition*uSizeCell), 1.0);
}