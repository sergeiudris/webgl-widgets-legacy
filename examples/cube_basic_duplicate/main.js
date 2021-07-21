
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
         uniforms:  ["uPMatrix", "uMMatrix", "uVMatrix", "uGreyscality"]
    },
    cube,
    tetrahedron,
    matrixStack = {
        p: [],
        v: [],
        m: [],
        m2: [],
        mt:[]

    },
    mMatrixStack = [],
        pMatrix,
        mMatrix,
        m2Matrix,
        vMatrix,
        mTMatrix,
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
    m2Matrix = Lib.getIdentity4();
    mTMatrix = Lib.getIdentity4();
    vMatrix = Lib.getIdentity4();
    
  
    
    initGL();
    initProgram();
    createWorld();
    Lib.translateZ4(vMatrix, -6);

    //Lib.translateX4(mMatrix, 2);
   // Lib.translateX4(m2Matrix, -2);
    drawScene();
};

function drawScene(time) {

    if (!isDragging) {
        DELTA.x *= AMORTIZATION, DELTA.y *= AMORTIZATION;
        THETA += DELTA.x;
        PHI += DELTA.y;
    }
    pushMatrix(mMatrix, "m");
    pushMatrix(m2Matrix, "m2");
    animate();

    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
   
    GL.uniformMatrix4fv(program.uPMatrix, false, pMatrix);
    GL.uniformMatrix4fv(program.uVMatrix, false, vMatrix);
    GL.uniformMatrix4fv(program.uMMatrix, false, mMatrix);
    
    GL.uniform1f(program.uGreyscality, 1);
    cube.draw(GL, program);

    GL.uniformMatrix4fv(program.uMMatrix, false, m2Matrix);
    GL.uniform1f(program.uGreyscality, 0);
    cube.draw(GL, program);
    
    popMatrix("m");
    popMatrix("m2");

    GL.uniformMatrix4fv(program.uMMatrix, false, mTMatrix);
    GL.uniform1f(program.uGreyscality, 0);

    tetrahedron.draw(GL, program, 6, 0);
    GL.uniform1f(program.uGreyscality, 1);
    tetrahedron.draw(GL, program, 6, 12,true);

    GL.flush();

    animationFrameID = window.requestAnimationFrame(drawScene);
};

function createWorld() {

    cube = new Cube(GL);
    tetrahedron = new Tetrahedron(GL);
    
};

function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var dt = timeNow - lastTime;

        //Lib.rotateX4(mMatrix, dt * 0.0003);
        //Lib.rotateZ4(mMatrix, dt * 0.0005);
        //Lib.rotateY4(mMatrix, dt * 0.0004);
    
        //Lib.rotateX4(mMatrix, PHI);
        //Lib.rotateY4(mMatrix, THETA);

        //Lib.rotateX4(m2Matrix, -PHI);
        //Lib.rotateY4(m2Matrix, -THETA);

        var radius = 2; //half distance between the cube centers
        var posX = radius * Math.cos(PHI) * Math.cos(THETA);
        var posY = -radius * Math.sin(PHI);
        var posZ = -radius * Math.cos(PHI) * Math.sin(THETA);

     

        Lib.setPosition(mMatrix, posX, posY, posZ);
        Lib.setPosition(m2Matrix, -posX, -posY, -posZ);

        Lib.rotateZ4(mMatrix, -PHI);
        Lib.rotateZ4(m2Matrix, -PHI);

        Lib.rotateY4(mMatrix, THETA);
        Lib.rotateY4(m2Matrix, THETA);


        Lib.rotateX4(mTMatrix, dt * 0.0031);
        Lib.rotateZ4(mTMatrix, Math.cos(timeNow) * dt * 0.0022);
        Lib.rotateY4(mTMatrix, dt * -0.0034);

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

    DELTA.x = (e.clientX - mousePosition.x) * 2 * Math.PI / CANVAS.width,
    DELTA.y = (e.clientY - mousePosition.y) * 2 * Math.PI / CANVAS.height
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
        case "m2":
            m2Matrix = matrixStack[type].pop();
            break;
    }
}