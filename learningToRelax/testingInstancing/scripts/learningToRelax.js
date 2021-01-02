'use strict';

// ---------------- glMatrix Lib Aliases ----------------
var vec2 = glMatrix.vec2;
var vec3 = glMatrix.vec3;
var vec4 = glMatrix.vec4;
var mat4 = glMatrix.mat4;

const canvas = document.getElementById("cc");
const gl = canvas.getContext('webgl2');

var rnd = Math.random();

function _ready()
{
    if (!gl) 
    {
        return;
    }

    parseMeshString(unitCubeObjStr);
    
    main();
}

function main() 
{
	// ---------------- Init Shader program ----------------
	var program = createProgramFromSources(gl, vertexShaderSourceOneAndHalf, fragmentShaderSourceOneAndHalf);
	var programViewUniformLocation = gl.getUniformLocation(program, "view");
	var programProjectionUniformLocation = gl.getUniformLocation(program, "projection");
	
	// ---- Attrib locations
	const positionAttribLoc = 0;
	const texAttribLoc = 1;
	const normalAttribLoc = 2;
	const colorAttribLoc = 3;
	const instanceMatricesLoc = 4;

	// ---------------- Camera/s Init ----------------
    var camRadius = 10.0;
	var maxCamRadius = 25;
    var camPos = vec4.fromValues(0, 0, -camRadius, 1); // INTERESANT
    var camUp = vec4.fromValues(0.0, 1.0, 0.0, 1.0); // really world up for gram-schmidt process
    var targetPos = vec3.fromValues(0.0, 0.0, 0.0);

    // ---------------- MVP Init ----------------
    var view = mat4.create();
	mat4.lookAt(view, [camPos[0], camPos[1], camPos[2]], targetPos, [camUp[0], camUp[1], camUp[2]]);
	
	var projection = mat4.create();
	mat4.ortho(projection, -4, 4, -4, 4, 1, 100)
    // let fieldOfVision = 0.5 * Math.PI / 2.;
    // let aspectRatio = gl.canvas.width / gl.canvas.height;
	// mat4.perspective(projection, fieldOfVision, aspectRatio, 1, 100);
	
	 // ---------------- Instance Settings
	 const numInstances = 150;
	 const halfOfNumInstances= numInstances / 2;

	// ---------------- Animation Controls ----------------
	var spiralRadius = 3.0;
	var startingPower = 8;
	var theValue = Math.sin(1);
	var theOtherValue = 0.570803;
	const timeIndicesX = [];
	var AR = 16.0/9.0;

    // ---------------- Instance VAO ----------------
    getUnitCubeAttribDataFromString
	const unitCubeVAO = gl.createVertexArray();
	gl.bindVertexArray(unitCubeVAO);
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

	// ---------------- Color Attrib ----------------
	const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    makeInstanceColorsArray(numInstances);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(instanceCols), gl.STATIC_DRAW);

	// ---- Init Color Attrib
	gl.enableVertexAttribArray(colorAttribLoc);
	gl.vertexAttribPointer(colorAttribLoc, 4, gl.FLOAT, false, 0, 0);
	gl.vertexAttribDivisor(colorAttribLoc, 1); // this line says this attribute only changes for each 1 instance

	// ---------------- Init Instance Matrices ----------------
	
	// make a typed array with one view per matrix
	const matrixData = new Float32Array(numInstances * 16); // array of 16 * 5 floats 
	const matrices = [];

	// this creates an array of five zeroed arrays: 5 x [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,]
	for (let i = 0; i < numInstances; i++) 
	{
		const byteOffsetToMatrix = i * 16 * 4;
		const numFloatsForView = 16; // length
		// Float32Array(buffer, byteOffset, length)
		matrices.push(new Float32Array(matrixData.buffer, byteOffsetToMatrix, numFloatsForView));
		timeIndicesX.push(0.0);
	}
	
	// ---------------- Init Instance Matrices Attrib ----------------
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

    // ---------------- Init Transforms ----------------
    var yDelta = 0.1;
    var startingY = -3.7;
    var xDelta = yDelta / 2.;
    var leScale = 0.1;
    for(let i = 0 ; i < matrices.length; i++)
    {
        if( i < halfOfNumInstances)
        {
            let yTranslation = i * yDelta;
			let xTranslation = -xDelta;
			
			let interpolant = i / halfOfNumInstances;

            let translationTransform = mat4.create();
			mat4.translate(
				matrices[i],
				translationTransform,
				[xTranslation,
				 yTranslation + startingY,
				 0]);
            mat4.scale(matrices[i], matrices[i],  [leScale * 1.0/AR, leScale, leScale]);
        }
        else
        {
            let yTranslation = (i - halfOfNumInstances) * yDelta;
			let xTranslation = xDelta;
			
			let interpolant = (i - halfOfNumInstances)/ halfOfNumInstances;

            let translationTransform = mat4.create();
			mat4.translate(
				matrices[i],
				translationTransform,
				[xTranslation,
				 yTranslation + startingY,
				 0]);
            mat4.scale(matrices[i], matrices[i],  [leScale * 1.0/AR, leScale, leScale]);
        }
    }

	// ---------------- WebGL State Init ----------------
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.DEPTH_TEST);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        
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
		
		if(seconds > 30)
		{
			seconds += 10. * deltaTime;
		}
		// -------- Resize canvas --------
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		resize(gl.canvas);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); // [NDC] => [pixels]
		gl.useProgram(program);
		// setup all attributes
		gl.bindVertexArray(unitCubeVAO);
		// -------- Update Instance Matrix Data --------
		for(let i = 0 ; i < matrices.length / 2.0; i++)
		{
			let yTranslation = (halfOfNumInstances - i) * yDelta;
			let xTranslation = -xDelta; // the base translation
			let translationTransform = mat4.create();
			
			var theInterpolant = (halfOfNumInstances - i) / halfOfNumInstances;
			var theFunction = Math.sin(Math.pow(theInterpolant * 0.5, Math.max(0, (theInterpolant + (0.5 * (1. - theInterpolant))) * (-1. * seconds)  + startingPower)));

			if(theFunction < theValue)
			{
				mat4.translate(matrices[halfOfNumInstances - 1 - i],
								translationTransform,
								[xTranslation - spiralRadius * theFunction,
								yTranslation + startingY ,
								0.0]
				);
				mat4.scale(matrices[halfOfNumInstances - 1 - i], matrices[halfOfNumInstances - 1 - i],  [leScale * 1.0/AR, leScale, leScale]);
				
				// save the time to offset when piecewise changes --> whatever is last time will be the offset time
				timeIndicesX[halfOfNumInstances - 1 - i] = seconds;

				// second column
				let secondColumnTranslationTransform = mat4.create();
				
				mat4.translate(
					matrices[numInstances - 1 - i],
					secondColumnTranslationTransform,
					[-xTranslation + spiralRadius * theFunction,
					yTranslation + startingY,
					0.0]
					);
				mat4.scale(matrices[numInstances - 1 - i], matrices[numInstances - 1 - i],  [leScale * 1.0/AR, leScale, leScale]);

				// save the time to offset when piecewise changes --> whatever is last time will be the offset time
				timeIndicesX[numInstances - 1 - i] = seconds;
			}
			else
			{
				mat4.translate(matrices[halfOfNumInstances - 1 - i],
					translationTransform,
					[xTranslation - spiralRadius * (Math.cos(theOtherValue +  0.01 + seconds - timeIndicesX[halfOfNumInstances - 1 - i])),
					yTranslation + startingY,
					0]
					);
				mat4.scale(matrices[halfOfNumInstances - 1 - i], matrices[halfOfNumInstances - 1 - i],  [leScale * 1.0/AR, leScale, leScale]);

				let secondColumnTranslationTransform = mat4.create();
				
				mat4.translate(
					matrices[numInstances - 1 - i],
					secondColumnTranslationTransform,
					[-xTranslation + spiralRadius * (Math.cos(theOtherValue + 0.01 + seconds - timeIndicesX[halfOfNumInstances - 1 - i])),
					yTranslation + startingY,
					0]
					);
				mat4.scale(matrices[numInstances - 1 - i], matrices[numInstances - 1 - i],  [leScale * 1.0/AR, leScale, leScale]);
			}
		}
	
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
