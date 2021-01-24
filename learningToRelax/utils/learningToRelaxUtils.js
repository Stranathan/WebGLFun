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

function clamp(interpolatingNum, min, max)
{
    return Math.min( Math.max(interpolatingNum, min), max);
}
function mix(start, end, interpolatingNum)
{
    return (1. - interpolatingNum) * start + interpolatingNum * end; 
}
function smin(a, b, k)
{
    let h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0);
    return mix( b, a, h ) - k*h*(1.0-h);
}
function when_eq(x, y) 
{
    return 1.0 - Math.abs(Math.sign(x - y));
}
function when_neq(x, y)
{
    return Math.abs(Math.sign(x - y));
}
function when_gt(x, y)
{
    return Math.max(Math.sign(x - y), 0.0);
}
function when_lt(x, y)
{
    return Math.max(Math.sign(y - x), 0.0);
}
function when_ge(x, y)
{
    return 1.0 - when_lt(x, y);
}
function when_le(x, y)
{
    return 1.0 - when_gt(x, y);
}