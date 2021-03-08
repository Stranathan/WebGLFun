var axisLinesVS = `#version 300 es

precision highp float;

layout (location=0) in vec3 vertexPos;
layout (location=2) in vec3 color;
layout (location=3) in mat4 model;

out vec3 v_Col;

uniform mat4 view;
uniform mat4 projection;

void main()
{
    v_Col = color;
    gl_Position = projection * view * model * vec4(vertexPos, 1.0);
}
`

var axisLinesFS = `#version 300 es

precision highp float;

in vec3 v_Col;
out vec4 fragColor;

uniform vec2 resolution;
uniform float time;

void main()
{
    //vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
    vec3 col = v_Col;
    fragColor = vec4(col, 0.9);
}`