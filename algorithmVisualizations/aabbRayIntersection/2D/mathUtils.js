function normalize(arr)
{
	let ret = [];
    let len = length(arr);
    for(let i = 0; i < arr.length; i++)
    {
        ret.push(arr[i] / len)
    }
	return ret;
}

function length(arr)
{
	let tmp = 0;
    for(let i = 0; i < arr.length; i++)
    {
        tmp += arr[i] * arr[i];
    }
	return Math.sqrt(tmp);
}

// box: {A: [ax, ay], B: [bx, by]}
// ray: {ro: [rox, roy], rd: [rdx, rdy]}
function aabbRayIntersect(aRay, aBox)
{
    let t_ax = (aBox.A[0] - aRay.ro[0]) / aRay.rd[0];
    let t_ay = (aBox.A[1] - aRay.ro[1]) / aRay.rd[1];
    let t_bx = (aBox.B[0] - aRay.ro[0]) / aRay.rd[0];
    let t_by = (aBox.B[1] - aRay.ro[1]) / aRay.rd[1];
    
    // order the t's from x coord
    let other_tx;
    let min_tx = Math.min(t_ax, t_bx);
    if(min_tx == t_ax)
    {
        other_tx = t_bx;
    }
    else
    {
        other_tx = t_ax;
    }
    // order the t's from y coord
    let other_ty;
    let min_ty = Math.min(t_ay, t_by);
    if(min_ty == t_ay)
    {
        other_ty = t_by;
    }
    else
    {
        other_ty = t_ay;
    }

    // slab comparison
    let hit = false;    
    let max_t = Math.max(other_tx, other_ty);
    if(max_t == other_tx)
    {
        if(other_ty <= other_tx && other_ty >= min_tx)
        {
            hit = true;
        }
    }
    else
    {
        if(other_tx >= min_ty && other_tx >= min_ty)
        {
            hit = true;
        }
    }
    
    if(hit)
    {
        return {min_tx: min_tx, min_ty: min_ty, other_tx: other_tx, other_ty: other_ty, check: true};
    }
    else
    {
        return {min_tx: min_tx, min_ty: min_ty, other_tx: other_tx, other_ty: other_ty, check: false};
    }
}