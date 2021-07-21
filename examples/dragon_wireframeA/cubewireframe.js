
function CubeWireframe(gl) {
    if (!CubeWireframe.prototype.indexBuffer) {
        CubeWireframe.prototype.init(gl);
    }
};

CubeWireframe.prototype = {

    vertices: 
      [
                //points of the front face (z=0.5)
                0.5,  0.5, 0.5,
                0.5, -0.5, 0.5,
                -0.5, -0.5, 0.5,
                -0.5,  0.5, 0.5,

                //points of the back face (z=-0.5)
                0.5,  0.5, -0.5,
                0.5, -0.5, -0.5,
                -0.5, -0.5, -0.5,
                -0.5,  0.5, -0.5
                ]
    ,
    indices:  
      [
                //lines showing the front face
                0,1,
                1,2,
                2,3,
                3,0,

                //lines showing the back face
                4,5,
                5,6,
                6,7,
                7,4,

                //edges between the front and the back face
                0,4,
                1,5,
                2,6,
                3,7
                ]
    ,

    
    positionBuffer:null,
    indexBuffer: null,
    init: function (gl) {
        console.log("initializing wireframe");
        var that = CubeWireframe.prototype;
       
        that.positionBuffer = gl.createBuffer();
        that.positionBuffer.itemSize = 3;
        that.positionBuffer.numItems = that.vertices.length / that.positionBuffer.itemSize;
        gl.bindBuffer(gl.ARRAY_BUFFER, that.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( that.vertices), gl.STATIC_DRAW);
      
        that.indexBuffer = gl.createBuffer();
        that.indexBuffer.itemSize = 1;
        that.indexBuffer.numItems = that.indices.length / that.indexBuffer.itemSize;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, that.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( that.indices), gl.STATIC_DRAW);
       

    },
    draw: function (gl, prog) {
        var that = CubeWireframe.prototype;

        gl.bindBuffer(gl.ARRAY_BUFFER, that.positionBuffer);
        gl.vertexAttribPointer(prog.aVertexPosition, that.positionBuffer.itemSize, gl.FLOAT, false, 4 * that.positionBuffer.itemSize, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, that.indexBuffer);
        gl.drawElements(gl.LINES, 24, gl.UNSIGNED_SHORT, 0);
  

    }

};
