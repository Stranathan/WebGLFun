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
    var camRadius = 10.;
    var camPos = vec3.fromValues(camRadius, 2.0, -camRadius);
    var camUp = vec3.fromValues(0.0, 1.0, 0.0); // really world up for gram-schmidt process
    var targetPos = vec3.fromValues(0.0, 0.0, 0.0);

    var view = mat4.create();
    mat4.lookAt(view, camPos, targetPos, camUp);
    var projection = mat4.create();
    let fieldOfVision = 0.5 * Math.PI / 2.;
    let aspectRatio = gl.canvas.width / gl.canvas.height;
    mat4.perspective(projection, fieldOfVision, aspectRatio, 1, 50);


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

    // ------------------ Start Render Loop ------------------
    window.requestAnimationFrame(renderLoop);

    function renderLoop(timeStamp)
    {
        resize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // time update
        let deltaTime = (timeStamp - oldTimeStamp) / 1000; // in seconds
        oldTimeStamp = timeStamp;
        seconds += deltaTime;

        // uniforms
        camPos[0] = 2. * camRadius * Math.cos(seconds);
        camPos[2] = -2. * camRadius * Math.sin(seconds);

        view = mat4.create();
        mat4.lookAt(view, camPos, targetPos, camUp);
        projection = mat4.create();
        aspectRatio = gl.canvas.width / gl.canvas.height; // this needn't be done every update, only when resolution is changed
        mat4.perspective(projection, fieldOfVision, aspectRatio, 1, 50);

        // check to see if the mesh has loaded and load teapot mesh
        if(teaPotMeshCount == 0 && meshLoadStatus != null)
        {
            console.log("Mesh Loaded in " + seconds + ", good to send to GPU");
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
}

main();
