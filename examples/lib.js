
var Lib = {

    //multiply 4 coordinates vector v by the inver of matrix m
    //for 4x4 movement matrix only
    //return only the first 3 co. (the last coordinate is useless)
    multiByMatrixInv: function (v, m) {
        return [m[0] * v[0] + m[1] * v[1] + m[2] * v[2] - (m[12] * m[0] + m[13] * m[1] + m[14] * m[2]) * v[3],
            m[4] * v[0] + m[5] * v[1] + m[6] * v[2] - (m[12] * m[4] + m[13] * m[5] + m[14] * m[6]) * v[3],
            m[8] * v[0] + m[9] * v[1] + m[10] * v[2] - (m[12] * m[8] + m[13] * m[9] + m[14] * m[10]) * v[3]];
    },

    //multiply point. P by the inv. of m. For 4x4 mov. matrix only
    multPointByMatrixInv: function (P, m) {
        P.push(1); //apply translation part of m
        return this.multiByMatrixInv(P, m);
    },

    //multiply vect. u by the inv. of m. For 4x4 mov. matrix only
    multVectorByMatrixInv: function (u, m) {
        u.push(0); //do not apply translation part of m
        return this.multiByMatrixInv(u, m);
    },


    degToRad: function (angle) {
        return angle * Math.PI / 180;
    },

    getProjection4: function (angle, ratio, zMin, zMax) {

        var tan = Math.tan(this.degToRad(0.5 * angle)),
            A = -(zMax + zMin) / (zMax - zMin),
            B = (-2 * zMax * zMin) / (zMax - zMin);

        return [
            0.5 / tan, 0, 0, 0,
            0, 0.5 * ratio / tan, 0, 0,
            0, 0, A, -1,
            0, 0, B, 0
        ];
    },
    getIdentity4: function () {
        return [1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1];
    },
    setIdentity4: function (m) {
        m[0] = 1, m[1] = 0, m[2] = 0, m[3] = 0,
            m[4] = 0, m[5] = 1, m[6] = 0, m[7] = 0,
            m[8] = 0, m[9] = 0, m[10] = 1, m[11] = 0,
            m[12] = 0, m[13] = 0, m[14] = 0, m[15] = 1;
    },
    getIdentity3: function () {
        return [1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ];
    },
    rotateX4: function (m, angle) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        var mv1 = m[1], mv5 = m[5], mv9 = m[9];
        m[1] = m[1] * c - m[2] * s;
        m[5] = m[5] * c - m[6] * s;
        m[9] = m[9] * c - m[10] * s;

        m[2] = m[2] * c + mv1 * s;
        m[6] = m[6] * c + mv5 * s;
        m[10] = m[10] * c + mv9 * s;
    },

    rotateY4: function (m, angle) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        var mv0 = m[0], mv4 = m[4], mv8 = m[8];
        m[0] = c * m[0] + s * m[2];
        m[4] = c * m[4] + s * m[6];
        m[8] = c * m[8] + s * m[10];

        m[2] = c * m[2] - s * mv0;
        m[6] = c * m[6] - s * mv4;
        m[10] = c * m[10] - s * mv8;
    },

    rotateZ4: function (m, angle) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        var mv0 = m[0], mv4 = m[4], mv8 = m[8];
        m[0] = c * m[0] - s * m[1];
        m[4] = c * m[4] - s * m[5];
        m[8] = c * m[8] - s * m[9];

        m[1] = c * m[1] + s * mv0;
        m[5] = c * m[5] + s * mv4;
        m[9] = c * m[9] + s * mv8;
    },
    translateZ4: function (m, t) {
        m[14] += t;
    },
    translateY4: function (m, t) {
        m[13] += t;
    },
    translateX4: function (m, t) {
        m[12] += t;
    },
    setPosition: function (m, x, y, z) {
        m[12] = x, m[13] = y, m[14] = z;
    },

    squareVec3: function (v) {
        return v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
    },

    getUnitVector: function (v) {
        var size = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        return (size === 0) ? [0, 0, 0] : [v[0] / size, v[1] / size, v[2] / size];
    },
    transpose43: function (src, dst) {
        dst[0] = src[0], dst[1] = src[4], dst[2] = src[8],
            dst[3] = src[1], dst[4] = src[5], dst[5] = src[9],
            dst[6] = src[2], dst[7] = src[6], dst[8] = src[10];
    },

    normalize: function (u) {
        var size = Math.sqrt(u[0] * u[0] + u[1] * u[1] + u[2] * u[2]);
        u[0] /= size, u[1] /= size, u[2] /= size;
    },

    getTranslation: function (m) {
        return [m[12], m[13], m[14]];
    },

    multVecMat4: function (m, v) {
        return [
            m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12],
            m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13],
            m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14]
        ];
    },

    sub: function (A, B) {
        return [B[0] - A[0], B[1] - A[1], B[2] - A[2]];
    },
    subNew: function (B, A) { // return the vector AB
        return ([A[0] - B[0], A[1] - B[1], A[2] - B[2]]);
    },

    dot: function (u, v) { // scalar product between two vectors
        return u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
    },

    size: function (v) { // get size of a vector
        return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    },

    cross: function (u, v) {
        return [
            u[1] * v[2] - u[2] * v[1],
            -u[0] * v[2] + u[2] * v[0],
            u[0] * v[1] - u[1] * v[0]
        ];
    },

    squareNorm: function (u) {
        return u[0] * u[0] + u[1] * u[1] + u[2] * u[2];
    }

};


var Utils = {
    loadFile: function (url, callback) {
        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                callback(xmlhttp);
            };
        };

        xmlhttp.open("GET", url, true);
        xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xmlhttp.send();
    },
    loadTexture: function (url, callback, callbackToLauchApp, activeTexture) {

        
        var img = new Image();

        img.src = url;
        img.webglTexture = null;
        img.onload = function (e) {
            var tex = GL.createTexture();
            GL.activeTexture(GL.TEXTURE0)
            GL.bindTexture(GL.TEXTURE_2D, tex);

            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST_MIPMAP_LINEAR);
            GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, img);
            GL.generateMipmap(GL.TEXTURE_2D);
            img.webglTexture = tex;
            callback();
            callbackToLauchApp();

        }
        return img;
    },
    loadTextureNext: function (url, onload) {
        var image = new Image();
        image.src = url;
        image.onload = onload;
        return image;
    }

};


if (typeof module !== "undefined") {
    module.exports = {
        Utils: Utils,
        Lib: Lib
    }
}