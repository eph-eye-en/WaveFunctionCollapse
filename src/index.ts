//import * as p5 from "p5";
import * as p5Global from "p5/global";

import { IEdge, IMirror, IRotatable, Tile as BaseTile } from "./Tile.js";
import ReflexiveStringEdge from "./ReflexiveStringEdge.js";
import { Grid } from "./Grid.js";
import { SquareGrid, SquareId } from "./SquareGrid.js";
import * as p5 from "p5";
import { RotMirrorImage } from "./RotMirrorImage.js";

type Tile = BaseTile<RotMirrorImage, ReflexiveStringEdge>;

const DIM = 30;
let DEBUG = false;

let sides = 4;
let tiles: {
	[id: string]: Tile[]
};
let grid: SquareGrid<RotMirrorImage, ReflexiveStringEdge>;

let tilesetSelect: p5.Element;

function tileFromPath(folder: string, name: string, edges: string[],
freq?: number) {
	const t = ReflexiveStringEdge.tileFromPatterns(
		RotMirrorImage.from(loadImage(`tiles/${folder}/${name}.png`)),
		edges,
		freq
	);
	t.name = name + "-0";
	return t;
}

function loadBasic() {
	const blank = tileFromPath(
		"basic", "blank",
		["aaa", "aaa", "aaa", "aaa"],
		20
	);
	const upT = tileFromPath(
		"basic", "up-t",
		["aba", "aba", "aaa", "aba"]
	);
	const leftRight = tileFromPath(
		"basic", "left-right",
		["aaa", "aba", "aaa", "aba"]
	);
	return [
		blank,
		upT, BaseTile.rotate(upT, 1, 4), BaseTile.rotate(upT, 2, 4),
			BaseTile.rotate(upT, 3, 4),
		leftRight, BaseTile.rotate(leftRight, 1, 4),
	];
}

function loadCircuit() {
	const blank = tileFromPath(
		"circuit", "blank",
		["aaa", "aaa", "aaa", "aaa"]
	);
	const leftRightGrey = tileFromPath(
		"circuit", "left-right-grey",
		["aaa", "aba", "aaa", "aba"],
		0.1
	);
	const leftRightGreen = tileFromPath(
		"circuit", "left-right-green",
		["aaa", "aca", "aaa", "aca"]
	);
	const upRightGreen = tileFromPath(
		"circuit", "up-right-green",
		["aca", "aca", "aaa", "aaa"]
	);
	const crossover = tileFromPath(
		"circuit", "crossover",
		["aba", "aca", "aba", "aca"],
		0.1
	);
	const greenLeftGreyRight = tileFromPath(
		"circuit", "green-left-grey-right",
		["aaa", "aba", "aaa", "aca"]
	);
	const black = tileFromPath(
		"circuit", "black",
		["ddd", "ddd", "ddd", "ddd"]
	);
	const pinRight = tileFromPath(
		"circuit", "pin-right",
		["daa", "aca", "aad", "ddd"]
	);
	const cornerTopLeft = tileFromPath(
		"circuit", "corner-top-left",
		["daa", "aaa", "aaa", "aad"],
		0.5
	);
	return [
		blank, black,
		leftRightGrey, BaseTile.rotate(leftRightGrey, 1, 4),
		leftRightGreen, BaseTile.rotate(leftRightGreen, 1, 4),
		upRightGreen, BaseTile.rotate(upRightGreen, 1, 4),
			BaseTile.rotate(upRightGreen, 2, 4),
			BaseTile.rotate(upRightGreen, 3, 4),
		crossover, BaseTile.rotate(crossover, 1, 4),
		greenLeftGreyRight, BaseTile.rotate(greenLeftGreyRight, 1, 4),
			BaseTile.rotate(greenLeftGreyRight, 2, 4),
			BaseTile.rotate(greenLeftGreyRight, 3, 4),
		pinRight, BaseTile.rotate(pinRight, 1, 4),
			BaseTile.rotate(pinRight, 2, 4), BaseTile.rotate(pinRight, 3, 4),
		cornerTopLeft, BaseTile.rotate(cornerTopLeft, 1, 4),
			BaseTile.rotate(cornerTopLeft, 2, 4),
			BaseTile.rotate(cornerTopLeft, 3, 4),
	];
}

