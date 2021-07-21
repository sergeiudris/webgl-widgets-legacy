
var THIS_FOLDER_PATH = ".";

/*
GLOBAL VARIABLES
*/
var CANVAS,
    GL,
    shaderVertexSource,
    shaderFragmentSource,
    vSource,
    fSource,
    dragonJSONObject,
    program,
    floorProgram,
    programDictionary = {
         attributes: ["aVertexPosition","aUV"],
         uniforms:  ["uPMatrix", "uMMatrix", "uVMatrix", "uSampler"]
    },
    floorDictionary = {
         attributes: ["aVertexPosition"],
         uniforms:  ["uPMatrix", "uMMatrix", "uVMatrix"]
    },
    dragon,
    floor,
    matrixStack = {
        p: [],
        v: [],
        m: []
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
        DELTA = {x:0,y:0},
        dragonTexture,
        EXT
        ;


function main() {
    console.log("main");
    loadResources(start);
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
    dragonTexture = loadTexture(THIS_FOLDER_PATH+"/dragon.png");
    initProgram();
    GL.uniform1i(program.uSampler, 0);
    createWorld();
    Lib.translateZ4(vMatrix, -20);
    Lib.translateY4(vMatrix, -4);
    drawScene();
};

function drawScene(time) {

    if (!isDragging) {
        DELTA.x *= AMORTIZATION, DELTA.y *= AMORTIZATION;
        THETA += DELTA.x;
        PHI += DELTA.y;
    }
  
   // pushMatrix(mMatrix,"m");
    Lib.setIdentity4(mMatrix);
    animate();
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
   
   
    GL.useProgram(program);
    GL.uniformMatrix4fv(program.uPMatrix, false, pMatrix);
    GL.uniformMatrix4fv(program.uVMatrix, false, vMatrix);
    GL.uniformMatrix4fv(program.uMMatrix, false, mMatrix);

    
    if (dragonTexture.webglTexture) {
        GL.activeTexture(GL.TEXTURE0);
        GL.bindTexture(GL.TEXTURE_2D, dragonTexture.webglTexture);
    }
    

    dragon.draw(GL, program);
    
    GL.useProgram(floorProgram);
    GL.uniformMatrix4fv(floorProgram.uPMatrix, false, pMatrix);
    GL.uniformMatrix4fv(floorProgram.uVMatrix, false, vMatrix);
    GL.uniformMatrix4fv(floorProgram.uMMatrix, false, mMatrix);
    floor.draw(GL, floorProgram);
   
   // popMatrix("m");

    GL.flush();

    animationFrameID = window.requestAnimationFrame(drawScene);
};

function createWorld() {
    dragon = new Dragon(GL, dragonJSONObject);
    floor = new Floor(GL,10,10,0);
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
        GL = CANVAS.getContext("webgl", { antialias: true }) || CANVAS.getContext("experimental-webgl", { antialias: false });

        EXT = GL.getExtension("OES_element_index_uint") ||
        GL.getExtension("MOZ_OES_element_index_uint") ||
        GL.getExtension("WEBKIT_OES_element_index_uint");

        GL.viewport(0.0, 0.0, CANVAS.width, CANVAS.height); 

        GL.clearColor(0.0, 0.0, 0.0, 1.0);
       // GL.enable(GL.DEPTH_TEST);
      //  GL.depthFunc(GL.LEQUAL);
        GL.clearDepth(1.0);
        GL.blendFunc(GL.SRC_ALPHA, GL.ONE);
        GL.enable(GL.BLEND);
        GL.enable(GL.CULL_FACE);
        GL.frontFace(GL.CCW);
        //OPTIONAL
        GL.enable(GL.VERTEX_PROGRAM_POINT_SIZE);// enables setting point size, although works without it
      
    } catch (e) {
        alert("You are not webgl compatible :(");
        return false;
    }
};
function initProgram() {
    program = Shadering.createProgram(GL, shaderVertexSource, shaderFragmentSource, programDictionary);
    floorProgram = Shadering.createProgram(GL,vSource, fSource, floorDictionary);
    GL.useProgram(program);
};





function loadResources(callback) {
    console.log("loading shaders...");
    var countResources = 0; //will be kept cause it'll be closure
    var target = 5;
    Utils.loadFile(THIS_FOLDER_PATH+"/vertex.shader", function (xmlhttp) {
        shaderVertexSource =  xmlhttp.responseText;
        countResources += 1; //closure created
        if (countResources == target) {
            callback();
        }
    });
    Utils.loadFile(THIS_FOLDER_PATH+"/fragment.shader", function (xmlhttp) {
        shaderFragmentSource = xmlhttp.responseText;
        countResources += 1;
        if (countResources == target) {
            callback();
        }
    });
     Utils.loadFile(THIS_FOLDER_PATH+"/v.shader", function (xmlhttp) {
        vSource =  xmlhttp.responseText;
        countResources += 1; //closure created
        if (countResources == target) {
            callback();
        }
    });
    Utils.loadFile(THIS_FOLDER_PATH+"/f.shader", function (xmlhttp) {
        fSource = xmlhttp.responseText;
        countResources += 1;
        if (countResources == target) {
            callback();
        }
    });
    Utils.loadFile(THIS_FOLDER_PATH+"/dragonx.json", function (xmlhttp) {
        dragonJSONObject = JSON.parse(xmlhttp.responseText);
        countResources += 1;
        if (countResources == target) {
            callback();
        }
    });

};


function loadTexture(url) {

    var image = new Image();

    image.src = url;
    image.webglTexture = null;
    image.onload = function (e) {
        var texture = GL.createTexture();
        GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
        GL.bindTexture(GL.TEXTURE_2D, texture);
        GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, image);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST_MIPMAP_LINEAR);
        GL.generateMipmap(GL.TEXTURE_2D);
        image.webglTexture = texture;
    }
    return image;
}


function mouseDown(e) {

    isDragging = true;
    mousePosition.x = e.clientX;
    mousePosition.y = e.clientY;
    e.preventDefault();
    return false;
};

function mouseUp(e) {
    isDragging = false;
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