
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
        [1,2]
    ,
    colors:
        [0, 0, 1,1,
            1, 1, 0,1,
            1,0,0,1
        ]
        ,
    x0:
       [-1, -1,
           0, 0, 1,
        1, -1,
        1,1,0,
        1, 1,
        1,0,0
       ]
    ,
    positionBuffer:null,
    indexBuffer: null,
    colorBuffer: null,
    x:null,
    init: function (gl) {
        console.log("initing triangle");
        Triangle.prototype.positionBuffer = gl.createBuffer();
        Triangle.prototype.positionBuffer.itemSize = 3;
        Triangle.prototype.positionBuffer.numItems = 3;
        gl.bindBuffer(gl.ARRAY_BUFFER, Triangle.prototype.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( Triangle.prototype.vertices), gl.STATIC_DRAW);


        Triangle.prototype.colorBuffer = gl.createBuffer();
        Triangle.prototype.colorBuffer.itemSize = 4;
        Triangle.prototype.colorBuffer.numItems = 3;
        gl.bindBuffer(gl.ARRAY_BUFFER, Triangle.prototype.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( Triangle.prototype.colors), gl.STATIC_DRAW);

        Triangle.prototype.x = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, Triangle.prototype.x);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( Triangle.prototype.x0 ), gl.STATIC_DRAW);


        Triangle.prototype.indexBuffer = gl.createBuffer();
        Triangle.prototype.indexBuffer.itemSize = 1;
        Triangle.prototype.indexBuffer.numItems = 3;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Triangle.prototype.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array( Triangle.prototype.indices), gl.STATIC_DRAW);
       

    },
    draw: function (gl, prog) {
        gl.bindBuffer(gl.ARRAY_BUFFER, Triangle.prototype.positionBuffer);
        gl.vertexAttribPointer(prog.aVertexPosition, Triangle.prototype.positionBuffer.itemSize, gl.FLOAT, false,4*3 , 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, Triangle.prototype.colorBuffer);
        gl.vertexAttribPointer(prog.aVertexColor, Triangle.prototype.colorBuffer.itemSize, gl.FLOAT, false, 4*4, 0);

        //gl.bindBuffer(gl.ARRAY_BUFFER, Triangle.prototype.x);

        //gl.vertexAttribPointer(prog.aVertexPosition, 2, gl.FLOAT, false, 4 * (2 + 3), 0);
        //gl.vertexAttribPointer(prog.aVertexColor, 3, gl.FLOAT, false, 4 * (2 + 3), 2 * 4);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Triangle.prototype.indexBuffer);
        gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, 0);
        //gl.drawArrays(gl.TRIANGLES, 0, Triangle.prototype.positionBuffer.numItems);

    }

};
