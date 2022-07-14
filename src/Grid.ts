import { IEdge, IRotatable, Tile } from "./Tile.js";

export interface TileDeps<Img extends IRotatable, Edge extends IEdge> {
	tile: Tile<Img, Edge>;
	edges: {
		[id: EdgeId]: Set<Tile<Img, Edge>>
	},

	name: string
}

export type EdgeId = number;

function filterSet<T>(s: Set<T>, fn: (x: T) => boolean): Set<T> {
	let s2 = new Set<T>();
	for(let x of s)
		if(fn(x))
			s2.add(x);
	return s2;
}

export abstract class Grid<CellId, Img extends IRotatable, Edge extends IEdge> {
	abstract getCell(id: CellId): Set<Tile<Img, Edge>>;
	abstract neighboursOf(id: CellId): [CellId, EdgeId][];
	abstract oppositeEdge(edge: EdgeId): EdgeId;
	abstract forEach(fn: (id: CellId) => any);

	protected abstract getCellDepsByRef(id: CellId): Set<TileDeps<Img, Edge>>;

	protected constructCellDeps(id: CellId): Set<TileDeps<Img, Edge>> {
		let cellDeps: Set<TileDeps<Img, Edge>> = new Set();
		for(let t of this.getCell(id)) {
			let tileDeps: TileDeps<Img, Edge> = {
				tile: t,
				edges: {},
				name: t.name
			};
			for(let [ngbr, e] of this.neighboursOf(id)) {
				tileDeps.edges[e] = filterSet(this.getCell(ngbr),
					t2 => t.matchesTile(t2, e, this.oppositeEdge(e)));
			}
			cellDeps.add(tileDeps);
		}
		return cellDeps;
	}

	propogateDelete(id: CellId, toDelete: Tile<Img, Edge>) {
		type T = Tile<Img, Edge>;
		this.removeTile(id, toDelete);
		const stack: [CellId, T][] = [[id, toDelete]];
		while(stack.length > 0) {
			const [currId, currDelTile] = stack.pop();
			for(let [ngbr, edge] of this.neighboursOf(currId)) {
				const cellDeps = this.getCellDepsByRef(ngbr);
				const oppEdge = this.oppositeEdge(edge);
				for(let cd of cellDeps) {
					if(!(oppEdge in cd.edges))
						continue;
					const edgeDeps = cd.edges[oppEdge];
					if(edgeDeps.delete(currDelTile)
					&& edgeDeps.size == 0) {
						cellDeps.delete(cd);
						if(cellDeps.size == 0)
							return;
						stack.push([ngbr, cd.tile]);
					}
				}
			}
		}
	}

	private removeTile(id: CellId, tile: Tile<Img, Edge>) {
		let cds = this.getCellDepsByRef(id)
		for(let cd of cds)
			if(cd.tile == tile) {
				cds.delete(cd);
				break;
			}
	}
}
