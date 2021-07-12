
var THIS_FOLDER_PATH = ".";

/*
GLOBAL VARIABLES
*/
var CANVAS,
    GL,
    shaderVertexSource,
    shaderFragmentSource,
    shaderVertexSourceOctree,
    shaderFragmentSourceOctree,
    dragonJSONObject,
    program,
    octreeProgram,
    programDictionary = {
        attributes: ["aVertexPosition", "aUV"],
        uniforms: ["uPMatrix", "uMMatrix", "uVMatrix", "uSampler"]
    },
    octreeDictionary = {
        attributes: ["aVertexPosition"],
        uniforms: ["uPMatrix", "uMMatrix", "uVMatrix", "uSizeCell", "uCenterCell", "uColor"]
    },
    dragon,
    wireframe,
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
    dragonTexture,
    EXT,


    OCTREE = {
        center: [0, 0, 0],
        size: [0, 0, 0],
        faces: [],
        children: [],
        leaf: false
    },
    MAX_OCTREE_FACES_PER_NODE = 32, // if there are more than 32 triangles per octree AABB, split it into 8 AABB and so on...
    CELLS = [] //store ocree cells sequentially in an array for debug rendering, to avoid browsing the octree to draw the cells at each render loop
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
    loadTexture(THIS_FOLDER_PATH + "/dragon.png").then(function (img) {
        dragonTexture = img;
        initProgram();

        createWorld();
        computeOCTREE();
        Lib.translateZ4(vMatrix, -20);
        Lib.translateY4(vMatrix, -4);
        drawScene(0);
    })

};

function drawScene(time) {

    if (!isDragging) {
        DELTA.x *= AMORTIZATION, DELTA.y *= AMORTIZATION;
        THETA += DELTA.x;
        PHI += DELTA.y;
    }
    pushMatrix(mMatrix, "m");
    animate();
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    GL.useProgram(program);
    GL.uniformMatrix4fv(program.uPMatrix, false, pMatrix);
    GL.uniformMatrix4fv(program.uVMatrix, false, vMatrix);
    GL.uniformMatrix4fv(program.uMMatrix, false, mMatrix);
    GL.uniform1i(program.uSampler, 0);

    if (dragonTexture.webglTexture) {
        GL.activeTexture(GL.TEXTURE0);
        GL.bindTexture(GL.TEXTURE_2D, dragonTexture.webglTexture);
    }
    dragon.draw(GL, program);


    GL.useProgram(octreeProgram);
    //TODO disable attrib arrays!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    GL.uniformMatrix4fv(octreeProgram.uPMatrix, false, pMatrix);
    GL.uniformMatrix4fv(octreeProgram.uVMatrix, false, vMatrix);
    GL.uniformMatrix4fv(octreeProgram.uMMatrix, false, mMatrix);
    GL.uniform3f(octreeProgram.uColor, 1.0, 1.0, 0.0);

    CELLS.map(function (cell) {

        GL.uniform3fv(octreeProgram.uSizeCell, cell.size);
        GL.uniform3fv(octreeProgram.uCenterCell, cell.center);
        wireframe.draw(GL, octreeProgram);
    });

    GL.flush();
    popMatrix("m");



    animationFrameID = window.requestAnimationFrame(drawScene);
};

