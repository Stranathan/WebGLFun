
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

    // linear time merge
    for(let i = 0; i < lh.length + rh.length; i++)
    {
        // ---- This is for case where we're merging 
        if(ri == rh.length && li == lh.length - 1)
        {
            m.push(lh[li]);
        }
        else if(li == lh.length && ri == rh.length - 1)
        {
            m.push(rh[ri]);
        }
        else if(ri == rh.length && li == lh.length - 2)
        {
            if(lh[li] < lh[li + 1])
            {
                m.push(lh[li]);
                m.push(lh[li + 1]);
                break;
            }
        }
        else if(li == lh.length && ri == rh.length - 2)
        {
            if(rh[ri] < rh[ri + 1])
            {
                m.push(rh[ri]);
                m.push(rh[ri + 1]);
                break;
            }
        }
        else
        {
            if(lh[li] < rh[ri])
            {
                m.push(lh[li]);
                li += 1;
            }
            else
            {
                m.push(rh[ri]);
                ri += 1;
            }
        }
    }
    //mergeCount++;
    return m;
}