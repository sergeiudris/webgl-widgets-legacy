
function Dragon(gl,dragon) {
    if (!Dragon.prototype.indexBuffer) {
        Dragon.prototype.init(gl,dragon);
    }
};



Dragon.prototype = {

    vertices: null
    ,
    indices: null
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
    
    init: function (gl,dragon) {
        var that = Dragon.prototype;

        that.vertices = dragon.vertices;
        that.indices = dragon.indices;

        for (var i = 0, l =that.indices.length;i<l; i += 3) {
            that.indicesEdges.push(dragon.indices[i], dragon.indices[i + 1]);//first edge
            that.indicesEdges.push(dragon.indices[i+1], dragon.indices[i + 2]); // second edge
            that.indicesEdges.push(dragon.indices[i+2], dragon.indices[i]); //third edge
        }

        for (var i = 0, l = that.vertices.length; i < l; i += (3 + 3 + 2)) {
            that.indicesEdgesSorted.push([]);
        }

        var iMin, iMax;

        //loop on edges
        for (var i = 0, l = that.indicesEdges.length; i < l; i +=2) {
            iMax = Math.max(that.indicesEdges[i], that.indicesEdges[i + 1]);
            iMin = Math.min(that.indicesEdges[i], that.indicesEdges[i + 1]);

            if (that.indicesEdgesSorted[iMax].indexOf(iMin) === -1) {
                // add the edges to the sorted edges array
                that.indicesEdgesSorted[iMax].push(iMin);
            } else {
                //edge is already there
                continue;
            }
        }


        that.indicesEdgesSorted.map(function (iMins, iMax) {
            iMins.map(function (iMin) {
                that.indicesEdgesNoDoubles.push(iMin, iMax);
            });
        });
        
        for (var i = 0, l = that.vertices.length; i < l; i += (3 + 3 + 2)) {
            that.indicesPoint.push(i / (3 + 3 + 2));
        }
        
        console.log("Number of indices: " + that.indices.length);
        console.log("Raw number of edges: " + that.indicesEdges.length/2);
        console.log("Number of edges without doubles: " + that.indicesEdgesNoDoubles.length / 2);
        
       
        console.log("initing dragon");
        that.positionBuffer = gl.createBuffer();
        that.positionBuffer.itemSize = 3;
        that.positionBuffer.numItems = that.vertices.length / that.positionBuffer.itemSize;
        gl.bindBuffer(gl.ARRAY_BUFFER, that.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( that.vertices), gl.STATIC_DRAW);

      
        that.indexBuffer = gl.createBuffer();
        that.indexBuffer.itemSize = 1;
        //that.indexBuffer.numItems = that.indicesEdgesNoDoubles.length / that.indexBuffer.itemSize;
        that.indexBuffer.numItems = that.indices.length / that.indexBuffer.itemSize;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, that.indexBuffer);
        //gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(that.indicesEdgesNoDoubles), gl.STATIC_DRAW);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(that.indices), gl.STATIC_DRAW);
       

    },
    draw: function (gl, prog) {

        var that = Dragon.prototype;

        gl.bindBuffer(gl.ARRAY_BUFFER, that.positionBuffer);
        gl.vertexAttribPointer(prog.aVertexPosition, that.positionBuffer.itemSize, gl.FLOAT, false, 4 * (3+3+2), 0);
        gl.vertexAttribPointer(prog.aUV, 2, gl.FLOAT, false, 4 * (3+3+2), (3+3)*4);


        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, that.indexBuffer);
        gl.drawElements(gl.TRIANGLES, that.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  

    }

};
