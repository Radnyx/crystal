import * as PIXI from 'pixi.js-legacy';
import * as Graphics from './Graphics';
import Ease from "./Ease";

const openTexture = PIXI.Texture.from('open.png');
const openSheet = Graphics.tileHorizontal(openTexture, 40, 40, 4);

const attackTex: { [index: string]: PIXI.Texture } = {
	BOOM_SMALL: Graphics.attack(0, 0, 2, 2),
	BOOM_MED: Graphics.attack(0, 2, 3, 3),
	BOOM_BIG: Graphics.attack(0, 5, 4, 4),
	GRAY_DIAG: Graphics.attack(2, 0, 1, 1),
	RAZOR: Graphics.attack(25, 6, 2, 1),
	RAZOR_DARK: Graphics.attack(25, 7, 2, 1),
	GROWL_HORIZ_LIGHT: Graphics.attack(6, 15, 3, 1),
	GROWL_HORIZ_DARK: Graphics.attack(9, 15, 3, 1),
	GROWL_DIAG_LIGHT: Graphics.attack(6, 16, 3, 3),
	GROWL_DIAG_DARK: Graphics.attack(9, 16, 3, 3),
	NOTE_QUARTER: Graphics.attack(4, 16, 1, 2),
	NOTE_EIGHTH: Graphics.attack(5, 16, 1, 2),
	NOTE_SIXTEENTH: Graphics.attack(4, 18, 2, 2),
	Z_SMALL: Graphics.attack(3, 19, 1, 1),
	Z_MED: Graphics.attack(3, 20, 1, 1),
	Z_BIG: Graphics.attack(3, 21, 2, 2),
	RING_1: Graphics.attack(11, 0, 1, 2),
	RING_2: Graphics.attack(12, 0, 2, 3),
	RING_3: Graphics.attack(14, 0, 2, 3),
	RING_4: Graphics.attack(16, 0, 2, 4),
	BIRD_1: Graphics.attack(10, 6, 2, 2),
	BIRD_2: Graphics.attack(10, 8, 2, 2),
	BLACK_CIRCLE_SMALL: Graphics.attack(5, 2, 2, 2),
	BLACK_CIRCLE: Graphics.attack(7, 2, 4, 4),
	EXPLOSION: Graphics.attack(4, 216/8,4,4),
	PARA_1: Graphics.attack(3, 9, 1, 5),
	PARA_2: Graphics.attack(3, 14, 1, 5),
	BOMB: Graphics.attack(12, 10, 2, 2),
	PSN_BUBBLE_1: Graphics.attack(12, 12, 1, 1),
	PSN_BUBBLE_2: Graphics.attack(13, 12, 1, 1),
	PSN_BUBBLE_3: Graphics.attack(12, 13, 1, 1),
	SKULL: Graphics.attack(14, 10, 2, 2),
	SPEED_3: Graphics.attack(176/8,232/8,1,3),
	SPEED_2: Graphics.attack(184/8,208/8,3,6),
	SPEED_1: Graphics.attack(208/8,200/8,6,7),
	SHADOW_BALL: Graphics.attack(96/8, 112/8, 2, 2),
	SWORD: Graphics.attack(3, 2, 2, 2),
	CRUNCH_1: Graphics.attack(112/8,48/8,4,2),
	CRUNCH_2: Graphics.attack(112/8,8,2,1),
	ICE_3: Graphics.attack(6, 4, 1, 2),
	ICE_4: Graphics.attack(112/8,112/8,1,2),
	ICE_4_TOP: Graphics.attack(112/8,112/8,1,1),
	PUNCH: Graphics.attack(3, 0, 2, 2),
	FOOT: Graphics.attack(7, 0, 2, 2),
	ENERGY_1: Graphics.attack(3, 23, 2, 2),
	ENERGY_2: Graphics.attack(3, 25, 2, 2),
	SPHERE_1: Graphics.attack(232/8,6, 3, 3),
	SPHERE_2: Graphics.attack(232/8,9, 3, 3),
	SPHERE_3: Graphics.attack(232/8,12, 3, 3),
	SPHERE_4: Graphics.attack(232/8,15, 3, 3),
	SPHERE_5: Graphics.attack(232/8,18, 3, 3),
	SPHERE_6: Graphics.attack(232/8,21, 3, 3),
	BEAM_1: Graphics.attack(5, 192/8, 1, 3),
	BEAM_1_END: Graphics.attack(6, 25, 2, 2),
	BEAM_2: Graphics.attack(5,168/8, 1, 3),
	BEAM_2_END: Graphics.attack(6,23, 2, 2),
	TWINKLE_1_LIGHT: Graphics.attack(8,184/8,2,2),
	TWINKLE_2_LIGHT: Graphics.attack(8,184/8+2,3,3),
	TWINKLE_3_LIGHT: Graphics.attack(8,184/8+5,4,4),
	TWINKLE_1_DARK: Graphics.attack(10,184/8,2,2),
	TWINKLE_2_DARK: Graphics.attack(11,184/8+2,3,3),
	TWINKLE_3_DARK: Graphics.attack(12,184/8+5,4,4),
	FLY_BIG_1: Graphics.attack(21, 8, 4, 7),
	FLY_BIG_2: Graphics.attack(25, 8, 4, 7),
	FLY_MED: Graphics.attack(16, 8, 2, 7),
	FLY_SMALL_1: Graphics.attack(216/8, 15, 1, 7),
	FLY_SMALL_2: Graphics.attack(224/8, 15, 1, 7),
	SUBSTITUTE_FRONT: Graphics.attack(48/8,152/8,2,2),
	SUBSTITUTE_BACK: Graphics.attack(48/8+2,152/8,2,2),
	SPARKLE_1: Graphics.attack(64/8,168/8, 1, 1),
	SPARKLE_2: Graphics.attack(64/8,168/8+1, 1, 1),
	HAND: Graphics.attack(48/8,168/8, 2, 2),
	DISABLE_DARK_5: Graphics.attack(128 / 8, 176 / 8, 6, 5),
	DISABLE_DARK_4: Graphics.attack(128 / 8, 176 / 8 + 1, 6, 4),
	DISABLE_DARK_3: Graphics.attack(128 / 8, 176 / 8 + 2, 6, 3),
	DISABLE_DARK_2: Graphics.attack(128 / 8, 176 / 8 + 3, 6, 2),
	DISABLE_DARK_1: Graphics.attack(128 / 8, 176 / 8 + 4, 6, 1),
	DISABLE_LIGHT_5: Graphics.attack(128 / 8, 216 / 8, 6, 5),
	DISABLE_LIGHT_4: Graphics.attack(128 / 8, 216 / 8 + 1, 6, 4),
	DISABLE_LIGHT_3: Graphics.attack(128 / 8, 216 / 8 + 2, 6, 3),
	DISABLE_LIGHT_2: Graphics.attack(128 / 8, 216 / 8 + 3, 6, 2),
	DISABLE_LIGHT_1: Graphics.attack(128 / 8, 216 / 8 + 4, 6, 1),
	CLAP: Graphics.attack(72 / 8, 168 / 8, 1, 2),
	STAR: Graphics.attack(72 / 8 + 1, 168 / 8, 2, 2),
	FIRE_SMALL_1: Graphics.attack(96/8, 40/8, 1, 1),
	FIRE_SMALL_2: Graphics.attack(96/8 + 1, 40/8, 1, 1),
	FIRE_BIG_1: Graphics.attack(96/8, 40/8 + 1, 2, 2),
	FIRE_BIG_2: Graphics.attack(96/8, 40/8 + 3, 2, 2),
	BUBBLE_1: Graphics.attack(10, 10, 1, 1),
	BUBBLE_2: Graphics.attack(10, 11, 2, 2),
	BUBBLE_3: Graphics.attack(10, 13, 2, 2),
};

