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
	// ------------------ Mouse Picking Stuff ------------------
    var firstMouseBtnRayCastSwitch = false;
    var secondMouseBtnRayCastSwitch = false;

    var setPanningDirectionSwitch = false;
    var cu = vec3.create();
    var cf = vec3.create();
    var cr = vec3.create();

    var clickRayDirWorld = null;
    var mouseMoveRotionAxis = vec3.create();
    var deltaTime = 0.0167; // init to 60fps just in case to make compiler happy (value not set til render loop)

    // window.addEventListener('mousedown', function(event) { onMouseDown(event);});
    // window.addEventListener('mousemove', function(event) { onMouseMove(event);});
    // window.addEventListener('mouseup', function(event) { onMouseUp(event);});
	// window.addEventListener('wheel', function(event) { onMouseWheel(event);});
	
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
	var maxCamRadius = camRadius * 2.0;
    var camPos = vec4.fromValues(.5 * camRadius, 0, -2 * camRadius, 1); // INTERESANT
    var camUp = vec4.fromValues(0.0, 1.0, 0.0, 1.0); // really world up for gram-schmidt process
    var targetPos = vec3.fromValues(0.0, 0.0, 0.0);

	// ---------------- MVP Init ----------------
	var AR = 16.0/9.0;
    var view = mat4.create();
	mat4.lookAt(view, [camPos[0], camPos[1], camPos[2]], targetPos, [camUp[0], camUp[1], camUp[2]]);
	
	var projection = mat4.create();
	var screenSize = 7;
	mat4.ortho(projection, -screenSize*AR, screenSize*AR, -screenSize, screenSize, 1, 100)
    // let fieldOfVision = 0.5 * Math.PI / 2.;
    // let aspectRatio = gl.canvas.width / gl.canvas.height;
	// mat4.perspective(projection, fieldOfVision, aspectRatio, 1, 100);
	
	 // ---------------- Instance Settings
	 const numInstances = 250;
	 const halfOfNumInstances= numInstances / 2;

	// ---------------- Animation Controls ----------------
	var spiralRadius = 5.0;
	var timeDesiredForSeperation = 0.9;
	var killTime = 15;

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
    var startingY = -screenSize + 1;
    var xDelta = yDelta * AR;
    var leScale = 0.1;
    for(let i = 0 ; i < matrices.length; i++)
    {
        if( i < halfOfNumInstances)
        {
            let yTranslation = i * yDelta;
			let xTranslation = -xDelta;
			
            let translationTransform = mat4.create();
			mat4.translate(
				matrices[i],
				translationTransform,
				[xTranslation,
				 yTranslation + startingY,
				 0]);
            mat4.scale(matrices[i], matrices[i],  [leScale * AR, leScale * AR, leScale]);
        }
        else
        {
            let yTranslation = (i - halfOfNumInstances) * yDelta;
			let xTranslation = xDelta;
			
            let translationTransform = mat4.create();
			mat4.translate(
				matrices[i],
				translationTransform,
				[xTranslation,
				 yTranslation + startingY,
				 0]);
            mat4.scale(matrices[i], matrices[i],  [leScale * AR, leScale * AR, leScale]);
        }
    }

	// ---------------- WebGL State Init ----------------
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.DEPTH_TEST);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	
	gl.useProgram(program); // needs to only be called once, only using one shader
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
		
		if(seconds < 2.0 * timeDesiredForSeperation)
		{
			seconds += deltaTime / 10;
		}
		else if(seconds >= 2.0 * timeDesiredForSeperation && seconds < 2.0 *timeDesiredForSeperation + 1)
		{
			let l = (seconds - 2.0 * timeDesiredForSeperation);
			seconds += (1. - l) * deltaTime / 10 + l * deltaTime / 4; 
		}
		else
		{
			seconds += deltaTime / 4;
		}
		
		// -------- Resize canvas --------
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		resize(gl.canvas);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); // [NDC] => [pixels]

		// -------- Change view matrix --------
		//mat4.lookAt(view, [camPos[0], camPos[1], camPos[2]], targetPos, [camUp[0], camUp[1], camUp[2]]);

		// -------- Update Instance Matrix Data --------
		for(let i = 0 ; i < matrices.length / 2.0; i++)
		{
			let yTranslation = (halfOfNumInstances - i) * yDelta;
			let xTranslation = -xDelta; // the base translation
			let translationTransform = mat4.create();
			let interpolant =  (halfOfNumInstances - i) / halfOfNumInstances;

			// this is instance "time", unique copy of global time per instance
			let t = Math.max(0, seconds + -1.0 * (timeDesiredForSeperation - interpolant));
			
			var theFunction;

			if(t < killTime)
			{
				theFunction = Math.sin(t * t  * t * t);
			}
			else
			{
				theFunction = Math.sin(t * t  * t * t *  Math.exp(-10.0 * (t - killTime) * (t - killTime)));
			}

			mat4.translate( matrices[halfOfNumInstances - 1 - i],
							translationTransform,
							[xTranslation - spiralRadius * theFunction,
							yTranslation + startingY ,
							-spiralRadius *  theFunction]
						  );
			mat4.scale(matrices[halfOfNumInstances - 1 - i], matrices[halfOfNumInstances - 1 - i],  [leScale * AR, leScale * AR, leScale]);
			let secondColumnTranslationTransform = mat4.create();
				
			mat4.translate(matrices[numInstances - 1 - i],
					       secondColumnTranslationTransform,
					       [-xTranslation + spiralRadius * theFunction,
					       yTranslation + startingY,
					       +spiralRadius * theFunction]
					      );
			mat4.scale(matrices[numInstances - 1 - i], matrices[numInstances - 1 - i],  [leScale * AR, leScale * AR, leScale]);
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

	function onMouseDown(event)
    {
        let mouseClickX = event.offsetX;
        mouseClickX = (2. * mouseClickX / gl.canvas.width - 1.);
        let mouseClickY = event.offsetY;
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

        let inverseViewMatrix = mat4.create();
        mat4.invert(inverseViewMatrix, view);
        let tmp = vec4.create();
        vec4.transformMat4(tmp, ray_eye, inverseViewMatrix);
        clickRayDirWorld = vec3.fromValues(tmp[0], tmp[1], tmp[2]);

        if(event.which == 1)
        {
            //console.log("first mouse btn pressed");
            firstMouseBtnRayCastSwitch = true;
        }
        else if (event.which == 2) 
        {
            setPanningDirectionSwitch = true;
            secondMouseBtnRayCastSwitch = true;
            //console.log("right mouse btn pressed");
        }
    }
    function onMouseMove(event)
    {
        if(firstMouseBtnRayCastSwitch)
        {
            let mousePosX = event.offsetX;
            mousePosX = (2. * mousePosX / gl.canvas.width - 1.);
            let mousePosY = event.offsetY;
            mousePosY = -1 * (2. * mousePosY / gl.canvas.height - 1.);

            // #---------- RAY CASTING -------------#
            // RAY IN NDC SPACE
            let ray_clip = vec4.fromValues(mousePosX, mousePosY, -1.0, 1.0);
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
            let rayDirWorld = vec3.fromValues(tmp[0], tmp[1], tmp[2]);

            let angle = vec3.angle(clickRayDirWorld, rayDirWorld);

            // easing function for angle as a function of camera radius
            // simple lerping (1-interpolatingVal)min + interpolatingVal * max
            let interopolatingVal = camRadius/maxCamRadius;
            angle = (1 - interopolatingVal)*(angle/4) + interopolatingVal * (angle/2);

            vec3.cross(mouseMoveRotionAxis, clickRayDirWorld, rayDirWorld);

            let rotMat = mat4.create();
            mat4.rotate(rotMat, rotMat, angle, mouseMoveRotionAxis);
            vec4.transformMat4(camUp, camUp, rotMat);
            vec4.transformMat4(camPos, camPos, rotMat);
            
            // we need to get the angle per mouse move, --> set the vector from last
            // move to this vector so the next mouse move calculation is possible
            clickRayDirWorld = rayDirWorld;
        }
        else if(secondMouseBtnRayCastSwitch)
        {
            let mousePosX = event.offsetX;
            mousePosX = (2. * mousePosX / gl.canvas.width - 1.);
            let mousePosY = event.offsetY;
            mousePosY = -1 * (2. * mousePosY / gl.canvas.height - 1.);

            // #---------- RAY CASTING -------------#
            // RAY IN NDC SPACE
            let ray_clip = vec4.fromValues(mousePosX, mousePosY, -1.0, 1.0);
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
            let rayDirWorld = vec3.fromValues(tmp[0], tmp[1], tmp[2]);

            if(setPanningDirectionSwitch)
            {
                vec3.normalize(cu, [camUp[0], camUp[1], camUp[2]]);
                //console.log("the up is: " + vec3.str(cu));
                vec3.subtract(cf, targetPos, [camPos[0], camPos[1], camPos[2]]);
                vec3.normalize(cf, cf);
                //console.log("the forward is: " + vec3.str(cf));
                vec3.cross(cr, cf, cu);
                //console.log("the right is: " + vec3.str(cr));
                setPanningDirectionSwitch = false;
            }

            let panFactor = 10.;

            let relativeDiff = vec3.create();
            vec3.subtract(relativeDiff, clickRayDirWorld, rayDirWorld);
            let projectionOntoRightLen = vec3.dot(relativeDiff, cr) * panFactor;
            let projectionOntoUpLen = vec3.dot(relativeDiff, cu) * panFactor;

            let theVector = vec3.create();
            vec3.add(theVector,
                     vec3.fromValues(projectionOntoRightLen * cr[0], projectionOntoRightLen * cr[1], projectionOntoRightLen *cr[2]),
                     vec3.fromValues(projectionOntoUpLen * cu[0], projectionOntoUpLen * cu[1], projectionOntoUpLen * cu[2])
                    )
            vec3.add(targetPos, targetPos, theVector);
            vec4.add(camPos, camPos, [theVector[0], theVector[1], theVector[2], 0.]);
            clickRayDirWorld = rayDirWorld;
        }
    }
    function onMouseUp(event)
    {
        if(firstMouseBtnRayCastSwitch == true)
        {
            firstMouseBtnRayCastSwitch = false;
        }
        if(secondMouseBtnRayCastSwitch == true)
        {
            secondMouseBtnRayCastSwitch = false;
        }
    }
    function onMouseWheel(event)
    {
        if(!secondMouseBtnRayCastSwitch)
        {
            if(camRadius < maxCamRadius && camRadius > 0)
            {
                let relativePos = vec3.create();
                vec3.subtract(relativePos, targetPos, vec3.fromValues(camPos[0], camPos[1], camPos[2]));
                camRadius = vec3.length(relativePos);

                // scroll forward is negtive, scroll back is positive
                // probably do a coroutine here eventually to make it smooth
                
                vec3.normalize(relativePos, relativePos);
                let stepSize = -event.deltaY * 0.2;
                vec3.multiply(relativePos, relativePos, vec3.fromValues(stepSize, stepSize, stepSize));
                vec4.add(camPos, camPos, vec4.fromValues(relativePos[0], relativePos[1], relativePos[2], 0.));
            }
            else if(camRadius >= maxCamRadius && event.deltaY < 0)
            {
                let relativePos = vec3.create();
                vec3.subtract(relativePos, targetPos, vec3.fromValues(camPos[0], camPos[1], camPos[2]));
                camRadius = vec3.length(relativePos);

                // scroll forward is negtive, scroll back is positive
                // probably do a coroutine here eventually to make it smooth
                
                vec3.normalize(relativePos, relativePos);
                let stepSize = -event.deltaY * 0.2;
                vec3.multiply(relativePos, relativePos, vec3.fromValues(stepSize, stepSize, stepSize));
                vec4.add(camPos, camPos, vec4.fromValues(relativePos[0], relativePos[1], relativePos[2], 0.));
            }
        }
    }
}

_ready();
