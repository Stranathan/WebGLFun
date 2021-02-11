let gridVerts = []; // this will be the float32 array that is sent to GPU

// optimization is the root of all evil, keeping it quick and dirty with a global var
// gl.LINES takes pairs, so need to push every coord twice except for 

// unit plane in XY: [-1, 1] e X; [-1, 1] e Y; max - min = 2
function makeUnitGrid(gridSize)
{
    let min = -1;
    let z = 0;

    let count = 0;
    for(let i = 0; i < gridSize + 1; i++)
    {
        let x = min + i * (2 / gridSize);

        for(let j = 0; j < gridSize + 1; j++)
        {
            let y = min + j * (2 / gridSize);

            if(j == 0 || j == gridSize)
            {
                gridVerts.push(x);
                gridVerts.push(y);
                gridVerts.push(z);
            }
            else
            {
                gridVerts.push(x);
                gridVerts.push(y);
                gridVerts.push(z);

                gridVerts.push(x);
                gridVerts.push(y);
                gridVerts.push(z);
            }
        }
    }

    for(let jj = 0; jj < gridSize + 1; jj++)
    {
        let y = min + jj * (2 / gridSize);

        for(let ii = 0; ii < gridSize + 1; ii++)
        {
            let x = min + ii * (2 / gridSize);

            if(ii == 0 || ii == gridSize)
            {
                gridVerts.push(x);
                gridVerts.push(y);
                gridVerts.push(z);
            }
            else
            {
                gridVerts.push(x);
                gridVerts.push(y);
                gridVerts.push(z);

                gridVerts.push(x);
                gridVerts.push(y);
                gridVerts.push(z);
            }
        }
    }
}

/*
    Make an arrayed circle
    returns an js object with the vert data & numverts for a webgl drawarray call
*/

function makeACircle(numPoints, radius)
{
    let theData = [];
    let theta = 0;
    let deltaTheta = 2.0 * Math.PI / numPoints;
    for(let i = 0; i < numPoints; i++)
    {
        let x = radius * Math.cos(theta);
        let y = radius * Math.sin(theta);

        let xx = radius * Math.cos(theta + deltaTheta);
        let yy = radius * Math.sin(theta + deltaTheta);

        theData.push(0);
        theData.push(0);
        theData.push(0);

        theData.push(x);
        theData.push(y);
        theData.push(0);
        
        theData.push(xx);
        theData.push(yy);
        theData.push(0);
        
        theta += deltaTheta;
    }
    
    let numVerts = numPoints * 3;
    return {vertexData: theData, numVerts: numVerts};
}

/*
    returns an array of points along the boundary of a circle
*/

function makeACircleBoundary(numPoints, radius)
{
    let xPoints = [];
    let yPoints = [];
    let theta = 0;
    let deltaTheta = 2.0 * Math.PI / numPoints;

    for(let i = 0; i < numPoints; i++)
    {
        let x = radius * Math.cos(theta);
        let y = radius * Math.sin(theta);
        xPoints.push(x);
        yPoints.push(y);
        theta += deltaTheta;
    }
    return {x : xPoints, y: yPoints};
}

/*
    Make a line with evenly spaced intermediary points
    (x1, y1)---------------------------(x2, y2)
*/
function makeALine(x1, y1, x2, y2, numPoints)
{
    let xPoints = [];
    let yPoints = [];
    let deltaX = (x2 - x1) / numPoints;

    let slope;
    if(( x2 - x1) < 0.001)
    {
        slope = Math.pow(10, 3);
    }
    else
    {
        slope = (y2 - y1) / (x2 - x1);
    }

    let x = x1 + deltaX;
    for(let i = 0; i < numPoints; i++)
    {
        x += deltaX;
        // point slope
        let y = slope * x - x1 * slope + y1; // b = - x1 * slope + y1
        xPoints.push(x);
        yPoints.push(y);
    }
    return {x : xPoints, y: yPoints}
}

/*
    Misc Unit Geometry
*/
var theUnitZLine = 
[
    0.0, 0.0, -0.5,
    0.0, 0.0, +0.5,
]
var theUnitXLineWithColors = 
[
    -0.5, 0.0, 0.0, 0.989, 0.739, 0.231,
    +0.5, 0.0, 0.0, 0.989, 0.739, 0.231,
]
var theUnitYLineWithColors = 
[
    0.0, -0.5, 0.0, 0.23, 0.52, 0.25,
    0.0, +0.5, 0.0, 0.23, 0.52, 0.25,
]
var theUnitZLineWithColors = 
[
    0.0, 0.0, -0.5, 0.0, 0.2, 0.4,
    0.0, 0.0, +0.5, 0.0, 0.2, 0.4,
]
var theUnitXLine = 
[
    -0.5, 0.0, 0.0,
    +0.5, 0.0, 0.0,
]
var theUnitQuad = 
[
    -1, +1, 0,
    -1, -1, 0,
    +1, -1, 0,
    -1, +1, 0,
    +1, -1, 0,
    +1, +1, 0
];

var theUnitQuadWithColors = 
[
    -1, +1, 0, 1., 0., 1.,
    -1, -1, 0, 1., 0., 1.,
    +1, -1, 0, 1., 0., 1.,
    -1, +1, 0, 1., 0., 1.,
    +1, -1, 0, 1., 0., 1.,
    +1, +1, 0, 1., 0., 1.,
];