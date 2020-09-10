"use strict";

function main()
{
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

    var program = createProgramFromSources(gl, galleryVS, galleryFS);
    var positionAttributeLocation = gl.getAttribLocation(program, "vertexPos");
    var resolutionUniformLocation = gl.getUniformLocation(program, "resolution");
    var timeUniformLocation = gl.getUniformLocation(program, "time");
    
    // -------------- board VAO Init --------------
    var vao = gl.createVertexArray();
    var positionBuffer = gl.createBuffer();

    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // 0, 1, 2
    // 0, 2, 3
    var positions =
    [
        -1, +1, 0,
        -1, -1, 0,
        +1, -1, 0,

        -1, +1, 0,
        +1, -1, 0,
        +1, +1, 0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    var size = 3;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer

    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
    gl.enableVertexAttribArray(positionAttributeLocation);

    // -------------- Init Draw State --------------
    resize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);
    gl.bindVertexArray(vao);
        
    // -------------- Draw Type --------------
    var primitiveType = gl.TRIANGLES;
    var drawOffset = 0;
    var vertCount = 6;
    gl.drawArrays(primitiveType, drawOffset, vertCount);

    // -------------- Time Init --------------
    var oldTimeStamp = 0.0;
    var seconds = 0.0;

    loadMesh("lowResUtahTeapot.txt");
    var meshConsoleLogCount = 0;

    // -------------- Start Game Loop --------------
    window.requestAnimationFrame(gameLoop);
    function gameLoop(timeStamp)
    {
        resize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // time update
        let deltaTime = (timeStamp - oldTimeStamp) / 1000; // in seconds
        oldTimeStamp = timeStamp;
        seconds += deltaTime;

        if(meshLoadStatus != null && meshConsoleLogCount == 0)
        {
            console.log("loadCompleted");
            console.log(seconds);
            meshConsoleLogCount += 1;
        }
        // uniforms
        gl.uniform1f(timeUniformLocation, seconds);
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        // draw
        gl.drawArrays(primitiveType, offset, vertCount);

        // restart game loop
        window.requestAnimationFrame(gameLoop);
    }
}

main();
