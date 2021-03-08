// Can't pass by reference, so making it a global object to avoid needless copying

var theVertAttribDataToSendObj = {theXGizoAttribArr: [], theYGizoAttribArr: [], theZGizoAttribArr: [], theUnitCubeAttribArr: []};
//var theVertAttribDataToSend = [];
//var thePlyVertCount = 0;
var thePlyVertCountObj = {gizmoXVertCount: 0, gizmoYVertCount: 0, gizmoZVertCount: 0, unitCubeVertCount: 0};

function plyParser(theStringVar)
{
    var vertexStringArray = theStringVar.split("\n");

    var vertexData;
    var faceDataArr;

    let indexToSliceTo;

    // find out where the vertex data ends and the face data begins in the .ply file
    for(let i = 0 ; i < vertexStringArray.length; i++)
    {
        if(vertexStringArray[i][0] == "4" || vertexStringArray[i][0] == "3")
        {
            indexToSliceTo = i;
            break;
        }
    }

    // create two arrays of the vertex data and face data (still as strings)
    vertexData = vertexStringArray.slice(0, indexToSliceTo);
    faceDataArr = vertexStringArray.slice(indexToSliceTo, vertexStringArray.length);

    // parse for empty spaces to sperate strings values and replace the strings with numbers
    for(strLine in vertexData)
    {

        let aStringLine = vertexData[strLine].split(" ");
        for(str in aStringLine)
        {
            aStringLine[str] = parseFloat(aStringLine[str]);
        }
        vertexData[strLine] = aStringLine;

        if(strLine < faceDataArr.length)
        {
            let aStringLine = faceDataArr[strLine].split(" ");
            for(str in aStringLine)
            {
                aStringLine[str] = parseFloat(aStringLine[str]);
            }
            faceDataArr[strLine] = aStringLine;
        }
    }

    // chose whether or not you're using an arrayed draw call or an indexed draw call
    // make one big interleaved array to send to gpu
    // if the first element in the face array is 4:
    // 0 1 2
    // 0 2 3
    // normally would be faceDataArr[i][0], 1, 2, 0, 2, 3, but there is a face instruction at index 1
  
    if(theStringVar == the_unit_cube)
    {
        for(i in faceDataArr)
        {
            if(faceDataArr[i][0] == 4)
            {
                theVertAttribDataToSendObj.theUnitCubeAttribArr.push(vertexData[faceDataArr[i][1]]);
                theVertAttribDataToSendObj.theUnitCubeAttribArr.push(vertexData[faceDataArr[i][2]]);
                theVertAttribDataToSendObj.theUnitCubeAttribArr.push(vertexData[faceDataArr[i][3]]);
                theVertAttribDataToSendObj.theUnitCubeAttribArr.push(vertexData[faceDataArr[i][1]]);
                theVertAttribDataToSendObj.theUnitCubeAttribArr.push(vertexData[faceDataArr[i][3]]);
                theVertAttribDataToSendObj.theUnitCubeAttribArr.push(vertexData[faceDataArr[i][4]]);
                thePlyVertCountObj.unitCubeVertCount += 6;
            }
            else if(faceDataArr[i][0] == 3)
            {
                theVertAttribDataToSendObj.theUnitCubeAttribArr.push(vertexData[faceDataArr[i][1]]);
                theVertAttribDataToSendObj.theUnitCubeAttribArr.push(vertexData[faceDataArr[i][2]]);
                theVertAttribDataToSendObj.theUnitCubeAttribArr.push(vertexData[faceDataArr[i][3]]);
                thePlyVertCountObj.unitCubeVertCount += 3;
            }
            else
            {
                console.log("some strange polygon was parsed");
            }
        }
        theVertAttribDataToSendObj.theUnitCubeAttribArr = theVertAttribDataToSendObj.theUnitCubeAttribArr.flat();
    }
    else if(theStringVar == xGizmo)
    {
        for(i in faceDataArr)
        {
            if(faceDataArr[i][0] == 4)
            {
                theVertAttribDataToSendObj.theXGizoAttribArr.push(vertexData[faceDataArr[i][1]]);
                theVertAttribDataToSendObj.theXGizoAttribArr.push(vertexData[faceDataArr[i][2]]);
                theVertAttribDataToSendObj.theXGizoAttribArr.push(vertexData[faceDataArr[i][3]]);
                theVertAttribDataToSendObj.theXGizoAttribArr.push(vertexData[faceDataArr[i][1]]);
                theVertAttribDataToSendObj.theXGizoAttribArr.push(vertexData[faceDataArr[i][3]]);
                theVertAttribDataToSendObj.theXGizoAttribArr.push(vertexData[faceDataArr[i][4]]);
                thePlyVertCountObj.gizmoXVertCount += 6;
            }
            else if(faceDataArr[i][0] == 3)
            {
                theVertAttribDataToSendObj.theXGizoAttribArr.push(vertexData[faceDataArr[i][1]]);
                theVertAttribDataToSendObj.theXGizoAttribArr.push(vertexData[faceDataArr[i][2]]);
                theVertAttribDataToSendObj.theXGizoAttribArr.push(vertexData[faceDataArr[i][3]]);
                thePlyVertCountObj.gizmoXVertCount += 3;
            }
            else
            {
                console.log("some strange polygon was parsed");
            }
        }
        theVertAttribDataToSendObj.theXGizoAttribArr = theVertAttribDataToSendObj.theXGizoAttribArr.flat();
    }
    else if(theStringVar == yGizmo)
    {
        for(i in faceDataArr)
        {
            if(faceDataArr[i][0] == 4)
            {
                theVertAttribDataToSendObj.theYGizoAttribArr.push(vertexData[faceDataArr[i][1]]);
                theVertAttribDataToSendObj.theYGizoAttribArr.push(vertexData[faceDataArr[i][2]]);
                theVertAttribDataToSendObj.theYGizoAttribArr.push(vertexData[faceDataArr[i][3]]);
                theVertAttribDataToSendObj.theYGizoAttribArr.push(vertexData[faceDataArr[i][1]]);
                theVertAttribDataToSendObj.theYGizoAttribArr.push(vertexData[faceDataArr[i][3]]);
                theVertAttribDataToSendObj.theYGizoAttribArr.push(vertexData[faceDataArr[i][4]]);
                thePlyVertCountObj.gizmoYVertCount += 6;
            }
            else if(faceDataArr[i][0] == 3)
            {
                theVertAttribDataToSendObj.theYGizoAttribArr.push(vertexData[faceDataArr[i][1]]);
                theVertAttribDataToSendObj.theYGizoAttribArr.push(vertexData[faceDataArr[i][2]]);
                theVertAttribDataToSendObj.theYGizoAttribArr.push(vertexData[faceDataArr[i][3]]);
                thePlyVertCountObj.gizmoYVertCount += 3;
            }
            else
            {
                console.log("some strange polygon was parsed");
            }
        }
        theVertAttribDataToSendObj.theYGizoAttribArr = theVertAttribDataToSendObj.theYGizoAttribArr.flat();
    }
    else if(theStringVar == zGizmo)
    {
        for(i in faceDataArr)
        {
            if(faceDataArr[i][0] == 4)
            {
                theVertAttribDataToSendObj.theZGizoAttribArr.push(vertexData[faceDataArr[i][1]]);
                theVertAttribDataToSendObj.theZGizoAttribArr.push(vertexData[faceDataArr[i][2]]);
                theVertAttribDataToSendObj.theZGizoAttribArr.push(vertexData[faceDataArr[i][3]]);
                theVertAttribDataToSendObj.theZGizoAttribArr.push(vertexData[faceDataArr[i][1]]);
                theVertAttribDataToSendObj.theZGizoAttribArr.push(vertexData[faceDataArr[i][3]]);
                theVertAttribDataToSendObj.theZGizoAttribArr.push(vertexData[faceDataArr[i][4]]);
                thePlyVertCountObj.gizmoZVertCount += 6;
            }
            else if(faceDataArr[i][0] == 3)
            {
                theVertAttribDataToSendObj.theZGizoAttribArr.push(vertexData[faceDataArr[i][1]]);
                theVertAttribDataToSendObj.theZGizoAttribArr.push(vertexData[faceDataArr[i][2]]);
                theVertAttribDataToSendObj.theZGizoAttribArr.push(vertexData[faceDataArr[i][3]]);
                thePlyVertCountObj.gizmoZVertCount += 3;
            }
            else
            {
                console.log("some strange polygon was parsed");
            }
        }
        theVertAttribDataToSendObj.theZGizoAttribArr = theVertAttribDataToSendObj.theZGizoAttribArr.flat();
    }
}
