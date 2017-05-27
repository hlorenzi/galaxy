var objPlayer = {};

objPlayer.create = function() {
	var obj = new Object();
	
	obj.camera = objCamera.create();
	
	obj.position = vec3.create([-40,0,40]);
	obj.lastPosition = vec3.create([-40,0,40]);
	obj.speed = vec3.create([0,0,0]);
	obj.speedMove = vec3.create([0,0,0]);
	
	obj.moveFront = 0;
	obj.moveShouldUpdateDir = 1;
	obj.moveX = 0;
	obj.moveY = 0;
	obj.facingDirection = 0;
	obj.wasWalking = 0;
	obj.didJump = 0;
	obj.onGround = 0;
	obj.groundCollisionIndex = 0;
	obj.subplanetIndex = 0;
	obj.gravityForce = 0.05;
	
	obj.isLaunching = 0;
	obj.launchCounter = 0;
	obj.launchCounterMax = 1;
	obj.launchPath1 = 0;
	obj.launchPath2 = 0;
	
	obj.animType = 0;
	obj.animFrame = 0;
	obj.animTime = 0;
	obj.smoke = objSmoke.create();
	obj.smokeCounter = 0;
	obj.stepSoundCounter = 0;
	obj.stepSound = 1;
	
	obj.gravity = vec3.create([0,0,-1]);
	obj.lastGravity = vec3.create([0,0,-1]);
	obj.front = vec3.create([1,0,0]);
	
	obj.tempGravityAccel = vec3.create();
	obj.tempCross = vec3.create();
	obj.tempSpeed = vec3.create();
	obj.tempVec = vec3.create();
	obj.tempVec2 = vec3.create();
	obj.tempVec3 = vec3.create();
	obj.tempMat = mat4.create();
	obj.tempMat2 = mat4.create();
	obj.tempRotMat = mat4.create();

	obj.model = modelPlayerCreate();
	
	obj.modelFront = modelCreate();
	modelAddVertices(obj.modelFront, [0,-1,0,  1,0,0,
									 10,0,0,   1,0,0,
									 0,1,0,   1,0,0,
									 
									 0,0,-1,  1,0,0,
									 10,0,0,   1,0,0,
									 0,0,1,   1,0,0], 6);
	modelFinish(obj.modelFront);
	
	obj.modelFace = modelCreate();
	modelAddVertices(obj.modelFace, [0,-1,0,  1,0,1,
									 10,0,0,  1,0,1,
									 0,1,0,   1,0,1,
									 
									 0,0,-1,  1,0,1,
									 10,0,0,  1,0,1,
									 0,0,1,   1,0,1], 6);
	modelFinish(obj.modelFace);
	
	obj.launch = function(path1, path2) {
		obj.isLaunching = 1;
		obj.launchCounter = 0;
		obj.launchCounterMax = 1;
		obj.launchPath1 = path1;
		obj.launchPath2 = path2;
	}
	
	obj.step = function() {	
		vec3.set(obj.position, obj.lastPosition);
		
		// Move
		vec3.scale(obj.tempSpeed, 0);
		if (obj.onGround == 1) {
			obj.gravityForce = 0.05;
			vec3.projectOnPlane(obj.speedMove, planetList[0].getCollisionNormal(obj.groundCollisionIndex), obj.tempSpeed);
		} else {
			//obj.gravityForce += 0.001;
			vec3.add(obj.tempSpeed, obj.speedMove);
		}
		vec3.add(obj.tempSpeed, obj.speed);
		vec3.add(obj.position, obj.tempSpeed);
		
		obj.handleMovement();
		
		
		vec3.scale(obj.gravity, obj.gravityForce, obj.tempGravityAccel);
		vec3.add(obj.speed, obj.tempGravityAccel);
		if (vec3.length(obj.speed) > 3) {
			vec3.scale(vec3.normalize(obj.speed), 3);
		}
		vec3.add(obj.speed, obj.speedMove, obj.tempSpeed);
		if (vec3.length(obj.tempSpeed) > 3) {
			vec3.scale(vec3.normalize(obj.tempSpeed), 3);
		}
		
		// Check wall collision
		//vec3.normalize(obj.speedMove, obj.tempVec);
		vec3.scale(obj.tempVec, 0);
		vec3.add(obj.tempVec, obj.position);
		vec3.scale(obj.gravity, -4, obj.tempVec2);
		vec3.add(obj.tempVec, obj.tempVec2);
		
		vec3.normalize(obj.speedMove, obj.tempVec2);
		var col = planetList[0].getCollision(obj.tempVec, obj.tempVec2);
		var index1 = col.index;
		if (col.hit == 1) {
			vec3.set(planetList[0].getCollisionNormal(col.index), obj.tempCross);
			vec3.projectOnPlane(obj.tempCross, obj.gravity, obj.tempCross);
			vec3.normalize(obj.tempCross);
			var wallangle = Math.abs(vec3.dot(obj.tempVec2, obj.tempCross));
			var distPerpendicular = col.distance * wallangle;
			
			if (distPerpendicular < 2) {
				vec3.projectOnPlane(obj.speedMove, obj.tempCross, obj.tempVec3);
				vec3.set(obj.tempVec3, obj.speedMove);
				
				vec3.scale(obj.tempCross, 2 - distPerpendicular);
				vec3.add(obj.position, obj.tempCross);
			}
		} else {
			/*vec3.scale(obj.tempVec, 0);
			vec3.add(obj.tempVec, obj.position);
			vec3.scale(obj.gravity, -0.1, obj.tempVec2);
			vec3.add(obj.tempVec, obj.tempVec2);
			
			vec3.normalize(obj.speedMove, obj.tempVec2);
			var col = planetList[0].getCollision(obj.tempVec, obj.tempVec2);
			if (col.hit == 1) {
				vec3.set(planetList[0].getCollisionNormal(col.index), obj.tempCross);
				var dot = Math.abs(vec3.dot(obj.gravity, obj.tempCross));
				vec3.projectOnPlane(obj.tempCross, obj.gravity, obj.tempCross);
				vec3.normalize(obj.tempCross);
				var wallangle = Math.abs(vec3.dot(obj.tempVec2, obj.tempCross));
				var distPerpendicular = col.distance * wallangle;
				
				if (distPerpendicular < 2 && dot < 0.5) {
					vec3.projectOnPlane(obj.speedMove, obj.tempCross, obj.tempVec3);
					vec3.set(obj.tempVec3, obj.speedMove);
					
					vec3.scale(obj.tempCross, 2 - distPerpendicular);
					vec3.add(obj.position, obj.tempCross);
				}
			}*/
		}
		
		// Check floor collision
		var lastOnGround = obj.onGround;
		obj.onGround = 0;
		vec3.scale(obj.gravity, -4, obj.tempVec);
		vec3.add(obj.tempVec, obj.position);
		var col = planetList[0].getCollision(obj.tempVec, obj.gravity);
		if (col.hit == 1) {
			if (col.distance < 4 || (col.distance < 6 && lastOnGround == 1)) {
				vec3.set(planetList[0].getCollisionNormal(col.index), obj.tempCross);
				var dot = Math.abs(vec3.dot(obj.gravity, obj.tempCross));
				
				if (dot < 0.5) {
					vec3.projectOnPlane(obj.speed, obj.tempCross, obj.tempVec);
					vec3.set(obj.tempVec, obj.speed);
					//vec3.set([0,0,0], obj.speedMove);					
				} else {
					vec3.set([0,0,0], obj.speed);
					obj.onGround = 1;
					obj.groundCollisionIndex = col.index;
				}
				
				vec3.scale(obj.gravity, 4 - col.distance, obj.tempVec);
				vec3.negate(obj.tempVec);
				vec3.add(obj.position, obj.tempVec);
			}
		}
		
		var doSmokeLandJump = 0;
		if (lastOnGround == 0 && obj.onGround == 1) {
			doSmokeLandJump = 1;
			soundPlay("sndLand");
		}
		
		if (keyJump == 1) {
			keyJump = 0;
			if (obj.onGround == 1) {
				obj.onGround = 0;
				obj.didJump = 1;
				doSmokeLandJump = 1;
				vec3.scale(obj.gravity, -1, obj.tempVec);
				vec3.add(obj.speed, obj.tempVec);
				soundPlay("sndJump");
			}
		}
		
		if (doSmokeLandJump == 1) {
			for(var i = 0; i < 8; i++) {
				mat4.identity(obj.tempRotMat);
				mat4.rotate(obj.tempRotMat, obj.moveFront + (i / 8 * Math.PI * 2), obj.gravity);
				vec3.set(obj.front, obj.tempVec);
				vec3.scale(obj.tempVec, 0.7 + Math.random() * 0.1);
				mat4.multiplyVec3(obj.tempRotMat, obj.tempVec);
				
				vec3.set(obj.gravity, obj.tempVec2);
				vec3.negate(obj.tempVec2);
				vec3.scale(obj.tempVec2, Math.random() * 0.2);
				vec3.add(obj.tempVec, obj.tempVec2);
				
				vec3.scale(obj.tempVec, 0.5);
				
				obj.smoke.add(obj.position, obj.tempVec);
			}
		}
		
		
		// Rotate gravity
		obj.subplanetIndex = planetList[0].getGravity(obj.tempVec, obj.position, obj.lastGravity);
		var angleToGravity = Math.acos(vec3.dot(obj.gravity, obj.tempVec));
		if (Math.abs(angleToGravity) > 0.0001) {
			vec3.normalize(vec3.cross(obj.gravity, obj.tempVec, obj.tempCross));
			
			mat4.identity(obj.tempRotMat);
			mat4.rotate(obj.tempRotMat, angleToGravity / 8, obj.tempCross);
			
			mat4.multiplyVec3(obj.tempRotMat, obj.gravity);
			vec3.normalize(obj.gravity);
			
			mat4.multiplyVec3(obj.tempRotMat, obj.speed);
			
			//vec3.rotateAxis(obj.gravity, angleToGravity / 8, obj.tempCross, obj.gravity);
			//vec3.rotateAxis(obj.speed, angleToGravity / 8, obj.tempCross, obj.speed);
		}
		
		// Rotate orientation to new gravity
		var angleToNewGravity = Math.acos(vec3.dot(obj.lastGravity, obj.gravity));
		if (Math.abs(angleToNewGravity) > 0.0001) {
			vec3.normalize(vec3.cross(obj.lastGravity, obj.gravity, obj.tempCross));
			
			mat4.identity(obj.tempRotMat);
			mat4.rotate(obj.tempRotMat, angleToNewGravity, obj.tempCross);
			
			mat4.multiplyVec3(obj.tempRotMat, obj.front);
			vec3.normalize(obj.front);
		}
		
		
		vec3.negate(obj.gravity, obj.tempVec);
		vec3.negate(obj.lastGravity, obj.tempVec2);
		// camera step here
		vec3.set(obj.gravity, obj.lastGravity);
		
		
		
		
		
		
		
		if (obj.isLaunching == 1) {
			vec3.set(bezier([obj.launchPath1[0],obj.launchPath1[1],obj.launchPath1[2],0],
							[obj.launchPath1[3],obj.launchPath1[4],obj.launchPath1[5],0],
							[obj.launchPath1[6],obj.launchPath1[7],obj.launchPath1[8],0], obj.launchCounter), obj.tempVec);
							
			vec3.set(bezier([obj.launchPath2[0],obj.launchPath2[1],obj.launchPath2[2],0],
							[obj.launchPath2[3],obj.launchPath2[4],obj.launchPath2[5],0],
							[obj.launchPath2[6],obj.launchPath2[7],obj.launchPath2[8],0], obj.launchCounter), obj.tempVec2);
							
			vec3.set(bezier([obj.launchPath1[0],obj.launchPath1[1],obj.launchPath1[2],0],
							[obj.launchPath1[3],obj.launchPath1[4],obj.launchPath1[5],0],
							[obj.launchPath1[6],obj.launchPath1[7],obj.launchPath1[8],0], obj.launchCounter + 1 / 240), obj.tempVec3);
							
			vec3.set(obj.tempVec, obj.position);
			
			vec3.negate(vec3.normalize(vec3.subtract(obj.tempVec3, obj.tempVec)));
			
			vec3.subtract(obj.tempVec2, obj.tempVec);
			
			vec3.set(obj.tempVec3, obj.gravity);
			
			//(vec3.normalize(vec3.cross(obj.tempVec3, obj.tempVec2, obj.camera.upGoal)));
			//vec3.add(vec3.scale(obj.tempVec3, 80, obj.camera.positionGoal), obj.position);
			
			vec3.add(vec3.scale(vec3.normalize(vec3.cross(obj.tempVec3, obj.tempVec2, obj.camera.positionGoal)), 10), obj.position);
			vec3.negate(vec3.set(obj.tempVec3, obj.camera.upGoal));
			
			vec3.scale(obj.tempVec3, 20);
			vec3.add(obj.camera.positionGoal, obj.tempVec3);
			
			obj.camera.step(-1, obj.position, obj.lastPosition, obj.front, obj.tempVec, obj.tempVec2);
							
			obj.launchCounter += 1 / 240;
			if (obj.launchCounter >= obj.launchCounterMax) {
				obj.isLaunching = 0;
			}
		} else {
			//console.log(obj.subplanetIndex);
			obj.camera.step(obj.subplanetIndex == undefined ? 0 : 1, obj.position, obj.lastPosition, obj.front, obj.tempVec, obj.tempVec2);
		}
	}
	
	obj.handleMovement = function() {
		var pressX = 0;
		var pressY = 0;
		if (keyRight) pressX += 1;
		if (keyLeft) pressX += -1;
		if (keyUp) pressY += -1;
		if (keyDown) pressY += 1;
		var pressDir = direction(0,0,pressX,pressY) + Math.PI / 2;
		var moveDir = 0;
		var moveDist = 0;
		
		if (pressX == 0 && pressY == 0) {
			obj.moveX = approach(obj.moveX, 0, 0.025);
			obj.moveY = approach(obj.moveY, 0, 0.025);
			moveDir = direction(0,0,obj.moveX,obj.moveY);
			obj.moveShouldUpdateDir = 1;
		} else {
			obj.wasWalking = 1;
			
			if (obj.moveShouldUpdateDir == 1 || obj.camera.cameraType != 1) {
				obj.moveShouldUpdateDir = planetList[0].getMovementStickness(obj.subplanetIndex);
				
				// Project joypad onto screen
				var topY = -1000;
				var upDir = 0;
				
				var testNum = 32;
				
				// Get screen transform
				mat4.multiply(hglMatrixProjection, hglMatrixModelview, obj.tempMat);
				
				// Get increment rotation
				mat4.identity(obj.tempRotMat);
				mat4.rotate(obj.tempRotMat, Math.PI * 2 / testNum, obj.gravity);
				vec3.set(obj.front, obj.tempVec);
				
				// Test for SCREEN-UP direction
				for(var i = 0; i < testNum; i++) {
					mat4.multiplyVec3(obj.tempMat, obj.tempVec, obj.tempVec2);
					
					if (obj.tempVec2[1] > topY) {
						topY = obj.tempVec2[1];
						upDir = i;
					}
					
					mat4.multiplyVec3(obj.tempRotMat, obj.tempVec);
				}
				
				obj.moveFront = Math.PI * 2 / testNum * upDir;
			}
			
			obj.moveX = approach(obj.moveX, -Math.cos(pressDir) * 0.5, 0.025);
			obj.moveY = approach(obj.moveY, Math.sin(pressDir) * 0.5, 0.025);
			moveDir = direction(0,0,obj.moveX,obj.moveY);
			obj.facingDirection = moveDir;
		}
		
		moveDist = Math.sqrt(obj.moveX * obj.moveX + obj.moveY * obj.moveY);
		
		obj.smokeCounter--;
		if (obj.onGround == 0) {
			if (true || obj.didJump == 1) {
				if (obj.animType != 3) {
					obj.animType = 3;
					obj.animFrame = 0;
					obj.animTime = 0;
				}
				
				obj.animTime += 1 / 60;
				obj.animFrame += 0.75 * Math.max(1 / (obj.animTime * 1 + 1), 0.5);
			}
		} else if (pressX == 0 && pressY == 0) {
			if (obj.animType == 2) {
				obj.animFrame += 1 / 8;
				
				if (obj.smokeCounter <= 0) {
					obj.smokeCounter = 0;
					mat4.identity(obj.tempRotMat);
					mat4.rotate(obj.tempRotMat, obj.moveFront - moveDir + (Math.random() * 1 - 0.5), obj.gravity);
					vec3.set(obj.front, obj.tempVec);
					mat4.multiplyVec3(obj.tempRotMat, obj.tempVec);
					
					vec3.set(obj.gravity, obj.tempVec2);
					vec3.negate(obj.tempVec2);
					vec3.scale(obj.tempVec2, Math.random() * 0.2);
					vec3.add(obj.tempVec, obj.tempVec2);
					
					vec3.scale(obj.tempVec, 0.5);
					
					obj.smoke.add(obj.position, obj.tempVec);
				}
				
				if (obj.animFrame >= 2) {
					obj.animType = 0;
					obj.animFrame = 0;
				}
			} else if (obj.wasWalking == 1 && moveDist > 0.4) {
				obj.animType = 2;
				obj.animFrame = 0;
				obj.animTime = 0;
				obj.wasWalking = 0;
				soundPlay("sndSkid");
			} else {
				obj.animType = 0;
				obj.animFrame += 1 / 60;
				obj.animTime = 0;
			}
		} else {
			if (obj.smokeCounter <= 0) {
				obj.smokeCounter = (obj.animTime < 0.2 ? 0 : 5);
				
				mat4.identity(obj.tempRotMat);
				mat4.rotate(obj.tempRotMat, obj.moveFront - moveDir + (Math.random() * 1 - 0.5), obj.gravity);
				vec3.set(obj.front, obj.tempVec);
				mat4.multiplyVec3(obj.tempRotMat, obj.tempVec);
				vec3.negate(obj.tempVec);
				
				vec3.set(obj.gravity, obj.tempVec2);
				vec3.negate(obj.tempVec2);
				vec3.scale(obj.tempVec2, Math.random() * 0.8);
				vec3.add(obj.tempVec, obj.tempVec2);
				
				vec3.scale(obj.tempVec, (obj.animTime < 0.1 ? 0.5 : 0.1));
				
				obj.smoke.add(obj.position, obj.tempVec);
			}
			if (obj.animType != 1) {
				obj.animTime = 0;
				obj.animFrame = 0;
				obj.stepSoundCounter = 2;
			}
			obj.animType = 1;
			obj.animTime += 1 / 60;
			obj.animFrame += moveDist * 0.75 * Math.max(1 / (obj.animTime * 1 + 1), 0.5);
			
			obj.stepSoundCounter--;
			if (obj.stepSoundCounter <= 0) {
				obj.stepSoundCounter = Math.min(obj.animTime * 10, 7);
				soundPlay("sndStep" + (obj.stepSound + 1));
				obj.stepSound = (obj.stepSound + 1) % 3;
			}
		}
		
			
		mat4.identity(obj.tempRotMat);
		mat4.rotate(obj.tempRotMat, obj.moveFront - moveDir, obj.gravity);
		vec3.set(obj.front, obj.tempVec);
		mat4.multiplyVec3(obj.tempRotMat, obj.tempVec);
		vec3.scale(obj.tempVec, vec3.length(vec3.create([obj.moveX, obj.moveY, 0])));
		vec3.set(obj.tempVec, obj.speedMove);
	}
	
	obj.draw = function() {
		var pushMat = mat4.create();
		
		// Draw player
		var matOrientationFront = mat3.create();
		vec3.cross([0,0,-1], [-1,0,0], obj.tempCross);
		mat3.set([ 0,-1,obj.tempCross[0],
				   0, 0,obj.tempCross[1],
				  -1, 0,obj.tempCross[2]], matOrientationFront);
		
		var orientation = obj.tempVec;
		vec3.set(obj.front, orientation);
		mat4.identity(obj.tempRotMat);
		mat4.rotate(obj.tempRotMat, obj.moveFront - obj.facingDirection, obj.gravity);
		mat4.multiplyVec3(obj.tempRotMat, orientation);
		
		vec3.cross(obj.gravity, orientation, obj.tempCross);
		
		var matOrientationFace = mat3.create();
		mat3.set([obj.gravity[0],obj.gravity[1],obj.gravity[2],
				  orientation[0],orientation[1],orientation[2],
				  obj.tempCross[0],obj.tempCross[1],obj.tempCross[2]], matOrientationFace);
		
		
		mat4.set(hglMatrixModelview, pushMat);
		mat4.translate(hglMatrixModelview, obj.position);
		mat4.multiply(hglMatrixModelview, mat4.multiply(mat3.toMat4(matOrientationFace), mat3.toMat4(matOrientationFront)));
		obj.model.draw(obj.animType, obj.animFrame);
		
		mat4.set(pushMat, hglMatrixModelview);
		
		obj.smoke.update();
		obj.smoke.draw();
		
		mat4.set(pushMat, hglMatrixModelview);
		
		/*
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.modelFront.buffer);
		gl.vertexAttribPointer(planetShader.vertexPositionAttribute, 3, gl.FLOAT, false, 6 * 4, 0);
		gl.vertexAttribPointer(planetShader.vertexColorAttribute, 3, gl.FLOAT, false, 6 * 4, 3 * 4);
		
		mat4.identity(obj.tempRotMat);
		var angleToFront4 = Math.acos(vec3.dot([1,0,0], obj.front));
		if (Math.abs(angleToFront4) > 0.001) {
			vec3.normalize(vec3.cross([1,0,0], obj.front, obj.tempCross));
			mat4.rotate(obj.tempRotMat, angleToFront4, obj.tempCross);
		}		
		mat4.set(pushMat, hglMatrixModelview);
		mat4.translate(hglMatrixModelview, obj.position);
		//mat4.multiply(hglMatrixModelview, obj.tempRotMat);
		planetShader.use();
		planetShader.setMatrices();
		gl.drawArrays(gl.TRIANGLES, 0, obj.modelFront.vertices);
		
		
		
		
		
		
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.modelFace.buffer);
		gl.vertexAttribPointer(planetShader.vertexPositionAttribute, 3, gl.FLOAT, false, 6 * 4, 0);
		gl.vertexAttribPointer(planetShader.vertexColorAttribute, 3, gl.FLOAT, false, 6 * 4, 3 * 4);
		
		vec3.set(obj.front, obj.tempVec);
		mat4.identity(obj.tempRotMat);
		mat4.rotate(obj.tempRotMat, obj.moveFront - obj.facingDirection, obj.gravity);
		mat4.multiplyVec3(obj.tempRotMat, obj.tempVec);
		mat4.multiplyVec3(matInvGravity, obj.tempVec);
		vec3.normalize(orientation);
		
		mat4.identity(obj.tempRotMat);
		var angleToFront4 = Math.acos(vec3.dot([1,0,0], obj.tempVec));
		if (Math.abs(angleToFront4) > 0.001) {
			vec3.normalize(vec3.cross([1,0,0], obj.tempVec, obj.tempCross));
			mat4.rotate(obj.tempRotMat, angleToFront4, obj.tempCross);
		}
		
		mat4.set(pushMat, hglMatrixModelview);
		mat4.translate(hglMatrixModelview, obj.position);
		mat4.multiply(hglMatrixModelview, obj.tempRotMat);
		planetShader.use();
		planetShader.setMatrices();
		gl.drawArrays(gl.TRIANGLES, 0, obj.modelFace.vertices);*/
	}
	
	return obj;
}