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
    var selectedCircleUniformLocation = gl.getUniformLocation(program, "selectedCircle");
    //
    var juiceSelectionUniformLocation = gl.getUniformLocation(program, "juiceSelection");
    var juiceSelection = [10., 0]

    // -------------- Circles Init --------------
    var circlePositions = [];
    var circleColors = [];
    var selectedCircle = [10, 10, 0.01, 0]; // hackish, draw offscreen, change me

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

            circleColors.push(0);
            circleColors.push(0);
            circleColors.push(0);
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


            circleColors.push(Math.random() * Math.random());
            circleColors.push(Math.random() * Math.random());
            circleColors.push(Math.random() * Math.random());
        }
    }

    // -------------- Event handling --------------
    var clickedIndex = null;

    canvas.addEventListener('click',(event) =>
    {
        // NDC mouse coords to agree with shader
        let xx = 2. * ( event.clientX - .5 * gl.canvas.width ) / gl.canvas.height;
        let yy = -2. * ( event.clientY - .5 * gl.canvas.height ) / gl.canvas.height;

        // lots of ways of doing this, so let's just pick one.
        // order of packed circles is static, so we can narrow search based on
        // if it's in the outer or inner ring
        let dist = Math.sqrt(xx * xx + yy * yy);
        let packedCircleRadius = Math.sqrt(2 * 4.1 * radius);

        if(dist <= packedCircleRadius && circlePositions.length != 0)
        {
            let angle = Math.asin(yy / dist);
            let pi = Math.PI; // just an alias to save some digital chalk

            // if less than radius, must be [0]
            if(dist <= radius)
            {
                console.log("clicked on circle 0");
                // if circle is selected and is adjacent to zero
                if(clickedIndex != null && (clickedIndex == 1 || clickedIndex == 2 || clickedIndex == 3 || clickedIndex == 4 || clickedIndex == 5 || clickedIndex == 6))
                {
                    // deselect
                    selectedCircle = [10, 10, 0.01, 0]; // off screen
                    let thisIndex = 0;

                    circleColors[thisIndex * 3] += circleColors[clickedIndex * 3];
                    circleColors[thisIndex * 3 + 1] += circleColors[clickedIndex * 3 + 1];
                    circleColors[thisIndex * 3 + 2] += circleColors[clickedIndex * 3 + 2];

                    juiceSelection[0] = 0;
                    juiceSelection[1] = thisIndex;

                    circleColors[clickedIndex * 3] = 0;
                    circleColors[clickedIndex * 3 + 1] = 0;
                    circleColors[clickedIndex * 3 + 2] = 0;
                    clickedIndex = null;
                }
                else
                {
                    // deselect
                    selectedCircle = [10, 10, 0.01, 0]; // off screen
                    clickedIndex = null;
                }
            }
            // ----- INNER RING -----
            // else if less than outer ring, must be [1, 7]
            else if(dist <= 3 * radius && dist > radius)
            {
                // cut into two halves because the aliased return value of asin
                if( xx > 0)
                {
                    if(angle > -pi / 2 && angle < -pi / 6)
                    {
                        console.log("clicked on 6");

                        // if you select this circle and no other circle has been selected
                        if(clickedIndex == null)
                        {
                            clickedIndex = 6;
                            selectedCircle = [circlePositions[clickedIndex * 3],
                                              circlePositions[clickedIndex * 3 + 1],
                                              1.1 * circlePositions[clickedIndex * 3 + 2],
                                              clickedIndex];
                        }
                        // else if you have an adjacent circle selected and want to combine colors
                        else if(clickedIndex != null && (clickedIndex == 1 || clickedIndex == 5 || clickedIndex == 17 || clickedIndex == 18))
                        {
                            selectedCircle = [10, 10, 0.01, 0] // move the selection circle off screen
                            // combine colors from selection and change the selected circle to a random col
                            if(clickedIndex == 17 || clickedIndex == 18)
                            {
                                let thisIndex = 6;
                                circleColors[thisIndex * 3] += circleColors[clickedIndex * 3];
                                circleColors[thisIndex * 3 + 1] += circleColors[clickedIndex * 3 + 1];
                                circleColors[thisIndex * 3 + 2] += circleColors[clickedIndex * 3 + 2];
                                
                                juiceSelection[0] = 0;
                                juiceSelection[1] = thisIndex;

                                circleColors[clickedIndex * 3] = Math.random() * Math.random();
                                circleColors[clickedIndex * 3 + 1] = Math.random() * Math.random();
                                circleColors[clickedIndex * 3 + 2] = Math.random() * Math.random();
                            }
                            // combine colors and drain selected circle
                            else if (clickedIndex == 1 || clickedIndex == 5)
                            {
                                let thisIndex = 6;
                                circleColors[thisIndex * 3] += circleColors[clickedIndex * 3];
                                circleColors[thisIndex * 3 + 1] += circleColors[clickedIndex * 3 + 1];
                                circleColors[thisIndex * 3 + 2] += circleColors[clickedIndex * 3 + 2];
                                juiceSelectionTimer = 0;
                                circleColors[clickedIndex * 3] = 0;
                                circleColors[clickedIndex * 3 + 1] = 0;
                                circleColors[clickedIndex * 3 + 2] = 0;
                            }
                            clickedIndex = null;
                        }
                        // if you select this circle and another, non adjacent circle has been selected
                        else
                        {
                            clickedIndex = 6;
                            selectedCircle = [circlePositions[clickedIndex * 3],
                                              circlePositions[clickedIndex * 3 + 1],
                                              1.1 * circlePositions[clickedIndex * 3 + 2],
                                              clickedIndex];
                        }
                    }
                    else if(angle > -pi / 6 && angle < pi / 6)
                    {
                        console.log("clicked on circle 1");
                        // if you select this circle and no other circle has been selected
                        if(clickedIndex == null)
                        {
                            clickedIndex = 1;
                            selectedCircle = [circlePositions[clickedIndex * 3],
                                              circlePositions[clickedIndex * 3 + 1],
                                              1.1 * circlePositions[clickedIndex * 3 + 2],
                                              clickedIndex];
                        }
                        // else if you have an adjacent circle selected and want to combine colors
                        else if(clickedIndex != null && (clickedIndex == 7 || clickedIndex == 8  || clickedIndex == 2 || clickedIndex == 6))
                        {
                            selectedCircle = [10, 10, 0.01, 0] // off screen
                            // combine colors from selection and change the selected circle to a random col
                            if(clickedIndex == 7 || clickedIndex == 8)
                            {
                                let thisIndex = 1;
                                circleColors[thisIndex * 3] += circleColors[clickedIndex * 3];
                                circleColors[thisIndex * 3 + 1] += circleColors[clickedIndex * 3 + 1];
                                circleColors[thisIndex * 3 + 2] += circleColors[clickedIndex * 3 + 2];
                                juiceSelection[0] = 0;
                                juiceSelection[1] = thisIndex;

                                circleColors[clickedIndex * 3] = Math.random() * Math.random();
                                circleColors[clickedIndex * 3 + 1] = Math.random() * Math.random();
                                circleColors[clickedIndex * 3 + 2] = Math.random() * Math.random();
                            }
                            // combine colors and drain selected circle
                            else if (clickedIndex == 2 || clickedIndex == 6)
                            {
                                let thisIndex = 1;
                                circleColors[thisIndex * 3] += circleColors[clickedIndex * 3];
                                circleColors[thisIndex * 3 + 1] += circleColors[clickedIndex * 3 + 1];
                                circleColors[thisIndex * 3 + 2] += circleColors[clickedIndex * 3 + 2];
                                juiceSelection[0] = 0;
                                juiceSelection[1] = thisIndex;

                                circleColors[clickedIndex * 3] = 0;
                                circleColors[clickedIndex * 3 + 1] = 0;
                                circleColors[clickedIndex * 3 + 2] = 0;
                            }
                            clickedIndex = null;
                        }
                        // if you select this circle and another, non adjacent circle has been selected
                        else
                        {
                            clickedIndex = 1;
                            selectedCircle = [circlePositions[clickedIndex * 3],
                                              circlePositions[clickedIndex * 3 + 1],
                                              1.1 * circlePositions[clickedIndex * 3 + 2],
                                              clickedIndex];
                        }
                    }
                    else
                    {
                        console.log("clicked circle 2");
                        if(clickedIndex == null)
                        {
                            clickedIndex = 2;
                            selectedCircle = [circlePositions[clickedIndex * 3],
                                              circlePositions[clickedIndex * 3 + 1],
                                              1.1 * circlePositions[clickedIndex * 3 + 2],
                                              clickedIndex];
                        }
                        // else if you have an adjacent circle selected and want to combine colors
                        else if(clickedIndex != null && (clickedIndex == 9 || clickedIndex == 10 || clickedIndex == 3 || clickedIndex == 1))
                        {
                            selectedCircle = [10, 10, 0.01, 0] // off screen
                            // combine colors from selection and change the selected circle to a random col
                            if(clickedIndex == 9 || clickedIndex == 10)
                            {
                                let thisIndex = 2;
                                circleColors[thisIndex * 3] += circleColors[clickedIndex * 3];
                                circleColors[thisIndex * 3 + 1] += circleColors[clickedIndex * 3 + 1];
                                circleColors[thisIndex * 3 + 2] += circleColors[clickedIndex * 3 + 2];
                                juiceSelection[0] = 0;
                                juiceSelection[1] = thisIndex;

                                circleColors[clickedIndex * 3] = Math.random() * Math.random();
                                circleColors[clickedIndex * 3 + 1] = Math.random() * Math.random();
                                circleColors[clickedIndex * 3 + 2] = Math.random() * Math.random();
                            }
                            // combine colors and drain selected circle
                            else if (clickedIndex == 3 || clickedIndex == 1)
                            {
                                let thisIndex = 2;
                                circleColors[thisIndex * 3] += circleColors[clickedIndex * 3];
                                circleColors[thisIndex * 3 + 1] += circleColors[clickedIndex * 3 + 1];
                                circleColors[thisIndex * 3 + 2] += circleColors[clickedIndex * 3 + 2];
                                juiceSelection[0] = 0;
                                juiceSelection[1] = thisIndex;

                                circleColors[clickedIndex * 3] = 0;
                                circleColors[clickedIndex * 3 + 1] = 0;
                                circleColors[clickedIndex * 3 + 2] = 0;
                            }
                            clickedIndex = null;
                        }
                        // if you select this circle and another, non adjacent circle has been selected
                        else
                        {
                            clickedIndex = 2;
                            selectedCircle = [circlePositions[clickedIndex * 3],
                                              circlePositions[clickedIndex * 3 + 1],
                                              1.1 * circlePositions[clickedIndex * 3 + 2],
                                              clickedIndex];
                        }
                    }
                }
                else
                {
                    if(angle > -pi / 2 && angle < -pi / 6)
                    {
                        console.log("clicked circle 5");
                        // if you select this circle and no other circle has been selected
                        if(clickedIndex == null)
                        {
                            clickedIndex = 5;
                            selectedCircle = [circlePositions[clickedIndex * 3],
                                              circlePositions[clickedIndex * 3 + 1],
                                              1.1 * circlePositions[clickedIndex * 3 + 2],
                                              clickedIndex];
                        }
                        // else if you have an adjacent circle selected and want to combine colors
                        else if(clickedIndex != null && (clickedIndex == 6 || clickedIndex == 4  || clickedIndex == 15 || clickedIndex == 16))
                        {
                            selectedCircle = [10, 10, 0.01, 0] // off screen
                            // combine colors from selection and change the selected circle to a random col
                            if(clickedIndex == 15 || clickedIndex == 16)
                            {
                                let thisIndex = 5;
                                circleColors[thisIndex * 3] += circleColors[clickedIndex * 3];
                                circleColors[thisIndex * 3 + 1] += circleColors[clickedIndex * 3 + 1];
                                circleColors[thisIndex * 3 + 2] += circleColors[clickedIndex * 3 + 2];
                                juiceSelection[0] = 0;
                                juiceSelection[1] = thisIndex;

                                circleColors[clickedIndex * 3] = Math.random() * Math.random();
                                circleColors[clickedIndex * 3 + 1] = Math.random() * Math.random();
                                circleColors[clickedIndex * 3 + 2] = Math.random() * Math.random();
                            }
                            // combine colors and drain selected circle
                            else if (clickedIndex == 4 || clickedIndex == 6)
                            {
                                let thisIndex = 5;
                                circleColors[thisIndex * 3] += circleColors[clickedIndex * 3];
                                circleColors[thisIndex * 3 + 1] += circleColors[clickedIndex * 3 + 1];
                                circleColors[thisIndex * 3 + 2] += circleColors[clickedIndex * 3 + 2];
                                juiceSelection[0] = 0;
                                juiceSelection[1] = thisIndex;

                                circleColors[clickedIndex * 3] = 0;
                                circleColors[clickedIndex * 3 + 1] = 0;
                                circleColors[clickedIndex * 3 + 2] = 0;
                            }
                            clickedIndex = null;
                        }
                        // if you select this circle and another, non adjacent circle has been selected
                        else
                        {
                            clickedIndex = 5;
                            selectedCircle = [circlePositions[clickedIndex * 3],
                                              circlePositions[clickedIndex * 3 + 1],
                                              1.1 * circlePositions[clickedIndex * 3 + 2],
                                              clickedIndex];
                        }
                    }
                    else if(angle > -pi / 6 && angle < pi / 6)
                    {
                        console.log("clicked circle 4");
                        // if you select this circle and no other circle has been selected
                        if(clickedIndex == null)
                        {
                            clickedIndex = 4;
                            selectedCircle = [circlePositions[clickedIndex * 3],
                                              circlePositions[clickedIndex * 3 + 1],
                                              1.1 * circlePositions[clickedIndex * 3 + 2],
                                              clickedIndex];
                        }
                        // else if you have an adjacent circle selected and want to combine colors
                        else if(clickedIndex != null && (clickedIndex == 3 || clickedIndex == 5  || clickedIndex == 14 || clickedIndex == 13))
                        {
                            selectedCircle = [10, 10, 0.01, 0] // off screen
                            // combine colors from selection and change the selected circle to a random col
                            if(clickedIndex == 14 || clickedIndex == 13)
                            {
                                let thisIndex = 4;
                                circleColors[thisIndex * 3] += circleColors[clickedIndex * 3];
                                circleColors[thisIndex * 3 + 1] += circleColors[clickedIndex * 3 + 1];
                                circleColors[thisIndex * 3 + 2] += circleColors[clickedIndex * 3 + 2];
                                juiceSelection[0] = 0;
                                juiceSelection[1] = thisIndex;

                                circleColors[clickedIndex * 3] = Math.random() * Math.random();
                                circleColors[clickedIndex * 3 + 1] = Math.random() * Math.random();
                                circleColors[clickedIndex * 3 + 2] = Math.random() * Math.random();
                            }
                            // combine colors and drain selected circle
                            else if (clickedIndex == 3 || clickedIndex == 5)
                            {
                                let thisIndex = 4;
                                circleColors[thisIndex * 3] += circleColors[clickedIndex * 3];
                                circleColors[thisIndex * 3 + 1] += circleColors[clickedIndex * 3 + 1];
                                circleColors[thisIndex * 3 + 2] += circleColors[clickedIndex * 3 + 2];
                                juiceSelection[0] = 0;
                                juiceSelection[1] = thisIndex;

                                circleColors[clickedIndex * 3] = 0;
                                circleColors[clickedIndex * 3 + 1] = 0;
                                circleColors[clickedIndex * 3 + 2] = 0;
                            }
                            clickedIndex = null;
                        }
                        // if you select this circle and another, non adjacent circle has been selected
                        else
                        {
                            clickedIndex = 4;
                            selectedCircle = [circlePositions[clickedIndex * 3],
                                              circlePositions[clickedIndex * 3 + 1],
                                              1.1 * circlePositions[clickedIndex * 3 + 2],
                                              clickedIndex];
                        }
                    }
                    else
                    {
                        console.log("clicked circle 3");
                        // if you select this circle and no other circle has been selected
                        if(clickedIndex == null)
                        {
                            clickedIndex = 3;
                            selectedCircle = [circlePositions[clickedIndex * 3],
                                              circlePositions[clickedIndex * 3 + 1],
                                              1.1 * circlePositions[clickedIndex * 3 + 2],
                                              clickedIndex];
                        }
                        // else if you have an adjacent circle selected and want to combine colors
                        else if(clickedIndex != null && (clickedIndex == 2 || clickedIndex == 4 || clickedIndex == 12 || clickedIndex == 11))
                        {
                            selectedCircle = [10, 10, 0.01, 0] // off screen
                            // combine colors from selection and change the selected circle to a random col
                            if(clickedIndex == 12 || clickedIndex == 11)
                            {
                                let thisIndex = 3;
                                circleColors[thisIndex * 3] += circleColors[clickedIndex * 3];
                                circleColors[thisIndex * 3 + 1] += circleColors[clickedIndex * 3 + 1];
                                circleColors[thisIndex * 3 + 2] += circleColors[clickedIndex * 3 + 2];
                                juiceSelection[0] = 0;
                                juiceSelection[1] = thisIndex;

                                circleColors[clickedIndex * 3] = Math.random() * Math.random();
                                circleColors[clickedIndex * 3 + 1] = Math.random() * Math.random();
                                circleColors[clickedIndex * 3 + 2] = Math.random() * Math.random();
                            }
                            // combine colors and drain selected circle
                            else if (clickedIndex == 4 || clickedIndex == 2)
                            {
                                let thisIndex = 3;
                                circleColors[thisIndex * 3] += circleColors[clickedIndex * 3];
                                circleColors[thisIndex * 3 + 1] += circleColors[clickedIndex * 3 + 1];
                                circleColors[thisIndex * 3 + 2] += circleColors[clickedIndex * 3 + 2];
                                juiceSelection[0] = 0;
                                juiceSelection[1] = thisIndex;

                                circleColors[clickedIndex * 3] = 0;
                                circleColors[clickedIndex * 3 + 1] = 0;
                                circleColors[clickedIndex * 3 + 2] = 0;
                            }
                            clickedIndex = null;
                        }
                        // if you select this circle and another, non adjacent circle has been selected
                        else
                        {
                            clickedIndex = 3;
                            selectedCircle = [circlePositions[clickedIndex * 3],
                                              circlePositions[clickedIndex * 3 + 1],
                                              1.1 * circlePositions[clickedIndex * 3 + 2],
                                              clickedIndex];
                        }
                    }
                }
            }
            // else in outer ring, must be in [7, 19]
            else
            {
                // cut into two halves because the aliased return value of asin
                if( xx > 0)
                {
                    if(angle >= -pi / 2 && angle < -pi / 3)
                    {
                        console.log("clicked circle 17");
                        // if you select this circle and no other circle has been selected
                        if(clickedIndex == null)
                        {
                            clickedIndex = 17;
                            selectedCircle = [circlePositions[clickedIndex * 3],
                                              circlePositions[clickedIndex * 3 + 1],
                                              1.1 * circlePositions[clickedIndex * 3 + 2],
                                              clickedIndex];
                        }
                        // else if you have an adjacent circle selected and want to combine colors
                        else if(clickedIndex != null && (clickedIndex == 18 || clickedIndex == 16))
                        {
                            selectedCircle = [10, 10, 0.01, 0] // off screen
                           
                            let thisIndex = 17;
                            circleColors[thisIndex * 3] += circleColors[clickedIndex * 3];
                            circleColors[thisIndex * 3 + 1] += circleColors[clickedIndex * 3 + 1];
                            circleColors[thisIndex * 3 + 2] += circleColors[clickedIndex * 3 + 2];
                            juiceSelection[0] = 0;
                            juiceSelection[1] = thisIndex;

                            circleColors[clickedIndex * 3] = Math.random() * Math.random();
                            circleColors[clickedIndex * 3 + 1] = Math.random() * Math.random();
                            circleColors[clickedIndex * 3 + 2] = Math.random() * Math.random();

                            clickedIndex = null;
                        }
                        // if you select this circle and another, non adjacent circle has been selected
                        else
                        {
                            clickedIndex = 17;
                            selectedCircle = [circlePositions[clickedIndex * 3],
                                              circlePositions[clickedIndex * 3 + 1],
                                              1.1 * circlePositions[clickedIndex * 3 + 2],
                                              clickedIndex];
                        }
                    }
                    else if(angle >= -pi / 3 && angle < -pi / 6)
                    {
                        console.log("clicked circle 18");
                        if(clickedIndex == null)
                        {
                            clickedIndex = 18;
                            selectedCircle = [circlePositions[clickedIndex * 3],
                                              circlePositions[clickedIndex * 3 + 1],
                                              1.1 * circlePositions[clickedIndex * 3 + 2],
                                              clickedIndex];
                        }
                        // else if you have an adjacent circle selected and want to combine colors
                        else if(clickedIndex != null && (clickedIndex == 17 || clickedIndex == 7 || clickedIndex == 6))
                        {
                            selectedCircle = [10, 10, 0.01, 0] // off screen

                            let thisIndex = 18;
                            circleColors[thisIndex * 3] += circleColors[clickedIndex * 3];
                            circleColors[thisIndex * 3 + 1] += circleColors[clickedIndex * 3 + 1];
                            circleColors[thisIndex * 3 + 2] += circleColors[clickedIndex * 3 + 2];
                            juiceSelection[0] = 0;
                            juiceSelection[1] = thisIndex;

                            circleColors[clickedIndex * 3] = Math.random() * Math.random();
                            circleColors[clickedIndex * 3 + 1] = Math.random() * Math.random();
                            circleColors[clickedIndex * 3 + 2] = Math.random() * Math.random();

                            clickedIndex = null;
                        }
                        // if you select this circle and another, non adjacent circle has been selected
                        else
                        {
                            clickedIndex = 18;
                            selectedCircle = [circlePositions[clickedIndex * 3],
                                              circlePositions[clickedIndex * 3 + 1],
                                              1.1 * circlePositions[clickedIndex * 3 + 2],
                                              clickedIndex];
                        }
                    }
                    else if(angle >= -pi / 6 && angle < 0)
                    {
                        console.log("clicked circle 7");
                        if(clickedIndex == null)
                        {
                            clickedIndex = 7;
                            selectedCircle = [circlePositions[clickedIndex * 3],
                                              circlePositions[clickedIndex * 3 + 1],
                                              1.1 * circlePositions[clickedIndex * 3 + 2],
                                              clickedIndex];
                        }
                        // else if you have an adjacent circle selected and want to combine colors
                        else if(clickedIndex != null && (clickedIndex == 18 || clickedIndex == 8 || clickedIndex == 1))
                        {
                            selectedCircle = [10, 10, 0.01, 0] // off screen
                            let thisIndex = 7;
                            circleColors[thisIndex * 3] += circleColors[clickedIndex * 3];
                            circleColors[thisIndex * 3 + 1] += circleColors[clickedIndex * 3 + 1];
                            circleColors[thisIndex * 3 + 2] += circleColors[clickedIndex * 3 + 2];
                            juiceSelection[0] = 0;
                            juiceSelection[1] = thisIndex;

                            circleColors[clickedIndex * 3] = Math.random() * Math.random();
                            circleColors[clickedIndex * 3 + 1] = Math.random() * Math.random();
                            circleColors[clickedIndex * 3 + 2] = Math.random() * Math.random();
                            clickedIndex = null;
                        }
                        // if you select this circle and another, non adjacent circle has been selected
                        else
                        {
                            clickedIndex = 7;
                            selectedCircle = [circlePositions[clickedIndex * 3],
                                              circlePositions[clickedIndex * 3 + 1],
                                              1.1 * circlePositions[clickedIndex * 3 + 2],
                                              clickedIndex];
                        }
                    }
                    else if(angle >= 0 && angle < pi / 6)
                    {
                        console.log("clicked circle 8");
                        if(clickedIndex == null)
                        {
                            clickedIndex = 8;
                            selectedCircle = [circlePositions[clickedIndex * 3],
                                              circlePositions[clickedIndex * 3 + 1],
                                              1.1 * circlePositions[clickedIndex * 3 + 2],
                                              clickedIndex];
                        }
                        // else if you have an adjacent circle selected and want to combine colors
                        else if(clickedIndex != null && (clickedIndex == 9 || clickedIndex == 7 || clickedIndex == 1))
                        {
                            selectedCircle = [10, 10, 0.01, 0] // off screen
                            let thisIndex = 8;
                            circleColors[thisIndex * 3] += circleColors[clickedIndex * 3];
                            circleColors[thisIndex * 3 + 1] += circleColors[clickedIndex * 3 + 1];
                            circleColors[thisIndex * 3 + 2] += circleColors[clickedIndex * 3 + 2];
                            juiceSelection[0] = 0;
                            juiceSelection[1] = thisIndex;

                            circleColors[clickedIndex * 3] = Math.random() * Math.random();
                            circleColors[clickedIndex * 3 + 1] = Math.random() * Math.random();
                            circleColors[clickedIndex * 3 + 2] = Math.random() * Math.random();
                            clickedIndex = null;
                        }
                        // if you select this circle and another, non adjacent circle has been selected
                        else
                        {
                            clickedIndex = 8;
                            selectedCircle = [circlePositions[clickedIndex * 3],
                                              circlePositions[clickedIndex * 3 + 1],
                                              1.1 * circlePositions[clickedIndex * 3 + 2],
                                              clickedIndex];
                        }
                    }
                    else if(angle >= pi / 6 && angle < pi / 3)
                    {
                        console.log("clicked circle 9");
                        if(clickedIndex == null)
                        {
                            clickedIndex = 9;
                            selectedCircle = [circlePositions[clickedIndex * 3],
                                              circlePositions[clickedIndex * 3 + 1],
                                              1.1 * circlePositions[clickedIndex * 3 + 2],
                                              clickedIndex];
                        }
                        // else if you have an adjacent circle selected and want to combine colors
                        else if(clickedIndex != null && (clickedIndex == 8 || clickedIndex == 10 || clickedIndex == 2))
                        {
                            selectedCircle = [10, 10, 0.01, 0] // off screen
                            let thisIndex = 9;
                            circleColors[thisIndex * 3] += circleColors[clickedIndex * 3];
                            circleColors[thisIndex * 3 + 1] += circleColors[clickedIndex * 3 + 1];
                            circleColors[thisIndex * 3 + 2] += circleColors[clickedIndex * 3 + 2];
                            juiceSelection[0] = 0;
                            juiceSelection[1] = thisIndex;

                            circleColors[clickedIndex * 3] = Math.random() * Math.random();
                            circleColors[clickedIndex * 3 + 1] = Math.random() * Math.random();
                            circleColors[clickedIndex * 3 + 2] = Math.random() * Math.random();
                            clickedIndex = null;
                        }
                        // if you select this circle and another, non adjacent circle has been selected
                        else
                        {
                            clickedIndex = 9;
                            selectedCircle = [circlePositions[clickedIndex * 3],
                                              circlePositions[clickedIndex * 3 + 1],
                                              1.1 * circlePositions[clickedIndex * 3 + 2],
                                              clickedIndex];
                        }
                    }
                    else
                    {
                        console.log("clicked circle 10");
                        if(clickedIndex == null)
                        {
                            clickedIndex = 10;
                            selectedCircle = [circlePositions[clickedIndex * 3],
                                              circlePositions[clickedIndex * 3 + 1],
                                              1.1 * circlePositions[clickedIndex * 3 + 2],
                                              clickedIndex];
                        }
                        // else if you have an adjacent circle selected and want to combine colors
                        else if(clickedIndex != null && (clickedIndex == 11 || clickedIndex == 9 || clickedIndex == 2))
                        {
                            selectedCircle = [10, 10, 0.01, 0] // off screen
                            let thisIndex = 10;
                            circleColors[thisIndex * 3] += circleColors[clickedIndex * 3];
                            circleColors[thisIndex * 3 + 1] += circleColors[clickedIndex * 3 + 1];
                            circleColors[thisIndex * 3 + 2] += circleColors[clickedIndex * 3 + 2];
                            juiceSelection[0] = 0;
                            juiceSelection[1] = thisIndex;

                            circleColors[clickedIndex * 3] = Math.random() * Math.random();
                            circleColors[clickedIndex * 3 + 1] = Math.random() * Math.random();
                            circleColors[clickedIndex * 3 + 2] = Math.random() * Math.random();
                            clickedIndex = null;
                        }
                        // if you select this circle and another, non adjacent circle has been selected
                        else
                        {
                            clickedIndex = 10;
                            selectedCircle = [circlePositions[clickedIndex * 3],
                                              circlePositions[clickedIndex * 3 + 1],
                                              1.1 * circlePositions[clickedIndex * 3 + 2],
                                              clickedIndex];
                        }
                    }
                }
                else
                {
                    if(angle >= -pi / 2 && angle < -pi / 3)
                    {
                        console.log("clicked circle 16");
                        if(clickedIndex == null)
                        {
                            clickedIndex = 16;
                            selectedCircle = [circlePositions[clickedIndex * 3],
                                              circlePositions[clickedIndex * 3 + 1],
                                              1.1 * circlePositions[clickedIndex * 3 + 2],
                                              clickedIndex];
                        }
                        // else if you have an adjacent circle selected and want to combine colors
                        else if(clickedIndex != null && (clickedIndex == 15 || clickedIndex == 17 || clickedIndex == 5))
                        {
                            selectedCircle = [10, 10, 0.01, 0] // off screen
                            let thisIndex = 16;
                            circleColors[thisIndex * 3] += circleColors[clickedIndex * 3];
                            circleColors[thisIndex * 3 + 1] += circleColors[clickedIndex * 3 + 1];
                            circleColors[thisIndex * 3 + 2] += circleColors[clickedIndex * 3 + 2];
                            juiceSelection[0] = 0;
                            juiceSelection[1] = thisIndex;

                            circleColors[clickedIndex * 3] = Math.random() * Math.random();
                            circleColors[clickedIndex * 3 + 1] = Math.random() * Math.random();
                            circleColors[clickedIndex * 3 + 2] = Math.random() * Math.random();
                            clickedIndex = null;
                        }
                        // if you select this circle and another, non adjacent circle has been selected
                        else
                        {
                            clickedIndex = 16;
                            selectedCircle = [circlePositions[clickedIndex * 3],
                                              circlePositions[clickedIndex * 3 + 1],
                                              1.1 * circlePositions[clickedIndex * 3 + 2],
                                              clickedIndex];
                        }
                    }
                    else if(angle >= -pi / 3 && angle < -pi / 6)
                    {
                        console.log("clicked circle 15");
                        if(clickedIndex == null)
                        {
                            clickedIndex = 15;
                            selectedCircle = [circlePositions[clickedIndex * 3],
                                              circlePositions[clickedIndex * 3 + 1],
                                              1.1 * circlePositions[clickedIndex * 3 + 2],
                                              clickedIndex];
                        }
                        // else if you have an adjacent circle selected and want to combine colors
                        else if(clickedIndex != null && (clickedIndex == 14 || clickedIndex == 16 || clickedIndex == 5))
                        {
                            selectedCircle = [10, 10, 0.01, 0] // off screen
                            let thisIndex = 15;
                            circleColors[thisIndex * 3] += circleColors[clickedIndex * 3];
                            circleColors[thisIndex * 3 + 1] += circleColors[clickedIndex * 3 + 1];
                            circleColors[thisIndex * 3 + 2] += circleColors[clickedIndex * 3 + 2];
                            juiceSelection[0] = 0;
                            juiceSelection[1] = thisIndex;

                            circleColors[clickedIndex * 3] = Math.random() * Math.random();
                            circleColors[clickedIndex * 3 + 1] = Math.random() * Math.random();
                            circleColors[clickedIndex * 3 + 2] = Math.random() * Math.random();
                            clickedIndex = null;
                        }
                        // if you select this circle and another, non adjacent circle has been selected
                        else
                        {
                            clickedIndex = 15;
                            selectedCircle = [circlePositions[clickedIndex * 3],
                                              circlePositions[clickedIndex * 3 + 1],
                                              1.1 * circlePositions[clickedIndex * 3 + 2],
                                              clickedIndex];
                        }
                    }
                    else if(angle >= -pi / 6 && angle < 0)
                    {
                        console.log("clicked circle 14");
                        if(clickedIndex == null)
                        {
                            clickedIndex = 14;
                            selectedCircle = [circlePositions[clickedIndex * 3],
                                              circlePositions[clickedIndex * 3 + 1],
                                              1.1 * circlePositions[clickedIndex * 3 + 2],
                                              clickedIndex];
                        }
                        // else if you have an adjacent circle selected and want to combine colors
                        else if(clickedIndex != null && (clickedIndex == 13 || clickedIndex == 15 || clickedIndex == 4))
                        {
                            selectedCircle = [10, 10, 0.01, 0] // off screen
                            let thisIndex = 14;
                            circleColors[thisIndex * 3] += circleColors[clickedIndex * 3];
                            circleColors[thisIndex * 3 + 1] += circleColors[clickedIndex * 3 + 1];
                            circleColors[thisIndex * 3 + 2] += circleColors[clickedIndex * 3 + 2];
                            juiceSelection[0] = 0;
                            juiceSelection[1] = thisIndex;

                            circleColors[clickedIndex * 3] = Math.random() * Math.random();
                            circleColors[clickedIndex * 3 + 1] = Math.random() * Math.random();
                            circleColors[clickedIndex * 3 + 2] = Math.random() * Math.random();
                            clickedIndex = null;
                        }
                        // if you select this circle and another, non adjacent circle has been selected
                        else
                        {
                            clickedIndex = 14;
                            selectedCircle = [circlePositions[clickedIndex * 3],
                                              circlePositions[clickedIndex * 3 + 1],
                                              1.1 * circlePositions[clickedIndex * 3 + 2],
                                              clickedIndex];
                        }
                    }
                    else if(angle >= 0 && angle < pi / 6)
                    {
                        console.log("clicked circle 13");
                        if(clickedIndex == null)
                        {
                            clickedIndex = 13;
                            selectedCircle = [circlePositions[clickedIndex * 3],
                                              circlePositions[clickedIndex * 3 + 1],
                                              1.1 * circlePositions[clickedIndex * 3 + 2],
                                              clickedIndex];
                        }
                        // else if you have an adjacent circle selected and want to combine colors
                        else if(clickedIndex != null && (clickedIndex == 12 || clickedIndex == 14 || clickedIndex == 4))
                        {
                            selectedCircle = [10, 10, 0.01, 0] // off screen
                            let thisIndex = 13;
                            circleColors[thisIndex * 3] += circleColors[clickedIndex * 3];
                            circleColors[thisIndex * 3 + 1] += circleColors[clickedIndex * 3 + 1];
                            circleColors[thisIndex * 3 + 2] += circleColors[clickedIndex * 3 + 2];
                            juiceSelection[0] = 0;
                            juiceSelection[1] = thisIndex;

                            circleColors[clickedIndex * 3] = Math.random() * Math.random();
                            circleColors[clickedIndex * 3 + 1] = Math.random() * Math.random();
                            circleColors[clickedIndex * 3 + 2] = Math.random() * Math.random();
                            clickedIndex = null;
                        }
                        // if you select this circle and another, non adjacent circle has been selected
                        else
                        {
                            clickedIndex = 13;
                            selectedCircle = [circlePositions[clickedIndex * 3],
                                              circlePositions[clickedIndex * 3 + 1],
                                              1.1 * circlePositions[clickedIndex * 3 + 2],
                                              clickedIndex];
                        }
                    }
                    else if(angle >= pi / 6 && angle < pi / 3)
                    {
                        console.log("clicked circle 12");
                        if(clickedIndex == null)
                        {
                            clickedIndex = 12;
                            selectedCircle = [circlePositions[clickedIndex * 3],
                                              circlePositions[clickedIndex * 3 + 1],
                                              1.1 * circlePositions[clickedIndex * 3 + 2],
                                              clickedIndex];
                        }
                        // else if you have an adjacent circle selected and want to combine colors
                        else if(clickedIndex != null && (clickedIndex == 11 || clickedIndex == 13 || clickedIndex == 3))
                        {
                            selectedCircle = [10, 10, 0.01, 0] // off screen
                            let thisIndex = 12;
                            circleColors[thisIndex * 3] += circleColors[clickedIndex * 3];
                            circleColors[thisIndex * 3 + 1] += circleColors[clickedIndex * 3 + 1];
                            circleColors[thisIndex * 3 + 2] += circleColors[clickedIndex * 3 + 2];
                            juiceSelection[0] = 0;
                            juiceSelection[1] = thisIndex;

                            circleColors[clickedIndex * 3] = Math.random() * Math.random();
                            circleColors[clickedIndex * 3 + 1] = Math.random() * Math.random();
                            circleColors[clickedIndex * 3 + 2] = Math.random() * Math.random();
                            clickedIndex = null;
                        }
                        // if you select this circle and another, non adjacent circle has been selected
                        else
                        {
                            clickedIndex = 12;
                            selectedCircle = [circlePositions[clickedIndex * 3],
                                              circlePositions[clickedIndex * 3 + 1],
                                              1.1 * circlePositions[clickedIndex * 3 + 2],
                                              clickedIndex];
                        }
                    }
                    else
                    {
                        console.log("clicked circle 11");
                        if(clickedIndex == null)
                        {
                            clickedIndex = 11;
                            selectedCircle = [circlePositions[clickedIndex * 3],
                                              circlePositions[clickedIndex * 3 + 1],
                                              1.1 * circlePositions[clickedIndex * 3 + 2],
                                              clickedIndex];
                        }
                        // else if you have an adjacent circle selected and want to combine colors
                        else if(clickedIndex != null && (clickedIndex == 10 || clickedIndex == 12 || clickedIndex == 3))
                        {
                            selectedCircle = [10, 10, 0.01, 0] // off screen
                            let thisIndex = 11;
                            circleColors[thisIndex * 3] += circleColors[clickedIndex * 3];
                            circleColors[thisIndex * 3 + 1] += circleColors[clickedIndex * 3 + 1];
                            circleColors[thisIndex * 3 + 2] += circleColors[clickedIndex * 3 + 2];
                            juiceSelection[0] = 0;
                            juiceSelection[1] = thisIndex;

                            circleColors[clickedIndex * 3] = Math.random() * Math.random();
                            circleColors[clickedIndex * 3 + 1] = Math.random() * Math.random();
                            circleColors[clickedIndex * 3 + 2] = Math.random() * Math.random();
                            clickedIndex = null;
                        }
                        // if you select this circle and another, non adjacent circle has been selected
                        else
                        {
                            clickedIndex = 11;
                            selectedCircle = [circlePositions[clickedIndex * 3],
                                              circlePositions[clickedIndex * 3 + 1],
                                              1.1 * circlePositions[clickedIndex * 3 + 2],
                                              clickedIndex];
                        }
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

    // -------------- Init Uniforms --------------
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform3fv(circlePositionsUniformLocation, circlePositions);
    gl.uniform3fv(circleColorsUniformLocation, circleColors);
    gl.uniform4fv(selectedCircleUniformLocation, selectedCircle);

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

        juiceSelection[0] += deltaTime;
        
        gl.uniform2f(juiceSelectionUniformLocation, juiceSelection[0], juiceSelection[1]);
        gl.uniform1f(timeUniformLocation, seconds);
        gl.uniform3fv(circleColorsUniformLocation, circleColors);
        gl.uniform4fv(selectedCircleUniformLocation, selectedCircle);

        // draw
        gl.drawArrays(primitiveType, offset, vertCount);

        // restart game loop
        window.requestAnimationFrame(gameLoop);
    }
}

main();
