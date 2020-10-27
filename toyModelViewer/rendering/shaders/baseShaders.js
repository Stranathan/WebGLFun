var baseVS = `#version 300 es

precision highp float;

layout (location=0) in vec3 vertexPos;
layout (location=1) in vec3 vertexTex;
layout (location=2) in vec3 vertexNormal;

out vec3 FragPos;
out vec3 Normal;
out vec2 TexCoords;
out vec4 FragPosLightSpace;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
uniform mat4 lightVP;

void main()
{
    FragPos = vec3(model * vec4(vertexPos, 1.0));
    Normal = transpose(inverse(mat3(model))) * vertexNormal;
    FragPosLightSpace = lightVP * vec4(FragPos, 1.0);
    gl_Position = projection * view * model * vec4(vertexPos, 1.0);
}
`

var baseFS = `#version 300 es

precision highp float;

out vec4 FragColor;

in vec3 FragPos;
in vec3 Normal;
in vec2 TexCoords;
in vec4 FragPosLightSpace;

uniform sampler2D shadowMap;

uniform vec3 lightPos;
uniform vec3 viewPos;

float ShadowCalculation(vec4 fragPosLightSpace)
{
    // perform perspective divide
    vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;

    // transform to [0,1] range
    projCoords = projCoords * 0.5 + 0.5;

    // get closest depth value from light's perspective (using [0,1] range fragPosLight as coords)
    float closestDepth = texture(shadowMap, projCoords.xy).r; 

    // get depth of current fragment from light's perspective
    float currentDepth = projCoords.z;

    // calculate bias (based on depth map resolution and slope)
    vec3 normal = normalize(Normal);

    vec3 lightDir = normalize(lightPos - FragPos);

    //float bias = max(0.05 * (1.0 - dot(normal, lightDir)), 0.005);
    // opengl-tutorial.org
    // float cosTheta = clamp(dot(normal, lightDir), 0., 1.);
    // float bias = 0.004*tan(acos(cosTheta)); // cosTheta is dot( n,l ), clamped between 0 and 1
    // bias = clamp(bias, 0. , 0.01);
    float bias = 0.01;

    // check whether current frag pos is in shadow
    // float shadow = currentDepth - bias > closestDepth  ? 1.0 : 0.0;
    // PCF
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
    
    // keep the shadow at 0.0 when outside the far_plane region of the light's frustum.
    if(projCoords.z > 1.0)
        shadow = 0.0;
        
    return shadow;
}

void main()
{           
    vec3 normal = normalize(Normal);

    vec3 objectColor = vec3(.9, .92, .91); 

    vec3 lightColor = vec3(0.9);

    vec3 ambient = 0.2 * lightColor;

    // diffuse
    vec3 lightDir = normalize(lightPos - FragPos);
    float diff = max(dot(lightDir, normal), 0.0);
    vec3 diffuse = diff * lightColor;

    // calculate shadow
    float shadow = ShadowCalculation(FragPosLightSpace);                      
    vec3 lighting = (ambient + (1.0 - shadow) * diffuse) * objectColor;    
    
    FragColor = vec4(lighting, 1.0);
}
`
