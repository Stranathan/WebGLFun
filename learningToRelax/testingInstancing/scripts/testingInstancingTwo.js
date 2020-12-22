/*
To Do:
*/

"use strict";

// ---------------- glMatrix Lib Aliases ----------------
var vec2 = glMatrix.vec2;
var vec3 = glMatrix.vec3;
var vec4 = glMatrix.vec4;
var mat4 = glMatrix.mat4;

var rnd = Math.random();

function main() 
{

    // ------------------ Canvas Initialization ----------------
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
    var camRadius = 10.;
    var maxCamRadius = 25;
    var camPos = vec4.fromValues(0, 0, -2, 1);
    var camUp = vec4.fromValues(0.0, 1.0, 0.0, 1.0); // really world up for gram-schmidt process
    var targetPos = vec3.fromValues(0.0, 0.0, 0.0);

    // ------------------ MVP Init
    var view = mat4.create();
    mat4.lookAt(view, [camPos[0], camPos[1], camPos[2]], targetPos, [camUp[0], camUp[1], camUp[2]]);
    var projection = mat4.create();
    let fieldOfVision = 0.5 * Math.PI / 2.;
    let aspectRatio = gl.canvas.width / gl.canvas.height;
    mat4.perspective(projection, fieldOfVision, aspectRatio, 1, 50);
    let model = mat4.create();
    mat4.scale(model, model, [0.5, 0.5, 0.5]);

    // ------------------ Shader Program Initialization ----------------
    var testingInstancingProgram = createProgramFromSources(gl, testingInstancingVS, testingInstancingFS);

    // ------------------ Uniforms
    var testingInstancingResolutionUniformLocation = gl.getUniformLocation(testingInstancingProgram, "resolution");
    var testingInstancingTimeUniformLocation = gl.getUniformLocation(testingInstancingProgram, "time");
    var testingInstancingModelUniformLocation = gl.getUniformLocation(testingInstancingProgram, "model");
    var testingInstancingViewUniformLocation = gl.getUniformLocation(testingInstancingProgram, "view");
    var testingInstancingProjectionUniformLocation = gl.getUniformLocation(testingInstancingProgram, "projection");

    // ------------------ Quad VAO ------------------
    var meshCount = 0;
    getUnitCubeAttribDataFromString() // see bottom of objMeshLoader.js
    var renderables = [];

    // ------------------ WebGL State Initialization ----------------
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.DEPTH_TEST);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // ------------------ Time Init ------------------
    var oldTimeStamp = 0.0;
    var seconds = 0.0;
    var deltaTime = 0.0;

    // ------------------ Start Render Loop ------------------
    window.requestAnimationFrame(renderLoop);

    function renderLoop(timeStamp)
    {
        // time update
        deltaTime = (timeStamp - oldTimeStamp) / 1000; // in seconds
        oldTimeStamp = timeStamp;
        seconds += deltaTime;

        resize(gl.canvas);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        model = mat4.create();
        mat4.scale(model, model, [0.5, 0.5, 0.5]);
        mat4.rotate(model, model, 0.2 * seconds, [rnd, 0.5 * rnd, 0.8 * rnd]);
        // clear
        if(meshCount == 0 && meshLoadStatus != null)
        {
            let testingInstancingVAO = gl.createVertexArray();
            let testingInstancingVBO = gl.createBuffer();
            gl.bindVertexArray(testingInstancingVAO);
            gl.bindBuffer(gl.ARRAY_BUFFER, testingInstancingVBO);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(meshVertData), gl.STATIC_DRAW);
            let size = 3;
            let type = gl.FLOAT;
            let normalize = false;
            let stride = 9 * 4;
            let offset = 0;
            gl.vertexAttribPointer(0, size, type, normalize, stride, offset);
            gl.enableVertexAttribArray(0);
            offset = 3 * 4; // get past vertex data
            gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride, offset);
            gl.enableVertexAttribArray(1);
            offset = 6 * 4; // get past vertex & tex data
            gl.vertexAttribPointer(2, 3, gl.FLOAT, false, stride, offset);
            gl.enableVertexAttribArray(2);
            // push onto render stack
            renderables.push(testingInstancingVAO);
            //console.log(meshVertData);
            // switch off mesh load check
            meshCount += 1;
        }

        if (renderables.length != 0)
        {
            // bind vao
            gl.bindVertexArray(renderables[0]);
            // use program
            gl.useProgram(testingInstancingProgram);
            // pass uniforms
            gl.uniform1f(testingInstancingTimeUniformLocation, seconds);
            gl.uniform2f(testingInstancingResolutionUniformLocation, gl.canvas.width, gl.canvas.height);
            gl.uniformMatrix4fv(testingInstancingModelUniformLocation, false, model);
            gl.uniformMatrix4fv(testingInstancingViewUniformLocation, false, view);
            gl.uniformMatrix4fv(testingInstancingProjectionUniformLocation, false, projection);
            // draw
            gl.drawArrays(gl.TRIANGLES, 0, 36);
        }
        // restart game loop
        window.requestAnimationFrame(renderLoop);
    }
}

main();