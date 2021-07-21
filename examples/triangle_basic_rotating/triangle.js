
function Triangle(gl) {
    if (!Triangle.prototype.indexBuffer) {
        Triangle.prototype.init(gl);
    }
};

Triangle.prototype = {

    vertices: 
       [-1, -1,0,
        1, -1,0,
        1, 1,0 ]
    ,
    indices:  
        [0,1,2]
    ,
    colors:
        [0, 0, 1,
            1, 1, 0,
            1,0,0
        ]
        ,
    
    positionBuffer:null,
    indexBuffer: null,
    colorBuffer: null,
    x:null,
    init: function (gl) {
        var that = Triangle.prototype;
        console.log("initing triangle");
        that.positionBuffer = gl.createBuffer();
        that.positionBuffer.itemSize = 3;
        that.positionBuffer.numItems = that.vertices.length / that.positionBuffer.itemSize;
        gl.bindBuffer(gl.ARRAY_BUFFER, that.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( that.vertices), gl.STATIC_DRAW);


        that.colorBuffer = gl.createBuffer();
        that.colorBuffer.itemSize = 3;
        that.colorBuffer.numItems = that.colors.length / that.colorBuffer.itemSize;
        gl.bindBuffer(gl.ARRAY_BUFFER, that.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( that.colors), gl.STATIC_DRAW);

      
        that.indexBuffer = gl.createBuffer();
        that.indexBuffer.itemSize = 1;
        that.indexBuffer.numItems = that.indices.length / that.indexBuffer.itemSize;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, that.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( that.indices), gl.STATIC_DRAW);
       

    },
    draw: function (gl, prog) {

        var that = Triangle.prototype;

        gl.bindBuffer(gl.ARRAY_BUFFER, that.positionBuffer);
        gl.vertexAttribPointer(prog.aVertexPosition, that.positionBuffer.itemSize, gl.FLOAT, false, 4 * that.positionBuffer.itemSize, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, that.colorBuffer);
        gl.vertexAttribPointer(prog.aVertexColor, that.colorBuffer.itemSize, gl.FLOAT, false, 4 * that.colorBuffer.itemSize, 0);


        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, that.indexBuffer);
        gl.drawElements(gl.TRIANGLES, that.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  

    }

};
