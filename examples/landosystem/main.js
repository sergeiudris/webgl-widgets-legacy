


var data,
    canvas = null,
    gl = null,

    canvasText = null,
    context = null,

    mvMatrix = mat4.create(),
    pMatrix = mat4.create(),
    worldRotationMatrix = mat4.create(),
    perspectiveRotationMatrix = mat4.create(),
    mvMatrixStack = [],

    currentProgram = null,
    perFragmentProgram = null,
    perVertexProgram = null,
    prismProgram = null,

    sphereVertexPositionBuffer,
    sphereVertexIndexBuffer,
    sphereVertexTextureCoordBuffer,
    sphereVertexNormalBuffer,

    prismVertexPositionBuffer,
    prismVertexIndexBuffer,
    prismVertexTextureCoordBuffer,
    prismVertexNormalBuffer,

    earthSpecularMapTexture,
    earthColorMapTexture,

    xRotation = 0,
    yRotation = 0,
    zRotation = 0,
    worldAngle = 0,

    //prismWidth = 20,
    //prismHeight = 20,
    //prismLength = 40,
    prismAngle = 0,


    xSpeed = 0,
    ySpeed = 0,

    worldX = 0.0,
    worldY = 0.0,
    worldZ = -30.0,//- 40.0,

    worldWidth = 0,
    worldHeight = 0,
    worldDepth = 0
//919 500
perspectiveX = 0.0,
    perspectiveY = 0.0,
    perspectiveZ = 0.0,


    lastTime = 0,
    lastMouseX = 0,
    lastMouseY = 0,
    mouseDown = false,
    isRotating = false,
    animationFrameID = -1,
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


    planets = [],

    planetProgramDictionary = {
        attributes: ["aVertexPosition", "aTextureCoord", "aVertexNormal"],
        uniforms: ["uAlpha", "uPMatrix", "uMVMatrix", "uColorMapSampler", "uSpecularMapSampler", "uNMatrix", "uMaterialShininess", "uShowSpecularHighlights", "uPointLightingSpecularColor",
            "uPointLightingDiffuseColor", "uPointLightingLocation", "uAmbientColor", "uUseLighting", "uUseTextures", "uUseColorMap", "uUseSpecularMap", "uPlanetColor", "uPlanetRadius",
            "uResolution"]
    },
    prismProgramDictionary = {
        attributes: ["aVertexPosition", "aVertexColor"],
        uniforms: ["uPMatrix", "uMVMatrix", "uScalePrism", "uResolution"]
    },

    resolution = {
        whd: [],
        widht: 0,
        height: 0,
        depth: 0
    }

    ;

