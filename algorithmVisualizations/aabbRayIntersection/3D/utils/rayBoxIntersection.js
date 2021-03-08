/*
    vec3 A, actually vec4 (the renderers position vector)
    vec3 B
    ray RayObj --> {vec3 rayOrigin, normalized vec3 rayDirection}

    probably terribly inefficent, but handmade
*/
function AABBIntersect(A, B, rayObj)
{
    // case: Ray origin is above box
    if(B[1] < rayObj.rayOrigin[1])
    {
        // case: Ray origin is closer to B
        if(B[x] < rayObj.rayOrigin[x])
        {

        }
    }
}

