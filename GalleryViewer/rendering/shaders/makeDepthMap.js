var depthMapVS = `#version 300 es

precision highp float;

layout (location=0) in vec3 vertexPos;
layout (location=1) in vec3 vertexTex;
layout (location=2) in vec3 vertexNormal;

uniform mat4 lightVP;
uniform mat4 model;

void main()
{
    gl_Position = lightVP * model * vec4(vertexPos, 1.0);
}
`

var depthMapFS = `#version 300 es

precision highp float;

#define BIAS (0.005)

void main()
{
    gl_FragDepth = gl_FragCoord.z;
    // gl_FragDepth = gl_FragCoord.z;
    // gl_FragDepth += gl_FrontFacing ? BIAS : 0.0;
}
`