function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);



    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix); // persprective matrix

    //mat4.identity(pMatrix);

    //  mat4.multiply(pMatrix, [
    //      2 / 800, 0, 0, 0,
    //      0, -2 / 500, 0, 0,
    //      0, 0, 2/400, 0,
    //      -1,1,0,1
    //  ]);

    //  console.log(pMatrix);

    mat4.identity(mvMatrix);

    mat4.translate(mvMatrix, [worldX, worldY, worldZ]);
    mat4.translate(pMatrix, [perspectiveX, perspectiveY, perspectiveZ]);
    // mat4.rotate(mvMatrix, degreesToRadians(23.4), [1, 0, -1]);

    mat4.rotate(mvMatrix, degreesToRadians(worldAngle), [0, 1, 0]);
    mat4.multiply(mvMatrix, worldRotationMatrix);
    mat4.multiply(pMatrix, perspectiveRotationMatrix);
    mat4.rotate(mvMatrix, degreesToRadians(xRotation), [1, 0, 0]);
    mat4.rotate(mvMatrix, degreesToRadians(yRotation), [0, 1, 0]);

    currentProgram = prismProgram;
    gl.useProgram(currentProgram);
    gl.uniform3fv(currentProgram.uResolution, resolution.whd);
    drawPrism();




    if (!checkBoxPerFragment.checked) {
        currentProgram = perVertexProgram;
    } else {
        currentProgram = perFragmentProgram;
    }
    gl.useProgram(currentProgram);






    gl.uniform1f(currentProgram.uShowSpecularHighlights, checkBoxShowSpecularHighlights.checked);
    gl.uniform1i(currentProgram.uUseColorMap, checkBoxColorMap.checked);
    gl.uniform1i(currentProgram.uUseSpecularMap, checkBoxSpecularMap.checked);
    gl.uniform1i(currentProgram.uUseLighting, checkBoxLighting.checked);
    gl.uniform1i(currentProgram.uUseTextures, checkBoxTextures.checked);
    gl.uniform1f(currentProgram.uAlpha, parseFloat(alpha.value));
    gl.uniform1f(currentProgram.uMaterialShininess, parseFloat(shininess.value));
    gl.uniform4fv(currentProgram.uPlanetColor, [1.0, 0.0, 0.0, 1.0]);
    gl.uniform1f(currentProgram.uPlanetRadius, 1.0);
    gl.uniform3fv(currentProgram.uResolution, resolution.whd);

    if (checkBoxLighting.checked) {
        gl.uniform3f(
            currentProgram.uAmbientColor,
            parseFloat(ambientR.value),
            parseFloat(ambientG.value),
            parseFloat(ambientB.value)
        );

        gl.uniform3f(
            currentProgram.uPointLightingLocation,
            parseFloat(lightPositionX.value),
            parseFloat(lightPositionY.value),
            parseFloat(lightPositionZ.value)
        );

        gl.uniform3f(
            currentProgram.uPointLightingSpecularColor,
            parseFloat(specularR.value),
            parseFloat(specularG.value),
            parseFloat(specularB.value)
        );

        gl.uniform3f(
            currentProgram.uPointLightingDiffuseColor,
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




    for (var i = 0, l = planets.length; i < l; i++) {
        planets[i].draw();
    }

}


function initLandoSystem() {

    var maxValue = getMinMax(data, "value").max,
        maxHours = getMinMax(data, "hours").max,
        maxAge = getMinMax(data, "age").max,
        radius = -1,
        valueX = 0,
        valueY = 0,
        valueZ = 0,
        halfWorldWidth = 0,
        halfWorldHeight = 0,
        halfWorldDepth = 0,
        x,
        y,
        z
        ;
    // console.log(planets);
    // console.log(maxValue);
    var planet = null;
    for (var i = 0, l = data.length; i < l; i++) {
        element = data[i];
        radius = element.value / maxValue;
        halfWorldWidth = resolution.width / 2 / Math.abs(worldZ);
        halfWorldHeight = resolution.height / 2 / Math.abs(worldZ);
        halfWorldDepth = resolution.depth / 2 / Math.abs(worldZ);
        x = halfWorldWidth - halfWorldWidth / maxValue * element.value;
        y = halfWorldHeight / maxHours * element.hours;
        z = halfWorldDepth / maxAge * element.age;
        if (!(i % 2)) {
            x *= -1;
            y *= -1;
            //z *= -1;
        }
        z *= -1;
        planet = new Planet(element.text, element.value, [x, y, z], radius, 0, element.color);
        planets.push(planet);
    }


};

function Planet(text, value, position, radius, angle, color) {
    this.text = text;
    this.value = value;
    this.radius = radius;
    this.position = {
        vec3: position,
        x: position[0],
        y: position[1],
        z: position[2]
    };
    this.angle = angle;
    this.color = color;
};



Planet.prototype.draw = function () {

    context.fillText(this.value, resolution.width / 2 + this.position.x * Math.abs(worldZ - this.position.z), resolution.height / 2 - this.position.y * Math.abs(worldZ - this.position.z));
    mvPushMatrix();
    //mat4.rotate(mvMatrix, degreesToRadians(this.angle), [0.0, 1.0, 0.0]);
    // console.log(mvMatrix);
    mat4.translate(mvMatrix, this.position.vec3);
    // console.log(mvMatrix);
    gl.uniform4fv(currentProgram.uPlanetColor, this.color);
    gl.uniform1f(currentProgram.uPlanetRadius, this.radius);
    drawPlanet();
    mvPopMatrix();
};

Planet.prototype.animate = function () {

};

function drawPlanet() {

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, earthColorMapTexture);
    gl.uniform1i(currentProgram.uColorMapSampler, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, earthSpecularMapTexture);
    gl.uniform1i(currentProgram.uSpecularMapSampler, 1);

    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
    gl.vertexAttribPointer(currentProgram.aVertexPosition, sphereVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexTextureCoordBuffer);
    gl.vertexAttribPointer(currentProgram.aTextureCoord, sphereVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer);
    gl.vertexAttribPointer(currentProgram.aVertexNormal, sphereVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, sphereVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

function drawPrism() {

    mvPushMatrix();


    mat4.rotate(mvMatrix, degreesToRadians(prismAngle), [1.0, 1.0, 1.0]); //ORDER MATTERS ! the other way - orbit circulation
    gl.bindBuffer(gl.ARRAY_BUFFER, prismVertexPositionBuffer);
    gl.vertexAttribPointer(currentProgram.aVertexPosition, prismVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, prismVertexColorBuffer);
    gl.vertexAttribPointer(currentProgram.aVertexColor, prismVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, prismVertexIndexBuffer);
    setMatrixUniforms();// push over the mv and p matrices to take inot account last changes
    gl.drawElements(gl.LINES, prismVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    mvPopMatrix();

}

function initTexture() {
    return new Promise(function (resolve, reject) {
        var image = new Image()
            ;
        earthColorMapTexture = gl.createTexture();
        earthColorMapTexture.image = image;

        image.onload = function () {
            handleLoadedTexture(earthColorMapTexture);
        }
        image.src = "./earth.jpg";

        image = new Image();
        earthSpecularMapTexture = gl.createTexture();
        earthSpecularMapTexture.image = image;

        image.onload = function () {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.bindTexture(gl.TEXTURE_2D, earthSpecularMapTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, earthSpecularMapTexture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);
            resolve(image);
        }
        image.src = "./earth-specular.gif";
    })



}
function handleLoadedTexture(texture) {


}


function initBuffersPlanet() {

    var latitudeBands = 30,
        longitudeBands = 30,
        radius = 1,

        vertexPositionData = [],
        normalData = [],
        textureCoordData = [],
        indexData = [],

        theta = 0,
        sinTheta = 0,
        cosTheta = 0,

        phi = 0,
        sinPhi = 0,
        cosPhi = 0,

        x = 0,
        y = 0,
        z = 0,
        u = 0,
        v = 0,

        first = 0,
        second = 0
        ;

    for (var latIndex = 0; latIndex <= latitudeBands; latIndex++) {
        theta = latIndex * Math.PI / latitudeBands; // angle betwwen virtical axis and line center-vertice
        sinTheta = Math.sin(theta);
        cosTheta = Math.cos(theta);

        for (var longIndex = 0; longIndex <= longitudeBands; longIndex++) {
            phi = longIndex * 2 * Math.PI / longitudeBands;
            sinPhi = Math.sin(phi);
            cosPhi = Math.cos(phi);

            x = cosPhi * sinTheta;
            y = cosTheta;
            z = sinPhi * sinTheta;
            u = 1 - (longIndex / longitudeBands);
            v = 1 - (latIndex / latitudeBands);

            normalData.push(x, y, z);
            textureCoordData.push(u, v);
            vertexPositionData.push(radius * x, radius * y, radius * z);

            if (latIndex < latitudeBands && longIndex < longitudeBands) {
                first = (latIndex * (longitudeBands + 1)) + longIndex;
                second = first + longitudeBands + 1;
                indexData.push(first, second, first + 1, second, second + 1, first + 1);
            }
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

};

function initBuffersPrism() {
    var x = resolution.width / 2 / Math.abs(worldZ),
        y = resolution.height / 2 / Math.abs(worldZ),
        z = resolution.depth / 2 / Math.abs(worldZ);


    prismVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, prismVertexPositionBuffer);

    vertices = [
        //Front face
        -x, -y, z,
        x, -y, z,
        x, y, z,
        -x, y, z,


        // Back face
        -x, -y, -z,
        -x, y, -z,
        x, y, -z,
        x, -y, -z,

        //  Top face
        -x, y, -z,
        -x, y, z,
        x, y, z,
        x, y, -z,

        // Bottom face
        -x, -y, -z,
        x, -y, -z,
        x, -y, z,
        -x, -y, z,

        // Right face
        x, -y, -z,
        x, y, -z,
        x, y, z,
        x, -y, z,

        // Left face
        -x, -y, -z,
        -x, -y, z,
        -x, y, z,
        -x, y, -z
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    prismVertexPositionBuffer.itemSize = 3;
    prismVertexPositionBuffer.numItems = 24;

    prismVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, prismVertexColorBuffer);
    colors = [
        [1.0, 0.0, 0.0, 1.0],     // Front face
        [1.0, 1.0, 0.0, 1.0],     // Back face
        [0.0, 1.0, 0.0, 1.0],     // Top face
        [1.0, 0.5, 0.5, 1.0],     // Bottom face
        [1.0, 0.0, 1.0, 1.0],     // Right face
        [0.0, 0.0, 1.0, 1.0],     // Left face
    ];
    var unpackedColors = [];
    for (var j = 0, l = colors.length; j < l; j++) {
        var color = colors[j];
        for (var i = 0; i < 4; i++) {
            unpackedColors = unpackedColors.concat(color);
        }
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColors), gl.STATIC_DRAW);
    prismVertexColorBuffer.itemSize = 4;
    prismVertexColorBuffer.numItems = 24;

    prismVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, prismVertexIndexBuffer);
    //var prismVertexIndices = [
    //  0, 1, 2, 0, 2, 3,    // Front face
    //  4, 5, 6, 4, 6, 7,    // Back face
    //  8, 9, 10, 8, 10, 11,  // Top face
    //  12, 13, 14, 12, 14, 15, // Bottom face
    //  16, 17, 18, 16, 18, 19, // Right face
    //  20, 21, 22, 20, 22, 23  // Left face
    //];
    var prismVertexIndices = [
        0, 1, 1, 2, 2, 3, 3, 0,
        4, 5, 5, 6, 6, 7, 7, 4,
        8, 9, 9, 10, 10, 11, 11, 8,
        12, 13, 13, 14, 14, 15, 15, 12,
        16, 17, 17, 18, 18, 19, 19, 16,
        20, 21, 21, 22, 22, 23, 23, 20// Left face
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(prismVertexIndices), gl.STATIC_DRAW);
    prismVertexIndexBuffer.itemSize = 1;
    prismVertexIndexBuffer.numItems = 48;

}

function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;

        xRotation += (xSpeed * elapsed) / 1000.0;
        yRotation += (ySpeed * elapsed) / 1000.0;
        zRotation += (3 * elapsed) / 1000.0;

        if (isRotating) {
            worldAngle += 0.05 * elapsed;
            prismAngle += 0.1 * elapsed;
        }
    }
    lastTime = timeNow;
}


