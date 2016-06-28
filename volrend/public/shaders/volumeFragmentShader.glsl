// Fragment Shader for direct volume rendering

uniform sampler2D volTex;
varying vec4 var_pos;


void sampleVolume(in vec3 pos, out vec4 volumeColor) {

	vec2 texPos = vec2(pos.x + (64.0 * pos.y), pos.z);
    volumeColor = texture2D(volTex, texPos);
}

void main() {

    vec3 eye_pos = cameraPosition; //camera position
    vec3 pos = var_pos.xyz;
    vec3 ray_dir = normalize(pos - eye_pos);
    
    vec4 volColor;
    
    sampleVolume(pos, volColor);
    
    gl_FragColor = vec4(volColor.xyz, 1.0 * pos.z);
}
