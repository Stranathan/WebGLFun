var farbenVS = `#version 300 es

precision highp float;

in vec3 vertexPos;

void main() 
{
    gl_Position = vec4(vertexPos, 1.0);
}
`
var farbenFS = `#version 300 es

precision highp float;

out vec4 fragColor;

uniform float time;
uniform vec2 resolution;
uniform vec3 circlePositions[19];

#define sqrt3 (1.7321)

float circle(vec2 uv, vec3 circlePosAndRadius)
{
    return (1. - smoothstep(circlePosAndRadius.z, circlePosAndRadius.z + 0.01, length(uv - circlePosAndRadius.xy)));
}
void main() 
{
    vec2 uv = 2. * ( gl_FragCoord.xy -.5*resolution.xy ) / resolution.y;
    
    float circles = 0.;
    for(int i = 0; i < 19; i++)
    {
        float circ = circle(uv, circlePositions[i]);
        circles += circ;
    }
    vec3 col = (0.5 + 0.5*cos(time+uv.xyx+vec3(0,2,4))) * circles;
    fragColor = vec4(col,1.0);
}
`