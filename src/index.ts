//import * as p5 from "p5";
import { Graphics, Image } from "p5";
import * as p5Global from "p5/global";

import { IRotatable, Tile as BaseTile } from "./Tile.js";
import ReflexiveStringEdge from "./ReflexiveStringEdge.js";

type Tile = BaseTile<RotatableImage, ReflexiveStringEdge>;
type GridCell = Array<Tile>;
type GridRow = Array<GridCell>;
type Grid = Array<GridRow>;

let sides = 4;
let tiles: Array<Tile>;
const dim = 20;
let grid: Grid;

class RotatableImage implements RotatableImage {
	img: Image;
	angle: number = 0;

	constructor(img: Image, angle: number = 0) {
		this.img = img;
		this.angle = angle;
	}

	rotated(angle: number): IRotatable {
		return new RotatableImage(this.img, this.angle + angle);
	}
}

function loadBasic() {
	const blank = ReflexiveStringEdge.tileFromPatterns(
		new RotatableImage(loadImage("tiles/basic/blank.png")),
		["aaa", "aaa", "aaa", "aaa"],
		20
	);
	const upT = ReflexiveStringEdge.tileFromPatterns(
		new RotatableImage(loadImage("tiles/basic/up-t.png")),
		["aba", "aba", "aaa", "aba"]
	);
	const leftRight = ReflexiveStringEdge.tileFromPatterns(
		new RotatableImage(loadImage("tiles/basic/left-right.png")),
		["aaa", "aba", "aaa", "aba"]
	);
	return [
		blank,
		upT, upT.rotated(1), upT.rotated(2), upT.rotated(3),
		leftRight, leftRight.rotated(1),
	];
}

function loadCircuit() {
	const blank = ReflexiveStringEdge.tileFromPatterns(
		new RotatableImage(loadImage("tiles/circuit/blank.png")),
		["aaa", "aaa", "aaa", "aaa"]
	);
	const leftRightGrey = ReflexiveStringEdge.tileFromPatterns(
		new RotatableImage(loadImage("tiles/circuit/left-right-grey.png")),
		["aaa", "aba", "aaa", "aba"],
		0.1
	);
	const leftRightGreen = ReflexiveStringEdge.tileFromPatterns(
		new RotatableImage(loadImage("tiles/circuit/left-right-green.png")),
		["aaa", "aca", "aaa", "aca"]
	);
	const upRightGreen = ReflexiveStringEdge.tileFromPatterns(
		new RotatableImage(loadImage("tiles/circuit/up-right-green.png")),
		["aca", "aca", "aaa", "aaa"]
	);
	const crossover = ReflexiveStringEdge.tileFromPatterns(
		new RotatableImage(loadImage("tiles/circuit/crossover.png")),
		["aba", "aca", "aba", "aca"],
		0.1
	);
	const greenLeftGreyRight = ReflexiveStringEdge.tileFromPatterns(
		new RotatableImage(loadImage("tiles/circuit/green-left-grey-right.png")),
		["aaa", "aba", "aaa", "aca"]
	);
	const black = ReflexiveStringEdge.tileFromPatterns(
		new RotatableImage(loadImage("tiles/circuit/black.png")),
		["ddd", "ddd", "ddd", "ddd"]
	);
	const pinRight = ReflexiveStringEdge.tileFromPatterns(
		new RotatableImage(loadImage("tiles/circuit/pin-right.png")),
		["daa", "aca", "aad", "ddd"]
	);
	const cornerTopLeft = ReflexiveStringEdge.tileFromPatterns(
		new RotatableImage(loadImage("tiles/circuit/corner-top-left.png")),
		["daa", "aaa", "aaa", "aad"],
		0.5
	);
	return [
		blank, black,
		leftRightGrey, leftRightGrey.rotated(1),
		leftRightGreen, leftRightGreen.rotated(1),
		upRightGreen, upRightGreen.rotated(1), upRightGreen.rotated(2),
			upRightGreen.rotated(3),
		crossover, crossover.rotated(1),
		greenLeftGreyRight, greenLeftGreyRight.rotated(1),
			greenLeftGreyRight.rotated(2), greenLeftGreyRight.rotated(3),
		pinRight, pinRight.rotated(1), pinRight.rotated(2), pinRight.rotated(3),
		cornerTopLeft, cornerTopLeft.rotated(1), cornerTopLeft.rotated(2),
			cornerTopLeft.rotated(3),
	];
}

