'use strict';

// ---------------- glMatrix Lib Aliases ----------------
var vec2 = glMatrix.vec2;
var vec3 = glMatrix.vec3;
var vec4 = glMatrix.vec4;
var mat4 = glMatrix.mat4;

const canvas = document.getElementById("cc");
const gl = canvas.getContext('webgl2');

// ---- settings
const baseScale = 0.2;
const circleSideNum = 30;

function main() 
{
    document.addEventListener('keydown', sortStuff);

    function sortStuff(e)
    {
        if(arrayOfCirclesToSort != null)
        {
            arrayOfCirclesToSort = mergeSort(arrayOfCirclesToSort);
        }
    }

    var numberOfCirclesToSort = 16;
    var arrayOfCirclesToSort = []
    for(let i = 0; i < numberOfCirclesToSort; i++)
    {
        let aLittleBit = 0.1
        let rnd = Math.random() + aLittleBit; // [0.1, 1]
        arrayOfCirclesToSort.push(rnd); // random array of radii, really the scale
    }
    var circleBoundaryCoordsObj = makeACircleBoundary(numberOfCirclesToSort, 0.7);

	// ---------------- Init Shader program ----------------
	var program = createProgramFromSources(gl, mergeSortVS, mergeSortFS);
	var programUTime = gl.getUniformLocation(program, "time");
    var programUResolution = gl.getUniformLocation(program, "resoluton");
    var programUModel = gl.getUniformLocation(program, "model");

	
	// ---- Attrib locations
    // var positionAttributeLocation = 0;
    
    // ---- Screen VAO
    var circleVAO = gl.createVertexArray();
    var positionBuffer = gl.createBuffer();
    var circleObj = makeACircle(circleSideNum, 1);

    gl.bindVertexArray(circleVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circleObj.vertexData), gl.STATIC_DRAW);
    var size = 3;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;        
    var offset = 0;
    gl.vertexAttribPointer(0, size, type, normalize, stride, offset);
    gl.enableVertexAttribArray(0);


	// ---------------- WebGL State Init ----------------
    gl.clearColor(0, 0, 0, 0);
    // gl.enable(gl.DEPTH_TEST);
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
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); // [NDC] => [pixels]

        // gl.uniformMatrix4fv(programProjectionUniformLocation, false, projection);
        gl.uniform1f(programUTime, seconds);
        gl.uniform2f(programUResolution, gl.canvas.width, gl.canvas.height);

        for(let i = 0; i < arrayOfCirclesToSort.length; i++)
        {
            let model = mat4.create();
            mat4.translate(model, model, [circleBoundaryCoordsObj.x[i] * (gl.canvas.height / gl.canvas.width), circleBoundaryCoordsObj.y[i], 0]);
            mat4.scale(model, model,
                 [baseScale * arrayOfCirclesToSort[i] * (gl.canvas.height / gl.canvas.width),
                  baseScale * arrayOfCirclesToSort[i],
                  baseScale * arrayOfCirclesToSort[i]]);
            gl.uniformMatrix4fv(programUModel, false, model);
            gl.drawArrays(gl.TRIANGLES, 0, circleObj.numVerts);
        }
		// -------- Restart Render Loop --------
        window.requestAnimationFrame(renderLoop);
	}
}

main();
