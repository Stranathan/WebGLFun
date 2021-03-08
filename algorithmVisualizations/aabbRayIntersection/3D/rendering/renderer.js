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
        this.pos = vec4.fromValues(0, 0, this.radius, 1.);
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

        // Individual Draw Calls:
        for(let i in this.renderables)
        {
            this.gl.bindVertexArray(this.renderables[i].vao);
            this.gl.useProgram(this.renderables[i].program);
            
            if(this.renderables[i].tag == "theRay")
            {
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array
                // can index into it like normal array
                gl.bindBuffer(gl.ARRAY_BUFFER, this.renderables[i].vbo);
                // this.renderables[i].fl32arr[0] = this.renderables[i].fl32arr[0] * Math.sin(seconds);
                
                // change ray origin
                this.renderables[i].fl32arr[0] = 5 + 5 * Math.sin(seconds - 10);
                this.renderables[i].fl32arr[1] = 10 + 5 * Math.sin(seconds);
                this.renderables[i].fl32arr[2] = 10 + 5 * Math.cos(seconds);
                
                let rd = vec3.create();
                
                vec3.subtract(rd, theOrigin, [this.renderables[i].fl32arr[0],  this.renderables[i].fl32arr[1],  this.renderables[i].fl32arr[2]]);
                vec3.normalize(rd, rd);

                this.renderables[i].fl32arr[3] = tt * rd[0];
                this.renderables[i].fl32arr[4] = tt * rd[1];
                this.renderables[i].fl32arr[5] = tt * rd[2];

                gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.renderables[i].fl32arr);
            }
            
            // ---- update gizmos
            // hardcoded, change me (the ray is the 1st element in the renderables array)
            let intersectionObj = aabbRayIntersect(boxObj,
                {ro: [this.renderables[1].fl32arr[0], this.renderables[1].fl32arr[1], this.renderables[1].fl32arr[2]],
                    rd: [this.renderables[1].fl32arr[3], this.renderables[1].fl32arr[4], this.renderables[1].fl32arr[5]]
                });
            this.t_ax_element.textContent = intersectionObj.t_ax.toFixed(2);
            this.t_ay_element.textContent = intersectionObj.t_ay.toFixed(2);
            this.t_az_element.textContent = intersectionObj.t_az.toFixed(2);
            this.t_bx_element.textContent = intersectionObj.t_bx.toFixed(2);
            this.t_by_element.textContent = intersectionObj.t_by.toFixed(2);
            this.t_bz_element.textContent = intersectionObj.t_bz.toFixed(2);

            if(this.renderables[i].tag == "xGizmoA")
            {
                let gizmoTranslation = [this.renderables[1].fl32arr[0] + intersectionObj.t_ax * this.renderables[1].fl32arr[3],
                                        this.renderables[1].fl32arr[1] + intersectionObj.t_ax * this.renderables[1].fl32arr[4],
                                        this.renderables[1].fl32arr[2] + intersectionObj.t_ax * this.renderables[1].fl32arr[5]]

                let gizmoTransform = mat4.create();
                mat4.translate(gizmoTransform, gizmoTransform, gizmoTranslation);
                mat4.scale(gizmoTransform, gizmoTransform, [0.5, 0.5, 0.5]);
                this.renderables[i].transform = gizmoTransform;
            }
            if(this.renderables[i].tag == "xGizmoB")
            {
                let gizmoTranslation = [this.renderables[1].fl32arr[0] + intersectionObj.t_bx * this.renderables[1].fl32arr[3],
                                        this.renderables[1].fl32arr[1] + intersectionObj.t_bx * this.renderables[1].fl32arr[4],
                                        this.renderables[1].fl32arr[2] + intersectionObj.t_bx * this.renderables[1].fl32arr[5]]

                let gizmoTransform = mat4.create();
                mat4.translate(gizmoTransform, gizmoTransform, gizmoTranslation);
                mat4.scale(gizmoTransform, gizmoTransform, [0.5, 0.5, 0.5]);
                this.renderables[i].transform = gizmoTransform;
            }
            if(this.renderables[i].tag == "yGizmoA")
            {
                let gizmoTranslation = [this.renderables[1].fl32arr[0] + intersectionObj.t_ay * this.renderables[1].fl32arr[3],
                                        this.renderables[1].fl32arr[1] + intersectionObj.t_ay * this.renderables[1].fl32arr[4],
                                        this.renderables[1].fl32arr[2] + intersectionObj.t_ay * this.renderables[1].fl32arr[5]]

                let gizmoTransform = mat4.create();
                mat4.translate(gizmoTransform, gizmoTransform, gizmoTranslation);
                mat4.scale(gizmoTransform, gizmoTransform, [0.5, 0.5, 0.5]);
                this.renderables[i].transform = gizmoTransform;
            }
            if(this.renderables[i].tag == "yGizmoB")
            {
                let gizmoTranslation = [this.renderables[1].fl32arr[0] + intersectionObj.t_by * this.renderables[1].fl32arr[3],
                                        this.renderables[1].fl32arr[1] + intersectionObj.t_by * this.renderables[1].fl32arr[4],
                                        this.renderables[1].fl32arr[2] + intersectionObj.t_by * this.renderables[1].fl32arr[5]]

                let gizmoTransform = mat4.create();
                mat4.translate(gizmoTransform, gizmoTransform, gizmoTranslation);
                mat4.scale(gizmoTransform, gizmoTransform, [0.5, 0.5, 0.5]);
                this.renderables[i].transform = gizmoTransform;
            }
            if(this.renderables[i].tag == "zGizmoA")
            {
                let gizmoTranslation = [this.renderables[1].fl32arr[0] + intersectionObj.t_az * this.renderables[1].fl32arr[3],
                                        this.renderables[1].fl32arr[1] + intersectionObj.t_az * this.renderables[1].fl32arr[4],
                                        this.renderables[1].fl32arr[2] + intersectionObj.t_az * this.renderables[1].fl32arr[5]]

                let gizmoTransform = mat4.create();
                mat4.translate(gizmoTransform, gizmoTransform, gizmoTranslation);
                mat4.scale(gizmoTransform, gizmoTransform, [0.5, 0.5, 0.5]);
                this.renderables[i].transform = gizmoTransform;
            }
            if(this.renderables[i].tag == "zGizmoB")
            {
                let gizmoTranslation = [this.renderables[1].fl32arr[0] + intersectionObj.t_bz * this.renderables[1].fl32arr[3],
                                        this.renderables[1].fl32arr[1] + intersectionObj.t_bz * this.renderables[1].fl32arr[4],
                                        this.renderables[1].fl32arr[2] + intersectionObj.t_bz * this.renderables[1].fl32arr[5]]

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
                    default:
                        console.log("some weird uniform was attached to the renderable and it doesn't know what to do");
                }
            }
            this.gl.drawArrays(this.renderables[i].primitiveType, 0, this.renderables[i].vertCount);
        }
    }
}