function createWorld() {
    dragon = new Dragon(GL, dragonJSONObject);
    wireframe = new CubeWireframe(GL);
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

function computeOCTREE() {
    // compute the bounding box of the dragon
    var i, l, x_min = 1e6, y_min = 1e6, z_min = 1e6, x_max = -1e6, y_max = -1e6, z_max = -1e6;
    for (i = 0, l = dragonJSONObject.vertices.length; i < l; i += 8) {

        x_min = Math.min(x_min, dragon.vertices[i]);
        y_min = Math.min(y_min, dragon.vertices[i + 1]);
        z_min = Math.min(z_min, dragon.vertices[i + 2]);

        x_max = Math.max(x_max, dragon.vertices[i]);
        y_max = Math.max(y_max, dragon.vertices[i + 1]);
        z_max = Math.max(z_max, dragon.vertices[i + 2]);
    }
    //set hte root of the octree as the bounding box
    OCTREE.center[0] = (x_min + x_max) / 2;
    OCTREE.center[1] = (y_min + y_max) / 2;
    OCTREE.center[2] = (z_min + z_max) / 2;

    OCTREE.size[0] = x_max - x_min;
    OCTREE.size[1] = y_max - y_min;
    OCTREE.size[2] = z_max - z_min;

    // BUILD THE FACES ARRAY
    var allFaces = [];
    for (i = 0, l = dragonJSONObject.indices.length; i < l; i += 3) {
        var iA = dragonJSONObject.indices[i],
            iB = dragonJSONObject.indices[i + 1],
            iC = dragonJSONObject.indices[i + 2]
            ;
        //coordinates of the 3 points of the face
        var points = [[dragon.vertices[iA * 8], dragon.vertices[iA * 8 + 1], dragon.vertices[iA * 8 + 2]],
            [dragon.vertices[iB * 8], dragon.vertices[iB * 8 + 1], dragon.vertices[iB * 8 + 2]],
            [dragon.vertices[iC * 8], dragon.vertices[iC * 8 + 1], dragon.vertices[iC * 8 + 2]]
        ];

        allFaces.push({
            indices: [iA, iB, iC],
            points: points
        });
    }
    //BUILD THE OCTREE RECURSIVELY

    var build_octree_node = function (node, faces) {
        CELLS.push(node);
        faces.map(function (face) {
            if (Intersect.test_AABB_triangle(node.center, node.size, face.points)) {
                node.faces.push(face);
            }
        });

        node.leaf = (node.faces.length < MAX_OCTREE_FACES_PER_NODE);
        if (!node.leaf) {
            //split node into 8 children
            var child_size = [node.size[0] / 2, node.size[1] / 2, node.size[2] / 2];

            var x, y, z;
            for (x = -0.5; x <= 0.5; ++x) {
                for (y = -0.5; y <= 0.5; ++y) {
                    for (z = -0.5; z <= 0.5; ++z) {
                        node.children.push({
                            center: [node.center[0] + x * child_size[0],
                                node.center[1] + y * child_size[1],
                                node.center[2] + z * child_size[2]],
                            size: child_size,
                            faces: [],
                            children: [],
                            leaf: false
                        });
                    }
                }
            }
            //build children
            node.children.map(function (child) {
                build_octree_node(child, node.faces);
            });
        }//end of if !node.leaf

    };//end of build_octree_node

    build_octree_node(OCTREE, allFaces);

};

function initGL() {
    try {
        GL = CANVAS.getContext("webgl", { antialias: true }) || CANVAS.getContext("experimental-webgl", { antialias: false });

        EXT = GL.getExtension("OES_element_index_uint") ||
            GL.getExtension("MOZ_OES_element_index_uint") ||
            GL.getExtension("WEBKIT_OES_element_index_uint");

        GL.viewport(0.0, 0.0, CANVAS.width, CANVAS.height);

        GL.clearColor(0.0, 0.0, 0.0, 1.0);
        GL.enable(GL.DEPTH_TEST);
        GL.depthFunc(GL.LEQUAL);
        GL.clearDepth(1.0);

        //OPTIONAL
        //    GL.enable(GL.VERTEX_PROGRAM_POINT_SIZE);// enables setting point size, although works without it

    } catch (e) {
        alert("You are not webgl compatible :(");
        return false;
    }
};
function initProgram() {
    program = Shadering.createProgram(GL, shaderVertexSource, shaderFragmentSource, programDictionary);
    octreeProgram = Shadering.createProgram(GL, shaderVertexSourceOctree, shaderFragmentSourceOctree, octreeDictionary);
};





function loadResources(callback) {
    console.log("loading shaders...");
    var countResources = 0; //will be kept cause it'll be closure
    var targetCount = 5;
    Utils.loadFile(THIS_FOLDER_PATH + "/vertex.shader", function (xmlhttp) {
        shaderVertexSource = xmlhttp.responseText;
        countResources += 1; //closure created
        if (countResources == targetCount) {
            callback();
        }
    });
    Utils.loadFile(THIS_FOLDER_PATH + "/fragment.shader", function (xmlhttp) {
        shaderFragmentSource = xmlhttp.responseText;
        countResources += 1;
        if (countResources == targetCount) {
            callback();
        }
    });
    Utils.loadFile(THIS_FOLDER_PATH + "/octree_v.shader", function (xmlhttp) {
        shaderVertexSourceOctree = xmlhttp.responseText;
        countResources += 1; //closure created
        if (countResources == targetCount) {
            callback();
        }
    });
    Utils.loadFile(THIS_FOLDER_PATH + "/octree_f.shader", function (xmlhttp) {
        shaderFragmentSourceOctree = xmlhttp.responseText;
        countResources += 1;
        if (countResources == targetCount) {
            callback();
        }
    });
    Utils.loadFile(THIS_FOLDER_PATH + "/dragonDecimated.json", function (xmlhttp) {
        dragonJSONObject = JSON.parse(xmlhttp.responseText);
        countResources += 1;
        if (countResources == targetCount) {
            callback();
        }
    });

};


function loadTexture(url) {

    return new Promise(function (resolve, reject) {
        var image = new Image();

        image.src = url;
        image.webglTexture = null;
        image.onload = function (e) {
            var texture = GL.createTexture();
            GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
            GL.bindTexture(GL.TEXTURE_2D, texture);
            GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, image);
            // GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR_MIPMAP_NEAREST);
            // GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST_MIPMAP_NEAREST);
            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST_MIPMAP_LINEAR);
            GL.generateMipmap(GL.TEXTURE_2D);
            resolve(image);
        }
    })
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

    DELTA.x = (e.clientX - mousePosition.x) * 2 * Math.PI / CANVAS.width / 2,
        DELTA.y = (e.clientY - mousePosition.y) * 2 * Math.PI / CANVAS.height / 2
        ;

    THETA += DELTA.x;
    PHI += DELTA.y;
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