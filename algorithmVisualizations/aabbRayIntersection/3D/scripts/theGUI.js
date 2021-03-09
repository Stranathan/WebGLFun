// theGUI lives in settings and is used in the renderer
// this function is called in resource manager constructor

function makeTheGUI()
{
    let rd = vec3.create();
    vec3.subtract(rd, theOrigin, startingRayOrigin);
    vec3.normalize(rd, rd);

    let t = 20;

    theGUI = 
    {
        ro_x: startingRayOrigin[0],
        ro_y: startingRayOrigin[1],
        ro_z: startingRayOrigin[2],

        target_x: theOrigin[0],
        target_y: theOrigin[1],
        target_z: theOrigin[2],

        rd_x: rd[0],
        rd_y: rd[1],
        rd_z: rd[2],

        tt: t
    };
    
    var gui = new dat.gui.GUI();
    gui.remember(theGUI);
    // Objects folder
    // var f1 = gui.addFolder('Objects');
    gui.add(theGUI, 'ro_x').min(-10.0).max(10.0).step(0.01);
    gui.add(theGUI, 'ro_y').min(-10.0).max(10.0).step(0.01);
    gui.add(theGUI, 'ro_z').min(-10.0).max(10.0).step(0.01);

    gui.add(theGUI, 'target_x').min(-10.0).max(10.0).step(0.01);
    gui.add(theGUI, 'target_y').min(-10.0).max(10.0).step(0.01);
    gui.add(theGUI, 'target_z').min(-10.0).max(10.0).step(0.01);
    
    gui.add(theGUI, 'tt').min(-20.0).max(20.0).step(0.01);
}