const notes = [
	attackTex.NOTE_QUARTER, attackTex.NOTE_EIGHTH, attackTex.NOTE_SIXTEENTH
];

const Zs = [
	attackTex.Z_SMALL,
	attackTex.Z_MED,
	attackTex.Z_BIG,
	attackTex.Z_MED,
];

const rings = [
	attackTex.RING_1,
	attackTex.RING_2,
	attackTex.RING_3,
	attackTex.RING_4
];

const bubbleUp = [3,4,5,6,7,8].map(x =>
	new PIXI.Texture(attackTex.PSN_BUBBLE_1 as any, new PIXI.Rectangle(96, 96, 8, x))
);

class Particle {
	protected readonly stage: PIXI.Container;
	protected x: number;
	protected y: number;
	protected dx: number;
	protected dy: number;
	protected offX: undefined | ((x: number) => number) = undefined;
	protected offY: undefined | ((y: number) => number) = undefined;
	protected transX: undefined | ((x: number) => number) = undefined;
	protected transY: undefined | ((y: number) => number) = undefined;
	protected delayFrames: number = 0;
	protected life: number = 0;
	protected flickerFrames: number | undefined = undefined;
	protected timer: number;
	public dead: boolean;
	protected sprites: PIXI.Sprite[];


	constructor(stage: PIXI.Container, x: number, y: number, dx = 0, dy = 0) {
		this.stage = stage;
		this.x = x;
		this.y = y;
		this.dx = dx;
		this.dy = dy;
		this.timer = 0;
		this.dead = false;
		this.sprites = [];
	}

