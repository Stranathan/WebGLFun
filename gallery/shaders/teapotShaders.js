var teapotShadersVS = `#version 300 es

precision highp float;

in vec3 vertexPos;

// transformation matrices
uniform mat4 view;
uniform mat4 projection;
uniform mat4 model;

void main()
{
    gl_Position = projection * view * model * vec4(vertexPos, 1.0);
}
`
var teapotShadersFS = `#version 300 es

precision highp float;

out vec4 fragColor;

uniform float time;
uniform vec2 resolution;

void main()
{
    vec2 uv = 2. * ( gl_FragCoord.xy -.5 * resolution.xy ) / resolution.y;
    vec3 col = vec3(1., 0., 0.);
    fragColor = vec4(col,1.0);
}
`
