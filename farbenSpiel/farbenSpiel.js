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

    var program = createProgramFromSources(gl, farbenVS, farbenFS);
    var positionAttributeLocation = gl.getAttribLocation(program, "vertexPos");
    var resolutionUniformLocation = gl.getUniformLocation(program, "resolution");
    var timeUniformLocation = gl.getUniformLocation(program, "time");
    var circlePositionsUniformLocation = gl.getUniformLocation(program, "circlePositions");

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

    // -------------- Circles Init -------------- 
    var circlePositions = [];
    
    let radius = 0.15;
    let circleOffset = 0.0455;
    let theta = 0;
    for(let i = 0; i < 19; i++)
    {
        if(i == 0)
        {
            circlePositions.push(0); // x
            circlePositions.push(0); // y
            circlePositions.push(radius); // radius
        }
        else if(i < 7)
        {
            circlePositions.push(Math.cos(theta) * 2 * radius ); // x
            circlePositions.push(Math.sin(theta) * 2 * radius ); // y
            circlePositions.push(radius); // radius
            theta += Math.PI / 3; // increment by 
        }
        else{
            if(i == 7)
            {
                theta += -Math.PI / 6 + 15 * Math.PI / 180;
            }
            circlePositions.push(Math.cos(theta) * 4 * (.96 * radius)); // x
            circlePositions.push(Math.sin(theta) * 4 * (.96 * radius)); // y
            circlePositions.push(radius); // radius
            theta += Math.PI / 6;
        }
    }
    let circlesFloat32Arr = new Float32Array(circlePositions);
    
    // -------------- Static Uniforms --------------
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform3fv(circlePositionsUniformLocation, circlesFloat32Arr);

    // -------------- Draw Type --------------
    var primitiveType = gl.TRIANGLES;
    var drawOffset = 0;
    var vertCount = 6;
    gl.drawArrays(primitiveType, drawOffset, vertCount);

    // -------------- Time Init --------------
    var oldTimeStamp = 0.0;
    var seconds = 0.0;

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

        gl.uniform1f(timeUniformLocation, seconds);

        // draw
        gl.drawArrays(primitiveType, offset, vertCount);

        // restart game loop
        window.requestAnimationFrame(gameLoop);
    }
}

main();