	addSprite(x: number, y: number) {
		const s = new PIXI.Sprite();
		s.anchor.set(0.5);
		s.x = x;
		s.y = y;
		this.sprites.push(s);
		this.stage.addChild(s);
		return s;
	}

	update() {
		const t = (this.timer - this.delayFrames) / this.life;
		if (this.transX) {
			this.x += this.transX(t);
			this.sprites[0].x = Math.floor(this.x);
		}
		if (this.offX) {
			this.sprites[0].x = Math.floor(this.x + this.offX(t));
		}
		if (this.transY) {
			this.y += this.transY(t);
			this.sprites[0].y = Math.floor(this.y);
		}
		if (this.offY) {
			this.sprites[0].y = Math.floor(this.y + this.offY(t));
		}
		if (!this.dead) {
			this._update();
		}
		if (this.flickerFrames && this.timer % this.flickerFrames === 0) {
			this.flicker();
		}
		this.timer++;
	}

	_update() {}

	die() {
		this.sprites.forEach(s => this.stage.removeChild(s));
		this.dead = true;
	}

	flicker() {
		this.sprites.forEach(s => s.visible = !s.visible);
	}

	setFlicker(n: number) {
		this.flickerFrames = n;
		return this;
	}

	flipHorizontally() {
		this.sprites[0].scale.x = -this.sprites[0].scale.x;
		return this;
	}

	offsetX(f: (t: number) => number) {
		this.offX = f;
		return this;
	}

	offsetY(f: (t: number) => number) {
		this.offY = f;
		return this;
	}

	priority(i = 1) {
		this.sprites.forEach(s => s.zIndex = i);
		return this;
	}

	transformX(f: number | ((t: number) => number)) {
		if (typeof f === 'number') this.transX = t => f;
		else this.transX = f;
		return this;
	}

	transformY(f: number | ((t: number) => number)) {
		if (typeof f === 'number') this.transY = t => f;
		else this.transY = f;
		return this;
	}

}


class Static extends Particle {
	constructor(stage: PIXI.Container, x: number, y: number, tex: string, life: number) {
		super(stage, x, y);
		this.addSprite(x, y).texture = attackTex[tex];
		this.life = life;
		this.delayFrames = 0;
	}

	_update() {
		if (this.timer >= this.delayFrames) this.sprites[0].visible = true;
		if (this.timer >= this.life + this.delayFrames) this.die();
	}

	delayStart(frames: number) {
		this.delayFrames = frames;
		this.sprites[0].visible = false;
		return this;
	}
}

class Sequence extends Particle {
	protected texs: PIXI.Texture[];
	protected delay: number;

	constructor(
		stage: PIXI.Container, 
		x: number, 
		y: number, 
		texs: string[], 
		delay: number, 
		life: number | undefined = undefined
	) {
		super(stage, x, y);
		this.addSprite(x, y);
		this.texs = texs.map(name => attackTex[name]);
		this.delay = delay;
		if (life == null) {
			this.life = delay * texs.length;
		} else {		
			this.life = life;
		}
	}

