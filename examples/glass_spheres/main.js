
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
        uniforms: ["uPMatrix", "uMMatrix", "uVMatrix", "uSampler", "uCamera", "uCameraFrag", "uHighlight", "uViewingCoeffVS", "uViewingCoeffFS", "uAspectRatio"]
    },
    //quad,
    sphere,
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
    mousePosition = { x: 0, y: 0 },
    animationFrameID = -1,
    THETA = 0,
    PHI = 0,
    AMORTIZATION = 0.95,
    DELTA = { x: 0, y: 0 },
    //  videoTexture,
    video = document.getElementById("bunny_video"),

    CAMERAPOSITION = [0, 0, -6],
    RAYVECTOR = [0.0, 0.0, 0.0],
    RAYINTERSECT = false,
    SPHEREINTERSECTED = -1,
    Spheres = [],


    ROTATEAUTO = false,
    CONSIGNANGLE = 0,


    VIEWINGVIDEO = false, // true if user is viewing the video
    VIEWINGVIDEOINDEX = 0,
    VIEWINGVIDEO_T = 0,
    
    FPSTime = 0,
    FPSFrames = 0,
    domCounter = document.getElementById("fps_counter")
    

;

function main() {
    console.log("main");
    loadShaders(start);
};


function start() {
    try{
        console.log("entered start");
        //document.getElementById("fs").value += "entered start";

        CANVAS = document.getElementById("canvas");

        CANVAS.width = document.getElementsByTagName("body")[0].clientWidth*0.9;
        CANVAS.height = 500;

        addEventListeners(CANVAS);


        pMatrix = Lib.getProjection4(40, CANVAS.width / CANVAS.height, 1, 100);
        mMatrix = Lib.getIdentity4();
        vMatrix = Lib.getIdentity4();

        initGL();
        initProgram();

        GL.activeTexture(GL.TEXTURE0);
   

        GL.uniform1i(program.uSampler, 0);
        createWorld();

        CAMERAPOSITION = [0.0, 0.5, -8.0];
        GL.uniform3fv(program.uCamera, CAMERAPOSITION);
        GL.uniform3fv(program.uCameraFrag, CAMERAPOSITION);//same as above but for the fragmentshader

        drawScene();
    } catch (e) {
        console.log(e);
       // document.getElementById("fs").value +=  (e.message);
    }
};

var previousTime = 0;

function drawScene(time) {
   // document.getElementById("fs").value += "drawing scene"
    if (!isDragging) {
        DELTA.x *= AMORTIZATION, DELTA.y *= AMORTIZATION;
        THETA += DELTA.x;
        PHI += DELTA.y;
      //  THETA *= 0.9;
        PHI *= 0.95;
    }
    // pushMatrix(mMatrix, "m");
    Lib.setIdentity4(vMatrix);
    animate();
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    GL.uniformMatrix4fv(program.uPMatrix, false, pMatrix);
    GL.uniformMatrix4fv(program.uVMatrix, false, vMatrix);
 


    //if (video.currentTime == video.duration) {
    //    video.currentTime = 0;
    //}
    //if (video.currentTime>0 && video.currentTime != previousTime) {
    //    refreshTexture();
    //    previousTime = video.currentTime;
    //}
    
    Spheres.map(function (s,sphereIndex) {

        if (sphereIndex === VIEWINGVIDEOINDEX) { // process transition between menu video viewing mode
            GL.uniform1f(program.uViewingCoeffVS, VIEWINGVIDEO_T);
            GL.uniform1f(program.uViewingCoeffFS, VIEWINGVIDEO_T);

            if (VIEWINGVIDEO && VIEWINGVIDEO_T < 1) VIEWINGVIDEO_T += 0.05;
            if (!VIEWINGVIDEO && VIEWINGVIDEO_T > 0) VIEWINGVIDEO_T -= 0.05;


            GL.uniform1f(program.uAspectRatio, (s.video.videoHeight * CANVAS.width) / (CANVAS.height * s.video.videoWidth));

        }


        GL.uniform1f(program.uHighlight, (RAYINTERSECT && SPHEREINTERSECTED === sphereIndex )?1.5:1); // if the sphere is under the cursor highlight it

        Lib.setIdentity4(s.matrix);
        Lib.translateX4(s.matrix, s.radius * Math.cos(s.angle + THETA));
        Lib.translateZ4(s.matrix, s.radius * Math.sin(s.angle + THETA));

        GL.uniformMatrix4fv(program.uMMatrix, false, s.matrix);
        GL.bindTexture(GL.TEXTURE_2D, s.videoTexture);

        if (s.video.currentTime > 0 && s.video.currentTime !== s.oldTime) {
            s.oldTime = s.video.currentTime;
            GL.texImage2D(GL.TEXTURE_2D,0,GL.RGBA,GL.RGBA, GL.UNSIGNED_BYTE, s.video);
        }
        sphere.draw(GL, program);

        if (sphereIndex === VIEWINGVIDEOINDEX) {
            GL.uniform1f(program.uViewingCoeffVS, 0);
            GL.uniform1f(program.uViewingCoeffFS, 0);
        }
    });


    
   // popMatrix("m");

    GL.flush();

    animationFrameID = window.requestAnimationFrame(drawScene);
};

