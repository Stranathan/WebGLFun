// Can't pass by reference, so making it a global object to avoid needless copying
var theVertAttribDataToSend = [];
var thePlyVertCount = 0;
function testPlyParser()
{
    var vertexStringArray = cubie1.split("\n");

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
  
    for(i in faceDataArr)
    {
        if(faceDataArr[i][0] == 4)
        {
            theVertAttribDataToSend.push(vertexData[faceDataArr[i][1]]);
            theVertAttribDataToSend.push(vertexData[faceDataArr[i][2]]);
            theVertAttribDataToSend.push(vertexData[faceDataArr[i][3]]);
            theVertAttribDataToSend.push(vertexData[faceDataArr[i][1]]);
            theVertAttribDataToSend.push(vertexData[faceDataArr[i][3]]);
            theVertAttribDataToSend.push(vertexData[faceDataArr[i][4]]);
            thePlyVertCount += 6;
        }
        else if(faceDataArr[i][0] == 3)
        {
            theVertAttribDataToSend.push(vertexData[faceDataArr[i][1]]);
            theVertAttribDataToSend.push(vertexData[faceDataArr[i][2]]);
            theVertAttribDataToSend.push(vertexData[faceDataArr[i][3]]);
            thePlyVertCount += 3;
        }
        else
        {
            console.log("some strange polygon was parsed");
        }
    }
    theVertAttribDataToSend = theVertAttribDataToSend.flat();
}
