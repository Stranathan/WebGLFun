var baseVS = `#version 300 es

precision highp float;

layout (location=0) in vec3 vertexPos;
layout (location=1) in vec3 vertexTex;
layout (location=2) in vec3 vertexNormal;

out vec3 v_Normal;
out vec3 v_Vertex;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main()
{
    gl_Position = projection * view * model * vec4(vertexPos, 1.0);

    v_Normal = vec3( view * model * vec4(vertexNormal, 0.0) );
    v_Vertex = vec3( view * model * vec4(vertexPos, 1.0) );
}
`

var baseFS = `#version 300 es

precision highp float;

in vec3 v_Vertex;
//in vec4 v_Color;
in vec3 v_Normal;

out vec4 fragColor;

uniform float time;
uniform vec2 resolution;
uniform vec3 lightPos;

void main()
{
    //vec2 uv = 2. * ( gl_FragCoord.xy -.5 * resolution.xy ) / resolution.y;

    vec3 objectColor = vec3(.9, .88, .95);
    vec3 lightColor = vec3(.95); // white light

    // ambient
    float ambientStrength = 0.7;
    vec3 ambient = ambientStrength * lightColor;
  	
    // diffuse 
    vec3 norm = normalize(v_Normal);
    vec3 lightDir = normalize(lightPos - v_Vertex);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = diff * lightColor;

    vec3 col = (ambient + diffuse) * objectColor;

    fragColor = vec4(col,1.0);
}
`