function loadLandscape() {
	const blue = tileFromPath("landscape", "blue",
		["aaa", "aaa", "aaa", "aaa"]);
	const brown = tileFromPath("landscape", "brown",
		["ccc", "ccc", "ccc", "ccc"]);
	const greenFlat = tileFromPath("landscape", "green-flat",
		["aaa", "abc", "ccc", "cba"], 20);
	const greenTopLeft = tileFromPath("landscape", "green-top-left",
		["bcc", "ccc", "ccc", "ccb"]);
	const hillLeftBottom = tileFromPath("landscape", "hill-left-bottom",
		["aaa", "abc", "ccb", "aaa"]);
	const hillLeftTop = tileFromPath("landscape", "hill-left-top",
		["aaa", "bcc", "ccc", "cba"]);
	const treeBase = tileFromPath("landscape", "tree-base",
		["ada", "abc", "ccc", "cba"], 10);
	const treeTrunk = tileFromPath("landscape", "tree-trunk",
		["ada", "aaa", "ada", "aaa"], 0.1);
	const treeTop = tileFromPath("landscape", "tree-top",
		["aaa", "aaa", "ada", "aaa"], 0.1);
	const houseBase = tileFromPath("landscape", "house-base",
		["eee", "efc", "ccc", "cfe"], 10);
	const houseLeft = tileFromPath("landscape", "house-left",
		["aee", "efc", "ccc", "cba"]);
	const houseTop = tileFromPath("landscape", "house-top",
		["aaa", "age", "eee", "ega"]);
	const houseTopLeft = tileFromPath("landscape", "house-top-left",
		["aaa", "age", "eea", "aaa"]);
	return [
		blue, brown,
		greenFlat,
		greenTopLeft, BaseTile.mirrorY(greenTopLeft, 0),
		hillLeftBottom, BaseTile.mirrorY(hillLeftBottom, 0),
		hillLeftTop, BaseTile.mirrorY(hillLeftTop, 0),
		treeBase, treeTrunk, treeTop,
		houseBase, houseTop,
		houseLeft, BaseTile.mirrorY(houseLeft, 0),
		houseTopLeft, BaseTile.mirrorY(houseTopLeft, 0),
	];
}

function preload() {
	tiles = {
		basic: loadBasic(),
		circuit: loadCircuit(),
		landscape: loadLandscape(),
	};
}

function createGrid() {
	const tileset = tiles[tilesetSelect.value()];
	grid = SquareGrid.fromTiles(DIM, DIM, new Set(tileset));
	grid.constructDeps();
}

function step(mec: SquareId[]) {
	const id = random(mec);
	const cell = grid.getCell(id);
	let freqSum = 0;
	for(let t of cell)
		freqSum += 1 / t.freq;
	const r = random(freqSum);
	let freqCum = 0;
	let t: Tile;
	for(t of cell) {
		freqCum += 1 / t.freq;
		if(freqCum >= r) {
			grid.propogateDelete(id, t);
			break;
		}
	}
}

function setup() {
	createCanvas(1000, 1000).mouseClicked(canvasClicked);
	
	tilesetSelect = createSelect(select("#tileset-select"));

	select("#restart-btn").mouseClicked(() => {
		createGrid();
		loop();
	});

	createGrid();
}

function getMinEntropyCoords<CellId, Img extends IRotatable, Edge extends IEdge>
(grid: Grid<CellId, Img, Edge>): CellId[] {
	let minEntropy = Infinity;
	let minEntropyCoords: CellId[] = [];
	grid.forEach(id => {
		const cell = grid.getCell(id);
		if(cell.size < minEntropy && cell.size > 1) {
			minEntropy = cell.size;
			minEntropyCoords = [];
		}
		if(cell.size == minEntropy)
			minEntropyCoords.push(id);
	});
	return minEntropyCoords;
}

function drawSquareGrid<Edge extends IEdge>
(grid: SquareGrid<RotMirrorImage, Edge>) {
	const tw = width / DIM;
	const th = height / DIM;
	const extAngle = TWO_PI / sides;
	push();
	noFill();
	strokeWeight(3);
	imageMode(CENTER);
	rectMode(CENTER);
	translate(tw / 2, th / 2);
	grid.forEach(([i, j]) => {
		push();
		translate(j * tw, i * th);
		const options = grid.getCell([i, j]);
		if(options.size == 1) {
			const [{ image: rotImg }] = options;
			rotImg.draw(extAngle, 0, 0, tw, th);
		} else if(options.size == 0) {
			fill(0);
			rect(0, 0, tw, th);
		}
		else {
			noFill();
			rect(0, 0, tw, th);
			if(DEBUG) {
				const tileDim = 3;
				translate(-tw / 2 + tw / tileDim / 2, -th / 2 + th / tileDim / 2);
				let k = 0;
				for(let t of options) {
					t.image.draw(extAngle, (k % tileDim) * tw / tileDim,
						floor(k / tileDim) * th / tileDim,
						tw / tileDim, th / tileDim);
					k++;
				}
			}
		}
		pop();
	});
	pop();
}

function draw() {
	noSmooth();

	let minEntropyCoords: Array<[number, number]>;
	minEntropyCoords = getMinEntropyCoords(grid);
	
	if(frameCount > 1) {
		if(minEntropyCoords.length == 0) {
			noLoop();
		} else {
			step(minEntropyCoords);
		}
	}
	background(51);
	drawSquareGrid(grid);
}

function canvasClicked() {
	redraw();
	return false;
}

window["preload"] = preload;
window["setup"] = setup;
window["draw"] = draw;
