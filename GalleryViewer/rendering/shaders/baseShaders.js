var baseVS = `#version 300 es

precision highp float;

in vec3 vertexPos;

uniform mat4 model;
uniform mat4 view;
uniform mat4 perspective;

void main()
{
    //gl_Position = perspective * view * model * vec4(vertexPos, 1.0);
    gl_Position = perspective * view * vec4(vertexPos, 1.0);
}
`

var baseFS = `#version 300 es

precision highp float;

out vec4 fragColor;

uniform float time;
uniform vec2 resolution;

void main()
{
    vec2 uv = 2. * ( gl_FragCoord.xy -.5 * resolution.xy ) / resolution.y;
    
    float len = length(uv);

    vec3 col = (0.5 + 0.5*cos(time+uv.xyx+vec3(0,2,4))) * 1. - smoothstep(0.4, 0.41, len);

    fragColor = vec4(col,1.0);
}
`
