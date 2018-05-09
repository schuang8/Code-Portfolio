
module.exports = { LineDrawer: function(twgl, canvas) {
    // Initialize default setting, scale factor and identity matrix;
    this.gl = twgl.getWebGLContext(canvas);
    this.twgl = twgl;
    this.autoscale = false;
    this.arrays = [];
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
    this.line_mode  = this.gl.TRIANGLES;

    this.grid_canvas_size = [canvas.width, canvas.height];
    // if dash size is equal to canvas width, there will be no dashed line
    this.grid_dotSize = 0.0;


    this.lineShaders = {
        /* Vertex shader is to generate clipspace coordinates, called once per vertex
        * @param attributes: vector/matrix represents vertex position.
        * @param uniforms: vector/matrix stays the same for all vertices in a draw call,
        *                  including model, view, projection, scale, transform matrix...
        * @return gl_position: final clipspace coordinates = uniform matrix * vertex position;
        */
        vs: [
            'attribute vec3 position;',
            'attribute vec2 texcoord;',
            'uniform mat4 model;',
            'uniform mat4 view;',
            'uniform mat4 projection;',

            'varying vec2 UV;',            
            'void main()',
            '{',
            'gl_Position = projection * view * model  * vec4(position.xy, 0.0, 1.0) ;',
            'UV = texcoord;',
            '}'].join('\n'),

        /* Fragment shader is to provide a color for the current pixel, called once per pixel
         * @param uniform: vector/matrix stays the same for each pixel in a draw call,
         * @return gl_FragColor: pixel's color
         */
        fs: [
            'precision mediump float;',
            'uniform mediump vec4 lineColor;',
            'varying vec2 UV;',        
            
            'void main()',
            '{',
            'if (length(UV - vec2(0.5,0.5)) > 0.5)',
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
    };
    // Translation Setting
    this.setTrans = function(xs, ys, zs) {
        this.transX = xs;
        this.transY = ys;
        this.transZ = zs;
    }

    // Set Gap Size
    this.setGapSize = function(size) {
        this.grid_gapSize = size;
    };

    // Set Dash Size
    this.setDashSize = function(size) {
        this.grid_dashSize = size;
    };

    this.setDotSize = function(size) {
        this.grid_dotSize = size;
    };

    // write vertex position into data array
    this.setData = function(xarray, yarray) {
        this.setDataWithTextureCoords(xarray, yarray, 0.0);
    };

    // write vertex position into data array
    this.setDataWithTextureCoords = function(xarray, yarray, textureCoord) {
        this.xyzdata = [];
        var N = Math.min(xarray.length, yarray.length);
        this.xyzdata = new Array(N * 4 * 3).fill(0.0);
        this.textureCoords = [];
        this.indices = [];
        const unitDotSizeX = this.grid_dotSize / canvas.width;
        const unitDotSizeY = this.grid_dotSize / canvas.height;
        const singleRectangleTexture = [
            0.0,0.0,
            0.0,1.0,
            1.0,1.0,
            1.0,0.0
        ]
        for (var index = 0; index < N; index++) {
            var element = index*4*3;
            this.xyzdata[element]      = xarray[index] - unitDotSizeX;
            this.xyzdata[element + 1]  = yarray[index] - unitDotSizeY;
            this.xyzdata[element + 2]  = 0.0;
 
            this.xyzdata[element + 3]  = xarray[index] - unitDotSizeX;
            this.xyzdata[element + 4]  = yarray[index] + unitDotSizeY;
            this.xyzdata[element + 5]  = 0.0;
 
            this.xyzdata[element + 6]  = xarray[index] + unitDotSizeX;
            this.xyzdata[element + 7]  = yarray[index] + unitDotSizeY;
            this.xyzdata[element + 8]  = 0.0;

            this.xyzdata[element + 9]  = xarray[index] + unitDotSizeX;
            this.xyzdata[element + 10] = yarray[index] - unitDotSizeY;
            this.xyzdata[element + 11] = 0.0;

            this.textureCoords = this.textureCoords.concat(singleRectangleTexture);
            element = index*4;
            var indexArray = [element, element+1, element+2, element+2, element+0, element+3];
            this.indices = this.indices.concat(indexArray);
        }
        this.arrays = {position: this.xyzdata, texcoord: this.textureCoords, indices: this.indices};
        this.setArray(this.arrays);
    }

    // use vertex position info to compute scale factor and write data into Buffer
    this.setArray = function (arg) {
        this.xyzdata  = arg;
        this.myBuffer = twgl.createBufferInfoFromArrays(this.gl, this.arrays);
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
        };

        this.gl.useProgram(this.lineDrawerProgram.program);
        //binds buffers and sets attributes
        this.twgl.setBuffersAndAttributes(this.gl, this.lineDrawerProgram, this.myBuffer);
        this.twgl.setUniforms(this.lineDrawerProgram, this.uniforms);
        this.twgl.drawBufferInfo(this.gl, this.myBuffer,  this.line_mode);
    }
    }
}