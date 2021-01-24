var anUnsortedArray = [];

for(let i = 0; i < 20; i++)
{
    anUnsortedArray.push(Math.floor(Math.random() * 20));
}

console.log("original array:" + anUnsortedArray);

var sortedArray = mergeSort(anUnsortedArray);
console.log("sorted array:" + sortedArray);

