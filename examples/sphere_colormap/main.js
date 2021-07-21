
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

		sphereVertexPositionBuffer,
		sphereVertexIndexBuffer,
		sphereVertexTextureCoordBuffer,
		sphereVertexNormalBuffer,


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

        sphereAngle = 180,
        earthColorMapTexture,
        earthSpecularMapTexture,
		z = -40.0,
		filter = 0, // int varying from 0 to 2 whic filter is used (x,y,z),
		texturesArr = [],
		currentlyPressedKeys = {},
        checkBoxColorMap = document.getElementById("color-map"),
		checkBoxSpecularMap = document.getElementById("specular-map"),
		checkBoxLighting = document.getElementById("lighting"),
		checkBoxBlending = document.getElementById("blending"),
        checkBoxPerFragment = document.getElementById("per-fragment"),
        checkBoxTextures = document.getElementById("textures"),
        checkBoxShowSpecularHighlights = document.getElementById("showSpecularHighlights"),
        texture = document.getElementById("texture"),
        shininess = document.getElementById("shininess"),
		alpha = document.getElementById("alpha"),
		specularR = document.getElementById("specularR"),
        specularG = document.getElementById("specularG"),
        specularB = document.getElementById("specularB"),
		lightPositionX = document.getElementById("lightPositionX"),
        lightPositionY = document.getElementById("lightPositionY"),
        lightPositionZ = document.getElementById("lightPositionZ"),
		diffuseR = document.getElementById("diffuseR"),
        diffuseG = document.getElementById("diffuseG"),
        diffuseB = document.getElementById("diffuseB"),


       sphereRotationMatrix = mat4.create(),
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
        initTexture();
        mat4.identity(sphereRotationMatrix);


        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        //gl.enable(gl.DEPTH_TEST);

        addEventListeners(canvas);
        document.onkeydown = handleKeyDown;
        document.onkeyup = handleKeyUp;
        checkBoxLighting.checked = false;
        checkBoxBlending.checked = false;
        checkBoxPerFragment.checked = false;


        tick();

    }


    function drawScene() {

        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        

        mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix); // persprective matrix



        var perFragmentLighting = checkBoxPerFragment.checked;
        if (!perFragmentLighting) {
            currentProgram = perVertexProgram;
        } else {
            currentProgram = perFragmentProgram;
        }
        gl.useProgram(currentProgram);


        gl.uniform1f(currentProgram.showSpecularHighlightsUnifrom, checkBoxShowSpecularHighlights.checked);
        gl.uniform1i(currentProgram.useColorMapUniform, checkBoxColorMap.checked);
        gl.uniform1i(currentProgram.useSpecularMapUniform, checkBoxSpecularMap.checked);
        gl.uniform1i(currentProgram.useLightingUniform, checkBoxLighting.checked);
        gl.uniform1i(currentProgram.useTexturesUniform, checkBoxTextures.checked);
        gl.uniform1f(currentProgram.alphaUniform, parseFloat(alpha.value));
        gl.uniform1f(currentProgram.materialShininessUniform, parseFloat(shininess.value));


        if (checkBoxLighting.checked) {
            gl.uniform3f(
              currentProgram.ambientColorUniform,
              parseFloat(ambientR.value),
              parseFloat(ambientG.value),
              parseFloat(ambientB.value)
              );

            gl.uniform3f(
                currentProgram.pointLightingLocationUniform,
            parseFloat(lightPositionX.value),
            parseFloat(lightPositionY.value),
            parseFloat(lightPositionZ.value)
            );

            gl.uniform3f(
         currentProgram.pointLightingSpecularColorUniform,
         parseFloat(specularR.value),
         parseFloat(specularG.value),
         parseFloat(specularB.value)
       );

            gl.uniform3f(
        currentProgram.pointLightingDiffuseColorUniform,
        parseFloat(diffuseR.value),
        parseFloat(diffuseG.value),
        parseFloat(diffuseB.value)
      );

        }

        if (checkBoxBlending.checked) {
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE); //source fragment is the one we are drawing now, destination - the one that already in the frame buffer
            //source factor, destination factor
            gl.enable(gl.BLEND);
            gl.disable(gl.DEPTH_TEST);
        } else {

            gl.disable(gl.BLEND);
            gl.enable(gl.DEPTH_TEST);
        }

              
        mat4.identity(mvMatrix); 

        mat4.translate(mvMatrix, [0.0, 0.0, z]); 
        
        mat4.rotate(mvMatrix, degreesToRadians(23.4), [1, 0, -1]);
        mat4.rotate(mvMatrix, degreesToRadians(sphereAngle), [0, 1, 0]);
        mat4.multiply(mvMatrix, sphereRotationMatrix);

        mat4.rotate(mvMatrix, degreesToRadians(xRotation), [1, 0, 0]);
        mat4.rotate(mvMatrix, degreesToRadians(yRotation), [0, 1, 0]);
        //mat4.rotate(mvMatrix, degreesToRadians(zRotation),[0,0,1]);



        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, earthColorMapTexture);
        gl.uniform1i(currentProgram.colorMapSamplerUniform, 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, earthSpecularMapTexture);
        gl.uniform1i(currentProgram.specularMapSamplerUniform, 1);

        gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
        gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, sphereVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexTextureCoordBuffer);
        gl.vertexAttribPointer(currentProgram.textureCoordAttribute, sphereVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer);
        gl.vertexAttribPointer(currentProgram.vertexNormalAttribute, sphereVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer);
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, sphereVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);


    }



    function initTexture() {
        var image = new Image()
        ;
        earthColorMapTexture = gl.createTexture();
        earthColorMapTexture.image = image;

        image.onload = function () {
            handleLoadedTexture(earthColorMapTexture);
        }
        image.src = THIS_FOLDER_PATH+"/earth.jpg";

        image = new Image();
        earthSpecularMapTexture = gl.createTexture();
        earthSpecularMapTexture.image = image;

        image.onload = function () {
            handleLoadedTexture(earthSpecularMapTexture);
        }
        image.src = THIS_FOLDER_PATH+"/earth-specular.gif";


    }
    function handleLoadedTexture(texture) {

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

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
                sphereAngle += 0.05 * elapsed;
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
        perVertexProgram = createProgram("per-vertex-lighting-fs", "per-vertex-lighting-vs");
        perFragmentProgram = createProgram("per-fragment-lighting-fs", "per-fragment-lighting-vs");
    }

    function createProgram(fragmentScriptID, vertexScriptID) {

        var fragmentShader = getShader(gl, fragmentScriptID),
               vertexShader = getShader(gl, vertexScriptID),
               shaderProgram = gl.createProgram();

        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            console.log("couldn't initialize shaders");
        }



        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition"); // not a predefined attribute
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

        shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
        gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

        shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
        gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

        shaderProgram.alphaUniform = gl.getUniformLocation(shaderProgram, "uAlpha");
        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        shaderProgram.colorMapSamplerUniform = gl.getUniformLocation(shaderProgram, "uColorMapSampler");
        shaderProgram.specularMapSamplerUniform = gl.getUniformLocation(shaderProgram, "uSpecularMapSampler");
        shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
        shaderProgram.materialShininessUniform = gl.getUniformLocation(shaderProgram, "uMaterialShininess");
        shaderProgram.showSpecularHighlightsUnifrom = gl.getUniformLocation(shaderProgram, "uShowSpecularHighlights");
        shaderProgram.pointLightingSpecularColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingSpecularColor");
        shaderProgram.pointLightingDiffuseColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingDiffuseColor");
        shaderProgram.pointLightingLocationUniform = gl.getUniformLocation(shaderProgram, "uPointLightingLocation");
        shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
        shaderProgram.useLightingUniform = gl.getUniformLocation(shaderProgram, "uUseLighting");
        shaderProgram.useTexturesUniform = gl.getUniformLocation(shaderProgram, "uUseTextures");
        shaderProgram.useColorMapUniform = gl.getUniformLocation(shaderProgram, "uUseColorMap");
        shaderProgram.useSpecularMapUniform = gl.getUniformLocation(shaderProgram, "uUseSpecularMap");

        return shaderProgram;
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
        gl.uniformMatrix4fv(currentProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(currentProgram.mvMatrixUniform, false, mvMatrix);

        var normalMatrix = mat3.create();
        mat4.toInverseMat3(mvMatrix, normalMatrix);
        mat3.transpose(normalMatrix);
        gl.uniformMatrix3fv(currentProgram.nMatrixUniform, false, normalMatrix);
    }



    function initBuffers() {

        var latitudeBands = 30;
        var longitudeBands = 30;
        var radius = 13;

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
        sphereVertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
        sphereVertexNormalBuffer.itemSize = 3;
        sphereVertexNormalBuffer.numItems = normalData.length / 3;

        sphereVertexTextureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexTextureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
        sphereVertexTextureCoordBuffer.itemSize = 2;
        sphereVertexTextureCoordBuffer.numItems = textureCoordData.length / 2;

        sphereVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
        sphereVertexPositionBuffer.itemSize = 3;
        sphereVertexPositionBuffer.numItems = vertexPositionData.length / 3;

        sphereVertexIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
        sphereVertexIndexBuffer.itemSize = 1;
        sphereVertexIndexBuffer.numItems = indexData.length;


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

        mat4.multiply(newRotationMatrix, sphereRotationMatrix, sphereRotationMatrix);

        lastMouseX = newX;
        lastMouseY = newY;

    }






    obj.startC = start;

})(window);

window.startC();
