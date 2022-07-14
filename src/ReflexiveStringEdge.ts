import { IEdge, IMirror, IRotatable, Tile } from "./Tile.js";

function reverseString(s: string): string {
	return s.split("").reverse().join("");
}

export default class ReflexiveStringEdge implements IEdge, IMirror {
	private pattern: string;
	constructor(pattern: string) {
		this.pattern = pattern;
	}

	matchesEdge(other: IEdge): boolean {
		const rse = other as ReflexiveStringEdge;
		return this.pattern == reverseString(rse.pattern);
	}

	static tileFromPatterns<Img extends IRotatable>
		(img: Img, patterns: string[], freq?: number):
		Tile<Img, ReflexiveStringEdge> {
		return new Tile(img, patterns.map(p => new ReflexiveStringEdge(p)),
			freq);
	}

	mirrorX(): IMirror {
		return new ReflexiveStringEdge(this.pattern);
	}

	mirrorY(): IMirror {
		return new ReflexiveStringEdge(reverseString(this.pattern));
	}
}
