
function Cube(gl) {
    if (!Cube.prototype.indexBuffer) {
        Cube.prototype.init(gl);
    }
};

Cube.prototype = {

    vertices: 
       [
		  // Front face
		  -1.0, -1.0, 1.0,
		   1.0, -1.0, 1.0,
		   1.0, 1.0, 1.0,
		  -1.0, 1.0, 1.0,

		  // Back face
		  -1.0, -1.0, -1.0,
		  -1.0, 1.0, -1.0,
		   1.0, 1.0, -1.0,
		   1.0, -1.0, -1.0,

		  // Top face
		  -1.0, 1.0, -1.0,
		  -1.0, 1.0, 1.0,
		   1.0, 1.0, 1.0,
		   1.0, 1.0, -1.0,

		  // Bottom face
		  -1.0, -1.0, -1.0,
		   1.0, -1.0, -1.0,
		   1.0, -1.0, 1.0,
		  -1.0, -1.0, 1.0,

		  // Right face
		   1.0, -1.0, -1.0,
		   1.0, 1.0, -1.0,
		   1.0, 1.0, 1.0,
		   1.0, -1.0, 1.0,

		  // Left face
		  -1.0, -1.0, -1.0,
		  -1.0, -1.0, 1.0,
		  -1.0, 1.0, 1.0,
		  -1.0, 1.0, -1.0
       ]
    ,
    indices:  
       [
		  0, 1, 2, 0, 2, 3,    // Front face
		  4, 5, 6, 4, 6, 7,    // Back face
		  8, 9, 10, 8, 10, 11,  // Top face
		  12, 13, 14, 12, 14, 15, // Bottom face
		  16, 17, 18, 16, 18, 19, // Right face
		  20, 21, 22, 20, 22, 23  // Left face
       ]
    ,
    colors:
       [
		  [1.0, 0.0, 0.0],     // Front face
		  [1.0, 1.0, 0.0],     // Back face
		  [0.0, 1.0, 0.0],     // Top face
		  [1.0, 0.5, 0.5],     // Bottom face
		  [1.0, 0.0, 1.0],     // Right face
		  [0.0, 0.0, 1.0]     // Left face

       ]
        ,
    
    positionBuffer:null,
    indexBuffer: null,
    colorBuffer: null,
    x:null,
    init: function (gl) {
        var that = Cube.prototype;


        that.unpackedColors = [];
        for (var j = 0, l = that.colors.length; j < l; j++) {
            var color = that.colors[j];
            for (var i = 0; i < 4; i++) {
                that.unpackedColors = that.unpackedColors.concat(color);
            }
        }

       
        console.log("initing triangle");
        that.positionBuffer = gl.createBuffer();
        that.positionBuffer.itemSize = 3;
        that.positionBuffer.numItems = that.vertices.length / that.positionBuffer.itemSize;
        gl.bindBuffer(gl.ARRAY_BUFFER, that.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( that.vertices), gl.STATIC_DRAW);


        that.colorBuffer = gl.createBuffer();
        that.colorBuffer.itemSize = 3;
        that.colorBuffer.numItems = that.unpackedColors.length / that.colorBuffer.itemSize;
        gl.bindBuffer(gl.ARRAY_BUFFER, that.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( that.unpackedColors), gl.STATIC_DRAW);

      
        that.indexBuffer = gl.createBuffer();
        that.indexBuffer.itemSize = 1;
        that.indexBuffer.numItems = that.indices.length / that.indexBuffer.itemSize;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, that.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( that.indices), gl.STATIC_DRAW);
       

    },
    draw: function (gl, prog) {

        var that = Cube.prototype;

        gl.bindBuffer(gl.ARRAY_BUFFER, that.positionBuffer);
        gl.vertexAttribPointer(prog.aVertexPosition, that.positionBuffer.itemSize, gl.FLOAT, false, 4 * that.positionBuffer.itemSize, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, that.colorBuffer);
        gl.vertexAttribPointer(prog.aVertexColor, that.colorBuffer.itemSize, gl.FLOAT, false, 4 * that.colorBuffer.itemSize, 0);


        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, that.indexBuffer);
        gl.drawElements(gl.TRIANGLES, that.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  

    }

};
