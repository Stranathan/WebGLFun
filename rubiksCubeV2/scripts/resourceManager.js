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
    }
    init()
    {
        //  ---- Programs
        //  -- Regular Cubie
        var rubicksProgram = createProgramFromSources(this.gl, rubicksVS, rubicksFS);
        var rubicksProgramUResolution = this.gl.getUniformLocation(rubicksProgram, "resolution");
        var rubicksProgramUTime = this.gl.getUniformLocation(rubicksProgram, "time");
        var rubicksProgramUModel = this.gl.getUniformLocation(rubicksProgram, "model");
        var rubicksProgramUView = this.gl.getUniformLocation(rubicksProgram, "view");
        var rubicksProgramUProjection = this.gl.getUniformLocation(rubicksProgram, "projection");

        //  ---- Model Parser
        // -- #-- This has global scope variables theVertAttribDataToSend & thePlyVertCount - change this
        testPlyParser();

        //  ---- VAOs & Push to Render Queue
        //  -- Regular cubie VAO
        var rubicksVAO = this.gl.createVertexArray();
        var rubicksVBO = this.gl.createBuffer();
        this.gl.bindVertexArray(rubicksVAO);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, rubicksVBO);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(theVertAttribDataToSend), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(positionAttribLoc, 3, this.gl.FLOAT, false, (10 * 4), 0);
        this.gl.enableVertexAttribArray(positionAttribLoc);
        this.gl.vertexAttribPointer(normalAttribLoc, 3, this.gl.FLOAT, false, (10 * 4), (3 * 4));
        this.gl.enableVertexAttribArray(normalAttribLoc);
        this.gl.vertexAttribPointer(colorAttribLoc, 4, this.gl.FLOAT, false, (10 * 4), (6 * 4));
        this.gl.enableVertexAttribArray(colorAttribLoc);
        
        let tmpModel2 = mat4.create();
        mat4.scale(tmpModel2, tmpModel2, [0.5,0.5,0.5]);

        this.renderables.push(
            {tag: "plyTest",
            transform: tmpModel2,
            vao: rubicksVAO,
            primitiveType: gl.TRIANGLES,
            vertCount: thePlyVertCount,
            program: rubicksProgram,
            uniformLocations: {resolution: rubicksProgramUResolution,
                                time: rubicksProgramUTime,
                                model: rubicksProgramUModel,
                                view: rubicksProgramUView,
                                projection: rubicksProgramUProjection
                            }
            });

        // -- Cubie
        // -- Instanced cubie
        var cubieProgram = createProgramFromSources(gl, cubieVS, cubieFS);
        var cubieProgramUTime = gl.getUniformLocation(cubieProgram, "time");
        var cubieProgramUResolution = gl.getUniformLocation(cubieProgram, "resoluton");
        var cubieProgramUView = gl.getUniformLocation(cubieProgram, "view");
        var cubieProgramUProjection = gl.getUniformLocation(cubieProgram, "projection");

        var cubieVAO = gl.createVertexArray();
        gl.bindVertexArray(cubieVAO);
        var cubieVBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cubieVBO);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(theVertAttribDataToSend), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(positionAttribLoc, 3, this.gl.FLOAT, false, (10 * 4), 0);
        this.gl.enableVertexAttribArray(positionAttribLoc);
        this.gl.vertexAttribPointer(normalAttribLoc, 3, this.gl.FLOAT, false, (10 * 4), (3 * 4));
        this.gl.enableVertexAttribArray(normalAttribLoc);
        this.gl.vertexAttribPointer(colorAttribLoc, 4, this.gl.FLOAT, false, (10 * 4), (6 * 4));
        this.gl.enableVertexAttribArray(colorAttribLoc);

        //
        const cubieModelAttribData = new Float32Array(numCubies * 16); // 16 floats per mat4, 
        const cubieModelData = [];

        for (let i = 0; i < numCubies; i++) 
        {
            const byteOffsetToMatrix = i * 16 * 4; // 4 bytes per float, each mat4 has 16 floats
            const numFloatsForView = 16;
            // new Float32Array(buffer [, byteOffset [, length]]);
            cubieModelData.push
                (
                    new Float32Array
                        (
                        cubieModelAttribData.buffer,
                        byteOffsetToMatrix,
                        numFloatsForView
                        )
                );
        }
    
        // ---------------- Make the transform attrib data
        let startingX = -2;
        let startingY = -2;
        let startingZ = -2;

        for (let i = 0; i < cubieModelData.length; i++)
        {
            let theTransform = mat4.create();
            if(startingX == 2)
            {
                startingX = -2;
                startingY += 2;
            }
            mat4.translate(cubieModelData[i], theTransform, [startingX, startingY, 0]);

            startingX += 2;
        }

        // ---------------- Set the transform attrib
        const cubieModelVBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cubieModelVBO);
        //  gl.bufferData(gl.ARRAY_BUFFER, cubieModelAttribData.byteLength, gl.DYNAMIC_DRAW);
        gl.bufferData(gl.ARRAY_BUFFER, cubieModelAttribData, gl.STATIC_DRAW);

        // ---- if we need to change the transform data, can be done in real time if gl draw hint is set to gl.DYNAMIC_DRAW:
        // gl.bindBuffer(gl.ARRAY_BUFFER, cubieModelVBO);
        // gl.bufferSubData(gl.ARRAY_BUFFER, 0, cubieModelAttribData);

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
            {tag: "cubie",
            vao: cubieVAO,
            primitiveType: gl.TRIANGLES,
            numInstances: numCubies,
            vertCount: thePlyVertCount,
            program: cubieProgram,
            uniformLocations: { resolution: cubieProgramUResolution,
                                time: cubieProgramUTime,
                                view: cubieProgramUView,
                                projection: cubieProgramUProjection
                            }
            });
    }
}