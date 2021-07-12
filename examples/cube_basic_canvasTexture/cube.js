
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
    textureCoords:
      [
      // Front face
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,

      // Back face
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,

      // Top face
      0.0, 1.0,
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,

      // Bottom face
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,
      1.0, 0.0,

      // Right face
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,

      // Left face
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0
      ]
        ,
    
    positionBuffer:null,
    indexBuffer: null,
    textureBuffer: null,
    x:null,
    init: function (gl) {
        var that = Cube.prototype;
       
        console.log("initing triangle");
        that.positionBuffer = gl.createBuffer();
        that.positionBuffer.itemSize = 3;
        that.positionBuffer.numItems = that.vertices.length / that.positionBuffer.itemSize;
        gl.bindBuffer(gl.ARRAY_BUFFER, that.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( that.vertices), gl.STATIC_DRAW);


        that.textureBuffer = gl.createBuffer();
        that.textureBuffer.itemSize = 2;
        that.textureBuffer.numItems = that.textureCoords.length / that.textureBuffer.itemSize;
        gl.bindBuffer(gl.ARRAY_BUFFER, that.textureBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(that.textureCoords), gl.STATIC_DRAW);

      
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
        gl.bindBuffer(gl.ARRAY_BUFFER, that.textureBuffer);
        gl.vertexAttribPointer(prog.aUV, that.textureBuffer.itemSize, gl.FLOAT, false, 4 * that.textureBuffer.itemSize, 0);


        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, that.indexBuffer);
        gl.drawElements(gl.TRIANGLES, that.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  

    }

};
