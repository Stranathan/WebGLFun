var screenQuadVS = `#version 300 es

precision highp float;

layout (location=0) in vec3 vertexPos;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main()
{
    gl_Position = vec4(vertexPos, 1.0);
}
`

var screenQuadFS = `#version 300 es

precision highp float;

out vec4 fragColor;

uniform vec2 resolution;
uniform float time;

void main()
{
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    //vec3 col = vec3(0.23, 0.52, 0.25) * len;
    vec3 col = vec3(0.);
    fragColor = vec4(col, 1.);
}`