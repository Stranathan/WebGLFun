var mergeSortAnimationShadersVS = `#version 300 es

precision highp float;

layout (location=0) in vec3 vertexPos;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

uniform vec2 resolution;

void main()
{
    vec3 pos = vertexPos;
    gl_Position = model * vec4(vertexPos, 1.0);
}
`

var mergeSortAnimationShadersFS = `#version 300 es

precision highp float;

out vec4 fragColor;

uniform vec2 resolution;
uniform float time;


void main()
{
    vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
    float len = length(uv);
    vec3 col = vec3(len);
    fragColor = vec4(col, 1.);
}`