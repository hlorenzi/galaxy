var planetStart = {};

planetStart.create = function() {
	var obj = new Object();
	
	obj.collision = collisionMesh.create();
	obj.model = modelCreate();
	obj.gravity = gravityMesh.create();
	
	var subdiv = 10;
	for(var j = 0; j < subdiv; j++) {
		for(var i = 0; i < subdiv; i++) {
			var x = [((i - subdiv / 2) / (subdiv / 2)) * 100, (((i + 1) - subdiv / 2) / (subdiv / 2)) * 100];
			var y = [((j - subdiv / 2) / (subdiv / 2)) * 100, (((j + 1) - subdiv / 2) / (subdiv / 2)) * 100];
			var z = [	Math.cos(((i) - subdiv / 2) / (subdiv / 2)) * 30 + Math.cos(((j) - subdiv / 2) / (subdiv / 2)) * 30,
						Math.cos(((i + 1) - subdiv / 2) / (subdiv / 2)) * 30 + Math.cos(((j) - subdiv / 2) / (subdiv / 2)) * 30,
						Math.cos(((i + 1) - subdiv / 2) / (subdiv / 2)) * 30 + Math.cos(((j + 1) - subdiv / 2) / (subdiv / 2)) * 30,
						Math.cos(((i) - subdiv / 2) / (subdiv / 2)) * 30 + Math.cos(((j + 1) - subdiv / 2) / (subdiv / 2)) * 30];
			
			var vecs = [[x[0],y[0],z[0]], [x[1],y[0],z[1]], [x[1],y[1],z[2]], [x[0],y[1],z[3]]];
			
			obj.collision.addTriangle(vecs[0],vecs[1],vecs[2]);
			obj.collision.addTriangle(vecs[0],vecs[2],vecs[3]);
			
			modelAddVertices(obj.model, [vecs[0][0],vecs[0][1],vecs[0][2],  vecs[0][0],vecs[0][1],vecs[0][2],  0,0,1], 9);
			modelAddVertices(obj.model, [vecs[1][0],vecs[1][1],vecs[1][2],  vecs[1][0],vecs[1][1],vecs[1][2],  0,0,1], 9);
			modelAddVertices(obj.model, [vecs[2][0],vecs[2][1],vecs[2][2],  vecs[2][0],vecs[2][1],vecs[2][2],  0,0,1], 9);
			modelAddVertices(obj.model, [vecs[0][0],vecs[0][1],vecs[0][2],  vecs[0][0],vecs[0][1],vecs[0][2],  0,0,1], 9);
			modelAddVertices(obj.model, [vecs[2][0],vecs[2][1],vecs[2][2],  vecs[2][0],vecs[2][1],vecs[2][2],  0,0,1], 9);
			modelAddVertices(obj.model, [vecs[3][0],vecs[3][1],vecs[3][2],  vecs[3][0],vecs[3][1],vecs[3][2],  0,0,1], 9);
		}
	}
	
	
	modelFinish(obj.model);
	
	
	obj.modelSky = modelCreate();	
	modelAddSphere(obj.modelSky, 0,0,0, 400, 10);
	modelFinish(obj.modelSky);
	
	obj.shader = hglCreateProgram(shaderPlanetStartVertex, shaderPlanetStartFragment);
	obj.shaderSky = hglCreateProgram(shaderSkyStartVertex, shaderSkyStartFragment);
	
	obj.tempVec = vec3.create();
	obj.tempVec2 = vec3.create();
	obj.tempVec3 = vec3.create();
	
	
	obj.getGravity = function(ret, pos, lastGrav) {
		vec3.set([0,0,-1], ret);//obj.gravity.getGravity(pos), ret);
		return 0;
	}
	
	obj.getMovementStickness = function(ind) {
		return 1;
	}
	
	obj.getCollision = function(orig, dir) {
		return obj.collision.checkRay(orig, dir);
	}
	
	obj.getCollisionNormal = function(i) {
		return obj.collision.mesh[i].normal;
	}
	
	obj.draw = function() {
		gl.disable(gl.CULL_FACE);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.model.buffer);
		gl.vertexAttribPointer(obj.shader.vertexPositionAttribute, 3, gl.FLOAT, false, 9 * 4, 0);
		gl.vertexAttribPointer(obj.shader.vertexTextureAttribute, 3, gl.FLOAT, false, 9 * 4, 3 * 4);
		gl.vertexAttribPointer(obj.shader.vertexNormalAttribute, 3, gl.FLOAT, false, 9 * 4, 6 * 4);
		
		obj.shader.use();
		obj.shader.setMatrices();
		gl.drawArrays(gl.TRIANGLES, 0, obj.model.vertices);
		
		
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.modelSky.buffer);
		gl.vertexAttribPointer(obj.shaderSky.vertexPositionAttribute, 3, gl.FLOAT, false, 9 * 4, 0);
		gl.vertexAttribPointer(obj.shaderSky.vertexTextureAttribute, 3, gl.FLOAT, false, 9 * 4, 3 * 4);
		gl.vertexAttribPointer(obj.shaderSky.vertexNormalAttribute, 3, gl.FLOAT, false, 9 * 4, 6 * 4);
		
		obj.shaderSky.use();
		obj.shaderSky.setMatrices();
		gl.drawArrays(gl.TRIANGLES, 0, obj.modelSky.vertices);
		
		
		gl.enable(gl.CULL_FACE);
	}
	
	
	return obj;
}


