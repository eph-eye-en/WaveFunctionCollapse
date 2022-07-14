import { EdgeId, Grid, TileDeps } from "./Grid.js";
import { IEdge, IRotatable, Tile } from "./Tile.js";

export type Square<Img extends IRotatable, Edge extends IEdge>
	= Set<TileDeps<Img, Edge>>;

//Co-ordinates of a tile in the grid.
export type SquareId = [number, number];

const NORTH = 0;
const EAST = 1;
const SOUTH = 2;
const WEST = 3;
const EDGES = [NORTH, EAST, SOUTH, WEST];

export class SquareGrid<Img extends IRotatable, Edge extends IEdge>
extends Grid<SquareId, Img, Edge> {
	width: number;
	height: number;
	private cells: Set<Tile<Img, Edge>>[][] | null = null;
	private cellDeps: Square<Img, Edge>[][] | null = null;

	private constructor(cells: Set<Tile<Img, Edge>>[][]) {
		super();
		this.width = cells[0].length;
		this.height = cells.length;
		this.cells = cells;
		this.cellDeps = null;
	}

	static fromTiles<Img extends IRotatable, Edge extends IEdge>
	(width: number, height: number, initTiles: Set<Tile<Img, Edge>>):
	SquareGrid<Img, Edge> {
		const cells: Set<Tile<Img, Edge>>[][] =
			new Array(height).fill([]).map(_ =>
				new Array(width).fill([]).map(_ =>
					new Set(initTiles)));
		return new SquareGrid(cells);
	}

	setCell([i, j]: SquareId, tiles: Set<Tile<Img, Edge>>) {
		if(this.cells == null)
			throw new Error("Cannot modify cell after constructDeps");
		this.cells[i][j] = tiles;
	}

	constructDeps() {
		if(this.cells == null)
			throw new Error("constructDeps has already been called");
		this.cellDeps = [];
		for(let i = 0; i < this.height; i++) {
			const row: Square<Img, Edge>[] = [];
			for(let j = 0; j < this.width; j++) {
				row.push(this.constructCellDeps([i, j]));
			}
			this.cellDeps.push(row);
		}
		this.cells = null;
	}

	getCell([i, j]: SquareId): Set<Tile<Img, Edge>> {
		if(this.cells != null)
			return this.cells[i][j];
		const cd: Set<Tile<Img, Edge>> = new Set();
		for(let c of this.cellDeps[i][j])
			cd.add(c.tile);
		return cd;
	}

	neighboursOf([i, j]: SquareId): [SquareId, EdgeId][] {
		const ngbrs: [SquareId, EdgeId][] = [];
		if(i > 0)
			ngbrs.push([[i - 1, j    ], NORTH]);
		if(j < this.width - 1)
			ngbrs.push([[i,     j + 1], EAST]);
		if(i < this.height - 1)
			ngbrs.push([[i + 1, j    ], SOUTH]);
		if(j > 0)
			ngbrs.push([[i,     j - 1], WEST]);
		return ngbrs;
	}

	oppositeEdge(edge: EdgeId): EdgeId {
		return (edge + 2) % 4;
	}

	forEach(fn: (id: SquareId) => any) {
		for(let i = 0; i < this.width; i++)
			for(let j = 0; j < this.height; j++)
				fn([i, j]);
	}
	
	protected getCellDepsByRef([i, j]: SquareId): Set<TileDeps<Img, Edge>> {
		return this.cellDeps[i][j];
	}
}
