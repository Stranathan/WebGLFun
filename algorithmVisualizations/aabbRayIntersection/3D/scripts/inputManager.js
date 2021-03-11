class InputManager
{
    constructor(gl, aRenderer)
    {
        this.gl = gl;
        this.renderer = aRenderer;
       
        this.mouseMoveRotionAxis = vec3.create();
        this.clickRayDirWorld = vec3.create();
        this.firstMouseBtnRayCastSwitch = false;
        this.secondMouseBtnRayCastSwitch = false;
        this.setPanningDirectionSwitch = false;
    
        window.addEventListener( "mousedown", this.mouseDown);
        window.addEventListener( "mousemove", this.mouseMove);
        window.addEventListener( "mouseup", this.mouseUp);
        window.addEventListener( "wheel", this.mouseWheel);
    }
    mouseDown = event =>
    {
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

        if(event.which == 1)
        {
            //console.log("first mouse btn pressed");
            this.firstMouseBtnRayCastSwitch = true;
        }
        else if (event.which == 2) 
        {
            this.setPanningDirectionSwitch = true;
            this.secondMouseBtnRayCastSwitch = true;
            //console.log("right mouse btn pressed");
        }
    }
    mouseMove = event =>
    {
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

            let angle = vec3.angle(this.clickRayDirWorld, rayDirWorld) * 1.5;

            // easing function for angle as a function of camera radius
            // simple lerping (1-interpolatingVal)min + interpolatingVal * max
            let interopolatingVal = this.renderer.radius/this.renderer.maxRadius;
            angle = (1 - interopolatingVal)*(angle/4) + interopolatingVal * (angle/2);

            vec3.cross(this.mouseMoveRotionAxis, this.clickRayDirWorld, rayDirWorld);

            let rotMat = mat4.create();
            mat4.rotate(rotMat, rotMat, angle, this.mouseMoveRotionAxis);
            vec4.transformMat4(this.renderer.up, this.renderer.up, rotMat);
            vec4.transformMat4(this.renderer.pos, this.renderer.pos, rotMat);
            // vec4.transformMat4(theGUI.lightPos, theGUI.lightPos, rotMat);
            
            // we need to get the angle per mouse move, --> set the vector from last
            // move to this vector so the next mouse move calculation is possible
            this.clickRayDirWorld = rayDirWorld;
        }
        else if(this.secondMouseBtnRayCastSwitch)
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

            if(this.setPanningDirectionSwitch)
            {
                vec3.normalize(this.renderer.cu, [this.renderer.up[0], this.renderer.up[1], this.renderer.up[2]]);
                //console.log("the this.renderer.up is: " + vec3.str(this.renderer.cu));
                vec3.subtract(this.renderer.cf, this.renderer.target, [this.renderer.pos[0], this.renderer.pos[1], this.renderer.pos[2]]);
                vec3.normalize(this.renderer.cf, this.renderer.cf);
                //console.log("the forward is: " + vec3.str(this.renderer.cf));
                vec3.cross(this.renderer.cr, this.renderer.cf, this.renderer.cu);
                //console.log("the right is: " + vec3.str(this.renderer.cr));
                this.setPanningDirectionSwitch = false;
            }

            let panFactor = 10.;
            let relativeDiff = vec3.create();
            vec3.subtract(relativeDiff, this.clickRayDirWorld, rayDirWorld);
            let projectionOntoRightLen = vec3.dot(relativeDiff, this.renderer.cr) * panFactor;
            let projectionOntoUpLen = vec3.dot(relativeDiff, this.renderer.cu) * panFactor;

            let theVector = vec3.create();
            vec3.add(theVector,
                     vec3.fromValues(projectionOntoRightLen * this.renderer.cr[0], projectionOntoRightLen * this.renderer.cr[1], projectionOntoRightLen *this.renderer.cr[2]),
                     vec3.fromValues(projectionOntoUpLen * this.renderer.cu[0], projectionOntoUpLen * this.renderer.cu[1], projectionOntoUpLen * this.renderer.cu[2])
                    )
            vec3.add(this.renderer.target, this.renderer.target, theVector);
            vec4.add(this.renderer.pos, this.renderer.pos, [theVector[0], theVector[1], theVector[2], 0.]);
            this.clickRayDirWorld = rayDirWorld;
        }
    }
    mouseUp = event =>
    {
        if(this.firstMouseBtnRayCastSwitch == true)
        {
            this.firstMouseBtnRayCastSwitch = false;
        }
        if(this.secondMouseBtnRayCastSwitch == true)
        {
            this.secondMouseBtnRayCastSwitch = false;
        }
    }
    mouseWheel = event =>
    {
        if(!this.secondMouseBtnRayCastSwitch)
        {
            if(this.renderer.radius < this.renderer.maxRadius && this.renderer.radius > 0)
            {
                let relativePos = vec3.create();
                vec3.subtract(relativePos, this.renderer.target, vec3.fromValues(this.renderer.pos[0], this.renderer.pos[1], this.renderer.pos[2]));
                this.renderer.radius = vec3.length(relativePos);

                // scroll forward is negtive, scroll back is positive
                // probably do a coroutine here eventually to make it smooth
                
                vec3.normalize(relativePos, relativePos);
                let stepSize = -event.deltaY * 0.2;
                vec3.multiply(relativePos, relativePos, vec3.fromValues(stepSize, stepSize, stepSize));
                vec4.add(this.renderer.pos, this.renderer.pos, vec4.fromValues(relativePos[0], relativePos[1], relativePos[2], 0.));
            }
            else if(this.renderer.radius >= this.renderer.maxRadius && event.deltaY < 0)
            {
                let relativePos = vec3.create();
                vec3.subtract(relativePos, this.renderer.target, vec3.fromValues(this.renderer.pos[0], this.renderer.pos[1], this.renderer.pos[2]));
                this.renderer.radius = vec3.length(relativePos);

                // scroll forward is negtive, scroll back is positive
                // probably do a coroutine here eventually to make it smooth
                
                vec3.normalize(relativePos, relativePos);
                let stepSize = -event.deltaY * 0.2;
                vec3.multiply(relativePos, relativePos, vec3.fromValues(stepSize, stepSize, stepSize));
                vec4.add(this.renderer.pos, this.renderer.pos, vec4.fromValues(relativePos[0], relativePos[1], relativePos[2], 0.));
            }
        }
    }
}