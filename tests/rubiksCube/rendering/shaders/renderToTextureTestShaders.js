var renderToTextureTestVert = `#version 300 es
    precision highp float;
    //
    in vec3 aPos;
    in vec3 vertCol;
    in vec3 vertNorm;
    //
    out vec3 passedVertPos;
    out vec3 passedVertCol;
    out vec3 passedVertNorm;
    //
    uniform float time;
    uniform vec2 resolution;

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

var renderToTextureTestFrag = `#version 300 es
    precision highp float;
    //
    uniform float time;
    uniform vec2 resolution;
    uniform vec2 mouse;
    uniform sampler2D texture;
    //
    in vec3 passedVertPos;
    in vec3 passedVertCol;
    in vec3 passedVertNorm;
    //
    out vec4 fragColor;

    void main()
    {
      //texture(u_texture, v_texcoord);
      vec3 col = vec3(0.2, 0.4, 0.9);
      fragColor = vec4(col, 1.);
    }
`;

var renderToTextureTestVert2 = `#version 300 es
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
      gl_Position =  vec4(aPos, 1);
    }
`;

var renderToTextureTestFrag2 = `#version 300 es
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
    void main()
    {
      vec2 uv = gl_FragCoord.xy / resolution.xy;
      vec3 col;

      /*** Sobel kernels ***/
      // Note: GLSL's mat3 is COLUMN-major ->  mat3[col][row]
      mat3 sobelX = mat3(-1.0, -2.0, -1.0,
                         0.0,  0.0, 0.0,
                         1.0,  2.0,  1.0);
      mat3 sobelY = mat3(-1.0,  0.0,  1.0,
                         -2.0,  0.0, 2.0,
                         -1.0,  0.0,  1.0);

      float sumX = 0.0;	// x-axis change
      float sumY = 0.0;	// y-axis change

      for(int i = -1; i <= 1; i++)
      {
          for(int j = -1; j <= 1; j++)
          {
              // texture coordinates should be between 0.0 and 1.0
              float x = (gl_FragCoord.x + float(i))/resolution.x;
      		    float y =  (gl_FragCoord.y + float(j))/resolution.y;

              // Convolve kernels with image
              sumX += length(texture( screenTexture, vec2(x, y) ).xyz) * float(sobelX[1+i][1+j]);
              sumY += length(texture( screenTexture, vec2(x, y) ).xyz) * float(sobelY[1+i][1+j]);
          }
      }

      //float g = abs(sumX) + abs(sumY);
      float g = sqrt((sumX*sumX) + (sumY*sumY));

      if(g > 1.0)
          col = vec3(0.0,0.0,0.0);
      else
          col = texture(screenTexture, TexCoords).xyz;

  	  fragColor = vec4(col, 1.0);
    }
`;
