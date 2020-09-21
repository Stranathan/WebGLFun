var backgroundShadersVS = `#version 300 es

precision highp float;

in vec3 vertexPos;

void main()
{
    gl_Position = vec4(vertexPos, 1.0);
}
`
var backgroundShadersFS = `#version 300 es

precision highp float;

out vec4 fragColor;

uniform float time;
uniform vec2 resolution;

void main()
{
    vec2 uv = 2. * ( gl_FragCoord.xy -.5 * resolution.xy ) / resolution.y;
    vec3 col = 0.2 * sin(2. * time) + 0.5 *cos(time+uv.xyx+vec3(0,2,4));
    fragColor = vec4(col,1.0);
}
`
