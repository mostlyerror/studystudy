
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20, 20);

function arenaSweep() {
	let rowCount = 1;
	outer: for (let y = arena.length -1; y > 0; --y) { // yavascript trick to continue on the outer loop!
		for (let x = 0; x < arena[y].length; ++x) {
			if (arena[y][x] === 0) {
				continue outer;
			}
		}
		const row = arena.splice(y, 1)[0].fill(0);
		arena.unshift(row);
		++y;

		player.score += rowCount * 10;
		rowCount *= 2;
	}
}

function collide(arena, player) {
	const [m, o] = [player.matrix, player.pos];
	for (let y = 0; y < m.length; ++y) {
		for (let x = 0; x < m[y].length; ++x) {

			if (m[y][x] !== 0 &&
				(arena[y + o.y] &&
				 arena[y + o.y][x + o.x]) !== 0) {
				 	 return true;
				 }

		}
	}
	return false;
}

function createMatrix(w, h) {
	const matrix = [];
	while (h--) {
		matrix.push(new Array(w).fill(0));
	}
	return matrix;
}

function createPiece(type) {
	if (type === 'T') {
		return [
			[0, 0, 0],
			[1, 1, 1],
			[0, 1, 0]
		];
	} else if (type === 'O') {
		return [
			[2, 2],
			[2, 2]
		];
	} else if (type === 'L') {
		return [
			[0, 3, 0],
			[0, 3, 0],
			[3, 3, 0]
		];
	} else if (type === 'I') {
		return [
			[0, 4, 0, 0],
			[0, 4, 0, 0],
			[0, 4, 0, 0],
			[0, 4, 0, 0]
		];
	} else if (type === 'S') {
		return [
			[0, 5, 0],
			[5, 5, 0],
			[5, 0, 0]
		];
	} else if (type === 'Z') {
		return [
			[6, 6, 0],
			[0, 6, 6],
			[0, 0, 0]
		];
	} else if (type === 'J') {
		return [
			[0, 7, 7],
			[0, 0, 7],
			[0, 0, 7]
		];
	}
}

function draw() {
	context.fillStyle = '#000';
	context.fillRect(0, 0, canvas.height, canvas.width);

	drawMatrix(arena, {x: 0, y: 0});
	drawMatrix(player.matrix, player.pos)
}

function drawMatrix(matrix, offset) {
	matrix.forEach((row, y) => {
		row.forEach((value, x) => {
			if (value !== 0) {
				context.fillStyle = colors[value];
				context.fillRect(x + offset.x, 
								 y + offset.y, 
								 1, 1);
			}
		});
	});
}


function merge(arena, player) {
	player.matrix.forEach((row, y) => {
		row.forEach((value, x) => {
			if (value !== 0) {
				arena[y + player.pos.y][x + player.pos.x] = value;
			}
		});
	});
}

function playerDrop() {
		player.pos.y++;
		if (collide(arena, player)) {
			player.pos.y--;
			merge(arena, player);
			playerReset();
			arenaSweep();
			updateScore();
		}
		dropCounter = 0; // keep 1 second delay for auto-drop after manual drop
}

function playerMove(dir) {
	player.pos.x += dir;
	if (collide(arena, player)) { 
		player.pos.x -= dir;
	}
}

function playerReset() {
	const pieces = 'ILJOTSZ';
	player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
	player.pos.y = 0;
	player.pos.x = (arena[0].length / 2 | 0)  - 
				   (player.matrix[0].length / 2 | 0);
	if (collide(arena, player)) {
		arena.forEach(row => row.fill(0));
		player.score = 0;
		updateScore();
	}
}


function playerRotate(dir) {
	const pos = player.pos.x;
	let offset = 1;
	rotate(player.matrix, dir);
	while (collide(arena, player)) {
		player.pos.x += offset;
		offset = -(offset + (offset > 0 ? 1 : -1)); // 1, -2, 3, -4, etc.
		if (offset > player.matrix[0].length) {
			rotate(player.matrix, -dir); // couldnt find an offset that makes sense, rotate back
			player.pos.x = pos;
			return;
		}
	}
}

function rotate(matrix, dir) {
	for (let y = 0; y < matrix.length; ++y) {
		for (let x = 0; x < y; ++x) {
			// tuple switch
			[
				matrix[x][y],
				matrix[y][x]
			] = [
				matrix[y][x],
				matrix[x][y],
			];
		}
	}

	if (dir > 0) {
		matrix.forEach(row => row.reverse());
	} else {
		matrix.reverse();
	}
}

let dropInterval = 1000;
let dropCounter = 0;
let lastTime = 0;
function update(time = 0) {
	const deltaTime = time - lastTime;
	lastTime = time;
	dropCounter += deltaTime;
	if (dropCounter > dropInterval) {
		player.pos.y++;
		dropCounter = 0;
	}
	draw();
	window.requestAnimationFrame(update);
}

function updateScore() {
	document.getElementById('score').innerText = player.score;
}

const colors = [
	null,
	'#ff0d72',
	'#0dc2ff',
	'#0dff72',
	'#f538ff',
	'#ff8e0d',
	'#ffe138',
	'#3877ff'
];

const player = {
	pos: {x: 5, y: 5},
	matrix: null,
	score: 0
};

const arena = createMatrix(12, 20);

document.addEventListener('keydown', event => {
	if (event.keyCode === 37) {
		playerMove(-1);
	} else if (event.keyCode === 39) {
		playerMove(1);
	} else if (event.keyCode === 40) {
		playerDrop();
	} else if (event.keyCode === 81) {
		playerRotate(-1);
	} else if (event.keyCode === 87) {
		playerRotate(1);
	}
});

playerReset();
updateScore();
update();
