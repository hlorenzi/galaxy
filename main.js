var playerObj;

var planetList = new Array();

var objectList = new Array();

var keyRight = 0;
var keyLeft = 0;
var keyUp = 0;
var keyDown = 0;
var keyJump = 0;
var keyToggle = 0;

document.onkeydown = checkKeyDown;
document.onkeyup = checkKeyUp;
function checkKeyDown(e) {
    e = e || window.event;

    if (e.keyCode == '39' || e.keyCode == '68') {
        keyRight = 1;
    } else if (e.keyCode == '37' || e.keyCode == '65') {
		keyLeft = 1;
    } else if (e.keyCode == '38' || e.keyCode == '87') {
		keyUp = 1;
    } else if (e.keyCode == '40' || e.keyCode == '83') {
		keyDown = 1;
    } else if (e.keyCode == '32') {
		keyJump = 1;
    } else if (e.keyCode == '84') {
		keyToggle = 1;
    }
}


function checkKeyUp(e) {
    e = e || window.event;

    if (e.keyCode == '39' || e.keyCode == '68') {
        keyRight = 0;
    } else if (e.keyCode == '37' || e.keyCode == '65') {
		keyLeft = 0;
    } else if (e.keyCode == '38' || e.keyCode == '87') {
		keyUp = 0;
    } else if (e.keyCode == '40' || e.keyCode == '83') {
		keyDown = 0;
    }
}

function soundPlay(id) {
	var snd = document.getElementById(id);
	snd.pause();
    snd.currentTime = 0;
	snd.play();
}


function mainStart() {
	if (document.documentElement.requestFullscreen)
		document.documentElement.requestFullscreen();
	
	window.onresize = resize;
	resize();
	
	var canvas = document.getElementById("webgl_canvas");
	hglInit(canvas);
	
	gl.clearColor(0.5, 0.8, 1.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	
	
	setInterval(function() {mainLoop();}, 1000 / 60);
	
	planetList.push(planetTest.create());
	
	playerObj = objPlayer.create();
	
	objectList.push(playerObj);
	//objectList.push(objLaunchStar.create([20,0,40], [20,0,40,  140,0,65,  21,0,90], [20,0,45,  130,0,65,  21,0,85]));
	
}


function resize()
{
	var canvas = document.getElementById("webgl_canvas");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}


var angle = 0;
function mainLoop() {
	hglTime += 1 / 60;
	
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.perspective(45, gl.canvas.width / gl.canvas.height, 1, 1000, hglMatrixProjection);
	
	
	/*mat4.lookAt([0,10,2],
				[0,0,2],
				[0,0,1],
				hglMatrixModelview);
				
	var quat = quat4.create([0,0,1,angle]);
	angle += 0.01;
	
	var mat = quat4.toMat4(quat);
	mat4.multiply(hglMatrixModelview, mat);
	
	playerObj.model.draw(1, hglTime * 8);
	
	
	return;
	*/
	
	
	mat4.lookAt(playerObj.camera.position,
				playerObj.camera.at,//playerObj.position,
				playerObj.camera.up,
				hglMatrixModelview);
				
	planetList[0].draw();
	
	for(var i = 0; i < objectList.length; i++) {
		objectList[i].step();
		objectList[i].draw();
	}
}