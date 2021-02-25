var rubicksVS = `#version 300 es

precision highp float;

layout (location=0) in vec3 vertexPos;
layout (location=1) in vec3 vertexNormal;
layout (location=2) in vec4 vertexColor;

out vec4 v_Col;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main()
{
    v_Col = vertexColor / 255.;
    gl_Position = projection * view * model * vec4(vertexPos, 1.0);
}
`

var rubicksFS = `#version 300 es

precision highp float;

in vec4 v_Col;
out vec4 fragColor;

uniform vec2 resolution;
uniform float time;

void main()
{
    //vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
    fragColor = vec4(v_Col.xyz, 1.0);
}`