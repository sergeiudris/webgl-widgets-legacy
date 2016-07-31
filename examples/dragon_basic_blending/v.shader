attribute vec2 aVertexPosition;

varying vec2 vUV;

void main(void) {
gl_Position = vec4(aVertexPosition, 1., 1.);
vUV=0.5*(aVertexPosition+vec2(1.,1.)); 
}