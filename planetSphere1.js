var planetSphere1 = {};

planetSphere1.create = function() {
	var obj = new Object();
	
	obj.position = vec3.create([0,0,0]);
	
	obj.collision = collisionMesh.create();
	obj.collision.addSphere(0,0,0, 30, 10);
	obj.collision.addTriangle([-8,-8,40], [8,-8,40], [-8,8,40]);
	obj.collision.addTriangle([-8,-8,40], [-8,8,40], [-8,8,30]);
	obj.collision.addTriangle([-8,-8,40], [-8,8,30], [-8,-8,30]);
	obj.collision.addTriangle([-8,-8,40], [8,-8,30], [8,-8,40]);
	obj.collision.addTriangle([-8,-8,40], [-8,-8,30], [8,-8,30]);
	
	obj.model = modelCreate();
	modelAddSphere(obj.model, 0,0,0, 30, 10);
	modelAddVertices(obj.model, [	-8,-8,40,   1,0,1,   0,0,1,
									8,-8,40,   1,1,0,   0,0,1,
									-8,8,40,   0,1,1,   0,0,1,
									
									-8,-8,40,   1,0,1,   -1,0,0,
									-8,8,40,   1,1,0,   -1,0,0,
									-8,8,30, 0,1,1,   -1,0,0,
									
									-8,-8,40,   1,0,1,   -1,0,0,
									-8,8,30, 0,1,1,   -1,0,0,
									-8,-8,30, 1,1,0,   -1,0,0,
									
									-8,-8,40,   1,0,1,   -1,0,0,
									8,-8,30, 0,1,1,   -1,0,0,
									8,-8,40,   1,1,0,   -1,0,0,
									
									-8,-8,40,   1,0,1,   -1,0,0,
									-8,-8,30, 1,1,0,   -1,0,0,
									8,-8,30, 0,1,1,   -1,0,0,
									
									], 9);
	modelFinish(obj.model);
	obj.shader = hglCreateProgram(shaderPlanetSphere1Vertex, shaderPlanetSphere1Fragment);
	
	obj.tempVec = vec3.create();
	
	obj.getGravity = function(pos, lastGrav) {
		return [0,0,-1];//vec3.normalize(vec3.subtract(pos, obj.position, obj.tempVec));
	}
	
	obj.getCollision = function(orig, dir) {
		return obj.collision.checkRay(orig, dir);
	}
	
	obj.getCollisionNormal = function(i) {
		return obj.collision.mesh[i].normal;
	}
	
	obj.draw = function() {
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.model.buffer);
		gl.vertexAttribPointer(obj.shader.vertexPositionAttribute, 3, gl.FLOAT, false, 9 * 4, 0);
		gl.vertexAttribPointer(obj.shader.vertexTextureAttribute, 3, gl.FLOAT, false, 9 * 4, 3 * 4);
		gl.vertexAttribPointer(obj.shader.vertexNormalAttribute, 3, gl.FLOAT, false, 9 * 4, 6 * 4);
		
		obj.shader.use();
		obj.shader.setMatrices();
		gl.drawArrays(gl.TRIANGLES, 0, obj.model.vertices);
	}
	
	return obj;
}

var shaderPlanetSphere1Fragment = 
  "precision mediump float;" +
  
  "uniform float uTime;" +
  
  "varying vec3 vFragColor;" +
  "varying vec3 vFragNormal;" +
  "varying vec3 vFragTexture;" +

  "void main(void) {" +
  "    vec3 col = vFragTexture;" +
  "    if (mod(floor(vFragTexture.x * 200.), 20.) == 0.) col *= 0.5;" +
  "    if (mod(floor(vFragTexture.y * 200.), 20.) == 0.) col *= 0.5;" +
  "    if (mod(floor(vFragTexture.z * 200.), 20.) == 0.) col *= 0.5;" +
  "    float diffuse = clamp(dot(normalize(vFragNormal), normalize(vec3(0,0,1))), 0., 1.);" +
  "    gl_FragColor = mix(vec4(col * (diffuse * 0.5 + 0.5), 1), vec4(1,1,1,1), clamp(1. - (diffuse * 2.), 0., 1.) * 0.5);" +
  "}";

var shaderPlanetSphere1Vertex =
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