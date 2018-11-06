var gl;

var hglMatrixModelview;
var hglMatrixProjection;
var hglTime = 0;

function hglInit(canvas) {
	try {
		var attrib = new Object();
		attrib.stencil = true;
		gl = canvas.getContext("experimental-webgl", attrib);
		gl.canvas = canvas;
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
		
		hglMatrixModelview = mat4.create();
		hglMatrixProjection = mat4.create();
	} catch(e) {}
	
	if (!gl) {
		alert("Could not initialize WebGL.");
	}
}

function hglCreateBuffer(data) {
	var buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
	return buf;
}

function hglCreateProgram(vs, fs) {
	var shaderProgram = gl.createProgram();
	
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, fs);
	gl.compileShader(fragmentShader);

	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		alert("Fragment Shader Error:\n" + gl.getShaderInfoLog(fragmentShader));
		return null;
	}
	
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, vs);
	gl.compileShader(vertexShader);

	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS))
	{
		alert("Vertex Shader Error:\n" + gl.getShaderInfoLog(vertexShader));
		return null;
	}
	  
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
	{
		alert("Could not create shader program.");
	}

	gl.useProgram(shaderProgram);

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
	gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
	shaderProgram.vertexTextureAttribute = gl.getAttribLocation(shaderProgram, "aVertexTexture");
	gl.enableVertexAttribArray(shaderProgram.vertexTextureAttribute);
	shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
	gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
	
	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.timeUniform = gl.getUniformLocation(shaderProgram, "uTime");
	
	shaderProgram.setMatrices = function() {
		gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, hglMatrixProjection);
		gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, hglMatrixModelview);
		gl.uniform1f(shaderProgram.timeUniform, hglTime);
	}
	
	shaderProgram.use = function() {
		gl.useProgram(shaderProgram);
	}
	
	return shaderProgram;
}

function modelCreate() {
	var model = new Object();
	model.data = new Array();
	model.vertices = 0;
	model.buffer = 0;
	return model;
}

function modelScale(model, s, indicesPerVertex) {
	for(var i = 0; i < model.data.length; i += indicesPerVertex) {
		model.data[i] *= s;
		model.data[i + 1] *= s;
		model.data[i + 2] *= s;
	}	
}

function modelAddVertices(model, vert, indicesPerVertex) {
	for(var i = 0; i < vert.length; i++) {
		model.data.push(vert[i]);
	}
	
	model.vertices += vert.length / indicesPerVertex;
}

function modelAddQuad(model, vert, indicesPerVertex) {
	for(var i = 0; i < indicesPerVertex * 3; i++) {
		model.data.push(vert[i]);
	}
	
	for(var i = 0; i < indicesPerVertex; i++) {
		model.data.push(vert[i]);
	}
	
	for(var i = indicesPerVertex * 2; i < indicesPerVertex * 4; i++) {
		model.data.push(vert[i]);
	}
	
	model.vertices += 6;
}

function modelAddSphere(model, x, y, z, radius, subdiv) {	
	var px = [0,1,2];
	var py = [1,2,0];
	var pz = [2,0,1];
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
									pj[trisY[t]],// * (1 - sg * 2),
									radius / 2 * (1 - sg * 2)];
						
						var vertlen = Math.sqrt(vert[0] * vert[0] +
												vert[1] * vert[1] +
												vert[2] * vert[2]);
												
						vert[0] *= 1 / vertlen;	
						vert[1] *= 1 / vertlen;	
						vert[2] *= 1 / vertlen;
					
						model.data.push(vert[px[k]] * radius + x);
						model.data.push(vert[py[k]] * radius + y);
						model.data.push(vert[pz[k]] * radius + z);
						
						model.data.push(vert[px[k]] * 0.5 + 0.5);
						model.data.push(vert[py[k]] * 0.5 + 0.5);
						model.data.push(vert[pz[k]] * 0.5 + 0.5);
						
						model.data.push(vert[px[k]]);
						model.data.push(vert[py[k]]);
						model.data.push(vert[pz[k]]);
						
						model.vertices++;
					}
				}
			}
		}
	}
}

function bezier(p0, p1, p2, t) {
	return [(1.0 - t) * ((1.0 - t) * p0[0] + t * p1[0]) + (t * ((1.0 - t) * p1[0] + t * p2[0])),
			(1.0 - t) * ((1.0 - t) * p0[1] + t * p1[1]) + (t * ((1.0 - t) * p1[1] + t * p2[1])),
			(1.0 - t) * ((1.0 - t) * p0[2] + t * p1[2]) + (t * ((1.0 - t) * p1[2] + t * p2[2]))];
}

function bezier4(p0, p1, p2, t) {
	return [(1.0 - t) * ((1.0 - t) * p0[0] + t * p1[0]) + (t * ((1.0 - t) * p1[0] + t * p2[0])),
			(1.0 - t) * ((1.0 - t) * p0[1] + t * p1[1]) + (t * ((1.0 - t) * p1[1] + t * p2[1])),
			(1.0 - t) * ((1.0 - t) * p0[2] + t * p1[2]) + (t * ((1.0 - t) * p1[2] + t * p2[2])),
			(1.0 - t) * ((1.0 - t) * p0[3] + t * p1[3]) + (t * ((1.0 - t) * p1[3] + t * p2[3]))];
}

