'use strict';

// ---------------- glMatrix Lib Aliases ----------------
var vec2 = glMatrix.vec2;
var vec3 = glMatrix.vec3;
var vec4 = glMatrix.vec4;
var mat4 = glMatrix.mat4;

const canvas = document.getElementById("cc");
const gl = canvas.getContext('webgl2');

// ---- settings
const baseScale = 0.15;
const circleSideNum = 30;
var circlePathRadius = 0.7;
var AR = gl.canvas.width / gl.canvas.height;
var animationSwitch = false;
var tt = 0;
var animationCount = 0;


// ---- The lines
let x1 = -1.5;
let y1 = 0.7;
let x2 = 0.7;
let y2 = y1;

let x3 = x2 - x1;
let y3 = y1 - 0.7 / 2;

function main() 
{
    // ---------------- Init Shader program ----------------
	var program = createProgramFromSources(gl, coordinateSystemShadersVS, coordinateSystemShadersFS);
	var programUTime = gl.getUniformLocation(program, "time");
    var programUResolution = gl.getUniformLocation(program, "resoluton");
    var programUModel = gl.getUniformLocation(program, "model");
	
	// ---- Attrib locations
    var positionAttributeLocation = 0;
    
    // ---- Screen VAO
    var circleVAO = gl.createVertexArray();
    var positionBuffer = gl.createBuffer();
    var circleObj = makeACircle(circleSideNum, 1);

    gl.bindVertexArray(circleVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circleObj.vertexData), gl.STATIC_DRAW);
    var stride = 0;        
    var offset = 0;
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, stride, offset);
    gl.enableVertexAttribArray(positionAttributeLocation);


	// ---------------- WebGL State Init ----------------
    gl.clearColor(0.16, 0.16, 0.16, 1.0);
    gl.enable(gl.DEPTH_TEST);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.useProgram(program); // needs to only be called once, only using one shader
    
	// ---------------- Time Init ----------------
	var oldTimeStamp = 0.0;
	var seconds = 0.0;
	var deltaTime = 0.0;
 
    gl.useProgram(program);

	// ---------------- Start Render Loop ----------------
	window.requestAnimationFrame(renderLoop);
	
	function renderLoop(timeStamp) 
	{
		// -------- Time Update -------- 
        deltaTime = (timeStamp - oldTimeStamp) / 1000; // in seconds
        oldTimeStamp = timeStamp;
        seconds += deltaTime;    
        
        // -------- Resize canvas --------
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        resize(gl.canvas);
        // AR = gl.canvas.width / gl.canvas.height;
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); // [NDC] => [pixels]

        gl.uniformMatrix4fv(programProjectionUniformLocation, false, projection);
        gl.uniform1f(programUTime, seconds);
        gl.uniform2f(programUResolution, gl.canvas.width, gl.canvas.height);

        // -------- Draw Call/s
        gl.drawArrays(gl.TRIANGLES, 0, circleObj.numVerts);
        
		// -------- Restart Render Loop --------
        window.requestAnimationFrame(renderLoop);
	}
}

main();

function main() 
{
    // ---------------- Init Shader program ----------------
	var program = createProgramFromSources(gl, coordinateSystemShadersVS, coordinateSystemShadersFS);
	var programUTime = gl.getUniformLocation(program, "time");
    var programUResolution = gl.getUniformLocation(program, "resoluton");

    // ---- Attrib locations
    var positionAttributeLocation = 0;
    var modelAttributeLocation = 1;

    // ---- Unit Quad VAO & VBO
    var theUnitQuadVAO = gl.createVertexArray();
    gl.bindVertexArray(theUnitQuadVAO);
    var theUnitQuadVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, theUnitQuadVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([theUnitQuad]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    var stride = 0;        
    var offset = 0;
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, stride, offset);

    // setup matrixes, one per instance
    const numInstances = 1;
    const matrixData = new Float32Array(numInstances * 16); // make a typed array with one view per matrix
    const matrices = [];
    for (let i = 0; i < numInstances; ++i) 
    {
        const byteOffsetToMatrix = i * 16 * 4; 
        const numFloatsForView = 16;
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array/Float32Array
        // new Float32Array(buffer [, byteOffset [, length]])
        matrices.push(new Float32Array(matrixData.buffer, byteOffsetToMatrix, numFloatsForView));
    }

    const modelBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, modelBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, matrixData.byteLength, gl.DYNAMIC_DRAW); // empty allocation of buffer

    // set up all 4 attributes for model attribute
    // A mat4 actually uses 4 consecutive attribute slots.
    const theMatrixStride = 4 * 16;
    for (let i = 0; i < 4; i++)
    {
        const loc = modelAttributeLocation + i;
        gl.enableVertexAttribArray(loc);
        // note the stride and offset
        let offset = i * 16;  // 4 floats per row, 4 bytes per float
        gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, theMatrixStride, offset);
        gl.vertexAttribDivisor(loc, 1); // attribute only changes for each 1 instance
    }

    // ---------------- WebGL State Init ----------------
    gl.clearColor(0.16, 0.16, 0.16, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // ---------------- Time Init ----------------
	var oldTimeStamp = 0.0;
	var seconds = 0.0;
	var deltaTime = 0.0;
 
    // ---------------- For right now ----------------
    gl.useProgram(program);

    // ---------------- Start Render Loop ----------------
    window.requestAnimationFrame(render);
    
    // ---------------- Render ----------------
    function render(timeStamp)
    {
        // -------- Time Update -------- 
        deltaTime = (timeStamp - oldTimeStamp) / 1000; // in seconds
        oldTimeStamp = timeStamp;
        seconds += deltaTime;

        // -------- Resize Canvas and NDC -------- 
        resize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // -------- Use Shader and VAO -------- 
        gl.bindVertexArray(theUnitQuadVAO);

        // -------- Update Instance Matrices --------
        for(let i = 0; i < matrices.length; i++)
        {
            mat4.rotateZ(matrices[i], matrices[i], seconds / 2);
        }
        // -------- Draw Call/s --------
        gl.drawArraysInstanced(gl.TRIANGLES, 0, numVertices, numInstances);
        
		// -------- Restart Render Loop --------
        window.requestAnimationFrame(render);
    }
}

