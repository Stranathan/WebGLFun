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
    var camPos = vec3.fromValues(2.0, 2.0, -2.0);
    var camUp = vec3.fromValues(0.0, 1.0, 0.0); // really world up for gram-schmidt process
    var targetPos = vec3.fromValues(0.0, 0.0, 0.0);

    var view = mat4.create();
    mat4.lookAt(view, camPos, targetPos, camUp);
    var perspective = mat4.create();
    let fieldOfVision = 0.5 * Math.PI / 2.;
    let aspectRatio = gl.canvas.width / gl.canvas.height;
    mat4.perspective(perspective, fieldOfVision, aspectRatio, 1, 50);


    // ------------------ Initialize Shader Resources ------------------
    // -------- Base Shader
    var baseShaderProgram = createProgramFromSources(gl, baseVS, baseFS);
    // ---- Attribs
    var baseShaderPositionAttributeLocation = gl.getAttribLocation(baseShaderProgram, "vertexPos");
    // ---- Uniforms
    var baseShaderResolutionUniformLocation = gl.getUniformLocation(baseShaderProgram, "resolution");
    var baseShaderTimeUniformLocation = gl.getUniformLocation(baseShaderProgram, "time");
    var baseShaderViewUniformLocation = gl.getUniformLocation(baseShaderProgram, "view");
    var baseShaderPerspectiveUniformLocation = gl.getUniformLocation(baseShaderProgram, "perspective");

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
    
    // ------------------ Initialize Draw ------------------
    gl.useProgram(baseShaderProgram);
    gl.bindVertexArray(quadVAO);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var primitiveType = gl.TRIANGLES;
    var drawOffset = 0;
    let count = Math.round(quadPositions.length / 3);
    gl.drawArrays(primitiveType, drawOffset, count);

    // ------------------ Time Init ------------------
    var oldTimeStamp = 0.0;
    var seconds = 0.0;

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
        //camPos = vec3.fromValues(camPos[0] * Math.cos(seconds), camPos[1], camPos[2] * Math.sin(seconds));
        camPos[0] = 2. * Math.cos(seconds);
        camPos[2] = -2 * Math.sin(seconds);

        view = mat4.create();
        mat4.lookAt(view, camPos, targetPos, camUp);
        perspective = mat4.create();
        aspectRatio = gl.canvas.width / gl.canvas.height; // this needn't be done every update, only when resolution is changed
        mat4.perspective(perspective, fieldOfVision, aspectRatio, 1, 50);

        gl.uniform1f(baseShaderTimeUniformLocation, seconds);
        gl.uniform2f(baseShaderResolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        gl.uniformMatrix4fv(baseShaderViewUniformLocation, false, view);
        gl.uniformMatrix4fv(baseShaderPerspectiveUniformLocation, false, perspective);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(primitiveType, drawOffset, count);

        // restart game loop
        window.requestAnimationFrame(renderLoop);
    }
}

main();
