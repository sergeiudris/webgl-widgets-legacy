//fragment shader

precision mediump float;

uniform sampler2D uSampler;
uniform float uDensity;
uniform sampler2D uSamplerSmoke;

varying vec2 vUV;
varying vec2 vUVSmoke;

const vec4 SMOKECOLOR = vec4(1.0,1.0,1.0,1.0);

void main(void){


//vec4 result = texture2D(uSampler, vUV);
//gl_FragColor = result;


vec4 videoColor = texture2D(uSampler, vUV);

float mixCoeff = 1.0;
if(vUV.x >1.0 || vUV.x < 0.0 || vUV.y <0.0) mixCoeff = 0.0;


vec4 smokeColor = texture2D(uSamplerSmoke,vUVSmoke);
vec4 color = mix(SMOKECOLOR, videoColor,mixCoeff);
color.a = 0.2*smokeColor.a;
//gl_FragColor = vec4(videoColor.rgb, uDensity*0.2);
gl_FragColor = color;
}