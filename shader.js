
  
var shaderPlayerFragment = 
  "precision mediump float;" +
  
  "uniform float uTime;" +
  
  "varying vec3 vFragColor;" +
  "varying vec3 vFragNormal;" +
  "varying vec3 vFragTexture;" +

  "void main(void) {" +
  "    vec2 tex = (vFragTexture.xy * 2. - vec2(1.,1.));" +
  "    vec3 col = mix(vec3(1,0.8,0.5), vec3(0.9,0.7,0.4), sin(tex.x * 40. + cos(tex.y * 10.) * 2.) * 0.5 + 0.5);" +
  "    float eyeAnim = 1. / clamp(mod(uTime, 2.) * 4., 0.2, 1.0); /*2. / (mod(uTime, 2.) * 0.5 + 1.);*/" +
  "    vec2 eyeTex = vec2(((abs(tex.x)) * 3. - 0.6) * (1.15 - eyeAnim * 0.15), tex.y * eyeAnim);" +
  "    if (vFragTexture.z == 5.) {if (length(eyeTex) < 0.15) {if (length(eyeTex * vec2(0.5,1) + vec2(0.05 + cos(uTime * 32.) * 0.005,-0.1)) < 0.075) col = vec3(1,1,1); else col = vec3(0,0,0);}}" +
  "    float diffuse = clamp(dot(normalize(vFragNormal), normalize(vec3(0,0,1))), 0., 1.);" +
  "    gl_FragColor = mix(vec4(col * (diffuse * 0.5 + 0.5), 1), vec4(1,1,1,1), clamp(1. - (diffuse * 2.), 0., 1.) * 0.5);" +
  "    if (vFragTexture.z == 14.) gl_FragColor = vec4(0,0,0,0.75);" +
  "}";

var shaderPlayerVertex =
  "attribute vec3 aVertexPosition;" +
  "attribute vec3 aVertexColor;" +
  "attribute vec3 aVertexTexture;" +
  "attribute vec3 aVertexNormal;" +

  "uniform mat4 uMVMatrix;" +
  "uniform mat4 uPMatrix;" +

  "varying vec3 vFragColor;" +
  "varying vec3 vFragNormal;" +
  "varying vec3 vFragTexture;" +
  
  "void main(void) {" +
  "  gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);" +
  "  vFragNormal = vec3(uMVMatrix * vec4(aVertexNormal, 0.0));" +
  "  vFragColor = aVertexTexture;" +
  "  vFragTexture = aVertexTexture;" +
  "}";
  
var shaderSmokeFragment = 
  "precision mediump float;" +
  
  "uniform float uTime;" +
  
  "varying vec3 vFragColor;" +
  "varying vec3 vFragNormal;" +
  "varying vec3 vFragTexture;" +

  "void main(void) {" +
  "    vec2 tex = (vFragTexture.xy * 2. - vec2(1.,1.));" +
  "    vec3 col = vec3(1,1,1);" +
  "    float diffuse = clamp(dot(normalize(vFragNormal), normalize(vec3(0,0,1))), 0., 1.);" +
  "    gl_FragColor = mix(vec4(col * (diffuse * 0.2 + 0.8), 1), vec4(1,1,1,1), clamp(1. - (diffuse * 2.), 0., 1.) * 0.5);" +
  "}";

var shaderSmokeVertex =
  "attribute vec3 aVertexPosition;" +
  "attribute vec3 aVertexColor;" +
  "attribute vec3 aVertexTexture;" +
  "attribute vec3 aVertexNormal;" +

  "uniform mat4 uMVMatrix;" +
  "uniform mat4 uPMatrix;" +

  "varying vec3 vFragColor;" +
  "varying vec3 vFragNormal;" +
  "varying vec3 vFragTexture;" +
  
  "void main(void) {" +
  "  gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);" +
  "  vFragNormal = vec3(uMVMatrix * vec4(aVertexNormal, 0.0));" +
  "  vFragColor = aVertexTexture;" +
  "  vFragTexture = aVertexTexture;" +
  "}";