	_update() {
		if (this.timer >= this.life) {
			this.die();
			return;
		}
		this.sprites[0].texture = this.texs[Math.floor(this.timer / this.delay) % this.texs.length];
	}
}

/* Ball opening effect when a member is sent out. */
class Open extends Particle {
	constructor(stage: PIXI.Container, x: number, y: number) {
		super(stage, x, y);
		this.addSprite(x, y);
	}

	_update() {
		if (this.timer >= 16) {
			this.die();
			return;
		}
		this.sprites[0].texture = openSheet[Math.floor(this.timer / 4) % 4];
	}
}

class Twinkle extends Sequence {
	constructor(stage: PIXI.Container, x: number, y: number) {
		super(stage, x, y,
			["TWINKLE_1_LIGHT", "TWINKLE_1_DARK",
			 "TWINKLE_2_LIGHT", "TWINKLE_2_DARK",
			 "TWINKLE_3_LIGHT", "TWINKLE_3_DARK"],
			3,
			18);
	}
}

class Fly extends Sequence {
	constructor(stage: PIXI.Container, x: number, y: number) {
		super(stage, x, y, ["FLY_BIG_1", "FLY_BIG_2",
			"FLY_MED", "FLY_SMALL_2",
			"FLY_SMALL_1", "FLY_SMALL_2"], 3);
	}
}

class Slash extends Particle {
	private pieces: number;
	private delay: number;
	private flickerTime: number;

	constructor(stage: PIXI.Container, x: number, y: number, pieces = 4) {
		super(stage, x, y);
		// number of diags to build
		this.pieces = pieces;
		// every 4 frames add a diag
		this.delay = 3;
		// time to flicker for
		this.flickerTime = 16;
	}

	_update() {
		// first add boom thing
		if (this.timer === 0) {
			// boom thing
			this.addSprite(this.x, this.y).texture = attackTex.BOOM_SMALL;
			// line
			this.addSprite(this.x + 4, this.y - 4).texture = attackTex.GRAY_DIAG;
			this.x -= 6;
			this.y += 6;
		} else if (this.timer < this.pieces * this.delay) {
			if (this.timer % this.delay === 0) {
				this.sprites[0].x -= 6;
				this.sprites[0].y += 6;

				this.addSprite(this.x + 4, this.y - 4).texture = attackTex.GRAY_DIAG;
				this.x -= 6;
				this.y += 6;
			}
		} else if (this.timer < this.pieces * this.delay + this.flickerTime) {
			// no more boom
			this.sprites[0].texture = undefined as any;
			// flash
			if (this.timer % 4 === 0 || this.timer % 4 === 2) {
				this.flicker();
			}
		} else {
			this.die();
		}
	}
}

class VineWhip extends Particle {
		constructor(stage: PIXI.Container, x: number, y: number, sx: number, sy: number) {
			super(stage, x, y);
			this.addSprite(x, y).texture = attackTex.RAZOR;
			this.sprites[0].scale.set(sx, sy);
		}

		_update() {
			if (this.timer === 6) {
				this.sprites[0].texture = attackTex.RAZOR_DARK;
			}
			else if (this.timer === 12) {
				this.die();
			}
		}
}

class Growl extends Particle {
	private readonly scaleX: number;

	constructor(stage: PIXI.Container, x: number, y: number, scaleX: number) {
		super(stage, x, y);
		this.scaleX = scaleX;
		this.addSprite(x, y - 12).scale.set(scaleX, 1);
		this.addSprite(x, y).scale.set(scaleX, 1);
		this.addSprite(x, y + 12).scale.set(scaleX, -1);
	}

	_update() {
		const t = this.timer;
		const d = Math.floor(14 * Ease.inOutQuad(t / 10));
		this.sprites.forEach(s => s.x = this.x + this.scaleX * d);
		this.sprites[0].y = this.y - 12 - d;
		this.sprites[2].y = this.y + 12 + d;

		const dark = Math.floor(t / 2) % 2 === 0;
		this.sprites[1].texture = dark
			? attackTex.GROWL_HORIZ_DARK
			: attackTex.GROWL_HORIZ_LIGHT;

		this.sprites[0].texture =
		this.sprites[2].texture = dark
			? attackTex.GROWL_DIAG_DARK
			: attackTex.GROWL_DIAG_LIGHT;

		if (t > 10) this.die();
	}
}