function preload() {
	//tiles = loadBasic();
	tiles = loadCircuit();
}

function setup() {
	createCanvas(1000, 1000);
	
	//randomSeed(1);

	grid = [];
	for(let i = 0; i < dim; i++) {
		let row: GridRow = [];
		for(let j = 0; j < dim; j++)
			row.push(tiles);
		grid.push(row);
	}

	grid[0][0] = [tiles[2]];

	frameRate(15);
}

function pruneTileEdge(tile: Tile, adjCell: GridCell, edgeIdx: number): boolean{
	if(adjCell.length == 0)
		return false;
	const adjEdgeIdx = (edgeIdx + (sides / 2)) % sides;
	return !adjCell.some(t => tile.matchesTile(t, edgeIdx, adjEdgeIdx));
}

function pruneTile(tile: Tile, grid: Grid, i: number, j: number): boolean {
	return (i > 0       && pruneTileEdge(tile, grid[i - 1][j   ], 0))
		|| (j < dim - 1 && pruneTileEdge(tile, grid[i   ][j + 1], 1))
		|| (i < dim - 1 && pruneTileEdge(tile, grid[i + 1][j   ], 2))
		|| (j > 0       && pruneTileEdge(tile, grid[i   ][j - 1], 3));
}

function iterateGrid(grid: Grid): [Grid, boolean, Array<[number, number]>] {
	let changed = false;
	let minEntropy = Infinity;
	let minEntropyCoords: Array<[number, number]> = [];
	const newGrid = grid.map((row, i) =>
		row.map((cell, j) => {
			let newCell = cell.filter(tile => {
				if(!pruneTile(tile, grid, i, j))
					return true;
				changed = true;
				return false;
			});
			if(newCell.length < minEntropy && newCell.length > 1)
				minEntropy = newCell.length;
			if(newCell.length == minEntropy)
				minEntropyCoords.push([i, j]);
			return newCell;
		})
	)
	return [newGrid, changed, minEntropyCoords];
}

function drawGrid(grid: Grid) {
	const tw = width / dim;
	const th = height / dim;
	const extAngle = TWO_PI / sides;
	push();
	noFill();
	strokeWeight(3);
	imageMode(CENTER);
	rectMode(CENTER);
	translate(tw / 2, th / 2);
	for(let i = 0; i < dim; i++) {
		for(let j = 0; j < dim; j++) {
			const options = grid[i][j];
			if(options.length == 1) {
				const rotImg = options[0].image;
				push();
				rotate(extAngle * rotImg.angle);
				image(rotImg.img, 0, 0, tw, th);
				pop();
			} else if(options.length == 0) {
				fill(0);
				rect(0, 0, tw, th);
			}
			else {
				noFill();
				rect(0, 0, tw, th);
			}
			translate(tw, 0);
		}
		translate(-width, th);
	}
	pop();
}

function draw() {
	background(51);

	let changed = false;
	let minEntropyCoords: Array<[number, number]>;
	[grid, changed, minEntropyCoords] = iterateGrid(grid);
	drawGrid(grid);

	if(!changed) {
		if(minEntropyCoords.length == 0) {
			noLoop();
		} else {
			const [i, j] = random(minEntropyCoords);
			const freqSum = grid[i][j].reduce((f, t) => f + 1 / t.freq, 0);
			const r = random(freqSum);
			let freqCum = 1 / grid[i][j][0].freq;
			let t = 0;
			while(freqCum < r) {
				t++;
				freqCum += 1 / grid[i][j][t].freq;
			}
			grid[i][j].splice(t, 1);
		}
	}
}

window["preload"] = preload;
window["setup"] = setup;
window["draw"] = draw;
