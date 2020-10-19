var gridVS = `#version 300 es

precision highp float;

layout (location=0) in vec3 vertexPos;
layout (location=1) in vec3 vertexTex;
layout (location=2) in vec3 vertexNormal;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main()
{
    gl_Position = projection * view * model * vec4(vertexPos, 1.0);
}
`

var gridFS = `#version 300 es

precision highp float;

out vec4 fragColor;

uniform float time;
uniform vec2 resolution;

void main()
{
    //vec2 uv = 2. * ( gl_FragCoord.xy -.5 * resolution.xy ) / resolution.y;

    vec3 col = vec3(0.);

    fragColor = vec4(col,1.0);
}
`
