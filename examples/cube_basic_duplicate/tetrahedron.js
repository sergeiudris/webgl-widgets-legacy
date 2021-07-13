
function Tetrahedron(gl) {
    if (!Tetrahedron.prototype.indexBuffer) {
        Tetrahedron.prototype.init(gl);
    }
};

Tetrahedron.prototype = {

    vertices: 
      [
    //base face points, included in the plane y=-1
    -1, -1, -1, 
    1, -1, -1, 
    0, -1, 1, 

    //summit, in white
    0, 1, 0
      ]
    ,
    indices:  
       [
    0, 1, 2, //base

    0, 1, 3, //side 0
    1, 2, 3, //side 1
    0, 2, 3  //side 2
       ]
    ,
    colors:
       [
		  0.1, 0.0, 0.0,    
		  1.0, 1.0, 0.0,     
		  0.0, 1.0, 0.0,     
		  1.0, 1.0, 1.0   

       ]
        ,
    
    positionBuffer:null,
    indexBuffer: null,
    colorBuffer: null,
    x:null,
    init: function (gl) {
        var that = Tetrahedron.prototype;

       
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
    draw: function (gl, prog,numItems, offset,again) {
        var that = Tetrahedron.prototype;
        if (!again) {
            gl.bindBuffer(gl.ARRAY_BUFFER, that.positionBuffer);
            gl.vertexAttribPointer(prog.aVertexPosition, that.positionBuffer.itemSize, gl.FLOAT, false, 4 * that.positionBuffer.itemSize, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, that.colorBuffer);
            gl.vertexAttribPointer(prog.aVertexColor, that.colorBuffer.itemSize, gl.FLOAT, false, 4 * that.colorBuffer.itemSize, 0);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, that.indexBuffer);
            gl.drawElements(gl.TRIANGLES, numItems || that.indexBuffer.numItems, gl.UNSIGNED_SHORT, offset || 0);

        } else {

            gl.drawElements(gl.TRIANGLES, numItems || that.indexBuffer.numItems, gl.UNSIGNED_SHORT, offset || 0);
        }
    }

};
