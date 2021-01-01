// make an array of colors based on instance number

var someColors = 
[
	1, 0, 0, 1,  // red
	0, 1, 0, 1,  // green
	0, 0, 1, 1,  // blue
	1, 0, 1, 1,  // magenta
	0, 1, 1, 1,  // cyan
]

var instanceCols = [];

// needs an even number of instances
function makeInstanceColorsArray(numInstances)
{
    if(numInstances % 2 != 0)
    {
        return;
    }

    let halfMark = numInstances / 2.0;
    for(let i = 0; i < numInstances; i++)
    {
        if( i < halfMark)
        {
            let interpolatingVar= i / halfMark;
        
            let red = (1 - interpolatingVar);
            let yellow = interpolatingVar;

            instanceCols.push(red + yellow); // red
            instanceCols.push(yellow); // green
            instanceCols.push(0); // blue
            instanceCols.push(1); // alpha
        }
        else
        {
            let interpolatingVar = (i - halfMark)/ halfMark;
            let green = (1 - interpolatingVar);
            let blue = interpolatingVar;

            instanceCols.push(0); // red
            instanceCols.push(green); // green
            instanceCols.push(blue); // blue
            instanceCols.push(1); // alpha
        }
    }
}