class Note extends Particle {
	constructor(stage: PIXI.Container, x: number, y: number, dx: number, dy: number) {
		super(stage, x, y, dx, dy);
		this.addSprite(x, y).texture = notes[Math.floor(Math.random() * 3)];
	}

	_update() {
		this.y += this.dy;
		this.sprites[0].x += this.dx;
		this.sprites[0].y = Math.floor(this.y
			+ Math.sin(this.timer * this.dx / 24) * 8);
		if (this.x < 0 || this.y < 0 ||
			  this.x >= Graphics.GAMEBOY_WIDTH || this.y >= Graphics.GAMEBOY_HEIGHT)
			this.die();
	}
}

class Z extends Particle {
	constructor(stage: PIXI.Container, x: number, y: number, dx: number) {
		super(stage, x, y, dx);
		this.addSprite(x, y);
	}

	_update() {
		this.sprites[0].texture = Zs[Math.floor(this.timer / 10) % 4];
		this.x += this.dx / 16.0;
		this.y -= 0.25;
		this.sprites[0].x = Math.floor(this.x +
			Math.sin(this.timer / 6) * 6);
		this.sprites[0].y = Math.floor(this.y);
		if (this.timer >= 10 * 7) this.die();
	}
}

class Ring extends Particle {
	constructor(stage: PIXI.Container, x: number, y: number, dx: number, dy: number) {
		super(stage, x, y, dx, dy);
		this.addSprite(x, y);
	}

	_update() {
		if (this.timer >= 8 * 4) {
			this.die();
			return;
		}
		this.x += this.dx;
		this.y += this.dy;
		this.sprites[0].texture = rings[Math.floor(this.timer / 8)];
		this.sprites[0].x = this.x;
		this.sprites[0].y = this.y;
	}
}

class Rotate extends Particle {
	protected cos_t: number = 0;
	protected delay: number;
	protected period: number;
	protected w: number;
	protected h: number;

	constructor(stage: PIXI.Container, x: number, y: number, w: number, h: number, period: number, delay: number) {
		super(stage, x, y);
		this.w = w;
		this.h = h;
		this.period = period;
		this.delay = delay;
	}

	_update() {
		const t = ((this.timer + this.delay) / this.period) * (Math.PI * 2.0);
		this.cos_t = Math.cos(t);
		this.sprites[0].x = Math.floor(this.x + Math.sin(t) * this.w);
		this.sprites[0].y = Math.floor(this.y + this.cos_t * this.h);
	}
}

class Bird extends Rotate {
	constructor(stage: PIXI.Container, x: number, y: number, delay: number) {
		super(stage, x, y, 16, 4, 60, delay * 20);
		this.addSprite(x, y);
	}

	_update() {
		super._update();

		if (this.cos_t > 0) this.sprites[0].scale.set(-1, 1);
		else this.sprites[0].scale.set(1, 1);
		this.sprites[0].texture = Math.floor(this.timer / 6.0) % 2 === 0
			? attackTex.BIRD_1
			: attackTex.BIRD_2;

		if (this.timer > 90 + 12) this.die();
	}
}

class Sword extends Rotate {
	constructor(stage: PIXI.Container, x: number, y: number, delay: number) {
		super(stage, x, y, 24, 3, 80, -delay * (80 / 5));
		this.addSprite(x, y).texture = attackTex.SWORD;
	}

	_update() {
		super._update();
		this.y -= 1.25;
		if (this.timer >= 90 / 3 + 4) this.die();
	}
}

class Disable extends Particle {

	private static readonly TEXTURES = [
		[
			attackTex.DISABLE_LIGHT_1,
			attackTex.DISABLE_LIGHT_2,
			attackTex.DISABLE_LIGHT_3,
			attackTex.DISABLE_LIGHT_4,
			attackTex.DISABLE_LIGHT_5,
		],
		[
			attackTex.DISABLE_DARK_1,
			attackTex.DISABLE_DARK_2,
			attackTex.DISABLE_DARK_3,
			attackTex.DISABLE_DARK_4,
			attackTex.DISABLE_DARK_5,
		]
	];

