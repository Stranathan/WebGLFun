var backgroundGridVS = `#version 300 es

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

var backgroundGridFS = `#version 300 es

precision highp float;

out vec4 fragColor;

uniform vec2 resolution;
uniform float time;

uniform vec3 clearCol;
uniform float gridResMult;

#define DELTA (0.001)

float makeALine(float val, float delta, vec2 uv)
{
    return (smoothstep(val, val + delta, uv.x) - smoothstep(val + delta, val + 2. * DELTA, uv.x));
}
void main()
{
    vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;

    float xVal = 0.0;
    float lowerGridRes = floor(gridResMult);
    float  moddedX = abs( 0.5 - fract(lowerGridRes * (uv.x - 0.5)));
    float  moddedY = abs( 0.5 - fract(lowerGridRes * (uv.y - 0.5)));
    float theVerticalLines = smoothstep(0.47, 0.5, moddedX);
    float theHorizonatlLines = smoothstep(0.47, 0.5, moddedY);

    float higherGridRes = lowerGridRes * 2.0;
    float higherModdedX = abs( 0.5 - fract(higherGridRes * (uv.x - 0.5)));
    float higherModdedY = abs( 0.5 - fract(higherGridRes * (uv.y - 0.5)));
    float theTighterVerticalLines = smoothstep(0.482, 0.5, higherModdedX);
    float theTighterHorizonatlLines = smoothstep(0.482, 0.5, higherModdedY);

    

    float theGrid = clamp(
        theVerticalLines + theHorizonatlLines + theTighterVerticalLines + theTighterHorizonatlLines,
         0., 1.);
    vec3 col = vec3(0.16)* (1. - theGrid) + vec3(theGrid);
    fragColor = vec4(col, 0.8);
}`