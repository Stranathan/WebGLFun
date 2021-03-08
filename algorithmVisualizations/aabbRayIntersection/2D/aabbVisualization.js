"use strict";

let theScale = 2;
let sideLength = 50 * theScale;
let circRad = 10 * theScale;
let A = [10, 30];
let sliderX;
let sliderY;
let slider_t;

var leBox;

let theRay = { ro: [0, 0], rd: [1, 1]};

function setup() {
    createCanvas(windowWidth, windowHeight);
    sliderX = createSlider(0, windowWidth, Math.round(windowWidth / 2), 1);
    sliderX.position(windowWidth - 250, 10);
    sliderX.style('width', '200px');
    sliderY = createSlider(0, windowHeight, Math.round(windowHeight / 2), 1);
    sliderY.position(windowWidth - 250, 30);
    sliderY.style('width', '200px');

    slider_t = createSlider(0, windowWidth, windowWidth / 2, 1);
    slider_t.position(windowWidth - 250, 50);
    slider_t.style('width', '200px');

    leBox = {A: [sliderX.value(), sliderY.value() + sideLength],
             B: [sliderX.value() + sideLength, sliderY.value()]};

    rerollRay();
}
function draw() {

    background(40);
    strokeWeight(1);
    stroke("black");

    // update A, B positions:
    leBox.A[0] = sliderX.value();
    leBox.A[1] = sliderY.value() + sideLength;
    leBox.B[0] = sliderX.value() + sideLength;
    leBox.B[1] = sliderY.value();

    // draw box and positions circles with labels:
    fill("black");
    ellipse(leBox.A[0], leBox.A[1], circRad, circRad);
    fill("black");
    ellipse(leBox.B[0], leBox.B[1], circRad, circRad);
    fill("white");
    text('A', leBox.A[0] - 10, leBox.A[1] + 10);
    text('B', leBox.B[0] + 5, leBox.B[1] - 5);

    // draw X and Y boundary planes:
    strokeWeight(3);
    stroke(yLineCol);
    line(leBox.A[0], windowHeight, leBox.A[0], 0);
    line(leBox.B[0], windowHeight, leBox.B[0], 0); 
    strokeWeight(3);
    stroke(xLineCol);
    line(0, leBox.A[1], windowWidth, leBox.A[1]);
    line(0, leBox.B[1], windowWidth, leBox.B[1]);

    // draw the ray
    stroke("yellow");
    theRay.rd[0] = mouseX - theRay.ro[0];
    theRay.rd[1] = mouseY - theRay.ro[1];
    theRay.rd = normalize(theRay.rd);
    line(theRay.ro[0], theRay.ro[1], theRay.ro[0] + slider_t.value() * theRay.rd[0], theRay.ro[1] + slider_t.value() * theRay.rd[1]);

    // draw the hit check box
    let hitCheck = aabbRayIntersect(theRay, leBox);

    // t intersections;
    fill("red")
    ellipse(theRay.ro[0] + hitCheck.min_tx * theRay.rd[0], theRay.ro[1] + hitCheck.min_tx * theRay.rd[1], circRad / 2);
    ellipse(theRay.ro[0] + hitCheck.other_tx * theRay.rd[0], theRay.ro[1] + hitCheck.other_tx * theRay.rd[1], circRad / 2);
    fill("green")
    ellipse(theRay.ro[0] + hitCheck.min_ty * theRay.rd[0], theRay.ro[1] + hitCheck.min_ty * theRay.rd[1], circRad / 2);
    ellipse(theRay.ro[0] + hitCheck.other_ty * theRay.rd[0], theRay.ro[1] + hitCheck.other_ty * theRay.rd[1], circRad / 2);

    // hit "light"
    if(hitCheck.check)
    {
        fill(hitCol);
    }
    else{
        fill(noHitCol);
    }
    rect(sliderX.value(), sliderY.value(), sideLength, sideLength);
    // 
    stroke("black");
    text("min_tx = " + String(hitCheck.min_tx), windowHeight / 4 , 70);
    text("min_ty = " + String(hitCheck.min_ty), windowHeight / 4 , 90);
    text("other_ty = " + String(hitCheck.other_ty), windowHeight / 4 , 110);
    text("other_tx = " + String(hitCheck.other_tx), windowHeight / 4 , 130);
}

function rerollRay()
{
    // random origin coords
    let rndX = Math.floor(Math.random() * windowWidth);
    let rndY = Math.floor(Math.random() * windowHeight);
    theRay.ro[0] = rndX;
    theRay.ro[1] = rndY;
}