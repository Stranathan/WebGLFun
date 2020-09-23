"use strict";

// #--------------- glMatrix LIB ALIASES: ---------------#
var vec2 = glMatrix.vec2;
var vec3 = glMatrix.vec3;
var vec4 = glMatrix.vec4;
var mat2 = glMatrix.mat2;
var mat4 = glMatrix.mat4;

// CHANGE ME, TMP GLOBAL VARIABLES
var isAnimating = false; // see utils/misc.js
var deltaTime = 0.0167; // just initing to ~60fps, sets to this in update loop
var clickSwitch = false;
var v1, v2; // for mouse camera movement
var rubiksCube = new Array(); // global so cubeRotations can use it

// #--------------- MAIN ---------------#
function main()
{
    // ---------- CAMERA INIT ----------
    var camSpeed, camRadius, theta, phi, camSpeedMultiplier; 
    camSpeed = 0.0; // camSpeed is set by update loop, just initing to something
    camSpeedMultiplier = 2.0; // arbitrarily chosen
    var camUp = vec3.fromValues(0.0, 1.0, 0.0); // really world up for gram-schmidt process
    var camPos = vec4.fromValues(5.0, 5.0, 7.0, 1);
    var targetPos = vec3.fromValues(0.0, 0.0, 0.0); // looking at origin, unit quad centered at origin
    var camFront = vec3.create();
    vec3.subtract(camFront, targetPos, [camPos[0], camPos[1], camPos[2]]);
    camRadius = vec3.length(camFront); // get init cam radius;
    theta = Math.acos(camPos[1] / camRadius); // init theta, spherical coordinates
    phi = Math.atan(camPos[0] / camPos[2]); // init phi, spherical coordinates
    vec3.normalize(camFront, camFront);

    // #--------------- GL CONTEXT INIT ---------------#
    var canvas = document.getElementById("leCanvas");
    var gl = canvas.getContext("webgl2");
    
    var width = canvas.clientWidth;
    var height = canvas.clientHeight;

    gl.canvas.width = width;
    gl.canvas.height = height;

    if (!gl)
    {
      console.log("no gl bro");
      return;
    }

    // #--------------- TRANSFORMATIONS INIT ---------------#
    var model; // set a model transformation for 27 cubies
    // Cubie init model transforms
    for(let x = -1; x <= 1; x++)
    {
      for(let y = -1; y <= 1; y++)
      {
        for(let z = -1; z <= 1; z++)
        {
          model = mat4.create();
          let pos = [x, y, z];
          mat4.translate(model, model, pos);
          mat4.scale(model, model, [0.49, 0.49, 0.49]);
          let aCubie = new Cubie(model, x, y, z);
          rubiksCube.push(aCubie);
        }
      }
    }

    var view = null; // dependent on camPos, defined as null so I can init raycasting check;
    var projection = mat4.create();
    // mat4.perspective(out, fovy, aspect, near, far)
    mat4.perspective(projection, 0.5 * Math.PI / 2., gl.canvas.width / gl.canvas.height, 1, 50);

    // #--------------- EVENT HANDLING INIT ---------------#
    var canvasHolderDiv = document.getElementById("canvasHolder")
    canvasHolderDiv.addEventListener('mousemove', function(event) { onMouseMove(event);});
    canvasHolderDiv.addEventListener('mousedown', function(event) { onMouseDown(event);});
    canvasHolderDiv.addEventListener('mouseup', function(event) { onMouseUp(event);});
    canvasHolderDiv.addEventListener('wheel', function(event) { onWheelScroll(event);});
    window.addEventListener('keydown', function(event) { onKeyDown(event);},false);
    window.addEventListener('keydown', function(event) { onResize(event, gl);},false);
  
    function onResize(event)
    {
      console.log("Resized");
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      if(projection != null)
      {
        mat4.perspective(projection, 0.5 * Math.PI / 2., gl.canvas.width / gl.canvas.height, 1, 50);
      }
    }

    // ------------- KEYBOARD CONTROLS ---------------
    // first four are for camera movement, the rest are rubiks cube rotations
    function onKeyDown(event)
    {
      let angleDelta = Math.PI / 2.0;
      let numSteps = 25;
      let animationAngleDelta = angleDelta / numSteps;

      if (event.keyCode == "87")
      {
        let tmp = vec3.create();
        let camTmp = vec3.fromValues(camPos[0], camPos[1], camPos[2]);
        vec3.set(tmp, 2.0 * camSpeed * camFront[0], 2.0 * camSpeed * camFront[1], 2.0 * camSpeed * camFront[2]);
        vec3.add(camTmp, camTmp, tmp);
        vec4.set(camPos, camTmp[0], camTmp[1], camTmp[2], 1.0);
        // get new radius after translation backward
        // no need to make more stuff
        vec3.subtract(tmp, [camPos[0], camPos[1], camPos[2]], targetPos);
        camRadius = glMatrix.vec3.length(tmp);
      }
      else if (event.keyCode == "83")
      {
        let tmp = vec3.create();
        let camTmp = vec3.fromValues(camPos[0], camPos[1], camPos[2]);
        vec3.set(tmp, 2.0 * camSpeed * camFront[0], 2.0 * camSpeed * camFront[1], 2.0 * camSpeed * camFront[2]);
        vec3.subtract(camTmp, camTmp, tmp);
        vec4.set(camPos, camTmp[0], camTmp[1], camTmp[2], 1.0);
        // get new radius after translation backward
        // no need to make more stuff
        vec3.subtract(tmp, [camPos[0], camPos[1], camPos[2]], targetPos);
        camRadius = vec3.length(tmp);
      }
      else if (event.keyCode == "68")
      {
        // azimuthal movement
        phi += 2 * camSpeed;
        let xx = camRadius * Math.sin(theta) * Math.sin(phi); // spherical coordinates
        let zz = camRadius * Math.sin(theta) * Math.cos(phi);

        vec4.set(camPos, xx, camPos[1], zz, 1.0);
        // reset the front vector so zooming in and out still works
        vec3.subtract(camFront, targetPos, [camPos[0], camPos[1], camPos[2]]);
        vec3.normalize(camFront, camFront);
      }
      else if (event.keyCode == "65")
      {
        phi -= 2.0 * camSpeed;
        let xx = camRadius * Math.sin(theta) * Math.sin(phi); // spherical coordinates
        let zz = camRadius * Math.sin(theta) * Math.cos(phi);
        vec4.set(camPos, xx, camPos[1], zz, 1.0);
        // reset the front vector so zooming in and out still works
        vec3.subtract(camFront, targetPos, [camPos[0], camPos[1], camPos[2]]);
        vec3.normalize(camFront, camFront);
      }
      // ------ ROTATIONS ------
      // X (1,2,3);
      else if(event.keyCode == "49")
      {
        if(isAnimating == false)
        {
          isAnimating = true;
          //console.log(isAnimating);
          for(let i = 0; i < rubiksCube.length; i++)
          {
            if(rubiksCube[i].x == 1)
            {
              // rotation animation using a generator
              function* rotationAnimation()
              {
                for(let ii = 0; ii < numSteps; ii++)
                {
                  let rotationMat4 = mat4.create();
                  mat4.rotateX(rotationMat4, rotationMat4, animationAngleDelta);
                  mat4.multiply(rubiksCube[i].modelTransform, rotationMat4, rubiksCube[i].modelTransform);
                  rubiksCube[i].x = Math.round(rubiksCube[i].modelTransform[12]);
                  rubiksCube[i].y = Math.round(rubiksCube[i].modelTransform[13]);
                  rubiksCube[i].z = Math.round(rubiksCube[i].modelTransform[14]);
                  yield delay(15);
                }
              }
              wait(rotationAnimation);
            }
          }
        }
      }
      else if(event.keyCode == "50")
      {
        if(isAnimating == false)
        {
          isAnimating = true;
          for(let i = 0; i < rubiksCube.length; i++)
          {
            if(rubiksCube[i].x == 0)
            {
              // rotation animation using a generator
              function* rotationAnimation()
              {
                for(let ii = 0; ii < numSteps; ii++)
                {
                  let rotationMat4 = mat4.create();
                  mat4.rotateX(rotationMat4, rotationMat4, animationAngleDelta);
                  mat4.multiply(rubiksCube[i].modelTransform, rotationMat4, rubiksCube[i].modelTransform);
                  rubiksCube[i].x = Math.round(rubiksCube[i].modelTransform[12]);
                  rubiksCube[i].y = Math.round(rubiksCube[i].modelTransform[13]);
                  rubiksCube[i].z = Math.round(rubiksCube[i].modelTransform[14]);
                  yield delay(15);
                }
              }
              wait(rotationAnimation);
            }
          }
        }
      }
      else if(event.keyCode == "51")
      {
        if(isAnimating == false)
        {
          isAnimating = true;
          for(let i = 0; i < rubiksCube.length; i++)
          {
            if(rubiksCube[i].x == -1)
            {
              // rotation animation using a generator
              function* rotationAnimation()
              {
                for(let ii = 0; ii < numSteps; ii++)
                {
                  let rotationMat4 = mat4.create();
                  mat4.rotateX(rotationMat4, rotationMat4, animationAngleDelta);
                  mat4.multiply(rubiksCube[i].modelTransform, rotationMat4, rubiksCube[i].modelTransform);
                  rubiksCube[i].x = Math.round(rubiksCube[i].modelTransform[12]);
                  rubiksCube[i].y = Math.round(rubiksCube[i].modelTransform[13]);
                  rubiksCube[i].z = Math.round(rubiksCube[i].modelTransform[14]);
                  yield delay(15);
                }
              }
              wait(rotationAnimation);
            }
          }
        }
      }
      // Y (4, 5, 6);
      else if(event.keyCode == "52")
      {
        if(isAnimating == false)
        {
          isAnimating = true;
          for(let i = 0; i < rubiksCube.length; i++)
          {
            if(rubiksCube[i].y == 1)
            {
              // rotation animation using a generator
              function* rotationAnimation()
              {
                for(let ii = 0; ii < numSteps; ii++)
                {
                  let rotationMat4 = mat4.create();
                  mat4.rotateY(rotationMat4, rotationMat4, animationAngleDelta);
                  mat4.multiply(rubiksCube[i].modelTransform, rotationMat4, rubiksCube[i].modelTransform);
                  rubiksCube[i].x = Math.round(rubiksCube[i].modelTransform[12]);
                  rubiksCube[i].y = Math.round(rubiksCube[i].modelTransform[13]);
                  rubiksCube[i].z = Math.round(rubiksCube[i].modelTransform[14]);
                  yield delay(15);
                }
              }
              wait(rotationAnimation);
            }
          }
        }
      }
      else if(event.keyCode == "53")
      {
        if(isAnimating == false)
        {
          isAnimating = true;
          for(let i = 0; i < rubiksCube.length; i++)
          {
            if(rubiksCube[i].y == 0)
            {
              // rotation animation using a generator
              function* rotationAnimation()
              {
                for(let ii = 0; ii < numSteps; ii++)
                {
                  let rotationMat4 = mat4.create();
                  mat4.rotateY(rotationMat4, rotationMat4, animationAngleDelta);
                  mat4.multiply(rubiksCube[i].modelTransform, rotationMat4, rubiksCube[i].modelTransform);
                  rubiksCube[i].x = Math.round(rubiksCube[i].modelTransform[12]);
                  rubiksCube[i].y = Math.round(rubiksCube[i].modelTransform[13]);
                  rubiksCube[i].z = Math.round(rubiksCube[i].modelTransform[14]);
                  yield delay(15);
                }
              }
              wait(rotationAnimation);
            }
          }
        }
      }
      else if(event.keyCode == "54")
      {
        if(isAnimating == false)
        {
          isAnimating = true;
          for(let i = 0; i < rubiksCube.length; i++)
          {
            if(rubiksCube[i].y == -1)
            {
              // rotation animation using a generator
              function* rotationAnimation()
              {
                for(let ii = 0; ii < numSteps; ii++)
                {
                  let rotationMat4 = mat4.create();
                  mat4.rotateY(rotationMat4, rotationMat4, animationAngleDelta);
                  mat4.multiply(rubiksCube[i].modelTransform, rotationMat4, rubiksCube[i].modelTransform);
                  rubiksCube[i].x = Math.round(rubiksCube[i].modelTransform[12]);
                  rubiksCube[i].y = Math.round(rubiksCube[i].modelTransform[13]);
                  rubiksCube[i].z = Math.round(rubiksCube[i].modelTransform[14]);
                  yield delay(15);
                }
              }
              wait(rotationAnimation);
            }
          }
        }
      }
      // Z (7, 8, 9)
      else if(event.keyCode == "55")
      {
        if(isAnimating == false)
        {
          isAnimating = true;
          for(let i = 0; i < rubiksCube.length; i++)
          {
            if(rubiksCube[i].z == 1)
            {
              // rotation animation using a generator
              function* rotationAnimation()
              {
                for(let ii = 0; ii < numSteps; ii++)
                {
                  let rotationMat4 = mat4.create();
                  mat4.rotateZ(rotationMat4, rotationMat4, animationAngleDelta);
                  mat4.multiply(rubiksCube[i].modelTransform, rotationMat4, rubiksCube[i].modelTransform);
                  rubiksCube[i].x = Math.round(rubiksCube[i].modelTransform[12]);
                  rubiksCube[i].y = Math.round(rubiksCube[i].modelTransform[13]);
                  rubiksCube[i].z = Math.round(rubiksCube[i].modelTransform[14]);
                  yield delay(15);
                }
              }
              wait(rotationAnimation);
            }
          }
        }
      }
      else if(event.keyCode == "56")
      {
        if(isAnimating == false)
        {
          isAnimating = true;
          for(let i = 0; i < rubiksCube.length; i++)
          {
            if(rubiksCube[i].z == 0)
            {
              // rotation animation using a generator
              function* rotationAnimation()
              {
                for(let ii = 0; ii < numSteps; ii++)
                {
                  let rotationMat4 = mat4.create();
                  mat4.rotateZ(rotationMat4, rotationMat4, animationAngleDelta);
                  mat4.multiply(rubiksCube[i].modelTransform, rotationMat4, rubiksCube[i].modelTransform);
                  rubiksCube[i].x = Math.round(rubiksCube[i].modelTransform[12]);
                  rubiksCube[i].y = Math.round(rubiksCube[i].modelTransform[13]);
                  rubiksCube[i].z = Math.round(rubiksCube[i].modelTransform[14]);
                  yield delay(15);
                }
              }
              wait(rotationAnimation);
            }
          }
        }
      }
      else if(event.keyCode == "57")
      {
        if(isAnimating == false)
        {
          isAnimating = true;
          for(let i = 0; i < rubiksCube.length; i++)
          {
            if(rubiksCube[i].z == -1)
            {
              // rotation animation using a generator
              function* rotationAnimation()
              {
                for(let ii = 0; ii < numSteps; ii++)
                {
                  let rotationMat4 = mat4.create();
                  mat4.rotateZ(rotationMat4, rotationMat4, animationAngleDelta);
                  mat4.multiply(rubiksCube[i].modelTransform, rotationMat4, rubiksCube[i].modelTransform);
                  rubiksCube[i].x = Math.round(rubiksCube[i].modelTransform[12]);
                  rubiksCube[i].y = Math.round(rubiksCube[i].modelTransform[13]);
                  rubiksCube[i].z = Math.round(rubiksCube[i].modelTransform[14]);
                  yield delay(15);
                }
              }
              wait(rotationAnimation);
            }
          }
        }
      }
    }
  
    var mouseX = 0; // NDC mouse move coords
    var mouseY = 0;
    var mouseClickX = 0; // NDC mouse click coords
    var mouseClickY = 0;
    
    var rayDirWorld; // raycasted ray var
    var rotationAxis = vec3.create(); // rotation axis for mouse move and release cam control
    var spinDecayTimer = 0; // to give inertia to spin
    var angularVel = 0; // just init, set in mouseMove

    function onMouseMove(event)
    {
      mouseX = event.offsetX;
      mouseX = (2. * mouseX / gl.canvas.width - 1.);
      mouseY = event.offsetY;
      mouseY = -1 * (2. * mouseY / gl.canvas.height - 1.);
    
      if(clickSwitch == true)
      {
        // limit possible angle so view transform does divide by zero
        if(v1[1] < 0.95 && v1[1] > -0.95)
        {
          // RAY IN NDC SPACE
          let ray_clip = vec4.fromValues(mouseX, mouseY, -1.0, 1.0);
          let inverseProjectionMatrix = mat4.create();
          mat4.invert(inverseProjectionMatrix, projection);

          vec4.transformMat4(ray_clip, ray_clip, inverseProjectionMatrix);
          // we only needed to un-project the x,y part,
          // so let's manually set the z, w part to mean "forwards, and not a point
          let ray_eye = vec4.fromValues(ray_clip[0], ray_clip[1], -1.0, 0.0);

          let inverseViewMatrix = mat4.create();
          mat4.invert(inverseViewMatrix, view);
          let tmp = vec4.create();
          vec4.transformMat4(tmp, ray_eye, inverseViewMatrix);
          rayDirWorld = vec3.fromValues(tmp[0], tmp[1], tmp[2]);
          rayDirWorld = vec3.normalize(rayDirWorld, rayDirWorld);

          v2 = rayDirWorld;
          if(v2[1] < 0.95 && v2[1] > -0.95)
          {
            let angle = -vec3.angle(v1, v2);
            angularVel = angle/deltaTime;
            rotationAxis = vec3.create();
            vec3.cross(rotationAxis, v1, v2);
            let rotMat = mat4.create();
            mat4.fromRotation(rotMat, angle, rotationAxis);
            vec4.transformMat4(camPos, camPos, rotMat);
          }
        }
      }
    }
    function onMouseDown(event)
    {
      mouseClickX = event.offsetX;
      mouseClickX = (2. * mouseClickX / gl.canvas.width - 1.);
      mouseClickY = event.offsetY;
      mouseClickY = -1 * (2. * mouseClickY / gl.canvas.height - 1.);

      // #---------- RAY CASTING -------------#
      // RAY IN NDC SPACE
      let ray_clip = vec4.fromValues(mouseClickX, mouseClickY, -1.0, 1.0);
      let inverseProjectionMatrix = mat4.create();
      mat4.invert(inverseProjectionMatrix, projection);

      vec4.transformMat4(ray_clip, ray_clip, inverseProjectionMatrix);
      // we only needed to un-project the x,y part,
      // so let's manually set the z, w part to mean "forwards, and not a point
      let ray_eye = vec4.fromValues(ray_clip[0], ray_clip[1], -1.0, 0.0);
      if(view != null)
      {
        let inverseViewMatrix = mat4.create();
        mat4.invert(inverseViewMatrix, view);
        let tmp = vec4.create();
        vec4.transformMat4(tmp, ray_eye, inverseViewMatrix);
        rayDirWorld = vec3.fromValues(tmp[0], tmp[1], tmp[2]);
        rayDirWorld = vec3.normalize(rayDirWorld, rayDirWorld);
        //console.log("the ray direction =  " + vec3.str(rayDirWorld));

        // let intersectDist = sphereAlgebraic([camPos[0], camPos[1], camPos[2]], rayDirWorld, [0., 0., 0.], 2.0);
        // if(intersectDist != null)
        // {
        //   console.log("got em");
        // }
        // Keeping the direction vectors from pointing in same direction as world up or down
        // so view matrix doesn't bug out
        
        v1 = rayDirWorld;
        clickSwitch = true;
      }
    }

    function onMouseUp(event)
    {
      spinDecayTimer = 0;

      if(clickSwitch == true)
      {
        clickSwitch = false;
      }
    }
    function onWheelScroll(event)
    {
      if (event.deltaY < 0)
      {
        if(theta < Math.PI - 0.05)// just a small number to limit theta on interval [0, pi]
        {
          theta += 2.0 * camSpeed;
          //console.log(theta);
          //console.log("scrolling up with delta Y: " + event.deltaY);
          let yy = camRadius * Math.cos(theta); // spherical coordinates
          let xx = camRadius * Math.sin(theta) * Math.sin(phi); // spherical coordinates
          let zz = camRadius * Math.sin(theta) * Math.cos(phi);
          vec4.set(camPos, xx, yy, zz, 1.0);
          // reset the front vector so zooming in and out still works
          vec3.subtract(camFront, targetPos, [camPos[0], camPos[1], camPos[2]]);
          vec3.normalize(camFront, camFront);
        }
      }
      else if (event.deltaY > 0)
      {
        if(theta > 0.05) // just a small number to limit theta on interval [0, pi]
        {
          theta -= 2.0 * camSpeed;
          //console.log(theta);
          //console.log("scrolling down and theta =  " + theta);
          let yy = camRadius * Math.cos(theta); // spherical coordinates
          let xx = camRadius * Math.sin(theta) * Math.sin(phi); // spherical coordinates
          let zz = camRadius * Math.sin(theta) * Math.cos(phi);
          vec4.set(camPos, xx, yy, zz, 1.0);
          // reset the front vector so zooming in and out still works
          vec3.subtract(camFront, targetPos, [camPos[0], camPos[1], camPos[2]]);
          vec3.normalize(camFront, camFront);
        }
      }
    }

    // shader program initialization
    var program = createProgramFromVars(gl, [rubiksCubeFirstPassVert, rubiksCubeFirstPassFrag]);
    // should check for resolution
    var program2 = createProgramFromVars(gl, [rubiksCubeSecondPassVert, rubiksCubeSecondPassFrag2]);

    // program1
    var timeUniformLocation = gl.getUniformLocation(program, "iTime");
    var resolutionUniformLocation = gl.getUniformLocation(program, "iResolution");
    var mouseUniformLocation = gl.getUniformLocation(program, "iMouse");
    var modelUniformLocation = gl.getUniformLocation(program, "model");
    var viewUniformLocation = gl.getUniformLocation(program, "view");
    var projectionUniformLocation = gl.getUniformLocation(program, "projection");
    var lightPositionUniformLocation = gl.getUniformLocation(program, "lightPos");

    // program 2
    var time2UniformLocation = gl.getUniformLocation(program2, "time");
    var resolution2UniformLocation = gl.getUniformLocation(program2, "resolution");
    var mouse2UniformLocation = gl.getUniformLocation(program2, "mouse");
    var textureUniformLocation = gl.getUniformLocation(program2, "screenTexture");

    // use program before sending it uniforms
    gl.useProgram(program);
    // only need to do this once if I'm not resizing
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform3f(lightPositionUniformLocation, 2.0, 2.0, -2.0);

    // #---------------  CUBE VAO INIT ---------------#
    var positionAttributeLocation = gl.getAttribLocation(program, "aPos");
    var colorAttributeLocation = gl.getAttribLocation(program, "vertCol");
    var normalAttributeLocation = gl.getAttribLocation(program, "vertNorm");

    var cubeVAO = gl.createVertexArray();
    var cubeVertsBuffer = gl.createBuffer();

    gl.bindVertexArray(cubeVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertsBuffer);

    setGeometry(gl, "cubieVerts"); // see rendering/geometry.js

    var size = 3;          // 3 floats per triangle read
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data whatever this means
    var stride = 9 * 4;    // each iteration block is 6 floats of 4 bytes each
    var offset = 0;        // start at the beginning of the 24 byte block of buffer
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
    gl.enableVertexAttribArray(positionAttributeLocation);

    //stride = 9 * 4;    // each block is still the same size, just offset past the position data
    offset = 3 * 4;    // start 3 floats * 4 bytes into the 24 byte block of buffer
    gl.vertexAttribPointer(colorAttributeLocation, size, type, normalize, stride, offset);
    gl.enableVertexAttribArray(colorAttributeLocation);

    //stride = 9 * 4;    // each block is still the same size, just offset past the position data
    offset = 6 * 4;    // start 6 floats * 4 bytes into the 24 byte block of buffer
    gl.vertexAttribPointer(normalAttributeLocation, size, type, normalize, stride, offset);
    gl.enableVertexAttribArray(normalAttributeLocation);
    //
    var primitiveType = gl.TRIANGLES;
    offset = 0;
    var rubiksCubeTriCount = 36;

    // #--------------- SCREEN QUAD VAO INIT ---------------#
    // binding points for vertex attributes
    var screenQuadPositionAttributeLocation = gl.getAttribLocation(program2, "aPos");
    var screenQuadTextureAttributeLocation = gl.getAttribLocation(program2, "aTexCoords");

    var screenQuadVAO = gl.createVertexArray();
    var screenQuadVertsBuffer = gl.createBuffer();
    gl.bindVertexArray(screenQuadVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, screenQuadVertsBuffer);

    setGeometry(gl, "screenQuad");
    var screenQuadTriCount = 6;

    size = 3;
    type = gl.FLOAT;
    normalize = false;
    stride = 5 * 4;
    offset = 0;
    gl.vertexAttribPointer(screenQuadPositionAttributeLocation, size, type, normalize, stride, offset); // configure how the data is to be parsed for this attribute
    gl.enableVertexAttribArray(screenQuadPositionAttributeLocation); // make it available in shader

    size = 2;
    offset = 3 * 4;
    gl.vertexAttribPointer(screenQuadTextureAttributeLocation, size, type, normalize, stride, offset);
    gl.enableVertexAttribArray(screenQuadTextureAttributeLocation);

    // -------------- FRAME BUFFER INIT --------------
    // Create a texture to render to
    const targetTextureWidth = gl.canvas.width;
    const targetTextureHeight = gl.canvas.height;
    const targetTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);

    // define size and format of level 0
    const level = 0;
    const internalFormat = gl.RGBA;
    const border = 0;
    const format = gl.RGBA;
    const texType = gl.UNSIGNED_BYTE; // name is bad, changed to not conflict with attrib init
    const data = null; // data will be rendered off screen and given to texture
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  targetTextureWidth, targetTextureHeight, border,
                  format, texType, data);

    // set the filtering so we don't need mips
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Create and bind the framebuffer
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    // attach the texture as the first color attachment
    const attachmentPoint = gl.COLOR_ATTACHMENT0;
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture, level);

    // create a depth renderbuffer
    const depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);

    // make a depth buffer and the same size as the targetTexture
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, targetTextureWidth, targetTextureHeight);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

    // -------------- START GAME LOOP --------------
    // Give info for view transform/ clipping space transformation embedded in the API
    resize(gl.canvas); // see utils script
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.6, 0.8, 0.9, 1); // lightblue
    gl.enable(gl.DEPTH_TEST);

    // var for drawcall
    var drawOffset = 0;

    // -------------- TIME INIT --------------
    var oldTimeStamp = 0.0;
    var seconds = 0.0;

    // -------------- START GAME LOOP --------------
    window.requestAnimationFrame(gameLoop);

    // -------------- GAME LOOP --------------
    function gameLoop(timeStamp)
    {
      // #--------------- UPDATE CALL ---------------#
      // time update
      deltaTime = (timeStamp - oldTimeStamp) / 1000; // in seconds
      oldTimeStamp = timeStamp;
      seconds += deltaTime;

      // camera update
      camSpeed = 3.0 * deltaTime;

      // Globe Spin Effect:
      spinDecayTimer += deltaTime;
      if(spinDecayTimer < 5)
      {
        //console.log(spinDecayTimer);
        let spinEffectTheta = angularVel * deltaTime;
        spinEffectTheta *= Math.exp(-1.5 * spinDecayTimer);
        
        let rotMat = mat4.create();
        mat4.fromRotation(rotMat, spinEffectTheta, rotationAxis);
        vec4.transformMat4(camPos, camPos, rotMat);
      } 

      gl.useProgram(program);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.bindVertexArray(cubeVAO);
      view = mat4.create();
      mat4.lookAt(view, [camPos[0], camPos[1], camPos[2]], [0, 0, 0], camUp); // lookAt(out, eye, center, up)

      gl.uniform1f(timeUniformLocation, seconds);
      gl.uniform2f(mouseUniformLocation, mouseX, mouseY);
      gl.uniformMatrix4fv(viewUniformLocation, false, view);
      gl.uniformMatrix4fv(projectionUniformLocation, false, projection);

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      for(let i = 0; i < rubiksCube.length; i++)
      {
        gl.uniformMatrix4fv(modelUniformLocation, false, rubiksCube[i].modelTransform);
        gl.drawArrays(primitiveType, drawOffset, rubiksCubeTriCount);
      }

      // ----------- FRAME BUFFER SECOND PASS
      // 2) Bind to the default framebuffer.
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      // 3) Draw a quad that spans the entire screen with the new framebuffer's color buffer as its texture.
      gl.bindVertexArray(screenQuadVAO);
      gl.useProgram(program2);
      gl.uniform1f(time2UniformLocation, seconds);
      gl.uniform2f(resolution2UniformLocation, gl.canvas.width, gl.canvas.height);
      gl.uniform2f(mouse2UniformLocation, mouseX, mouseY);
      
      gl.bindTexture(gl.TEXTURE_2D, targetTexture); // really shouldn't matter since we're only binding one texture
      // Clear the canvas AND the depth buffer.
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawArrays(primitiveType, drawOffset, screenQuadTriCount);

      // restart game loop
      window.requestAnimationFrame(gameLoop);
    }
}

main();
