"use strict";

function main() 
{
    // ------------------ Canvas Init ----------------
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

    // ----------------- ------------------
    var firstMouseBtnRayCastSwitch = false;
    var secondMouseBtnRayCastSwitch = false;

    var setPanningDirectionSwitch = false;
    var cu = vec3.create();
    var cf = vec3.create();
    var cr = vec3.create();

    var clickRayDirWorld = null;
    var mouseMoveRotionAxis = vec3.create();

    // ------------------ Event Handling Init------------------
    window.addEventListener('mousedown', function(event) { onMouseDown(event);});
    window.addEventListener('mousemove', function(event) { onMouseMove(event);});
    window.addEventListener('mouseup', function(event) { onMouseUp(event);});
    window.addEventListener('wheel', function(event) { onMouseWheel(event);});

    // ------------------ Cam Init ------------------
    let camRadius = 10;
    let maxCamRadius = 3 * camRadius;
    let pos = vec4.fromValues(2, 0, camRadius, 1.);
    let up = vec4.fromValues(0.0, 1.0, 0.0, 1.0);
    let target = vec3.fromValues(0.0, 0.0, 0.0);
    let view = mat4.create();
    mat4.lookAt(view, [pos[0], pos[1], pos[2]], target, [up[0], up[1], up[2]]);
    let projection = mat4.create();
    mat4.perspective(projection, 0.5 * Math.PI / 2., (gl.canvas.width / gl.canvas.height), 1, 100);

    // ------------------ Renderables Init ------------------
    var renderables = [];

    // ------------------ Shader Program Init ----------------
    var gizmoProgram = createProgramFromSources(gl, gizmoShaderVS, gizmoShaderFS);
    var rayProgram = createProgramFromSources(gl, lineShaderVS, lineShaderFS);

    // ------------------ Uniforms binding points
    var gizmoProgramUTime = gl.getUniformLocation(gizmoProgram, "time");
    var gizmoProgramUResolution = gl.getUniformLocation(gizmoProgram, "resolution");
    var gizmoProgramUModel = gl.getUniformLocation(gizmoProgram, "model");
    var gizmoProgramUView = gl.getUniformLocation(gizmoProgram, "view");
    var gizmoProgramUProjection = gl.getUniformLocation(gizmoProgram, "projection");
    //
    var rayProgramUTime = gl.getUniformLocation(rayProgram, "time");
    var rayProgramUResolution = gl.getUniformLocation(rayProgram, "resolution");
    var rayProgramUModel = gl.getUniformLocation(rayProgram, "model");
    var rayProgramUView = gl.getUniformLocation(rayProgram, "view");
    var rayProgramUProjection = gl.getUniformLocation(rayProgram, "projection");

    // ------------------ Ray VAO Init ------------------
    let ro = vec3.fromValues(Math.floor(Math.random() * 5), Math.floor(Math.random() * -5), Math.floor(Math.random() * 5));
    let origin = vec3.fromValues(0, 0, 0);
    let rd = vec3.create();
    vec3.subtract(rd, origin, ro);
    vec3.normalize(rd, rd);
    let t = 10;

    let theRay = [
        ro[0], ro[1], ro[2],
        t * rd[0], t * rd[1], t * rd[2]
    ];
    
    
    var theRayVAO = gl.createVertexArray();
    var theRayVBO = gl.createBuffer();
    gl.bindVertexArray(theRayVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, theRayVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(theRay), gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionAttribLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttribLoc);
    
    renderables.push(
        {tag: "theRay",
         transform: mat4.create(),
         vao: theRayVAO,
         primitiveType: gl.LINES,
         vertCountForArrayedDraw: 2,
         program: rayProgram,
         uniformLocations: {time: rayProgramUTime, 
                            resolution: rayProgramUResolution,
                            model: rayProgramUModel,
                            projection: rayProgramUProjection,
                            view: rayProgramUView
                           }
        });
    
    // ------------------ Gizmo VAO Init ------------------
    plyParser(the_unit_cube);

    var gizmoVAO = gl.createVertexArray();
    var gizmoVBO = gl.createBuffer();
    gl.bindVertexArray(gizmoVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, gizmoVBO);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(theVertAttribDataToSendObj.theUnitCubeAttribArr), gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionAttribLoc, 3, gl.FLOAT, false, (10 * 4), 0);
    gl.enableVertexAttribArray(positionAttribLoc);
    gl.vertexAttribPointer(normalAttribLoc, 3, gl.FLOAT, false, (10 * 4), (3 * 4));
    gl.enableVertexAttribArray(normalAttribLoc);
    gl.vertexAttribPointer(colorAttribLoc, 4, gl.FLOAT, false, (10 * 4), (6 * 4));
    gl.enableVertexAttribArray(colorAttribLoc);
    
    renderables.push(
        {tag: "xGizmo",
         transform: mat4.create(),
         vao: gizmoVAO,
         primitiveType: gl.TRIANGLES,
         vertCountForArrayedDraw: thePlyVertCountObj.unitCubeVertCount,
         program: gizmoProgram,
         uniformLocations: {time: gizmoProgramUTime, 
                            resolution: gizmoProgramUResolution,
                            model: gizmoProgramUModel,
                            projection: gizmoProgramUProjection,
                            view: gizmoProgramUView
                           }
        });

    // ------------------ WebGL State Init ----------------
    gl.clearColor(clearCol[0], clearCol[0], clearCol[0], 1);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);

    // ------------------ Time Init ------------------
    var oldTimeStamp = 0.0;
    var seconds = 0.0;
    var deltaTime = 0.0;

    // ------------------ Start Render Loop ------------------
    window.requestAnimationFrame(renderLoop);

    function renderLoop(timeStamp)
    {
        // time update
        deltaTime = (timeStamp - oldTimeStamp) / 1000; // in seconds
        oldTimeStamp = timeStamp;
        seconds += deltaTime;

        resize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); // just in case it's resized I guess
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mat4.lookAt(view, [pos[0], pos[1], pos[2]], target, [up[0], up[1], up[2]]);

        if (renderables.length != 0)
        {
            for(let i = 0; i < renderables.length; i++)
            {
                // bind vao
                gl.bindVertexArray(renderables[i].vao);
                gl.useProgram(renderables[i].program);
                
                // pass uniforms
                for( let uniform in renderables[i].uniformLocations)
                {
                    switch(uniform)
                    {
                        case "time":
                            gl.uniform1f(renderables[i].uniformLocations[uniform], seconds);
                            break;
                        case "resolution":
                            gl.uniform2f(renderables[i].uniformLocations[uniform], gl.canvas.width, gl.canvas.height);
                            break;
                        // case "light":
                        //     gl.uniform3f(renderables[i].uniformLocations[uniform], lightPos[0], lightPos[1], lightPos[2]);
                        //     break;
                        // case "lightVP":
                        //     gl.uniformMatrix4fv(renderables[i].uniformLocations[uniform], false, lightVP);
                        //     break;
                        // case "viewPos":
                        //     gl.uniform3f(renderables[i].uniformLocations[uniform], pos[0], pos[1], pos[2]);
                        //     break;
                        case "model":
                            gl.uniformMatrix4fv(renderables[i].uniformLocations[uniform], false, renderables[i].transform);
                            break;
                        case "view":
                            gl.uniformMatrix4fv(renderables[i].uniformLocations[uniform], false, view); // this is ok as long as we only have one camera
                            break;
                        case "projection":
                            gl.uniformMatrix4fv(renderables[i].uniformLocations[uniform], false, projection); //  ``
                            break;
                        default:
                            console.log("some weird uniform was attached to the renderable and it doesn't know what to do");
                    }
                }
                gl.drawArrays(renderables[i].primitiveType, 0, renderables[i].vertCountForArrayedDraw);
            }
        }
        // ------------------ Restart Render Loop ------------------
        window.requestAnimationFrame(renderLoop);
    }
    function onMouseDown(event)
    {
        let mouseClickX = event.offsetX;
        mouseClickX = (2. * mouseClickX / gl.canvas.width - 1.);
        let mouseClickY = event.offsetY;
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
        clickRayDirWorld = vec3.fromValues(tmp[0], tmp[1], tmp[2]);

        if(event.which == 1)
        {
            //console.log("first mouse btn pressed");
            firstMouseBtnRayCastSwitch = true;
        }
        else if (event.which == 2) 
        {
            setPanningDirectionSwitch = true;
            secondMouseBtnRayCastSwitch = true;
            //console.log("right mouse btn pressed");
        }
    }
    function onMouseMove(event)
    {
        if(firstMouseBtnRayCastSwitch)
        {
            let mousePosX = event.offsetX;
            mousePosX = (2. * mousePosX / gl.canvas.width - 1.);
            let mousePosY = event.offsetY;
            mousePosY = -1 * (2. * mousePosY / gl.canvas.height - 1.);

            // #---------- RAY CASTING -------------#
            // RAY IN NDC SPACE
            let ray_clip = vec4.fromValues(mousePosX, mousePosY, -1.0, 1.0);
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
            let rayDirWorld = vec3.fromValues(tmp[0], tmp[1], tmp[2]);

            let angle = vec3.angle(clickRayDirWorld, rayDirWorld) * 2;

            // easing function for angle as a function of camera radius
            // simple lerping (1-interpolatingVal)min + interpolatingVal * max
            let interopolatingVal = camRadius/maxCamRadius;
            angle = (1 - interopolatingVal)*(angle/4) + interopolatingVal * (angle/2);

            vec3.cross(mouseMoveRotionAxis, clickRayDirWorld, rayDirWorld);

            let rotMat = mat4.create();
            mat4.rotate(rotMat, rotMat, angle, mouseMoveRotionAxis);
            vec4.transformMat4(up, up, rotMat);
            vec4.transformMat4(pos, pos, rotMat);
            
            // we need to get the angle per mouse move, --> set the vector from last
            // move to this vector so the next mouse move calculation is possible
            clickRayDirWorld = rayDirWorld;
        }
        else if(secondMouseBtnRayCastSwitch)
        {
            let mousePosX = event.offsetX;
            mousePosX = (2. * mousePosX / gl.canvas.width - 1.);
            let mousePosY = event.offsetY;
            mousePosY = -1 * (2. * mousePosY / gl.canvas.height - 1.);

            // #---------- RAY CASTING -------------#
            // RAY IN NDC SPACE
            let ray_clip = vec4.fromValues(mousePosX, mousePosY, -1.0, 1.0);
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
            let rayDirWorld = vec3.fromValues(tmp[0], tmp[1], tmp[2]);

            if(setPanningDirectionSwitch)
            {
                vec3.normalize(cu, [up[0], up[1], up[2]]);
                //console.log("the up is: " + vec3.str(cu));
                vec3.subtract(cf, target, [pos[0], pos[1], pos[2]]);
                vec3.normalize(cf, cf);
                //console.log("the forward is: " + vec3.str(cf));
                vec3.cross(cr, cf, cu);
                //console.log("the right is: " + vec3.str(cr));
                setPanningDirectionSwitch = false;
            }

            let panFactor = 10.;

            let relativeDiff = vec3.create();
            vec3.subtract(relativeDiff, clickRayDirWorld, rayDirWorld);
            let projectionOntoRightLen = vec3.dot(relativeDiff, cr) * panFactor;
            let projectionOntoUpLen = vec3.dot(relativeDiff, cu) * panFactor;

            let theVector = vec3.create();
            vec3.add(theVector,
                     vec3.fromValues(projectionOntoRightLen * cr[0], projectionOntoRightLen * cr[1], projectionOntoRightLen *cr[2]),
                     vec3.fromValues(projectionOntoUpLen * cu[0], projectionOntoUpLen * cu[1], projectionOntoUpLen * cu[2])
                    )
            vec3.add(target, target, theVector);
            vec4.add(pos, pos, [theVector[0], theVector[1], theVector[2], 0.]);
            clickRayDirWorld = rayDirWorld;
        }
    }
    function onMouseUp(event)
    {
        if(firstMouseBtnRayCastSwitch == true)
        {
            firstMouseBtnRayCastSwitch = false;
        }
        if(secondMouseBtnRayCastSwitch == true)
        {
            secondMouseBtnRayCastSwitch = false;
        }
    }
    function onMouseWheel(event)
    {
        if(!secondMouseBtnRayCastSwitch)
        {
            if(camRadius < maxCamRadius && camRadius > 0)
            {
                let relativePos = vec3.create();
                vec3.subtract(relativePos, target, vec3.fromValues(pos[0], pos[1], pos[2]));
                camRadius = vec3.length(relativePos);

                // scroll forward is negtive, scroll back is positive
                // probably do a coroutine here eventually to make it smooth
                
                vec3.normalize(relativePos, relativePos);
                let stepSize = -event.deltaY * 0.2;
                vec3.multiply(relativePos, relativePos, vec3.fromValues(stepSize, stepSize, stepSize));
                vec4.add(pos, pos, vec4.fromValues(relativePos[0], relativePos[1], relativePos[2], 0.));
            }
            else if(camRadius >= maxCamRadius && event.deltaY < 0)
            {
                let relativePos = vec3.create();
                vec3.subtract(relativePos, target, vec3.fromValues(pos[0], pos[1], pos[2]));
                camRadius = vec3.length(relativePos);

                // scroll forward is negtive, scroll back is positive
                // probably do a coroutine here eventually to make it smooth
                
                vec3.normalize(relativePos, relativePos);
                let stepSize = -event.deltaY * 0.2;
                vec3.multiply(relativePos, relativePos, vec3.fromValues(stepSize, stepSize, stepSize));
                vec4.add(pos, pos, vec4.fromValues(relativePos[0], relativePos[1], relativePos[2], 0.));
            }
        }
    }
}

main();