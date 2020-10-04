/*
To Do:
*/

"use strict";

// ---------------- glMatrix Lib Aliases ----------------
var vec2 = glMatrix.vec2;
var vec3 = glMatrix.vec3;
var vec4 = glMatrix.vec4;
var mat4 = glMatrix.mat4;

function main() 
{
    // ------------------ Initialization ----------------
    // --------------------------------------------------
    var canvas = document.getElementById("cc");
    var gl = canvas.getContext("webgl2");
    if (!gl) 
    {
        return;
    }
    // script was deffered, so clientWidth exists and is determined by CSS display width
    var width = gl.canvas.clientWidth;
    var height = gl.canvas.clientHeight;
    // Now we can set the size of the drawingbuffer to match this
    gl.canvas.width = width;
    gl.canvas.height = height;

    // ------------------ Camera/s Init------------------
    var camRadius = 20.;
    var maxCamRadius = 30;
    var camPos = vec4.fromValues(0, 0, -camRadius, 1.);
    var camUp = vec4.fromValues(0.0, 1.0, 0.0, 1.0); // really world up for gram-schmidt process
    var targetPos = vec3.fromValues(0.0, 0.0, 0.0);

    // ------------------ Light/s Init------------------
    var sceneLight = vec3.fromValues(0, 25, 0);

    // ------------------ MVP Init------------------
    var view = mat4.create();
    mat4.lookAt(view, [camPos[0], camPos[1], camPos[2]], targetPos, [camUp[0], camUp[1], camUp[2]]);
    var projection = mat4.create();
    let fieldOfVision = 0.5 * Math.PI / 2.;
    let aspectRatio = gl.canvas.width / gl.canvas.height;
    mat4.perspective(projection, fieldOfVision, aspectRatio, 1, 50);

    // ------------------ Mouse Picking Stuff ------------------
    var rayCastSwitch = false;
    var clickRayDirWorld = null;
    var mouseMoveRotionAxis = vec3.create();
    var omega = 0;
    var deltaTime = 0.0167; // init to 60fps just in case to make compiler happy (value not set til render loop)
    var spinDecayTimer = 10;

    window.addEventListener('mousedown', function(event) { onMouseDown(event);});
    window.addEventListener('mousemove', function(event) { onMouseMove(event);});
    window.addEventListener('mouseup', function(event) { onMouseUp(event);});
    window.addEventListener('wheel', function(event) { onMouseWheel(event);});

    // ------------------ Initialize Shader Programs ------------------
    //         ------------------ Floor Quad  ------------------
    var renderables = []; // list of javascript objects with vao, program, triangle count;

    // -------- Base Shader
    var baseShaderProgram = createProgramFromSources(gl, baseVS, baseFS);
    // ---- Attribs
    var baseShaderPositionAttributeLocation = gl.getAttribLocation(baseShaderProgram, "vertexPos");
    var baseShaderNormalAttributeLocation = gl.getAttribLocation(baseShaderProgram, "vertexNormal");

    // ---- Uniforms
    var baseShaderResolutionUniformLocation = gl.getUniformLocation(baseShaderProgram, "resolution");
    var baseShaderTimeUniformLocation = gl.getUniformLocation(baseShaderProgram, "time");
    var baseShaderModelUniformLocation = gl.getUniformLocation(baseShaderProgram, "model");
    var baseShaderViewUniformLocation = gl.getUniformLocation(baseShaderProgram, "view");
    var baseShaderProjectionUniformLocation = gl.getUniformLocation(baseShaderProgram, "projection");

    var baseShaderLightUniformLocation = gl.getUniformLocation(baseShaderProgram, "lightPos");

    // ------------------ Initialize VAOs ------------------
    // -------- Base Quad
    var quadVAO = gl.createVertexArray();
    var quadVBO = gl.createBuffer();
    gl.bindVertexArray(quadVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadVBO);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadPositions), gl.STATIC_DRAW);
    var size = 3;          
    var type = gl.FLOAT;   
    var normalize = false; 
    var stride = 6 * 4; // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;
    gl.vertexAttribPointer(baseShaderPositionAttributeLocation, size, type, normalize, stride, offset);
    gl.enableVertexAttribArray(baseShaderPositionAttributeLocation);
    offset = 3 * 4;
    gl.vertexAttribPointer(baseShaderNormalAttributeLocation, 3, gl.FLOAT, false, stride, offset);
    gl.enableVertexAttribArray(baseShaderNormalAttributeLocation);
    
    // Grid floor model transform
    let model = mat4.create();
    let floorY = -2.5;
    mat4.translate(model, model, [0, floorY, 0.]);
    mat4.scale(model, model, [10, 10, 10]);
    mat4.rotateX(model, model, Math.PI / 2);

    renderables.push(
        {transform: model,
         vao: quadVAO,
         primitiveType: gl.TRIANGLES,
         arrayedTriCount: Math.round(quadPositions.length / 6),
         program: baseShaderProgram,
         uniformLocations: {resolution: baseShaderResolutionUniformLocation,
                            time: baseShaderTimeUniformLocation,
                            light: baseShaderLightUniformLocation,
                            model: baseShaderModelUniformLocation,
                            view: baseShaderViewUniformLocation,
                            projection: baseShaderProjectionUniformLocation}
        });
    
    // ------------------ Grid Overlay  ------------------
    // Could do it with barycentric coordinate in frag shader, but won't be quad grid lines

    // -------- Grid Shader
    var gridShaderProgram = createProgramFromSources(gl, gridVS, gridFS);
    // -------- Attribs
    var gridShaderPositionAttributeLocation = gl.getAttribLocation(gridShaderProgram, "vertexPos");
    // -------- Uniforms
    var gridShaderResolutionUniformLocation = gl.getUniformLocation(gridShaderProgram, "resolution");
    var gridShaderTimeUniformLocation = gl.getUniformLocation(gridShaderProgram, "time");
    var gridShaderModelUniformLocation = gl.getUniformLocation(gridShaderProgram, "model");
    var gridShaderViewUniformLocation = gl.getUniformLocation(gridShaderProgram, "view");
    var gridShaderProjectionUniformLocation = gl.getUniformLocation(gridShaderProgram, "projection");

    // -------- Grid Quad
    var gridVAO = gl.createVertexArray();
    var gridVBO = gl.createBuffer();
    gl.bindVertexArray(gridVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, gridVBO);
    // use helper function to make the vertex data for the grid lines
    let gridSize = 12;
    makeUnitGrid(gridSize); // this can be changed to not take in min/max args since it's always unit quad
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gridVerts), gl.STATIC_DRAW);
    stride = 0;
    offset = 0;
    gl.vertexAttribPointer(gridShaderPositionAttributeLocation, size, type, normalize, stride, offset);
    gl.enableVertexAttribArray(gridShaderPositionAttributeLocation);
    
    model = mat4.create();
    mat4.translate(model, model, [0, floorY + 0.1, 0.]);
    mat4.scale(model, model, [10, 10, 10]);
    mat4.rotateX(model, model, Math.PI / 2);
    // note: arrayedTriCount is really arrayed line segment count for this renderable
    renderables.push(
        {transform: model,
         vao: gridVAO,
         primitiveType: gl.LINES,
         arrayedTriCount: 4 * (gridSize + 1) * gridSize,
         program: gridShaderProgram,
         uniformLocations: {resolution: gridShaderResolutionUniformLocation,
                            time: gridShaderTimeUniformLocation,
                            model: gridShaderModelUniformLocation,
                            view: gridShaderViewUniformLocation,
                            projection: gridShaderProjectionUniformLocation}
        });

    // ------------------ Initialize gl settings ------------------
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0, 0);
    
    // ------------------ Time Init ------------------
    var oldTimeStamp = 0.0;
    var seconds = 0.0;

    // ------------------ Check for Mesh Loading Init ------------------
    var teaPotMeshCount = 0;
    //loadMesh("../rendering/models/wavefrontOBJ/lowResUtahTeapot.txt");
    loadMesh("../rendering/models/wavefrontOBJ/highResUtahTeapot.txt");
    
    // ------------------ Start Render Loop ------------------
    window.requestAnimationFrame(renderLoop);

    function renderLoop(timeStamp)
    {
        resize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // time update
        deltaTime = (timeStamp - oldTimeStamp) / 1000; // in seconds
        oldTimeStamp = timeStamp;
        seconds += deltaTime;

        // spin effect
        if(spinDecayTimer < 5)
        {
            spinDecayTimer += deltaTime;
            let decay = omega * 0.5 * Math.exp(-(1 * spinDecayTimer * spinDecayTimer));
            let rotMat = mat4.create();
            mat4.rotate(rotMat, rotMat, decay, mouseMoveRotionAxis);
            vec4.transformMat4(camUp, camUp, rotMat);
            vec4.transformMat4(camPos, camPos, rotMat);
        }

        view = mat4.create();
        mat4.lookAt(view, [camPos[0], camPos[1], camPos[2]], targetPos, [camUp[0], camUp[1], camUp[2]]);
        projection = mat4.create();
        aspectRatio = gl.canvas.width / gl.canvas.height; // this needn't be done every update, only when resolution is changed
        mat4.perspective(projection, fieldOfVision, aspectRatio, 1, 50);

        // check to see if the mesh has loaded and load teapot mesh
        if(teaPotMeshCount == 0 && meshLoadStatus != null)
        {
            //console.log("Mesh Loaded in " + seconds + ", good to send to GPU");
            teaPotMeshCount += 1;

            var teaPotShaderProgram = createProgramFromSources(gl, teapotHelloVS, teapotHelloFS);
            // ---- Attribs
            var teaPotShaderPositionAttributeLocation = gl.getAttribLocation(teaPotShaderProgram, "vertexPos");
            var teaPotShaderTexAttributeLocation = gl.getAttribLocation(teaPotShaderProgram, "vertexTex");
            var teaPotShaderNormalAttributeLocation = gl.getAttribLocation(teaPotShaderProgram, "vertexNormal");
            // ---- Uniforms
            var teaPotShaderResolutionUniformLocation = gl.getUniformLocation(teaPotShaderProgram, "resolution");
            var teaPotShaderTimeUniformLocation = gl.getUniformLocation(teaPotShaderProgram, "time");
            var teaPotShaderModelUniformLocation = gl.getUniformLocation(teaPotShaderProgram, "model");
            var teaPotShaderViewUniformLocation = gl.getUniformLocation(teaPotShaderProgram, "view");
            var teaPotShaderProjectionUniformLocation = gl.getUniformLocation(teaPotShaderProgram, "projection");

            var teaPotLightUniformLocation = gl.getUniformLocation(baseShaderProgram, "lightPos");


            // make a shader program and a vao for the loaded mesh
            var teapotVAO = gl.createVertexArray();
            var teapotVBO = gl.createBuffer();
            gl.bindVertexArray(teapotVAO);
            gl.bindBuffer(gl.ARRAY_BUFFER, teapotVBO);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(meshVertData), gl.STATIC_DRAW);

            let theStride = 9 * 4 // 9 floats at 4 bytes per float
            let theOffset = 0;
            gl.vertexAttribPointer(teaPotShaderPositionAttributeLocation, 3, gl.FLOAT, false, theStride, theOffset);
            gl.enableVertexAttribArray(teaPotShaderPositionAttributeLocation);
            theOffset = 3 * 4; 
            gl.vertexAttribPointer(teaPotShaderTexAttributeLocation, 3, gl.FLOAT, false, theStride, theOffset);
            gl.enableVertexAttribArray(teaPotShaderTexAttributeLocation);
            theOffset = 6 * 4;
            gl.vertexAttribPointer(teaPotShaderNormalAttributeLocation, 3, gl.FLOAT, false, theStride, theOffset);
            gl.enableVertexAttribArray(teaPotShaderNormalAttributeLocation);

            let model = mat4.create();
            mat4.scale(model, model, [0.5, 0.5, 0.5]);
            mat4.translate(model, model, [0, -4., 0.]);
            mat4.rotateX(model, model, -Math.PI / 2);

            // Note: arrayedTriCount is the the number of triangles to be rendered, so since there is 9 floats in stride,
            // it must be the size of the interleaved array / 9
            renderables.push(
                {transform: model,
                 vao: teapotVAO,
                 primitiveType: gl.TRIANGLES,
                 arrayedTriCount: Math.round(meshVertData.length / 9),
                 program: teaPotShaderProgram,
                 uniformLocations: {resolution: teaPotShaderResolutionUniformLocation,
                                    time: teaPotShaderTimeUniformLocation,
                                    light: teaPotLightUniformLocation,
                                    model: teaPotShaderModelUniformLocation,
                                    view: teaPotShaderViewUniformLocation,
                                    projection: teaPotShaderProjectionUniformLocation
                                   },
                });
        }

        // render stuff
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        if(renderables.length != 0)
        {
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
                        case "light":
                            gl.uniform3f(renderables[i].uniformLocations[uniform], sceneLight[0], sceneLight[1], sceneLight[2]);
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
                gl.drawArrays(renderables[i].primitiveType, 0, renderables[i].arrayedTriCount);
            }
        }
        // restart game loop
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
        //clickRayDirWorld = vec3.normalize(clickRayDirWorld, clickRayDirWorld);  
        rayCastSwitch = true;
    }
    function onMouseMove(event)
    {
        if(rayCastSwitch == true)
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
            //rayDirWorld = vec3.normalize(rayDirWorld, rayDirWorld);

            let angle = vec3.angle(clickRayDirWorld, rayDirWorld);

            // easing function for angle as a function of camera radius
            // simple lerping (1-interpolatingVal)min + interpolatingVal * max
            let interopolatingVal = camRadius/maxCamRadius;
            angle = (1 - interopolatingVal)*(angle/4) + interopolatingVal * (angle/2);

            vec3.cross(mouseMoveRotionAxis, clickRayDirWorld, rayDirWorld);

            // checking by hand to prevent lookAt method from failing
            
            let rotMat = mat4.create();

            mat4.rotate(rotMat, rotMat, angle, mouseMoveRotionAxis);
            vec4.transformMat4(camUp, camUp, rotMat);
            vec4.transformMat4(camPos, camPos, rotMat);
            
            omega = angle;

            // we need to get the angle per mouse move, --> set the vector from last
            // move to this vector so the next mouse move calculation is possible
            clickRayDirWorld = rayDirWorld;
        }
    }
    function onMouseUp(event)
    {
        if(rayCastSwitch == true)
        {
            spinDecayTimer = 0;
            rayCastSwitch = false;
        }
    }
    function onMouseWheel(event)
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

main();
