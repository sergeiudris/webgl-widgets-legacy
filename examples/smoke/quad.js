
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