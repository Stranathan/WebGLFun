var quadPositions = 
[
    -1, +1, 0,      0, 0, -1,
    -1, -1, 0,      0, 0, -1,
    +1, -1, 0,      0, 0, -1,
    -1, +1, 0,      0, 0, -1,
    +1, -1, 0,      0, 0, -1,
    +1, +1, 0,      0, 0, -1
];

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

