let angleDelta = Math.PI / 2.0;
let numSteps = 25;
let animationAngleDelta = angleDelta / numSteps;
let delayTime = 15 // ms

function x1Rotation()
{
    if(isAnimating == false)
    {
        isAnimating = true;
        //console.log(isAnimating);
        for(let i = 0; i < rubiksCube.length; i++)
        {
            if(rubiksCube[i].x == 1)
            {
                // rotation animation using a generator
                function* rotationAnimation()
                {
                    for(let ii = 0; ii < numSteps; ii++)
                    {
                    let rotationMat4 = mat4.create();
                    mat4.rotateX(rotationMat4, rotationMat4, animationAngleDelta);
                    mat4.multiply(rubiksCube[i].modelTransform, rotationMat4, rubiksCube[i].modelTransform);
                    rubiksCube[i].x = Math.round(rubiksCube[i].modelTransform[12]);
                    rubiksCube[i].y = Math.round(rubiksCube[i].modelTransform[13]);
                    rubiksCube[i].z = Math.round(rubiksCube[i].modelTransform[14]);
                    yield delay(delayTime);
                    }
                }
                wait(rotationAnimation);
            }
        }
    }
}
function x0Rotation()
{
    if(isAnimating == false)
    {
        isAnimating = true;
        //console.log(isAnimating);
        for(let i = 0; i < rubiksCube.length; i++)
        {
            if(rubiksCube[i].x == 0)
            {
                // rotation animation using a generator
                function* rotationAnimation()
                {
                    for(let ii = 0; ii < numSteps; ii++)
                    {
                    let rotationMat4 = mat4.create();
                    mat4.rotateX(rotationMat4, rotationMat4, animationAngleDelta);
                    mat4.multiply(rubiksCube[i].modelTransform, rotationMat4, rubiksCube[i].modelTransform);
                    rubiksCube[i].x = Math.round(rubiksCube[i].modelTransform[12]);
                    rubiksCube[i].y = Math.round(rubiksCube[i].modelTransform[13]);
                    rubiksCube[i].z = Math.round(rubiksCube[i].modelTransform[14]);
                    yield delay(delayTime);
                    }
                }
                wait(rotationAnimation);
            }
        }
    }
}
function xNeg1Rotation()
{
    if(isAnimating == false)
    {
        isAnimating = true;
        //console.log(isAnimating);
        for(let i = 0; i < rubiksCube.length; i++)
        {
            if(rubiksCube[i].x == -1)
            {
                // rotation animation using a generator
                function* rotationAnimation()
                {
                    for(let ii = 0; ii < numSteps; ii++)
                    {
                    let rotationMat4 = mat4.create();
                    mat4.rotateX(rotationMat4, rotationMat4, animationAngleDelta);
                    mat4.multiply(rubiksCube[i].modelTransform, rotationMat4, rubiksCube[i].modelTransform);
                    rubiksCube[i].x = Math.round(rubiksCube[i].modelTransform[12]);
                    rubiksCube[i].y = Math.round(rubiksCube[i].modelTransform[13]);
                    rubiksCube[i].z = Math.round(rubiksCube[i].modelTransform[14]);
                    yield delay(delayTime);
                    }
                }
                wait(rotationAnimation);
            }
        }
    }
}

