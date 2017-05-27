var objSmoke = {};

objSmoke.create = function() {
	var obj = new Object();
	
	obj.list = new Array();
	obj.maximum = 40;
	for(var i = 0; i < obj.maximum; i++) {
		var s = new Object();
		s.position = vec3.create();
		s.speed = vec3.create();
		s.rotation = 0;
		s.size = 0;
		s.active = 0;
		obj.list.push(s);
	}
	
	obj.model = modelCreate();
	modelAddSphere(obj.model, 0.5,-0.5,0.5, 1, 2);
	modelAddSphere(obj.model, -0.5,-0.5,0.5, 1, 2);
	modelAddSphere(obj.model, 0,0.5,0.5, 1, 2);
	modelAddSphere(obj.model, 0,0,-0.5, 1, 2);
	modelFinish(obj.model);
	
	obj.shader = hglCreateProgram(shaderSmokeVertex, shaderSmokeFragment);
	
	obj.update = function() {
		for(var i = 0; i < obj.maximum; i++) {
			var s = obj.list[i];
			
			if (s.active == 0) continue;
			
			vec3.add(s.position, s.speed);
			vec3.scale(s.speed, 0.9);
			s.rotation += s.size / 16;
			s.size -= 0.01
			if (s.size <= 0) s.active = 0;
		}	
	}
	
	obj.add = function(pos, spd) {
		for(var i = 0; i < obj.maximum; i++) {
			var s = obj.list[i];
			
			if (s.active != 0) continue;
			
			vec3.set(pos, s.position);
			vec3.set(spd, s.speed);
			s.size = 1;
			s.rotation = Math.random() * Math.PI * 2;
			s.active = 1;	
			break;
		}	
	}
	
	obj.draw = function() {
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.model.buffer);
		gl.vertexAttribPointer(obj.shader.vertexPositionAttribute, 3, gl.FLOAT, false, 9 * 4, 0);
		gl.vertexAttribPointer(obj.shader.vertexTextureAttribute, 3, gl.FLOAT, false, 9 * 4, 3 * 4);
		gl.vertexAttribPointer(obj.shader.vertexNormalAttribute, 3, gl.FLOAT, false, 9 * 4, 6 * 4);
		
		obj.shader.use();
		
		var pushMat = mat4.create();
		mat4.set(hglMatrixModelview, pushMat);
			
		for(var i = 0; i < obj.maximum; i++) {
			var s = obj.list[i];
			
			if (s.active == 0) continue;
			
			mat4.set(pushMat, hglMatrixModelview);
			mat4.translate(hglMatrixModelview, s.position);
			mat4.scale(hglMatrixModelview, [s.size * 0.75,s.size * 0.75,s.size * 0.75]);
			mat4.rotate(hglMatrixModelview, s.rotation, vec3.normalize([1,1,1]));
			obj.shader.setMatrices();
			gl.drawArrays(gl.TRIANGLES, 0, obj.model.vertices);
		}
	}
	
	return obj;
}