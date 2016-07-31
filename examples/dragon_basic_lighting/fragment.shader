//fragment shader

precision mediump float;

uniform sampler2D uSampler;


varying vec2 vUV;
varying vec3 vNormalPosition;
varying vec3 vView;

const vec3 sourceAmbientColor = vec3(1.0,1.0,1.0);
const vec3 sourceDiffuseColor = vec3(1.0,2.0,4.0);
const vec3 sourceSpecularColor = vec3(1.0,1.0,1.0);
const vec3 sourceDirection = vec3(0.0,0.0,1.0);

const vec3 materialAmbientColor = vec3(0.3,0.3,0.3);
const vec3 materialDiffuseColor = vec3(1.0,1.0,1.0);
const vec3 materialSpecularColor = vec3(1.0,1.0,1.0);
const float materialShininess = 10.0;


void main(void){

vec3 color = vec3(texture2D(uSampler, vUV));
vec3 V = normalize(vView);
vec3 R = reflect(sourceDirection,vNormalPosition);


vec3 I_ambient  = sourceAmbientColor*materialAmbientColor;
vec3 I_diffuse = sourceDiffuseColor*materialDiffuseColor*max(0.0,dot(vNormalPosition,sourceDirection));
vec3 I_specular  = sourceSpecularColor*materialSpecularColor*pow(max(dot(R,V),0.0),materialShininess);

vec3 I = I_ambient+I_diffuse+I_specular;

gl_FragColor = vec4(I*color, 1.0);
}