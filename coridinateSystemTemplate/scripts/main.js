'use strict';



const canvas = document.getElementById("cc");
const gl = canvas.getContext('webgl2');

function main()
{
    // look up the divcontainer
    var divContainerElement = document.querySelector("#divcontainer");

    // make the div
    var div = document.createElement("div");

    // assign it a CSS class
    div.className = "floating-div";

    // make a text node for its content
    var textNode = document.createTextNode("");
    div.appendChild(textNode);

    // add it to the divcontainer
    divContainerElement.appendChild(div);

    // ---------------- XZ-Plane grid lines shader program ----------------
	var xzPlaneVerticalProgram = createProgramFromSources(gl, xzPlaneVerticalProgramVS, xzPlaneVerticalProgramFS);
	var xzPlaneVerticalProgramUTime = gl.getUniformLocation(xzPlaneVerticalProgram, "time");
    var xzPlaneVerticalProgramUResolution = gl.getUniformLocation(xzPlaneVerticalProgram, "resoluton");
    var xzPlaneVerticalProgramUView = gl.getUniformLocation(xzPlaneVerticalProgram, "view");
    var xzPlaneVerticalProgramUProjection = gl.getUniformLocation(xzPlaneVerticalProgram, "projection");
    
    // ------------------ Camera/s Init------------------
    var camRadius = 20.;
    var maxCamRadius = 100;
    var camPos = vec4.fromValues(0, 3, -2., 1.);
    var camUp = vec4.fromValues(0.0, 1.0, 0.0, 1.0); // really world up for gram-schmidt process
    var targetPos = vec3.fromValues(0.0, 0.0, 0.0);

    // ------------------ MVP Init------------------
    var view = mat4.create();
    mat4.lookAt(view, [camPos[0], camPos[1], camPos[2]], targetPos, [camUp[0], camUp[1], camUp[2]]);
    var projection = mat4.create();
    let fieldOfVision = 0.5 * Math.PI / 2.;
    let aspectRatio = gl.canvas.width / gl.canvas.height;
    mat4.perspective(projection, fieldOfVision, aspectRatio, 1, 100);

    
    // ------------------ Mouse Picking Stuff ------------------
    var firstMouseBtnRayCastSwitch = false;
    var secondMouseBtnRayCastSwitch = false;

    var setPanningDirectionSwitch = false;
    var cu = vec3.create();
    var cf = vec3.create();
    var cr = vec3.create();

    var clickRayDirWorld = null;
    var mouseMoveRotionAxis = vec3.create();
    //var deltaTime = 0.0167; // init to 60fps just in case to make compiler happy (value not set til render loop)

    // ------------------ Event Handling Init------------------
    window.addEventListener('mousedown', function(event) { onMouseDown(event);});
    window.addEventListener('mousemove', function(event) { onMouseMove(event);});
    window.addEventListener('mouseup', function(event) { onMouseUp(event);});
    window.addEventListener('wheel', function(event) { onMouseWheel(event);});

    // ---------------- XZ-Plane VAO
    var xzPlaneVerticalVAO = gl.createVertexArray();
    gl.bindVertexArray(xzPlaneVerticalVAO);
    var xzPlaneVerticalVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, xzPlaneVerticalVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(theUnitZLine), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttribLoc);
    gl.vertexAttribPointer(positionAttribLoc, 3, gl.FLOAT, false, 0, 0);

    /*
        Note:
        We make an array of total size needed for the matrix transforms that will be sent to our attribute
        this is XZVertLinesTotalTransforms
        XZVertLinesInstancesTransforms "sees this" in XZVertLinesTotalTransforms.buffer:
        (see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array/Float32Array)
        "When called with a buffer, and optionally a byteOffset and a length argument, a new typed array view is created that views the specified ArrayBuffer"
        The goal behind this is that we can just use XZVertLinesInstancesTransforms to manipulate matrix info and the buffer will
        take care of itself, I think
    */
    const XZVertLinesTotalTransforms = new Float32Array(numXZVerticalInstances * 16); // 16 floats per mat4, 
    const XZVertLinesInstancesTransforms = [];

    for (let i = 0; i < numXZVerticalInstances; i++) 
    {
        const byteOffsetToMatrix = i * 16 * 4; // 4 bytes per float, each mat4 has 16 floats
        const numFloatsForView = 16;
        // new Float32Array(buffer [, byteOffset [, length]]);
        XZVertLinesInstancesTransforms.push
            (
                new Float32Array
                    (
                    XZVertLinesTotalTransforms.buffer,
                    byteOffsetToMatrix,
                    numFloatsForView
                    )
            );
    }
    
    // ---------------- Make the transform attrib data
    for (let i = 0; i < XZVertLinesInstancesTransforms.length; i++)
    {
        // ----- Note: this is kinda specific to my starting geometry (a line of length 1 at the origin on the z-axis)
        // positve x
        if(i < XZVertLinesInstancesTransforms.length / 4)
        {
            let theTransform = mat4.create();
            let theTranslation = [i * gridRes, 0., 0.];
            let theScale = [1, 1, lineLength];
            mat4.scale(XZVertLinesInstancesTransforms[i], theTransform, theScale);
            mat4.translate(XZVertLinesInstancesTransforms[i], XZVertLinesInstancesTransforms[i], theTranslation);
        }
        // negative x
        else if( i >= XZVertLinesInstancesTransforms.length / 4 && i < XZVertLinesInstancesTransforms.length / 2)
        {
            let moddedI = i % (XZVertLinesInstancesTransforms.length / 4);
            let theTransform = mat4.create();
            let theTranslation = [-moddedI * gridRes, 0., 0.];
            let theScale = [1, 1, lineLength];
            mat4.scale(XZVertLinesInstancesTransforms[i], theTransform, theScale);
            mat4.translate(XZVertLinesInstancesTransforms[i], XZVertLinesInstancesTransforms[i], theTranslation);        }
        // positve z
        else if(i >= XZVertLinesInstancesTransforms.length / 2 && i < (3/4) * XZVertLinesInstancesTransforms.length)
        {
            let moddedI = i % (XZVertLinesInstancesTransforms.length / 2);
            let theTransform = mat4.create();
            let theTranslation = [moddedI * gridRes, 0., 0.];
            let theScale = [1, 1, lineLength];
            mat4.rotateY(XZVertLinesInstancesTransforms[i], theTransform, Math.PI * 0.5);
            mat4.scale(XZVertLinesInstancesTransforms[i], XZVertLinesInstancesTransforms[i], theScale);
            mat4.translate(XZVertLinesInstancesTransforms[i], XZVertLinesInstancesTransforms[i], theTranslation);
        }
        // negative z
        else
        {
            let moddedI = i % ((3/4) * XZVertLinesInstancesTransforms.length);
            let theTransform = mat4.create();
            let theTranslation = [-moddedI * gridRes, 0., 0.];
            let theScale = [1, 1, lineLength];
            mat4.rotateY(XZVertLinesInstancesTransforms[i], theTransform, Math.PI * 0.5);
            mat4.scale(XZVertLinesInstancesTransforms[i], XZVertLinesInstancesTransforms[i], theScale);
            mat4.translate(XZVertLinesInstancesTransforms[i], XZVertLinesInstancesTransforms[i], theTranslation);
        }
    }

    // ---------------- Set the transform attrib
    const XZVertLinesAttribBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, XZVertLinesAttribBuffer);
    //  gl.bufferData(gl.ARRAY_BUFFER, XZVertLinesTotalTransforms.byteLength, gl.DYNAMIC_DRAW);
    gl.bufferData(gl.ARRAY_BUFFER, XZVertLinesTotalTransforms, gl.STATIC_DRAW);

    // ---- if we need to change the transform data, can be done in real time if gl draw hint is set to gl.DYNAMIC_DRAW:
    // gl.bindBuffer(gl.ARRAY_BUFFER, XZVertLinesAttribBuffer);
    // gl.bufferSubData(gl.ARRAY_BUFFER, 0, XZVertLinesTotalTransforms);

    // ---------------- Init model attribute ----------------
    // set all 4 attributes for model attribute; mat4 in glsl is actually 4 vec4s
    for (let i = 0; i < 4; ++i)
    {
        const attribLocation = modelAttribLoc + i;
        gl.enableVertexAttribArray(attribLocation);
        // note the stride and offset
        const offset = i * 16;  // 4 floats per row, 4 bytes per float
        gl.vertexAttribPointer(
            attribLocation,   // location
            4,                // size (num values to pull from buffer per iteration)
            gl.FLOAT,         // type of data in buffer
            false,            // normalize
            bytesPerMatrix,   // stride, num bytes to advance to get to next set of values
            offset,           // offset in buffer
        );
        // this line says this attribute only changes for each 1 instance
        gl.vertexAttribDivisor(attribLocation, 1);
    }

    // ---------------- Basis Vectors Init ----------------
    var renderables = [];


    var basisVectorsProgram = createProgramFromSources(gl, basisVectorsVS, basisVectorsFS);
    var basisVectorsProgramUTime = gl.getUniformLocation(basisVectorsProgram, "time");
    var basisVectorsProgramUResolution = gl.getUniformLocation(basisVectorsProgram, "resoluton");
    var basisVectorsProgramUModel = gl.getUniformLocation(basisVectorsProgram, "model");
    var basisVectorsProgramUView = gl.getUniformLocation(basisVectorsProgram, "view");
    var basisVectorsProgramUProjection = gl.getUniformLocation(basisVectorsProgram, "projection");

    // TESTING
    var quadVAO = gl.createVertexArray();
    var quadVBO = gl.createBuffer();
    gl.bindVertexArray(quadVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(theUnitQuadWithColors), gl.STATIC_DRAW);
    var stride = 6 * 4; // byte stride
    var offset = 0;
    gl.vertexAttribPointer(positionAttribLoc, 3, gl.FLOAT, false, stride, offset);
    gl.enableVertexAttribArray(positionAttribLoc);
    offset = 3 * 4; // byte offset
    gl.vertexAttribPointer(colorAttribLoc, 3, gl.FLOAT, false, stride, offset);
    gl.enableVertexAttribArray(colorAttribLoc);

    let quadModel = mat4.create();
    mat4.scale(quadModel,quadModel, [2.,2.,2.]);  

    renderables.push(
        {tag: "quad",
        transform: quadModel,
        vao: quadVAO,
        primitiveType: gl.TRIANGLES,
        vertCount: 6,
        program: basisVectorsProgram,
        uniformLocations: {resolution: basisVectorsProgramUResolution,
                            time: basisVectorsProgramUTime,
                            model: basisVectorsProgramUModel,
                            view: basisVectorsProgramUView,
                            projection: basisVectorsProgramUProjection
                        }
        });
    // ---- THE Y AXIS
    var yVAO = gl.createVertexArray();
    var yVBO = gl.createBuffer();
    gl.bindVertexArray(yVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, yVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(theUnitYLineWithColors), gl.STATIC_DRAW);
    var stride = 6 * 4; // byte stride
    var offset = 0;
    gl.vertexAttribPointer(positionAttribLoc, 3, gl.FLOAT, false, stride, offset);
    gl.enableVertexAttribArray(positionAttribLoc);
    offset = 3 * 4; // byte offset
    gl.vertexAttribPointer(colorAttribLoc, 3, gl.FLOAT, false, stride, offset);
    gl.enableVertexAttribArray(colorAttribLoc);

    let yModel = mat4.create();
    mat4.scale(yModel,yModel, [lineLength,lineLength,lineLength]);

    renderables.push(
        {tag: "y-axis",
        transform: yModel,
        vao: yVAO,
        primitiveType: gl.LINES,
        vertCount: 2,
        program: basisVectorsProgram,
        uniformLocations: {resolution: basisVectorsProgramUResolution,
                            time: basisVectorsProgramUTime,
                            model: basisVectorsProgramUModel,
                            view: basisVectorsProgramUView,
                            projection: basisVectorsProgramUProjection
                        }
        });
    // ---- THE X AXIS
    var xVAO = gl.createVertexArray();
    var xVBO = gl.createBuffer();
    gl.bindVertexArray(xVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, xVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(theUnitXLineWithColors), gl.STATIC_DRAW);
    var stride = 6 * 4; // byte stride
    var offset = 0;
    gl.vertexAttribPointer(positionAttribLoc, 3, gl.FLOAT, false, stride, offset);
    gl.enableVertexAttribArray(positionAttribLoc);
    offset = 3 * 4; // byte offset
    gl.vertexAttribPointer(colorAttribLoc, 3, gl.FLOAT, false, stride, offset);
    gl.enableVertexAttribArray(colorAttribLoc);

    let xModel = mat4.create();
    mat4.scale(xModel,xModel, [lineLength,lineLength,lineLength]);

    renderables.push(
        {tag: "x-axis",
        transform: xModel,
        vao: xVAO,
        primitiveType: gl.LINES,
        vertCount: 2,
        program: basisVectorsProgram,
        uniformLocations: {resolution: basisVectorsProgramUResolution,
                            time: basisVectorsProgramUTime,
                            model: basisVectorsProgramUModel,
                            view: basisVectorsProgramUView,
                            projection: basisVectorsProgramUProjection
                        }
        });

    // ---------------- WebGL State Init ----------------
    gl.clearColor(clearCol[0], clearCol[1], clearCol[2], clearCol[3]);
    gl.enable(gl.DEPTH_TEST);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // ---------------- Time Init ----------------
    var oldTimeStamp = 0.0;
    var seconds = 0.0;
    var deltaTime = 0.0;

    var clipspace = vec4.fromValues(1, 1, 1, 1); 
    // ---------------- Start Render Loop ----------------
    window.requestAnimationFrame(render);

    function render(timeStamp) 
    {
        // -------- Resize canvas --------
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        resize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // -------- Time Update -------- 
        deltaTime = (timeStamp - oldTimeStamp) / 1000.0; // in seconds
        oldTimeStamp = timeStamp;
        seconds += deltaTime;    

        // -------- XZ Plane Render --------
        gl.bindVertexArray(xzPlaneVerticalVAO);
        gl.useProgram(xzPlaneVerticalProgram);

        // update camPos view matrix
        mat4.lookAt(view, [camPos[0], camPos[1], camPos[2]], targetPos, [camUp[0], camUp[1], camUp[2]]);

        // update uniforms
        gl.uniform1f(xzPlaneVerticalProgramUTime, seconds);
        gl.uniform2f(xzPlaneVerticalProgramUResolution, gl.canvas.width, gl.canvas.height);
        gl.uniformMatrix4fv(xzPlaneVerticalProgramUView, false, view);
        gl.uniformMatrix4fv(xzPlaneVerticalProgramUProjection, false, projection);

        gl.drawArraysInstanced(gl.LINES, 0, 2, numXZVerticalInstances);

        // -------- Basis Vectors Render --------
        for(let i = 0; i < renderables.length; i++)
        {
            // bind vao
            gl.bindVertexArray(renderables[i].vao);
            gl.useProgram(renderables[i].program);
            
            // pass uniforms
            for( let uniform in renderables[i].uniformLocations)
            {
                switch(uniform)
                {
                    case "time":
                        gl.uniform1f(renderables[i].uniformLocations[uniform], seconds);
                        break;
                    case "resolution":
                        gl.uniform2f(renderables[i].uniformLocations[uniform], gl.canvas.width, gl.canvas.height);
                        break;
                    case "model":
                        gl.uniformMatrix4fv(renderables[i].uniformLocations[uniform], false, renderables[i].transform);
                        break;
                    case "view":
                        gl.uniformMatrix4fv(renderables[i].uniformLocations[uniform], false, view); // this is ok as long as we only have one camera
                        break;
                    case "projection":
                        gl.uniformMatrix4fv(renderables[i].uniformLocations[uniform], false, projection); //  ``
                        break;
                    default:
                        console.log("some weird uniform was attached to the renderable and it doesn't know what to do");
                }
            }
            gl.drawArrays(renderables[i].primitiveType, 0, renderables[i].vertCount);
        }

        // ---------------- Numbers Render ----------------
        // compute a clip space position
        // using the matrix we computed for the F
        var aTestPoint = [-1, 0., 0., 1.];
        vec4.transformMat4(clipspace, aTestPoint, view);
        vec4.transformMat4(clipspace, clipspace, projection);
        
        // persepctive division
        clipspace[0] /= clipspace[3];
        clipspace[1] /= clipspace[3];
        clipspace[2] /= clipspace[3];
        
        // convert from clipspace to pixels
        var pixelX = (clipspace[0] *  0.5 + 0.5) * gl.canvas.width; // Note: this is actually the negative of what it should be
        var pixelY = (clipspace[1] * -0.5 + 0.5) * gl.canvas.height;
        
        // position the div
        div.style.left = Math.floor(pixelX) + "px";
        div.style.top  = Math.floor(pixelY) + "px";
        textNode.nodeValue = 1;

        // -------- Restart Render Loop --------
        window.requestAnimationFrame(render);
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

main();
