function makeTheGUI()
{
    theGUI = 
    {
        message: 'Merge Sort',
        gridResMultiplier: 4,
        gridX: 0,
        gridY: 0,
        gridZ: 0,
        quadX: 0,
        quadY: 0,
        quadZ: 1,
        
        clearColor: [40, 40, 40, 40], // RGB array
    };
    
    var gui = new dat.gui.GUI();
    
    gui.remember(theGUI);

    gui.add(theGUI, 'gridResMultiplier').min(1).max(10).step(1);

    gui.add(theGUI, 'gridX').min(-1.5).max(1.5).step(0.01);
    gui.add(theGUI, 'gridY').min(-1.5).max(1.5).step(0.01);
    gui.add(theGUI, 'gridZ').min(-1.5).max(1.5).step(0.01);

    gui.add(theGUI, 'quadX').min(-1.5).max(1.5).step(0.01);
    gui.add(theGUI, 'quadY').min(-1.5).max(1.5).step(0.01);
    gui.add(theGUI, 'quadZ').min(-1.5).max(1.5).step(0.01);

    var f1 = gui.addFolder('Colors');
    f1.addColor(theGUI, 'clearColor');
}
