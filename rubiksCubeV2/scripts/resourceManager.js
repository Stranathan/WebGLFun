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
        var rubicksProgram = createProgramFromSources(this.gl, rubicksVS, rubicksFS);
        var rubicksProgramUResolution = this.gl.getUniformLocation(rubicksProgram, "resolution");
        var rubicksProgramUTimeUniform = this.gl.getUniformLocation(rubicksProgram, "time");
        var rubicksProgramUModel = this.gl.getUniformLocation(rubicksProgram, "model");
        var rubicksProgramUView = this.gl.getUniformLocation(rubicksProgram, "view");
        var rubicksProgramUProjection = this.gl.getUniformLocation(rubicksProgram, "projection");

        testPlyParser();

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
                                time: rubicksProgramUTimeUniform,
                                model: rubicksProgramUModel,
                                view: rubicksProgramUView,
                                projection: rubicksProgramUProjection
                            }
            });
    }
}