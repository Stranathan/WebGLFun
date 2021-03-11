/*
    A one off thing to hold 
*/

class ResourceManager
{
    constructor(gl)
    {
        this.gl = gl;
        this.instancedRenderables = [];
        this.renderables = [];
        this.gizmoPositions = [];
        makeTheGUI();
    }
    init()
    {
        // var t_ax_element = document.querySelector("#t_ax");
        // var t_ay_element = document.querySelector("#t_ay");
        // var t_az_element = document.querySelector("#t_az");
        // var t_bx_element = document.querySelector("#t_bx");
        // var t_by_element = document.querySelector("#t_by");
        // var t_bz_element = document.querySelector("#t_bz");

        // ------------------ Shader Programs Init ----------------
        var unitCubeProgram = createProgramFromSources(gl, unitCubeShaderVS, unitCubeShaderFS);
        var gizmoProgram = createProgramFromSources(gl, gizmoShaderVS, gizmoShaderFS);
        var rayProgram = createProgramFromSources(gl, lineShaderVS, lineShaderFS);
        var axisLinesProgram = createProgramFromSources(gl, axisLinesVS, axisLinesFS);

        // ------------------ Uniform locs Init ----------------
        var unitCubeProgramUHitCol = gl.getUniformLocation(unitCubeProgram, "hitCol");
        var unitCubeProgramUTime = gl.getUniformLocation(unitCubeProgram, "time");
        var unitCubeProgramULightPos = gl.getUniformLocation(unitCubeProgram, "lightPos");
        var unitCubeProgramUResolution = gl.getUniformLocation(unitCubeProgram, "resolution");
        var unitCubeProgramUModel = gl.getUniformLocation(unitCubeProgram, "model");
        var unitCubeProgramUView = gl.getUniformLocation(unitCubeProgram, "view");
        var unitCubeProgramUProjection = gl.getUniformLocation(unitCubeProgram, "projection");

        var gizmoProgramUTime = gl.getUniformLocation(gizmoProgram, "time");
        var gizmoProgramUResolution = gl.getUniformLocation(gizmoProgram, "resolution");
        var gizmoProgramULightPos = gl.getUniformLocation(gizmoProgram, "lightPos");
        var gizmoProgramUModel = gl.getUniformLocation(gizmoProgram, "model");
        var gizmoProgramUView = gl.getUniformLocation(gizmoProgram, "view");
        var gizmoProgramUProjection = gl.getUniformLocation(gizmoProgram, "projection");
        //
        var rayProgramUTime = gl.getUniformLocation(rayProgram, "time");
        var rayProgramUResolution = gl.getUniformLocation(rayProgram, "resolution");
        var rayProgramUModel = gl.getUniformLocation(rayProgram, "model");
        var rayProgramUView = gl.getUniformLocation(rayProgram, "view");
        var rayProgramUProjection = gl.getUniformLocation(rayProgram, "projection");
        //
        var axisLinesProgramUTime = gl.getUniformLocation(axisLinesProgram, "time");
        var axisLinesProgramUResolution = gl.getUniformLocation(axisLinesProgram, "resoluton");
        var axisLinesProgramUView = gl.getUniformLocation(axisLinesProgram, "view");
        var axisLinesProgramUProjection = gl.getUniformLocation(axisLinesProgram, "projection");

        // ------------------ VAOs Init ----------------

        // ------------------ Unit Cube VAO Init ------------------
        plyParser(the_unit_cube);

        var unitCubeVAO = gl.createVertexArray();
        var unitCubeVBO = gl.createBuffer();
        gl.bindVertexArray(unitCubeVAO);
        gl.bindBuffer(gl.ARRAY_BUFFER, unitCubeVBO);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(theVertAttribDataToSendObj.theUnitCubeAttribArr), gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionAttribLoc, 3, gl.FLOAT, false, (10 * 4), 0);
        gl.enableVertexAttribArray(positionAttribLoc);
        gl.vertexAttribPointer(normalAttribLoc, 3, gl.FLOAT, false, (10 * 4), (3 * 4));
        gl.enableVertexAttribArray(normalAttribLoc);
        gl.vertexAttribPointer(colorAttribLoc, 4, gl.FLOAT, false, (10 * 4), (6 * 4));
        gl.enableVertexAttribArray(colorAttribLoc);
        
