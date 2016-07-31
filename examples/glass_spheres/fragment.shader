//fragment shader

precision mediump float;

uniform sampler2D uSampler;
uniform vec3 uCameraFrag;
uniform float uHighlight; // get a highlight coefficient, used when sphere is picked
uniform float uViewingCoeffFS; // get the transition coeff

varying vec2 vUV;
varying vec3 vNormal;
varying float vFog; // get the fog  attenuation from vertex shader

const vec3 LIGHT = vec3(0.0,1.0,0.0); //directional light direction

void main(void){
vec4 videoColor = texture2D(uSampler, vUV);

float I = 1.0; //ambient light

vec3 R = normalize(reflect(LIGHT,vNormal)); //reflected ray
I+= max(0.001, pow(dot(R,1.2*normalize(uCameraFrag)), 16.0 ));//specular lighting

I*= 1.0 - pow(1.0 - vNormal.z,2.0); // add black border

I*=vFog; // apply the fog attenuation
I*=uHighlight; // apply the picking highlight coefficient

//gl_FragColor = vec4(videoColor.xyz*I,1.0);


gl_FragColor = vec4(videoColor.xyz* mix(I,1.0,uViewingCoeffFS ),1.0 );

}