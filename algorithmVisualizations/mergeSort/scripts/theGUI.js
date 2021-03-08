
function makeTheGUI()
{
    theGUI = 
    {
        message: 'Merge Sort',
        gridScale: 4,
        gridX: 0,
        gridY: 0,
        gridZ: 2,
        circleX: 0,
        circleY: 0,
        circleZ: 1,
        frustumMultiplier: 1,
        frustumNear: 1,
        frustumFar: 100,
        backgroundColor: [40, 40, 40],
    };
    
    var gui = new dat.gui.GUI();
    gui.remember(theGUI);
    
    // Objects folder
    var f1 = gui.addFolder('Objects');
    f1.add(theGUI, 'gridX').min(-1.5).max(1.5).step(0.01);
    f1.add(theGUI, 'gridY').min(-1.5).max(1.5).step(0.01);
    f1.add(theGUI, 'gridZ').min(0).max(10).step(0.01);

    f1.add(theGUI, 'circleX').min(-10).max(+10).step(0.01);
    f1.add(theGUI, 'circleY').min(-10).max(10).step(0.01);
    f1.add(theGUI, 'circleZ').min(0).max(10).step(0.01);

    // camera folder
    var f2 = gui.addFolder('Camera');
    f2.add(theGUI, 'frustumMultiplier').min(1).max(20).step(0.01);
    f2.add(theGUI, 'frustumNear').min(1).max(10).step(0.01);
    f2.add(theGUI, 'frustumFar').min(11).max(150).step(0.01);

    // colors folder
    var f3 = gui.addFolder('Grid');
    f3.add(theGUI, 'gridScale').min(1).max(10).step(1);
    f3.addColor(theGUI, 'backgroundColor');
}
