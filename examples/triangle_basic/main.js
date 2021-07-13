

var THIS_FOLDER_PATH = ".";
    ;

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
         uniforms:  []
    },
    triangle
   
;

function main() {
    console.log("main");
    loadShaders(function () { start();});
};


function start() {
    console.log("entered start");
   

    CANVAS = document.getElementById("canvas");

    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;

    initGL();
    initProgram();
    createWorld();

    drawScene();
};

function drawScene() {
   
    GL.clear(GL.COLOR_BUFFER_BIT);
    triangle.draw(GL, program);
   
    GL.flush();

    window.requestAnimationFrame(drawScene);
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
    program = Shadering.createProgram(GL, shaderVertexSource, shaderFragmentSource, programDictionary);
    GL.linkProgram(program);
    GL.useProgram(program);
};


var x = {};


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
