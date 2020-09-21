"use strict";

// -------------- glMatrix Lib Aliases: --------------
var vec2 = glMatrix.vec2;
var vec3 = glMatrix.vec3;
var vec4 = glMatrix.vec4;
var mat2 = glMatrix.mat2;
var mat4 = glMatrix.mat4;


// -------------- Global variables to to be changed eventually --------------
var deltaTime = 0.0167; // just initing to ~60fps, sets to this in update loop
var clickSwitch = false;
var mouseClickWorldVector1, mouseClickWorldVector2; // for mouse camera movement

function main()
{
    var canvas = document.getElementById("cc");
    var gl = canvas.getContext("webgl2");
    if (!gl)
    {
        return;
    }

    // script was deffered, so clientWidth exists and is determined by CSS display width
    var width = gl.canvas.clientWidth;
    var height = gl.canvas.clientHeight;
    // Now we can set the size of the drawingbuffer to match this
    gl.canvas.width = width;
    gl.canvas.height = height;

    window.addEventListener('mousemove', function(event) { onMouseMove(event);});
    window.addEventListener('mousedown', function(event) { onMouseDown(event);});
    window.addEventListener('mouseup', function(event) { onMouseUp(event);});

    // -------------- Camera Init --------------
    var camSpeed, camRadius, theta, phi, camSpeedMultiplier; 
    camSpeed = 0.0; // camSpeed is set by update loop, just initing to something
    camSpeedMultiplier = 2.0; // arbitrarily chosen
    var camUp = vec3.fromValues(0.0, 1.0, 0.0); // really world up for gram-schmidt process
    var camPos = vec4.fromValues(0.0, 0.0, 18.0, 1);
    var targetPos = vec3.fromValues(0.0, 0.0, 0.0); // looking at origin, unit quad centered at origin
    var camFront = vec3.create();
    vec3.subtract(camFront, targetPos, [camPos[0], camPos[1], camPos[2]]);
    camRadius = vec3.length(camFront); // get init cam radius;
    theta = Math.acos(camPos[1] / camRadius); // init theta, spherical coordinates
    phi = Math.atan(camPos[0] / camPos[2]); // init phi, spherical coordinates
    vec3.normalize(camFront, camFront);

    var program = createProgramFromSources(gl, backgroundShadersVS, backgroundShadersFS);
    var positionAttributeLocation = gl.getAttribLocation(program, "vertexPos");
    var resolutionUniformLocation = gl.getUniformLocation(program, "resolution");
    var timeUniformLocation = gl.getUniformLocation(program, "time");

    var teapotProgram = createProgramFromSources(gl, teapotShadersVS, teapotShadersFS);
    var teapotPositionAttributeLocation = gl.getAttribLocation(teapotProgram, "vertexPos");
    var teapotResolutionUniformLocation = gl.getUniformLocation(teapotProgram, "resolution");
    var teapotTimeUniformLocation = gl.getUniformLocation(teapotProgram, "time");
    var modelUniformLocation = gl.getUniformLocation(teapotProgram, "model");
    var viewUniformLocation = gl.getUniformLocation(teapotProgram, "view");
    var projectionUniformLocation = gl.getUniformLocation(teapotProgram, "projection");
    // -------------- Trasformations Init --------------
    var model = mat4.create();
    // be careful about order
    mat4.scale(model, model, [0.5, 0.5, 0.5]);
    mat4.translate(model, model, [0.0, -5, 0]);
    mat4.rotateX(model, model, -Math.PI / 2);

    var view = mat4.create();
    mat4.lookAt(view, [camPos[0], camPos[1], camPos[2]], [0, 0, 0], camUp); // lookAt(out, eye, center, up)
    var projection = mat4.create();
    mat4.perspective(projection, 0.5 * Math.PI / 2., gl.canvas.width / gl.canvas.height, 1, 50); // mat4.perspective(out, fovy, aspect, near, far)

    var mouseX = 0; // NDC mouse move coords
    var mouseY = 0;
    var mouseClickX = 0; // NDC mouse click coords
    var mouseClickY = 0;
    
    var rayDirWorld; // raycasted ray var
    var rotationAxis = vec3.create(); // rotation axis for mouse move and release cam control
    var spinDecayTimer = 0; // to give inertia to spin
    var angularVel = 0; // just init, set in mouseMove

    function onMouseMove(event)
    {
        mouseX = event.offsetX;
        mouseX = (2. * mouseX / gl.canvas.width - 1.);
        mouseY = event.offsetY;
        mouseY = -1 * (2. * mouseY / gl.canvas.height - 1.);
        
        if(clickSwitch == true)
        {
            // RAY IN NDC SPACE
            let ray_clip = vec4.fromValues(mouseX, mouseY, -1.0, 1.0);
            let inverseProjectionMatrix = mat4.create();
            mat4.invert(inverseProjectionMatrix, projection);

            vec4.transformMat4(ray_clip, ray_clip, inverseProjectionMatrix);
            // we only needed to un-project the x,y part,
            // so let's manually set the z, w part to mean "forwards, and not a point
            let ray_eye = vec4.fromValues(ray_clip[0], ray_clip[1], -1.0, 0.0);

            let inverseViewMatrix = mat4.create();
            mat4.invert(inverseViewMatrix, view);
            let tmp = vec4.create();
            vec4.transformMat4(tmp, ray_eye, inverseViewMatrix);
            rayDirWorld = vec3.fromValues(tmp[0], tmp[1], tmp[2]);
            rayDirWorld = vec3.normalize(rayDirWorld, rayDirWorld);

            mouseClickWorldVector2 = rayDirWorld;
 
            let angle = vec3.angle(mouseClickWorldVector1, mouseClickWorldVector2);
            vec3.cross(rotationAxis, mouseClickWorldVector1, mouseClickWorldVector2);
    
            let rotMat = mat4.create();
            mat4.rotate(rotMat, rotMat, angle / 2, rotationAxis);
            vec4.transformMat4(camPos, camPos, rotMat);

            mouseClickWorldVector1 = mouseClickWorldVector2;
            angularVel = angle/deltaTime;
        }
    }
    function onMouseDown(event)
    {
        mouseClickX = event.offsetX;
        mouseClickX = (2. * mouseClickX / gl.canvas.width - 1.);
        mouseClickY = event.offsetY;
        mouseClickY = -1 * (2. * mouseClickY / gl.canvas.height - 1.);

        // #---------- RAY CASTING -------------#
        // RAY IN NDC SPACE
        let ray_clip = vec4.fromValues(mouseClickX, mouseClickY, -1.0, 1.0);
        let inverseProjectionMatrix = mat4.create();
        mat4.invert(inverseProjectionMatrix, projection);

        vec4.transformMat4(ray_clip, ray_clip, inverseProjectionMatrix);
        // we only needed to un-project the x,y part,
        // so let's manually set the z, w part to mean "forwards, and not a point
        let ray_eye = vec4.fromValues(ray_clip[0], ray_clip[1], -1.0, 0.0);

        let inverseViewMatrix = mat4.create();
        mat4.invert(inverseViewMatrix, view);
        let tmp = vec4.create();
        vec4.transformMat4(tmp, ray_eye, inverseViewMatrix);
        rayDirWorld = vec3.fromValues(tmp[0], tmp[1], tmp[2]);
        rayDirWorld = vec3.normalize(rayDirWorld, rayDirWorld);  

        // keep the view matrix from freaking out

        mouseClickWorldVector1 = rayDirWorld;
        clickSwitch = true;
    }

    function onMouseUp(event)
    {
        spinDecayTimer = 0;

        if(clickSwitch == true)
        {
            clickSwitch = false;
        }
    }
    // -------------- Background VAO Init --------------
    var vao = gl.createVertexArray();
    var positionBuffer = gl.createBuffer();

    var teapotVAO = gl.createVertexArray();
    var teapotVBO = gl.createBuffer();

    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // 0, 1, 2
    // 0, 2, 3
    var positions =
    [
        -1, +1, 0,
        -1, -1, 0,
        +1, -1, 0,

        -1, +1, 0,
        +1, -1, 0,
        +1, +1, 0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    var size = 3;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer

    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
    gl.enableVertexAttribArray(positionAttributeLocation);

    // -------------- Init Draw State --------------
    resize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);
    gl.bindVertexArray(vao);
        
    // -------------- Draw Type --------------
    var primitiveType = gl.TRIANGLES;
    var drawOffset = 0;
    var vertCount = 6;
    gl.drawArrays(primitiveType, drawOffset, vertCount);

    // -------------- Time Init --------------
    var oldTimeStamp = 0.0;
    var seconds = 0.0;

    // -------------- Rendering Resources Init --------------
    loadMesh("modelObjFiles/lowResUtahTeapot.txt");
    var meshConsoleLogCount = 0;
    var teapotVertCount = null;
    var activeVAOs = [];
    activeVAOs.push(vao);

    // -------------- Start Game Loop --------------
    window.requestAnimationFrame(gameLoop);
    function gameLoop(timeStamp)
    {
        resize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // time update
        let deltaTime = (timeStamp - oldTimeStamp) / 1000; // in seconds
        oldTimeStamp = timeStamp;
        seconds += deltaTime;

        // render handling / load resources
        // need to think about this
        if(meshLoadStatus != null && meshConsoleLogCount == 0)
        {
            console.log("loadCompleted");
            console.log(seconds);
            // make mesh VAO
            teapotVertCount = Math.round(meshVertData.length / 3);
            makeAVAO(teapotVAO, teapotVBO, teapotPositionAttributeLocation);
            activeVAOs.push(teapotVAO);
            meshConsoleLogCount += 1;
        }
        // -------------- DRAW --------------
        for(let r = 0; r < activeVAOs.length; r++)
        {
            gl.bindVertexArray(activeVAOs[r]);
            // CHANGE ME!!!
            // hardcoding to just make sure mesh is parsed correctly
            if(r == 0)
            {   
                gl.useProgram(program);
                gl.uniform1f(timeUniformLocation, seconds);
                gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                gl.drawArrays(primitiveType, offset, vertCount);
            }
            else
            {
                gl.useProgram(teapotProgram);
                gl.uniform1f(teapotTimeUniformLocation, seconds);
                gl.uniform2f(teapotResolutionUniformLocation, gl.canvas.width, gl.canvas.height);
                view = mat4.create();
                mat4.lookAt(view, [camPos[0], camPos[1], camPos[2]], [0, 0, 0], camUp); // lookAt(out, eye, center, up)
                gl.uniformMatrix4fv(modelUniformLocation, false, model);
                gl.uniformMatrix4fv(viewUniformLocation, false, view);
                gl.uniformMatrix4fv(projectionUniformLocation, false, projection);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                gl.drawArrays(primitiveType, offset, teapotVertCount);
            }
        }
        // restart game loop
        window.requestAnimationFrame(gameLoop);
    }

    function makeAVAO(vao, vbo, posAttrib)
    {   
        gl.bindVertexArray(vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(meshVertData), gl.STATIC_DRAW);
        var size = 3;
        var type = gl.FLOAT;
        var normalize = false;
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer

        gl.vertexAttribPointer(posAttrib, size, type, normalize, stride, offset);
        gl.enableVertexAttribArray(posAttrib);
    }
}

main();
