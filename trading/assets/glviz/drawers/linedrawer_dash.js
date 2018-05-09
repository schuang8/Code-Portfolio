
module.exports = { LineDrawer: function(twgl, canvas) {
    // Initialize default setting, scale factor and identity matrix;
    this.gl = twgl.getWebGLContext(canvas);
    this.twgl = twgl;
    this.xyzdata = [];
    this.autoscale = false;
    this.scaleX = 1.0;
    this.scaleY = 1.0;
    this.scaleZ = 1.0;
    this.transX = 0.0;
    this.transY = 0.0;
    this.transZ = 0.0;
    this.identity = [1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0 ];

    //define line setting
    this.line_color = [88/255, 88/255, 88/255, 1.0];
    this.line_width = 2.0;
    this.line_mode  = this.gl.LINES;

    this.grid_canvas_size = canvas.width;
    // if dash size is equal to canvas width, there will be no dashed line
    this.grid_dashSize = canvas.width;
    this.grid_gapSize = 0.0;


    this.lineShaders = {
        /* Vertex shader is to generate clipspace coordinates, called once per vertex
        * @param attributes: vector/matrix represents vertex position.
        * @param uniforms: vector/matrix stays the same for all vertices in a draw call,
        *                  including model, view, projection, scale, transform matrix...
        * @return gl_position: final clipspace coordinates = uniform matrix * vertex position;
        */
        vs: [
            'varying float textureU;',
            'attribute vec3 point;',
            'uniform mat4 model;',
            'uniform mat4 view;',
            'uniform mat4 projection;',

            'void main()',
            '{',
            'gl_Position = projection * view * model  * vec4(point.xy, 0.0, 1.0) ;',
            'textureU = point.z;',
            '}'].join('\n'),

        /* Fragment shader is to provide a color for the current pixel, called once per pixel
         * @param uniform: vector/matrix stays the same for each pixel in a draw call,
         * @return gl_FragColor: pixel's color
         */
        fs: [
            'precision mediump float;',
            'uniform mediump vec4 lineColor;',
            'uniform mediump float canvasSize;',
            'uniform mediump float dashSize;',
            'uniform mediump float gapSize;',
            'varying float textureU;',

            'void main()',
            '{',
            'float unitDashSize = dashSize / canvasSize * 2.0;',
            'float unitGapSize  = gapSize  / canvasSize * 2.0;',
            'float count = floor( textureU / (unitDashSize + unitGapSize) );',
            'float position = textureU - (unitDashSize + unitGapSize) * count;',
            'if (position > unitDashSize)',
            'gl_FragColor = vec4(lineColor.xyz, 0.0);',
            'else gl_FragColor = lineColor;',
            '}'].join('\n')
    };

    /* Create a program object that compiles shader and creates setters for attribs and uniforms
    * @param gl: WebGLRenderingContext
    * @param shaderSources: Array of shaders.
    */
    this.lineDrawerProgram = twgl.createProgramInfo(this.gl, [this.lineShaders.vs, this.lineShaders.fs])

    // Scale Setting
    this.setAutoscale = function(bScale) { this.autoscale = bScale; }
    this.setScale = function(xs, ys, zs) {
        this.scaleX = xs;
        this.scaleY = ys;
        this.scaleZ = zs;
    }
    // Translation Setting
    this.setTrans = function(xs, ys, zs) {
        this.transX = xs;
        this.transY = ys;
        this.transZ = zs;
    }

    // Set Gap Size
    this.setGapSize = function(size) {
        this.grid_gapSize = size;
    }

    // Set Dash Size
    this.setDashSize = function (size) {
        this.grid_dashSize = size;
    }

    // Set grid canvas size
    this.setGridCanvasSize = function (size) {
        this.grid_canvas_size = size;
    }
    // write vertex position into data array
    this.setData = function(xarray, yarray) {
        this.setDataWithTextureCoords(xarray, yarray, 0.0);
    };

    // write vertex position into data array
    this.setDataWithTextureCoords = function(xarray, yarray, textureCoord) {
        this.xyzdata = [];
        var N = yarray.length;
        // if arrays don't match
        if (xarray.length < N)
        {
            xarray = [];
            for (var k = 0; k < yarray.length; ++k) {
                xarray.push(k);
            }
        }

        this.xyzdata = Array(N * 3).fill(0);

        var j = 0;
        for (var i = 0; i < yarray.length; i++,j+=3)
        {
            this.xyzdata[j + 0] = xarray[i] ;
            this.xyzdata[j + 1] = yarray[i] ;
            this.xyzdata[j + 2] = (i%2) * textureCoord;
        }

        this.setArray(this.xyzdata);
    }

    // use vertex position info to compute scale factor and write data into Buffer
    this.setArray = function (arg) {
        this.xyzdata  = arg;
        this.myBuffer = twgl.createBufferInfoFromArrays(this.gl, { point: this.xyzdata });
    }

    // set uniforms which are used for compute gl_position
    this.render = function() {
        this.uniforms = {
            // defines how to take original model data and move it around in 3d world space
            model: [ this.scaleX, 0.0,         0.0,         0.0,
                     0.0,         this.scaleY, 0.0,         0.0,
                     0.0,         0.0,         this.scaleZ, 0.0,
                     this.transX,         this.transY,         this.transZ,         1.0 ],
            // define the location of the camera in the scene.
            view: [1.0, 0.0, 0.0, 0.0,
                    0.0, 1.0, 0.0, 0.0,
                    0.0, 0.0, 1.0, 0.0,
                    0.0, 0.0, 0.0, 1.0 ],
            // take world space coordinates and move them into the clip space cube
            projection: [1.0, 0.0, 0.0, 0.0,
                    0.0, 1.0, 0.0, 0.0,
                    0.0, 0.0, 1.0, 0.0,
                    0.0, 0.0, 0.0, 1.0 ],
            lineColor: this.line_color,
            lineWidth: this.line_width,
            canvasSize: this.grid_canvas_size,
            dashSize: this.grid_dashSize,
            gapSize: this.grid_gapSize,
        };

        this.gl.useProgram(this.lineDrawerProgram.program);
        //binds buffers and sets attributes
        this.twgl.setBuffersAndAttributes(this.gl, this.lineDrawerProgram, this.myBuffer);
        this.twgl.setUniforms(this.lineDrawerProgram, this.uniforms);
        this.twgl.drawBufferInfo(this.gl, this.myBuffer,  this.line_mode);
    }
    }
}