
function Quad(gl,prog) {
    if (!Quad.prototype.indexBuffer) {
        Quad.prototype.init(gl,prog);
    }
};

Quad.prototype = {

    vertices: 
       [
		  // Front face
		  -1.0, -1.0, 0.0,
		   1.0, -1.0, 0.0,
		   1.0, 1.0, 0.0,
		  -1.0, 1.0, 0.0,

       ]
    ,
    indices:  
       [
		  0, 1, 2, 0, 2, 3    // Front face
		 
       ]
    ,
    textureCoords:
      [
      // Front face
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0

      ]
        ,
    
    positionBuffer:null,
    indexBuffer: null,
    textureBuffer: null,
    init: function (gl,prog) {
        var that = Quad.prototype;
       
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
       

        gl.bindBuffer(gl.ARRAY_BUFFER, that.positionBuffer);
        gl.vertexAttribPointer(prog.aVertexPosition, that.positionBuffer.itemSize, gl.FLOAT, false, 4 * that.positionBuffer.itemSize, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, that.textureBuffer);
        gl.vertexAttribPointer(prog.aUV, that.textureBuffer.itemSize, gl.FLOAT, false, 4 * that.textureBuffer.itemSize, 0);


        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, that.indexBuffer);
    },
    draw: function (gl, prog) {

        var that = Quad.prototype;

        gl.drawElements(gl.TRIANGLES, that.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  

    }

};


var Particles = [];

for (var i=0; i<3000; i++) {
    var particle={
        density: 0,
        spriteOffset: Math.random()*15,
        speed: [0,0,0],
        position:[0,0,0],
        scale: 0
    };
    resetParticle(particle);
    Particles.push(particle);
}


function resetParticle(particle) {
    particle.position[0] = (Math.random() - 0.5) * 4;      //X
    particle.position[1] = -4 + (Math.random() - 0.5) * 6;   //Y
    particle.position[2] = 0;                          //Z

    particle.speed[0] = 0.8 * (Math.random() - 0.5);      //VX
    particle.speed[1] = Math.random();                //VY
    particle.speed[2] = 0.08 * (Math.random() - 0.5);     //VZ

    particle.scale = 0.06 + 0.05 * Math.random();
    particle.density = 0.5 + 0.5 * Math.abs(particle.position[0] / 2);

}




function Sphere(gl, prog) {
    if (!Sphere.prototype.indexBuffer) {
        Sphere.prototype.init(gl, prog);
    }
};

Sphere.prototype = {

    nCrowns: 64,
    nBands: 32,
    nVertices: 0,

    vertices : [],
    indices: [],
    indexBuffer: null,
    positionBUffer: null,
    
    init: function (gl, prog) {
        var that = Sphere.prototype,
            c,
            b,
            theta,
            phi,
            nCrowns = that.nCrowns,
            nBands = that.nBands,
            vertices = that.vertices,
            indices = that.indices
        ;

        for (c = 0; c <= nCrowns; c++) {   //loop on crowns
            phi = Math.PI * c / nCrowns;         //compute lattitude

            for (b = 0; b <= nBands; b++) { //loop on bands
                theta = 2 * Math.PI * b / nBands;   //compute longitude

                vertices.push(Math.cos(theta) * Math.sin(phi), //X
                                     Math.cos(phi),                 //Y,
                                     Math.sin(theta) * Math.sin(phi),
                                     theta/(2*Math.PI),
                                     phi/Math.PI
                                     );                 
                if (c !== 0) { //add a triangle face
                    indices.push(c * (nBands + 1) + b, c * (nBands + 1) + b - 1, (c - 1) * (nBands + 1) + b);
                    that.nVertices += 3;
                }
                if (c !== 0 && c !== 1) { //add an other triangle face
                    indices.push(c * (nBands + 1) + b - 1, (c - 1) * (nBands + 1) + b, (c - 1) * (nBands + 1) + b - 1);
                    that.nVertices += 3;
                }

            }                         //end loop on bands
        }

        that.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, that.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,
                      new Float32Array(vertices),
          gl.STATIC_DRAW);

        //FACES :
        that.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, that.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
                      new Uint16Array(indices),
          gl.STATIC_DRAW);

        GL.vertexAttribPointer(prog.aVertexPosition, 3, gl.FLOAT, false, 4 * (3+2), 0);
        GL.vertexAttribPointer(prog.aUV, 2, gl.FLOAT, false, 4 * (3+2),3*4); // attrib is back for video seelction 2d 3d mixing
        GL.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, that.indexBuffer);
    },
    draw: function (gl, prog) {

        var that = Sphere.prototype;

        gl.drawElements(gl.TRIANGLES, that.nVertices, gl.UNSIGNED_SHORT, 0);


    }

};



