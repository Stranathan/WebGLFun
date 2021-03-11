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
// function aabbRayIntersect(aBox, aRay)
// {
//     let t_ax = (aBox.A[0] - aRay.ro[0]) / aRay.rd[0];
//     let t_ay = (aBox.A[1] - aRay.ro[1]) / aRay.rd[1];
//     let t_az = (aBox.A[2] - aRay.ro[2]) / aRay.rd[2];

//     let t_bx = (aBox.B[0] - aRay.ro[0]) / aRay.rd[0];
//     let t_by = (aBox.B[1] - aRay.ro[1]) / aRay.rd[1];
//     let t_bz = (aBox.B[2] - aRay.ro[2]) / aRay.rd[2];

//     let hit = false;

//     let max_t, min_t, max_tx, min_tx, max_ty, min_ty, max_tz, min_tz;

//     max_tx = Math.max(t_ax, t_bx);
//     min_tx = (t_ax + t_bx) - max_tx;
    
//     max_ty = Math.max(t_ay, t_by);
//     min_ty = (t_ay + t_by) - max_ty;

//     max_tz = Math.max(t_az, t_bz);
//     min_tz = (t_az + t_bz) - max_tz;

//     max_t = Math.max(max_tz, Math.max(max_tx, max_ty));

//     if(max_t == max_tz)
//     {
//         if (max_ty >= max_tx && max_tx >= min_ty && max_tx >= min_tz && max_ty >= min_tz)
//         {
//             hit = true;
//         }
//         else if (max_tx >= max_ty && max_ty >= min_tx && max_tx >= min_tz && max_ty >= min_tz)
//         {
//             hit = true;
//         }
//     }
//     else if(max_t == max_ty)
//     {
//         if (max_tz >= max_tx && max_tx >= min_tz && max_tx >= min_ty && max_tz >= min_ty)
//         {
//             hit = true;
//         }
//         else if(max_tx >= max_tz && max_tz >= min_tx && max_tx >= min_ty && max_tz >= min_ty)
//         {
//             hit = true;
//         }
//     }
//     else if(max_t == max_tx)
//     {
//         if (max_tz >= max_ty && max_ty >= min_tz && max_ty >= min_tx && max_tz >= min_tx)
//         {
//             hit = true;
//         }
//         else if(max_ty >= max_tz && max_tz >= min_ty && max_ty >= min_tx && max_tz >= min_tx)
//         {
//             hit = true;
//         }
//     }

//     return {t_ax : t_ax, t_ay : t_ay, t_az : t_az, t_bx : t_bx, t_by: t_by, t_bz : t_bz, hit: hit}
// }