// Y-AXIS ROTATIONS
function y1Rotation()
{
    if(isAnimating == false)
    {
        isAnimating = true;
        //console.log(isAnimating);
        for(let i = 0; i < rubiksCube.length; i++)
        {
            if(rubiksCube[i].y == 1)
            {
                // rotation animation using a generator
                function* rotationAnimation()
                {
                    for(let ii = 0; ii < numSteps; ii++)
                    {
                    let rotationMat4 = mat4.create();
                    mat4.rotateY(rotationMat4, rotationMat4, animationAngleDelta);
                    mat4.multiply(rubiksCube[i].modelTransform, rotationMat4, rubiksCube[i].modelTransform);
                    rubiksCube[i].x = Math.round(rubiksCube[i].modelTransform[12]);
                    rubiksCube[i].y = Math.round(rubiksCube[i].modelTransform[13]);
                    rubiksCube[i].z = Math.round(rubiksCube[i].modelTransform[14]);
                    yield delay(delayTime);
                    }
                }
                wait(rotationAnimation);
            }
        }
    }
}
function y0Rotation()
{
    if(isAnimating == false)
    {
        isAnimating = true;
        //console.log(isAnimating);
        for(let i = 0; i < rubiksCube.length; i++)
        {
            if(rubiksCube[i].y == 0)
            {
                // rotation animation using a generator
                function* rotationAnimation()
                {
                    for(let ii = 0; ii < numSteps; ii++)
                    {
                    let rotationMat4 = mat4.create();
                    mat4.rotateY(rotationMat4, rotationMat4, animationAngleDelta);
                    mat4.multiply(rubiksCube[i].modelTransform, rotationMat4, rubiksCube[i].modelTransform);
                    rubiksCube[i].x = Math.round(rubiksCube[i].modelTransform[12]);
                    rubiksCube[i].y = Math.round(rubiksCube[i].modelTransform[13]);
                    rubiksCube[i].z = Math.round(rubiksCube[i].modelTransform[14]);
                    yield delay(delayTime);
                    }
                }
                wait(rotationAnimation);
            }
        }
    }
}
function yNeg1Rotation()
{
    if(isAnimating == false)
    {
        isAnimating = true;
        //console.log(isAnimating);
        for(let i = 0; i < rubiksCube.length; i++)
        {
            if(rubiksCube[i].y == -1)
            {
                // rotation animation using a generator
                function* rotationAnimation()
                {
                    for(let ii = 0; ii < numSteps; ii++)
                    {
                    let rotationMat4 = mat4.create();
                    mat4.rotateY(rotationMat4, rotationMat4, animationAngleDelta);
                    mat4.multiply(rubiksCube[i].modelTransform, rotationMat4, rubiksCube[i].modelTransform);
                    rubiksCube[i].x = Math.round(rubiksCube[i].modelTransform[12]);
                    rubiksCube[i].y = Math.round(rubiksCube[i].modelTransform[13]);
                    rubiksCube[i].z = Math.round(rubiksCube[i].modelTransform[14]);
                    yield delay(delayTime);
                    }
                }
                wait(rotationAnimation);
            }
        }
    }
}

function z1Rotation()
{
    if(isAnimating == false)
    {
        isAnimating = true;
        //console.log(isAnimating);
        for(let i = 0; i < rubiksCube.length; i++)
        {
            if(rubiksCube[i].z == 1)
            {
                // rotation animation using a generator
                function* rotationAnimation()
                {
                    for(let ii = 0; ii < numSteps; ii++)
                    {
                    let rotationMat4 = mat4.create();
                    mat4.rotateZ(rotationMat4, rotationMat4, animationAngleDelta);
                    mat4.multiply(rubiksCube[i].modelTransform, rotationMat4, rubiksCube[i].modelTransform);
                    rubiksCube[i].x = Math.round(rubiksCube[i].modelTransform[12]);
                    rubiksCube[i].y = Math.round(rubiksCube[i].modelTransform[13]);
                    rubiksCube[i].z = Math.round(rubiksCube[i].modelTransform[14]);
                    yield delay(delayTime);
                    }
                }
                wait(rotationAnimation);
            }
        }
    }
}
function z0Rotation()
{
    if(isAnimating == false)
    {
        isAnimating = true;
        //console.log(isAnimating);
        for(let i = 0; i < rubiksCube.length; i++)
        {
            if(rubiksCube[i].z == 0)
            {
                // rotation animation using a generator
                function* rotationAnimation()
                {
                    for(let ii = 0; ii < numSteps; ii++)
                    {
                    let rotationMat4 = mat4.create();
                    mat4.rotateZ(rotationMat4, rotationMat4, animationAngleDelta);
                    mat4.multiply(rubiksCube[i].modelTransform, rotationMat4, rubiksCube[i].modelTransform);
                    rubiksCube[i].x = Math.round(rubiksCube[i].modelTransform[12]);
                    rubiksCube[i].y = Math.round(rubiksCube[i].modelTransform[13]);
                    rubiksCube[i].z = Math.round(rubiksCube[i].modelTransform[14]);
                    yield delay(delayTime);
                    }
                }
                wait(rotationAnimation);
            }
        }
    }
}
function zNeg1Rotation()
{
    console.log("z 3 pressed");
    if(isAnimating == false)
    {
        isAnimating = true;
        //console.log(isAnimating);
        for(let i = 0; i < rubiksCube.length; i++)
        {
            if(rubiksCube[i].z == -1)
            {
                // rotation animation using a generator
                function* rotationAnimation()
                {
                    for(let ii = 0; ii < numSteps; ii++)
                    {
                    let rotationMat4 = mat4.create();
                    mat4.rotateZ(rotationMat4, rotationMat4, animationAngleDelta);
                    mat4.multiply(rubiksCube[i].modelTransform, rotationMat4, rubiksCube[i].modelTransform);
                    rubiksCube[i].x = Math.round(rubiksCube[i].modelTransform[12]);
                    rubiksCube[i].y = Math.round(rubiksCube[i].modelTransform[13]);
                    rubiksCube[i].z = Math.round(rubiksCube[i].modelTransform[14]);
                    yield delay(delayTime);
                    }
                }
                wait(rotationAnimation);
            }
        }
    }
}