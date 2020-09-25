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
in vec4 v_Color;
in vec3 v_Normal;

out vec4 fragColor;

uniform float time;
uniform vec2 resolution;

void main()
{
    vec2 uv = 2. * ( gl_FragCoord.xy -.5 * resolution.xy ) / resolution.y;
    
    vec3 objectColor = vec3(.694, .612, .851);
    vec3 to_light;
    vec3 vertex_normal;
    vec3 lightColor = vec3(0.7) * sin(time);

    // Calculate a vector from the fragment location to the light source
    to_light = vec3(0., 10., 0.) - v_Vertex;
    to_light = normalize( to_light );

    // The vertex's normal vector is being interpolated across the primitive
    // which can make it un-normalized. So normalize the vertex's normal vector.
    vertex_normal = normalize( v_Normal );

    // Calculate the cosine of the angle between the vertex's normal vector
    // and the vector going to the light.
    float angle = dot(vertex_normal, to_light);
    angle = clamp(angle, 0.0, 1.0);
    vec3 diffuse = angle * lightColor;
    // ambient
    vec3 ambient = vec3(0.9) * objectColor;

    // specular
    vec3 to_camera = -1.0 * v_Vertex;
    vec3 reflection = 2.0 * dot(vertex_normal,to_light) * vertex_normal - to_light;
    float cos_angle = dot(reflection, to_camera);
    cos_angle = clamp(cos_angle, 0.0, 1.0);
    cos_angle = pow(cos_angle, 32.);
    vec3 specular = cos_angle *  0.1 * lightColor; // white light

    vec3 col = objectColor * ( diffuse + ambient + specular);
    fragColor = vec4(col,1.0);
}
`
