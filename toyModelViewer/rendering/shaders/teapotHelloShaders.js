var teapotHelloVS = `#version 300 es

precision highp float;

in vec3 vertexPos;
in vec3 vertexTex;
in vec3 vertexNormal;

out vec3 v_Vertex;
out vec3 v_Normal;

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

var teapotHelloFS = `#version 300 es

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
    vec3 objectColor = vec3(.694, .612, .851); // some purple
    vec3 lightColor = vec3(.9); // white light

    // ambient
    float ambientStrength = 0.25;
    vec3 ambient = ambientStrength * lightColor;
  	
    // diffuse 
    vec3 norm = normalize(v_Normal);
    vec3 lightDir = normalize(lightPos - v_Vertex);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = diff * lightColor;
    
    // specular
    float specularStrength = 0.5;
    vec3 viewDir = normalize(-1. * v_Vertex);
    vec3 reflectDir = reflect(-lightDir, norm);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.);
    vec3 specular = specularStrength * spec * lightColor;
        
    vec3 col = (ambient + diffuse + specular) * objectColor;

    fragColor = vec4(col,1.0);
}
`
