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
uniform vec3 circleColors[19];
uniform vec4 selectedCircle; // [x, y, radius, circleIndex]

#define sqrt3 (1.7321)

float circle(vec2 uv, vec3 circlePosAndRadius)
{
    return (1. - smoothstep(circlePosAndRadius.z, circlePosAndRadius.z + 0.01, length(uv - circlePosAndRadius.xy)));
}
void main()
{
    vec2 uv = 2. * ( gl_FragCoord.xy -.5 * resolution.xy ) / resolution.y;

    float circleMask = 0.;
    vec3 col = vec3(0.);
    for(int i = 0; i < 19; i++)
    {
        float circ = circle(uv, circlePositions[i]);
        circleMask += circ;
        vec3 tmpCol = circ * circleColors[i];
        col += tmpCol;
    }

    float selectionMask = circle(uv, selectedCircle.xyz) * (1. - circle(uv, circlePositions[int(selectedCircle.w)]));
    col += selectionMask * vec3(.9, .8, .2) + selectionMask * abs(sin(1.8 * time)) * vec3(.45, .4, .1);
    circleMask += selectionMask;

    col += (0.5 + uv.xyx * vec3(0.2 * cos(time), 0.4 * cos(time), 0.3 * sin(time)))* (1. - circleMask);;
    fragColor = vec4(col,1.0);
}
`
