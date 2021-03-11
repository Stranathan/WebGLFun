class Renderer 
{
    constructor(gl)
    {
        this.gl = gl;
        this.pos = vec4.fromValues(0, 0, +25., 1.);
        this.up = vec4.fromValues(0.0, 1.0, 0.0, 1.0);
        this.target = vec3.fromValues(0.0, 0.0, 0.0);
        this.maxRadius = 20;
        this.view = mat4.create();
        mat4.lookAt(this.view, [this.pos[0], this.pos[1], this.pos[2]], this.target, [this.up[0], this.up[1], this.up[2]]);
        this.projection = mat4.create();
        mat4.perspective(this.projection, 0.5 * Math.PI / 2., (this.gl.canvas.width / this.gl.canvas.height), 1, 100);
        this.renderables;
        this.instancedRenderables;
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
        // for(let i in this.renderables)
        // {
        //     this.gl.bindVertexArray(this.renderables[i].vao);
        //     this.gl.useProgram(this.renderables[i].program);
            
        //     for( let uniform in this.renderables[i].uniformLocations)
        //     {
        //         switch(uniform)
        //         {
        //             case "time":
        //                 this.gl.uniform1f(this.renderables[i].uniformLocations[uniform], seconds);
        //                 break;
        //             case "resolution":
        //                 this.gl.uniform2f(this.renderables[i].uniformLocations[uniform], this.gl.canvas.width, this.gl.canvas.height);
        //                 break;
        //             case "model":
        //                 this.gl.uniformMatrix4fv(this.renderables[i].uniformLocations[uniform], false, this.renderables[i].transform);
        //                 break;
        //             case "view":
        //                 this.gl.uniformMatrix4fv(this.renderables[i].uniformLocations[uniform], false, this.view); // this is ok as long as we only have one camera
        //                 break;
        //             case "projection":
        //                 this.gl.uniformMatrix4fv(this.renderables[i].uniformLocations[uniform], false, this.projection); //  ``
        //                 break;
        //             default:
        //                 console.log("some weird uniform was attached to the renderable and it doesn't know what to do");
        //         }
        //     }
        //     this.gl.drawArrays(this.renderables[i].primitiveType, 0, this.renderables[i].vertCount);
        // }
    }
}