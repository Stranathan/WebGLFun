class InputManager
{
    constructor(gl, aRenderer)
    {
        this.gl = gl;
        this.renderer = aRenderer;
       
        this.firstMouseBtnRayCastSwitch = false;
        this.clickRayDirWorld = vec3.create();

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

        
        this.firstMouseBtnRayCastSwitch = true;
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
    }
    mouseUp = e => 
    {
        if(this.firstMouseBtnRayCastSwitch == true)
        {
            this.firstMouseBtnRayCastSwitch = false;
        }
    }
}