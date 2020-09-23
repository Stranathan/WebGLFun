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
    
    vec3 to_light;
    vec3 vertex_normal;
    float cos_angle;

    // Calculate a vector from the fragment location to the light source
    to_light = vec3(0., 10., 0.) - v_Vertex;
    to_light = normalize( to_light );

    // The vertex's normal vector is being interpolated across the primitive
    // which can make it un-normalized. So normalize the vertex's normal vector.
    vertex_normal = normalize( v_Normal );

    // Calculate the cosine of the angle between the vertex's normal vector
    // and the vector going to the light.
    cos_angle = dot(vertex_normal, to_light);
    cos_angle = clamp(cos_angle, 0.0, 1.0);

    vec3 col = vec3(1., 0., 0.2) * cos_angle;
    fragColor = vec4(col,1.0);
}
`
