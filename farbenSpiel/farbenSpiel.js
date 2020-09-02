"use strict";

// TO DO
// remove magic numbers for radius buffers
// 2.1, 4.1, 26.6

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
    var circleColorsUniformLocation = gl.getUniformLocation(program, "circleColors");

    // -------------- Circles Init --------------
    var circlePositions = [];
    var circleColors = [];

    let radius = 0.15;
    let theta = 0;
    for(let i = 0; i < 19; i++)
    {
        if(i == 0)
        {
            circlePositions.push(0); // x
            circlePositions.push(0); // y
            circlePositions.push(radius); // radius

            circleColors.push(0.);
            circleColors.push(0.);
            circleColors.push(0.);
        }
        else if(i < 7)
        {
            circlePositions.push(Math.cos(theta) * 2.1 * radius ); // x
            circlePositions.push(Math.sin(theta) * 2.1 * radius ); // y
            circlePositions.push(radius); // radius
            theta += Math.PI / 3; // increment by

            circleColors.push(Math.random());
            circleColors.push(Math.random());
            circleColors.push(Math.random());
        }
        else{
            if(i == 7)
            {
                theta += -Math.PI / 12; // + 15 * Math.PI / 180;
            }
            circlePositions.push(Math.cos(theta) * 4.1 * (radius)); // x
            circlePositions.push(Math.sin(theta) * 4.1 * (radius)); // y
            circlePositions.push(radius); // radius
            theta += Math.PI / 6;


            circleColors.push(Math.random());
            circleColors.push(Math.random());
            circleColors.push(Math.random());
        }
    }

    // -------------- Event handling Init --------------
    var clickCount = 0;
    var selectedCircleIndex = null;

    canvas.addEventListener('click',(event) =>
    {
        // NDC mouse coords
        let xx = 2. * ( event.clientX - .5 * gl.canvas.width ) / gl.canvas.height;
        let yy = -2. * ( event.clientY - .5 * gl.canvas.height ) / gl.canvas.height;
        
        // lots of ways of doing this I think, so let's just pick one.
        // order of packed circles is static, so we can narrow search based on 
        // if it's in the outer or inner ring
        let dist = Math.sqrt(xx * xx + yy * yy);
        let packedCircleRadius = Math.sqrt(2 * 4.1 * radius);
        if(dist <= packedCircleRadius && circlePositions.length != 0)
        {
            
            let angle = Math.asin(yy / dist);
            let pi = Math.PI; // just an alias
            console.log(angle * 180 / Math.PI);
            // if less than radius, must be [0]
            if(dist <= radius)
            {
                console.log("clicked number 0");
            }
            // else if less than outer ring, must be [1, 7]
            else if(dist <= 3 * radius && dist > radius)
            {
                // cut into two halves because the aliased return value of asin
                if( xx > 0)
                {
                    console.log("clicked inner ring and x is positve");
                    if(angle > -pi / 2 && angle < -pi / 6)
                    {
                        console.log("clicked circle 6");
                    }
                    else if(angle > -pi / 6 && angle < pi / 6)
                    {
                        console.log("clicked circle 1");
                    }
                    else
                    {
                        console.log("clicked circle 2");
                    }
                }
                else
                {
                    console.log("clicked inner ring and x is negative");
                    if(angle > -pi / 2 && angle < -pi / 6)
                    {
                        console.log("clicked circle 5");
                    }
                    else if(angle > -pi / 6 && angle < pi / 6)
                    {
                        console.log("clicked circle 4");
                    }
                    else
                    {
                        console.log("clicked circle 3");
                    }
                }
            }
            // else in outer ring, must be in [7, 19]
            else
            {
                // cut into two halves because the aliased return value of asin
                if( xx > 0)
                {
                    console.log("clicked outer ring and x is positve");
                    if(angle >= -pi / 2 && angle < -pi / 3)
                    {
                        console.log("clicked circle 17");
                    }
                    else if(angle >= -pi / 3 && angle < -pi / 6)
                    {
                        console.log("clicked circle 18");
                    }
                    else if(angle >= -pi / 6 && angle < 0)
                    {
                        console.log("clicked circle 7");
                    }
                    else if(angle >= 0 && angle < pi / 6)
                    {
                        console.log("clicked circle 8");
                    }
                    else if(angle >= pi / 6 && angle < pi / 3)
                    {
                        console.log("clicked circle 9");
                    }
                    else
                    {
                        console.log("clicked circle 10");
                    }
                }
                else
                {
                    console.log("clicked outer ring and x is positve");
                    if(angle >= -pi / 2 && angle < -pi / 3)
                    {
                        console.log("clicked circle 16");
                    }
                    else if(angle >= -pi / 3 && angle < -pi / 6)
                    {
                        console.log("clicked circle 15");
                    }
                    else if(angle >= -pi / 6 && angle < 0)
                    {
                        console.log("clicked circle 14");
                    }
                    else if(angle >= 0 && angle < pi / 6)
                    {
                        console.log("clicked circle 13");
                    }
                    else if(angle >= pi / 6 && angle < pi / 3)
                    {
                        console.log("clicked circle 12");
                    }
                    else
                    {
                        console.log("clicked circle 11");
                    }
                }
            }
        }
    });
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

    // -------------- Static Uniforms --------------
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform3fv(circlePositionsUniformLocation, circlePositions);
    gl.uniform3fv(circleColorsUniformLocation, circleColors);

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
