
// ---------------- *Program Specific Settings* ----------------
var numCirclesToSort = 16;

// ---------------- *Rendering Settings* ----------------

// -------- Misc --------
var clearCol = [0.1568, 0.1568, 0.1568, 1.0]; // RGB 40 --> 40 / 250
var bytesPerMatrix = 4 * 16;
var circleSideNum = 30;
var circlesLargestScale = 1.5; // used in rng for scale range
var circleBoundaryRadius = 3;

// -------- glMatrix Lib Aliases --------
var vec2 = glMatrix.vec2;
var vec3 = glMatrix.vec3;
var vec4 = glMatrix.vec4;
var mat4 = glMatrix.mat4;

// -------- Attribute binding points --------
var positionAttribLoc = 0;
var modelAttribLoc = 1;
var colorAttribLoc = 2;

// -------- Camera Settings --------
var frustumLeft = -2.;
var frustumRight = 2.;
var frustumTop = 2.;
var frustumBottom = -2.;
var frustumFar = 100;
var frustumNear = 1




