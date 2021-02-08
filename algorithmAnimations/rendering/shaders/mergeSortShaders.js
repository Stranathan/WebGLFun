var mergeSortVS = `#version 300 es

precision highp float;

layout (location=0) in vec3 vertexPos;

uniform mat4 model;

void main()
{
    gl_Position = model * vec4(vertexPos, 1.0);
}
`

var mergeSortFS = `#version 300 es

precision highp float;

out vec4 fragColor;

uniform vec2 resolution;
uniform float time;
uniform float radCol;

void main()
{
    vec3 col = vec3(0.37 * radCol , 0.44 * radCol, 0.95 *radCol);
    fragColor = vec4(col, 1.);
}`