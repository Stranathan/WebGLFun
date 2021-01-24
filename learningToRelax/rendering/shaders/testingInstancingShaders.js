var testingInstancingVS = `#version 300 es

precision highp float;

layout (location=0) in vec3 vertexPos;
layout (location=1) in vec3 vertexTexCoord;
layout (location=2) in vec3 vertexNormal;
layout (location=3) in vec3 vertexColor;
layout (location=4) in vec3 instanceModelMatrix;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

out vec3 v_Vertex;
out vec3 v_Normal;

void main()
{
    v_Vertex = vec3( view * model * vec4(vertexPos, 1.0) );
    v_Normal = vec3( view * model * vec4(vertexPos, 0.0) );
    gl_Position = projection * view * model * vec4(vertexPos, 1.0);
}
`

var testingInstancingFS = `#version 300 es

precision highp float;

out vec4 FragColor;
in vec3 v_Normal;
in vec3 v_Vertex;

void main()
{
    vec3 lightPos = vec3(5.0, 5.0, 20.0);
    vec3 to_light = lightPos - v_Vertex;
    to_light = normalize(to_light);
    vec3 vertex_normal = normalize( v_Normal );
    float cos_angle = dot(vertex_normal, to_light);
    cos_angle = clamp(cos_angle, 0.0, 1.0);
    vec3 col = vec3(1., 0.5, 0.3) * cos_angle;
    FragColor = vec4(col, 1.0);
}
`

const vertexShaderSource = `#version 300 es

layout (location=0) in vec3 vertexPos;
layout (location=1) in vec3 vertexTexCoord;
layout (location=2) in vec3 vertexNormal;
layout (location=3) in vec4 vertexColor;
layout (location=4) in mat4 matrix;

out vec4 v_color;

uniform mat4 view;
uniform mat4 projection;

void main()
{
  gl_Position = projection * view * matrix * vec4(vertexPos, 1.0);
  v_color = vertexColor;
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;

in vec4 v_color;

out vec4 fragColor;

void main() {
  fragColor = v_color;
}
`;

const vertexShaderSourceOneAndHalf = `#version 300 es

layout (location=0) in vec3 vertexPos;
layout (location=1) in vec3 vertexTexCoord;
layout (location=2) in vec3 vertexNormal;
layout (location=3) in vec4 vertexColor;
layout (location=4) in mat4 matrix;

out vec4 v_Color;
out vec3 v_Normal;
out vec3 v_Vertex;

uniform mat4 view;
uniform mat4 projection;

void main()
{
	gl_Position = projection * view * matrix * vec4(vertexPos, 1.0);
	v_Vertex = vec3( view * matrix * vec4(vertexPos, 1.0) );
	v_Normal = vec3( view * matrix * vec4(vertexNormal, 0.0) );
	v_Color = vertexColor;
}
`;

const fragmentShaderSourceOneAndHalf = `#version 300 es
precision highp float;

in vec4 v_Color;
in vec3 v_Normal;
in vec3 v_Vertex;

out vec4 fragColor;

float when_gt(float x, float y)
{
	return max(sign(x - y), 0.0);
}

void main() {
	vec3 to_light;
	vec3 lightPos = vec3(10, 10, 10);
	vec3 vertex_normal;
	float cos_angle;

	to_light = lightPos - v_Vertex;
	to_light = normalize( to_light );

	vertex_normal = normalize( v_Normal );

	cos_angle = dot(vertex_normal, to_light);
	cos_angle = clamp(cos_angle, 0.0, 1.0);

	vec3 col = vec3(v_Color) * cos_angle + 0.05; // give it some min to stand out against the black

	float colLen = length(col);
	vec3 additiveCol = when_gt(colLen, 0.1) * vec3(v_Color);

	col += additiveCol;

	fragColor = vec4(col, 1.0);
}
`;