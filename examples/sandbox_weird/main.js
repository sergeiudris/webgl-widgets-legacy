
var THIS_FOLDER_PATH = ".";
/*
GLOBAL VARIABLES
*/
var CANVAS,
    GL,
    shaderVertexSource,
    shaderFragmentSource,
    shaderFragmentTextArea = document.getElementById("fs"),
    shaderVertexTextArea = document.getElementById("vs"),
    program,
    programDictionary = {
         attributes: ["aVertexPosition","aVertexColor"],
         uniforms:  ["uResolution", "uTime", "uMouse"]
    },
    triangle,
    animationFrameID,
    mousePosition = {x:0,y:0},
    CODEVIEW 
   
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


    CODEVIEW = CodeMirror.fromTextArea(shaderFragmentTextArea,
                                        {
                                            lineNumbers: true,
                                            matchBrackets: true,
                                            indentWithTabs: true,
                                            tabSize: 8,
                                            indentUnit: 8,
                                            mode: "text/x-glsl"//,
                                            //onChange: initProgram
                                        });

    for (var i = 0; i < CODEVIEW.lineCount() ; i++) {
        CODEVIEW.indentLine(i);
    };

    initGL();
    createWorld();
    initProgram();
   
    

    drawScene(0);
};

function drawScene(timestamp) {
  
    GL.clear(GL.COLOR_BUFFER_BIT);
    GL.uniform1f(program.uTime, timestamp * 0.001);
    GL.uniform2f(program.uResolution, CANVAS.width, CANVAS.height);
    GL.uniform2fv(program.uMouse, [mousePosition.x, mousePosition.y]);
    triangle.draw(GL, program);
   
    GL.flush();
    animationFrameID = window.requestAnimationFrame(drawScene);
    
};

function createWorld() {

    triangle = new Triangle(GL);
    
};

function initGL() {
    try{
        GL = CANVAS.getContext("webgl", { antialias: true }) || CANVAS.getContext("experimental-webgl", { antialias: false});
        GL.viewport(0.0, 0.0, CANVAS.width, CANVAS.height);// 
        GL.clearColor(0.0, 0.0, 0.0, 1.0);
      
    } catch (e) {
        alert("You are not webgl compatible :(");
        return false;
    }
};
function initProgram() {
    
    program = Shadering.createProgram(GL, shaderVertexTextArea.value, CODEVIEW ? CODEVIEW.getValue() : shaderFragmentTextArea.value, programDictionary);
  //  GL.linkProgram(program);
    GL.useProgram(program);
};





function loadShaders(callback) {
    console.log("loading shaders...");
    var countShaders = 0; //will be kept cause it'll be closure
    Utils.loadFile(THIS_FOLDER_PATH+"/vertex.shader", function (xmlhttp) {
        shaderVertexSource = xmlhttp.responseText;
        shaderVertexTextArea.value = shaderVertexSource;
        countShaders += 1; //closure created
        if (countShaders == 2) {
            callback();
        }
    });
    Utils.loadFile(THIS_FOLDER_PATH+"/fragment.shader", function (xmlhttp) {
        shaderFragmentSource = xmlhttp.responseText;
        shaderFragmentTextArea.value = shaderFragmentSource;
        countShaders += 1;
        if (countShaders == 2) {
            callback();
        }
    });
};

function addEventListeners(el) {
    el.addEventListener("dblclick", function (e) {

        if (animationFrameID != -1) {
            console.log("cancel")
            cancelAnimationFrame(animationFrameID);
            animationFrameID = -1;
            lastTime = 0;
        } else {

            console.log("request")
            animationFrameID = requestAnimationFrame(drawScene);
        }
        console.log(animationFrameID);
    }, false);

    document.addEventListener("mousemove", function (e) {
        mousePosition.x = e.clientX;
        mousePosition.y = e.clientY;
    }, false);

  //  shaderFragmentTextArea.addEventListener("keyup", initProgram, false);
    shaderVertexTextArea.addEventListener("keyup", initProgram, false);
};