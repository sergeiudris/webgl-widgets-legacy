
(function (obj) {

    var THIS_FOLDER_PATH = ".";

    var canvas,
        gl = null,
        mvMatrix = mat4.create(),
        mvMatrixStack = [],
        pMatrix = mat4.create(),
        perVertexProgram,
        perFragmentProgram,
        currentProgram,
        shaderProgram,

        moonVertexPositionBuffer,
        moonVertexIndexBuffer,
        moonVertexTextureCoordBuffer,
        moonVertexNormalBuffer,

        cubeVertexPositionBuffer,
        cubeVertexIndexBuffer,
        cubeVertexTextureCoordBuffer,
        cubeVertexNormalBuffer,

        laptopScreenVertexPositionBuffer,
        laptopScreenVertexNormalBuffer,
        laptopScreenVertexTextureCoordBuffer,

        laptopVertexPositionBuffer,
        laptopVertexNormalBuffer,
        laptopVertexTextureCoordBuffer,
        laptopVertexIndexBuffer,

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
        laptopAngle = 0,
        moonTexture,
        crateTexture,
        z = -5.0,
        filter = 0, // int varying from 0 to 2 whic filter is used (x,y,z),
        texturesArr = [],
        currentlyPressedKeys = {},
        checkBoxLighting = document.getElementById("lighting"),
        checkBoxBlending = document.getElementById("blending"),
        checkBoxPerFragment = document.getElementById("perFragment"),
        checkBoxTextures = document.getElementById("textures"),
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


        laptopRotationMatrix = mat4.create(),
        mouseDown = false,
        lastMouseX = null,
        lastMouseY = null,

        isRotating = true,

        rttFramebuffer,
        rttTexture,
        laptopScreenAspectRatio = 1.66


        ;



    function start() {

        canvas = document.getElementById("canvas");
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;



        initGL(canvas);
        initTextureFrameBuffer();
        initShaders();
        initBuffers();
        initTexture();
        loadLaptop();
        mat4.identity(laptopRotationMatrix);



        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);

        addEventListeners(canvas);
        document.onkeydown = handleKeyDown;
        document.onkeyup = handleKeyUp;
        checkBoxLighting.checked = false;
        checkBoxBlending.checked = false;
        checkBoxPerFragment.checked = false;
        checkBoxTextures.checked = false;
        alpha.value = "1",
            ambientR.value = "0.3";
        ambientG.value = "0.3";
        ambientB.value = "0.3",
            lightPositionX.value = "0.0";
        lightPositionY.value = "0.0";
        lightPositionZ.value = "-5.0";
        pointLightingR.value = "0.8";
        pointLightingG.value = "0.8";
        pointLightingB.value = "0.8";

        tick();

    }


    function drawScene() {

        gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer);
        drawSceneOnLaptopScreen();

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

        mat4.identity(mvMatrix);


        mvPushMatrix();

        mat4.translate(mvMatrix, [0, -0.4, -2.2]);
        mat4.rotate(mvMatrix, degreesToRadians(laptopAngle), [0, 1, 0]);
        mat4.rotate(mvMatrix, degreesToRadians(-90), [1, 0, 0]);
        mat4.multiply(mvMatrix, laptopRotationMatrix);
        gl.uniform1i(shaderProgram.showSpecularHighlightsUniform, true);
        gl.uniform3f(shaderProgram.pointLightingLocationUniform, -1, 2, -1);

        gl.uniform3f(shaderProgram.ambientLightingColorUniform, 0.2, 0.2, 0.2);
        gl.uniform3f(shaderProgram.pointLightingDiffuseColorUniform, 0.8, 0.8, 0.8);
        gl.uniform3f(shaderProgram.pointLightingSpecularColorUniform, 0.8, 0.8, 0.8);

        // The laptop body is quite shiny and has no texture.  It reflects lots of specular light
        gl.uniform3f(shaderProgram.materialAmbientColorUniform, 1.0, 1.0, 1.0);
        gl.uniform3f(shaderProgram.materialDiffuseColorUniform, 1.0, 1.0, 1.0);
        gl.uniform3f(shaderProgram.materialSpecularColorUniform, 1.5, 1.5, 1.5);
        gl.uniform1f(shaderProgram.materialShininessUniform, 5);
        gl.uniform3f(shaderProgram.materialEmissiveColorUniform, 0.0, 0.0, 0.0);
        gl.uniform1i(shaderProgram.useTexturesUniform, false);

        if (laptopVertexPositionBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, laptopVertexPositionBuffer);
            gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, laptopVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, laptopVertexTextureCoordBuffer);
            gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, laptopVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, laptopVertexNormalBuffer);
            gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, laptopVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, laptopVertexIndexBuffer);
            setMatrixUniforms();
            gl.drawElements(gl.TRIANGLES, laptopVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        }

        gl.uniform3f(shaderProgram.materialAmbientColorUniform, 0.0, 0.0, 0.0);
        gl.uniform3f(shaderProgram.materialDiffuseColorUniform, 0.0, 0.0, 0.0);
        gl.uniform3f(shaderProgram.materialSpecularColorUniform, 0.5, 0.5, 0.5);
        gl.uniform1f(shaderProgram.materialShininessUniform, 20);
        gl.uniform3f(shaderProgram.materialEmissiveColorUniform, 1.5, 1.5, 1.5);
        gl.uniform1i(shaderProgram.useTexturesUniform, true);

        gl.bindBuffer(gl.ARRAY_BUFFER, laptopScreenVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, laptopScreenVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, laptopScreenVertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, laptopScreenVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, laptopScreenVertexTextureCoordBuffer);
        gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, laptopScreenVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, rttTexture);
        gl.uniform1i(shaderProgram.samplerUniform, 0);

        setMatrixUniforms();
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, laptopScreenVertexPositionBuffer.numItems);

        mvPopMatrix();

    }

    function drawSceneOnLaptopScreen() {
        gl.viewport(0, 0, rttFramebuffer.width, rttFramebuffer.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mat4.perspective(45, laptopScreenAspectRatio, 0.1, 100.0, pMatrix);

        gl.uniform1i(shaderProgram.showSpecularHighlightsUniform, false);
        gl.uniform3f(shaderProgram.ambientLightingColorUniform, 0.2, 0.2, 0.2);
        gl.uniform3f(shaderProgram.pointLightingLocationUniform, 0, 0, -5);
        gl.uniform3f(shaderProgram.pointLightingDiffuseColorUniform, 0.8, 0.8, 0.8);

        gl.uniform1i(shaderProgram.showSpecularHighlightsUniform, false);
        gl.uniform1i(shaderProgram.useTexturesUniform, true);

        gl.uniform3f(shaderProgram.materialAmbientColorUniform, 1.0, 1.0, 1.0);
        gl.uniform3f(shaderProgram.materialDiffuseColorUniform, 1.0, 1.0, 1.0);
        gl.uniform3f(shaderProgram.materialSpecularColorUniform, 0.0, 0.0, 0.0);
        gl.uniform1f(shaderProgram.materialShininessUniform, 0);
        gl.uniform3f(shaderProgram.materialEmissiveColorUniform, 0.0, 0.0, 0.0);

        mat4.identity(mvMatrix);

        mat4.translate(mvMatrix, [0, 0, -5]);
        mat4.rotate(mvMatrix, degreesToRadians(30), [1, 0, 0]);

        mvPushMatrix();
        mat4.rotate(mvMatrix, degreesToRadians(moonAngle), [0, 1, 0]);
        mat4.translate(mvMatrix, [2, 0, 0]);
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
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, moonVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        mvPopMatrix();


        mvPushMatrix();
        mat4.rotate(mvMatrix, degreesToRadians(cubeAngle), [0, 1, 0]);
        mat4.translate(mvMatrix, [1.25, 0, 0]);
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

        gl.bindTexture(gl.TEXTURE_2D, rttTexture);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }




    function initTexture() {
        var image = new Image()
            ;
        moonTexture = gl.createTexture();
        moonTexture.image = image;

        image.onload = function () {
            handleLoadedTexture(moonTexture);
        }
        image.src = THIS_FOLDER_PATH + "/moon.gif";

        image = new Image();
        crateTexture = gl.createTexture();
        crateTexture.image = image;

        image.onload = function () {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

            //gl.bindTexture(gl.TEXTURE_2D, textures[0]);
            //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textures[0].image);
            //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

            //gl.bindTexture(gl.TEXTURE_2D, textures[1]);
            //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textures[1].image);
            //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

            gl.bindTexture(gl.TEXTURE_2D, crateTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, crateTexture.image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);

            gl.bindTexture(gl.TEXTURE_2D, null);
        }
        image.src = THIS_FOLDER_PATH + "/crate.gif";


    }
    function handleLoadedTexture(texture) {


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

                //laptopAngle -= 0.005 * elapsed;
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
        // perVertexProgram = createProgram("per-vertex-lighting-fs", "per-vertex-lighting-vs");
        shaderProgram = createProgram("per-fragment-lighting-fs", "per-fragment-lighting-vs");
        gl.useProgram(shaderProgram);
    }

    function createProgram(fragmentScriptID, vertexScriptID) {

        var fragmentShader = getShader(gl, fragmentScriptID),
            vertexShader = getShader(gl, vertexScriptID),
            program = gl.createProgram();

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.log("couldn't initialize shaders");
        }



        program.vertexPositionAttribute = gl.getAttribLocation(program, "aVertexPosition");
        gl.enableVertexAttribArray(program.vertexPositionAttribute);

        program.vertexNormalAttribute = gl.getAttribLocation(program, "aVertexNormal");
        gl.enableVertexAttribArray(program.vertexNormalAttribute);

        program.textureCoordAttribute = gl.getAttribLocation(program, "aTextureCoord");
        gl.enableVertexAttribArray(program.textureCoordAttribute);

        program.pMatrixUniform = gl.getUniformLocation(program, "uPMatrix");
        program.mvMatrixUniform = gl.getUniformLocation(program, "uMVMatrix");
        program.nMatrixUniform = gl.getUniformLocation(program, "uNMatrix");
        program.samplerUniform = gl.getUniformLocation(program, "uSampler");

        program.materialAmbientColorUniform = gl.getUniformLocation(program, "uMaterialAmbientColor");
        program.materialDiffuseColorUniform = gl.getUniformLocation(program, "uMaterialDiffuseColor");
        program.materialSpecularColorUniform = gl.getUniformLocation(program, "uMaterialSpecularColor");
        program.materialShininessUniform = gl.getUniformLocation(program, "uMaterialShininess");
        program.materialEmissiveColorUniform = gl.getUniformLocation(program, "uMaterialEmissiveColor");
        program.showSpecularHighlightsUniform = gl.getUniformLocation(program, "uShowSpecularHighlights");
        program.useTexturesUniform = gl.getUniformLocation(program, "uUseTextures");
        program.ambientLightingColorUniform = gl.getUniformLocation(program, "uAmbientLightingColor");
        program.pointLightingLocationUniform = gl.getUniformLocation(program, "uPointLightingLocation");
        program.pointLightingSpecularColorUniform = gl.getUniformLocation(program, "uPointLightingSpecularColor");
        program.pointLightingDiffuseColorUniform = gl.getUniformLocation(program, "uPointLightingDiffuseColor");

        return program;
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
        var radius = 1;

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


        laptopScreenVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, laptopScreenVertexPositionBuffer);
        vertices = [
            0.580687, 0.659, 0.813106,
            -0.580687, 0.659, 0.813107,
            0.580687, 0.472, 0.113121,
            -0.580687, 0.472, 0.113121,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        laptopScreenVertexPositionBuffer.itemSize = 3;
        laptopScreenVertexPositionBuffer.numItems = 4;

        laptopScreenVertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, laptopScreenVertexNormalBuffer);
        var vertexNormals = [
            0.000000, -0.965926, 0.258819,
            0.000000, -0.965926, 0.258819,
            0.000000, -0.965926, 0.258819,
            0.000000, -0.965926, 0.258819,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
        laptopScreenVertexNormalBuffer.itemSize = 3;
        laptopScreenVertexNormalBuffer.numItems = 4;

        laptopScreenVertexTextureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, laptopScreenVertexTextureCoordBuffer);
        var textureCoords = [
            1.0, 1.0,
            0.0, 1.0,
            1.0, 0.0,
            0.0, 0.0,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
        laptopScreenVertexTextureCoordBuffer.itemSize = 2;
        laptopScreenVertexTextureCoordBuffer.numItems = 4;


    }


    //var rttFramebuffer;
    //var rttTexture;

    function initTextureFrameBuffer() {
        rttFramebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer);
        rttFramebuffer.width = 512;
        rttFramebuffer.height = 512;

        rttTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, rttTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, rttFramebuffer.width, rttFramebuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        var renderbuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, rttFramebuffer.width, rttFramebuffer.height);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, rttTexture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    }


    function loadLaptop() {
        var request = new XMLHttpRequest();
        request.open("GET", THIS_FOLDER_PATH + "/macbook.json");
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                handleLoadedLaptop(JSON.parse(request.responseText));
            }
        }
        request.send();
    }

    function handleLoadedLaptop(laptopData) {
        laptopVertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, laptopVertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(laptopData.vertexNormals), gl.STATIC_DRAW);
        laptopVertexNormalBuffer.itemSize = 3;
        laptopVertexNormalBuffer.numItems = laptopData.vertexNormals.length / 3;

        laptopVertexTextureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, laptopVertexTextureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(laptopData.vertexTextureCoords), gl.STATIC_DRAW);
        laptopVertexTextureCoordBuffer.itemSize = 2;
        laptopVertexTextureCoordBuffer.numItems = laptopData.vertexTextureCoords.length / 2;

        laptopVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, laptopVertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(laptopData.vertexPositions), gl.STATIC_DRAW);
        laptopVertexPositionBuffer.itemSize = 3;
        laptopVertexPositionBuffer.numItems = laptopData.vertexPositions.length / 3;

        laptopVertexIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, laptopVertexIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(laptopData.indices), gl.STREAM_DRAW);
        laptopVertexIndexBuffer.itemSize = 1;
        laptopVertexIndexBuffer.numItems = laptopData.indices.length;
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
        console.log("yo")
        var newX = event.clientX;
        var newY = event.clientY;

        var deltaX = newX - lastMouseX;
        var newRotationMatrix = mat4.create();
        mat4.identity(newRotationMatrix);
        mat4.rotate(newRotationMatrix, degreesToRadians(deltaX / 10), [0, 1, 0]);

        var deltaY = newY - lastMouseY;
        mat4.rotate(newRotationMatrix, degreesToRadians(deltaY / 10), [1, 0, 0]);

        mat4.multiply(newRotationMatrix, laptopRotationMatrix, laptopRotationMatrix);

        lastMouseX = newX;
        lastMouseY = newY;

    }






    obj.startC = start;

})(window);

window.startC();
