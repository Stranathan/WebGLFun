class Renderer 
{
    constructor(gl)
    {
        this.gl = gl;
        this.cu = vec3.create();
        this.cf = vec3.create();
        this.cr = vec3.create();
        this.radius = 25.0;
        this.maxRadius = this.radius * 2.0;
        this.pos = vec4.fromValues(this.radius / 2., this.radius / 3., this.radius / 2., 1.);
        this.up = vec4.fromValues(0.0, 1.0, 0.0, 1.0);
        this.target = vec3.fromValues(0.0, 0.0, 0.0);
        this.view = mat4.create();
        mat4.lookAt(this.view, [this.pos[0], this.pos[1], this.pos[2]], this.target, [this.up[0], this.up[1], this.up[2]]);
        this.projection = mat4.create();
        mat4.perspective(this.projection, 0.5 * Math.PI / 2., (this.gl.canvas.width / this.gl.canvas.height), 1, 100);
        this.renderables;
        this.instancedRenderables;

        // tmp debug text
        this.t_ax_element = document.querySelector("#t_ax");
        this.t_ay_element = document.querySelector("#t_ay");
        this.t_az_element = document.querySelector("#t_az");
        this.t_bx_element = document.querySelector("#t_bx");
        this.t_by_element = document.querySelector("#t_by");
        this.t_bz_element = document.querySelector("#t_bz");
    }
    init(resourceManagerRenderables, resourceManagerInstancedRenderables)
    {
        this.gl.clearColor(clearCol[0], clearCol[1], clearCol[2], clearCol[3]); // see settings
        this.gl.enable(gl.DEPTH_TEST);
        this.renderables = resourceManagerRenderables;
        this.instancedRenderables = resourceManagerInstancedRenderables;
    }
    render(seconds)
    {
        resize(this.gl.canvas);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT);
        
        // Update view matrix from changed position
        mat4.lookAt(this.view, [this.pos[0], this.pos[1], this.pos[2]], this.target, [this.up[0], this.up[1], this.up[2]]); 
        
        // Instanced Draw Calls:
        for(let i in this.instancedRenderables)
        {
            this.gl.bindVertexArray(this.instancedRenderables[i].vao);
            this.gl.useProgram(this.instancedRenderables[i].program);
            
            for( let uniform in this.instancedRenderables[i].uniformLocations)
            {
                switch(uniform)
                {
                    case "time":
                        this.gl.uniform1f(this.instancedRenderables[i].uniformLocations[uniform], seconds);
                        break;
                    case "resolution":
                        this.gl.uniform2f(this.instancedRenderables[i].uniformLocations[uniform], this.gl.canvas.width, this.gl.canvas.height);
                        break;
                    case "view":
                        this.gl.uniformMatrix4fv(this.instancedRenderables[i].uniformLocations[uniform], false, this.view); // this is ok as long as we only have one camera
                        break;
                    case "projection":
                        this.gl.uniformMatrix4fv(this.instancedRenderables[i].uniformLocations[uniform], false, this.projection); //  ``
                        break;
                    default:
                        console.log("some weird uniform was attached to the renderable and it doesn't know what to do");
                }
            }
            this.gl.drawArraysInstanced(this.instancedRenderables[i].primitiveType, 0, this.instancedRenderables[i].vertCount, this.instancedRenderables[i].numInstances);
        }

        // // #----
        // theGUI.lightPos[0] = theGUI.lightPos[0];
        // theGUI.lightPos[1] = theGUI.lightPos[1];
        // theGUI.lightPos[2] = theGUI.lightPos[2];
        
        // Individual Draw Calls:
        for(let i in this.renderables)
        {
            this.gl.bindVertexArray(this.renderables[i].vao);
            this.gl.useProgram(this.renderables[i].program);
            
            if(this.renderables[i].tag == "unitCube")
            {
                let transl = mat4.create();
                // translate the rendering geometry
                mat4.translate(this.renderables[i].transform, transl,
                    [theGUI.translation_x, theGUI.translation_y, theGUI.translation_z]);
                transl = mat4.create();
                mat4.translate(transl, transl,
                    [theGUI.translation_x, theGUI.translation_y, theGUI.translation_z]);
                let tmp = vec4.fromValues(0, 0, 0, 1);
                vec4.transformMat4(tmp, tmp, transl);
                boxObj.A = [-1 + tmp[0], -1 + tmp[1], 1 + tmp[2]];
                boxObj.B = [1 + tmp[0], 1 + tmp[1], -1 + tmp[2]];
            }
            if(this.renderables[i].tag == "theRay")
            {
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array
                // can index into it like normal array
                gl.bindBuffer(gl.ARRAY_BUFFER, this.renderables[i].vbo);
                // this.renderables[i].fl32arr[0] = this.renderables[i].fl32arr[0] * Math.sin(seconds);
                
                // change line primitive's starting point
                this.renderables[i].fl32arr[0] = theGUI.ro_x;
                this.renderables[i].fl32arr[1] = theGUI.ro_y;
                this.renderables[i].fl32arr[2] = theGUI.ro_z;
                
                let rd = vec3.create();
                vec3.subtract(rd, [theGUI.target_x, theGUI.target_y, theGUI.target_z], [theGUI.ro_x, theGUI.ro_y, theGUI.ro_z]);
                vec3.normalize(rd, rd);

                theGUI.rd_x = rd[0];
                theGUI.rd_y = rd[1];
                theGUI.rd_z = rd[2];
                
                // change the line primitive's end point
                this.renderables[i].fl32arr[3] = theGUI.ro_x + theGUI.tt * theGUI.rd_x;
                this.renderables[i].fl32arr[4] = theGUI.ro_y + theGUI.tt * theGUI.rd_y;
                this.renderables[i].fl32arr[5] = theGUI.ro_z + theGUI.tt * theGUI.rd_z;

                gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.renderables[i].fl32arr);
            }
            
            // ---- update gizmos
            let intersectionObj = aabbRayIntersect(boxObj,
                {ro: [theGUI.ro_x, theGUI.ro_y, theGUI.ro_z],
                 rd: [theGUI.rd_x, theGUI.rd_y, theGUI.rd_z]
                });
            this.t_ax_element.textContent = intersectionObj.t_ax.toFixed(2);
            this.t_ay_element.textContent = intersectionObj.t_ay.toFixed(2);
            this.t_az_element.textContent = intersectionObj.t_az.toFixed(2);
            this.t_bx_element.textContent = intersectionObj.t_bx.toFixed(2);
            this.t_by_element.textContent = intersectionObj.t_by.toFixed(2);
            this.t_bz_element.textContent = intersectionObj.t_bz.toFixed(2);
            
            // ---- Change hit shader uniform condition
            if(intersectionObj.hit)
            {
                theGUI.hitCol[3] = 1.0;
            }
            else
            {
                theGUI.hitCol[3] = 0.;
            }
            if(this.renderables[i].tag == "xGizmoA")
            {
                let gizmoTranslation = [theGUI.ro_x + intersectionObj.t_ax * theGUI.rd_x,
                                        theGUI.ro_y + intersectionObj.t_ax * theGUI.rd_y,
                                        theGUI.ro_z + intersectionObj.t_ax * theGUI.rd_z]

                let gizmoTransform = mat4.create();
                mat4.translate(gizmoTransform, gizmoTransform, gizmoTranslation);
                mat4.scale(gizmoTransform, gizmoTransform, [0.5, 0.5, 0.5]);
                this.renderables[i].transform = gizmoTransform;
            }
            if(this.renderables[i].tag == "xGizmoB")
            {
                let gizmoTranslation = [theGUI.ro_x + intersectionObj.t_bx * theGUI.rd_x,
                                        theGUI.ro_y + intersectionObj.t_bx * theGUI.rd_y,
                                        theGUI.ro_z + intersectionObj.t_bx * theGUI.rd_z]

                let gizmoTransform = mat4.create();
                mat4.translate(gizmoTransform, gizmoTransform, gizmoTranslation);
                mat4.scale(gizmoTransform, gizmoTransform, [0.5, 0.5, 0.5]);
                this.renderables[i].transform = gizmoTransform;
            }
            if(this.renderables[i].tag == "yGizmoA")
            {
                let gizmoTranslation = [theGUI.ro_x + intersectionObj.t_ay * theGUI.rd_x,
                                        theGUI.ro_y + intersectionObj.t_ay * theGUI.rd_y,
                                        theGUI.ro_z + intersectionObj.t_ay * theGUI.rd_z]

                let gizmoTransform = mat4.create();
                mat4.translate(gizmoTransform, gizmoTransform, gizmoTranslation);
                mat4.scale(gizmoTransform, gizmoTransform, [0.5, 0.5, 0.5]);
                this.renderables[i].transform = gizmoTransform;
            }
            if(this.renderables[i].tag == "yGizmoB")
            {
                let gizmoTranslation = [theGUI.ro_x + intersectionObj.t_by * theGUI.rd_x,
                                        theGUI.ro_y + intersectionObj.t_by * theGUI.rd_y,
                                        theGUI.ro_z + intersectionObj.t_by * theGUI.rd_z]

                let gizmoTransform = mat4.create();
                mat4.translate(gizmoTransform, gizmoTransform, gizmoTranslation);
                mat4.scale(gizmoTransform, gizmoTransform, [0.5, 0.5, 0.5]);
                this.renderables[i].transform = gizmoTransform;
            }
            if(this.renderables[i].tag == "zGizmoA")
            {
                let gizmoTranslation = [theGUI.ro_x + intersectionObj.t_az * theGUI.rd_x,
                                        theGUI.ro_y + intersectionObj.t_az * theGUI.rd_y,
                                        theGUI.ro_z + intersectionObj.t_az * theGUI.rd_z]

                let gizmoTransform = mat4.create();
                mat4.translate(gizmoTransform, gizmoTransform, gizmoTranslation);
                mat4.scale(gizmoTransform, gizmoTransform, [0.5, 0.5, 0.5]);
                this.renderables[i].transform = gizmoTransform;
            }
            if(this.renderables[i].tag == "zGizmoB")
            {
                let gizmoTranslation = [theGUI.ro_x + intersectionObj.t_bz * theGUI.rd_x,
                                        theGUI.ro_y + intersectionObj.t_bz * theGUI.rd_y,
                                        theGUI.ro_z + intersectionObj.t_bz * theGUI.rd_z]

                let gizmoTransform = mat4.create();
                mat4.translate(gizmoTransform, gizmoTransform, gizmoTranslation);
                mat4.scale(gizmoTransform, gizmoTransform, [0.5, 0.5, 0.5]);
                this.renderables[i].transform = gizmoTransform;
            }

            for( let uniform in this.renderables[i].uniformLocations)
            {
                switch(uniform)
                {
                    case "time":
                        this.gl.uniform1f(this.renderables[i].uniformLocations[uniform], seconds);
                        break;
                    case "resolution":
                        this.gl.uniform2f(this.renderables[i].uniformLocations[uniform], this.gl.canvas.width, this.gl.canvas.height);
                        break;
                    case "model":
                        this.gl.uniformMatrix4fv(this.renderables[i].uniformLocations[uniform], false, this.renderables[i].transform);
                        break;
                    case "view":
                        this.gl.uniformMatrix4fv(this.renderables[i].uniformLocations[uniform], false, this.view); // this is ok as long as we only have one camera
                        break;
                    case "projection":
                        this.gl.uniformMatrix4fv(this.renderables[i].uniformLocations[uniform], false, this.projection); //  ``
                        break;
                    case "hitCol":
                        this.gl.uniform4f(this.renderables[i].uniformLocations[uniform], theGUI.hitCol[0], theGUI.hitCol[1], theGUI.hitCol[2], theGUI.hitCol[3]);
                        break;
                    case "lightPos":
                        this.gl.uniform3f(this.renderables[i].uniformLocations[uniform], theGUI.lightPos[0], theGUI.lightPos[1], theGUI.lightPos[2]);
                        break;
                    default:
                        console.log("some weird uniform was attached to the renderable and it doesn't know what to do");
                }
            }
            this.gl.drawArrays(this.renderables[i].primitiveType, 0, this.renderables[i].vertCount);
        }
    }
}