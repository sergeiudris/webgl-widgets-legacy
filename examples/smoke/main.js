
var THIS_FOLDER_PATH = ".";

/*
GLOBAL VARIABLES
*/
var CANVAS,
    GL,
    shaderVertexSource,
    shaderFragmentSource,
    program,
    programDictionary = {
        attributes: ["aVertexPosition", "aUV"],
        uniforms: ["uPMatrix", "uMMatrix", "uVMatrix", "uSampler", "uParticlePosition", "uScaleParticle","uDensity","uSamplerSmoke", "uPMatrixVideo", "uVMatrixVideo", "uMMatrixInvRot", "uSprite"]
    },
    quad,
    matrixStack = {
        p: [],
        v: [],
        m: [],

    },
    mMatrixStack = [],
        pMatrix,
        mMatrix,
        vMatrix,
        pMatrixVideo,
        vMatrixVideo,
        mMatrixInvRot,
        lastTime = 0,
        isDragging = false,
        mousePosition = { x: 0, y: 0 },
        animationFrameID = -1,
        THETA = 0,
        PHI = 0,
        AMORTIZATION = 0.95,
        DELTA = { x: 0, y: 0 },
        videoTexture,
        smokeImage,
        video = document.getElementById("bunny_video")

;

function main() {
    console.log("main");
    loadShaders(start);
};


function start() {
    console.log("entered start");


    CANVAS = document.getElementById("canvas");

    CANVAS.width = CANVAS.clientWidth;
    CANVAS.height = CANVAS.clientHeight;

    addEventListeners(CANVAS);


    pMatrix = Lib.getProjection4(40, CANVAS.width / CANVAS.height, 1, 100);
    mMatrix = Lib.getIdentity4();
    vMatrix = Lib.getIdentity4();

    pMatrixVideo = false;
    vMatrixVideo = Lib.getIdentity4();
    mMatrixInvRot = Lib.getIdentity3();


    initGL();
    initProgram();
   
    
    smokeImage = Utils.loadTextureNext(THIS_FOLDER_PATH+"/smokeSprite.png", function (e) {
        smokeImage.smokeTexture = GL.createTexture();
          GL.activeTexture(GL.TEXTURE1);
       // GL.activeTexture(GL.TEXTURE0);
        GL.bindTexture(GL.TEXTURE_2D, smokeImage.smokeTexture);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST_MIPMAP_LINEAR);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.MIRRORED_REPEAT);

        GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, smokeImage);
        GL.generateMipmap(GL.TEXTURE_2D);

        GL.activeTexture(GL.TEXTURE0);
        videoTexture = GL.createTexture();
        GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
        GL.bindTexture(GL.TEXTURE_2D, videoTexture);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
  

       GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    });



    createWorld();
    Lib.translateZ4(vMatrix, -6);
    Lib.translateZ4(vMatrixVideo, -4);
    lastTime = new Date().getTime();
    GL.uniform1i(program.uSampler, 0);
    GL.uniform1i(program.uSamplerSmoke, 1);
    drawScene();
};

var previousTime = 0;

function drawScene(time) {
  GL.uniform1i(program.uSampler, 0);
    GL.uniform1i(program.uSamplerSmoke, 1);
    if (!isDragging) {
        DELTA.x *= AMORTIZATION, DELTA.y *= AMORTIZATION;
        THETA += DELTA.x;
        PHI += DELTA.y;
        THETA *= 0.9;
        PHI *= 0.9;
    }
    pushMatrix(mMatrix, "m");
    var dt = animate();
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    GL.uniformMatrix4fv(program.uPMatrix, false, pMatrix);
    GL.uniformMatrix4fv(program.uVMatrix, false, vMatrix);
    GL.uniformMatrix4fv(program.uMMatrix, false, mMatrix);

    Lib.transpose43(mMatrix, mMatrixInvRot);
    GL.uniformMatrix3fv(program.uMMatrixInvRot, false, mMatrixInvRot);
    
    if (video.currentTime == video.duration) {
        video.currentTime = 0;
    }
    if (video.currentTime> 0 && video.currentTime != previousTime) {
        refreshTexture();
        previousTime = video.currentTime;
        if (!pMatrixVideo) {
            pMatrixVideo = Lib.getProjection4(30, video.videoWidth / video.videoHeight, 0.1, 10);
            GL.uniformMatrix4fv(program.uPMatrixVideo, false, pMatrixVideo);
            GL.uniformMatrix4fv(program.uVMatrixVideo, false, vMatrixVideo);
        }

    }
    
    Particles.map(function (particle) {
        GL.uniform3fv(program.uParticlePosition, particle.position);
        GL.uniform1f(program.uScaleParticle, particle.scale);
        GL.uniform1f(program.uDensity, particle.density);
        GL.uniform1f(program.uSprite, Math.floor(particle.spriteOffset));

        quad.draw(GL, program);

        //compute the resultant force applied to the particle
        var Fm = [0, 0.02 / particle.density, 0]; //specific force due to upthrust buoyancy

        var v2 = Lib.squareVec3(particle.speed);
        v2 *= 1; //apply a friction coefficient
        var vu = Lib.getUnitVector(particle.speed);
        Fm[0] -= v2 * vu[0], Fm[1] -= v2 * vu[1], Fm[2] -= v2 * vu[2]; //add air friction force

        //refresh speed using Newton second law
        particle.speed[0] += dt * Fm[0], particle.speed[1] += dt * Fm[1], particle.speed[2] += dt * Fm[2];

        particle.position[0] += dt * particle.speed[0],
          particle.position[1] += dt * particle.speed[1],
          particle.position[2] += dt * particle.speed[2];

        var dilution = dt * 0.06;
        particle.scale += dilution;
        particle.density *= Math.pow(1 - dilution, 3);


        if (particle.position[1] > 4) resetParticle(particle);

        ++particle.spriteOffset;
        if (particle.spriteOffset >= 15) particle.spriteOffset = 0;
    });

 

    popMatrix("m");

    GL.flush();

    animationFrameID = window.requestAnimationFrame(drawScene);
};


