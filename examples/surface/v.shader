attribute vec3 aVertexPosition;

uniform mat4 uPMatrix;
uniform mat4 uMMatrix;
uniform mat4 uVMatrix;

void main(void){
    gl_PointSize = 1.0; // default point size is 0 so pint are not visible
    gl_Position = uPMatrix*uVMatrix*uMMatrix* vec4(aVertexPosition,1.0); 
}