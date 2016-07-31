//vertex shader

attribute vec3 aVertexPosition;
attribute vec2 aUV;

uniform mat4 uPMatrix;
uniform mat4 uMMatrix;
uniform mat4 uVMatrix;

uniform vec3 uCamera;
uniform float uViewingCoeffVS; // get the transition coeff
uniform float uAspectRatio; // video aspect ration  = width/ height


varying vec3 vNormal; // give a normal vector to the fragment shader
varying vec2 vUV;
varying float vFog; 

void main(void){

vec4 scenePosition = uMMatrix*vec4(aVertexPosition, 1.0);
vec4 sceneNormal = uMMatrix* vec4(aVertexPosition, 0.0);

vec3 incident = normalize(scenePosition.xyz+uCamera);// incident unit vector
vec3 refracted = refract(incident, sceneNormal.xyz, 1.0/2.4); //refracted unit vector


//compute the x,y of hte intersection I of( point, refracted) with plane Z = 0

//float k = - scenePosition.z/refracted.z; // k so that (scenePosition + k.refracted).y = 0
//vec2 I = scenePosition.xy+ k*refracted.xy;

//after multiple sphere s\centres don't match with the origin, so we replace scenePosition by scenePosition-center = sceneNormal
float k = - sceneNormal.z/refracted.z; // k so that (scenePosition + k.refracted).y = 0
vec2 I = sceneNormal.xy+ k*refracted.xy;

vec4 viewPosition  = uVMatrix*scenePosition; // position in the view coordinate system
//gl_Position =uPMatrix*viewPosition; //uPMatrix*uVMatrix*scenePosition;
//vUV = I+vec2(0.5,0.5);

//here we add stuff to mix 3d and 2d uv
vec4 screenPosition = vec4(aUV - vec2(0.5,0.5),0.0,1.0);
screenPosition.y*=uAspectRatio;
gl_Position = mix(uPMatrix*viewPosition,screenPosition, uViewingCoeffVS);  //uPMatrix*uVMatrix*scenePosition;
vUV = mix(I+vec2(0.5,0.5),aUV, uViewingCoeffVS);
//end that block
vNormal = vec3(uVMatrix*sceneNormal); //compute the normal vector int he view coordinate system
vFog = 1.0 - smoothstep(2.0, 18.0, - viewPosition.z); // compute fog
}
