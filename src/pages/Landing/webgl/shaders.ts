/**
 * GLSL shader source strings - true constants, no mutable state.
 * Ported verbatim from the approved mockup. No drawGlow / ring shader exists
 * here (that effect was removed per client feedback and never re-added).
 */

export const VS_SRC = `
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aUV;
uniform mat3 uRotation;
uniform vec2 uCenterPx;
uniform float uRadiusPx;
uniform vec2 uResolution;
uniform float uCamDist;
uniform float uFocal;
varying vec3 vNormal;
varying vec3 vLocalPos;
varying vec3 vWorldPos;
varying vec2 vUV;
void main() {
  vec3 rotatedPos = uRotation * aPosition;
  vec3 rotatedNormal = uRotation * aNormal;
  vec3 viewPos = rotatedPos + vec3(0.0, 0.0, uCamDist);
  float persp = uFocal / viewPos.z;
  vec2 screenLocal = viewPos.xy * persp;
  vec2 pixelPos = uCenterPx + vec2(screenLocal.x, -screenLocal.y) * uRadiusPx;
  vec2 ndc;
  ndc.x = (pixelPos.x / uResolution.x) * 2.0 - 1.0;
  ndc.y = 1.0 - (pixelPos.y / uResolution.y) * 2.0;
  float near = uCamDist - 1.6;
  float far = uCamDist + 1.6;
  float ndcZ = clamp((viewPos.z - near) / (far - near), 0.0, 1.0) * 2.0 - 1.0;
  gl_Position = vec4(ndc, ndcZ, 1.0);
  vNormal = rotatedNormal;
  vLocalPos = aPosition;
  vWorldPos = rotatedPos;
  vUV = aUV;
}
`

// Shared noise helpers, reused verbatim by the planet-body fragment shader
// (kept identical to the original hash/vnoise so pattern "grain" reads
// consistently across every archetype).
export const NOISE_GLSL = `
float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float vnoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  float n000 = hash(i + vec3(0.0,0.0,0.0));
  float n100 = hash(i + vec3(1.0,0.0,0.0));
  float n010 = hash(i + vec3(0.0,1.0,0.0));
  float n110 = hash(i + vec3(1.0,1.0,0.0));
  float n001 = hash(i + vec3(0.0,0.0,1.0));
  float n101 = hash(i + vec3(1.0,0.0,1.0));
  float n011 = hash(i + vec3(0.0,1.0,1.0));
  float n111 = hash(i + vec3(1.0,1.0,1.0));
  return mix(mix(mix(n000,n100,f.x),mix(n010,n110,f.x),f.y),
             mix(mix(n001,n101,f.x),mix(n011,n111,f.x),f.y), f.z);
}
`