var shaderSkyStartFragment = 
  "precision mediump float;" +
  
  "uniform float uTime;" +
  
  "varying vec3 vFragColor;" +
  "varying vec3 vFragNormal;" +
  "varying vec3 vFragTexture;" +
  
	"float hash3D(vec3 p) 	{ 		return fract(sin(dot(p,vec3(12.193,89.123,-54.433))) * 43758.5453);	 	}  	float noise(vec3 p) 	{ 		vec3 pint = floor(p); 		vec3 pfrc = fract(p); 		const vec3 padd = vec3(1,0,0); 		 		float v000 = hash3D(pint + padd.yyy); 		float v001 = hash3D(pint + padd.yyx); 		float v010 = hash3D(pint + padd.yxy); 		float v011 = hash3D(pint + padd.yxx); 		float v100 = hash3D(pint + padd.xyy); 		float v101 = hash3D(pint + padd.xyx); 		float v110 = hash3D(pint + padd.xxy); 		float v111 = hash3D(pint + padd.xxx); 		 		return 	mix( 					mix( 						mix(v000,v100,pfrc.x), 						mix(v010,v110,pfrc.x), 						pfrc.y), 					mix( 						mix(v001,v101,pfrc.x), 						mix(v011,v111,pfrc.x), 						pfrc.y), 					pfrc.z); 	}  	float fbm(vec3 p) 	{ 		float r = 0.0; 		float div = 0.75; 		 		for(int i = 0; i < 4; i++) 		{ 			r += noise(p) * div; 			p *= 2.03; 			div *= 0.5; 		} 		 		return r; 	}" +

  "void main(void) {" +
  "    gl_FragColor = mix(vec4(1,1,0,1), mix(vec4(1,1,1,1), mix(vec4(0.3,0.8,1,1), vec4(0.2,0.5,0.8,1), vFragTexture.z), clamp(fbm(vFragTexture * 16.0) + 0.25, 0.0, 1.0)), 1.0);/*clamp(1.0 - (1.0 - length(vFragTexture - vec3(0,0,0))) * 2.0, 0.0, 1.0));*/" +
  "}";

var shaderSkyStartVertex =
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
  
  

var shaderPlanetStartFragment = 
  "precision mediump float;" +
  
  "uniform float uTime;" +
  
  "varying vec3 vFragColor;" +
  "varying vec3 vFragNormal;" +
  "varying vec3 vFragTexture;" +

	"float hash3D(vec3 p) 	{ 		return fract(sin(dot(p,vec3(12.193,89.123,-54.433))) * 43758.5453);	 	}  	float noise(vec3 p) 	{ 		vec3 pint = floor(p); 		vec3 pfrc = fract(p); 		const vec3 padd = vec3(1,0,0); 		 		float v000 = hash3D(pint + padd.yyy); 		float v001 = hash3D(pint + padd.yyx); 		float v010 = hash3D(pint + padd.yxy); 		float v011 = hash3D(pint + padd.yxx); 		float v100 = hash3D(pint + padd.xyy); 		float v101 = hash3D(pint + padd.xyx); 		float v110 = hash3D(pint + padd.xxy); 		float v111 = hash3D(pint + padd.xxx); 		 		return 	mix( 					mix( 						mix(v000,v100,pfrc.x), 						mix(v010,v110,pfrc.x), 						pfrc.y), 					mix( 						mix(v001,v101,pfrc.x), 						mix(v011,v111,pfrc.x), 						pfrc.y), 					pfrc.z); 	}  	float fbm(vec3 p) 	{ 		float r = 0.0; 		float div = 0.75; 		 		for(int i = 0; i < 4; i++) 		{ 			r += noise(p) * div; 			p *= 2.03; 			div *= 0.5; 		} 		 		return r; 	}" +

  "void main(void) {" +
  
  "    vec3 normal = normalize(vFragNormal);" +
  "    /*float eyeZ = -dot(vec3(0,0,-1), normal);" +
  "    float eyeXY = (vec3(0,0,-1) + (eyeZ * normal));*/" +
  
  "    vec3 col = mix(vec3(0.1,0.9,0.2), vec3(0.1,0.7,0.0), clamp(fbm(vFragTexture) + 0.25, 0.0, 1.0));" +
  "    float diffuse = clamp(dot(normalize(normal), normalize(vec3(0,0,1))), 0., 1.);" +
  "    gl_FragColor = mix(vec4(col * (diffuse * 0.5 + 0.5), 1), vec4(1,1,1,1), clamp(1. - (diffuse * 2.), 0., 1.) * 0.5);" +
  "}";

var shaderPlanetStartVertex =
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