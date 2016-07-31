//vertex shader

attribute vec3 aVertexPosition;
attribute vec2 aUV;
attribute vec3 aNormalPosition;

uniform mat4 uPMatrix;
uniform mat4 uMMatrix;
uniform mat4 uVMatrix;
uniform sampler2D uSampler;

varying vec3 vVL;
varying vec3 vColor;

const vec3 sourceAmbientColor = vec3(1.0,1.0,1.0);
const vec3 sourceDiffuseColor = vec3(1.0,2.0,4.0);
const vec3 sourceSpecularColor = vec3(1.0,1.0,1.0);
const vec3 sourceDirection = vec3(0.0,0.0,1.0);

const vec3 materialAmbientColor = vec3(0.3,0.3,0.3);
const vec3 materialDiffuseColor = vec3(1.0,1.0,1.0);
const vec3 materialSpecularColor = vec3(1.0,1.0,1.0);
const float materialShininess = 10.0;

void main(void){
gl_Position = uPMatrix*uVMatrix*uMMatrix* vec4(aVertexPosition,1.0);


vec3 normalPosition = vec3(uMMatrix*vec4(aNormalPosition, 0.0));
vec3 R = reflect(sourceDirection,normalPosition);
vec3 view = vec3(uVMatrix*uMMatrix*vec4(aVertexPosition,1.0));
vec3 V = normalize(view);


vec3 I_ambient  = sourceAmbientColor*materialAmbientColor;
vec3 I_diffuse = sourceDiffuseColor*materialDiffuseColor*max(0.0,dot(normalPosition,sourceDirection));
vec3 I_specular  = sourceSpecularColor*materialSpecularColor*pow(max(dot(R,V),0.0),materialShininess);

vColor = vec3(texture2D(uSampler, aUV));
vVL = I_ambient+I_diffuse+I_specular;

}
