var gravityMesh = {}

gravityMesh.create = function() {
	var obj = new Object();
	
	obj.pathMesh = new Array();
	
	obj.addPath = function(pointsA, pointsB, length_subdiv) {
		var last = pointsA.length / 3;
		
		for(var b = 1; b < last - 1; b++) {
		
			var iPrev = (b - 1) * 3;
			var iCur = b * 3;
			var iNext = (b + 1) * 3;
		
			var p0A = (b == 1 ? [pointsA[0],pointsA[1],pointsA[2]] :
				[(pointsA[iPrev] + pointsA[iCur]) / 2,
				(pointsA[iPrev + 1] + pointsA[iCur + 1]) / 2,
				(pointsA[iPrev + 2] + pointsA[iCur + 2]) / 2]);
				
			var p1A = [pointsA[iCur],pointsA[iCur + 1],pointsA[iCur + 2]];
			
			var p2A = (b == last - 2 ? [pointsA[iNext],pointsA[iNext + 1],pointsA[iNext + 2]] :
				[(pointsA[iNext] + pointsA[iCur]) / 2,
				(pointsA[iNext + 1] + pointsA[iCur + 1]) / 2,
				(pointsA[iNext + 2] + pointsA[iCur + 2]) / 2]);
				
			var p0B = (b == 1 ? [pointsB[0],pointsB[1],pointsB[2]] :
				[(pointsB[iPrev] + pointsB[iCur]) / 2,
				(pointsB[iPrev + 1] + pointsB[iCur + 1]) / 2,
				(pointsB[iPrev + 2] + pointsB[iCur + 2]) / 2]);
				
			var p1B = [pointsB[iCur],pointsB[iCur + 1],pointsB[iCur + 2]];
			
			var p2B = (b == last - 2 ? [pointsB[iNext],pointsB[iNext + 1],pointsB[iNext + 2]] :
				[(pointsB[iNext] + pointsB[iCur]) / 2,
				(pointsB[iNext + 1] + pointsB[iCur + 1]) / 2,
				(pointsB[iNext + 2] + pointsB[iCur + 2]) / 2]);
				
			
				
			for(var len = 0; len < length_subdiv; len++) {
			
				var t1 = len / length_subdiv;
				var t2 = (len + 1) / length_subdiv;
				var pbA1 = bezier(p0A,p1A,p2A,t1);
				var pbB1 = bezier(p0B,p1B,p2B,t1);
				var pbA2 = bezier(p0A,p1A,p2A,t2);
				var pbB2 = bezier(p0B,p1B,p2B,t2);
				
				var pline1 = vec3.create();
				vec3.add(pbA1,pbB1,pline1);
				vec3.scale(pline1,0.5);
				
				var pline2 = vec3.create();
				vec3.add(pbA2,pbB2,pline2);
				vec3.scale(pline2,0.5);
				
				var pdist = vec3.create();
				if (vec3.length(vec3.subtract(pline1,pline2,pdist)) < 0.001) break;
				
				var line = new Object();
				line.start = pline1;
				line.end = pline2;
				
				line.bezierA0 = p0A;
				line.bezierA1 = p1A;
				line.bezierA2 = p2A;
				
				line.bezierB0 = p0B;
				line.bezierB1 = p1B;
				line.bezierB2 = p2B;
				
				line.tstart = t1;
				line.tend = t2;
				
				obj.pathMesh.push(line);
			}
		}
	}
	
	obj.tempVec = vec3.create();
	obj.tempVec2 = vec3.create();
	obj.tempVec3 = vec3.create();
	obj.tempCross = vec3.create();
	
	obj.lineDistance = function(pos, a, b) {
		vec3.subtract(pos, a, obj.tempVec2);
		vec3.subtract(b, a, obj.tempVec3);
		
		var h = vec3.dot(obj.tempVec2, obj.tempVec3) / vec3.dot(obj.tempVec3, obj.tempVec3);
		if (h < 0) h = 0;
		if (h > 1) h = 1;
		
		vec3.scale(obj.tempVec3, h);		
		vec3.subtract(obj.tempVec2, obj.tempVec3);
		
		return vec3.length(obj.tempVec2);
	}
	
	obj.lineDirection = function(pos, a, b) {
		vec3.subtract(pos, a, obj.tempVec2);
		vec3.subtract(b, a, obj.tempVec3);
		
		var h = vec3.dot(obj.tempVec2, obj.tempVec3) / vec3.dot(obj.tempVec3, obj.tempVec3);
		if (h < 0) h = 0;
		if (h > 1) h = 1;
		
		vec3.lerp(a, b, h, obj.tempCross);
		
		return vec3.subtract(obj.tempCross,pos);
	}
	
	obj.lineT = function(pos, a, b) {
		vec3.subtract(pos, a, obj.tempVec2);
		vec3.subtract(b, a, obj.tempVec3);
		
		var h = vec3.dot(obj.tempVec2, obj.tempVec3) / vec3.dot(obj.tempVec3, obj.tempVec3);
		if (h < 0) h = 0;
		if (h > 1) h = 1;
		
		return h;
	}
	
	obj.getGravity = function(pos) {
		var maxDist = 10000;
		var curGravity = [0,0,-1];
	
		for(var i = 0; i < obj.pathMesh.length; i++) {
			var line = obj.pathMesh[i];
		
			var dist = obj.lineDistance(pos, line.start, line.end);
			if (dist < maxDist) {
				maxDist = dist;
				var t = obj.lineT(pos, line.start, line.end);
				t = (line.tstart + (line.tend - line.tstart) * t);
				var bezierA0 = bezier(line.bezierA0, line.bezierA1, line.bezierA2, t);
				var bezierA1 = bezier(line.bezierA0, line.bezierA1, line.bezierA2, t + 0.001);
				var bezierB0 = bezier(line.bezierB0, line.bezierB1, line.bezierB2, t);
				
				var A0_to_A1 = vec3.create();
				vec3.subtract(bezierA1, bezierA0, A0_to_A1);
				var A0_to_B0 = vec3.create();
				vec3.subtract(bezierB0, bezierA0, A0_to_B0);
				
				vec3.normalize(vec3.cross(A0_to_B0, A0_to_A1, curGravity));
			}
		}
		
		return curGravity;
	}
	
	return obj;
}