/*
To Do / things I'll forget about otherwise:

# 
More general means of timing mesh loads with main render loop

#
how to keep rotation from freaking out

#
(0.07 * camRadius); 
clearly, the further away you are the greater the angle between two discretely sample vectors will be
but need to have a bit more of a think about how to make this feel better

#
decay spin

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

    // ------------------ Make Camera/s ------------------
    var camRadius = 20.;
    var camPos = vec4.fromValues(0, 0, -camRadius, 1.);
    var camUp = vec3.fromValues(0.0, 1.0, 0.0); // really world up for gram-schmidt process
    var targetPos = vec3.fromValues(0.0, 0.0, 0.0);

    var view = mat4.create();
    mat4.lookAt(view, [camPos[0], camPos[1], camPos[2]], targetPos, camUp);
    var projection = mat4.create();
    let fieldOfVision = 0.5 * Math.PI / 2.;
    let aspectRatio = gl.canvas.width / gl.canvas.height;
    mat4.perspective(projection, fieldOfVision, aspectRatio, 1, 50);

    // ------------------ Mouse Picking Functions ------------------
    var rayCastSwitch = false;
    var clickRayDirWorld = null;
    var mouseMoveRotionAxis = vec3.create();
    var omega = 0;
    
    var deltaTime = 0.0167;
    var spinDecayTimer = 10;

    window.addEventListener('mousedown', function(event) { onMouseDown(event);});
    window.addEventListener('mousemove', function(event) { onMouseMove(event);});
    window.addEventListener('mouseup', function(event) { onMouseUp(event);});

    // ------------------ Initialize Shader Resources ------------------
    var renderables = []; // list of javascript objects with vao, program, triangle count;

    // -------- Base Shader
    var baseShaderProgram = createProgramFromSources(gl, baseVS, baseFS);
    // ---- Attribs
    var baseShaderPositionAttributeLocation = gl.getAttribLocation(baseShaderProgram, "vertexPos");
    // ---- Uniforms
    var baseShaderResolutionUniformLocation = gl.getUniformLocation(baseShaderProgram, "resolution");
    var baseShaderTimeUniformLocation = gl.getUniformLocation(baseShaderProgram, "time");
    var baseShaderViewUniformLocation = gl.getUniformLocation(baseShaderProgram, "view");
    var baseShaderProjectionUniformLocation = gl.getUniformLocation(baseShaderProgram, "projection");

    // ------------------ Initialize VAOs ------------------
    // -------- Base Quad
    var quadVAO = gl.createVertexArray();
    var quadVBO = gl.createBuffer();
    gl.bindVertexArray(quadVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadVBO);

    var quadPositions = 
    [
        -1, +1, 0,
        -1, -1, 0,
        +1, -1, 0,

        -1, +1, 0,
        +1, -1, 0,
        +1, +1, 0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadPositions), gl.STATIC_DRAW);
    var size = 3;          
    var type = gl.FLOAT;   
    var normalize = false; 
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer

    gl.vertexAttribPointer(baseShaderPositionAttributeLocation, size, type, normalize, stride, offset);
    gl.enableVertexAttribArray(baseShaderPositionAttributeLocation);
    
    renderables.push(
        {transform: {position: vec3.fromValues(0, 0, 0), scale: vec3.fromValues(1, 1, 1)},
         vao: quadVAO,
         arrayedTriCount: Math.round(quadPositions.length / 3),
         program: baseShaderProgram,
         uniformLocations: {resolution: baseShaderResolutionUniformLocation,
                            time: baseShaderTimeUniformLocation,
                            view: baseShaderViewUniformLocation,
                            projection: baseShaderProjectionUniformLocation}
        });

    // ------------------ Initialize Draw ------------------
    gl.useProgram(baseShaderProgram);
    gl.bindVertexArray(quadVAO);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var primitiveType = gl.TRIANGLES;
    var drawOffset = 0;
    gl.drawArrays(primitiveType, drawOffset, renderables[0].arrayedTriCount);

    // ------------------ Time Init ------------------
    var oldTimeStamp = 0.0;
    var seconds = 0.0;

    // ------------------ Check for Mesh Loading Init ------------------
    var teaPotMeshCount = 0;
    //loadMesh("../rendering/models/wavefrontOBJ/lowResUtahTeapot.txt");
    loadMesh("../rendering/models/wavefrontOBJ/highResUtahTeapot.txt");
    var model = mat4.create(); // CHANGE ME
    mat4.scale(model, model, [0.5, 0.5, 0.5]);
    mat4.translate(model, model, [0, -4., 0.]);
    mat4.rotateX(model, model, -Math.PI / 2);
    

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
            vec4.transformMat4(camPos, camPos, rotMat);
        }

        view = mat4.create();
        mat4.lookAt(view, [camPos[0], camPos[1], camPos[2]], targetPos, camUp);
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

            renderables.push(
                {transform: {position: vec3.fromValues(0, 0, 0), scale: vec3.fromValues(1, 1, 1)},
                 vao: teapotVAO,
                 arrayedTriCount: Math.round(meshVertData.length / 9),
                 program: teaPotShaderProgram,
                 uniformLocations: {resolution: teaPotShaderResolutionUniformLocation,
                                    time: teaPotShaderTimeUniformLocation,
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
            for(let i = 1; i < renderables.length; i++)
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
                            gl.uniformMatrix4fv(renderables[i].uniformLocations[uniform], false, model);
                            break;
                        case "view":
                            gl.uniformMatrix4fv(renderables[i].uniformLocations[uniform], false, view);
                            break;
                        case "projection":
                            gl.uniformMatrix4fv(renderables[i].uniformLocations[uniform], false, projection);
                            break;
                        default:
                            console.log("some weird uniform was attached to the renderable and it doesn't know what to do");
                    }
                }
                gl.drawArrays(primitiveType, drawOffset, renderables[i].arrayedTriCount);
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
        clickRayDirWorld = vec3.normalize(clickRayDirWorld, clickRayDirWorld);  
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
            rayDirWorld = vec3.normalize(rayDirWorld, rayDirWorld);

            let angle = vec3.angle(clickRayDirWorld, rayDirWorld) / (0.07 * camRadius);
            vec3.cross(mouseMoveRotionAxis, clickRayDirWorld, rayDirWorld);
            let rotMat = mat4.create();

            mat4.rotate(rotMat, rotMat, angle, mouseMoveRotionAxis);
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
}

main();
