
var renderables = [];
//
var basisVectorsProgram = createProgramFromSources(gl, basisVectorsVS, basisVectorsFS);
var basisVectorsProgramUTime = gl.getUniformLocation(basisVectorsProgram, "time");
var basisVectorsProgramUResolution = gl.getUniformLocation(basisVectorsProgram, "resoluton");
var basisVectorsProgramUModel = gl.getUniformLocation(basisVectorsProgram, "model");
var basisVectorsProgramUView = gl.getUniformLocation(basisVectorsProgram, "view");
var basisVectorsProgramUProjection = gl.getUniformLocation(basisVectorsProgram, "projection");

// ---- Z-Axis ----
var zAxisVAO = gl.createVertexArray();
var zAxisVBO = gl.createBuffer();
gl.bindVertexArray(zAxisVAO);
gl.bindBuffer(gl.ARRAY_BUFFER, zAxisVBO);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(theUnitZLineWithColors), gl.STATIC_DRAW);
var stride = 6 * 4;
var offset = 0;
gl.vertexAttribPointer(positionAttribLoc, 3, gl.FLOAT, false, stride, offset);
gl.enableVertexAttribArray(positionAttribLoc);
offset = 3 * 4;
gl.vertexAttribPointer(colorAttribLoc, 3, gl.FLOAT, false, stride, offset);
gl.enableVertexAttribArray(colorAttribLoc);

let zAxisModel = mat4.create();
mat4.scale(zAxisModel, zAxisModel, lineLength);

renderables.push(
    {tag: "zAxis",
    transform: zAxisModel,
    vao: zAxisVAO,
    primitiveType: gl.LINES,
    arrayedTriCount: 2,
    program: basisVectorsProgram,
    uniformLocations: {resolution: basisVectorsProgramUResolution,
                        time: basisVectorsProgramUTime,
                        model: basisVectorsProgramUModel,
                        view: basisVectorsProgramUView,
                        projection: basisVectorsProgramUProjection
                    }
    });
// ---- Y-Axis ----
var yAxisVAO = gl.createVertexArray();
var yAxisVBO = gl.createBuffer();
gl.bindVertexArray(yAxisVAO);
gl.bindBuffer(gl.ARRAY_BUFFER, yAxisVBO);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(theUnitYLineWithColors), gl.STATIC_DRAW);
offset = 0;
gl.vertexAttribPointer(positionAttribLoc, 3, gl.FLOAT, false, stride, offset);
gl.enableVertexAttribArray(positionAttribLoc);
offset = 3 * 4;
gl.vertexAttribPointer(colorAttribLoc, 3, gl.FLOAT, false, stride, offset);
gl.enableVertexAttribArray(colorAttribLoc);

let yAxisModel = mat4.create();
mat4.scale(yAxisModel, yAxisModel, lineLength);

renderables.push(
    {tag: "yAxis",
    transform: yAxisModel,
    vao: yAxisVAO,
    primitiveType: gl.LINES,
    arrayedTriCount: 2,
    program: basisVectorsProgram,
    uniformLocations: {resolution: basisVectorsProgramUResolution,
                        time: basisVectorsProgramUTime,
                        model: basisVectorsProgramUModel,
                        view: basisVectorsProgramUView,
                        projection: basisVectorsProgramUProjection
                    }
    });

// ---- X-Axis ----
var xAxisVAO = gl.createVertexArray();
var xAxisVBO = gl.createBuffer();
gl.bindVertexArray(xAxisVAO);
gl.bindBuffer(gl.ARRAY_BUFFER, xAxisVBO);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(theUnitXLineWithColors), gl.STATIC_DRAW);
offset = 0;
gl.vertexAttribPointer(positionAttribLoc, 3, gl.FLOAT, false, stride, offset);
gl.enableVertexAttribArray(positionAttribLoc);
offset = 3 * 4;
gl.vertexAttribPointer(colorAttribLoc, 3, gl.FLOAT, false, stride, offset);
gl.enableVertexAttribArray(colorAttribLoc);

let xAxisModel = mat4.create();
mat4.scale(xAxisModel, xAxisModel, lineLength);

renderables.push(
    {tag: "xAxis",
    transform: xAxisModel,
    vao: xAxisVAO,
    primitiveType: gl.LINES,
    arrayedTriCount: 2,
    program: basisVectorsProgram,
    uniformLocations: {resolution: basisVectorsProgramUResolution,
                        time: basisVectorsProgramUTime,
                        model: basisVectorsProgramUModel,
                        view: basisVectorsProgramUView,
                        projection: basisVectorsProgramUProjection
                    }
    });
//---------------- Basis Vectors Rendering ----------------
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
            gl.drawArrays(renderables[i].primitiveType, 0, renderables[i].arrayedTriCount);
        }