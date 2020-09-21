var meshLoadStatus = null;
var meshVertData = null;

// should probably get globabl objects from main thread not here

// file path is a string
function loadMesh(filePath) 
{

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() 
	{
		//	4: request finished and response is ready
		//	200: "OK"
		if (this.readyState == 4 && this.status == 200) 
		{
			parseMeshString(String(this.responseText));
			meshLoadStatus = 1;
		}
	};
	xhttp.open("GET", filePath, true);
	xhttp.send();
}

function parseMeshString(objMeshString)
{
	var arrayOfVertPositions = []; // the vertices' position data
	var arrayOfVertNormals = []; // the vertices' normals data
    var arrayOfVertTexCoords = []; // the vertices' texture data

    // this is an array of each face line saved in an array
	// ex) for the low res teapot file:
	//     faces[2] = [[2, 2, 2],  [7, 7, 7], [ 8, 8, 8 ], [ 3, 3, 3 ]]
    var faces = [];
    var vertAttribArrayData = [];
    var drawIndices = [];

	var lines = objMeshString.split("\n"); // split by line ending with return
	
    for ( let i = 0 ; i < lines.length ; i++ )
    {
        let elementInLine = lines[i].split(" "); // split line according to spaces
        switch(elementInLine[0])
        {
            case "v":
				elementInLine.shift(); // remove first element of line
				elementInLine.shift();
                for(let ii = 0; ii < elementInLine.length; ii++)
                {
                    elementInLine[ii] = parseFloat(elementInLine[ii]);
                    // change each string to a float, if you try to feed array to parseFloat
                    // or parseInt, it will parse first element and truncate everything else.
                }
                arrayOfVertPositions.push(elementInLine);
                break;
            case "vn":
                elementInLine.shift(); // remove first element of line
                for(let ii = 0; ii < elementInLine.length; ii++)
                {
                    elementInLine[ii] = parseFloat(elementInLine[ii]); 
                    // change each string to a float, if you try to feed array to parseFloat
                    // or parseInt, it will parse first element and truncate everything else.
                }
                arrayOfVertNormals.push(elementInLine);
				break;
			case "vt":
				elementInLine.shift(); // remove first element of line
				for(let ii = 0; ii < elementInLine.length; ii++)
				{
					elementInLine[ii] = parseFloat(elementInLine[ii]); 
					// change each string to a float, if you try to feed array to parseFloat
					// or parseInt, it will parse first element and truncate everything else.
				}
				arrayOfVertTexCoords.push(elementInLine);
				break;
            case "f":
                elementInLine.shift(); // remove the f
                let interleavedAttribDataArr = [];

                for(let ii = 0; ii < elementInLine.length; ii++)
                {
                    // split the interleaved indices 
                    let interleavedAttribData = elementInLine[ii].split("/");
                    // turn each index string into an int
                    for(let j = 0; j < interleavedAttribData.length; j++)
                    {
                        interleavedAttribData[j] = parseInt(interleavedAttribData[j]);
                    }
                    interleavedAttribDataArr.push(interleavedAttribData);
                }

                faces.push(interleavedAttribDataArr);
                break;
        }
	}
	
	// console.log(arrayOfVertPositions);
    // console.log(arrayOfVertTexCoords);
    // console.log(arrayOfVertNormals);
    var triCount = 0;
    var quadCount = 0;
    var vertCount = 0;

	// remember:
	// ex) 
	// Each element in faces is the entire line
    // faces[2] = [[2, 2, 2],  [7, 7, 7], [ 8, 8, 8 ], [ 3, 3, 3 ]]

    for(let faceLine = 0; faceLine < faces.length; faceLine++)
    {
        let tmpArr = [];

        switch(faces[faceLine].length)
        {
            case 6:
                console.log("just testing... 6 vert polygon in list");
                break
            case 5:
                console.log("just testing... 5 vert polygon in list");
                break
            case 3:
                for(let kk = 0; kk < faces[faceLine].length; kk++)
                {
                    // OBJ indices start at 1, so we have to subtract 1 to index at zero
                    // I think I need to be careful here because javascript saves everything as a float
                    let vertPosIndex = Math.round(faces[faceLine][kk][0] - 1);
                    tmpArr.push(arrayOfVertPositions[vertPosIndex]);
                    //vertAttribArrayData.push(arrayOfVertTexCoords[vertTexIndex]); // push vert tex
                    //vertAttribArrayData.push(arrayOfVertNormals[vertNormIndex]); // push vert norm
                }
                vertAttribArrayData.push(tmpArr[0]);
                vertAttribArrayData.push(tmpArr[1]);
                vertAttribArrayData.push(tmpArr[2]);
                break;
            case 4:
                quadCount += 1;

				// for each triplet in an element of the faces data
                for(let kk = 0; kk < faces[faceLine].length; kk++)
                {
                    // OBJ indices start at 1, so we have to subtract 1 to index at zero
                    // I think I need to be careful here because javascript saves everything as floats
                    let vertPosIndex = Math.round(faces[faceLine][kk][0] - 1);
                    tmpArr.push(arrayOfVertPositions[vertPosIndex]);
                    // vertAttribArrayData.push(arrayOfVertTexCoords[vertTexIndex]); // push vert tex
                    // vertAttribArrayData.push(arrayOfVertNormals[vertNormIndex]); // push vert norm
                }
                vertAttribArrayData.push(tmpArr[0]);
                vertAttribArrayData.push(tmpArr[1]);
                vertAttribArrayData.push(tmpArr[2]);
                vertAttribArrayData.push(tmpArr[0]);
                vertAttribArrayData.push(tmpArr[2]);
                vertAttribArrayData.push(tmpArr[3]);
                break;
        }
    
    }
    //console.log("# of tris = " + triCount + " and the # of quads = " + quadCount);
    // concatenate everything into interleaved array to reference via draw indices
    //var mergedVertAttribArrayData = [].concat.apply([], vertAttribArrayData);
    
    var flattenedVertAttribArrayData = vertAttribArrayData.flat();
	meshVertData = flattenedVertAttribArrayData;
	console.log(meshVertData);
}