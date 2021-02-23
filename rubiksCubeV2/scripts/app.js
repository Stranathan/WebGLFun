/* 
    App is:
    1) initialization function,
    2) update function
    3) function to process input
    4) render function
*/

class App
{
    constructor(gl)
    {
        this.resourceManager = new ResourceManager(gl);
        this.renderer = new Renderer(gl);
        this.inputManager = new InputManager(gl, this.renderer);
        this.init();
    }

    init()
    {
        // load model/s & VAOs
        this.resourceManager.init();
        // set gl state and pass renderables (a js object with some stuff)
        this.renderer.init(this.resourceManager.renderables);
    }

    update(seconds)
    {
        this.processInput(seconds);
        this.render(seconds);
    }
    processInput(seconds)
    {
    }
    render(seconds)
    {
        this.renderer.render(seconds);
    }
}