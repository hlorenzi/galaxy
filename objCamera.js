var objCamera = {};

objCamera.create = function () {
	var obj = new Object();
	
	obj.position = vec3.create([0,10,0]);
	obj.positionGoal = vec3.create([80,0,80]);
	
	obj.up = vec3.create([1,0,0]);
	obj.upGoal = vec3.create([1,0,0]);
	
	obj.at = vec3.create([0,10,0]);
	obj.atGoal = vec3.create([0,10,0]);
	
	obj.cameraType = 1;
	
	obj.tempVec = vec3.create();
	obj.tempCross = vec3.create();
	obj.tempProj = vec3.create();
	obj.tempRotMat = mat4.create();
	
	obj.step = function(type, playerPos, playerPosLast, playerFront, playerUp, playerUpLast) {
		/*if (keyToggle) {
			obj.cameraType = (obj.cameraType + 1) % 2;
			keyToggle = 0;
		}*/
		
		obj.cameraType = type;
	
		switch(obj.cameraType) {
			case 0:	obj.updateStandardFromBehind(playerPos, playerUp); break;
			case 1:	obj.updateStandardFromTop(playerPos, playerFront, playerUp, playerUpLast); break;
			case 2:	obj.updateFixedAngleFromBehind(playerPos, playerPosLast, playerUp); break;
		}
		
		//vec3.set([40,10,40], obj.positionGoal);
		//vec3.set([0,0,1], obj.upGoal);
		
		var angleToUpGoal = Math.acos(vec3.dot(obj.up, obj.upGoal));
		if (Math.abs(angleToUpGoal) > 0.000001) {
			vec3.normalize(vec3.cross(obj.up, obj.upGoal, obj.tempCross));
			
			mat4.identity(obj.tempRotMat);
			mat4.rotate(obj.tempRotMat, Math.min(1.0, angleToUpGoal / 16), obj.tempCross);
			
			mat4.multiplyVec3(obj.tempRotMat, obj.up);
			vec3.normalize(obj.up);
		}
		
		vec3.set(playerObj.gravity, obj.atGoal);
		vec3.scale(obj.atGoal, -4);
		vec3.add(obj.atGoal, playerObj.position);
		
		vec3.lerp(obj.position, obj.positionGoal, 1 / 16);
		vec3.lerp(obj.at, obj.atGoal, 1 / 16);
		
	}
	
	
	obj.updateStandardFromBehind = function(playerPos, playerUp) {
		vec3.set(playerUp, obj.upGoal);
	
		vec3.subtract(obj.positionGoal, playerPos, obj.tempProj);
		vec3.projectOnPlane(obj.tempProj, obj.upGoal, obj.tempProj);
		var camDist = vec3.length(obj.tempProj);
		vec3.normalize(obj.tempProj);
		
		/*if (camDist > 28) {
			vec3.scale(obj.tempProj, camDist * 0.95);
			vec3.add(obj.tempProj, playerPos);
			vec3.set(obj.tempProj, obj.positionGoal);
		} else if (camDist < 20) {
			vec3.scale(obj.tempProj, camDist * 1.05);
			vec3.add(obj.tempProj, playerPos);
			vec3.set(obj.tempProj, obj.positionGoal);
		}*/
		vec3.scale(obj.tempProj, 54);
		vec3.add(obj.tempProj, playerPos);
		vec3.set(obj.tempProj, obj.positionGoal);
		
		vec3.scale(obj.upGoal, 24, obj.tempProj);
		vec3.add(obj.positionGoal, obj.tempProj);
	}
	
	obj.updateStandardFromTop = function(playerPos, playerFront, playerUp, playerUpLast) {
		var angleToNewGravity = Math.acos(vec3.dot(playerUpLast, playerUp));
		if (Math.abs(angleToNewGravity) > 0.000001) {
			// Rotate orientation to new gravity
			vec3.normalize(vec3.cross(playerUpLast, playerUp, obj.tempCross));
			
			mat4.identity(obj.tempRotMat);
			mat4.rotate(obj.tempRotMat, angleToNewGravity, obj.tempCross);
			
			mat4.multiplyVec3(obj.tempRotMat, obj.upGoal);
			vec3.normalize(obj.upGoal);
		}
		
		vec3.subtract(obj.positionGoal, playerPos, obj.tempCross);
		vec3.projectOnPlane(obj.tempCross, playerUp, obj.tempProj);
		var camDist = vec3.length(obj.tempProj);
		vec3.normalize(obj.tempProj);
		
		//console.log("CamDist: " + camDist);
		
		if (camDist > 36) {
			vec3.scale(obj.tempProj, 36);//camDist * 0.9);
			vec3.add(obj.tempProj, playerPos);
			vec3.set(obj.tempProj, obj.positionGoal);
			vec3.scale(playerUp, 48, obj.tempProj);
			vec3.add(obj.positionGoal, obj.tempProj);
		}/* else if (camDist < 20) {
			vec3.scale(obj.tempProj, camDist * 1.05);
			vec3.add(obj.tempProj, playerPos);
			vec3.set(obj.tempProj, obj.positionGoal);
		}*/
		
		if (vec3.dot(obj.tempCross, playerUp) < 0) {
			vec3.set(playerPos, obj.positionGoal);
			vec3.scale(playerUp, 48, obj.tempProj);
			vec3.add(obj.positionGoal, obj.tempProj);		
		}
		
		if (vec3.dot(obj.upGoal, playerUp) > 0.5) {
			vec3.set(playerFront, obj.upGoal);	
		}
		
	}
	
	obj.updateFixedAngleFromBehind = function(playerPos, playerPosLast, playerUp) {
		vec3.set(playerUp, obj.upGoal);
	
		vec3.subtract(obj.positionGoal, playerPosLast, obj.tempProj);
		vec3.projectOnPlane(obj.tempProj, obj.upGoal, obj.tempProj);
		var camDist = vec3.length(obj.tempProj);
		vec3.normalize(obj.tempProj);
		
		vec3.scale(obj.tempProj, 54);
		vec3.add(obj.tempProj, playerPosLast);
		vec3.set(obj.tempProj, obj.positionGoal);
		
		vec3.scale(obj.upGoal, 24, obj.tempProj);
		vec3.add(obj.positionGoal, obj.tempProj);
		
		vec3.subtract(playerPos, obj.positionGoal, obj.tempVec);
		if (vec3.dot(obj.tempVec, playerUp) > 0) {
			vec3.scale(obj.tempProj, 54);
			vec3.add(obj.tempProj, playerPos);
			vec3.set(obj.tempProj, obj.positionGoal);
			
			vec3.scale(playerUp, 24, obj.tempProj);
			vec3.add(obj.positionGoal, obj.tempProj);
		}
		
		vec3.subtract(playerPos, playerPosLast, obj.tempVec);
		vec3.add(obj.positionGoal, obj.tempVec);
	}
	
	return obj;
}

