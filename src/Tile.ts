export interface IRotatable {
	rotated: (angle: number) => IRotatable;
}

export interface IMirror {
	mirrorX: () => IMirror;
	mirrorY: () => IMirror;
}

export interface IEdge {
	matchesEdge: (other: IEdge) => boolean;
}

export type EdgeId = number;

export type EdgeSet<Edge extends IEdge> = Edge[];

export class Tile<Img, Edge extends IEdge> {
	image: Img;
	freq: number;
	private edges: EdgeSet<Edge>;

	name: string;

	constructor(image: Img, edges: EdgeSet<Edge>, freq: number = 1) {
		this.image = image;
		this.edges = edges;
		this.freq = freq;
	}

	static rotate<Img extends IRotatable, Edge extends IEdge>
	(tile: Tile<Img, Edge>, edgeShift: number, maxEdges: number):
	Tile<Img, Edge> {
		const img = tile.image.rotated(edgeShift) as Img;
		const edges: EdgeSet<Edge> = tile.edges.slice();
		for(let e in tile.edges)
			edges[(parseInt(e) + edgeShift) % maxEdges] = tile.edges[e];
		const t = new Tile(img, edges, tile.freq);
		t.name = tile.name.replace(/\d/g,
			m => ((parseInt(m) + edgeShift) % 4).toString());
		return t;
	}

	static mirrorY<Img extends IMirror, Edge extends IEdge & IMirror>
	(tile: Tile<Img, Edge>, around: EdgeId): Tile<Img, Edge> {
		const around2 = tile.edges.length / 2 + around;
		const img = tile.image.mirrorY() as Img;
		const edges: EdgeSet<Edge> = tile.edges.slice();
		for(let eStr in tile.edges) {
			let e = parseInt(eStr);
			let newE = (2 * around2 - e) % tile.edges.length;
			edges[newE] = tile.edges[e].mirrorY() as Edge;
		}
		const t = new Tile(img, edges, tile.freq);
		t.name = tile.name + "-y";
		return t;
	}

	matchesTile(other: Tile<Img, Edge>, thisEdge: number, otherEdge: number):
		boolean {
		return this.edges[thisEdge].matchesEdge(other.edges[otherEdge]);
	}
}