function refreshTexture() {
    GL.bindTexture(GL.TEXTURE_2D, videoTexture);
    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, video);
}

function createWorld() {

    quad = new Quad(GL,program);

};

function animate() {
    var timeNow = new Date().getTime();
    var dt = Math.min(0.2, (timeNow - lastTime) / 1000);
    if (lastTime != 0) {
  

        //Lib.rotateX4(mMatrix, dt * 0.0003);
        //Lib.rotateZ4(mMatrix, dt * 0.0005);
        //Lib.rotateY4(mMatrix, dt * 0.0004);

        Lib.rotateX4(mMatrix, PHI);
        Lib.rotateY4(mMatrix, THETA);

    }
    lastTime = timeNow;
    return dt;

};



function initGL() {
    try {
        GL = CANVAS.getContext("webgl", { antialias: true }) || CANVAS.getContext("experimental-webgl", { antialias: false });
        GL.viewport(0.0, 0.0, CANVAS.width, CANVAS.height);// 

        GL.clearColor(0.184, 0.513, 0.878, 1.0); //#2f83e0 in HTML notation
        // GL.enable(GL.DEPTH_TEST);
        GL.disable(GL.DEPTH_TEST);
        //GL.depthFunc(GL.LEQUAL);
        GL.depthMask(false);
        GL.enable(GL.BLEND);
        GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);
      //  GL.clearDepth(1.0);

    } catch (e) {
        alert("You are not webgl compatible :(");
        return false;
    }
};
function initProgram() {
    program = Shadering.createProgram(GL, shaderVertexSource, shaderFragmentSource, programDictionary);
    GL.useProgram(program);
};





function loadShaders(callback) {
    console.log("loading shaders...");
    var countShaders = 0; //will be kept cause it'll be closure
    Utils.loadFile(THIS_FOLDER_PATH+"/vertex.shader", function (xmlhttp) {
        shaderVertexSource = xmlhttp.responseText;
        countShaders += 1; //closure created
        if (countShaders == 2) {
            callback();
        }
    });
    Utils.loadFile(THIS_FOLDER_PATH+"/fragment.shader", function (xmlhttp) {
        shaderFragmentSource = xmlhttp.responseText;
        countShaders += 1;
        if (countShaders == 2) {
            callback();
        }
    });
};


function mouseDown(e) {

    isDragging = true;
    mousePosition.x = e.clientX;
    mousePosition.y = e.clientY;
    e.preventDefault();
    console.log(isDragging);
    return false;
};

function mouseUp(e) {
    isDragging = false;
    console.log(isDragging);
};

function mouseMove(e) {
    if (!isDragging) {
        return false;
    }

    DELTA.x = (e.clientX - mousePosition.x) * 2 * Math.PI / CANVAS.width / 2,
    DELTA.y = (e.clientY - mousePosition.y) * 2 * Math.PI / CANVAS.height / 2
    ;

    THETA += DELTA.x;
    PHI += DELTA.y;
    mousePosition.x = e.clientX;
    mousePosition.y = e.clientY;

    e.preventDefault();

};



function addEventListeners(el) {
    el.addEventListener("dblclick", function (e) {

        if (animationFrameID != -1) {
            window.cancelAnimationFrame(animationFrameID);
            console.log("canceled animation frame")
            animationFrameID = -1;
            lastTime = 0;
        } else {
            //   animationFrameID = requestAnimationFrame(drawScene);
            drawScene();
            console.log("requested animation frame")
        }
    }, false);

    el.addEventListener("mousedown", mouseDown, false);
    el.addEventListener("mouseup", mouseUp, false);
    el.addEventListener("mouseout", mouseUp, false);
    el.addEventListener("mousemove", mouseMove, false);

};

function pushMatrix(m, type) {
    var copy = m.slice();
    matrixStack[type].push(copy);
}
function popMatrix(type) {
    if (matrixStack[type].length == 0) {
        console.log("Invalid popMatrix! OutFoBounds exception is comming, bro");
    }

    switch (type) {
        case "m":
            mMatrix = matrixStack[type].pop();
            break;
        case "v":
            vMatrix = matrixStack[type].pop();
            break;
        case "p":
            pMatrix = matrixStack[type].pop();
            break;
    }
}