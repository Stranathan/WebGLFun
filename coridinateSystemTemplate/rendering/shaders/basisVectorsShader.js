var basisVectorsVS = `#version 300 es

precision highp float;

layout (location=0) in vec3 vertexPos;
layout (location=2) in vec3 aColor;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

out vec3 theCol;

void main()
{
    gl_Position = projection * view * model * vec4(vertexPos, 1.0);
    theCol = aColor;
}
`

var basisVectorsFS = `#version 300 es

precision highp float;

in vec3 theCol;
out vec4 fragColor;

uniform vec2 resolution;
uniform float time;

void main()
{
    vec3 col = theCol;
    //vec3 col = vec3(1., 0., 1.);
    fragColor = vec4(col, 0.7);
}`