(function () {

	var rows = 50, cols = 50, barreiras_count = 1000;

	var start, end, openSet = [], closedSet = [];

	var canvas, ctx, tileSize, tabuleiro;



	function createCanvas (w, h) {
		canvas = document.createElement('canvas');
		canvas.width  = w;
		canvas.height = h;
		canvas.textContent = 'sem suporte';

		document.body.appendChild(canvas);

		ctx = canvas.getContext('2d');

		ctx.lineWidth = 3;
		ctx.lineCap = 'round';

		tileSize = canvas.width / rows;

		inicializar_busca();

		return console.log('A*');
	};


	function inicializar_busca () {
		tabuleiro = preencher_matriz(rows, cols);

		start = tabuleiro[0][0];
		end   = tabuleiro[cols - 1][rows - 1];

		openSet.push(start);

		update();
	};


	function heuristic (a, b) {
		let d1 = Math.pow(Math.abs(a.x - b.x), 2),
			d2 = Math.pow(Math.abs(a.y - b.y), 2);

		return Math.sqrt(d1 + d2); // Euclidian Distance
	};


	function preencher_matriz (w, h) {
		let matriz = [];

		while (h--) {
			let reserveX = 0, row = [];

			while (reserveX < w) {
				row.push(new Spot(reserveX++, h, tileSize));
			};

			matriz.unshift(row);
		};

		return lancar_barreiras(matriz);
	};


	function lancar_barreiras (matriz) {
		let posX, posY, randomCell;

		do {
			posX = Math.floor(Math.random() * rows);
			posY = Math.floor(Math.random() * cols);

			randomCell = matriz[posY][posX];

			if ((posX || posY) && (posX != rows - 1 || posY != cols - 1) && !randomCell.wall) {
				randomCell.wall = 1;
			};
		} while (barreiras_count > quantidade_barreiras(matriz));

		return setNeighbors(matriz);
	};


	function quantidade_barreiras (matriz) {
		return matriz.reduce((acc, row) => acc + row.filter(cell => cell.wall).length, 0);
	}


	function setNeighbors (matriz) {
		matriz.forEach(row => {
			row.forEach(cell => !cell.wall && cell.setNeighbors(matriz));
		});

		return matriz;
	};


	function getTheLowestF (matriz) {
		let lower;

		matriz.forEach(cell => {
			if (!lower || lower.f > cell.f) lower = cell;
		});

		return lower;
	};


	function drawParent (_el, color) {
		ctx.beginPath();
		ctx.strokeStyle = color;
		[start, end, _el].forEach(cell => cell.draw(drawRect, color));
		while (_el.parent) {
			_el = route(_el, _el.parent);
		};
		ctx.closePath();
		ctx.stroke();
	};


	function route (from, to) {
		if (to.parent) {
			if (from.y == to.parent.y && to.x == to.parent.x + 1 ||
				from.y == to.parent.y && to.x == to.parent.x - 1 ||
				from.x == to.parent.x && to.y == to.parent.y + 1 ||
				from.x == to.parent.x && to.y == to.parent.y - 1) {
				// deixando o caminho mais curto
				return route(from, to.parent);
			};
		};

		let halfSize = tileSize * .5;

		lineSet({
			x: from.x * from.w + halfSize,
			y: from.y * from.w + halfSize
		}, {
			x: to.x * to.w + halfSize,
			y: to.y * to.w + halfSize
		});

		return to;
	};


	function lineSet (from, to) {
		ctx.moveTo(from.x, from.y);
		ctx.lineTo(to.x, to.y);
	};


	function clearCanvas (newColor) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawRect(0, 0, canvas.width, canvas.height, newColor || '#fff');
	};


	function drawRect (x, y, w, h, color) {
		ctx.fillStyle = color;
		ctx.fillRect(x, y, w, h);
	};


	function draw () {
		clearCanvas('#fff');

		tabuleiro.forEach(row => {
			row.forEach(cell => cell.wall && cell.draw(drawRect, 'black'));
		});
	};


	function update (time = 0) {
		draw();

		if (openSet.length) {
			var currentNode = getTheLowestF(openSet);

			if (currentNode === end) {
				openSet = [];
				setTimeout(inicializar_busca, 10000);
				return drawParent(currentNode, 'green');
			};

			drawParent(currentNode, 'red');

			closedSet.push(openSet.splice(openSet.indexOf(currentNode), 1)[0]);

			let neighbors = currentNode.neighbors;

			for (let i = 0, len = neighbors.length; i < len; i++) {
				let neighbor = neighbors[i];

				if (closedSet.indexOf(neighbor) >= 0) continue;

				let gScore = currentNode.g + 1, betterGScore = false;

				if (openSet.indexOf(neighbor) === -1) {
					betterGScore = true;
					neighbor.h = heuristic(neighbor, end);
					openSet.push(neighbor);
				} else if (gScore < neighbor.g) {
					betterGScore = true;
				};

				if (betterGScore) {
					neighbor.parent = currentNode;
					neighbor.g = gScore;
					neighbor.f = neighbor.g + neighbor.h;
				};
			};

			requestAnimationFrame(update, canvas);
		} else {
			inicializar_busca();
		};
	};


	createCanvas(480, 480);
} ());