function initGL() {
    try {

        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;

        context = canvasText.getContext("2d");

        resolution = {
            whd: [canvas.width, canvas.height, 400],
            width: canvas.width,
            height: canvas.height,
            depth: 400
        };

        console.log(resolution);

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
    perVertexProgram = createProgram("per-vertex-lighting-fs", "per-vertex-lighting-vs", planetProgramDictionary);
    perFragmentProgram = createProgram("per-fragment-lighting-fs", "per-fragment-lighting-vs", planetProgramDictionary);
    prismProgram = createProgram("prism-fs", "prism-vs", prismProgramDictionary);
}

function createProgram(fragmentScriptID, vertexScriptID, dictionary) {

    var fragmentShader = getShader(gl, fragmentScriptID),
        vertexShader = getShader(gl, vertexScriptID),
        shaderProgram = gl.createProgram(),
        attributes = dictionary.attributes,
        uniforms = dictionary.uniforms,
        attribute,
        uniform

        ;
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.log("couldn't initialize shaders");
    }


    for (var a = 0, l = attributes.length; a < l; a++) {
        attribute = attributes[a];
        //  console.log(attribute);
        shaderProgram[attribute] = gl.getAttribLocation(shaderProgram, attribute);
        //console.log(shaderProgram[attribute]);
        gl.enableVertexAttribArray(shaderProgram[attribute]);
    }

    for (var u = 0, l = uniforms.length; u < l; u++) {
        uniform = uniforms[u];
        shaderProgram[uniform] = gl.getUniformLocation(shaderProgram, uniform);
        //console.log(shaderProgram[uniform]);

    }

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

    gl.uniformMatrix4fv(currentProgram.uPMatrix, false, pMatrix);
    gl.uniformMatrix4fv(currentProgram.uMVMatrix, false, mvMatrix);

    var normalMatrix = mat3.create();
    mat4.toInverseMat3(mvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);
    gl.uniformMatrix3fv(currentProgram.uNMatrix, false, normalMatrix);
}