        this.renderables.push(
            {tag: "unitCube",
            transform: mat4.create(),
            vao: unitCubeVAO,
            primitiveType: gl.TRIANGLES,
            vertCount: thePlyVertCountObj.unitCubeVertCount,
            program: unitCubeProgram,
            uniformLocations: { lightPos: unitCubeProgramULightPos,
                                hitCol: unitCubeProgramUHitCol,
                                time: unitCubeProgramUTime, 
                                resolution: unitCubeProgramUResolution,
                                model: unitCubeProgramUModel,
                                projection: unitCubeProgramUProjection,
                                view: unitCubeProgramUView
                            }
            });

        // ------------------ Ray VAO Init ------------------
        let ro = startingRayOrigin;
        let rd = vec3.create();
        vec3.subtract(rd, theOrigin, ro);
        vec3.normalize(rd, rd);

        let theRay = [
            theGUI.ro_x, theGUI.ro_y, theGUI.ro_z,
            theGUI.ro_x + theGUI.tt * rd, theGUI.ro_y + theGUI.tt * rd, theGUI.ro_z + theGUI.tt * rd
        ];
        let rayVertexData = new Float32Array(theRay);
        var theRayVAO = gl.createVertexArray();
        var theRayVBO = gl.createBuffer();
        gl.bindVertexArray(theRayVAO);
        gl.bindBuffer(gl.ARRAY_BUFFER, theRayVBO);
        gl.bufferData(gl.ARRAY_BUFFER, rayVertexData, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(positionAttribLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionAttribLoc);
        
        this.renderables.push(
            {tag: "theRay",
            fl32arr: rayVertexData,
            vbo: theRayVBO,
            transform: mat4.create(),
            vao: theRayVAO,
            primitiveType: gl.LINES,
            vertCount: 2,
            program: rayProgram,
            uniformLocations: { time: rayProgramUTime, 
                                resolution: rayProgramUResolution,
                                model: rayProgramUModel,
                                projection: rayProgramUProjection,
                                view: rayProgramUView
                            }
            });
        
        // ------------------ x gizmo VAO Init ------------------
        let rayObj = {ro: ro, rd: rd};
        let intersectionObj = aabbRayIntersect(boxObj, rayObj);
        
        // t_ax_element.textContent = intersectionObj.t_ax.toFixed(2);
        // t_ay_element.textContent = intersectionObj.t_ay.toFixed(2);
        // t_az_element.textContent = intersectionObj.t_az.toFixed(2);
        // t_bx_element.textContent = intersectionObj.t_bx.toFixed(2);
        // t_by_element.textContent = intersectionObj.t_by.toFixed(2);
        // t_bz_element.textContent = intersectionObj.t_bz.toFixed(2);

        plyParser(xGizmo);
        
        var xGizmoVAO = gl.createVertexArray();
        var xGizmoVBO = gl.createBuffer();
        gl.bindVertexArray(xGizmoVAO);
        gl.bindBuffer(gl.ARRAY_BUFFER, xGizmoVBO);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(theVertAttribDataToSendObj.theXGizoAttribArr), gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionAttribLoc, 3, gl.FLOAT, false, (10 * 4), 0);
        gl.enableVertexAttribArray(positionAttribLoc);
        gl.vertexAttribPointer(normalAttribLoc, 3, gl.FLOAT, false, (10 * 4), (3 * 4));
        gl.enableVertexAttribArray(normalAttribLoc);
        gl.vertexAttribPointer(colorAttribLoc, 4, gl.FLOAT, false, (10 * 4), (6 * 4));
        gl.enableVertexAttribArray(colorAttribLoc);
        