	constructor(stage: PIXI.Container, x: number, y: number) {
		super(stage, x, y);
		this.addSprite(x, y);
	}

	_update() {
		const lightOrDark = Math.floor(this.timer / 6) % 2;
		if (this.timer < 30) {
			const keyFrame = Math.floor(this.timer / (30 / 5));
			this.sprites[0].y = this.y + (4 - keyFrame) * 4;
			this.sprites[0].texture = Disable.TEXTURES[lightOrDark][keyFrame];
		} else {
			this.sprites[0].y = this.y;
			this.sprites[0].texture = Disable.TEXTURES[lightOrDark][4];
		}
		if (this.timer >= 120) this.die();
	}
}

class Paralysis extends Particle {
	protected dir: number;

	constructor(stage: PIXI.Container, x: number, y: number, dir: number) {
		super(stage, x, y);
		this.addSprite(x, y).scale.set(dir, 1);
		this.dir = dir;
	}

	_update() {
		// 120 frames
		this.sprites[0].x = this.x +
			(Math.floor(this.timer / 6) % 2 === 0 ? -2 : 2) * this.dir;
		this.sprites[0].texture =
			(Math.floor(this.timer / 2) % 2 === 0)
			?	attackTex.PARA_1
			: attackTex.PARA_2;
		if (this.timer >= 120) this.die();
	}
}

class Bomb extends Particle {
	protected deadY: number;

	constructor(stage: PIXI.Container, x: number, y: number, dx: number, dy: number, deadY: number) {
		super(stage, x, y, dx, dy);
		this.addSprite(x, y).texture = attackTex.BOMB;
		this.deadY = deadY;
	}

	_update() {
		this.x += this.dx;
		this.y += this.dy;
		this.dy += 0.25;
		this.sprites[0].x = Math.floor(this.x);
		this.sprites[0].y = Math.floor(this.y);
		if (this.y >= this.deadY && this.dy > 0) this.die();
	}
}

class PoisonBubble extends Particle {
	constructor(stage: PIXI.Container, x: number, y: number) {
		super(stage, x, y);
		this.addSprite(x, y);
	}

	_update() {
		const SPEED = 1.0;
		const t = Math.floor(this.timer / SPEED);
		if (t < 6) {
			this.sprites[0].texture = bubbleUp[t];
		} else if (t < 30) {
			this.y -= 1.0 / SPEED;
			this.sprites[0].texture = attackTex.PSN_BUBBLE_2;
		} else if (t < 32) {
			this.y -= 1.0 / SPEED;
			this.sprites[0].texture = attackTex.PSN_BUBBLE_3;
		} else {
			this.die();
		}
		this.sprites[0].y = Math.floor(this.y);
	}
}

class Speed extends Sequence {
	constructor(stage: PIXI.Container, x: number, y: number) {
		super(stage, x, y, [ "SPEED_1", "SPEED_2", "SPEED_3" ], 3);
	}
}

class Explosion extends Sequence {
	constructor(stage: PIXI.Container, x: number, y: number) {
		super(stage, x, y, [ "BLACK_CIRCLE_SMALL", "BLACK_CIRCLE", "EXPLOSION" ], 3);
	}
}

class Sphere extends Sequence {
	constructor(stage: PIXI.Container, x: number, y: number) {
		super(stage, x, y, [ "SPHERE_1", "SPHERE_2", "SPHERE_3",
								  "SPHERE_4", "SPHERE_5", "SPHERE_6" ],
								 4, 114);
	}
}

class ShadowBall extends Static {
	private speed: number;

	constructor(stage: PIXI.Container, x: number, y: number, speed: number) {
		super(stage, x, y, "SHADOW_BALL", 34);
		this.speed = speed;
	}

	_update() {
		super._update();
		this.x -= 2 * -this.speed;
		this.y += 1 * -this.speed;
		this.sprites[0].x = Math.floor(this.x);
		this.sprites[0].y = Math.floor(this.y - 16 * Math.sin(this.timer * 2.0 * Math.PI / 20.0));
	}
}

