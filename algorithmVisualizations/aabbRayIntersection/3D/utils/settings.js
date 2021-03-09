
// ---------------- *Program Specific Settings* ----------------

// ---------------- *Rendering Settings* ----------------

// -------- Misc --------
var clearCol = [0.1568, 0.1568, 0.1568, 1.0]; // RGB 40 --> 40 / 250
var bytesPerMatrix = 4 * 16;
var rubicksLen = 3;
var numCubies = Math.pow(rubicksLen, 3);
var rubicksLenSquared = rubicksLen * rubicksLen;
var deltaLen = 1.94;

// ray stuff
var theRayUpdateCount = 0;
var theXGizmoUpdateCOunt = 0;
this.theGUI;
var theOrigin = [0., 0., 0.,];
var startingRayOrigin = [2, 2, 4];
var boxObj = {A: [-1, -1, 1], B: [1, 1, -1]};
// Axis line stuff
var numAxes = 12;
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