        let gizmoTranslation = [rayObj.ro[0] + intersectionObj.t_ax * rayObj.rd[0],
                                rayObj.ro[1] + intersectionObj.t_ax * rayObj.rd[1],
                                rayObj.ro[2] + intersectionObj.t_ax * rayObj.rd[2]]
        let gizmoTransform = mat4.create();
        mat4.translate(gizmoTransform, gizmoTransform, gizmoTranslation);
        mat4.scale(gizmoTransform, gizmoTransform, [0.5, 0.5, 0.5]);

        // Ax gizmo
        this.renderables.push(
            {tag: "xGizmoA",
            transform: gizmoTransform,
            vao: xGizmoVAO,
            primitiveType: gl.TRIANGLES,
            vertCount: thePlyVertCountObj.gizmoXVertCount,
            program: gizmoProgram,
            uniformLocations: { lightPos: gizmoProgramULightPos,
                                time: gizmoProgramUTime, 
                                resolution: gizmoProgramUResolution,
                                model: gizmoProgramUModel,
                                projection: gizmoProgramUProjection,
                                view: gizmoProgramUView
                            }
            });

        gizmoTranslation = [rayObj.ro[0] + intersectionObj.t_bx * rayObj.rd[0],
                            rayObj.ro[1] + intersectionObj.t_bx * rayObj.rd[1],
                            rayObj.ro[2] + intersectionObj.t_bx * rayObj.rd[2]]

        gizmoTransform = mat4.create();
        mat4.translate(gizmoTransform, gizmoTransform, gizmoTranslation);
        mat4.scale(gizmoTransform, gizmoTransform, [0.5, 0.5, 0.5]);

        // Ax gizmo
        this.renderables.push(
        {tag: "xGizmoB",
        transform: gizmoTransform,
        vao: xGizmoVAO,
        primitiveType: gl.TRIANGLES,
        vertCount: thePlyVertCountObj.gizmoXVertCount,
        program: gizmoProgram,
        uniformLocations: { lightPos: gizmoProgramULightPos,
                    time: gizmoProgramUTime, 
                    resolution: gizmoProgramUResolution,
                    model: gizmoProgramUModel,
                    projection: gizmoProgramUProjection,
                    view: gizmoProgramUView
                }
        });
        
        // ------------------ y gizmo VAO Init ------------------
        plyParser(yGizmo);
        
