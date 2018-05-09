
function getLineShaders() 
{
    this.vs = `

    attribute vec4 point;

    uniform mat4 model;
    uniform mat4 view;
    uniform mat4 projection;

    void main()
    {
        //gl_Position = projection * view * model  * vec4(point, 1.0) ;
        gl_Position = point ;
    }
    `

    this.fs = `
   
    uniform mediump vec4 lineColor; 

    void main()
    {
        gl_FragColor  = vec4(1.0, 0.0, 0.0, 1.0);
    }
    `
}

export { getLineShaders }

