var teapotVS = `#version 300 es

precision highp float;

layout (location=0) in vec3 vertexPos;
layout (location=1) in vec3 vertexTex;
layout (location=2) in vec3 vertexNormal;

out vec3 v_Vertex;
out vec3 v_Normal;
out vec3 FragPos;
out vec4 FragPosLightSpace;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform mat4 lightVP;

void main()
{
    v_Normal = vec3( view * model * vec4(vertexNormal, 0.0) );

    v_Vertex = vec3( view * model * vec4(vertexPos, 1.0) );

    // fragment position in world space
    FragPos = vec3(model * vec4(vertexPos, 1.0));
    // fragment position in light "camera" space
    FragPosLightSpace = lightVP * vec4(FragPos, 1.0);

    gl_Position = projection * view * model * vec4(vertexPos, 1.0);
}
`

var teapotFS = `#version 300 es

precision highp float;

in vec3 v_Vertex;
in vec3 v_Normal;
in vec3 FragPos;
in vec4 FragPosLightSpace;

out vec4 fragColor;

uniform float time;
uniform vec2 resolution;
uniform vec3 lightPos;

uniform sampler2D shadowMap;

float ShadowCalculation(vec4 fragPosLightSpace, vec3 lightDir, vec3 normal)
{
    // perform perspective divide
    vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
    // transform to [0,1] range
    projCoords = projCoords * 0.5 + 0.5;
    // get closest depth value from light's perspective (using [0,1] range fragPosLight as coords)
    float closestDepth = texture(shadowMap, projCoords.xy).r; 
    // get depth of current fragment from light's perspective
    float currentDepth = projCoords.z;
    // check whether current frag pos is in shadow
    
    float bias = max(0.05 * (1.0 - dot(normal, lightDir)), 0.005);

    //float shadow = currentDepth - bias > closestDepth  ? 1.0 : 0.0;
    float shadow = 0.0;
    vec2 texelSize = vec2(1. / 1024., 1. / 1024.); // textureSize(shadowMap, 0);
    for(int x = -1; x <= 1; ++x)
    {
        float xx = float(x);
        for(int y = -1; y <= 1; ++y)
        {
            float yy = float(y);
            float pcfDepth = texture(shadowMap, projCoords.xy + (vec2(xx, yy) * texelSize)).r; 
            shadow += currentDepth - bias > pcfDepth  ? 1.0 : 0.0;        
        }    
    }
    shadow /= 9.0;

    if(projCoords.z > 1.0)
        shadow = 0.0;

    return shadow;
}

void main()
{
    //vec2 uv = 2. * ( gl_FragCoord.xy -.5 * resolution.xy ) / resolution.y;
    
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
    
    float shadow = ShadowCalculation(FragPosLightSpace, lightDir, norm);                      
    vec3 col = (ambient + (diffuse + specular) * (1.0 - shadow)) * objectColor;

    fragColor = vec4(col,1.0);
}
`
