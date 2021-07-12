
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
         attributes: ["aVertexPosition","aUV"],
         uniforms:  ["uPMatrix", "uMMatrix", "uVMatrix", "uSampler"]
    },
    cube,
    matrixStack = {
        p: [],
        v: [],
        m: [],

    },
    mMatrixStack = [],
        pMatrix,
        pRTTMatrix,
        mMatrix,
        vMatrix,
        lastTime = 0,
        isDragging = false,
        mousePosition = {x:0,y:0},
        animationFrameID = -1,
        THETA = 0,
        PHI = 0,
        AMORTIZATION = 0.95,
        DELTA = {x:0,y:0},
        cubeTexture,

        rttTexture,
        framebuffer,
        renderbuffer
   
        ;

function main() {
    console.log("main");
    CANVAS = document.getElementById("canvas");
    CANVAS.width = CANVAS.clientWidth;
    CANVAS.height = CANVAS.clientHeight;
    addEventListeners(CANVAS);

   
    initGL();
    loadResources(start);
    
};


function start() {
    console.log("entered start");

    
    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LEQUAL);
    GL.clearDepth(1.0);

    pMatrix = Lib.getProjection4(40, CANVAS.width / CANVAS.height, 1, 100);
    pRTTMatrix = Lib.getProjection4(20, 1, 1, 100);
    mMatrix = Lib.getIdentity4();
    vMatrix = Lib.getIdentity4();
    
    initProgram();
    GL.uniform1i(program.uSampler, 0);
    createWorld();
    Lib.translateZ4(vMatrix, -6);
    drawScene();
};

var innerCubeRotaion = 0.0;
function drawScene(time) {

    if (!isDragging) {
        DELTA.x *= AMORTIZATION, DELTA.y *= AMORTIZATION;
        THETA += DELTA.x;
        PHI += DELTA.y;
    }
    pushMatrix(mMatrix,"m");
   
    GL.bindFramebuffer(GL.FRAMEBUFFER, framebuffer);
    
    GL.viewport(0.0, 0.0, 512, 512);
    GL.clearColor(0.0, 0.4, 0.0, 1.0);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
   
    innerCubeRotaion+=0.005;
    Lib.rotateX4(mMatrix, innerCubeRotaion);
    Lib.rotateY4(mMatrix, innerCubeRotaion);
   
    GL.uniformMatrix4fv(program.uPMatrix, false, pRTTMatrix);
    GL.uniformMatrix4fv(program.uVMatrix, false, vMatrix);
    GL.uniformMatrix4fv(program.uMMatrix, false, mMatrix);
  
   


    if (cubeTexture.webglTexture) {
        GL.activeTexture(GL.TEXTURE0);
        GL.bindTexture(GL.TEXTURE_2D, cubeTexture.webglTexture);
    }
   
    cube.draw(GL, program);
    GL.flush();
    GL.bindTexture(GL.TEXTURE_2D, null);
    GL.bindFramebuffer(GL.FRAMEBUFFER, null);
    
    popMatrix("m");
    pushMatrix(mMatrix, "m");
    animate();
    

    GL.viewport(0.0, 0.0, CANVAS.width, CANVAS.height);
    GL.clearColor(0.0, 0.0, 0.0, 1.0);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    GL.uniformMatrix4fv(program.uPMatrix, false, pMatrix);
    GL.uniformMatrix4fv(program.uVMatrix, false, vMatrix);
    GL.uniformMatrix4fv(program.uMMatrix, false, mMatrix);

    GL.bindTexture(GL.TEXTURE_2D, rttTexture);
    cube.draw(GL, program);
    popMatrix("m");
    
    GL.flush();

    animationFrameID = window.requestAnimationFrame(drawScene);
};

function createWorld() {

    cube = new Cube(GL);
    
};

function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var dt = timeNow - lastTime;

        //Lib.rotateX4(mMatrix, dt * 0.0003);
        //Lib.rotateZ4(mMatrix, dt * 0.0005);
        //Lib.rotateY4(mMatrix, dt * 0.0004);
    
        Lib.rotateX4(mMatrix, PHI);
        Lib.rotateY4(mMatrix, THETA);

    }
    lastTime = timeNow;
};

function initGL() {
    try{
        GL = CANVAS.getContext("webgl", { antialias: true }) || CANVAS.getContext("experimental-webgl", { antialias: false});
        GL.viewport(0.0, 0.0, CANVAS.width, CANVAS.height);// 

     
      
    } catch (e) {
        alert("You are not webgl compatible :(");
        return false;
    }
};
function initProgram() {
    program = Shadering.createProgram(GL, shaderVertexSource, shaderFragmentSource, programDictionary);
    GL.useProgram(program);
};





function loadResources(callback) {
    console.log("loading shaders...");
    var countResources = 0; //will be kept cause it'll be closure
    Utils.loadFile(THIS_FOLDER_PATH+"/vertex.shader", function (xmlhttp) {
        shaderVertexSource =  xmlhttp.responseText;
        countResources += 1; //closure created
        if (countResources == 3) {
            callback();
        }
    });
    Utils.loadFile(THIS_FOLDER_PATH+"/fragment.shader", function (xmlhttp) {
        shaderFragmentSource = xmlhttp.responseText;
        countResources += 1;
        if (countResources == 3) {
            callback();
        }
    });

    cubeTexture = Utils.loadTexture(THIS_FOLDER_PATH+"/bttf.jpg", function () {
      
        
            framebuffer = GL.createFramebuffer();
            GL.bindFramebuffer(GL.FRAMEBUFFER, framebuffer);

            renderbuffer = GL.createRenderbuffer();
            GL.bindRenderbuffer(GL.RENDERBUFFER, renderbuffer);
            GL.renderbufferStorage(GL.RENDERBUFFER, GL.DEPTH_COMPONENT16, 512, 512);

            rttTexture = GL.createTexture();
            GL.bindTexture(GL.TEXTURE_2D, rttTexture);
            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
            GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, 512, 512, 0, GL.RGBA, GL.UNSIGNED_BYTE, null);

            GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, rttTexture, 0);
            GL.framebufferRenderbuffer(GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.RENDERBUFFER, renderbuffer);

            GL.bindTexture(GL.TEXTURE_2D, null);
            GL.bindRenderbuffer(GL.RENDERBUFFER, null);
            GL.bindFramebuffer(GL.FRAMEBUFFER, null);

            countResources += 1;
            if (countResources != 3) {
                callback = function () { }
            }
    }, callback);

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

    DELTA.x = (e.clientX - mousePosition.x) * 2 * Math.PI / CANVAS.width/2,
    DELTA.y = (e.clientY - mousePosition.y) * 2 * Math.PI / CANVAS.height/2
    ;

    THETA += DELTA.x ;
    PHI += DELTA.y ;
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

function pushMatrix(m,type) {
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