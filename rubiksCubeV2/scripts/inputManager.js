class InputManager
{
    constructor(gl, aRenderer)
    {
        this.gl = gl;
        this.renderer = aRenderer;
        this.selectionSwitch = false;
        this.firstMouseBtnRayCastSwitch = false;
        this.clickRayDirWorld = vec3.create();
        
        this.theSelectedIndex;

        window.addEventListener( "mousedown", this.mouseDown);
        window.addEventListener( "mousemove", this.mouseMove);
        window.addEventListener( "mouseup", this.mouseUp);
    }
    mouseDown = event => 
    {
        // Normalized mouse coords
        let mouseClickX = event.offsetX;
        mouseClickX = (2. * mouseClickX / gl.canvas.width - 1.);
        let mouseClickY = event.offsetY;
        mouseClickY = -1 * (2. * mouseClickY / gl.canvas.height - 1.);

        // #---------- RAY CASTING -------------#
        // RAY IN NDC SPACE
        let ray_clip = vec4.fromValues(mouseClickX, mouseClickY, -1.0, 1.0);
        let inverseProjectionMatrix = mat4.create();
        mat4.invert(inverseProjectionMatrix, this.renderer.projection);

        vec4.transformMat4(ray_clip, ray_clip, inverseProjectionMatrix);
        // we only needed to un-project the x,y part,
        // so let's manually set the z, w part to mean "forwards, and not a point
        let ray_eye = vec4.fromValues(ray_clip[0], ray_clip[1], -1.0, 0.0);

        let inverseViewMatrix = mat4.create();
        mat4.invert(inverseViewMatrix, this.renderer.view);
        let tmp = vec4.create();
        vec4.transformMat4(tmp, ray_eye, inverseViewMatrix);
        this.clickRayDirWorld = vec3.fromValues(tmp[0], tmp[1], tmp[2]);

        vec3.normalize(this.clickRayDirWorld, this.clickRayDirWorld);
        // check to see if it intersects the cube at all:
        // see settings for cubeBoxObj
        let intersectionObj = aabbRayIntersect(cubeBoxObj, {ro: this.renderer.pos, rd: this.clickRayDirWorld})
        
        if(intersectionObj.hit)
        {          
            if(!this.selectionSwitch)
            {
                this.selectionSwitch = true;
                let hitIndices = [];
                let hitCount = 0;
                for(let i = 0; i < numCubies; i++)
                {
                    let A = [-1, -1, 1, 1];
                    let B = [1, 1, -1, 1];
                    vec4.transformMat4(A, A, this.renderer.instancedRenderables[0].attribMatrixData[i]);
                    vec4.transformMat4(B, B, this.renderer.instancedRenderables[0].attribMatrixData[i]);
                    
                    let secondIntersectionObj = aabbRayIntersect({A: A, B: B}, {ro: this.renderer.pos, rd: this.clickRayDirWorld});
                    if(secondIntersectionObj.hit)
                    {
                        hitCount++;
                        hitIndices.push(i);
                        if(hitCount >= rubicksLen)
                        {
                            // no need to do collect more than three hits (or however large the dimension of cube is)
                            break;
                        }
                    }
                }

                this.theSelectedIndex = hitIndices[0];
                let shortest = biggest;
                for(let i = 0; i < hitIndices.length; i++)
                {
                    //console.log(hitIndices[i]);
                    let x = this.renderer.instancedRenderables[0].attribMatrixData[hitIndices[i]][12];
                    let y = this.renderer.instancedRenderables[0].attribMatrixData[hitIndices[i]][13];
                    let z = this.renderer.instancedRenderables[0].attribMatrixData[hitIndices[i]][14];
                    let cubiePos = vec4.fromValues(x, y, z, 1);
                    let dist = vec4.squaredDistance(cubiePos, this.renderer.pos);
                    if(dist < shortest)
                    {
                        shortest = dist;
                        this.theSelectedIndex = hitIndices[i];
                    }
                }
                // console.log(
                //     "#------------------------#\n" + 
                //     this.renderer.instancedRenderables[0].attribMatrixData[this.theSelectedIndex][12] + ", " +
                //     this.renderer.instancedRenderables[0].attribMatrixData[this.theSelectedIndex][13] + ", " +
                //     this.renderer.instancedRenderables[0].attribMatrixData[this.theSelectedIndex][14]
                // );
            }
        }
        else
        {
            this.firstMouseBtnRayCastSwitch = true;
        }
    }
    mouseMove = event => 
    {
        // ---- Camera Rotation
        if(this.firstMouseBtnRayCastSwitch)
        {
            let mousePosX = event.offsetX;
            mousePosX = (2. * mousePosX / gl.canvas.width - 1.);
            let mousePosY = event.offsetY;
            mousePosY = -1 * (2. * mousePosY / gl.canvas.height - 1.);

            // #---------- RAY CASTING -------------#
            // RAY IN NDC SPACE
            let ray_clip = vec4.fromValues(mousePosX, mousePosY, -1.0, 1.0);
            let inverseProjectionMatrix = mat4.create();
            mat4.invert(inverseProjectionMatrix, this.renderer.projection);

            vec4.transformMat4(ray_clip, ray_clip, inverseProjectionMatrix);
            // we only needed to un-project the x,y part,
            // so let's manually set the z, w part to mean "forwards, and not a point
            let ray_eye = vec4.fromValues(ray_clip[0], ray_clip[1], -1.0, 0.0);

            let inverseViewMatrix = mat4.create();
            mat4.invert(inverseViewMatrix, this.renderer.view);
            let tmp = vec4.create();
            vec4.transformMat4(tmp, ray_eye, inverseViewMatrix);
            let rayDirWorld = vec3.fromValues(tmp[0], tmp[1], tmp[2]);

            let angle = vec3.angle(this.clickRayDirWorld, rayDirWorld);

            // easing function for angle as a function of camera radius
            // simple lerping (1-interpolatingVal)min + interpolatingVal * max
            let camRadius = vec3.create();
            vec3.subtract(camRadius, [this.renderer.pos[0], this.renderer.pos[1], this.renderer.pos[2]], this.renderer.target); 
            let len = vec3.length(camRadius)
            let interopolatingVal = Math.min(1, len/this.renderer.maxRadius);
            angle = (1 - interopolatingVal)*(angle/4) + interopolatingVal * (angle/2);

            let mouseMoveRotionAxis = vec3.create();
            vec3.cross(mouseMoveRotionAxis, this.clickRayDirWorld, rayDirWorld);

            let rotMat = mat4.create();
            mat4.rotate(rotMat, rotMat, angle, mouseMoveRotionAxis);
            vec4.transformMat4(this.renderer.up, this.renderer.up, rotMat);
            vec4.transformMat4(this.renderer.pos, this.renderer.pos, rotMat);
            
            // we need to get the angle per mouse move, --> set the vector from last
            // move to this vector so the next mouse move calculation is possible
            this.clickRayDirWorld = rayDirWorld;
        }
        // #---------- Rubiks Rotation ---------- #
        if(this.selectionSwitch == true)
        {
            let mousePosX = event.offsetX;
            mousePosX = (2. * mousePosX / gl.canvas.width - 1.);
            let mousePosY = event.offsetY;
            mousePosY = -1 * (2. * mousePosY / gl.canvas.height - 1.);

            // #---------- RAY CASTING -------------#
            // RAY IN NDC SPACE
            let ray_clip = vec4.fromValues(mousePosX, mousePosY, -1.0, 1.0);
            let inverseProjectionMatrix = mat4.create();
            mat4.invert(inverseProjectionMatrix, this.renderer.projection);

            vec4.transformMat4(ray_clip, ray_clip, inverseProjectionMatrix);
            // we only needed to un-project the x,y part,
            // so let's manually set the z, w part to mean "forwards, and not a point
            let ray_eye = vec4.fromValues(ray_clip[0], ray_clip[1], -1.0, 0.0);

            let inverseViewMatrix = mat4.create();
            mat4.invert(inverseViewMatrix, this.renderer.view);
            let tmp = vec4.create();
            vec4.transformMat4(tmp, ray_eye, inverseViewMatrix);
            let rayDirWorld = vec3.fromValues(tmp[0], tmp[1], tmp[2]);

            let angle = vec3.angle(this.clickRayDirWorld, rayDirWorld);

            let cubeMoveRotionAxis = vec3.create();
            vec3.cross(cubeMoveRotionAxis, this.clickRayDirWorld, rayDirWorld);
            vec3.normalize(cubeMoveRotionAxis, cubeMoveRotionAxis);

            // get a basis vector for the rotation axis
            let largestComponent = Math.max(Math.max(cubeMoveRotionAxis[0], cubeMoveRotionAxis[1]), cubeMoveRotionAxis[2]);
            if(largestComponent == cubeMoveRotionAxis[0])
            {
                cubeMoveRotionAxis[0] = 1;
                cubeMoveRotionAxis[1] = 0;
                cubeMoveRotionAxis[2] = 0;
            }
            else if(largestComponent == cubeMoveRotionAxis[1])
            {
                cubeMoveRotionAxis[0] = 0;
                cubeMoveRotionAxis[1] = 1;
                cubeMoveRotionAxis[2] = 0;
            }
            else{
                cubeMoveRotionAxis[0] = 0;
                cubeMoveRotionAxis[1] = 0;
                cubeMoveRotionAxis[2] = 1;
            }

            let rotMat = mat4.create();
            mat4.rotate(rotMat, rotMat, angle, cubeMoveRotionAxis);

            // go through cubie list and hit each that agrees with selectedIndex with the rotation matrix
            for(let i = 0; i < numCubies; i++)
            {
                if(cubeMoveRotionAxis[0] != 0)
                {
                    if(this.renderer.instancedRenderables[0].attribMatrixData[i][12] == 
                       this.renderer.instancedRenderables[0].attribMatrixData[this.theSelectedIndex][12])
                    {
                        mat4.multiply(this.renderer.instancedRenderables[0].attribMatrixData[i], rotMat, this.renderer.instancedRenderables[0].attribMatrixData[i]);
                        for(let j = 0; j < 16; j++)
                        {
                            this.renderer.instancedRenderables[0].fl32[(i * 4 * 16) + j] = this.renderer.instancedRenderables[0].attribMatrixData[i][j];
                        }
                        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.renderer.instancedRenderables[0].fl32);
                    }
                }
                
            }

            // we need to get the angle per mouse move, --> set the vector from last
            // move to this vector so the next mouse move calculation is possible
            this.clickRayDirWorld = rayDirWorld;
        }
    }
    mouseUp = e => 
    {
        if(this.selectionSwitch)
        {
            this.selectionSwitch = false;
        }
        if(this.firstMouseBtnRayCastSwitch == true)
        {
            this.firstMouseBtnRayCastSwitch = false;
        }
    }
}