var objLaunchStar = {};

objLaunchStar.create = function(pos, path1, path2) {
	var obj = new Object();
	
	obj.position = pos;
	obj.path1 = path1;
	obj.path2 = path2;
	
	obj.model = modelCreate();
	modelAddVertices(obj.model, [0,0,2,   1,1,0.15,  0,0,1], 9);
	
	for(var i = 0; i < 5; i++) {
		var angle = (i / 5) * Math.PI * 2;
		var angle2 = ((i + 0.5) / 5) * Math.PI * 2;
		
		modelAddVertices(obj.model, [Math.cos(angle) * 8,Math.sin(angle) * 8,2,  1,1,0.15,  0,0,1], 9);		
		modelAddVertices(obj.model, [Math.cos(angle2) * 4,Math.sin(angle2) * 4,2,   1,1,0.15,  0,0,1], 9);		
	}
	
	modelAddVertices(obj.model, [Math.cos(0) * 8,Math.sin(0) * 8,2,   1,1,0.15,  0,0,1], 9);
	modelFinish(obj.model);
	
	obj.shader = hglCreateProgram(shaderPlanetSphere1Vertex, shaderPlanetSphere1Fragment);
	
	obj.gravity = vec3.create();
	planetList[0].getGravity(obj.gravity, obj.position, vec3.create([0,0,-1]));
	
	obj.front = vec3.create();
	vec3.set([0.5,0.3,0.25], obj.front);
	vec3.normalize(vec3.cross(obj.front,obj.gravity,obj.front));
	
	obj.tempVec = vec3.create();
	obj.tempCross = vec3.create();
	
	
	obj.step = function() {
		if (keyToggle) {
			keyToggle = 0;
			
			vec3.set(obj.position, obj.tempVec);
			vec3.subtract(obj.tempVec, playerObj.position);
			if (vec3.length(obj.tempVec) < 8) {
				playerObj.launch(obj.path1,obj.path2);
			}
		}
	}
	
	obj.draw = function() {
		var pushMat = mat4.create();
	
		var matOrientationFront = mat3.create();
		vec3.cross([0,0,-1], [-1,0,0], obj.tempCross);
		mat3.set([ 0,-1,obj.tempCross[0],
				   0, 0,obj.tempCross[1],
				  -1, 0,obj.tempCross[2]], matOrientationFront);
		
		var orientation = obj.tempVec;
		vec3.set(obj.front, orientation);
		//mat4.identity(obj.tempRotMat);
		//mat4.rotate(obj.tempRotMat, obj.moveFront - obj.facingDirection, obj.gravity);
		//mat4.multiplyVec3(obj.tempRotMat, orientation);
		
		vec3.cross(obj.gravity, orientation, obj.tempCross);
		
		var matOrientationFace = mat3.create();
		mat3.set([obj.gravity[0],obj.gravity[1],obj.gravity[2],
				  orientation[0],orientation[1],orientation[2],
				  obj.tempCross[0],obj.tempCross[1],obj.tempCross[2]], matOrientationFace);
		
		
		mat4.set(hglMatrixModelview, pushMat);
		mat4.translate(hglMatrixModelview, obj.position);
		mat4.multiply(hglMatrixModelview, mat4.multiply(mat3.toMat4(matOrientationFace), mat3.toMat4(matOrientationFront)));
				
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.model.buffer);
		gl.vertexAttribPointer(obj.shader.vertexPositionAttribute, 3, gl.FLOAT, false, 9 * 4, 0);
		gl.vertexAttribPointer(obj.shader.vertexTextureAttribute, 3, gl.FLOAT, false, 9 * 4, 3 * 4);
		gl.vertexAttribPointer(obj.shader.vertexNormalAttribute, 3, gl.FLOAT, false, 9 * 4, 6 * 4);
		
		obj.shader.use();
		obj.shader.setMatrices();
		gl.drawArrays(gl.TRIANGLE_FAN, 0, obj.model.vertices);
		
		mat4.set(pushMat, hglMatrixModelview);
	
	}
	
	return obj;
}