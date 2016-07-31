//vertex shader

attribute vec3 aVertexPosition;
attribute vec2 aUV;

uniform mat4 uPMatrix;
uniform mat4 uMMatrix;
uniform mat4 uVMatrix;

uniform mat4 uPMatrixVideo;
uniform mat3 uMMatrixInvRot;
uniform mat4 uVMatrixVideo;
uniform float uSprite;

uniform vec3 uParticlePosition;
uniform float uScaleParticle;

varying vec2 vUV;
varying vec2 vUVSmoke;

void main(void){
//vec3 pos = uParticlePosition+(aVertexPosition*uScaleParticle);
vec4 clipPosition = uPMatrix*(uVMatrix*uMMatrix*vec4(uParticlePosition,1.0)+uScaleParticle*vec4(aVertexPosition,0.0));



gl_Position = clipPosition;

vec4 clipPositionVideo = uPMatrixVideo* uVMatrixVideo*vec4(uParticlePosition+uMMatrixInvRot*uScaleParticle*aVertexPosition,1.0);

//vUV = aUV;
vUV = 0.5*clipPositionVideo.xy/clipPositionVideo.w+vec2(0.5,0.5); // project video as if its from the camera
vUVSmoke = (aUV +vec2(uSprite, 0.0))/vec2(15.0,1.0); ;

}
