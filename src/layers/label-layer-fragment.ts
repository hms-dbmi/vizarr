export default `\
#version 300 es
#define SHADER_NAME grayscale-bitmap-layer-fragment-shader

precision highp float;

uniform sampler2D uGrayscaleTexture;
uniform float opacity;

in vec2 vTexCoord;
out vec4 fragColor;

void main() {
    float intensity = texture(uGrayscaleTexture, vTexCoord).r;
    fragColor = vec4(vec3(intensity), intensity * opacity);
}
`;
