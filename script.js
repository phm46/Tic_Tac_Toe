$(document).ready(function() {
    $.fn.ticTacThis = function(json) {
		var board = $("<canvas/>").css("position","relative")[0];
		var playerTurnText = $("<p/>");
		var info = $("<p/>");
		var optionsDiv = $("<div/>");
		var saveButton = $("<button>New game</button>");
		var inputs = {
			col: [$("<input type='text' size=2 value=3>"),"Rows (min 3)"],
			row: [$("<input type='text' size=2 value=3>"),"Columns (min 3)"],
			boardSize: [$("<input type='text' size=2 value=200>"),"Board Size (min 200, max 1000)"],
			needForWin: [$("<input type='text' size=2 value=3>"),"Need marks for win (min 3)"]
		}

		for (var i in inputs){
			optionsDiv.append(inputs[i][1]+": ").append(inputs[i][0]).append("<br>");
		}
		this.html(board).append(info).append(playerTurnText).append(optionsDiv.append(saveButton));
		var col;
		var row;
		var currentPlayer;
		var players;
		var options;
		var ctx;
		var winner;
		var turns;
		var boardArray;
		var colSize;
		var rowSize;
		var initJson;
		var fgCol = "#000000";
		var	bgCol = "#ffffff";
		var defaults = {
			col: 3,
			row: 3,
			boardSize: 200,
			needForWin: 3
		}
		init(json);

saveButton.click(function(){
	var obj={};
	for(var i in inputs){
		obj[i] = parseInt(inputs[i][0].val());
	}
	init(obj);
});

function mergeOptions(object, defaultObj){
    for (var op in defaultObj) {
        if (typeof object[op] === "undefined" || !(!!object[op])) {
            object[op] = defaultObj[op];
        } else if (typeof defaultObj[op] === "object") {
            mergeOptions(object[op], defaultObj[op]);
        }
    }
}

function init(json){
	options = json||initJson;
	initJson = options;
	if(!!options){
    	mergeOptions(json, defaults);
	} else {
    	options = defaults;
	}
	if(validateOptions()){
		ctx = board.getContext("2d");
		board.height = options.boardSize;
		board.width = options.boardSize;
		board.dataset["fgcolor"] = fgCol;
		board.dataset["bgcolor"] = bgCol;
		board.onclick = clickHandler;
		board.onmousemove = getMousePos;
		boardArray = Array();
		turns = 0;
		winner = {};
		colSize = board.width / options.col;
		rowSize = board.height / options.row;
	
		for(var i in inputs){
			inputs[i][0].val(options[i]);
		}

		currentPlayer = ~~(Math.random()*2+1);
		for (var i = 0; i<options.row; i++){
			boardArray[i] = Array.apply(null, new Array(options.col)).map(Number.prototype.valueOf,0);
		}
		update();
	} else {
		alert("Check settings");
	}
}

function validateOptions(){
	return options.col >= options.needForWin && options.row >= options.needForWin && options.needForWin >= 3 && options.boardSize <= 1000 && options.boardSize >= 200;
}

function drawBoard(){
	for (var x = 0; x <= options.col; x++){
		ctx.beginPath();
		ctx.moveTo(x * colSize, 0);
		ctx.lineTo(x * colSize, board.height);
		ctx.stroke();
		ctx.closePath();
	}

	for (var y = 0; y <= options.row; y++){
		ctx.beginPath();
		ctx.moveTo(0, y * rowSize);
		ctx.lineTo(board.width, y * rowSize);
		ctx.stroke();
		ctx.closePath();
	}
	for (var x = 0; x < options.row; x++){
		for (var y = 0; y < options.col; y++){
			if(boardArray[x][y]==1){
				drawPlayerMove(y * colSize, x * rowSize, colSize, rowSize, 1);
			} else if(boardArray[x][y]==2){
				drawPlayerMove(y * colSize, x * rowSize, colSize, rowSize, 2);
			}
		}
	}
}

function update(){
	if(checkForEnd()){
		$(info).text("Turn: "+turns+" | "+((winner.nick==1)?"X":"O")+" win").css("font-weight","bold");
		start = winner.startPos;
		end = winner.endPos;
		ctx.strokeStyle="#FF0000";
		ctx.lineWidth = 4;
		ctx.beginPath();
		ctx.moveTo(start[1], start[0]);
		ctx.lineTo(end[1], end[0]);
		ctx.stroke();
		ctx.closePath();
		ctx.strokeStyle="#000000";
		ctx.lineWidth = 1;
	} else if(options.col*options.row==turns){
		$(info).text("Turn: "+turns+" | Tie").css("font-weight","bold");
	} else {
		$(info).text("Turn: "+turns+" | "+((currentPlayer==1)?"X":"O")+"'s turn").css("font-weight","none");
		clearBoard();
	}
}

function clearBoard(){
	ctx.fillStyle = bgCol;
	ctx.strokeStyle = bgCol;
	ctx.fillRect(0, 0, board.width, board.height);
	ctx.fillStyle = fgCol;
	ctx.strokeStyle = fgCol;
	drawBoard();
}

function drawPlayerMove(x, y, w, h, player){
	if(player==1){
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(x + w, y + h);
		ctx.stroke();
		ctx.closePath();

		ctx.beginPath();
		ctx.moveTo(x + w, y);
		ctx.lineTo(x, y + h);
		ctx.stroke();
		ctx.closePath();
	} else if(player==2){
		drawEllipse(x, y, w, h);
	}
}

function drawEllipse(x, y, w, h) {
    var kappa = .5522848,
    ox = (w / 2) * kappa,
    oy = (h / 2) * kappa,
    xe = x + w,
    ye = y + h,
    xm = x + w / 2,
    ym = y + h / 2;
    
    ctx.beginPath();
    ctx.moveTo(x, ym);
    ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
    ctx.closePath();
	ctx.stroke();
}

function clickHandler(e){
	if(!!winner.nick==false){
		var x = posX;
		var y = posY;

		var cellX = 0;
		var cellY = 0;

		for (var i = 0; i <= options.col; i++){
			if (x >= i * colSize){
				cellX = i;
			}
		}

		for (var i = 0; i <= options.row; i++){
			if (y >= i * rowSize){
				cellY = i;
			}
		}
		makeMove(cellX, cellY);
		drawBoard();
	}
}

function getMousePos(e){
	var tmpX;
	var tmpY;

	if (e.offsetX){
		tmpX = e.offsetX;
		tmpY = e.offsetY;
	} else if (e.layerX) {
		tmpX = e.layerX;
		tmpY = e.layerY;
	}
	posX = tmpX;
	posY = tmpY;
}

function checkForRows(startX,startY){
	for (var col = 0; col < options.needForWin; col++){
		var lastMark = boardArray[startY+col][startX];
		for (var row = 0; row < options.needForWin; row++){
			if (boardArray[startY+col][startX+row] != lastMark){
				lastMark = 0;
				break;
			}
		}
		if (lastMark != 0){
			winner.nick = lastMark;
			winner.startPos = [(startY+col)*rowSize+rowSize/2,startX*colSize];
			winner.endPos = [(startY+col)*rowSize+rowSize/2,(startX+options.needForWin)*colSize];
			return true
		}
	}
	return false;
}

function checkForCols(startX,startY){
	for (var row = 0; row < options.needForWin; row++){
		var lastMark = boardArray[startY][row+startX];
		for (var col = 0; col < options.needForWin; col++){
			if (boardArray[col+startY][row+startX] != lastMark){
				lastMark = 0;
				break;
			}
		}
		if (lastMark != 0){
			winner.nick = lastMark;
			winner.startPos = [startY*rowSize,(startX+row)*colSize+colSize/2];
			winner.endPos = [(startY+options.needForWin)*rowSize,(startX+row)*colSize+colSize/2];
			return true;
		}
	}
	return false;
}

function checkForDiag(startX,startY){
	var lastMark = boardArray[startY][startX];
	for (var i = 0; i < options.needForWin; i++){
		if (boardArray[i+startY][i+startX] != lastMark){
			lastMark = 0;
			break;
		}
	}
	if (lastMark != 0){
		winner.nick = lastMark;
		winner.startPos = [startY*rowSize,startX*colSize];
		winner.endPos = [(startY+options.needForWin)*rowSize,(startX+options.needForWin)*colSize];
		return true;
	}
	return false;
}

function checkForAntiDiag(startX,startY){
	var lastMark = boardArray[startY+options.needForWin-1][startX];
	for(var i = 0; i < options.needForWin;i++){
   		if(boardArray[startY-i+options.needForWin-1][i+startX]!=lastMark){
   			lastMark = 0;
   			break;
   		}
    }
    if (lastMark != 0){
		winner.nick = lastMark;
		winner.startPos = [(startY+options.needForWin)*rowSize,startX*colSize];
		winner.endPos = [(startY-i+options.needForWin)*rowSize,(startX+options.needForWin)*colSize];
		return true;
	}
	return false;
}

function checkScopeForWin(startX, startY){
	if(checkForRows(startX,startY)){
		return true
	}

	if(checkForCols(startX,startY)){
		return true
	}

	if(checkForDiag(startX,startY)){
		return true
	}

	if(checkForAntiDiag(startX,startY)){
		return true
	}

	return false;
}

function checkForEnd() {
	for(var i = 0; i <= options.col-options.needForWin; i++){
		for (var j = 0; j <= options.row-options.needForWin; j++) {
			if(checkScopeForWin(i,j)){
				return true;
			}
		}
	}
}

function makeMove(cellX, cellY){
	if (boardArray[cellY][cellX] == 0){
		boardArray[cellY][cellX] = currentPlayer;
		currentPlayer = (currentPlayer==1)?2:1;
		turns++;
	}
	update();
}

    }
	$("#tic").ticTacThis();
});