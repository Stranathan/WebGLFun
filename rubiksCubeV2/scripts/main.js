"use strict";

var canvas = document.getElementById("cc");
var gl = canvas.getContext("webgl2");


function main() 
{
    if (!gl) 
    {
        return;
    }

    var theApp = new App(gl);

    // ------------------ Time Init ------------------
    var oldTimeStamp = 0.0;
    var seconds = 0.0;

    // ------------------ Start Render Loop ------------------
    window.requestAnimationFrame(update);

    function update(timeStamp)
    {
        // time update
        let deltaTime = (timeStamp - oldTimeStamp) / 1000; // in seconds
        oldTimeStamp = timeStamp;
        seconds += deltaTime;
        theApp.update(seconds);
        window.requestAnimationFrame(update);
    }
}

main();