function animate() {
    var timeNow = new Date().getTime(),
        dt
        ;
         dt = timeNow - lastTime;
    if (lastTime != 0) {
        //Lib.rotateX4(mMatrix, dt * 0.0003);
        //Lib.rotateZ4(mMatrix, dt * 0.0005);
        //Lib.rotateY4(mMatrix, dt * 0.0004);
        Lib.translateZ4(vMatrix, CAMERAPOSITION[2]);
   //     Lib.translateX4(vMatrix, CAMERAPOSITION[0]);
        Lib.translateY4(vMatrix, CAMERAPOSITION[1]);
        Lib.rotateX4(vMatrix, Math.PI / 6 + PHI);
        //Lib.rotateY4(mMatrix, THETA);

        if (ROTATEAUTO) {
            if (Math.abs(CONSIGNANGLE - THETA) < 0.05) {
                ROTATEAUTO = false;
            } else {
                THETA += 0.1 * (CONSIGNANGLE - THETA);
            }
        }

    }
    lastTime = timeNow;
    
     FPSTime += dt;
    FPSFrames++;
    if (FPSTime > 1000) {
        
        var fps = 1000 * FPSFrames / FPSTime;

        domCounter.innerHTML = Math.round(fps) + " FPS";

        FPSTime = FPSFrames = 0;
       
    }
};
function refreshTexture() {
    GL.bindTexture(GL.TEXTURE_2D, videoTexture);
    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, video);
}

function createWorld() {

    //quad = new Quad(GL,program);
    sphere = new Sphere(GL, program);

    var radius = 3, // of a circle
    n = 6
    ;
    for (var i = 0; i < n; i++) {

        var angle =( i +0.25)* (2 * Math.PI / n); // plus 0.25 is a small offset at the start
        var matrix = Lib.getIdentity4();
        Lib.translateX4(matrix, radius * Math.cos(angle));
        Lib.translateZ4(matrix, radius * Math.sin(angle));

        var videoElement = document.createElement("video");
        videoElement.setAttribute("autoplay", "true");
        videoElement.setAttribute("loop", "true");
        if (i != n - 1) {
            videoElement.src = THIS_FOLDER_PATH+"/baggy" + [i] + ".ogv";
        } else { 
                videoElement.src = THIS_FOLDER_PATH+"/video.ogv";
        }

        var videoTexture = GL.createTexture();
        GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
        GL.bindTexture(GL.TEXTURE_2D, videoTexture);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);

        Spheres.push({
            angle: angle,
            matrix: matrix,
            video: videoElement,
            videoTexture: videoTexture,
            oldTime: 0,
            radius:radius
        });
    }

};



