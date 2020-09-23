var rubiksCubeFirstPassVert = `#version 300 es
precision mediump int;
precision mediump float;
//
in vec3 aPos;
in vec3 vertCol;
in vec3 vertNorm;
//
out vec3 passedVertPos;
out vec3 passedVertCol;
out vec3 passedVertNorm;
//
uniform float iTime;
uniform vec2 iResolution;

// Light model
uniform vec3 lightPos;
//uniform vec3 lightCol;
//uniform float u_Shininess;

// transformation matrices
uniform mat4 view;
uniform mat4 projection;
uniform mat4 model;

void main()
{
  vec3 fragCoord = aPos;
  passedVertPos = vec3(view * vec4(aPos, 1.0));
  passedVertNorm = vec3(view * model * vec4(vertNorm, 0.0));
  passedVertCol = vertCol;
  gl_Position =  projection * view * model * vec4(fragCoord, 1);
}
`;

var rubiksCubeFirstPassFrag = `#version 300 es
precision mediump float;
//
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;
//
uniform vec3 lightPos;
//
in vec3 passedVertPos;
in vec3 passedVertCol;
in vec3 passedVertNorm;
//
out vec4 fragColor;

void main()
{
  vec3 to_light;
  vec3 vertex_normal;
  vec3 reflection;
  vec3 to_camera;
  float cos_angle;
  vec3 specular_color;
  vec3 object_color;
  vec3 col;

  // Calculate a vector from the fragment location to the light source
  to_light = lightPos - passedVertPos;
  to_light = normalize(to_light);

  // The vertex's normal vector is being interpolated across the primitive
  // which can make it un-normalized. So normalize the vertex's normal vector.
  vertex_normal = normalize(passedVertNorm);

  // Calculate the reflection vector
  reflection = 2.0 * dot(vertex_normal, to_light) * vertex_normal - to_light;

  // Calculate a vector from the fragment location to the camera.
  // The camera is at the origin, so negating the vertex location gives the vector
  to_camera = -1.0 * passedVertPos;

  // Calculate the cosine of the angle between the reflection vector
  // and the vector going to the camera.
  reflection = normalize(reflection);
  to_camera = normalize(to_camera);
  cos_angle = dot(reflection, to_camera);
  cos_angle = clamp(cos_angle, 0.0, 1.0);
  cos_angle = pow(cos_angle, 10.);

  // If this fragment gets a specular reflection, use the light's color,
  // otherwise use the objects's color
  specular_color = vec3(1.) * cos_angle;
  object_color = passedVertCol * (1.0 - cos_angle);

  col = specular_color + object_color;
  //col = passedVertCol;
  fragColor = vec4(col, 1.);
}`
var rubiksCubeSecondPassVert = `#version 300 es
    precision highp float;
    //
    in vec3 aPos;
    in vec2 aTexCoords;
    //
    out vec2 TexCoords;
    //
    uniform float time;
    uniform vec2 resolution;
    uniform vec2 mouse;

    void main()
    {
      TexCoords = aTexCoords;
      gl_Position =  vec4(aPos, 1.0);
    }
`;
var rubiksCubeSecondPassFrag = `#version 300 es
    precision highp float;
    //
    uniform float time;
    uniform vec2 resolution;
    uniform vec2 mouse;
    uniform sampler2D screenTexture;
    //
    in vec2 TexCoords;
    //
    out vec4 fragColor;

    float when_gt(float x, float y) 
    {
      return max(sign(x - y), 0.0);
    }
    float when_lt(float x, float y)
    {
      return max(sign(y - x), 0.0);
    }
    /*** Sobel kernels ***/
    // Note: GLSL's mat3 is COLUMN-major ->  mat3[col][row]
    mat3 sobelX = mat3(-1.0, -2.0, -1.0,
                        0.0,  0.0, 0.0,
                        1.0,  2.0,  1.0);
    mat3 sobelY = mat3(-1.0,  0.0,  1.0,
                        -2.0,  0.0, 2.0,
                        -1.0,  0.0,  1.0);
    void main()
    {
      vec2 uv = gl_FragCoord.xy / resolution.xy;
      vec3 col;

      float sumX = 0.0;	
      float sumY = 0.0;
      
      // grey scale & sobel filter
      for(int i = -1; i <= 1; i++)
      {
          for(int j = -1; j <= 1; j++)
          {
              float x = uv.x + float(i)/resolution.x;
              float y = uv.y + float(j)/resolution.y;
              vec3 samp = texture(screenTexture, vec2(x, y)).xyz;
              vec3 greySamp = vec3(dot(samp, vec3(0.2126, 0.7152, 0.0722))); // ratios from wikipedia
              float lenSamp = length(greySamp);

              // convolve kernels with sample
              sumX += lenSamp * float(sobelX[1+i][1+j]);
              sumY += lenSamp * float(sobelY[1+i][1+j]);
          }
      }
      float g = sqrt((sumX*sumX) + (sumY*sumY));
      col = when_lt(g, 1.) * texture(screenTexture, TexCoords).xyz;
      
      vec3 colSave = col;
      //col = (g > 1. ? vec3(0.) : meanCol);

      // mean blur
      // for(int ii = -1; ii <= 1; ii++)
      // {
      //     for(int jj = -1; jj <= 1; jj++)
      //     {
      //         float x = uv.x + float(ii)/resolution.x;
      //         float y = uv.y + float(jj)/resolution.y;
      //         vec3 samp = texture( screenTexture, vec2(x, y) ).xyz;
      //         col += samp;
      //     }
      // }

  	  fragColor = vec4(col, 1.0);
    }
`;

var rubiksCubeSecondPassFrag2 = `#version 300 es
    precision highp float;
    //
    uniform float time;
    uniform vec2 resolution;
    uniform vec2 mouse;
    uniform sampler2D screenTexture;
    //
    in vec2 TexCoords;
    //
    out vec4 fragColor;
    //
    float d;
    //
    float lookup(vec2 p, float dx, float dy)
    {
        vec2 uv = (p.xy + vec2(dx * d, dy * d)) / resolution.xy;
        vec4 c = texture(screenTexture, uv.xy);
      
      // return as luma
        return 0.2126*c.r + 0.7152*c.g + 0.0722*c.b;
    }
    //
    void main()
    {
      d = 1.;//sin(time * 5.0)*0.5 + 1.5; // kernel offset
      vec2 p = gl_FragCoord.xy;
    
      // simple sobel edge detection
      float gx = 0.0;
      gx += -1.0 * lookup(p, -1.0, -1.0);
      gx += -2.0 * lookup(p, -1.0,  0.0);
      gx += -1.0 * lookup(p, -1.0,  1.0);
      gx +=  1.0 * lookup(p,  1.0, -1.0);
      gx +=  2.0 * lookup(p,  1.0,  0.0);
      gx +=  1.0 * lookup(p,  1.0,  1.0);
      
      float gy = 0.0;
      gy += -1.0 * lookup(p, -1.0, -1.0);
      gy += -2.0 * lookup(p,  0.0, -1.0);
      gy += -1.0 * lookup(p,  1.0, -1.0);
      gy +=  1.0 * lookup(p, -1.0,  1.0);
      gy +=  2.0 * lookup(p,  0.0,  1.0);
      gy +=  1.0 * lookup(p,  1.0,  1.0);
      
      // hack: use g^2 to conceal noise in the video
      float g = gx*gx + gy*gy;
      //float g2 = g * (sin(time) / 2.0 + 0.5);
      
      vec3 col = texture(screenTexture, p / resolution.xy).xyz;
      col += vec3(-g, -g, -g);
      
      fragColor = vec4(col, 1.0);
    }
`;