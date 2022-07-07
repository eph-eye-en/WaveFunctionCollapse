export interface IRotatable {
	rotated: (angle: number) => IRotatable;
}

export interface IEdge {
	matchesEdge: (other: IEdge) => boolean;
}

export class Tile<Img extends IRotatable, Edge extends IEdge>
implements IRotatable {
	image: Img;
	freq: number;
	private edges: Edge[];

	constructor(image: Img, edges: Edge[], freq: number = 1) {
		this.image = image;
		this.edges = edges;
		this.freq = freq;
	}

	rotated(edgeShift: number): Tile<Img, Edge> {
		const img = this.image.rotated(edgeShift) as Img;
		const edges = this.edges.slice(-edgeShift)
			.concat(this.edges.slice(0, -edgeShift));
		return new Tile(img, edges, this.freq);
	}

	matchesTile(other: Tile<Img, Edge>, thisEdge: number, otherEdge: number):
		boolean {
		return this.edges[thisEdge].matchesEdge(other.edges[otherEdge]);
	}
}
