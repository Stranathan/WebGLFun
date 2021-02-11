function makeTheGUI()
{
    theGUI = 
    {
        message: 'Hello World',
        displayOutline: false,

        x: 0,
        y: 0,
        z: 0,
        noiseStrength: 10.2,
        growthSpeed: 0.2,
        type: 'three',
        explode: function () {
            alert('Bang!');
        },

        clearColor: [40, 40, 40, 40], // RGB array
    };
    
    var gui = new dat.gui.GUI();
    
    gui.remember(theGUI);
    
    gui.add(theGUI, 'message');
    gui.add(theGUI, 'displayOutline');
    gui.add(theGUI, 'explode');
    
    // gui.add(theGUI, 'x').step(0.01);
    // gui.add(theGUI, 'y').step(0.01);
    // gui.add(theGUI, 'z').step(0.01);
    gui.add(theGUI, 'x').min(-1.5).max(1.5).step(0.01);
    gui.add(theGUI, 'y').min(-1.5).max(1.5).step(0.01);
    gui.add(theGUI, 'z').min(-1.5).max(1.5).step(0.01);

    // Choose from accepted values
    gui.add(theGUI, 'type', [ 'one', 'two', 'three' ] );
    
    // Choose from named values
    //gui.add(theGUI, 'speed', { Stopped: 0, Slow: 0.1, Fast: 5 } );
    
    var f1 = gui.addFolder('Colors');
    
    f1.addColor(theGUI, 'clearColor');
    
    var f2 = gui.addFolder('Another Folder');
    f2.add(theGUI, 'noiseStrength');
    
    var f3 = f2.addFolder('Nested Folder');
    f3.add(theGUI, 'growthSpeed');
}
