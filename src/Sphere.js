class Sphere {
    constructor(M, color, textureNum = -2) {
        this.type = 'sphere';
        this.color = color;
        this.matrix = M;
        this.textureNum = textureNum;
        this.verts32 = new Float32Array([]);
    }

    render() {
        // Define sin, cos, and tan shortcuts
        const sin = Math.sin;
        const cos = Math.cos;

        var rgba = this.color;

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        var d = Math.PI / 10;
        var dd = Math.PI / 10;

        for (var t = 0; t < Math.PI; t += d) {
            for (var r = 0; r < 2 * Math.PI; r += d) {
                // Define sphere vertices
                var p1 = [sin(t) * cos(r), sin(t) * sin(r), cos(t)];
                var p2 = [sin(t + dd) * cos(r), sin(t + dd) * sin(r), cos(t + dd)];
                var p3 = [sin(t) * cos(r + dd), sin(t) * sin(r + dd), cos(t)];
                var p4 = [sin(t + dd) * cos(r + dd), sin(t + dd) * sin(r + dd), cos(t + dd)];

                // Normalize the normals for smooth shading
                var n1 = normalize(p1);
                var n2 = normalize(p2);
                var n3 = normalize(p3);
                var n4 = normalize(p4);

                function normalize(v) {
                    let len = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
                    return [v[0] / len, v[1] / len, v[2] / len];
                }

                var v = [];
                var uv = [];

                // First triangle (p1, p2, p3)
                v = v.concat(p1); uv = uv.concat([0, 0]);
                v = v.concat(p2); uv = uv.concat([0, 0]);
                v = v.concat(p3); uv = uv.concat([0, 0]);

                gl.uniform4f(u_FragColor, 1, 1, 1, 1);
                drawTriangle3DUVNormal(v, uv, v);

                // Second triangle (p2, p4, p3)
                v = [];
                uv = [];
                v = v.concat(p2); uv = uv.concat([0, 0]);
                v = v.concat(p4); uv = uv.concat([0, 0]);
                v = v.concat(p3); uv = uv.concat([0, 0]);

                gl.uniform4f(u_FragColor, 1, 1, 1, 1);
                drawTriangle3DUVNormal(v, uv, v);
            }
        }
    }
}
