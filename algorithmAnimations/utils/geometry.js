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