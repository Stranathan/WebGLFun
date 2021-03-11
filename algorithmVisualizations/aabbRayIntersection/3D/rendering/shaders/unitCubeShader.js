var unitCubeShaderVS = `#version 300 es

precision highp float;

layout (location=0) in vec3 vertexPos;
layout (location=1) in vec3 vertexNormal;
layout (location=2) in vec4 vertexColor;

out vec4 v_Col;
out vec3 v_Normal;
out vec3 v_Vertex;
out vec4 v_hitCol;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main()
{
    v_Col = vertexColor / 255.;
    v_Vertex = vec3( view * model * vec4(vertexPos, 1.0) );
    v_Normal = vec3( view * model * vec4(vertexNormal, 0.0) );
    gl_Position = projection * view * model * vec4(vertexPos, 1.0);
}
`

var unitCubeShaderFS = `#version 300 es

precision highp float;

in vec4 v_Col;
in vec3 v_Normal;
in vec3 v_Vertex;

out vec4 fragColor;

uniform vec2 resolution;
uniform float time;
uniform vec4 hitCol;
uniform vec3 lightPos;

float when_gt(float x, float y)
{
    return max(sign(x - y), 0.0);
}

void main()
{
    //vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
    vec3 to_light;
    vec3 vertex_normal;
    float cos_angle;
  
    to_light = lightPos - v_Vertex;
    to_light = normalize( to_light );
  
    // The vertex's normal vector is being interpolated across the primitive
    // which can make it un-normalized. So normalize the vertex's normal vector.
    vertex_normal = normalize( v_Normal );
  
    cos_angle = dot(vertex_normal, to_light);
    cos_angle = clamp(cos_angle, 0.0, 1.0);
    
    // when hit col's alpha is greater than some threshold, use hit col 
    float hitSwitch = when_gt(hitCol.w, 0.2);
    vec3 col = vec3(v_Col) * cos_angle * (1. - hitSwitch) + hitCol.xyz * hitSwitch;
    fragColor = vec4(col, 1.0);
}`