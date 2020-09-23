"use strict";

// #--------------- glMatrix LIB ALIASES: ---------------#
var vec2 = glMatrix.vec2;
var vec3 = glMatrix.vec3;
var vec4 = glMatrix.vec4;
var mat2 = glMatrix.mat2;
var mat4 = glMatrix.mat4;

function main()
{
  // #--------------- GL CONTEXT INIT ---------------#
  var canvas = document.getElementById("leCanvas");
	canvas.width = 0.7 * window.innerWidth;
	canvas.height = 0.8 * window.innerHeight;
	var gl = canvas.getContext("webgl2"); // use OpenGL 3 and above

	if (!gl)
	{
		console.log("no gl bro");
		return;
	}

  // -------------- EVENT HANDLING INIT --------------
	var canvasHolderDiv = document.getElementById("canvasHolder")
	canvasHolderDiv.addEventListener('mousemove', function(event) { onMouseMove(event);});
  window.addEventListener('keydown', function(event) { onKeyDown(event);},false);

  var mouseX = 0;
	var mouseY = 0;

	function onMouseMove(event)
	{
    mouseX = event.offsetX;
		mouseX = (2. * mouseX / gl.canvas.width - 1.); // clipping space values
    mouseY = event.offsetY;
		mouseY = -1 * (2. * mouseY / gl.canvas.height - 1.); // clipping space values with accounting canvas y direction convention

    //console.log(mouseX + ", " + mouseY);
  }

  function onKeyDown(event)
	{
    if (event.keyCode == "49")
		{
      let phiDelta = Math.PI;
      let numSteps = 25;
      let animationAngleDelta = phiDelta / numSteps;

      console.log("phi before rotation = " + phi);
      //console.log("key 1 pressed");
      // rotation animation using a generator
      function* rotationAnimation()
      {
        for(let ii = 0; ii < numSteps; ii++)
        {
          phi += animationAngleDelta;
          let xx = camRadius * Math.sin(theta) * Math.sin(phi); // spherical coordinates
          let zz = camRadius * Math.sin(theta) * Math.cos(phi); // spherical coordinates
          vec3.set(camPos, xx, camPos[1], zz);
          // reset the front vector so zooming in and out still works
          vec3.subtract(camFront, targetPos, camPos);
          vec3.normalize(camFront, camFront);
          yield delay(20);
        }
      }
      wait(rotationAnimation);
		}
  }

  // -------------- TIME --------------
  var oldTimeStamp = 0.0; // init for delta time
  var seconds = 0.0;

  // -------------- CAMERA INIT --------------
  var camSpeed, camRadius, theta, phi, camSpeedMultiplier; // camSpeed is machine independent, determined by update loop
  camSpeed = 0.0; // just initing to something
  camSpeedMultiplier = 2.0; // arbitrarily chosen
  var camUp = vec3.fromValues(0.0, 1.0, 0.0); // kinda doesn't matter, using world up for gram schmidt process. Puts small constraint on what camera front can be
  var camPos = vec3.fromValues(0.0, 0.0, 4.0);
  var targetPos = vec3.fromValues(0.0, 0.0, 0.0); // looking at origin, unit quad centered at origin
  var camFront = vec3.create(); // camFront is clearly positive forward (+z), but the normalized relative position vector is the general way
  vec3.subtract(camFront, targetPos, camPos);
  camRadius = vec3.length(camFront); // get init cam radius;
  theta = Math.acos(camPos[1] / camRadius); // init theta, spherical coordinates
  phi = Math.atan(camPos[0] / camPos[2]); // init phi, spherical coordinates
  vec3.normalize(camFront, camFront);

  // -------------- TRANSFORMATIONS INIT --------------
  var model = mat4.create();
  mat4.translate(model, model, [0.0, 0.0, 0.0]) // mat4.translate(out, a, v)
  mat4.scale(model, model, [1.5, 1.5, 0.0]);

  var view = mat4.create();
  mat4.lookAt(view, camPos, targetPos, camUp); // lookAt(out, eye, center, up)
  var projection = mat4.create();
  mat4.perspective(projection, 0.5 * Math.PI / 2., gl.canvas.width / gl.canvas.height, 1, 50);   // mat4.perspective(out, fovy, aspect, near, far)

  // make shader program
  var program = createProgramFromVars(gl, [renderToTextureTestVert, renderToTextureTestFrag]);
  var program2 = createProgramFromVars(gl, [renderToTextureTestVert2, renderToTextureTestFrag2]);

	// binding points for uniforms
  // Program 1
	var timeUniformLocation = gl.getUniformLocation(program, "time");
	var resolutionUniformLocation = gl.getUniformLocation(program, "resolution");
	var mouseUniformLocation = gl.getUniformLocation(program, "mouse");
  var modelUniformLocation = gl.getUniformLocation(program, "model");
	var viewUniformLocation = gl.getUniformLocation(program, "view");
  var projectionUniformLocation = gl.getUniformLocation(program, "projection");
  // Program 2
  var time2UniformLocation = gl.getUniformLocation(program2, "time");
	var resolution2UniformLocation = gl.getUniformLocation(program2, "resolution");
	var mouse2UniformLocation = gl.getUniformLocation(program2, "mouse");
  var textureUniformLocation = gl.getUniformLocation(program2, "screenTexture");

  // #---------------  BOARD VAO ---------------#
  // binding points for vertex attributes
  var positionAttributeLocation = gl.getAttribLocation(program, "aPos");
  var colorAttributeLocation = gl.getAttribLocation(program, "vertCol");
  var normalAttributeLocation = gl.getAttribLocation(program, "vertNorm");

	var boardVAO = gl.createVertexArray();
	var boardVertsBuffer = gl.createBuffer();

	gl.bindVertexArray(boardVAO);
	gl.bindBuffer(gl.ARRAY_BUFFER, boardVertsBuffer);

  setGeometry(gl, "quad");

	var size = 3;          // 3 floats per triangle attribute read
	var type = gl.FLOAT;   // the attribute data is 32bit floats
	var normalize = false; // don't normalize the data, whatever this means, I think it's legacy code
	var stride = 9 * 4;    // each iteration block (3 attributes) is 9 floats of 4 bytes per float
	var offset = 0;        // start at the beginning of the 32 byte block of buffer
	gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset); // configure how the data is to be parsed for this attribute
	gl.enableVertexAttribArray(positionAttributeLocation); // make it available in shader

	offset = 3 * 4;    // start 3 floats * 4 bytes into the 32 byte block of buffer
  gl.vertexAttribPointer(colorAttributeLocation, size, type, normalize, stride, offset);
	gl.enableVertexAttribArray(colorAttributeLocation);

	offset = 6 * 4;    // start 6 floats * 4 bytes into the 32 byte block of buffer
  gl.vertexAttribPointer(normalAttributeLocation, size, type, normalize, stride, offset);
	gl.enableVertexAttribArray(normalAttributeLocation);

	var primitiveType = gl.TRIANGLES;
	offset = 0;
	var count = 6; // num of verts

  // #--------------- SCREEN QUAD VAO INIT ---------------#
  // binding points for vertex attributes
  var screenQuadPositionAttributeLocation = gl.getAttribLocation(program2, "aPos");
  var screenQuadTextureAttributeLocation = gl.getAttribLocation(program2, "aTexCoords");

	var screenQuadVAO = gl.createVertexArray();
	var screenQuadVertsBuffer = gl.createBuffer();
	gl.bindVertexArray(screenQuadVAO);
	gl.bindBuffer(gl.ARRAY_BUFFER, screenQuadVertsBuffer);

  setGeometry(gl, "screenQuad");

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

  // -------------- START GAME LOOP --------------
  // Give info for view transform/ clipping space transformation embedded in the API
  resize(gl.canvas); // see utils script
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 1, 1);   // clear to blue
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  // reset for draw arrays call;
  offset = 0;

	window.requestAnimationFrame(gameLoop);

  function gameLoop(timeStamp)
  {
    // #--------------- UPDATE CALL ---------------#
    let deltaTime = (timeStamp - oldTimeStamp) / 1000; // in seconds
    oldTimeStamp = timeStamp;
    seconds += deltaTime;

    // ----------- FIRST PASS
    // 1) Render the scene as usual with the new framebuffer bound as the active framebuffer.
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.bindVertexArray(boardVAO);
    // All subsequent render commands will influence this currently bound framebuffer
    gl.useProgram(program);
    // can't send uniforms until we use program
    gl.uniformMatrix4fv(modelUniformLocation, false, model);
    view = mat4.create();
    mat4.lookAt(view, camPos, targetPos, camUp); // lookAt(out, eye, center, up)
    gl.uniformMatrix4fv(viewUniformLocation, false, view);
    gl.uniformMatrix4fv(projectionUniformLocation, false, projection);

    gl.uniform1f(timeUniformLocation, seconds);
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform2f(mouseUniformLocation, mouseX, mouseY);
    // Clear the canvas AND the depth buffer.
    gl.clearColor(1, 1, 1, 1);   // clear to white
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(primitiveType, offset, count);

    // ----------- SECOND PASS
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
    gl.clearColor(1, 1, 1, 1);   // clear to white
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(primitiveType, offset, count);

    // restart game loop
    window.requestAnimationFrame(gameLoop);
  }
}

main();
