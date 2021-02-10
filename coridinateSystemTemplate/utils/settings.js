
// ---------------- *Program Specific Settings* ----------------
var numXZVerticalInstances = 200;

// ---------------- *Rendering Settings* ----------------

// -------- Misc --------
var clearCol = [0.1568, 0.1568, 0.1568, 1.0]; // RGB 40 --> 40 / 250
var bytesPerMatrix = 4 * 16;

var gridRes = 1;
var lineLength = (numXZVerticalInstances / 2.0) * gridRes;

// -------- glMatrix Lib Aliases --------
var vec2 = glMatrix.vec2;
var vec3 = glMatrix.vec3;
var vec4 = glMatrix.vec4;
var mat4 = glMatrix.mat4;

// -------- Attribute binding points --------
var positionAttribLoc = 0;
var modelAttribLoc = 1;
var colorAttribLoc = 2;




