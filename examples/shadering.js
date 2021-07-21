
var Shadering = {
    createShader: function (gl, type, sourceString) {

        var shader = gl.createShader(type);

        gl.shaderSource(shader, sourceString);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.log(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;

    },

    createProgram: function (gl, vsScript, fsScript, dictionary) {


        var fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, fsScript),
            vertexShader = this.createShader(gl, gl.VERTEX_SHADER, vsScript),
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
            shaderProgram[attribute] = gl.getAttribLocation(shaderProgram, attribute);
            gl.enableVertexAttribArray(shaderProgram[attribute]);
        }

        for (var u = 0, l = uniforms.length; u < l; u++) {
            uniform = uniforms[u];
            shaderProgram[uniform] = gl.getUniformLocation(shaderProgram, uniform);

        }

        return shaderProgram;
    }
};