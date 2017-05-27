function modelPlayerCreate() {
	var obj = new Object();
	obj.modelBody = modelCreate();
	modelAddBox(obj.modelBody, 0,0,1, 2,3,2, 1, 0);
	modelAddBox(obj.modelBody, 0,0,0, 1.2,1.8,3, 1, 6);
	modelFinish(obj.modelBody);
	
	obj.modelArm = modelCreate();
	modelAddVertices(obj.modelArm, [       0, 0.0,  0.0,       0,0,12,  0,0,1,      
										 0.4, 2.4,  0.4,       1,0,12,  0,0,1,   
										-0.4, 2.4,  0.4,       0,1,12,  0,0,1,
										
										   0, 0.0,  0.0,       0,0,12,  -1,0,0,      
										-0.4, 2.4,  0.4,       1,0,12,  -1,0,0,   
										-0.4, 2.4, -0.4,       0,1,12,  -1,0,0,
										
										   0, 0.0,  0.0,       0,0,12,  0,0,-1,      
										-0.4, 2.4, -0.4,       1,0,12,  0,0,-1,   
										 0.4, 2.4, -0.4,       0,1,12,  0,0,-1,
										
										   0, 0.0,  0.0,       0,0,12,  1,0,0,      
										 0.4, 2.4, -0.4,       0,1,12,  1,0,0,  
										 0.4, 2.4,  0.4,       1,0,12,  1,0,0
										
										], 9);
	modelFinish(obj.modelArm);
	
	
	obj.modelFoot = modelCreate();
	modelAddVertices(obj.modelFoot, [    0.5, 1.2,-1.5,     0,0,13,  0,1,0,
										 1.0, 1.2,-2.5,     0,1,13,  0,1,0,
										-1.0, 1.2,-2.5,     1,1,13,  0,1,0,
										
										 0.5, 0.2,-1.5,     0,0,13,  0,-1,0,
										-1.0, 0.2,-2.5,     0,1,13,  0,-1,0,
										 1.0, 0.2,-2.5,     1,1,13,  0,-1,0,
										 
										 0.5, 1.2,-1.5,     0,0,13,  1,0,0,
										 0.5, 0.2,-1.5,     0,1,13,  1,0,0,
										 1.0, 1.2,-2.5,     1,1,13,  1,0,0,
										 
										 0.5, 0.2,-1.5,     0,0,13,  1,0,0,
										 1.0, 0.2,-2.5,     1,0,13,  1,0,0,
										 1.0, 1.2,-2.5,     1,1,13,  1,0,0,
										 
										 
										 0.5, 1.2,-1.5,     0,0,13,  -1,0,0,
										-1.0, 1.2,-2.5,     0,1,13,  -1,0,0,
										 0.5, 0.2,-1.5,     1,1,13,  -1,0,0,
										 
										 0.5, 0.2,-1.5,     0,0,13,  -1,0,0,
										-1.0, 1.2,-2.5,     1,0,13,  -1,0,0,
										-1.0, 0.2,-2.5,     1,1,13,  -1,0,0,
										
										], 9);
	modelFinish(obj.modelFoot);
	
	var pz = -2;
	var pz2 = -40;
	obj.modelShadow = modelCreate();
	modelAddVertices(obj.modelShadow, [	 1, 1.5, pz, 0,0,14, 0,0,1,
										 1,-1.5, pz, 0,0,14, 0,0,1,
										 0, 0, pz2, 0,0,14, 0,0,1,
										 
										-1, 1.5, pz, 0,0,14, 0,0,1,
										 1, 1.5, pz, 0,0,14, 0,0,1,
										 0, 0,pz2, 0,0,14, 0,0,1,
										 
										-1,-1.5, pz, 0,0,14, 0,0,1,
										-1, 1.5, pz, 0,0,14, 0,0,1,
										 0, 0,pz2, 0,0,14, 0,0,1,
										 
										 1,-1.5, pz, 0,0,14, 0,0,1,
										-1,-1.5, pz, 0,0,14, 0,0,1,
										 0, 0,pz2, 0,0,14, 0,0,1,
										 
										 1, 1.5, pz, 0,0,14, 0,0,1,
										-1, 1.5, pz, 0,0,14, 0,0,1,
										 1,-1.5, pz, 0,0,14, 0,0,1,
										
										 1,-1.5, pz, 0,0,14, 0,0,1,
										-1, 1.5, pz, 0,0,14, 0,0,1,
										-1,-1.5, pz, 0,0,14, 0,0,1], 9);
	modelFinish(obj.modelShadow);
	
	obj.shader = hglCreateProgram(shaderPlayerVertex, shaderPlayerFragment);
	
	obj.draw = function(anim, frame) {
		var pushMat = mat4.create();
		
		mat4.translate(hglMatrixModelview, [0,0, 2.5]);
		if (anim == 1) mat4.translate(hglMatrixModelview, [0,0, Math.abs(Math.sin(frame * 2) * 0.5)]);
		if (anim == 2) mat4.translate(hglMatrixModelview, [Math.sin(Math.PI / 2 * frame) * 1.5, 0, 0]);
		mat4.set(hglMatrixModelview, pushMat);
		
		obj.drawShadow();
	
		mat4.set(pushMat, hglMatrixModelview);
	
		if (anim == 0) mat4.rotate(hglMatrixModelview, -Math.sin(Math.PI / 2 * frame * 4 + 1) * Math.PI / 32, [0,-1,0]);
		if (anim == 1) mat4.rotate(hglMatrixModelview, Math.sin(Math.PI * 1.5 / (frame + 1.5)), [0,-1,0]);
		if (anim == 2) mat4.rotate(hglMatrixModelview, Math.sin(Math.PI / 2 * frame) * Math.PI / 4, [0,1,0]);
		if (anim == 3) mat4.rotate(hglMatrixModelview, Math.sin(-1.9 + Math.PI * 3.0 / (frame + 3.0)) * 0.4, [0,-1,0]);
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.modelBody.buffer);
		gl.vertexAttribPointer(obj.shader.vertexPositionAttribute, 3, gl.FLOAT, false, 9 * 4, 0);
		gl.vertexAttribPointer(obj.shader.vertexTextureAttribute, 3, gl.FLOAT, false, 9 * 4, 3 * 4);
		gl.vertexAttribPointer(obj.shader.vertexNormalAttribute, 3, gl.FLOAT, false, 9 * 4, 6 * 4);
		obj.shader.setMatrices();
		gl.drawArrays(gl.TRIANGLES, 0, obj.modelBody.vertices);
		
		mat4.set(pushMat, hglMatrixModelview);
		mat4.translate(hglMatrixModelview, [0,0.4,0.5]);
		if (anim == 0) mat4.rotate(hglMatrixModelview, -Math.sin(Math.PI / 2 * frame * 4) * Math.PI / 8, [0,-1,0]);
		if (anim == 1) mat4.rotate(hglMatrixModelview, Math.sin(frame * 2) * Math.PI / 4, [0,-1,0]);
		if (anim == 2) mat4.rotate(hglMatrixModelview, -Math.sin(Math.PI / 2 * frame), [0,1,0]);
		if (anim == 3) mat4.rotate(hglMatrixModelview, Math.sin(-2.0 + Math.PI * 3.0 / (frame + 3.0)) * 0.5, vec3.normalize([-1,-1,0]));
		mat4.rotate(hglMatrixModelview, Math.PI / 4, [-1,0,0]);
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.modelArm.buffer);
		gl.vertexAttribPointer(obj.shader.vertexPositionAttribute, 3, gl.FLOAT, false, 9 * 4, 0);
		gl.vertexAttribPointer(obj.shader.vertexTextureAttribute, 3, gl.FLOAT, false, 9 * 4, 3 * 4);
		gl.vertexAttribPointer(obj.shader.vertexNormalAttribute, 3, gl.FLOAT, false, 9 * 4, 6 * 4);
		obj.shader.setMatrices();
		gl.drawArrays(gl.TRIANGLES, 0, obj.modelArm.vertices);
		
		mat4.set(pushMat, hglMatrixModelview);
		mat4.translate(hglMatrixModelview, [0,-0.4,0.5]);
		mat4.rotate(hglMatrixModelview, Math.PI, [0,0,1]);
		if (anim == 0) mat4.rotate(hglMatrixModelview, -Math.sin(Math.PI / 2 * frame * 4) * Math.PI / 8, [0,1,0]);
		if (anim == 1) mat4.rotate(hglMatrixModelview, Math.sin(frame * 2) * Math.PI / 4, [0,-1,0]);
		if (anim == 2) mat4.rotate(hglMatrixModelview, Math.sin(Math.PI / 2 * frame), [0,1,0]);
		if (anim == 3) mat4.rotate(hglMatrixModelview, Math.sin(-2.0 + Math.PI * 3.0 / (frame + 3.0)) * 0.5, vec3.normalize([-1,1,0]));
		mat4.rotate(hglMatrixModelview, Math.PI / 4, [-1,0,0]);
		obj.shader.setMatrices();
		gl.drawArrays(gl.TRIANGLES, 0, obj.modelArm.vertices);
		
		
		mat4.set(pushMat, hglMatrixModelview);
		if (anim == 1) mat4.rotate(hglMatrixModelview, Math.sin(frame * 2) * Math.PI / 6, [0,1,0]);
		if (anim == 2) mat4.rotate(hglMatrixModelview, Math.sin(Math.PI / 2 * frame), [0,1,0]);
		if (anim == 3) mat4.rotate(hglMatrixModelview, Math.sin(-2.0 + Math.PI * 3.0 / (frame + 3.0)) * 1.0, [0,-1,0]);
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.modelFoot.buffer);
		gl.vertexAttribPointer(obj.shader.vertexPositionAttribute, 3, gl.FLOAT, false, 9 * 4, 0);
		gl.vertexAttribPointer(obj.shader.vertexTextureAttribute, 3, gl.FLOAT, false, 9 * 4, 3 * 4);
		gl.vertexAttribPointer(obj.shader.vertexNormalAttribute, 3, gl.FLOAT, false, 9 * 4, 6 * 4);
		obj.shader.setMatrices();
		gl.drawArrays(gl.TRIANGLES, 0, obj.modelFoot.vertices);
		
		mat4.set(pushMat, hglMatrixModelview);
		mat4.translate(hglMatrixModelview, [0,-1.4,0]);
		if (anim == 1) mat4.rotate(hglMatrixModelview, Math.sin((frame + Math.PI / 2) * 2) * Math.PI / 6, [0,0.6,0]);
		if (anim == 2) mat4.rotate(hglMatrixModelview, Math.sin(Math.PI / 2 * frame), [0,1,0]);
		if (anim == 3) mat4.rotate(hglMatrixModelview, Math.sin(-1.6 + Math.PI * 3.0 / (frame + 3.0)) * 0.3, [0,1,0]);
		obj.shader.setMatrices();
		gl.drawArrays(gl.TRIANGLES, 0, obj.modelFoot.vertices);
	
		mat4.set(pushMat, hglMatrixModelview);
	}
	
	obj.drawShadow = function() {
		obj.shader.use();
		obj.shader.setMatrices();
		
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.modelShadow.buffer);
		gl.vertexAttribPointer(obj.shader.vertexPositionAttribute, 3, gl.FLOAT, false, 9 * 4, 0);
		gl.vertexAttribPointer(obj.shader.vertexTextureAttribute, 3, gl.FLOAT, false, 9 * 4, 3 * 4);
		gl.vertexAttribPointer(obj.shader.vertexNormalAttribute, 3, gl.FLOAT, false, 9 * 4, 6 * 4);
		
		gl.enable(gl.STENCIL_TEST);
		gl.stencilFunc(gl.ALWAYS, 0, 0xFF);
		gl.stencilMask(0xFF);
		gl.clearStencil(0);
		gl.clear(gl.STENCIL_BUFFER_BIT);

		gl.colorMask(false, false, false, false);
		gl.depthMask(false);
		gl.cullFace(gl.FRONT);
		gl.stencilOp(gl.KEEP, gl.INCR, gl.KEEP);
		gl.drawArrays(gl.TRIANGLES, 0, obj.modelShadow.vertices);

		gl.cullFace(gl.BACK);
		gl.stencilOp(gl.KEEP, gl.DECR, gl.KEEP);
		gl.drawArrays(gl.TRIANGLES, 0, obj.modelShadow.vertices);
		
		gl.colorMask(true, true, true, true);
		gl.stencilMask(0x00);
		gl.stencilFunc(gl.NOTEQUAL, 0, 0xFF);

		gl.drawArrays(gl.TRIANGLES, 0, obj.modelShadow.vertices);
		
		gl.depthMask(true);
		gl.disable(gl.STENCIL_TEST);
	}
	
	return obj;
}