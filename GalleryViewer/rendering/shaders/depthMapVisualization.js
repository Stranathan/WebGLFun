var depthMapVisualizationVS = `#version 300 es

precision highp float;

layout (location=0) in vec3 vertexPos;
layout (location=1) in vec3 vertexTex;
layout (location=2) in vec3 vertexNormal;

void main()
{
    gl_Position = vec4(vertexPos, 1.0);
}
`

var depthMapVisualizationFS = `#version 300 es

precision highp float;

out vec4 fragColor;

uniform vec2 resolution;

uniform sampler2D shadowMap;

void main()
{
    vec2 uv = 2. * ( gl_FragCoord.xy -.5 * resolution.xy ) / resolution.y;
    float val = texture(shadowMap, uv).r;
    vec3 col = vec3(val);
    fragColor = vec4(col,1.0);
}
`
