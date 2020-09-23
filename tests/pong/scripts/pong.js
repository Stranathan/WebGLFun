"use strict";

// #---------------  GLOBAL OBJECTS ---------------#
var gl;
var oldTimeStamp = 0.0;
var seconds = 0.0;
var paddleWidth = 20.0;
var paddleHeight = paddleWidth * 4.0;
var transform;

function main()
{
	// canvas and context init
	var canvas = document.getElementById("leCanvas");
	canvas.width = 0.7 * window.innerWidth;
	canvas.height = 0.7 * window.innerHeight;
	gl = canvas.getContext("webgl2");

	if (!gl)
	{
		console.log("no gl bro");
		return;
	}

	// Game Objects
	// cm position vector
	var paddle = new Paddle([-0.9, 0., 0.], paddleWidth, paddleHeight, [canvas.width, canvas.height]);
	var radius = gl.canvas.width / 75.;
	var steeringPaddle = new SteeringPaddle([0.9, 0., 0.], paddleWidth, paddleHeight, [canvas.width, canvas.height]);
	var theBall = new Ball([0., 0., 0.], radius, [canvas.width, canvas.height], [paddle, steeringPaddle]);

	// #---------------  EVENT HANDLING INIT ---------------#
	{
		var mouseX = 0;
		var mouseY = 0;
		var canvasHolderDiv = document.getElementById("canvasHolder")
		canvasHolderDiv.addEventListener('mousemove', function(event) { onMouseMove(event);});
		window.addEventListener('keydown', function(event) { onKeyDown(event);},false);
		//
		function onKeyDown(event)
		{

	    if (event.keyCode == "38")
			{
				if(paddle.vel[1] < paddle.maxVel)
				{
					paddle.accl[1] += 0.001;
				}
			}
			else if (event.keyCode == "40")
			{
				if(paddle.vel[1] > -paddle.maxVel)
				{
					paddle.accl[1] -= 0.001;
				}
			}
		}
		function onMouseMove(event)
		{
	    mouseX = event.offsetX;
			mouseX = (2. * mouseX / gl.canvas.width - 1.);
	    mouseY = event.offsetY;
			mouseY = -1 * (2. * mouseY / gl.canvas.height - 1.);
		}
	}

	var program = createProgramFromScripts(gl, ["vertex-shader-2d", "fragment-shader-2d"]);


	var positionAttributeLocation = gl.getAttribLocation(program, "aPos");

	// make binding points for uniforms
	var timeUniformLocation = gl.getUniformLocation(program, "iTime");
	var resolutionUniformLocation = gl.getUniformLocation(program, "iResolution");
	var mouseUniformLocation = gl.getUniformLocation(program, "iMouse");
	var transformUniformLocation = gl.getUniformLocation(program, "transform");

	gl.useProgram(program);
	gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

	// #---------------  PADDLE VAO INIT ---------------#
	var paddle1VAO = gl.createVertexArray();
	var paddle1VBO = gl.createBuffer();

	gl.bindVertexArray(paddle1VAO);
	gl.bindBuffer(gl.ARRAY_BUFFER, paddle1VBO);

	// model coords are centered at center of canvas and rect.
	// these do not change and are only manipualted in vertex shader via matrices
	// should be wrapped up in like - make rect
	var paddleOffsetX = .5 * (gl.canvas.width - paddleWidth);
	var paddleOffsetY = .5 * (gl.canvas.height - paddleHeight);


	// winding order for paddles
	{
	// *0*    *3-*----*5*
	// ----			--------
  // ------     ------
	// --------     ----
	// *1*-----*2*   *4*
	}
	const paddleVertices = [
		paddleOffsetX, paddleOffsetY,
		paddleOffsetX, paddleOffsetY + paddleHeight,
		paddleOffsetX + paddleWidth, paddleOffsetY + paddleHeight,
		paddleOffsetX, paddleOffsetY,
		paddleOffsetX + paddleWidth, paddleOffsetY + paddleHeight,
		paddleOffsetX + paddleWidth, paddleOffsetY
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(paddleVertices), gl.STATIC_DRAW);
	var size = 2;          // 2 components per iteration
	var type = gl.FLOAT;   // the data is 32bit floats
	var normalize = false; // don't normalize the data
	var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
	var offset = 0;        // start at the beginning of the buffer
	gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
	gl.enableVertexAttribArray(positionAttributeLocation);

	//
	var primitiveType = gl.TRIANGLES;
	var offset = 0;
	var count = 6;

	// fix NDC transform and clear
	resize(gl.canvas);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(primitiveType, offset, count);

	// #---------------  BALL VAO INIT ---------------#
	var ballVAO = gl.createVertexArray(); // vao
	var ballVBO = gl.createBuffer(); // vbo

	gl.bindVertexArray(ballVAO);
	gl.bindBuffer(gl.ARRAY_BUFFER, ballVBO);

	var ballOffsetX = gl.canvas.width / 2.;
	var ballOffsetY = gl.canvas.height / 2.;

	const ballVertices = [
		ballOffsetX, ballOffsetY,
		ballOffsetX + radius, ballOffsetY,
		ballOffsetX + radius * Math.cos(Math.PI / 4), ballOffsetY + radius * Math.sin(Math.PI / 4),

		ballOffsetX, ballOffsetY,
		ballOffsetX + radius * Math.cos(Math.PI / 4), ballOffsetY + radius * Math.sin(Math.PI / 4),
		ballOffsetX, ballOffsetY + radius,

		ballOffsetX, ballOffsetY,
		ballOffsetX, ballOffsetY + radius,
		ballOffsetX + radius * Math.cos(3 * Math.PI / 4), ballOffsetY + radius * Math.sin(3 * Math.PI / 4),

		ballOffsetX, ballOffsetY,
		ballOffsetX + radius * Math.cos(3 * Math.PI / 4), ballOffsetY + radius * Math.sin(3 * Math.PI / 4),
		ballOffsetX - radius, ballOffsetY,

		ballOffsetX, ballOffsetY,
		ballOffsetX - radius, ballOffsetY,
		ballOffsetX + radius * Math.cos(5 * Math.PI / 4), ballOffsetY + radius * Math.sin(5 * Math.PI / 4),

		ballOffsetX, ballOffsetY,
		ballOffsetX + radius * Math.cos(5 * Math.PI / 4), ballOffsetY + radius * Math.sin(5 * Math.PI / 4),
		ballOffsetX, ballOffsetY - radius,

		ballOffsetX, ballOffsetY,
		ballOffsetX, ballOffsetY - radius,
		ballOffsetX + radius * Math.cos(7 * Math.PI / 4), ballOffsetY + radius * Math.sin(7 * Math.PI / 4),

		ballOffsetX, ballOffsetY,
		ballOffsetX + radius * Math.cos(7 * Math.PI / 4), ballOffsetY + radius * Math.sin(7 * Math.PI / 4),
		ballOffsetX + radius, ballOffsetY
	];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ballVertices), gl.STATIC_DRAW);

	gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
	gl.enableVertexAttribArray(positionAttributeLocation);

	count = 24;
	gl.drawArrays(primitiveType, offset, count);

	// #---------------  STEERING PADDLE VAO INIT ---------------#

	const steeringPaddleVertices =
	[
		paddleOffsetX, paddleOffsetY,
		paddleOffsetX, paddleOffsetY + paddleHeight,
		paddleOffsetX + paddleWidth, paddleOffsetY + paddleHeight,
		paddleOffsetX, paddleOffsetY,
		paddleOffsetX + paddleWidth, paddleOffsetY + paddleHeight,
		paddleOffsetX + paddleWidth, paddleOffsetY
	];

	var steeringPaddleVAO = gl.createVertexArray();
	var steeringPaddleVBO = gl.createBuffer();

	gl.bindVertexArray(steeringPaddleVAO);
	gl.bindBuffer(gl.ARRAY_BUFFER, steeringPaddleVBO);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(steeringPaddleVertices), gl.STATIC_DRAW);
	gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
	gl.enableVertexAttribArray(positionAttributeLocation);
	count = 6;
	gl.drawArrays(primitiveType, offset, count);

	//#-------------- START GAME LOOP
	window.requestAnimationFrame(gameLoop);

	function gameLoop(timeStamp)
	{
	  var secondsPassed = (timeStamp - oldTimeStamp) / 1000;
	  oldTimeStamp = timeStamp;
		seconds += secondsPassed;

		// Event handling
		paddle.update();
		theBall.update();
		steeringPaddle.update(theBall.pos);

		// #------------ DRAW -----------#
		// these uniforms do not change regardless of VAO
		// could consolidate some of this into a bigger data type like vec4
		gl.uniform1f(timeUniformLocation, seconds);
		gl.uniform2f(mouseUniformLocation, mouseX, mouseY);

		// Paddle render update
		gl.bindVertexArray(paddle1VAO);
		transform = glMatrix.mat4.create();
		glMatrix.mat4.translate(transform, transform, paddle.pos);
		gl.uniformMatrix4fv(transformUniformLocation, false, transform);
		gl.drawArrays(gl.TRIANGLES, 0, 6);

		// ball render update
		gl.bindVertexArray(ballVAO);
		transform = glMatrix.mat4.create();
		glMatrix.mat4.translate(transform, transform, theBall.pos);
		gl.uniformMatrix4fv(transformUniformLocation, false, transform);
		gl.drawArrays(gl.TRIANGLES, 0, 24);

		// Paddle render update
		gl.bindVertexArray(steeringPaddleVAO);
		transform = glMatrix.mat4.create();
		glMatrix.mat4.translate(transform, transform, steeringPaddle.pos);
		gl.uniformMatrix4fv(transformUniformLocation, false, transform);
		gl.drawArrays(gl.TRIANGLES, 0, 6);

		// restart game loop
	  window.requestAnimationFrame(gameLoop);
	}
}
main();
