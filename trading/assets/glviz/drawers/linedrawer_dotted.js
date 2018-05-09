
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

    // grid_gapSize represents each segment's length is 0.01
    this.grid_gapSize = 0.01;
    this.gapSizePixels = 0.0;
    this.r = 0.0;
    this.center = [];
    this.isVertical = 1;

    this.lineShaders = {
        /* Vertex shader is to generate clipspace coordinates, called once per vertex
         * @param attributes: vector/matrix represents vertex position.
         * @param uniforms: vector/matrix stays the same for all vertices in a draw call,
         *                  including model, view, projection, scale, transform matrix...
         * @return gl_position: final clipspace coordinates = uniform matrix * vertex position;
         */
        vs: [
            'varying vec3 vPos;',
            'varying float textureU;',
            'attribute vec3 point;',
            'uniform mat4 model;',
            'uniform mat4 view;',
            'uniform mat4 projection;',

            'void main()',
            '{',
            'gl_Position = projection * view * model  * vec4(point, 1.0) ;',
            'vPos = point;',
            'textureU = point.z;',
            '}'].join('\n'),

        /* Fragment shader is to provide a color for the current pixel, called once per pixel
         * @param uniform: vector/matrix stays the same for each pixel in a draw call,
         * @return gl_FragColor: pixel's color
         */
        fs: [
            'precision mediump float;',
            'varying vec3 vPos;',
            'varying float textureU;',
            'uniform mediump vec4 lineColor;',
            'uniform mediump float dotSize;',
            'uniform mediump float centerX;',
            'uniform mediump float centerY;',
            'uniform mediump float r;',
            'uniform mediump float canvasWidth;',
            'uniform mediump float canvasHeight;',
            'uniform mediump int isVertical;',

            'void main()',
            '{',
            'const float gapSize = 0.01;',
            'if (isVertical == 0) {',
                'float gapSizePixels = canvasWidth / (2.0 / gapSize);',
                'float xPixels = vPos.x / 2.0 * canvasWidth;',
                'float yPixels = vPos.y / 2.0 * canvasHeight;',
                'float rPixels = r / 2.0 * canvasHeight;',
                'float center = centerX;',
                'for (float i = -1.0 / gapSize + 1.0; i <= 1.0 / gapSize; i++) {',
                    'if (xPixels > (i - 1.0) * gapSizePixels && xPixels < i * gapSizePixels) {',
                        'if ((xPixels - center) * (xPixels - center) + (yPixels - centerY)* (yPixels - centerY) < rPixels * rPixels)',
                            'gl_FragColor = vec4(lineColor.xyz, 0.5);',
                        'else gl_FragColor = vec4(lineColor.xyz, 0.0);',
                    '}',
                    'center += gapSizePixels;',
                '}',
            '} else {',
                'float gapSizeY = gapSize / canvasHeight * canvasWidth;',
                'float num = floor(1.0 / gapSizeY);',
                'float gapSizePixels = canvasHeight / (num * 2.0);',
                'float xPixels = vPos.x / 2.0 * canvasWidth;',
                'float yPixels = vPos.y / 2.0 * canvasHeight;',
                'float rPixels = r / 2.0 * canvasWidth;',
                'float center = centerY;',
                'for (float i = 1.0 / gapSize; i > -1.0 / gapSize; i--) {',
                    'if (i <= num && i >= -num) {',
                        'if (yPixels > (i - 1.0) * gapSizePixels && yPixels < i * gapSizePixels) {',
                            'if ((xPixels - centerX) * (xPixels - centerX) + (yPixels - center)* (yPixels - center) < rPixels * rPixels)',
                                'gl_FragColor = vec4(lineColor.xyz, 0.5);',
                            'else gl_FragColor = vec4(lineColor.xyz, 0.0);',
                        '}',
                        'center -= gapSizePixels;',
                    '}',
                '}',
            '}',
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

    // Set grid canvas size
    this.setGridCanvasSize = function (size) {
        this.grid_canvas_size = size;
    }

    // Set Gap Size
    this.setGapSize = function(size) {
        this.grid_gapSize = size;
    }

    this.storeData = function (data, isVertical) {
        if (isVertical) {
            this.r = (data[6] - data[0]) / 2;
            this.center = [(data[0] + data[6]) / 2, data[1] - this.r];
            this.isVertical = 1;
        } else {
            this.r = (data[1] - data[4]) / 2;
            this.center = [data[0] + this.r, (data[1] + data[4]) / 2];
            this.isVertical = 0;
        }
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
            canvasWidth: canvas.width,
            canvasHeight: canvas.height,
            centerX: this.center[0] / 2.0 * canvas.width,
            centerY: this.center[1] / 2.0 * canvas.height,
            r: this.r,
            isVertical: this.isVertical,
        };
        // console.log("@@@", this.uniforms);
        this.gl.useProgram(this.lineDrawerProgram.program);
        //binds buffers and sets attributes
        this.twgl.setBuffersAndAttributes(this.gl, this.lineDrawerProgram, this.myBuffer);
        this.twgl.setUniforms(this.lineDrawerProgram, this.uniforms);
        this.twgl.drawBufferInfo(this.gl, this.myBuffer,  this.line_mode);
    }
}
}