function loadJSON(url, async, callback) {

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onerror = function () {
        console.log(xmlhttp.status);
    }

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            callback(url, JSON.parse(xmlhttp.responseText));
        }

    }
    xmlhttp.open("GET", url, async);
    xmlhttp.setRequestHeader("Content-Type", "application/json: charset=UTF-8");
    xmlhttp.send();

};

function handleLoadedData(url, obj) {
    data = obj;
    console.log("data from " + url + " loaded");
    console.log(data);
    initLandoSystem();
    tick();
};




function handleKeys() {
    if (currentlyPressedKeys[33]) {
        // Page Up
        worldZ -= 0.3;

    }
    if (currentlyPressedKeys[34]) {
        // Page Down
        worldZ += 0.3;
    }
    if (currentlyPressedKeys[37]) {
        // Left cursor key
        // ySpeed -= 1;
        //var newRotationMatrix = mat4.create();
        //mat4.identity(newRotationMatrix);
        //mat4.rotate(newRotationMatrix, degreesToRadians(5 / 10), [0, 1, 0]);
        //mat4.multiply(newRotationMatrix, worldRotationMatrix, worldRotationMatrix);
        perspectiveX += 0.2;
    }
    if (currentlyPressedKeys[39]) {
        // Right cursor key
        //  ySpeed += 1;
        //var newRotationMatrix = mat4.create();
        //mat4.identity(newRotationMatrix);
        //mat4.rotate(newRotationMatrix, degreesToRadians(-5 / 10), [0, 1, 0]);
        //mat4.multiply(newRotationMatrix, worldRotationMatrix, worldRotationMatrix);
        perspectiveX -= 0.2;
    }
    if (currentlyPressedKeys[38]) {
        // Up cursor key
        // xSpeed -= 1;
        var newRotationMatrix = mat4.create();
        // mat4.identity(newRotationMatrix);
        //mat4.rotate(newRotationMatrix, degreesToRadians(-5 / 10), [1, 0, 0]);
        //mat4.multiply(newRotationMatrix, worldRotationMatrix, worldRotationMatrix);
        perspectiveZ += 0.2;
    }
    if (currentlyPressedKeys[40]) {
        // Down cursor key
        //xSpeed += 1;
        //var newRotationMatrix = mat4.create();
        //mat4.identity(newRotationMatrix);
        //mat4.rotate(newRotationMatrix, degreesToRadians(5 / 10), [1, 0, 0]);
        //mat4.multiply(newRotationMatrix, worldRotationMatrix, worldRotationMatrix);
        perspectiveZ -= 0.2;
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
    target.addEventListener("mousemove", handleMouseMove, false);
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
    //  if (event.keyCode == 33 || event.keyCode == 34)
    event.preventDefault();

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
    var newX = event.offsetX;
    var newY = event.offsetY;
    document.getElementById("txtarea").value = "x: " + newX + "\ny: " + newY;
    if (!mouseDown) {
        return;
    }


    var deltaX = newX - lastMouseX;
    var newRotationMatrix = mat4.create();
    mat4.identity(newRotationMatrix);
    mat4.rotate(newRotationMatrix, degreesToRadians(deltaX / 10), [0, 1, 0]);
    console.log(newRotationMatrix);


    var deltaY = newY - lastMouseY;
    mat4.rotate(newRotationMatrix, degreesToRadians(deltaY / 10), [1, 0, 0]);

    console.log(newRotationMatrix);

    mat4.multiply(newRotationMatrix, worldRotationMatrix, worldRotationMatrix);

    lastMouseX = newX;
    lastMouseY = newY;

    console.log(worldRotationMatrix);

}


function getMinMax(arr, prop) {
    var max = -100000,
        min = 100000,
        el = null,
        value = null;

    if (!arr.length) {
        return { min: 0, max: 10 };
    }

    for (var i = 0; i < arr.length; ++i) {
        el = arr[i];
        value = el[prop];
        if (value > max)
            max = value;
        if (value < min)
            min = value;
    }
    return { min: min, max: max };
}

function tick() {

    animationFrameID = requestAnimationFrame(tick);
    handleKeys();
    drawScene();
    animate();
}


function start() {

    canvas = document.getElementById("canvas");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;


    canvasText = document.getElementById("canvasText");
    canvasText.width = canvasText.clientWidth;
    canvasText.height = canvasText.clientHeight;



    initGL(canvas, canvasText);
    initShaders();
    initBuffersPlanet();
    initBuffersPrism(2, 2, 4);
    initTexture().then(function (img) {
        loadJSON("./data.json", true, handleLoadedData);

        mat4.identity(worldRotationMatrix);
        mat4.identity(perspectiveRotationMatrix);


        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        addEventListeners(canvas);
        document.onkeydown = handleKeyDown;
        document.onkeyup = handleKeyUp;


        checkBoxLighting.checked = true;
        checkBoxColorMap.checked = false;
        checkBoxBlending.checked = false;
        checkBoxPerFragment.checked = true;
    });



};







start();
