// Vertex Shader for direct volume rendering

uniform sampler2D volTex;
varying vec4 var_pos;

void main() {
    var_pos = projectionMatrix *
        modelViewMatrix *
        vec4(position, 1.0);
    gl_Position = var_pos;
}