function modelAddBezier(model, points, radius_subdiv, length_subdiv, texId) {
	var last = points.length / 4;
	
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
			var pb = bezier(p0,p1,p2,t);
		
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
			var curornext = [1,1,0, 1,0,0];
			var side = [1,0,0, 1,0,1];
			
			for(var v = 0; v < 6; v++) {
				model.data.push(px[vert[v]]);
				model.data.push(py[vert[v]]);
				model.data.push(pz[vert[v]]);
				
				model.data.push(Math.abs((rad + side[v]) / radius_subdiv * 2.0 - 1.0));
				model.data.push((b + curornext[v]) / (bezierpoints.length / 4 - 2));
				model.data.push(1);
				
				var n = vec3.create((curornext[v] == 1 ? pt2 : pt1));
				vec3.negate(vec3.normalize(vec3.subtract(n, [px[vert[v]], py[vert[v]], pz[vert[v]]])));
				
				model.data.push(n[0]);
				model.data.push(n[1]);
				model.data.push(n[2]);
				
				model.vertices++;
			}
			
		}
	}
}

function modelAddPath(model, pointsA, pointsB, length_subdiv, texId) {
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
		
	var texlen = 0;
		
	for(var b = 0; b < bezierpointsA.length / 3 - 1; b++) {
	
		var ptA0 = [bezierpointsA[(b - 0) * 3],bezierpointsA[(b - 0) * 3 + 1],bezierpointsA[(b - 0) * 3 + 2]];
		var ptA1 = [bezierpointsA[(b + 1) * 3],bezierpointsA[(b + 1) * 3 + 1],bezierpointsA[(b + 1) * 3 + 2]];
		var ptB0 = [bezierpointsB[(b - 0) * 3],bezierpointsB[(b - 0) * 3 + 1],bezierpointsB[(b - 0) * 3 + 2]];
		var ptB1 = [bezierpointsB[(b + 1) * 3],bezierpointsB[(b + 1) * 3 + 1],bezierpointsB[(b + 1) * 3 + 2]];
		
		var vecLen = vec3.create();
		var texlensize = vec3.length(vec3.subtract(ptA1,ptA0,vecLen));
		var vecWide = vec3.create();
		var widesize = vec3.length(vec3.subtract(ptB0,ptA0,vecWide));
	
		var px = [ptA1[0], ptB1[0], ptB0[0], ptA0[0]];
		var py = [ptA1[1], ptB1[1], ptB0[1], ptA0[1]];
		var pz = [ptA1[2], ptB1[2], ptB0[2], ptA0[2]];
		
		var vert = [0,1,2, 0,2,3];
		var curornext = [1,1,0, 1,0,0];
		var side = [1,0,0, 1,0,1];
		
		var A0_to_A1 = vec3.create();
		vec3.subtract(ptA1, ptA0, A0_to_A1);
		var A0_to_B0 = vec3.create();
		vec3.subtract(ptB0, ptA0, A0_to_B0);
		var n = vec3.create();
		vec3.normalize(vec3.cross(A0_to_A1, A0_to_B0, n));
		
		for(var v = 0; v < 6; v++) {
			model.data.push(px[vert[v]]);
			model.data.push(py[vert[v]]);
			model.data.push(pz[vert[v]]);
			
			model.data.push(0 + widesize * side[v]);
			model.data.push(texlen + texlensize * curornext[v]);
			model.data.push(1);
		
			model.data.push(n[0]);
			model.data.push(n[1]);
			model.data.push(n[2]);
			
			model.vertices++;
		}
		
		texlen += texlensize;
	}
}

function modelAddBox(model, x, y, z, sizeX, sizeY, sizeZ, subdiv, texId) {	
	var px = [0,1,2];
	var py = [1,2,0];
	var pz = [2,0,1];
	
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
									pj[trisY[t]],// * (1 - sg * 2),
									1 / 2 * (1 - sg * 2)];
									
						var normal = [0,0,(1 - sg * 2)];
					
						model.data.push(vert[px[k]] * sizeX + x);
						model.data.push(vert[py[k]] * sizeY + y);
						model.data.push(vert[pz[k]] * sizeZ + z);
						
						model.data.push(Math.abs(vert[px[0]] * 0.5 + 0.5));
						model.data.push(Math.abs(vert[pz[2]] * 0.5 + 0.5));
						model.data.push(texId + k + sg * 3);
						
						model.data.push(normal[px[k]]);
						model.data.push(normal[py[k]]);
						model.data.push(normal[pz[k]]);
						
						model.vertices++;
					}
				}
			}
		}
	}
}

function modelFinish(model) {
	model.buffer = hglCreateBuffer(model.data);
}

vec3.projectOnVector = function(vec, vec2, dest) {
	var vec2lensqr = vec3.dot(vec2, vec2);
	vec3.scale(vec2, vec3.dot(vec, vec2) / vec2lensqr, dest);
}

vec3.projectOnPlane = function(vec, norm, dest) {
	var proj = vec3.create();
	vec3.projectOnVector(vec, norm, proj);
	vec3.subtract(vec, proj, dest);
}

var vec3rotateAxisCross = vec3.create();
var vec3rotateAxisTemp = vec3.create();
vec3.rotateAxis = function(vec, angle, axis, dest) {
	var dot = vec3.dot(vec, axis);
	vec3.normalize(vec3.cross(axis, vec, vec3rotateAxisCross));
	
	vec3.set(vec, dest);
	vec3.scale(dest, Math.cos(angle));
	
	vec3.scale(vec3rotateAxisCross, Math.sin(angle));
	vec3.add(dest, vec3rotateAxisCross);
	
	vec3.set(axis, vec3rotateAxisTemp);
	vec3.scale(vec3rotateAxisTemp, dot);
	vec3.scale(vec3rotateAxisTemp, 1 - Math.cos(angle));
	vec3.add(dest, vec3rotateAxisTemp);
	
	return dest;
}

function direction(x1,y1,x2,y2) {
	return Math.atan2(y2 - y1, -(x2 - x1));
}

function approach(from, to, step) {
	if (from > to + step) return from - step;
	if (from < to - step) return from + step;
	return to;
}