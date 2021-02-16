var circlesVS = `#version 300 es

precision highp float;

layout (location=0) in vec3 vertexPos;
layout (location=1) in mat4 model;

uniform mat4 view;
uniform mat4 projection;

void main()
{
    gl_Position = projection * view * model * vec4(vertexPos, 1.0);
}
`

var circlesFS = `#version 300 es

precision highp float;

out vec4 fragColor;

// uniform vec2 resolution;
// uniform float time;

void main()
{
    vec3 col = vec3(0.9, 0.1, 0.9);
    fragColor = vec4(col, 1.);
}`