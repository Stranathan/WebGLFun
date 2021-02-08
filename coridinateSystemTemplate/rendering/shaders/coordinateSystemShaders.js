var coordinateSystemShadersVS = `#version 300 es

precision highp float;

layout (location=0) in vec3 vertexPos;
layout (location=1) in mat4 model;

void main()
{
    gl_Position = model * vec4(vertexPos, 1.0);
}
`

var coordinateSystemShadersFS = `#version 300 es

precision highp float;

out vec4 fragColor;

uniform vec2 resolution;
uniform float time;

void main()
{
    vec3 col = vec3(1., 0.1, 0.9);
    fragColor = vec4(col, 1.);
}`