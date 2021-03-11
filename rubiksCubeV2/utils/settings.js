
// ---------------- *Program Specific Settings* ----------------

// ---------------- *Rendering Settings* ----------------

// -------- Misc --------
var clearCol = [0.1568, 0.1568, 0.1568, 1.0]; // RGB 40 --> 40 / 250
var bytesPerMatrix = 4 * 16;
var rubicksLen = 3;
var cubieLen = 2;
var cubeSideLenFromOrigin = cubieLen * rubicksLen / 2;
var cubeBoxObj = {A: [-1 * cubeSideLenFromOrigin, -1 * cubeSideLenFromOrigin, 1 * cubeSideLenFromOrigin],
                  B: [1 * cubeSideLenFromOrigin, 1 * cubeSideLenFromOrigin, -1 * cubeSideLenFromOrigin]};
var numCubies = Math.pow(rubicksLen, 3);
var rubicksLenSquared = rubicksLen * rubicksLen;
var deltaLen = cubieLen - 0.05;

var biggest = 100000;
// -------- glMatrix Lib Aliases --------
var vec2 = glMatrix.vec2;
var vec3 = glMatrix.vec3;
var vec4 = glMatrix.vec4;
var mat4 = glMatrix.mat4;

// -------- Attribute binding points --------
var positionAttribLoc = 0;
var normalAttribLoc = 1;
var colorAttribLoc = 2;
var modelAttribLoc = 3; // instance transform matrix 

// -------- Camera Settings --------
