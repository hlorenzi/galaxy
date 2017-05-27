var collisionMesh = {};

collisionMesh.create = function() {
	var obj = new Object();
	
	obj.mesh = new Array();
	
	obj.tempVec = vec3.create();
	obj.tempVec2 = vec3.create();
	obj.tempVec3 = vec3.create();
	
	obj.intersectData = new Object();
	obj.intersectData.hit = 0;
	obj.intersectData.position = vec3.create();
	obj.intersectData.distance = 0;
	obj.intersectData.u = 0;
	obj.intersectData.v = 0;
	obj.intersectData.index = 0;
	
	obj.addTriangle = function(v1, v2, v3) {
		var t = new Object();
		
		t.v1 = vec3.create(v1);
		t.v21 = vec3.create(vec3.subtract(v2, v1, obj.tempVec));
		t.v31 = vec3.create(vec3.subtract(v3, v1, obj.tempVec));
		t.normal = vec3.create(vec3.normalize(vec3.cross(t.v21, t.v31, obj.tempVec)));
		
		obj.mesh.push(t);
	}
	
	obj.scale = function(s) {
		for(var i = 0; i < obj.mesh.length; i++) {
			var t = obj.mesh[i];
			vec3.scale(t.v1, s);
			vec3.scale(t.v21, s);
			vec3.scale(t.v31, s);
		}	
	}
	
	obj.checkRay = function(rayOrigin, rayDirection) {
		var margin = 0.000001;
		
		obj.intersectData.hit = 0;
		obj.intersectData.distance = 1e30;
		
		for(var i = 0; i < obj.mesh.length; i++) {
			var triangleVec1 = obj.mesh[i].v21;
			var triangleVec2 = obj.mesh[i].v31;
			
			var crossVecP = vec3.cross(rayDirection, triangleVec2, obj.tempVec);
			var det = vec3.dot(crossVecP, triangleVec1);
			
			if (det < margin) continue;
			
			var triangleVec0 = obj.mesh[i].v1;
			var triangleVertToOrigin = vec3.subtract(rayOrigin, triangleVec0, obj.tempVec2);
			var u = vec3.dot(triangleVertToOrigin, crossVecP);
			
			if (u < 0 || u > det) continue;
			
			var crossVecQ = vec3.cross(triangleVertToOrigin, triangleVec1, obj.tempVec3);
			var v = vec3.dot(rayDirection, crossVecQ);
			
			if (v < 0 || u + v > det) continue;
			
			var dist = Math.abs(vec3.dot(triangleVec2, crossVecQ) / det);
			
			if (dist < obj.intersectData.distance) {
				obj.intersectData.hit = 1;
				vec3.set(rayDirection, obj.intersectData.position);
				vec3.scale(obj.intersectData.position, dist);
				vec3.add(obj.intersectData.position, rayOrigin);
				obj.intersectData.distance = dist;
				obj.intersectData.u = u;
				obj.intersectData.v = v;
				obj.intersectData.index = i;
			}
		}
		
		return obj.intersectData;
	}
	
	obj.addQuad = function(v1, v2, v3, v4) {
		obj.addTriangle(v1, v2, v3);
		obj.addTriangle(v1, v3, v4);
	}
	
	obj.addSphere = function (x, y, z, radius, subdiv) {	
		var px = [0,1,2];
		var py = [1,2,0];
		var pz = [2,0,1];
		var vec = [vec3.create(), vec3.create(), vec3.create()];
		for(var sg = 0; sg < 2; sg++) {
			for(var k = 0; k < 3; k++) {
				for(var j = 0; j < subdiv; j++) {
					for(var i = 0; i < subdiv; i++) {
						
						var pi = [(-0.5 + (i / subdiv)) * radius,
									(-0.5 + ((i + 1) / subdiv)) * radius];
						var pj = [(-0.5 + (j / subdiv)) * radius,
									(-0.5 + ((j + 1) / subdiv)) * radius];
						
						var trisX = [0,1,0, 1,1,0];
						var trisY = [0,0,1, 0,1,1];
						
						
						for(var t = 0; t < 6; t++) {
							var vert = [pi[trisX[t]] * (1 - sg * 2), 
										pj[trisY[t]],
										radius / 2 * (1 - sg * 2)];
							
							var vertlen = Math.sqrt(vert[0] * vert[0] +
													vert[1] * vert[1] +
													vert[2] * vert[2]);
													
							vert[0] *= 1 / vertlen;	
							vert[1] *= 1 / vertlen;	
							vert[2] *= 1 / vertlen;
						
							vec3.set([	vert[px[k]] * radius + x,
										vert[py[k]] * radius + y,
										vert[pz[k]] * radius + z], vec[t % 3]);
										
							if (t % 3 == 2) {
								obj.addTriangle(vec[0], vec[1], vec[2]);
							}
						}
					}
				}
			}
		}
	}
	
	obj.addBox = function(x, y, z, sizeX, sizeY, sizeZ, subdiv) {	
		var px = [0,1,2];
		var py = [1,2,0];
		var pz = [2,0,1];
		var vec = [vec3.create(), vec3.create(), vec3.create()];
		
		for(var sg = 0; sg < 2; sg++) {
			for(var k = 0; k < 3; k++) {
				for(var j = 0; j < subdiv; j++) {
					for(var i = 0; i < subdiv; i++) {
						
						var pi = [(-0.5 + (i / subdiv)),
									(-0.5 + ((i + 1) / subdiv))];
						var pj = [(-0.5 + (j / subdiv)),
									(-0.5 + ((j + 1) / subdiv))];
						
						var trisX = [0,1,0, 1,1,0];
						var trisY = [0,0,1, 0,1,1];
						
						for(var t = 0; t < 6; t++) {
							var vert = [pi[trisX[t]] * (1 - sg * 2), 
										pj[trisY[t]],
										1 / 2 * (1 - sg * 2)];
										
							var normal = [0,0,(1 - sg * 2)];
						
							vec3.set([	vert[px[k]] * sizeX + x,
										vert[py[k]] * sizeY + y,
										vert[pz[k]] * sizeZ + z], vec[t % 3]);
										
							if (t % 3 == 2) {
								obj.addTriangle(vec[0], vec[1], vec[2]);
							}
						}
					}
				}
			}
		}
	}
	
	obj.addBezier = function(points, radius_subdiv, length_subdiv) {
		var last = points.length / 4;
		var vec = [vec3.create(), vec3.create(), vec3.create()];
		
		var up = [0,0,0];
		var nextUp = [0,0,0];
		
		var bezierpoints = new Array();
		
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
				
			
			if (b == 1) {
				var t = -0.01;
				var pb = bezier4(p0,p1,p2,t);
			
				bezierpoints.push(pb[0]);
				bezierpoints.push(pb[1]);
				bezierpoints.push(pb[2]);
				bezierpoints.push(pb[3]);
			}
				
			for(var len = 0; len < length_subdiv; len++) {
			
				var t = len / length_subdiv;
				var pb = bezier4(p0,p1,p2,t);
			
				bezierpoints.push(pb[0]);
				bezierpoints.push(pb[1]);
				bezierpoints.push(pb[2]);
				bezierpoints.push(pb[3]);
			}
			
			if (b == last - 2) {
				var t = 1;
				var pb = bezier4(p0,p1,p2,t);
			
				bezierpoints.push(pb[0]);
				bezierpoints.push(pb[1]);
				bezierpoints.push(pb[2]);
				bezierpoints.push(pb[3]);
				
				var t = 1.01;
				var pb = bezier4(p0,p1,p2,t);
			
				bezierpoints.push(pb[0]);
				bezierpoints.push(pb[1]);
				bezierpoints.push(pb[2]);
				bezierpoints.push(pb[3]);
			
			}
		}
			
			
		for(var b = 1; b < bezierpoints.length / 4 - 2; b++) {
		
			var pt0 = [bezierpoints[(b - 1) * 4],bezierpoints[(b - 1) * 4 + 1],bezierpoints[(b - 1) * 4 + 2],bezierpoints[(b - 1) * 4 + 3]];
			var pt1 = [bezierpoints[(b - 0) * 4],bezierpoints[(b - 0) * 4 + 1],bezierpoints[(b - 0) * 4 + 2],bezierpoints[(b - 0) * 4 + 3]];
			var pt2 = [bezierpoints[(b + 1) * 4],bezierpoints[(b + 1) * 4 + 1],bezierpoints[(b + 1) * 4 + 2],bezierpoints[(b + 1) * 4 + 3]];
			var pt3 = [bezierpoints[(b + 2) * 4],bezierpoints[(b + 2) * 4 + 1],bezierpoints[(b + 2) * 4 + 2],bezierpoints[(b + 2) * 4 + 3]];
			
			var p01 = vec3.create();
			vec3.normalize(vec3.subtract(pt1,pt0,p01));
			var p12 = vec3.create();
			vec3.normalize(vec3.subtract(pt2,pt1,p12));
			var p23 = vec3.create();
			vec3.normalize(vec3.subtract(pt3,pt2,p23));
			
			
			var dirVec = vec3.create();
			vec3.normalize(vec3.add(p01,p12,dirVec));
			
			var dirVec2 = vec3.create();
			vec3.normalize(vec3.add(p12,p23,dirVec2));
			
			
			vec3.set(nextUp, up);
			
			if (up[0] == 0 && up[1] == 0 && up[2] == 0) {
				vec3.set([0.5,0.3,0.25], up);
				vec3.normalize(vec3.cross(up,dirVec,up));
				vec3.set(up,nextUp);
			}
			
			var angleUp = Math.acos(vec3.dot(dirVec, dirVec2));
			if (Math.abs(angleUp) > 0.00001) {
				var upMat = mat4.create();
				mat4.identity(upMat);
				var tempCross = vec3.create();
				vec3.normalize(vec3.cross(dirVec, dirVec2, tempCross));
				mat4.rotate(upMat, angleUp, tempCross);
				
				mat4.multiplyVec3(upMat, nextUp);
				vec3.normalize(nextUp);
			}
			
			
			
			var curRadUp = vec3.create();
			var curRadNextUp = vec3.create();
			var curRadUp2 = vec3.create();
			var curRadNextUp2 = vec3.create();
			
			var rotMat = mat4.create();
			for(var rad = 0; rad < radius_subdiv; rad++) {
				mat4.identity(rotMat);
				mat4.rotate(rotMat, rad / radius_subdiv * Math.PI * 2, dirVec);			
				vec3.set(up, curRadUp);
				vec3.scale(curRadUp, pt1[3]);
				mat4.multiplyVec3(rotMat, curRadUp);
				vec3.add(curRadUp, pt1);
				
				mat4.identity(rotMat);
				mat4.rotate(rotMat, rad / radius_subdiv * Math.PI * 2, dirVec2);			
				vec3.set(nextUp, curRadNextUp);
				vec3.scale(curRadNextUp, pt2[3]);
				mat4.multiplyVec3(rotMat, curRadNextUp);
				vec3.add(curRadNextUp, pt2);
				
				mat4.identity(rotMat);
				mat4.rotate(rotMat, (rad + 1) / radius_subdiv * Math.PI * 2, dirVec);			
				vec3.set(up, curRadUp2);
				vec3.scale(curRadUp2, pt1[3]);
				mat4.multiplyVec3(rotMat, curRadUp2);
				vec3.add(curRadUp2, pt1);
				
				mat4.identity(rotMat);
				mat4.rotate(rotMat, (rad + 1) / radius_subdiv * Math.PI * 2, dirVec2);			
				vec3.set(nextUp, curRadNextUp2);
				vec3.scale(curRadNextUp2, pt2[3]);
				mat4.multiplyVec3(rotMat, curRadNextUp2);
				vec3.add(curRadNextUp2, pt2);
				
				var px = [curRadNextUp2[0], curRadNextUp[0], curRadUp[0], curRadUp2[0]];
				var py = [curRadNextUp2[1], curRadNextUp[1], curRadUp[1], curRadUp2[1]];
				var pz = [curRadNextUp2[2], curRadNextUp[2], curRadUp[2], curRadUp2[2]];
				
				var vert = [0,1,2, 0,2,3];
				
				for(var v = 0; v < 6; v++) {
					vec3.set([px[vert[v]],py[vert[v]],pz[vert[v]]], vec[v % 3]);
					
					if (v % 3 == 2) {
						obj.addTriangle(vec[0], vec[1], vec[2]);
					}
				}
				
			}
		}
	}

	obj.addPath = function(pointsA, pointsB, length_subdiv) {
		var last = pointsA.length / 3;
		
		var bezierpointsA = new Array();
		var bezierpointsB = new Array();
		
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
			
				var t = len / length_subdiv;
				var pb = bezier(p0A,p1A,p2A,t);
			
				bezierpointsA.push(pb[0]);
				bezierpointsA.push(pb[1]);
				bezierpointsA.push(pb[2]);
				
				pb = bezier(p0B,p1B,p2B,t);
			
				bezierpointsB.push(pb[0]);
				bezierpointsB.push(pb[1]);
				bezierpointsB.push(pb[2]);
			}
			
			if (b == last - 2) {
				var t = 1;
				var pb = bezier(p0A,p1A,p2A,t);
			
				bezierpointsA.push(pb[0]);
				bezierpointsA.push(pb[1]);
				bezierpointsA.push(pb[2]);
				
				pb = bezier(p0B,p1B,p2B,t);
			
				bezierpointsB.push(pb[0]);
				bezierpointsB.push(pb[1]);
				bezierpointsB.push(pb[2]);
			
			}
		}
			
		var vec = [[0,0,0],[0,0,0],[0,0,0]];
			
		for(var b = 0; b < bezierpointsA.length / 3 - 1; b++) {
		
			var ptA0 = [bezierpointsA[(b - 0) * 3],bezierpointsA[(b - 0) * 3 + 1],bezierpointsA[(b - 0) * 3 + 2]];
			var ptA1 = [bezierpointsA[(b + 1) * 3],bezierpointsA[(b + 1) * 3 + 1],bezierpointsA[(b + 1) * 3 + 2]];
			var ptB0 = [bezierpointsB[(b - 0) * 3],bezierpointsB[(b - 0) * 3 + 1],bezierpointsB[(b - 0) * 3 + 2]];
			var ptB1 = [bezierpointsB[(b + 1) * 3],bezierpointsB[(b + 1) * 3 + 1],bezierpointsB[(b + 1) * 3 + 2]];
		
			var px = [ptA1[0], ptB1[0], ptB0[0], ptA0[0]];
			var py = [ptA1[1], ptB1[1], ptB0[1], ptA0[1]];
			var pz = [ptA1[2], ptB1[2], ptB0[2], ptA0[2]];
			
			var vert = [0,1,2, 0,2,3];
			var curornext = [1,1,0, 1,0,0];
			var side = [1,0,0, 1,0,1];
			
			for(var v = 0; v < 6; v++) {
				vec3.set([px[vert[v]],py[vert[v]],pz[vert[v]]], vec[v % 3]);
				
				if (v % 3 == 2) {
					obj.addTriangle(vec[0], vec[1], vec[2]);
				}
			}
		}
	}
	
	return obj;
}