class IceWall extends Particle {
	protected duration: number;

	constructor(stage: PIXI.Container, x: number, y: number, duration: number) {
		super(stage, x, y);
		this.duration = duration;
		for (let i = 0; i < 2; i++) this.addSprite(x + 16 * (i + 1), y);
		for (let i = 0; i < 3; i++) this.addSprite(x + 16 * i + 8, y + 8);
		for (let i = 0; i < 4; i++) this.addSprite(x + 16 * i, y + 16);
		for (let i = 0; i < 3; i++) this.addSprite(x + 16 * i + 8, y + 24);
	
		const starts = [ 0, 2, 5, 9 ];
		const lens   = [ 2, 3, 4, 3 ];
		for (const s of this.sprites) {
			s.y -= 8 * 4;
			s.texture = attackTex.ICE_4;
			s.anchor.set(0.5);
		}
		for (let i = 0; i < lens[3]; i++) {
			this.sprites[starts[3] + i].texture = attackTex.ICE_4_TOP;
			this.sprites[starts[3] + i].anchor.set(0.5, 1);
		}
	}

	_update() {
		if (this.timer >= this.duration) {
			this.die();
			return;
		}
		if (this.timer % 4 === 0) {
			this.flicker();
		}
	}
}

class RisingIceWall extends Particle {
	protected riseTime: number;
	protected flickerTime: number;
	protected wait: boolean = false;

	constructor(stage: PIXI.Container, x: number, y: number, riseTime: number, flickerTime: number) {
		super(stage, x, y);
		for (let i = 0; i < 2; i++) this.addSprite(x + 16 * (i + 1), y);
		for (let i = 0; i < 3; i++) this.addSprite(x + 16 * i + 8, y + 8);
		for (let i = 0; i < 4; i++) this.addSprite(x + 16 * i, y + 16);
		for (let i = 0; i < 3; i++) this.addSprite(x + 16 * i + 8, y + 24);
		this.riseTime = riseTime;
		this.flickerTime = flickerTime;
		if (this.riseTime === 0) {
			const starts = [ 0, 2, 5, 9 ];
			const lens   = [ 2, 3, 4, 3 ];
			for (const s of this.sprites) {
				s.y -= 8 * 4;
				s.texture = attackTex.ICE_4;
				s.anchor.set(0.5);
			}
			for (let i = 0; i < lens[3]; i++) {
				this.sprites[starts[3] + i].texture = attackTex.ICE_4_TOP;
				this.sprites[starts[3] + i].anchor.set(0.5, 1);
			}
		}
	}

	_update() {
		if (this.timer < this.riseTime) {
			const starts = [ 0, 2, 5, 9 ];
			const lens   = [ 2, 3, 4, 3 ];
			const step = Math.floor(this.timer / this.riseTime * 4);
			if (this.timer % Math.floor(this.riseTime / 4) === 0) {
				for (const s of this.sprites) s.y -= 8;
				if (step > 0) {
				  for (let i = 0; i < lens[step - 1]; i++) {
						this.sprites[starts[step - 1] + i].texture = attackTex.ICE_4;
						this.sprites[starts[step - 1] + i].anchor.set(0.5);
					}
				}
				for (let i = 0; i < lens[step]; i++) {
					this.sprites[starts[step] + i].texture = attackTex.ICE_4_TOP;
					this.sprites[starts[step] + i].anchor.set(0.5, 1);
				}
			}
		} else {
			if (this.timer >= this.riseTime + this.flickerTime) {
				this.die();
				return;
			}
			if (Math.floor((this.timer - this.riseTime) / this.flickerTime * 4) % 2 === 0) {
				if (!this.wait) {
					this.flicker();
					this.wait = true;
				}
			}
			else {
				this.wait = false;
			}
		}
	}
}

export {
	Particle, Slash, Open, attackTex, Static,
	VineWhip, Growl, Note, Z, Ring, Bird,
	Paralysis, Bomb, PoisonBubble,
	Speed, ShadowBall, Sword, IceWall,
	RisingIceWall,
	Explosion, Sequence, Sphere, Twinkle,
	Fly, Disable
};