export default `\
#version 300 es
#define SHADER_NAME grayscale-bitmap-layer-fragment-shader

precision highp float;

uniform sampler2D grayscaleTexture;
uniform float opacity;

in vec2 vTexCoord;
out vec4 fragColor;

void main() {
  float intensity = texture(grayscaleTexture, vTexCoord).r;
  intensity = (intensity > 0.0) ? 1.0 : 0.0;
  fragColor = vec4(vec3(intensity), intensity * opacity);
}
`;
