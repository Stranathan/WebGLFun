/*
    Make an arrayed circle
    returns an obj with the vert data & numverts for drawarray call
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

var theUnitQuad = 
[
    -1, +1, 0,
    -1, -1, 0,
    +1, -1, 0,
    -1, +1, 0,
    +1, -1, 0,
    +1, +1, 0
];