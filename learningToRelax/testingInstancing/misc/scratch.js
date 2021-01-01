
// --------- Helix

// if( i < halfOfNumInstances)
// {
//     let yTranslation = i * yDelta;
//     let xTranslation = -xDelta; // the base translation
//     let translationTransform = mat4.create();
//     mat4.translate
//     (
//         matrices[i],
//         translationTransform, [xTranslation + Math.cos(seconds -  Math.PI * (i /halfOfNumInstances)),
//         yTranslation + startingY,
//         Math.sin(seconds -  Math.PI * (i /halfOfNumInstances))]
//     );
//     mat4.scale(matrices[i], matrices[i],  [leScale, leScale, leScale]);
// }
// else
// {
//     let yTranslation = (i - halfOfNumInstances) * yDelta;
//     let xTranslation = xDelta;
//     let translationTransform = mat4.create();
//     mat4.translate(matrices[i], translationTransform, [xTranslation + Math.cos(seconds -  Math.PI * (i /halfOfNumInstances)), yTranslation + startingY, Math.sin(seconds -  Math.PI * (i /halfOfNumInstances))]);
//     mat4.scale(matrices[i], matrices[i],  [leScale, leScale, leScale]);
// }

// #------

// // -------- Update Instance Matrix Data --------
// for(let i = 0 ; i < matrices.length; i++)
// {
//     if( i < halfOfNumInstances)
//     {
//         let yTranslation = i * yDelta;
//         let xTranslation = -xDelta; // the base translation
//         let translationTransform = mat4.create();

//         let interpolant = i / halfOfNumInstances;

//         mat4.translate
//         (
//             matrices[i],
//             translationTransform,
//            [xTranslation + spiralRadius  * Math.cos(instanceTrigArgOffsetFirstHalf * interpolant + seconds),
//             yTranslation + startingY,
//             spiralRadius * -Math.sin(instanceTrigArgOffsetFirstHalf * interpolant + seconds)]
//         );
//         mat4.scale(matrices[i], matrices[i],  [leScale * 1.0/AR, leScale, leScale]);
//     }
//     else
//     {
//         let yTranslation = (i - halfOfNumInstances) * yDelta;
//         let xTranslation = xDelta;
//         let translationTransform = mat4.create();
//         let interpolant = (i - halfOfNumInstances)/ halfOfNumInstances;

//         mat4.translate(matrices[i],
//                        translationTransform,
//                       [xTranslation + spiralRadius  * Math.cos(instanceTrigArgOffsetFirstHalf * (i /halfOfNumInstances) + seconds),
//                        yTranslation + startingY,
//                        spiralRadius *  Math.sin(instanceTrigArgOffsetFirstHalf * (i /halfOfNumInstances) + seconds)]);
//         mat4.scale(matrices[i], matrices[i],  [leScale * 1.0/AR, leScale, leScale]);
//     }
// }



// #---
// instanceTickerFirstHalf = Math.max(0, instanceTickerFirstHalf - seconds / 50);
// 		instanceTickerSecondHalf = Math.max(0, instanceTickerSecondHalf - seconds / 50);
// for(let i = 0 ; i < matrices.length / 2.0; i++)
// {
//     // first half
//     let yTranslation = (halfOfNumInstances - i) * yDelta;
//     let xTranslation = -xDelta; // the base translation
//     let translationTransform = mat4.create();
    
//     if (halfOfNumInstances - i >= instanceTickerFirstHalf)
//     {
//         console.log("the time arg is:  " + Math.sin(seconds - i));
//         console.log("and the i count is: " + i);
//         mat4.translate(
//             matrices[halfOfNumInstances - 1 - i],
//             translationTransform,
//             [xTranslation + spiralRadius * Math.sin(seconds),
//             yTranslation + startingY ,
//             0]
//             );
//         mat4.scale(matrices[halfOfNumInstances - 1 - i], matrices[halfOfNumInstances - 1 - i],  [leScale * 1.0/AR, leScale, leScale]);
//     }

//     let secondColumnTranslationTransform = mat4.create();

//     if (numInstances - i >= instanceTickerSecondHalf)
//     {
//         mat4.translate(
//             matrices[numInstances - 1 - i],
//             secondColumnTranslationTransform,
//             [xTranslation - spiralRadius * Math.sin(seconds),
//             yTranslation + startingY,
//             0]
//             );
//         mat4.scale(matrices[numInstances - 1 - i], matrices[numInstances - 1 - i],  [leScale * 1.0/AR, leScale, leScale]);
//     }
// }