
'use strict';

const canvas = document.getElementById("cc");
const gl = canvas.getContext('webgl2');

var theGUI;


/*
    Circletransforms.length == scalesArray.length == translationPointsArr.length
*/

function preload()
{
    makeTheGUI();
}
function main()
{
    if (!gl)
    {
        return;
    }

    // ---------------- Ortho Camera ----------------
    var camPos = [0., 0., -2., 1.0];
    var view = mat4.create();
    mat4.lookAt(view, [camPos[0], camPos[1], camPos[2]], [0., 0., 0.], [0., 1., 0.])
    var projection = mat4.create();
    mat4.ortho(projection, frustumLeft, frustumRight, frustumBottom, frustumTop, frustumNear, frustumFar); // see settings

    var renderables = [];

    // background shader
    var backgroundGridProgram = createProgramFromSources(gl, backgroundGridVS, backgroundGridFS);
    var backgroundGridProgramUBackgroundColor = gl.getUniformLocation(backgroundGridProgram, "backgroundColor");
    var backgroundGridProgramUGridResMul = gl.getUniformLocation(backgroundGridProgram, "gridResMult");
    var backgroundGridProgramUTime = gl.getUniformLocation(backgroundGridProgram, "time");
    var backgroundGridProgramUResolution = gl.getUniformLocation(backgroundGridProgram, "resolution");
    var backgroundGridProgramUModel = gl.getUniformLocation(backgroundGridProgram, "model");
    var backgroundGridProgramUView = gl.getUniformLocation(backgroundGridProgram, "view");
    var backgroundGridProgramUProjection = gl.getUniformLocation(backgroundGridProgram, "projection");

    var quadVAO = gl.createVertexArray();
    var quadVBO = gl.createBuffer();
    gl.bindVertexArray(quadVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(theUnitQuad), gl.STATIC_DRAW);
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(positionAttribLoc, 3, gl.FLOAT, false, stride, offset);
    gl.enableVertexAttribArray(positionAttribLoc);

    let quadModel = mat4.create();
    mat4.translate(quadModel, quadModel, [0., 0., 0.]);
    mat4.scale(quadModel,quadModel, [1,1,1]);  

    renderables.push(
        {tag: "quad",
        transform: quadModel,
        vao: quadVAO,
        primitiveType: gl.TRIANGLES,
        vertCount: 6,
        program: backgroundGridProgram,
        uniformLocations: { backgroundColor: backgroundGridProgramUBackgroundColor,
                            gridResMult: backgroundGridProgramUGridResMul,
                            resolution: backgroundGridProgramUResolution,
                            time: backgroundGridProgramUTime,
                            model: backgroundGridProgramUModel,
                            view: backgroundGridProgramUView,
                            projection: backgroundGridProgramUProjection
                        }
        });
    

    // ---------------- Scales Array ----------------
    var scalesArray = [];
    var translationPointsArr = makeACircleBoundary(numCirclesToSort, circleBoundaryRadius); // js obj {xPoints, yPoints}

    for (let i = 0; i < numCirclesToSort; i++)
    {
        let rnd = Math.random() * circlesLargestScale / 2;
        translationPointsArr.x[i] *= canvas.height / canvas.width;
        scalesArray.push(rnd);
    }
    
    // ---------------- Instanced Circles ----------------

	var circlesProgram = createProgramFromSources(gl, circlesVS, circlesFS);
	var circlesProgramUTime = gl.getUniformLocation(circlesProgram, "time");
    var circlesProgramUResolution = gl.getUniformLocation(circlesProgram, "resoluton");
    var circlesProgramUView = gl.getUniformLocation(circlesProgram, "view");
    var circlesProgramUProjection = gl.getUniformLocation(circlesProgram, "projection");

    var circlesVAO = gl.createVertexArray();
    gl.bindVertexArray(circlesVAO);
    var circleObj = makeACircle(circleSideNum, 1);
    var circlesVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, circlesVBO);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circleObj.vertexData), gl.STATIC_DRAW);
    var size = 3;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;        
    var offset = 0;
    gl.vertexAttribPointer(positionAttribLoc, size, type, normalize, stride, offset);
    gl.enableVertexAttribArray(positionAttribLoc);

    /*
        Note:
        We make an array of total size needed for the matrix transforms that will be sent to our attribute
        this is circleTransformsAtrribData
        circleTransforms "sees this" in circleTransformsAtrribData.buffer:
        (see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array/Float32Array)
        "When called with a buffer, and optionally a byteOffset and a length argument, a new typed array view is created that views the specified ArrayBuffer"
        The goal behind this is that we can just use circleTransforms to manipulate matrix info and the buffer will
        take care of itself, I think
    */
    const circleTransformsAtrribData = new Float32Array(numCirclesToSort * 16); // 16 floats per mat4, 
    const circleTransforms = [];

    for (let i = 0; i < numCirclesToSort; i++)
    {
        const byteOffsetToMatrix = i * 16 * 4; // 4 bytes per float, each mat4 has 16 floats
        const numFloatsForView = 16;
        // new Float32Array(buffer [, byteOffset [, length]]);
        circleTransforms.push
            (
                new Float32Array
                    (
                    circleTransformsAtrribData.buffer,
                    byteOffsetToMatrix,
                    numFloatsForView
                    )
            );
    }
    
    // ---------------- Make the transform attrib data
    for (let i = 0; i < circleTransforms.length; i++)
    {
        let theTransform = mat4.create();
        mat4.scale(circleTransforms[i], theTransform, [1 * canvas.height / canvas.width, 1, 1]);
    }

    // ---------------- Set the transform attrib
    const circleTransformsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, circleTransformsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, circleTransformsAtrribData, gl.DYNAMIC_DRAW);

    // ---- if we need to change the transform data, can be done in real time if gl draw hint is set to gl.DYNAMIC_DRAW:
    

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

    // ---------------- WebGL State Init ----------------
    gl.clearColor(0.,0.,0.,1.);
    gl.enable(gl.DEPTH_TEST);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // ---------------- Time Init ----------------
    var oldTimeStamp = 0.0;
    var seconds = 0.0;
    var deltaTime = 0.0;

    // ---------------- Start Render Loop ----------------
    window.requestAnimationFrame(render);

    function render(timeStamp) 
    {
        // -------- Time Update -------- 
        deltaTime = (timeStamp - oldTimeStamp) / 1000.0; // in seconds
        oldTimeStamp = timeStamp;
        seconds += deltaTime;   

        // -------- Resize canvas --------
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        resize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // -------- Update from GUI --------
        let tmpTransform = mat4.create();
        mat4.translate(tmpTransform, tmpTransform, [theGUI.gridX, theGUI.gridY, theGUI.gridZ]);
        renderables[0].transform = tmpTransform;

        mat4.ortho(projection, -1. * theGUI.frustumMultiplier, theGUI.frustumMultiplier, -1. * theGUI.frustumMultiplier, theGUI.frustumMultiplier, theGUI.frustumNear, theGUI.frustumFar); // see settings
        for (let i = 0; i < circleTransforms.length; i++)
        {
            let theTransform = mat4.create();
            mat4.scale(
                circleTransforms[i],
                theTransform,
                [scalesArray[i] * (1 / theGUI.gridScale) * canvas.height / canvas.width,
                 scalesArray[i] * (1 / theGUI.gridScale),
                 scalesArray[i] * (1 / theGUI.gridScale)]);
            mat4.translate(circleTransforms[i],
                 circleTransforms[i],
                  [(1 / scalesArray[i]) * canvas.width / canvas.height * translationPointsArr.x[i],
                   (1 / scalesArray[i]) * translationPointsArr.y[i],
                   (1 / scalesArray[i]) * theGUI.circleZ]);
        }
        
        // Circle Instances Render
        gl.bindVertexArray(circlesVAO);
        gl.useProgram(circlesProgram);

        gl.uniform1f(circlesProgramUTime, seconds);
        gl.uniform2f(circlesProgramUResolution, gl.canvas.width, gl.canvas.height);
        gl.uniformMatrix4fv(circlesProgramUView, false, view);
        gl.uniformMatrix4fv(circlesProgramUProjection, false, projection);

        gl.bindBuffer(gl.ARRAY_BUFFER, circleTransformsBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, circleTransformsAtrribData);
        gl.drawArraysInstanced(gl.TRIANGLES, 0, circleObj.numVerts, numCirclesToSort);

        // -------- Background grid and everything else
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
                    case "backgroundColor":
                        gl.uniform3f(renderables[i].uniformLocations[uniform], theGUI.backgroundColor[0] / 255, theGUI.backgroundColor[1] / 255, theGUI.backgroundColor[2] / 255);
                        break;
                    case "gridResMult":
                        gl.uniform1f(renderables[i].uniformLocations[uniform], theGUI.gridScale);
                        break;
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

        // -------- Restart Render Loop --------
        window.requestAnimationFrame(render);
    }
}

preload();
main();