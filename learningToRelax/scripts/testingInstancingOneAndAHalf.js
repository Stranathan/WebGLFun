'use strict';

// ---------------- glMatrix Lib Aliases ----------------
var vec2 = glMatrix.vec2;
var vec3 = glMatrix.vec3;
var vec4 = glMatrix.vec4;
var mat4 = glMatrix.mat4;

const canvas = document.getElementById("cc");
const gl = canvas.getContext('webgl2');

// need singleton or something for resource allocation storage organizer
// preloader
// allocate all shader resources and mesh data
function _ready()
{
    if (!gl) 
    {
        return;
    }

    parseMeshString(unitCubeObjStr);
    
    // main can't be called until parseString returns, so we never have to worry about async mesh loading
    main();
}

function main() 
{
	// --------------- Init Shader program ----------------
	var program = createProgramFromSources(gl, vertexShaderSourceOneAndHalf, fragmentShaderSourceOneAndHalf);
	var programViewUniformLocation = gl.getUniformLocation(program, "view");
	var programProjectionUniformLocation = gl.getUniformLocation(program, "projection");
	
	// ---- Attrib locations
	const positionAttribLoc = 0;
	const texAttribLoc = 1;
	const normalAttribLoc = 2;
	const colorAttribLoc = 3;
	const instanceMatricesLoc = 4;

	// ------------------ Camera/s Init------------------
    var camRadius = 5.;
    var maxCamRadius = 25;
    var camPos = vec4.fromValues(2, 0, -camRadius, 1);
    var camUp = vec4.fromValues(0.0, 1.0, 0.0, 1.0); // really world up for gram-schmidt process
    var targetPos = vec3.fromValues(0.0, 0.0, 0.0);

    // ------------------ MVP Init
    var view = mat4.create();
    mat4.lookAt(view, [camPos[0], camPos[1], camPos[2]], targetPos, [camUp[0], camUp[1], camUp[2]]);
    var projection = mat4.create();
    let fieldOfVision = 0.5 * Math.PI / 2.;
    let aspectRatio = gl.canvas.width / gl.canvas.height;
	mat4.perspective(projection, fieldOfVision, aspectRatio, 1, 50);
    
    // --------------- Instance VAO ----------------
    getUnitCubeAttribDataFromString
	const crossVAO = gl.createVertexArray();
	gl.bindVertexArray(crossVAO);
	const crossPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, crossPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(meshVertData), gl.STATIC_DRAW);
    const numVertices = 36;
    let theStride = 9 * 4;
	gl.enableVertexAttribArray(positionAttribLoc);
    gl.vertexAttribPointer(positionAttribLoc, 3, gl.FLOAT, false, theStride, 0);
    gl.enableVertexAttribArray(texAttribLoc);
    gl.vertexAttribPointer(texAttribLoc, 3, gl.FLOAT, false, theStride, 3 * 4);
    gl.enableVertexAttribArray(normalAttribLoc);
    gl.vertexAttribPointer(normalAttribLoc, 3, gl.FLOAT, false, theStride, 6 * 4);

	// --------------- Color Attrib ----------------
	const colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(someColors), gl.STATIC_DRAW);

	// ---- Init Color Attrib
	gl.enableVertexAttribArray(colorAttribLoc);
	gl.vertexAttribPointer(colorAttribLoc, 4, gl.FLOAT, false, 0, 0);
	gl.vertexAttribDivisor(colorAttribLoc, 1); // this line says this attribute only changes for each 1 instance

	// --------------- Init Instance Matrices ----------------
	const numInstances = 5;
	// make a typed array with one view per matrix
	const matrixData = new Float32Array(numInstances * 16); // array of 16 * 5 floats 
	const matrices = [];

	// this creates an array container of 5 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,]
	for (let i = 0; i < numInstances; i++) 
	{
		const byteOffsetToMatrix = i * 16 * 4;
		const numFloatsForView = 16; // length
		// Float32Array(buffer, byteOffset, length)
		matrices.push(new Float32Array(matrixData.buffer, byteOffsetToMatrix, numFloatsForView));
	}
	
	// --------------- Init Instance Matrices Attrib ----------------
	const matrixBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, matrixData.byteLength, gl.DYNAMIC_DRAW); // just allocate the buffer
	// A mat4 actually uses 4 attribute slots.
	const bytesPerMatrix = 4 * 16;
	const numAttribSlots = 4;
	for (let i = 0; i < numAttribSlots; i++) 
	{
		const loc = instanceMatricesLoc + i;
		gl.enableVertexAttribArray(loc);
		// note the stride and offset
		const offset = i * 16;  // 4 floats per row, 4 bytes per float
		gl.vertexAttribPointer(loc, 4, gl.FLOAT, false,
			bytesPerMatrix,   // stride, num bytes to advance to get to next set of values
			offset,           // offset in buffer
		);	
		gl.vertexAttribDivisor(loc, 1); // this line says this attribute only changes for each 1 instance
	}

	// ------------------ WebGL State Initialization ----------------
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.DEPTH_TEST);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    
    // ------------------ Mesh Init ----------------
    var meshCount = 0;
    
	// ---------------- Time Init ----------------
	var oldTimeStamp = 0.0;
	var seconds = 0.0;
	var deltaTime = 0.0;
 
	// ---------------- Start Render Loop ----------------
	window.requestAnimationFrame(renderLoop);
	
	function renderLoop(timeStamp) 
	{
		// -------- Time Update -------- 
        deltaTime = (timeStamp - oldTimeStamp) / 1000; // in seconds
        oldTimeStamp = timeStamp;
		seconds += deltaTime;
		
		camPos[0]  = Math.sin(seconds) * camRadius;
		camPos[2]  = Math.cos(seconds) * camRadius;
		var view = mat4.create();
		mat4.lookAt(view, [camPos[0], camPos[1], camPos[2]], targetPos, [camUp[0], camUp[1], camUp[2]]);
	
		// -------- Resize canvas --------
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		resize(gl.canvas);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); // [NDC] => [pixels]
		gl.useProgram(program);
		// setup all attributes
		gl.bindVertexArray(crossVAO);
		
		// -------- Update Instance Matrix Data --------
		matrices.forEach((mat, ndx) => 
			{
				let translationTransform = mat4.create();
				mat4.translate(mat, translationTransform, [-0.5 + ndx * 0.25, 0, -0.3 + ndx * 0.33]);
				mat4.scale(mat, mat,  [0.5, 0.5, 0.5]);
				mat4.rotateZ(mat, mat,  seconds * (0.1 + 0.1 * ndx));
			}
        );
        
		// -------- Update Instance Matrix Data --------
		gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, matrixData);

		gl.uniformMatrix4fv(programViewUniformLocation, false, view);
		gl.uniformMatrix4fv(programProjectionUniformLocation, false, projection);
			
		gl.drawArraysInstanced(gl.TRIANGLES, 0, numVertices, numInstances);

		// -------- Restart Render Loop --------
        window.requestAnimationFrame(renderLoop);
	}
}

_ready();
