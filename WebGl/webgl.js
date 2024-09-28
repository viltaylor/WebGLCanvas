// Wait for the page to load
window.onload = function() {
    // Get the canvas element
    const canvas = document.getElementById('glCanvas');
    // Initialize the GL context
    const gl = canvas.getContext('webgl');

    // Only continue if WebGL is available and working
    if (!gl) {
        alert('Unable to initialize WebGL. Your browser may not support it.');
        return;
    }

    // Initialize the default color (red)
    let currentColor = [1.0, 0.0, 0.0, 1.0];

    // Function to update the fragment shader color
    function updateFragmentShader(color) {
        const fsSource = `
            void main() {
                gl_FragColor = vec4(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]});
            }
        `;
        const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
        drawScene(gl, shaderProgram);
    }

    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Vertex shader program
    const vsSource = `
        attribute vec4 aVertexPosition;
        void main() {
            gl_Position = aVertexPosition;
        }
    `;

    // Draw the initial red hexagon
    updateFragmentShader(currentColor);

    // Button event listeners
    document.getElementById('redButton').onclick = function() {
        currentColor = [1.0, 0.0, 0.0, 1.0];
        updateFragmentShader(currentColor);
    };

    document.getElementById('greenButton').onclick = function() {
        currentColor = [0.0, 1.0, 0.0, 1.0];
        updateFragmentShader(currentColor);
    };

    document.getElementById('blueButton').onclick = function() {
        currentColor = [0.0, 0.0, 1.0, 1.0];
        updateFragmentShader(currentColor);
    };

    document.getElementById('resetButton').onclick = function() {
        currentColor = [1.0, 0.0, 0.0, 1.0];  // Reset to red
        updateFragmentShader(currentColor);
    };

    // Initialize a shader program, so WebGL knows how to draw our data
    function initShaderProgram(gl, vsSource, fsSource) {
        const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

        // Create the shader program
        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        // If creating the shader program failed, alert
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
            return null;
        }

        return shaderProgram;
    }

    // Creates a shader of the given type, uploads the source, and compiles it.
    function loadShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    // Function to draw the hexagon
    function drawScene(gl, shaderProgram) {
        // Get the attribute location
        const vertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');

        // Create a buffer for the hexagon's positions.
        const positionBuffer = gl.createBuffer();

        // Select the positionBuffer as the one to apply buffer operations to from here out
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // Calculate the positions for a hexagon (6 vertices around a circle)
        const hexagonVertices = [];
        const numSides = 6;
        const radius = 0.7;
        const center = [0.0, 0.0];

        // Add the center point for the TRIANGLE_FAN
        hexagonVertices.push(center[0], center[1]);

        for (let i = 0; i <= numSides; i++) {
            const angle = (i * 2 * Math.PI) / numSides;
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            hexagonVertices.push(x, y);
        }

        // Pass the list of positions into WebGL to build the shape
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(hexagonVertices), gl.STATIC_DRAW);

        // Tell WebGL how to pull out the positions from the position buffer into the vertexPosition attribute
        gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vertexPosition);

        // Use our shader program
        gl.useProgram(shaderProgram);

        // Clear the canvas before we start drawing on it.
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Draw the hexagon using TRIANGLE_FAN
        gl.drawArrays(gl.TRIANGLE_FAN, 0, hexagonVertices.length / 2);
    }
}
    