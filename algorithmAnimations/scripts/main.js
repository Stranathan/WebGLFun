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
    document.addEventListener('keydown', sortStuff);

    function sortStuff(e)
    {
        if(animationSwitch == false)
        {
            animationSwitch = true;
            animationCount += 1;
        }
    }

    var numberOfCirclesToSort = 8;
    var arrayOfCirclesToSort = []

    for(let i = 0; i < numberOfCirclesToSort; i++)
    {
        let aLittleBit = 0.1
        let rnd = Math.random() + aLittleBit; // [0.1, 1]
        arrayOfCirclesToSort.push(rnd); // random array of radii, really the scale
    }

    // ---- positions along circle of radius circlePathRadius
    var circleBoundaryCoordsObj = makeACircleBoundary(numberOfCirclesToSort, circlePathRadius);
    var firstLineCoordsObj = makeALine(x1 * AR, y1, x2 * AR, y2, numberOfCirclesToSort);
    var secondLineCoordsObj = makeALine(x1 * AR, y3, x3 * AR, y3, numberOfCirclesToSort);
    var thirdLineCoordsObj = makeALine(x3 * AR, y3, x2 * AR, y3, numberOfCirclesToSort);

    // ---------------- Init Shader program ----------------
	var program = createProgramFromSources(gl, mergeSortVS, mergeSortFS);
	var programUTime = gl.getUniformLocation(program, "time");
    var programUResolution = gl.getUniformLocation(program, "resoluton");
    var programUModel = gl.getUniformLocation(program, "model");
    var programURadCol = gl.getUniformLocation(program, "radCol");

	
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
        
        //
        if(animationSwitch == true)
        {
            if( tt < 1.0)
            {
                tt += deltaTime;
            }
            else
            {
                animationSwitch = false;
            }
        }
        
        
        // -------- Resize canvas --------
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        resize(gl.canvas);
        AR = gl.canvas.width / gl.canvas.height;
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); // [NDC] => [pixels]

        // gl.uniformMatrix4fv(programProjectionUniformLocation, false, projection);
        gl.uniform1f(programUTime, seconds);
        gl.uniform2f(programUResolution, gl.canvas.width, gl.canvas.height);

        for(let i = 0; i < arrayOfCirclesToSort.length; i++)
        {
            let model = mat4.create();
            mat4.translate(model, model,
                 [lerp(circleBoundaryCoordsObj.x[i] * (1.0 / AR), firstLineCoordsObj.x[i] * (1.0  / AR), tt),
                  lerp(circleBoundaryCoordsObj.y[i], firstLineCoordsObj.y[i], tt),
                   0]);
            mat4.scale(model, model,
                 [baseScale * arrayOfCirclesToSort[i] * (gl.canvas.height / gl.canvas.width),
                  baseScale * arrayOfCirclesToSort[i],
                  baseScale * arrayOfCirclesToSort[i]]);
            gl.uniformMatrix4fv(programUModel, false, model);
            gl.uniform1f(programURadCol, arrayOfCirclesToSort[i]);
            gl.drawArrays(gl.TRIANGLES, 0, circleObj.numVerts);
        }
		// -------- Restart Render Loop --------
        window.requestAnimationFrame(renderLoop);
	}
}

main();