function initGL() {
    try {
        GL = CANVAS.getContext("webgl", { antialias: true }) || CANVAS.getContext("experimental-webgl", { antialias: false });
        
        GL.viewport(0.0, 0.0, CANVAS.width, CANVAS.height);// 

        GL.clearColor(15 / 255, 50 / 255, 83 / 255, 1.0);
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

    var boundingRect = CANVAS.getBoundingClientRect(),
       offsetY = boundingRect.left || 0,
       offsetX = boundingRect.top || 0,
       mouseX = 0,
       mouseY = 0
    ;

    if (e.targetTouches && (e.targetTouches.length >= 1)) {
       
        mouseX = e.targetTouches[0].clientX- offsetX;
        mouseY = e.targetTouches[0].clientY - offsetY;
       
    } else {

        mouseX = e.clientX - offsetX;
        mouseY = e.clientY - offsetY;

       
    }
    var txtarea = document.getElementById("fs");
    Spheres.map(function (s, i) {
       // txtarea.value += s.video.currentTime + "\n";
    });


    isDragging = true;
    mousePosition.x =mouseX;
    mousePosition.y = mouseY;
    e.preventDefault();

  
    return false;
};

function mouseUp(e) {
    isDragging = false;
};

function mouseMove(e) {

    var boundingRect = CANVAS.getBoundingClientRect(),
        offsetY = boundingRect.left || 0,
        offsetX = boundingRect.top || 0,
          mouseX = 0,
       mouseY = 0
        ;

        if (e.targetTouches && (e.targetTouches.length >= 1)) {

            mouseX = e.targetTouches[0].clientX - offsetX;
            mouseY = e.targetTouches[0].clientY - offsetY;

        } else {

            mouseX = e.clientX- offsetX;
            mouseY = e.clientY- offsetY;


        }
   // document.getElementById("vs").value = "x: " + mouseX+ ", y: " + mouseY;
   
    //document.getElementById("fs").value = SPHEREINTERSECTED;
    if (!isDragging) {
        //launch ray

        // Xn,Yn : normalized coordinates (between -1 and 1);
        var Xn = 2 * (mouseX / CANVAS.width) - 1;
        var Yn = 2 * (mouseY / CANVAS.height) - 1;

        //if we invert the projection matrix, we can retrieve these relations :
        RAYVECTOR[0] = -(1 / pMatrix[0]) * Xn;
        RAYVECTOR[1] = (1 / pMatrix[5]) * Yn;
        RAYVECTOR[2] = 1;

        Lib.normalize(RAYVECTOR);

        RAYINTERSECT = false;
        SPHEREINTERSECTED = -1;
        var k2Intersect = 1e12; // intersection distanse one times ten to the 12th power

        //compute the intersection of(CAMERAPOSITION, RAYVECTOR) with the 5 sppheres
        Spheres.map(function (s, sphereIndex) {

            //compute the position of the center of the sphere in the view frame of reference
            var centerScene = Lib.getTranslation(s.matrix);
            var centerView = Lib.multVecMat4(vMatrix, centerScene);

            //compute the distance between the ray and the TODO

            var APcrossRay = Lib.cross(centerView, RAYVECTOR); 
            var d2 = Lib.squareNorm(APcrossRay); //the distancce d between point P and the ray (A,u) is d = || AP x(*?) u||

            if (d2 < 1) { // each sphere has a radius of 1 , so radius*radius = 1
                var k2 = Lib.squareNorm(centerView);
                if (k2 < k2Intersect) {
                    //this is the nearest intersection
                    k2Intersect = k2;
                    RAYINTERSECT = true;
                    SPHEREINTERSECTED = sphereIndex;
                }
            }

        });


        return false;
    }//end ray launch

    DELTA.x =- (mouseX - mousePosition.x) * 2 * Math.PI / CANVAS.width / 2,
    DELTA.y = (mouseY - mousePosition.y) * 2 * Math.PI / CANVAS.height / 2
    ;

    THETA += DELTA.x;
    PHI += DELTA.y;
    mousePosition.x = mouseX;
    mousePosition.y = mouseY;

    e.preventDefault();

};

function mouseClick(e) {

    if (VIEWINGVIDEO) {
        VIEWINGVIDEO = false;
    } else {

        if (!RAYINTERSECT) return false;

        ROTATEAUTO = true;
        CONSIGNANGLE = Math.PI / 2 - (SPHEREINTERSECTED + 0.25) * 2 * Math.PI / 6;

        //clamp CONSIGNANGLE between -PI and +PI

        while (CONSIGNANGLE - THETA < -Math.PI) CONSIGNANGLE += 2 * Math.PI;
        while (CONSIGNANGLE - THETA > Math.PI) CONSIGNANGLE -= 2 * Math.PI;

        VIEWINGVIDEOINDEX = SPHEREINTERSECTED;
        VIEWINGVIDEO = true;
    }
    
    
}



function addEventListeners(el) {
    el.addEventListener("dblclick", function (e) {

        if (animationFrameID != -1) {
            window.cancelAnimationFrame(animationFrameID);
            console.log("canceled animation frame");
            animationFrameID = -1;
            lastTime = 0;
        } else {
            //   animationFrameID = requestAnimationFrame(drawScene);
            drawScene();
            console.log("requested animation frame")
        }
    }, false);

    el.addEventListener("mousedown", mouseDown, false);
    el.addEventListener("touchstart", mouseDown, false);
    el.addEventListener("mouseup", mouseUp, false);
    el.addEventListener("mouseout", mouseUp, false);
    el.addEventListener("touchend", mouseUp, false);
    el.addEventListener("mousemove", mouseMove, false);
    el.addEventListener("touchmove", mouseMove, false);
    el.addEventListener("click", mouseClick, false);
   
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