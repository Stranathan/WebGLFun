
'use strict';

const canvas = document.getElementById("cc");
const gl = canvas.getContext('webgl2');

var theGUI;

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

    // ---------------- Helper Lines to be replaced by fragment shader ----------------
    var renderables = [];

    var helperLinesProgram = createProgramFromSources(gl, mergeSortAnimationShadersVS, mergeSortAnimationShadersFS);
    var helperLinesProgramUTime = gl.getUniformLocation(helperLinesProgram, "time");
    var helperLinesProgramUResolution = gl.getUniformLocation(helperLinesProgram, "resolution");
    var helperLinesProgramUModel = gl.getUniformLocation(helperLinesProgram, "model");
    var helperLinesProgramUView = gl.getUniformLocation(helperLinesProgram, "view");
    var helperLinesProgramUProjection = gl.getUniformLocation(helperLinesProgram, "projection");

    // TESTING
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
        program: helperLinesProgram,
        uniformLocations: {resolution: helperLinesProgramUResolution,
                            time: helperLinesProgramUTime,
                            model: helperLinesProgramUModel,
                            view: helperLinesProgramUView,
                            projection: helperLinesProgramUProjection
                        }
        });
    
    // ---------------- WebGL State Init ----------------
    gl.clearColor(theGUI.clearColor[0] / 255, theGUI.clearColor[1] / 255, theGUI.clearColor[2]/255, theGUI.clearColor[3]);
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
        // -------- Resize canvas --------
        gl.clearColor(theGUI.clearColor[0] / 255, theGUI.clearColor[1] / 255, theGUI.clearColor[2]/255, theGUI.clearColor[3]);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        resize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        let tmpTransform = mat4.create();
        mat4.translate(tmpTransform, tmpTransform, [theGUI.x, theGUI.y, theGUI.z]);
        renderables[0].transform = tmpTransform;

        // -------- Time Update -------- 
        deltaTime = (timeStamp - oldTimeStamp) / 1000.0; // in seconds
        oldTimeStamp = timeStamp;
        seconds += deltaTime;    

        // update from GUI;

        // update projection from GUI
        mat4.ortho(projection, frustumLeft, frustumRight, frustumBottom, frustumTop, frustumNear, frustumFar); // see settings

        // -------- Helper Lines Vectors Render --------
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