export const FS_SRC = `
precision mediump float;
varying vec3 vNormal;
varying vec3 vLocalPos;
varying vec3 vWorldPos;
varying vec2 vUV;
uniform vec3 uBaseColor;
uniform vec3 uBaseColor2;
uniform vec3 uRimColor;
uniform float uAlpha;
uniform float uSurfaceType;
uniform float uPatternSeed;
uniform float uHasPhoto;
uniform float uHasSpec;
uniform sampler2D uDayMap;
uniform sampler2D uSpecMap;

${NOISE_GLSL}

void main() {
  vec3 N = normalize(vNormal);
  vec3 L = normalize(vec3(-0.45, 0.55, -0.55));
  vec3 V = vec3(0.0, 0.0, -1.0);
  float diff = max(dot(N, L), 0.0);
  float ambient = 0.22;
  vec3 seedOff = vec3(uPatternSeed * 11.7, uPatternSeed * 3.1, uPatternSeed * 7.3);
  vec3 bodyColor;
  float oceanMask = 1.0;
  if (uHasPhoto > 0.5) {
    // real photographed/rendered texture (Solar System Scope CC BY 4.0) sampled
    // via standard equirectangular UVs - replaces the procedural noise pattern
    // entirely for this archetype; the async loader seeds this sampler with a
    // flat placeholder pixel matching uBaseColor until the real image decodes,
    // so there is no black/broken frame while it loads.
    bodyColor = texture2D(uDayMap, vUV).rgb;
    if (uHasSpec > 0.5) {
      oceanMask = texture2D(uSpecMap, vUV).r;
    }
  } else if (uSurfaceType < 0.5) {
    // GAS GIANT (Jupiter-like) - irregular warm bands + a signature storm spot
    float warp = vnoise(vLocalPos * 2.2 + seedOff) * 0.5;
    float band = sin(vLocalPos.y * 5.5 + warp * 1.8 + uPatternSeed) * 0.5 + 0.5;
    float fine = vnoise(vLocalPos * 8.0 + seedOff) * 0.15;
    float pattern = clamp(band * 0.85 + fine, 0.0, 1.0);
    bodyColor = mix(uBaseColor2, uBaseColor, pattern);
    vec3 spotCenter = normalize(vec3(sin(uPatternSeed * 3.1), 0.12, cos(uPatternSeed * 3.1)));
    float spotD = distance(vLocalPos, spotCenter);
    float spot = smoothstep(0.42, 0.16, spotD);
    bodyColor = mix(bodyColor, vec3(0.72, 0.30, 0.22), spot * 0.75);
  } else if (uSurfaceType < 1.5) {
    // MOON / ROCKY - gray, heavily cratered, no atmosphere
    float n = vnoise(vLocalPos * 4.5 + seedOff);
    float n2 = vnoise(vLocalPos * 10.0 + seedOff * 1.6);
    float crater = smoothstep(0.5, 0.58, n) - smoothstep(0.58, 0.7, n);
    float pattern = clamp(0.55 - crater * 0.85 + n2 * 0.2, 0.0, 1.0);
    bodyColor = mix(uBaseColor2, uBaseColor, pattern);
  } else if (uSurfaceType < 2.5) {
    // MARS-LIKE - rusty red/orange/tan with darker rocky speckling + faint polar cap
    float n = vnoise(vLocalPos * 3.6 + seedOff);
    float n2 = vnoise(vLocalPos * 9.5 + seedOff * 1.4);
    float speck = smoothstep(0.46, 0.62, n2);
    float pattern = clamp(n * 0.7 + 0.25 - speck * 0.3, 0.0, 1.0);
    bodyColor = mix(uBaseColor2, uBaseColor, pattern);
    float polar = smoothstep(0.8, 0.97, abs(vLocalPos.y));
    bodyColor = mix(bodyColor, vec3(0.72, 0.66, 0.6), polar * 0.35);
  } else if (uSurfaceType < 3.5) {
    // EARTH-LIKE - ocean base + noise-carved continents + baked cloud wisps + polar caps
    float landN = vnoise(vLocalPos * 2.6 + seedOff);
    float landMask = smoothstep(0.48, 0.56, landN);
    vec3 landColor = mix(vec3(0.42, 0.5, 0.28), vec3(0.5, 0.4, 0.26), vnoise(vLocalPos * 5.0 + seedOff * 1.3));
    bodyColor = mix(uBaseColor, landColor, landMask);
    float cloudN = vnoise(vLocalPos * 4.4 + seedOff * 2.1) * 0.5 + vnoise(vLocalPos * 9.0 + seedOff * 3.3) * 0.5;
    float cloud = smoothstep(0.56, 0.74, cloudN);
    bodyColor = mix(bodyColor, vec3(0.96, 0.97, 0.99), cloud * 0.55);
    float polar = smoothstep(0.74, 0.94, abs(vLocalPos.y));
    bodyColor = mix(bodyColor, vec3(0.95, 0.97, 1.0), polar * 0.8);
  } else {
    // ICE GIANT (Neptune/Uranus-like) - smooth pale blue-cyan, minimal noise
    float band = sin(vLocalPos.y * 3.0 + uPatternSeed) * 0.5 + 0.5;
    float fine = vnoise(vLocalPos * 3.0 + seedOff) * 0.12;
    float pattern = clamp(band * 0.4 + fine + 0.35, 0.0, 1.0);
    bodyColor = mix(uBaseColor2, uBaseColor, pattern);
  }
  vec3 lit = bodyColor * (ambient + diff * 0.95);
  vec3 Hf = normalize(L + V);
  // oceanMask (from the real specular/ocean map, Earth only) makes water
  // shine and land stay matte - 1.0 everywhere for non-photo archetypes
  float specMul = mix(0.12, 1.0, oceanMask);
  float spec = pow(max(dot(N, Hf), 0.0), 28.0) * 0.3 * (uHasSpec > 0.5 ? specMul : 1.0);
  float rim = pow(1.0 - max(dot(N, V), 0.0), 2.6);
  vec3 color = lit + uRimColor * rim * 0.85 + vec3(1.0) * spec * 0.4;
  gl_FragColor = vec4(color, uAlpha);
}
`

// Earth cloud-shell shader (Earth archetype only) - a second, very slightly
// larger sphere shell over the day-map sphere, using the real
// cloud-coverage photo's luminance as alpha so clouds visibly float over
// the terrain and can drift at their own speed.
export const FS_CLOUD_SRC = `
precision mediump float;
varying vec3 vNormal;
varying vec2 vUV;
uniform sampler2D uCloudMap;
uniform vec3 uRimColor;
uniform float uAlpha;
void main() {
  vec3 N = normalize(vNormal);
  vec3 L = normalize(vec3(-0.45, 0.55, -0.55));
  float diff = max(dot(N, L), 0.0);
  float coverage = texture2D(uCloudMap, vUV).r;
  float shade = 0.32 + diff * 0.8;
  vec3 color = vec3(1.0, 1.0, 1.0) * shade + uRimColor * 0.06;
  float alpha = coverage * uAlpha * 0.9;
  gl_FragColor = vec4(color, alpha);
}
`
