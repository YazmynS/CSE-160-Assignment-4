class Cube {
    constructor(matrix = new Matrix4(), color = [1, 1, 1, 1], textureNum = -2) {
        this.matrix = matrix;
        this.color = color;
        this.textureNum = textureNum;
    }

    render() {
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        gl.uniform1i(u_whichTexture, this.textureNum);

        this.drawCube();
    }

    drawCube() {
        // Define vertices and UVs for a cube.
        let vertices = [
            // Front face
            0, 0, 0,  1, 0, 0,  1, 1, 0,
            0, 0, 0,  1, 1, 0,  0, 1, 0,
            // Back face
            0, 0, 1,  1, 0, 1,  1, 1, 1,
            0, 0, 1,  1, 1, 1,  0, 1, 1,
            // Top face
            0, 1, 0,  1, 1, 0,  1, 1, 1,
            0, 1, 0,  1, 1, 1,  0, 1, 1,
            // Bottom face
            0, 0, 0,  1, 0, 0,  1, 0, 1,
            0, 0, 0,  1, 0, 1,  0, 0, 1,
            // Left face
            0, 0, 0,  0, 1, 0,  0, 1, 1,
            0, 0, 0,  0, 1, 1,  0, 0, 1,
            // Right face
            1, 0, 0,  1, 1, 0,  1, 1, 1,
            1, 0, 0,  1, 1, 1,  1, 0, 1,
        ];

        let uv = [
            0, 0,  1, 0,  1, 1,
            0, 0,  1, 1,  0, 1,
            0, 0,  1, 0,  1, 1,
            0, 0,  1, 1,  0, 1,
            0, 0,  1, 0,  1, 1,
            0, 0,  1, 1,  0, 1,
            0, 0,  1, 0,  1, 1,
            0, 0,  1, 1,  0, 1,
            0, 0,  1, 0,  1, 1,
            0, 0,  1, 1,  0, 1,
            0, 0,  1, 0,  1, 1,
            0, 0,  1, 1,  0, 1,
        ];

        let normals = [
            // Front face (0, 0, -1)
            0, 0, -1,  0, 0, -1,  0, 0, -1,
            0, 0, -1,  0, 0, -1,  0, 0, -1,
            // Back face (0, 0, 1)
            0, 0, 1,  0, 0, 1,  0, 0, 1,
            0, 0, 1,  0, 0, 1,  0, 0, 1,
            // Top face (0, 1, 0)
            0, 1, 0,  0, 1, 0,  0, 1, 0,
            0, 1, 0,  0, 1, 0,  0, 1, 0,
            // Bottom face (0, -1, 0)
            0, -1, 0,  0, -1, 0,  0, -1, 0,
            0, -1, 0,  0, -1, 0,  0, -1, 0,
            // Left face (-1, 0, 0)
            -1, 0, 0,  -1, 0, 0,  -1, 0, 0,
            -1, 0, 0,  -1, 0, 0,  -1, 0, 0,
            // Right face (1, 0, 0)
            1, 0, 0,  1, 0, 0,  1, 0, 0,
            1, 0, 0,  1, 0, 0,  1, 0, 0,
        ];

        for (let i = 0; i < vertices.length; i += 9) {
            let v = vertices.slice(i, i + 9);
            let u = uv.slice((i / 3) * 2, (i / 3) * 2 + 6);
            let n = normals.slice(i, i + 9); 
            drawTriangle3DUVNormal(v, u, n);
        }
    }
}
