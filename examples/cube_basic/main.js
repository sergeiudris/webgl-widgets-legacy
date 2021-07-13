/**
 * Webgl widgets legacy code (http://serge-joggen.github.io/webgl-widgets-legacy)
 *
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
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
         attributes: ["aVertexPosition","aVertexColor"],
         uniforms:  ["uPMatrix", "uMMatrix", "uVMatrix"]
    },
    cube,
    matrixStack = {
        p: [],
        v: [],
        m: [],

    },
    mMatrixStack = [],
        pMatrix,
        mMatrix,
        vMatrix,
        lastTime = 0,
        isDragging = false,
        mousePosition = {x:0,y:0},
        animationFrameID = -1,
        THETA = 0,
        PHI = 0,
        AMORTIZATION = 0.95,
        DELTA = {x:0,y:0}
   
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
    
  
    
    initGL();
    initProgram();
    createWorld();
    Lib.translateZ4(vMatrix, -6);
    drawScene();
};

function drawScene(time) {

    if (!isDragging) {
        DELTA.x *= AMORTIZATION, DELTA.y *= AMORTIZATION;
        THETA += DELTA.x;
        PHI += DELTA.y;
    }
    pushMatrix(mMatrix,"m");
    animate();
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
   
    GL.uniformMatrix4fv(program.uPMatrix, false, pMatrix);
    GL.uniformMatrix4fv(program.uVMatrix, false, vMatrix);
    GL.uniformMatrix4fv(program.uMMatrix, false, mMatrix);

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

        GL.clearColor(0.0, 0.0, 0.0, 1.0);
        GL.enable(GL.DEPTH_TEST);
        GL.depthFunc(GL.LEQUAL);
        GL.clearDepth(1.0);
      
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
        shaderVertexSource =  xmlhttp.responseText;
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