        var yGizmoVAO = gl.createVertexArray();
        var yGizmoVBO = gl.createBuffer();
        gl.bindVertexArray(yGizmoVAO);
        gl.bindBuffer(gl.ARRAY_BUFFER, yGizmoVBO);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(theVertAttribDataToSendObj.theYGizoAttribArr), gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionAttribLoc, 3, gl.FLOAT, false, (10 * 4), 0);
        gl.enableVertexAttribArray(positionAttribLoc);
        gl.vertexAttribPointer(normalAttribLoc, 3, gl.FLOAT, false, (10 * 4), (3 * 4));
        gl.enableVertexAttribArray(normalAttribLoc);
        gl.vertexAttribPointer(colorAttribLoc, 4, gl.FLOAT, false, (10 * 4), (6 * 4));
        gl.enableVertexAttribArray(colorAttribLoc);
        
        gizmoTranslation = [rayObj.ro[0] + intersectionObj.t_ay * rayObj.rd[0],
                            rayObj.ro[1] + intersectionObj.t_ay * rayObj.rd[1],
                            rayObj.ro[2] + intersectionObj.t_ay * rayObj.rd[2]]

        gizmoTransform = mat4.create();
        mat4.translate(gizmoTransform, gizmoTransform, gizmoTranslation);
        mat4.scale(gizmoTransform, gizmoTransform, [0.5, 0.5, 0.5]);

        // A_y gizmo
        this.renderables.push(
        {tag: "yGizmoA",
        transform: gizmoTransform,
        vao: yGizmoVAO,
        primitiveType: gl.TRIANGLES,
        vertCount: thePlyVertCountObj.gizmoYVertCount,
        program: gizmoProgram,
        uniformLocations: {
                    lightPos: gizmoProgramULightPos,
                    time: gizmoProgramUTime, 
                    resolution: gizmoProgramUResolution,
                    model: gizmoProgramUModel,
                    projection: gizmoProgramUProjection,
                    view: gizmoProgramUView
                }
        });

        gizmoTranslation = [rayObj.ro[0] + intersectionObj.t_by * rayObj.rd[0],
                            rayObj.ro[1] + intersectionObj.t_by * rayObj.rd[1],
                            rayObj.ro[2] + intersectionObj.t_by * rayObj.rd[2]]

        gizmoTransform = mat4.create();
        mat4.translate(gizmoTransform, gizmoTransform, gizmoTranslation);
        mat4.scale(gizmoTransform, gizmoTransform, [0.5, 0.5, 0.5]);

        // B_y gizmo
        this.renderables.push(
        {tag: "yGizmoB",
        transform: gizmoTransform,
        vao: yGizmoVAO,
        primitiveType: gl.TRIANGLES,
        vertCount: thePlyVertCountObj.gizmoYVertCount,
        program: gizmoProgram,
        uniformLocations: {
            lightPos: gizmoProgramULightPos,        
            time: gizmoProgramUTime, 
                    resolution: gizmoProgramUResolution,
                    model: gizmoProgramUModel,
                    projection: gizmoProgramUProjection,
                    view: gizmoProgramUView
                }
        });
        
        // ------------------ z gizmo VAO Init ------------------
        plyParser(zGizmo);
        
        var zGizmoVAO = gl.createVertexArray();
        var zGizmoVBO = gl.createBuffer();
        gl.bindVertexArray(zGizmoVAO);
        gl.bindBuffer(gl.ARRAY_BUFFER, zGizmoVBO);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(theVertAttribDataToSendObj.theZGizoAttribArr), gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionAttribLoc, 3, gl.FLOAT, false, (10 * 4), 0);
        gl.enableVertexAttribArray(positionAttribLoc);
        gl.vertexAttribPointer(normalAttribLoc, 3, gl.FLOAT, false, (10 * 4), (3 * 4));
        gl.enableVertexAttribArray(normalAttribLoc);
        gl.vertexAttribPointer(colorAttribLoc, 4, gl.FLOAT, false, (10 * 4), (6 * 4));
        gl.enableVertexAttribArray(colorAttribLoc);
        
        gizmoTranslation = [rayObj.ro[0] + intersectionObj.t_az * rayObj.rd[0],
                            rayObj.ro[1] + intersectionObj.t_az * rayObj.rd[1],
                            rayObj.ro[2] + intersectionObj.t_az * rayObj.rd[2]]

        gizmoTransform = mat4.create();
        mat4.translate(gizmoTransform, gizmoTransform, gizmoTranslation);
        mat4.scale(gizmoTransform, gizmoTransform, [0.5, 0.5, 0.5]);

        // A_y gizmo
        this.renderables.push(
        {tag: "zGizmoA",
        transform: gizmoTransform,
        vao: zGizmoVAO,
        primitiveType: gl.TRIANGLES,
        vertCount: thePlyVertCountObj.gizmoZVertCount,
        program: gizmoProgram,
        uniformLocations: {
                    lightPos: gizmoProgramULightPos,
                    time: gizmoProgramUTime, 
                    resolution: gizmoProgramUResolution,
                    model: gizmoProgramUModel,
                    projection: gizmoProgramUProjection,
                    view: gizmoProgramUView
                }
        });

        gizmoTranslation = [rayObj.ro[0] + intersectionObj.t_bz * rayObj.rd[0],
                            rayObj.ro[1] + intersectionObj.t_bz * rayObj.rd[1],
                            rayObj.ro[2] + intersectionObj.t_bz * rayObj.rd[2]]

        gizmoTransform = mat4.create();
        mat4.translate(gizmoTransform, gizmoTransform, gizmoTranslation);
        mat4.scale(gizmoTransform, gizmoTransform, [0.5, 0.5, 0.5]);

        // B_y gizmo
        this.renderables.push(
        {tag: "zGizmoB",
        transform: gizmoTransform,
        vao: zGizmoVAO,
        primitiveType: gl.TRIANGLES,
        vertCount: thePlyVertCountObj.gizmoZVertCount,
        program: gizmoProgram,
        uniformLocations: {lightPos: gizmoProgramULightPos,
                           time: gizmoProgramUTime, 
                           resolution: gizmoProgramUResolution,
                           model: gizmoProgramUModel,
                           projection: gizmoProgramUProjection,
                           view: gizmoProgramUView
                }
        });    

        // -- Instanced Axis Lines
        var axisLinesVAO = gl.createVertexArray();
        gl.bindVertexArray(axisLinesVAO);
        var axisLinesVBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, axisLinesVBO);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(theUnitYLine), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(positionAttribLoc, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(positionAttribLoc);

        //  -- set up color attribute
        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        let colArr = [
            // some matte red for the first 4 lines
            0.84, 0.1, 0.23,
            0.84, 0.1, 0.23,
            0.84, 0.1, 0.23,
            0.84, 0.1, 0.23,
            // some matte blue for the next 4 lines
            0.05, 0.15, 0.7,
            0.05, 0.15, 0.7,
            0.05, 0.15, 0.7,
            0.05, 0.15, 0.7,
            // some matte green for the next 4 lines
            0.23, 0.52, 0.25,
            0.23, 0.52, 0.25,
            0.23, 0.52, 0.25,
            0.23, 0.52, 0.25,
        ]
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colArr), gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(colorAttribLoc);
        this.gl.vertexAttribPointer(colorAttribLoc, 3, gl.FLOAT, false, 0, 0);
        this.gl.vertexAttribDivisor(colorAttribLoc, 1); // this line says this attribute only changes for each 1 instance

        // -- Set up model transform attribute
        const axisLinesAttribData = new Float32Array(numAxes * 16); // 16 floats per mat4, 
        const axisLinesModelData = [];

        // 3 axis for each point on cube = numAxes
        for (let i = 0; i < numAxes; i++) 
        {
            const byteOffsetToMatrix = i * 16 * 4; // 4 bytes per float, each mat4 has 16 floats
            const numFloatsForView = 16;
            // new Float32Array(buffer [, byteOffset [, length]]);
            axisLinesModelData.push
                (
                    new Float32Array
                        (
                        axisLinesAttribData.buffer,
                        byteOffsetToMatrix,
                        numFloatsForView
                        )
                );
        }
    
        // ---- set the model transform attribute data
        // ---- y-axis lines:
        let tmp = mat4.create();
        mat4.translate(axisLinesModelData[0], tmp, [-1, 0, 1])
        mat4.scale(axisLinesModelData[0], axisLinesModelData[0], [100, 100, 100])
        tmp = mat4.create();
        mat4.translate(axisLinesModelData[1], tmp, [-1, 0, -1])
        mat4.scale(axisLinesModelData[1], axisLinesModelData[1], [100, 100, 100])
        tmp = mat4.create();
        mat4.translate(axisLinesModelData[2], tmp, [1, 0, -1])
        mat4.scale(axisLinesModelData[2], axisLinesModelData[2], [100, 100, 100])
        tmp = mat4.create();
        mat4.translate(axisLinesModelData[3], tmp, [1, 0, 1])
        mat4.scale(axisLinesModelData[3], axisLinesModelData[3], [100, 100, 100])
        // ---- x-axis lines:
        tmp = mat4.create();
        mat4.rotateZ(axisLinesModelData[4], tmp, Math.PI / 2)
        mat4.translate(axisLinesModelData[4], axisLinesModelData[4], [1, -1, -1]);
        mat4.scale(axisLinesModelData[4], axisLinesModelData[4], [100, 100, 100]);
        tmp = mat4.create();
        mat4.rotateZ(axisLinesModelData[5], tmp, Math.PI / 2)
        mat4.translate(axisLinesModelData[5], axisLinesModelData[5], [1, -1, 1]);
        mat4.scale(axisLinesModelData[5], axisLinesModelData[5], [100, 100, 100]);
        tmp = mat4.create();
        mat4.rotateZ(axisLinesModelData[6], tmp, Math.PI / 2)
        mat4.translate(axisLinesModelData[6], axisLinesModelData[6], [-1, 1, 1]);
        mat4.scale(axisLinesModelData[6], axisLinesModelData[6], [100, 100, 100]);
        tmp = mat4.create();
        mat4.rotateZ(axisLinesModelData[7], tmp, Math.PI / 2)
        mat4.translate(axisLinesModelData[7], axisLinesModelData[7], [-1, 1, -1]);
        mat4.scale(axisLinesModelData[7], axisLinesModelData[7], [100, 100, 100]);
        // ---- z-axis lines:
        tmp = mat4.create();
        mat4.rotateX(axisLinesModelData[8], tmp, Math.PI / 2)
        mat4.translate(axisLinesModelData[8], axisLinesModelData[8], [1, -1, -1]);
        mat4.scale(axisLinesModelData[8], axisLinesModelData[8], [100, 100, 100]);
        tmp = mat4.create();
        mat4.rotateX(axisLinesModelData[9], tmp, Math.PI / 2)
        mat4.translate(axisLinesModelData[9], axisLinesModelData[9], [1, -1, 1]);
        mat4.scale(axisLinesModelData[9], axisLinesModelData[9], [100, 100, 100]);
        tmp = mat4.create();
        mat4.rotateX(axisLinesModelData[10], tmp, Math.PI / 2)
        mat4.translate(axisLinesModelData[10], axisLinesModelData[10], [-1, 1, 1]);
        mat4.scale(axisLinesModelData[10], axisLinesModelData[10], [100, 100, 100]);
        tmp = mat4.create();
        mat4.rotateX(axisLinesModelData[11], tmp, Math.PI / 2)
        mat4.translate(axisLinesModelData[11], axisLinesModelData[11], [-1, 1, -1]);
        mat4.scale(axisLinesModelData[11], axisLinesModelData[11], [100, 100, 100]);

        const axisLinesModelVBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, axisLinesModelVBO);
        //  gl.bufferData(gl.ARRAY_BUFFER, axisLinesAttribData.byteLength, gl.DYNAMIC_DRAW);
        gl.bufferData(gl.ARRAY_BUFFER, axisLinesAttribData, gl.STATIC_DRAW);

        // ---- if we need to change the transform data, can be done in real time if gl draw hint is set to gl.DYNAMIC_DRAW:
        // gl.bindBuffer(gl.ARRAY_BUFFER, axisLinesModelVBO);
        // gl.bufferSubData(gl.ARRAY_BUFFER, 0, axisLinesAttribData);

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
        this.instancedRenderables.push(
            {tag: "axisLines",
            vao: axisLinesVAO,
            primitiveType: gl.LINES,
            numInstances: numAxes,
            vertCount: 2,
            program: axisLinesProgram,
            uniformLocations: { resolution: axisLinesProgramUResolution,
                                time: axisLinesProgramUTime,
                                view: axisLinesProgramUView,
                                projection: axisLinesProgramUProjection
                            }
            });
    }
}