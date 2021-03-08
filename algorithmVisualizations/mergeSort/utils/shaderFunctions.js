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