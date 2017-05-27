var planetTest = {};

planetTest.create = function() {
	var obj = new Object();
	
	obj.position = vec3.create([80,0,0]);
	
	obj.collision = collisionMesh.create();
	obj.collision.addQuad([-50,-50,0], [50,-50,0], [50,50,0], [-50,50,0]);
	obj.collision.addQuad([-40,-40,10], [40,-40,10], [40,-30,10], [-40,-30,10]);
	obj.collision.addTriangle([-30,-30,10], [-25,-30,0], [-30,0,0]);
	obj.collision.addQuad([-40,-30,10], [-30,-30,10], [-30,0,0], [-40,0,0]);
	obj.collision.addQuad([-30,-30,10], [-20,-30,10], [-20,-10,0], [-30,-10,0]);
	obj.collision.addQuad([-20,-30,10], [-10,-30,10], [-10,-20,0], [-20,-20,0]);
	obj.collision.addQuad([-10,-30,10], [0,-30,10], [0,-25,0], [-10,-25,0]);
	obj.collision.addQuad([0,-30,10], [10,-30,10], [10,-28,0], [0,-28,0]);
	obj.collision.addQuad([10,-30,10], [40,-30,10], [40,-30,0], [10,-30,0]);
	obj.collision.scale(2);
	
	obj.collision.addSphere(0,0,40, 20, 10);	
	obj.collision.addBox(0,15,40, 10,30,10, 1);
	obj.collision.addSphere(0,-25,40, 5, 10);
	obj.collision.addBox(0,0,90, 30,30,30, 1);
	obj.collision.addBezier([0,0,130,8,  30,60,130,12,  0,80,160,18, -30,60,160,12,  0,0,160,8,  30,-60,160,12, 0,-80,160,18, -30,-60,130,12,  0,0,130,8], 8, 8);
	
	
	obj.model = modelCreate();
	modelAddQuad(obj.model, [	-50,-50,0,  0,0,1,  0,0,1,
								 50,-50,0,  1,0,1,  0,0,1,
								 50, 50,0,  1,1,1,  0,0,1,
								-50, 50,0,  0,1,1,  0,0,1], 9);
								
	modelAddQuad(obj.model, [	-40,-40,10,  0,0,1,  0,0,1,
								 40,-40,10,  1,0,1,  0,0,1,
								 40,-30,10,  1,1,1,  0,0,1,
								-40,-30,10,  0,1,1,  0,0,1], 9);
								
	modelAddQuad(obj.model, [	-40,-30,10,  0,0,1,  0,0,1,
								-30,-30,10,  1,0,1,  0,0,1,
								-30,  0,0,  1,1,1,  0,0,1,
								-40,  0,0,  0,1,1,  0,0,1], 9);
							
	modelAddVertices(obj.model, [	-30,-30,10, 0,0,1, 0,0,1,
									-25,-30, 0, 1,1,1, 0,0,1,
									-30,  0, 0, 1,0,1, 0,0,1], 9);
								
	modelAddQuad(obj.model, [	-30,-30,10,  0,0,1,  0,0,1,
								-20,-30,10,  1,0,1,  0,0,1,
								-20,-10,0,  1,1,1,  0,0,1,
								-30,-10,0,  0,1,1,  0,0,1], 9);
								
	modelAddQuad(obj.model, [	-20,-30,10,  0,0,1,  0,0,1,
								-10,-30,10,  1,0,1,  0,0,1,
								-10,-20,0,  1,1,1,  0,0,1,
								-20,-20,0,  0,1,1,  0,0,1], 9);
								
	modelAddQuad(obj.model, [	-10,-30,10,  0,0,1,  0,0,1,
								  0,-30,10,  1,0,1,  0,0,1,
								  0,-25,0,  1,1,1,  0,0,1,
								-10,-25,0,  0,1,1,  0,0,1], 9);
								
	modelAddQuad(obj.model, [	  0,-30,10,  0,0,1,  0,0,1,
								 10,-30,10,  1,0,1,  0,0,1,
								 10,-28,0,  1,1,1,  0,0,1,
								  0,-28,0,  0,1,1,  0,0,1], 9);
								  
	modelAddQuad(obj.model, [	 10,-30,10,  0,0,1,  0,0,1,
								 40,-30,10,  1,0,1,  0,0,1,
								 40,-30,0,   1,1,1,  0,0,1,
								 10,-30,0,   0,1,1,  0,0,1], 9);
								 
	modelScale(obj.model, 2, 9);
	
	modelAddSphere(obj.model, 0,0,40, 20, 10);
	modelAddBox(obj.model, 0,15,40, 10,30,10, 1, 1);
	modelAddSphere(obj.model, 0,-25,40, 5, 10);
	modelAddBox(obj.model, 0,0,90, 30,30,30, 1, 1);
	modelAddBezier(obj.model, [0,0,130,8,  30,60,130,12,  0,80,160,18, -30,60,160,12,  0,0,160,8,  30,-60,160,12, 0,-80,160,18, -30,-60,130,12,  0,0,130,8], 8, 8, 0);
	
	//modelAddPath(obj.model, [20,0,40,0,  140,0,65,0,  21,0,90,0], [20,0,45,0,  130,0,65,0,  21,0,85,0], 8, 0);
	
	modelFinish(obj.model);
	obj.shader = hglCreateProgram(shaderPlanetSphere1Vertex, shaderPlanetSphere1Fragment);
	
	obj.tempVec = vec3.create();
	obj.tempVec2 = vec3.create();
	obj.tempVec3 = vec3.create();
	
	obj.distanceFieldSphere = function(pos, spherePos, sphereRadius) {
		vec3.subtract(pos, spherePos, obj.tempVec2);
		return vec3.length(obj.tempVec2) - sphereRadius;
	}
		 
	obj.distanceFieldBox = function(pos, boxPos, boxSize) {
		vec3.subtract(pos, boxPos, obj.tempVec2);
		obj.tempVec2[0] = Math.abs(obj.tempVec2[0]);
		obj.tempVec2[1] = Math.abs(obj.tempVec2[1]);
		obj.tempVec2[2] = Math.abs(obj.tempVec2[2]);
		vec3.subtract(obj.tempVec2, boxSize);
		
		obj.tempVec3[0] = Math.max(obj.tempVec2[0],0);
		obj.tempVec3[1] = Math.max(obj.tempVec2[1],0);
		obj.tempVec3[2] = Math.max(obj.tempVec2[2],0);
		
		return Math.min(Math.max(obj.tempVec2[0],Math.max(obj.tempVec2[1],obj.tempVec2[2])),0) + vec3.length(obj.tempVec3);
	}
	
	obj.distanceFieldCapsule = function(pos, a, b, radA, radB) {
		vec3.subtract(pos, a, obj.tempVec2);
		vec3.subtract(b, a, obj.tempVec3);
		
		var h = vec3.dot(obj.tempVec2, obj.tempVec3) / vec3.dot(obj.tempVec3, obj.tempVec3);
		if (h < 0) h = 0;
		if (h > 1) h = 1;
		
		vec3.scale(obj.tempVec3, h);		
		vec3.subtract(obj.tempVec2, obj.tempVec3);
		
		var d = vec3.length(obj.tempVec2) - (radA + (radB - radA) * h);
		
		return d;
	}
	
	obj.distanceFieldBezier = function(pos, points, length_subdiv) {
		var d = new Object();
		d.d = 10000;
		d.m = 0;
	
		var last = points.length / 4;
		
		for(var b = 1; b < last - 1; b++) {
		
			var iPrev = (b - 1) * 4;
			var iCur = b * 4;
			var iNext = (b + 1) * 4;
		
			var p0 = (b == 1 ? [points[0],points[1],points[2],points[3]] :
				[(points[iPrev] + points[iCur]) / 2,
				(points[iPrev + 1] + points[iCur + 1]) / 2,
				(points[iPrev + 2] + points[iCur + 2]) / 2,
				(points[iPrev + 3] + points[iCur + 3]) / 2]);
				
			var p1 = [points[iCur],points[iCur + 1],points[iCur + 2],points[iCur + 3]];
			
			var p2 = (b == last - 2 ? [points[iNext],points[iNext + 1],points[iNext + 2],points[iNext + 3]] :
				[(points[iNext] + points[iCur]) / 2,
				(points[iNext + 1] + points[iCur + 1]) / 2,
				(points[iNext + 2] + points[iCur + 2]) / 2,
				(points[iNext + 3] + points[iCur + 3]) / 2]);
				
			for(var len = 0; len < length_subdiv; len++) {
			
				var t = len / length_subdiv;
				var pb = bezier4(p0,p1,p2,t);
				
				var t2 = (len + 1) / length_subdiv;
				var pb2 = bezier4(p0,p1,p2,t2);
				
				obj.distanceFieldUnion(d, obj.distanceFieldCapsule(pos, pb, pb2, pb[3], pb2[3]), 0);
			}
		}
		
		return d.d;				
	}
	
	obj.distanceFieldUnion = function(dobj, nd, nm) {
		if (nd < dobj.d) {
			dobj.d = nd;
			dobj.m = nm;
		}
	}
	
	obj.distanceField = function(pos, type) {
		var d = new Object();
		d.d = 10000;
		d.m = 0;
		obj.distanceFieldUnion(d, obj.distanceFieldBox(pos, [-100, -100, -10], [200, 200, 9]));
		obj.distanceFieldUnion(d, obj.distanceFieldSphere(pos, [0,0,40], 20), 0);
		obj.distanceFieldUnion(d, obj.distanceFieldBox(pos, [0,0,90], [15,15,15]), 1);
		obj.distanceFieldUnion(d, obj.distanceFieldBezier(pos, [0,0,130,8,  30,60,130,12,  0,80,160,18, -30,60,160,12,  0,0,160,8,  30,-60,160,12, 0,-80,160,18, -30,-60,130,12,  0,0,130,8], 8), 1);
		return (type == 0 ? d.d : d.m);		
	}
	
	obj.getGravity = function(ret, pos, lastGrav) {
		var eps = 0.0001;
		
		vec3.add(pos, [eps,0,0], obj.tempVec);
		var nxP = obj.distanceField(obj.tempVec, 0);
		vec3.add(pos, [-eps,0,0], obj.tempVec);
		var nxM = obj.distanceField(obj.tempVec, 0);
		
		vec3.add(pos, [0,eps,0], obj.tempVec);
		var nyP = obj.distanceField(obj.tempVec, 0);
		vec3.add(pos, [0,-eps,0], obj.tempVec);
		var nyM = obj.distanceField(obj.tempVec, 0);
		
		vec3.add(pos, [0,0,eps], obj.tempVec);
		var nzP = obj.distanceField(obj.tempVec, 0);
		vec3.add(pos, [0,0,-eps], obj.tempVec);
		var nzM = obj.distanceField(obj.tempVec, 0);
		
		vec3.set([nxM - nxP, nyM - nyP, nzM - nzP], obj.tempVec);
		vec3.set(vec3.normalize(obj.tempVec), ret);
		
		return obj.distanceField(pos, 1);
	}
	
	obj.getMovementStickness = function(ind) {
		return 0;
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