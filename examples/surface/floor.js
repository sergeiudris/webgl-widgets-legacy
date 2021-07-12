
function Floor(gl,width,length,yPos) {
    if (!Floor.prototype.indexBuffer) {
        Floor.prototype.init(gl,width,length,yPos);
    }
};

Floor.prototype = {

    vertices: []
    ,
    indices: []
    ,
    indicesEdges: [],
    indicesEdgesSorted: [],
    indicesEdgesNoDoubles: [],
    indicesPoint: [],
    textureCoords:null
        ,
    
    positionBuffer:null,
    indexBuffer: null,
    textureBuffer: null,
    
    init: function (gl,width,length,yPos) {
        var that = Floor.prototype;
        var x, y, z;
        width = width / 2;
        length = length/ 2;
        
        
        for (x = -1 * width*100; x < 1 * width*100; x += 1 * (width*2)) { 
            for (z = -1 * length * 100; z < 1 * length * 100; z += 1 * (length * 2)) { 
                
                that.vertices.push(x/100, Math.abs(Math.sin(Math.PI*z/100)*Math.sin(Math.PI*x/100)), z/100);
            }
        }
       var rowLength = 100;
        for (var i = 0, l = that.vertices.length / 3 - rowLength - 1; i < l; i ++) {
            that.indices.push(i, i + rowLength, i + rowLength+1);
            that.indices.push(i,i+rowLength+1,i+1);
        }
        
        that.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, that.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(that.vertices), gl.STATIC_DRAW);
       
        that.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, that.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(that.indices), gl.STATIC_DRAW);

    },
    draw: function (gl, prog) {

        var that = Floor.prototype;

        gl.bindBuffer(gl.ARRAY_BUFFER, that.positionBuffer);
        gl.vertexAttribPointer(prog.aVertexPosition, 3, gl.FLOAT, false, 4 * 3, 0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, that.indexBuffer);
        gl.drawElements(gl.TRIANGLES, that.indices.length, gl.UNSIGNED_SHORT, 0);

    }

};
