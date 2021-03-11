function aabbRayIntersect(aBox, aRay)
{
    let t_ax = (aBox.A[0] - aRay.ro[0]) / aRay.rd[0];
    let t_ay = (aBox.A[1] - aRay.ro[1]) / aRay.rd[1];
    let t_az = (aBox.A[2] - aRay.ro[2]) / aRay.rd[2];

    let t_bx = (aBox.B[0] - aRay.ro[0]) / aRay.rd[0];
    let t_by = (aBox.B[1] - aRay.ro[1]) / aRay.rd[1];
    let t_bz = (aBox.B[2] - aRay.ro[2]) / aRay.rd[2];

    let hit = false;
    let max_t, max_tx, min_tx, max_ty, min_ty, max_tz, min_tz;

    // ---- Infinity Cases:
    // ---- Nearly aligned with z-axis
    if((t_ax == Infinity || t_ax == -Infinity) || (t_bx == Infinity || t_bx == -Infinity))
    {
        // if t_ay is infinite, we're aligned with the z axis axis
        if((t_ay == Infinity || t_ay == -Infinity) || (t_by == Infinity || t_by == -Infinity))
        {
            let maxXCoord = Math.max(aBox.A[0], aBox.B[0]);
            let maxYCoord = Math.max(aBox.A[1], aBox.B[1]);
            let minXCoord = aBox.A[0] + aBox.B[0] - maxXCoord;
            let minYCoord = aBox.A[1] + aBox.B[1] - maxYCoord;

            if((aRay.ro[0] < maxXCoord && aRay.ro[0] > minXCoord) && 
               (aRay.ro[1] < maxYCoord && aRay.ro[1] > minYCoord))
            {
                hit = true;
                return {t_ax : t_ax, t_ay : t_ay, t_az : t_az, t_bx : t_bx, t_by: t_by, t_bz : t_bz, hit: hit}
            }
        }

        max_ty = Math.max(t_ay, t_by);
        min_ty = (t_ay + t_by) - max_ty;
        max_tz = Math.max(t_az, t_bz);
        min_tz = (t_az + t_bz) - max_tz;

        max_t = Math.max(max_tz, max_ty);

        // else
        if(max_t == max_ty)
        {
            if(max_tz >= min_ty)
            {
                hit = true;
                return {t_ax : t_ax, t_ay : t_ay, t_az : t_az, t_bx : t_bx, t_by: t_by, t_bz : t_bz, hit: hit}
            }
        } 
        else
        {
            if(max_ty >= min_tz)
            {
                hit = true;
                return {t_ax : t_ax, t_ay : t_ay, t_az : t_az, t_bx : t_bx, t_by: t_by, t_bz : t_bz, hit: hit}
            }
        }
    }
    // ---- Nearly aligned with y-axis
    if((t_az == Infinity || t_az == -Infinity) || (t_bz == Infinity || t_bz == -Infinity))
    {
        // // if t_ax is infinite, we're aligned with the y axis axis
        if((t_ax == Infinity || t_ax == -Infinity) || (t_bx == Infinity || t_bx == -Infinity))
        {
            let maxXCoord = Math.max(aBox.A[0], aBox.B[0]);
            let maxZCoord = Math.max(aBox.A[2], aBox.B[2]);
            let minXCoord = aBox.A[0] + aBox.B[0] - maxXCoord;
            let minZCoord = aBox.A[2] + aBox.B[2] - maxZCoord;

            if((aRay.ro[0] < maxXCoord && aRay.ro[0] > minXCoord)
              && (aRay.ro[2] < maxZCoord && aRay.ro[2] > minZCoord))
            {
                hit = true;
                return {t_ax : t_ax, t_ay : t_ay, t_az : t_az, t_bx : t_bx, t_by: t_by, t_bz : t_bz, hit: hit}
            }
        }
       
        max_ty = Math.max(t_ay, t_by);
        min_ty = (t_ay + t_by) - max_ty;
        max_tx = Math.max(t_ax, t_bx);
        min_tx = (t_ax + t_bx) - max_tx;

        max_t = Math.max(max_tx, max_ty);

        // else
        if(max_t == max_ty)
        {
            if(max_tx >= min_ty)
            {
                hit = true;
                return {t_ax : t_ax, t_ay : t_ay, t_az : t_az, t_bx : t_bx, t_by: t_by, t_bz : t_bz, hit: hit}
            }
        } 
        else
        {
            if(max_ty >= min_tx)
            {
                hit = true;
                return {t_ax : t_ax, t_ay : t_ay, t_az : t_az, t_bx : t_bx, t_by: t_by, t_bz : t_bz, hit: hit}
            }
        }
    }
    // ---- Nearly aligned with x-axis
    if((t_ay == Infinity || t_ay == -Infinity) || (t_by == Infinity || t_by == -Infinity))
    {
        // // if t_ax is infinite, we're aligned with the y axis axis
        if((t_az == Infinity || t_az == -Infinity) || (t_bz == Infinity || t_bz == -Infinity))
        {
            let maxYCoord = Math.max(aBox.A[1], aBox.B[1]);
            let maxZCoord = Math.max(aBox.A[2], aBox.B[2]);
            let minYCoord = aBox.A[1] + aBox.B[1] - maxYCoord;
            let minZCoord = aBox.A[2] + aBox.B[2] - maxZCoord;

            if((aRay.ro[1] < maxYCoord && aRay.ro[1] > minYCoord)
              && (aRay.ro[2] < maxZCoord && aRay.ro[2] > minZCoord))
            {
                hit = true;
                return {t_ax : t_ax, t_ay : t_ay, t_az : t_az, t_bx : t_bx, t_by: t_by, t_bz : t_bz, hit: hit}
            }
        }
       
        max_tz = Math.max(t_az, t_bz);
        min_tz = (t_az + t_bz) - max_tz;
        max_tx = Math.max(t_ax, t_bx);
        min_tx = (t_ax + t_bx) - max_tx;

        max_t = Math.max(max_tx, max_tz);

        // else
        if(max_t == max_tz)
        {
            if(max_tx >= min_tz)
            {
                hit = true;
                return {t_ax : t_ax, t_ay : t_ay, t_az : t_az, t_bx : t_bx, t_by: t_by, t_bz : t_bz, hit: hit}
            }
        } 
        else
        {
            if(max_tz >= min_tx)
            {
                hit = true;
                return {t_ax : t_ax, t_ay : t_ay, t_az : t_az, t_bx : t_bx, t_by: t_by, t_bz : t_bz, hit: hit}
            }
        }
    }
    
    max_tx = Math.max(t_ax, t_bx);
    min_tx = (t_ax + t_bx) - max_tx;
    
    max_ty = Math.max(t_ay, t_by);
    min_ty = (t_ay + t_by) - max_ty;

    max_tz = Math.max(t_az, t_bz);
    min_tz = (t_az + t_bz) - max_tz;

    max_t = Math.max(max_tz, Math.max(max_tx, max_ty));

    if(max_t == max_tz)
    {
        if (max_ty >= max_tx && max_tx >= min_ty && max_tx >= min_tz && max_ty >= min_tz)
        {
            hit = true;
        }
        else if (max_tx >= max_ty && max_ty >= min_tx && max_tx >= min_tz && max_ty >= min_tz)
        {
            hit = true;
        }
    }
    else if(max_t == max_ty)
    {
        if (max_tz >= max_tx && max_tx >= min_tz && max_tx >= min_ty && max_tz >= min_ty)
        {
            hit = true;
        }
        else if(max_tx >= max_tz && max_tz >= min_tx && max_tx >= min_ty && max_tz >= min_ty)
        {
            hit = true;
        }
    }
    else if(max_t == max_tx)
    {
        if (max_tz >= max_ty && max_ty >= min_tz && max_ty >= min_tx && max_tz >= min_tx)
        {
            hit = true;
        }
        else if(max_ty >= max_tz && max_tz >= min_ty && max_ty >= min_tx && max_tz >= min_tx)
        {
            hit = true;
        }
    }

    return {t_ax : t_ax, t_ay : t_ay, t_az : t_az, t_bx : t_bx, t_by: t_by, t_bz : t_bz, hit: hit}
}