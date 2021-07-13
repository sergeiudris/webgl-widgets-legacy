
(function (obj) {

    var THIS_FOLDER_PATH = ".";


    var canvas,
        gl = null,
        mvMatrix = mat4.create(),
        mvMatrixStack = [],
        pMatrix = mat4.create(),
        shaderProgram,

        moonVertexPositionBuffer,
        moonVertexIndexBuffer,
        moonVertexTextureCoordBuffer,
        moonVertexNormalBuffer,

        cubeVertexPositionBuffer,
        cubeVertexIndexBuffer,
        cubeVertexTextureCoordBuffer,
        cubeVertexNormalBuffer,

        rotationDegreesPyramid = 0,// bad practice
        rotationDegreesCube = 0, // bad practice,
        lastTime = 0,
        animationFrameID = -1,
        neheTexture,
        xRotation = 0,
        xSpeed = 0,
        yRotation = 0,
        ySpeed = 0,
        zRotation = 0,
        cubeAngle = 0,
        moonAngle = 180,
        moonTexture,
        crateTexture,
        z = -20.0,
        filter = 0, // int varying from 0 to 2 whic filter is used (x,y,z),
        texturesArr = [],
        currentlyPressedKeys = {},
        checkBoxLighting = document.getElementById("lighting"),
        checkBoxBlending = document.getElementById("blending"),
        alpha = document.getElementById("alpha"),
        ambientR = document.getElementById("ambientR"),
        ambientG = document.getElementById("ambientG"),
        ambientB = document.getElementById("ambientB"),
        lightPositionX = document.getElementById("lightPositionX"),
        lightPositionY = document.getElementById("lightPositionY"),
        lightPositionZ = document.getElementById("lightPositionZ"),
        pointLightingR = document.getElementById("pointLightingR"),
        pointLightingG = document.getElementById("pointLightingG"),
        pointLightingB = document.getElementById("pointLightingB"),


        moonRotationMatrix = mat4.create(),
        mouseDown = false,
        lastMouseX = null,
        lastMouseY = null,

        isRotating = true;


    ;



    function start() {

        canvas = document.getElementById("canvas");
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;



        initGL(canvas);
        initShaders();
        initBuffers();
        initTexture().then(function (imgs) {
            mat4.identity(moonRotationMatrix);


            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.enable(gl.DEPTH_TEST);

            addEventListeners(canvas);
            document.onkeydown = handleKeyDown;
            document.onkeyup = handleKeyUp;
            checkBoxLighting.checked = false;
            checkBoxBlending.checked = false;
            alpha.value = "1",
                ambientR.value = "0.3";
            ambientG.value = "0.3";
            ambientB.value = "0.3",
                lightPositionX.value = "0.0";
            lightPositionY.value = "0.0";
            lightPositionZ.value = "-20.0";
            pointLightingR.value = "0.8";
            pointLightingG.value = "0.8";
            pointLightingB.value = "0.8";

            tick();
        });


    }


    function drawScene() {

        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix); // persprective matrix


        var blending = checkBoxBlending.checked;

        if (blending) {
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE); //source fragment is the one we are drawing now, destination - the one that already in the frame buffer
            //source factor, destination factor
            gl.enable(gl.BLEND);
            gl.disable(gl.DEPTH_TEST);
        } else {
            gl.disable(gl.BLEND);
            gl.enable(gl.DEPTH_TEST);
        }
        gl.uniform1f(shaderProgram.alphaUniform, parseFloat(alpha.value));

        var lighting = checkBoxLighting.checked;
        gl.uniform1i(shaderProgram.useLightingUniform, lighting);
        if (lighting) {
            gl.uniform3f(
                shaderProgram.ambientColorUniform,
                parseFloat(ambientR.value),
                parseFloat(ambientG.value),
                parseFloat(ambientB.value)
            );

            gl.uniform3f(
                shaderProgram.pointLightingLocationUniform,
                parseFloat(lightPositionX.value),
                parseFloat(lightPositionY.value),
                parseFloat(lightPositionZ.value)
            );

            gl.uniform3f(
                shaderProgram.pointLightingColorUniform,
                parseFloat(pointLightingR.value),
                parseFloat(pointLightingG.value),
                parseFloat(pointLightingB.value)
            );

        }


        mat4.identity(mvMatrix); //model-view matrix to represent the current move-rotate state

        mat4.translate(mvMatrix, [0.0, 0.0, z]); // multiple the given matrix with the paramter matrix

        mat4.multiply(mvMatrix, moonRotationMatrix);





        mat4.rotate(mvMatrix, degreesToRadians(xRotation), [1, 0, 0]);
        mat4.rotate(mvMatrix, degreesToRadians(yRotation), [0, 1, 0]);
        //mat4.rotate(mvMatrix, degreesToRadians(zRotation),[0,0,1]);

        mvPushMatrix();
        mat4.rotate(mvMatrix, degreesToRadians(moonAngle), [0.0, 1.0, 0.0]);
        mat4.translate(mvMatrix, [5.0, 0.0, 0.0]);



        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, moonTexture);
        gl.uniform1i(shaderProgram.samplerUniform, 0);


        gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, moonVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexTextureCoordBuffer);
        gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, moonVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);


        gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, moonVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);


        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, moonVertexIndexBuffer);
        setMatrixUniforms();// push over the mv and p matrices to take inot account last changes
        gl.drawElements(gl.TRIANGLES, moonVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

        mvPopMatrix();

        mvPushMatrix();
        mat4.rotate(mvMatrix, degreesToRadians(cubeAngle), [0.0, 1.0, 0.0]);
        mat4.translate(mvMatrix, [5.0, 0.0, 0.0]);

        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, cubeVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
        gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, crateTexture);
        gl.uniform1i(shaderProgram.samplerUniform, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        mvPopMatrix();

    }

    function initTexture() {

        return Promise.all([new Promise(function (resolve, reject) {
            var image = new Image()
                ;
            moonTexture = gl.createTexture();
            moonTexture.image = image;

            image.onload = function () {
                handleLoadedTexture(moonTexture);
                resolve(image);
            }
            image.src = THIS_FOLDER_PATH + "/moon.gif";
        }), new Promise(function (resolve, reject) {
            var image = new Image();
            crateTexture = gl.createTexture();
            crateTexture.image = image;

            image.onload = function () {
                handleLoadedTexture(crateTexture);
                resolve(image);
            }
            image.src = THIS_FOLDER_PATH + "/crate.gif";
        })]);
    }

    function handleLoadedTexture(texture) {

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        //gl.bindTexture(gl.TEXTURE_2D, textures[0]);
        //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textures[0].image);
        //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

        //gl.bindTexture(gl.TEXTURE_2D, textures[1]);
        //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textures[1].image);
        //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);

        gl.bindTexture(gl.TEXTURE_2D, null);
    }



    function animate() {
        var timeNow = new Date().getTime();
        if (lastTime != 0) {
            var elapsed = timeNow - lastTime;

            xRotation += (xSpeed * elapsed) / 1000.0;
            yRotation += (ySpeed * elapsed) / 1000.0;
            zRotation += (3 * elapsed) / 1000.0;

            if (isRotating) {
                moonAngle += 0.05 * elapsed;
                cubeAngle += 0.05 * elapsed;
            }
        }
        lastTime = timeNow;
    }


    function initGL(canvas) {
        try {
            gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
        } catch (e) { }

        if (!gl) {
            console.log("Unable to initialize webgl");
        }

    }
    function mvPushMatrix() {
        var copy = mat4.create();
        mat4.set(mvMatrix, copy);
        mvMatrixStack.push(copy);
    }
    function mvPopMatrix() {
        if (mvMatrixStack.length == 0) {
            console.log("Invalid popMatrix! OutFoBounds exception is comming, bro");
        }
        mvMatrix = mvMatrixStack.pop();
    }

    function degreesToRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    function initShaders() {
        var fragmentShader = getShader(gl, "shader-fsTexture"),
            vertexShader = getShader(gl, "shader-vsTexture");

        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            console.log("couldn't initialize shaders");
        }

        gl.useProgram(shaderProgram);

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition"); // not a predefined attribute
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

        shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
        gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

        shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
        gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

        shaderProgram.alphaUniform = gl.getUniformLocation(shaderProgram, "uAlpha");
        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
        shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
        shaderProgram.pointLightingColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingColor");
        shaderProgram.pointLightingLocationUniform = gl.getUniformLocation(shaderProgram, "uPointLightingLocation");
        shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
        shaderProgram.useLightingUniform = gl.getUniformLocation(shaderProgram, "uUseLighting");
    }

    function getShader(gl, id) {
        var shaderScript = document.getElementById(id),
            str = "",
            k,
            shader
            ;

        if (!shaderScript) {
            return null;
        }

        k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }

        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.log(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;

    }
    function setMatrixUniforms() {
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);

        var normalMatrix = mat3.create();
        mat4.toInverseMat3(mvMatrix, normalMatrix);
        mat3.transpose(normalMatrix);
        gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
    }



    function initBuffers() {


        var latitudeBands = 30;
        var longitudeBands = 30;
        var radius = 2;

        var vertexPositionData = [];
        var normalData = [];
        var textureCoordData = [];
        var indexData = [];

        for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {

            var theta = latNumber * Math.PI / latitudeBands;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);

            for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {

                var phi = longNumber * 2 * Math.PI / longitudeBands;
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);

                var x = cosPhi * sinTheta;
                var y = cosTheta;
                var z = sinPhi * sinTheta;
                var u = 1 - (longNumber / longitudeBands);
                var v = 1 - (latNumber / latitudeBands);

                normalData.push(x);
                normalData.push(y);
                normalData.push(z);
                textureCoordData.push(u);
                textureCoordData.push(v);

                vertexPositionData.push(radius * x);
                vertexPositionData.push(radius * y);
                vertexPositionData.push(radius * z);
            }

        }

        for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
            for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
                var first = (latNumber * (longitudeBands + 1)) + longNumber;
                var second = first + longitudeBands + 1;
                indexData.push(first);
                indexData.push(second);
                indexData.push(first + 1);

                indexData.push(second);
                indexData.push(second + 1);
                indexData.push(first + 1);
            }
        }
        moonVertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
        moonVertexNormalBuffer.itemSize = 3;
        moonVertexNormalBuffer.numItems = normalData.length / 3;

        moonVertexTextureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexTextureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
        moonVertexTextureCoordBuffer.itemSize = 2;
        moonVertexTextureCoordBuffer.numItems = textureCoordData.length / 2;

        moonVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
        moonVertexPositionBuffer.itemSize = 3;
        moonVertexPositionBuffer.numItems = vertexPositionData.length / 3;

        moonVertexIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, moonVertexIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
        moonVertexIndexBuffer.itemSize = 1;
        moonVertexIndexBuffer.numItems = indexData.length;



        cubeVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
        var vertices = [
            // Front face
            -1.0, -1.0, 1.0,
            1.0, -1.0, 1.0,
            1.0, 1.0, 1.0,
            -1.0, 1.0, 1.0,

            // Back face
            -1.0, -1.0, -1.0,
            -1.0, 1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, -1.0, -1.0,

            // Top face
            -1.0, 1.0, -1.0,
            -1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, -1.0,

            // Bottom face
            -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            1.0, -1.0, 1.0,
            -1.0, -1.0, 1.0,

            // Right face
            1.0, -1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, 1.0, 1.0,
            1.0, -1.0, 1.0,

            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0, 1.0,
            -1.0, 1.0, 1.0,
            -1.0, 1.0, -1.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        cubeVertexPositionBuffer.itemSize = 3;
        cubeVertexPositionBuffer.numItems = 24;

        cubeVertexTextureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
        var textureCoords = [
            // Front face
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,

            // Back face
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
            0.0, 0.0,

            // Top face
            0.0, 1.0,
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,

            // Bottom face
            1.0, 1.0,
            0.0, 1.0,
            0.0, 0.0,
            1.0, 0.0,

            // Right face
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
            0.0, 0.0,

            // Left face
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0
        ];

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
        cubeVertexTextureCoordBuffer.itemSize = 2;
        cubeVertexTextureCoordBuffer.numItems = 24;


        cubeVertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
        var vertexNormals = [
            // Front face
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,

            // Back face
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,

            // Top face
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,

            // Bottom face
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,

            // Right face
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,

            // Left face
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
        cubeVertexNormalBuffer.itemSize = 3;
        cubeVertexNormalBuffer.numItems = 24;



        cubeVertexIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
        var cubeVertexIndices = [
            0, 1, 2, 0, 2, 3,    // Front face
            4, 5, 6, 4, 6, 7,    // Back face
            8, 9, 10, 8, 10, 11,  // Top face
            12, 13, 14, 12, 14, 15, // Bottom face
            16, 17, 18, 16, 18, 19, // Right face
            20, 21, 22, 20, 22, 23  // Left face
        ]
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
        cubeVertexIndexBuffer.itemSize = 1;
        cubeVertexIndexBuffer.numItems = 36;


    }

    function tick() {

        animationFrameID = requestAnimationFrame(tick);
        handleKeys();
        drawScene();
        animate();
    }

    function handleKeys() {
        if (currentlyPressedKeys[33]) {
            // Page Up
            z -= 0.05;
        }
        if (currentlyPressedKeys[34]) {
            // Page Down
            z += 0.05;
        }
        if (currentlyPressedKeys[37]) {
            // Left cursor key
            ySpeed -= 1;
        }
        if (currentlyPressedKeys[39]) {
            // Right cursor key
            ySpeed += 1;
        }
        if (currentlyPressedKeys[38]) {
            // Up cursor key
            xSpeed -= 1;
        }
        if (currentlyPressedKeys[40]) {
            // Down cursor key
            xSpeed += 1;
        }
    }


    function addEventListeners(target) {
        target.addEventListener("dblclick",
            function (e) {

                if (animationFrameID != -1) {
                    console.log("cancel")
                    cancelAnimationFrame(animationFrameID);
                    animationFrameID = -1;
                    lastTime = 0;
                } else {
                    7
                    console.log("request")
                    animationFrameID = requestAnimationFrame(tick);
                }
                console.log(animationFrameID);
            },
            false);

        target.addEventListener("mousedown", handleMouseDown, false);
        document.addEventListener("mouseup", handleMouseUp, false);
        document.addEventListener("mousemove", handleMouseMove, false);
    }



    function handleKeyDown(event) {
        currentlyPressedKeys[event.keyCode] = true;

        if (String.fromCharCode(event.keyCode) == "F") {
            filter += 1;
            if (filter == 3) {
                filter = 0;
            }
        } else if (String.fromCharCode(event.keyCode) == "S") {
            xSpeed = 0;
            ySpeed = 0;
            isRotating = !isRotating;

        }
    }
    function handleKeyUp(event) {
        currentlyPressedKeys[event.keyCode] = false;
    }

    function handleMouseDown(event) {

        mouseDown = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    }


    function handleMouseUp(event) {
        mouseDown = false;
    }
    function handleMouseMove(event) {

        if (!mouseDown) {
            return;
        }
        var newX = event.clientX;
        var newY = event.clientY;

        var deltaX = newX - lastMouseX;
        var newRotationMatrix = mat4.create();
        mat4.identity(newRotationMatrix);
        mat4.rotate(newRotationMatrix, degreesToRadians(deltaX / 10), [0, 1, 0]);

        var deltaY = newY - lastMouseY;
        mat4.rotate(newRotationMatrix, degreesToRadians(deltaY / 10), [1, 0, 0]);

        mat4.multiply(newRotationMatrix, moonRotationMatrix, moonRotationMatrix);

        lastMouseX = newX;
        lastMouseY = newY;

    }






    obj.startC = start;

})(window);

window.startC();
