import { Image } from "p5";
import { IMirror, IRotatable } from "./Tile";

export class RotMirrorImage implements IRotatable, IMirror {
	img: Image;
	fn: (a: number) => void;

	private constructor(img: Image, fn: (a: number) => void) {
		this.img = img;
		this.fn = fn;
	}

	static from(img: Image): RotMirrorImage {
		return new RotMirrorImage(img, _ => {});
	}

	mirrorX(): RotMirrorImage {
		return new RotMirrorImage(this.img, angleUnit => {
			scale(1, -1);
			this.fn(angleUnit);
		});
	}
	
	mirrorY(): RotMirrorImage {
		return new RotMirrorImage(this.img, angleUnit => {
			scale(-1, 1);
			this.fn(angleUnit);
		});
	}
	
	rotated(angle: number): RotMirrorImage {
		return new RotMirrorImage(this.img, angleUnit => {
			rotate(angle * angleUnit);
			this.fn(angleUnit);
		});
	}

	draw(angleUnit: number, x: number, y: number, w?: number, h?: number) {
		push();
		translate(x, y);
		this.fn(angleUnit);
		image(this.img, 0, 0, w, h);
		pop();
	}
}