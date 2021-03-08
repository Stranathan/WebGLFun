
/*
    Merge sort the hard-ish way
*/

// var mergeCount = 0;
// var divideCount = 0;

function mergeSort(anUnsortedArray)
{
    
    // the base case
    if(anUnsortedArray.length <= 1)
    {
        return anUnsortedArray;
    }

    // const behave like let variables, except they cannot be reassigned:
    const theMiddleIndex = Math.floor(anUnsortedArray.length / 2);
    //console.log("the middle index is: " + theMiddleIndex);
    const leftHalf = anUnsortedArray.slice(0, theMiddleIndex); // slice:: ends at, but does not include, the given end argument.
    const rightHalf = anUnsortedArray.slice(theMiddleIndex); // slice:: If end is omitted, slice extracts through the end of the sequence (arr.length).
    
    //divideCount++;
    //console.log(divideCount + ": lh:" + leftHalf + ", rh:" + rightHalf);

    // the recursive call
    return merge(mergeSort(leftHalf), mergeSort(rightHalf));
}
function merge(lh, rh)
{
    let ri = 0; // the index of the right array
    let li = 0; // the index of the left array
    let m = []; // the merged array
    lhLen = lh.length;
    rhLen = rh.length;

    for(let i = 0; i < lhLen + rhLen; i++)
    {
        // collect the last element remaining
        if(li == lhLen)
        {
            m.push(rh[ri]);
            ri++;
        }
        else if(ri == rhLen)
        {
            m.push(lh[li]);
            li++;
        }
        else
        {
            if(lh[li] < rh[ri])
            {
                m.push(lh[li]);
                li++;
            }
            else
            {
                m.push(rh[ri]);
                ri++;
            }
        }
    }
    return m;
}