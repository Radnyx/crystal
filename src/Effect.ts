import * as Particle from './Particle';
import { Events, Event, DeepEvent, EventState } from "./Event";
import View from './View';
import * as Graphics from './Graphics';
import * as PIXI from "pixi.js-legacy";
import { lerp } from "./MathUtil";

const TACKLE_DUR = 6;

const ATTACK_OPP_X = 160-32;
const ATTACK_OPP_Y = 32;

const ATTACK_PLY_X = 36;
const ATTACK_PLY_Y = 72;

interface Effect {
	ply?: (view: View) => Event;
	opp?: (view: View) => Event;
}

/*
const effects = {
	RAGE: {
		onSubmit: m => Do(() => m.raging = true),
		onTurnEnd: (m, pre) =>
			Do().If(() => m.hp < pre.hp && m.hp > 0,
				Do(() => m.rage += 1)
			 		.Text([`${enemy(m)}${m.name}'s`, "RAGE is building!"]))
	},

	"GIGA DRAIN": {
		onSubmit: (m, dmg) => {
			const o = other(m);
		  return Do()
				.DealDamage(m, -(dmg / 2))
				.Text(["Sucked health from", `${enemy(o)}${o.name}!`]);
		}
	},
};
*/


/*
 Move animations, defined as:

   MOVE_NAME: { ply, opp }
    where ply is a function returning the particle events coming from the player,
    and opp is from the opponent.
*/
const metronome = (x: number, y: number) => (view: View) => {
	const DURATION = 120;
	const PERIOD = DURATION / 3;
	const evt: DeepEvent = [];
	const f = (t: number) => Math.cos(t * 3 * 2 * Math.PI) * 8;
	const g = (t: number) => Math.sin(t * 3 * 2 * Math.PI) * 2;
	evt.push(
		view.particleV1(stage => new Particle.Static(stage, x, y + 8, "HAND", DURATION)
				.offsetX(f)
				.offsetY(g)
				.priority())
	)
	//const f = t => - 8 * 2 / 60 * Math.PI * Math.sin(2 * Math.PI * t / 60);
	for (let i = 0; i < 5; i++) {
		evt.push([
			view.particleV1(stage => new Particle.Sequence(stage, x, y, ["SPARKLE_2", "SPARKLE_1"], 15, DURATION)
				.offsetX(f)
				.transformY(24 / DURATION)),
			Events.wait(PERIOD / 5),
		])
	}
	evt.push(Events.wait(DURATION - PERIOD))
	return Events.flatten(evt);
}

const notes = (x: number, y: number, dx: number, dy: number) => (view: View) => {
	let evt: DeepEvent = [];
	for (let i = 0; i < 20; i++) {
		evt.push([
			view.particle("Note", x, y, dx, dy),
			Events.wait(8)
		]);
	}
	return Events.flatten(evt);
};

const rings = (x: number, y: number, dx: number, dy: number, skip:number=6) => (view: View) => {
	let evt: DeepEvent = [];
	for (let i = 0; i < 10; i++) {
		evt.push([
			view.particle("Ring", x, y, dx, dy),
			Events.wait(skip)
		])
	}
	evt.push(Events.wait(18));
	return Events.flatten(evt);
}

const psnBubbles = (x: number, y: number) => (view: View) => {
	const xx = [ 0, -16, 16 ]
	let evt: DeepEvent = [];
	for (let i = 0; i < 15; i++) {
		evt.push([
			view.particle("PoisonBubble", x + xx[i % 3]!, y),
			Events.wait(12)
		]);
	}
	return Events.flatten(evt);
}

const iceBeam = (wallX: number, wallY: number, x: number, y: number, dx: number, dy: number) => 
	(view: View) => 
{
	let evt = [];
	const p = (stage: PIXI.Container) => new Particle.Static(stage, x, y, "ICE_3", 19)
				.transformX((t: number) => dx).transformY((t: number) => dy);
	for (let i = 0; i < 15; i++) {
		evt.push([
			view.particleV1(p),
			Events.wait(2),
			view.particleV1(p),
			Events.wait(3)
		]);
	}
	return Events.flatten([
		view.particle("RisingIceWall", wallX, wallY, 144, 12),
		evt,
		Events.wait(100)
	]);
}

const focusEnergy = (x: number, y: number) => (view: View) => {
	const POS = [ 0, -8, 8, -16, 16, -24, 24 ];
	let evt: DeepEvent = [];
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 7; j++) {
			evt.push([
				view.particleV1(stage => new Particle.Sequence(stage, x + POS[j]!, y,
					["ENERGY_2", "ENERGY_1"], 3, 10)
					.transformY(-6)),
				Events.wait(4)
			]);
		}
	}
	evt.push(Events.wait(18))
	return Events.flatten(evt);
}

const YELLOW_TO_ORANGE_BEAM: { [tex: string]: Particle.AttackTexture } = {
	"BEAM_2_SMALL": "BEAM_1_SMALL",
	"BEAM_2": "BEAM_1",
	"BEAM_2_END": "BEAM_1_END",
	"BEAM_2_CORNER": "BEAM_1_CORNER"
};

const reflect = (x: number, y: number) => (view: View) => {
	// 8
	const pieces: [ Particle.AttackTexture, number, number, boolean?, boolean? ][][] = [
		[[ "BEAM_2_SMALL", 4, 0 ]],
		[[ "BEAM_2_END", 3, 0, true, true ]],
		[[ "BEAM_2_END", 2, 0, true, true ], [ "BEAM_2", 4, 0.125] ],
		[[ "BEAM_2_END", 1, 0, true, true ], [ "BEAM_2", 3, 0.125], [ "BEAM_2", 4, 1.125] ],
		[[ "BEAM_2_END", 0, 0, true, true ], [ "BEAM_2", 2, 0.125], [ "BEAM_2", 3, 1.125], [ "BEAM_2", 4, 2.125] ],
		[[ "BEAM_2_CORNER", 0, 0, true, true ], [ "BEAM_2", 1, 0], [ "BEAM_2", 2, 1], [ "BEAM_2", 3, 2], [ "BEAM_2", 4, 3]  ],
		[[ "BEAM_2", 0, 0 ], [ "BEAM_2", 1, 1], [ "BEAM_2", 2, 2], [ "BEAM_2", 3, 3], [ "BEAM_2", 4, 4]  ],
		[[ "BEAM_2", 0, 1 ], [ "BEAM_2", 1, 2], [ "BEAM_2", 2, 3], [ "BEAM_2", 3, 4], [ "BEAM_2_CORNER", 4, 5] ],
		[[ "BEAM_2", 0, 2 ], [ "BEAM_2", 1, 3], [ "BEAM_2", 2, 4],  [ "BEAM_2_END", 3, 5.125] ],
		[[ "BEAM_2", 0, 3 ], [ "BEAM_2", 1, 4], [ "BEAM_2_END", 2, 5.125] ],
		[[ "BEAM_2", 0, 4 ], [ "BEAM_2_END", 1, 5.125] ],
		[[ "BEAM_2_END", 0, 5.125] ],
		[[ "BEAM_2_SMALL", 0, 6.125, true, true]],
	];
	const evt: DeepEvent = [];
	const lifespan = 2;
	for (let i = 0; i < pieces.length; i++) {
		const ps = pieces[i];
		ps.forEach(([ tex, ox, oy, flipX, flipY ]) => {
			const createParticle = (stage: PIXI.Container) => {
				let particle = new Particle.Static(stage, x + ox * 8, y + oy * 8, i % 2 === 0 ? tex : YELLOW_TO_ORANGE_BEAM[tex], lifespan)
					.delayStart(i * lifespan).setXAnchor(0).setYAnchor(0);
				if (flipX) {
					particle = particle.flipHorizontally().setXAnchor(1);
				}
				if (flipY) {
					particle = particle.flipVertically().setYAnchor(1);
				}
				return particle;
			}
			evt.push(view.particleV1(createParticle));
		})
	}
	return Events.flatten(evt);
};

const moonlight = (x: number, y: number, length: number) => (view: View) => {
	let evt: DeepEvent = [];
	for (let i = 0; i < length; i++) {
		evt.push(view.particle("Sequence", x + i * 8, y + i * 8, [ "BEAM_1", "BEAM_2" ], 4, 72));
	}
	evt.push(view.particle("Sequence", 
		x + 8 * length + 4, y + 8 * length - 3, [ "BEAM_1_END", "BEAM_2_END" ], 4, 72));
	return Events.flatten(evt);
}

const dynamicPunch = (x: number, y: number) => (view: View) => {
	return Events.flatten([
		view.particle("Static", x, y, "PUNCH", 4),
		Events.wait(4),
		view.particle("Static", x + 8, y, "PUNCH", 4),
		Events.wait(3),
		view.particle("Static", x, y, "BOOM_MED", 7),
		Events.wait(1),
		view.particle("Static", x, y, "PUNCH", 4),
		Events.wait(4),
		view.particle("Static", x + 8, y, "PUNCH", 4),
		view.invertColors(),
		Events.wait(4),
		view.particle("Static", x, y, "PUNCH", 4),
		view.particle("Explosion", x + 16, y - 20),
		Events.wait(3),
		view.particle("Static", x + 8, y, "BOOM_MED", 7),
		Events.wait(1),
		view.particle("Static", x + 8, y, "PUNCH", 4),
		view.invertColors(),
		Events.wait(2),
		view.particle("Explosion", x - 16, y + 20),
		Events.wait(7),
		view.particle("Explosion", x + 16, y + 20),
		Events.wait(4),
		view.invertColors(),
		Events.wait(3),
		view.particle("Explosion", x - 16, y - 20),
		Events.wait(4),
		view.invertColors(),
		Events.wait(3),
		view.particle("Explosion", x, y),
		Events.wait(4),
		view.invertColors(),
		Events.wait(4),
		view.invertColors(),
		Events.wait(1)
	]);
}


const scratch = (x: number, y: number) => (view: View) => Events.flatten([
	view.saveParticle("Slash", x, y),
	view.particle("Slash", x + 4, y + 4),
	view.particle("Slash", x + 8, y + 8),
	View.waitForParticle()
]);

const rage = (x: number, y: number, isPlayer: boolean) => (view: View) => Events.flatten([
	view.shader(isPlayer, "rage", 45, 2),
	view.particle("Static", x, y, "BOOM_BIG", 6),
	Events.wait(6),
	view.particle("Static", x + 16, y - 12, "BOOM_BIG", 6),
	Events.wait(6),
	view.particle("Static", x + 32, y - 24, "BOOM_BIG", 6),
	Events.wait(32)
]);

const sleepAnim = (isPlayer: boolean, sfx: boolean) => (view: View) => {
	const [x, y, dx] = isPlayer
		? [54, 68, -1]
		: [108, 32, 1];
	return Events.flatten([
		sfx ? view.sfx("sleeping", false, isPlayer ? -0.5 : 0.5) : undefined,
		view.particle("Z", x, y, dx),
		Events.wait(48),
		view.particle("Z", x, y, dx),
		Events.wait(48),
		view.particle("Z", x, y, dx),
		Events.wait(96)
	]);
}

const WIGGLE = {
	ply: (view: View) => ({
		done: (t: number) => {
			const offset = Math.round(Math.sin(Math.PI * t / (40.0 / 15.0)) * 1.5);
			view.getOpponentSprite().x = Graphics.OPPONENT_SPRITE_X + offset;
			view.getOpponentStatsStage().x = Graphics.OPPONENT_STATS_X + offset;
			return t >= 40;
		}
	}),
	opp: (view: View) => view.screenWiggle()
};

const crunch = (x: number, y: number) => (view: View) => Events.flatten([
	view.invertColors(),
	view.particleV1(stage => 
		new Particle.Static(stage, x + 8, y - 8, "BOOM_BIG", 8)
		.delayStart(8)),
	view.particleV1(stage => 
		new Particle.Static(stage, x - 8, y + 8, "BOOM_BIG", 8)
		.delayStart(22)),
	view.particleV1(stage =>
		new Particle.Static(stage, x, y - 48, "CRUNCH_1", 30)
		.transformY((t: number) => {
			const SPEED = 5.0;
			if (t < 0.25) return SPEED;
			if (t < 0.25 + 0.125) return 0;
			if (t < 0.25 + 0.125 + 0.25) return -SPEED;
			if (t < 1 - 0.125) return SPEED;
			return 0;
		})),
	view.particleV1(stage =>
		new Particle.Static(stage, x, y + 32, "CRUNCH_2", 30)
		.transformY((t: number) => {
			const SPEED = -3.0;
			if (t < 0.25) return SPEED;
			if (t < 0.25 + 0.125) return 0;
			if (t < 0.25 + 0.125 + 0.25) return -SPEED;
			if (t < 1 - 0.125) return SPEED;
			return 0;
		})),
	view.screenShake(30, 3, 1, false),
	view.invertColors()
])

const jumpKick = (x: number, y: number) => (view: View) => {
	return Events.flatten([
		view.particleV1(stage => new Particle.Static(stage, x - 6 + 2 * 16, y - 6 - 16,
			"FOOT", 24)
			.transformX(t => -2).transformY(t => 1)),
		view.particleV1(stage => new Particle.Static(stage, x + 6 + 2 * 16, y + 6 - 16,
			"FOOT", 20)
			.transformX(t => -2).transformY(t => 1)),
		Events.wait(20),
		view.particle("Static", x, y, "BOOM_MED", 8),
		Events.wait(8)
	]);
}

const growl = (isPlayer: boolean, times = 3) => (view: View) => {
	const [x,y,dir] = isPlayer 
		? [ATTACK_PLY_X + 16, ATTACK_PLY_Y, 1]
		: [108, 40, -1];
	const evt: DeepEvent[] = [];
	for (let i = 0; i < times; i++) {
		evt.push([
			view.particle("Growl", x, y, dir),
			Events.wait(16),
		]);
	}
	return Events.flatten(evt);
}

const slideOut = (speed: number, isPlayer: boolean) => (view: View) => {
	return (isPlayer ? {
		done: _ => {
			view.getPlayerSprite().x -= speed;
			return view.getPlayerSprite().x + view.getPlayerSprite().width < 0;
		}
	} : {
		done: _ => {
			view.getOpponentSprite().x += speed;
			return view.getOpponentSprite().x >= Graphics.GAMEBOY_WIDTH;
		}
	}) as Event;
} 

const flamethrower = (x1: number, y1: number, x2: number, y2: number) => (view: View) => {
	const DURATION = 230;
	const e: Event[] = [];
	for (let i = 0; i < 8; i++) {
		const l = lerp(i / 8);
		const d = l(2, 8);
		e.push(view.particleV1(stage =>
			new Particle.Sequence(stage, l(x1, x2), l(y1, y2), 
				[ "FIRE_BIG_1", "FIRE_BIG_2" ], 8, DURATION - i * 2)
				.offsetX(t => Math.cos(2 * Math.PI * t * 3) * d)
				.offsetY(t => Math.sin(2 * Math.PI * t * 3) * d)
				.priority(-i)))
		e.push(Events.wait(i * 2));
	}
	e.push(Events.wait(DURATION));
	return Events.flatten(e);
};

const disable = (x: number, y: number) => (view: View) => {
	return Events.flatten([
		view.particle("Paralysis", x - 32, y - 20, 1),
		view.particle("Paralysis", x + 20, y - 20, -1),
		view.particle("Disable", x - 6, y - 20),
		Events.wait(120)
	]);
};

const encore = (x: number, y: number) => (view: View) => {
	return Events.flatten([
		view.particleV1(stage =>
			new Particle.Static(stage, x, y, "CLAP", 66)
				.offsetX(t => 16 * -Math.abs(Math.cos(2 * Math.PI * t)))),
		view.particleV1(stage =>
			new Particle.Static(stage, x, y, "CLAP", 66)
				.offsetX(t => 16 * Math.abs(Math.cos(2 * Math.PI * t)))
				.flipHorizontally()),
		Events.wait(16),
		view.particleV1(stage =>
			new Particle.Static(stage, x, y - 8, "STAR", 16)
				.offsetX(t => -8 * t)
				.offsetY(t => -16 * t)),
		Events.wait(17),
		Events.wait(16),
		view.particleV1(stage =>
			new Particle.Static(stage, x, y - 8, "STAR", 16)
				.offsetX(t => 8 * t)
				.offsetY(t => -16 * t)),
		Events.wait(17)
	]);
}

const earthquake = (view: View) => Events.flatten([
	view.screenShake(120, 5, 4, false),
	Events.wait(90)
]);

const gigaDrain = (x1: number, y1: number, x2: number, y2: number) => (view: View) => {
	const e: Event[] = [];
	for (let i = 0; i < 8; i++) {
		const deltaX = (t: number) => lerp(t)(x1, x2) - x1;
		const deltaY = (t: number) => lerp(t)(y1, y2) - y1;
		const theta = (t: number) => 2 * Math.PI * 3 * t + (2 * Math.PI * i / 8);
		const r = (t: number) => Math.sin(1 * Math.PI * t) * Graphics.GAMEBOY_WIDTH / 2;
		e.push(view.particleV1(stage => new Particle.Static(stage, x1, y1, "BUBBLE_1", 60 * 3)
			.offsetX(t => deltaX(t) + Math.cos(theta(t)) * r(t))
			.offsetY(t => deltaY(t) + Math.sin(theta(t)) * r(t))));
	}
	return Events.flatten(e);
};

const burned = (x: number, y: number, dir: number = 1) => (view: View) => {
	const seq: Particle.AttackTexture[] = ["FIRE_SMALL_1","FIRE_SMALL_2", "FIRE_BIG_1","FIRE_BIG_2"];
	const e: Event[] = [];
	for (let i = 0; i < 4; i++) {
		const theta = (t: number) => Math.PI + Math.PI * 2 * t / 3;
		e.push(view.particleV1(stage => new Particle.Sequence(stage, x, y, seq, i * 2, 20)
			.offsetX(t => Math.cos(theta(t)) * 16 * dir)
			.offsetY(t => -Math.sin(theta(t)) * 24)));
		e.push(Events.wait(5));
	}
	e.push(Events.wait(30));
	return Events.flatten(e);
};

const longTwinkle = (x: number, y: number) => (view: View) => Events.flatten([
	view.particle("Twinkle", x - 16, y - 16),
	Events.wait(6),
	view.particle("Twinkle", x - 16, y + 16),
	Events.wait(6),
	view.particle("Twinkle", x + 16, y + 16),
	Events.wait(6),
	view.particle("Twinkle", x + 16, y - 16),
	Events.wait(6),
	view.particle("Twinkle", x, y),
	Events.wait(6),
	view.particle("Twinkle", x - 16, y - 16),
	Events.wait(6),
	view.particle("Twinkle", x - 16, y + 16),
	Events.wait(6),
	view.particle("Twinkle", x + 16, y + 16),
	Events.wait(6),
	view.particle("Twinkle", x + 16, y - 16),
	Events.wait(6),
	view.particle("Twinkle", x, y),
	Events.wait(30)
]);

const fireBlast = (x1: number, y1: number, x2: number, y2: number) => (view: View) => {
	const e: Event[] = [];
	const lifespan1 = 40 + 8; 
	const lifespan2 = 135;
	const lifespan3 = 4 * 8;
	const count1 = 11;
	const count2 = 9;
	for (let i = 0; i < count1; i++) {
		const deltaX = (t: number) => lerp(t)(x1, x2) - x1;
		const deltaY = (t: number) => lerp(t)(y1, y2) - y1;
		e.push(view.particleV1(stage => new Particle.Sequence(stage, x1, y1, [ "FIRE_BIG_1", "FIRE_BIG_2" ], 3 + (i % 2 == 0 ? 1 : 0), lifespan1)
		.offsetX(t => deltaX(t))
		.offsetY(t => deltaY(t))
		.delayStart(i * 8)));
	}
	e.push(Events.wait(lifespan1));
	let totalDelay = 0;
	for (let i = 0; i < count2; i++) {
		const theta = (t: number) => 4 * Math.PI * t;
		const td = totalDelay;
		e.push(view.particleV1(stage => new Particle.Sequence(stage, x2, y2, [ "FIRE_SMALL_1", "FIRE_SMALL_2" ], 3 + (i % 2 == 0 ? 1 : 0), 135)
		.offsetX(t => Math.cos(theta(t)) * 16)
		.offsetY(t => Math.sin(theta(t)) * 16)
		.delayStart(td)));
		totalDelay += (i % 2 === 0) ? 7 : 8;
	}
	e.push(Events.wait(lifespan2));
	e.push(view.clearParticles());
	
	const dirs: [number,number][] = [ 
		[0, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]
	];
	const lastFlame = (dir: [number, number], delay: number = 0) => view.particleV1(stage => new Particle.Sequence(stage, x2, y2, [
			"FIRE_SMALL_1", "FIRE_SMALL_2",
			"FIRE_BIG_1", "FIRE_BIG_2",
			"FIRE_BIG_1", "FIRE_BIG_2",
			"FIRE_BIG_1", "FIRE_BIG_2"
		], 4, lifespan3)
		.offsetX(t => t * dir[0] * 32)
		.offsetY(t => t * dir[1] * 32)
		.delayStart(delay));
	for (const dir of dirs) {
		e.push(lastFlame(dir));
		e.push(lastFlame(dir, 16));
	}
	e.push(Events.wait(lifespan3 + 120));
	return Events.flatten(e);
}

function sinkPly(view: View, times: number = 1, duration: number = 30): Event {
	return {
		done: t => {
			view.getPlayerSprite().y = Graphics.PLAYER_SPRITE_Y + 16 - 16 * Math.cos(2 * Math.PI * (t / duration));
			return t >= duration * times;
		}
	};
}

function sinkOpp(view: View, times: number = 1, duration: number = 30): Event {
	return {
		init: state => {
			state.object = view.getOpponentSprite().texture;
		},
		done: (t, state) => {
			const tex = state.object as PIXI.Texture;
			const offset = 16 - 16 * Math.cos(2 * Math.PI * (t / duration));
			view.getOpponentSprite().texture = new PIXI.Texture(tex.baseTexture, 
				new PIXI.Rectangle(0, 0, Graphics.OPPONENT_SPRITE_WIDTH, Graphics.OPPONENT_SPRITE_HEIGHT - offset));
			view.getOpponentSprite().y = Graphics.OPPONENT_SPRITE_Y + offset;
			return t >= duration * times;
		}
	};
}

function tacklePly(view: View, tex: Particle.AttackTexture = "BOOM_BIG"): Event {
	return Events.flatten([
		{
			done: t => {
				view.getPlayerSprite().x = (1 - t / TACKLE_DUR) * Graphics.PLAYER_SPRITE_X + 
					(t / TACKLE_DUR) * ( Graphics.PLAYER_SPRITE_X + 12);
				return t >= TACKLE_DUR;
			}
		},
		view.particle("Static", ATTACK_OPP_X, ATTACK_OPP_Y, tex, 12),
		{ 
			done: t => {
				view.getPlayerSprite().x = (t / TACKLE_DUR) *  Graphics.PLAYER_SPRITE_X + 
					(1 - t / TACKLE_DUR) * ( Graphics.PLAYER_SPRITE_X + 12);
				return t >= TACKLE_DUR;
			}
		}
	]);
}

function tackleOpp(view: View, tex: Particle.AttackTexture = "BOOM_BIG"): Event {
	return Events.flatten([
		{ 
			done: t => {
				view.getOpponentSprite().x = (1 - t / TACKLE_DUR) * Graphics.OPPONENT_SPRITE_X
															+ (t / TACKLE_DUR) * (Graphics.OPPONENT_SPRITE_X - 12);
				return t >= TACKLE_DUR;
			}
		},
		view.particle("Static", ATTACK_PLY_X, ATTACK_PLY_Y, tex, 12),
		{ 
			done: t => {
				view.getOpponentSprite().x = (t / TACKLE_DUR) * Graphics.OPPONENT_SPRITE_X
														+ (1 - t / TACKLE_DUR) * (Graphics.OPPONENT_SPRITE_X - 12);
				return t >= TACKLE_DUR;
			}
		}
	])
}

function thunderbolt(x: number, y: number): (view: View) => Event {
	const THUNDER_FLICKER_1 = 2;
	const THUNDER_FLICKER_2 = 8;
	return view => Events.flatten([
		view.particleV1(stage =>
			new Particle.Static(stage, x, y, "BLACK_CIRCLE", 150).setFlicker(3)),

		// DIAGONALS
		
		view.particleV1(stage =>
			new Particle.Static(stage, x - 16, y - 16, "SMALL_THUNDER_3", 125).setFlicker(THUNDER_FLICKER_1).delayStart(25)),
		view.particleV1(stage =>
			new Particle.Static(stage, x - 24, y - 24, "SMALL_THUNDER_3", 125).setFlicker(THUNDER_FLICKER_2).delayStart(25)),

		view.particleV1(stage =>
			new Particle.Static(stage, x + 16, y - 16, "SMALL_THUNDER_3", 125).setFlicker(THUNDER_FLICKER_1).delayStart(25).flipHorizontally()),
		view.particleV1(stage =>
			new Particle.Static(stage, x + 24, y - 24, "SMALL_THUNDER_3", 125).setFlicker(THUNDER_FLICKER_2).delayStart(25).flipHorizontally()),

		view.particleV1(stage =>
			new Particle.Static(stage, x - 16, y + 16, "SMALL_THUNDER_3", 125).setFlicker(THUNDER_FLICKER_1).delayStart(25).flipVertically()),
		view.particleV1(stage =>
			new Particle.Static(stage, x - 24, y + 24, "SMALL_THUNDER_3", 125).setFlicker(THUNDER_FLICKER_2).delayStart(25).flipVertically()),

		view.particleV1(stage =>
			new Particle.Static(stage, x + 16, y + 16, "SMALL_THUNDER_3", 125).setFlicker(THUNDER_FLICKER_1).delayStart(25).flipHorizontally().flipVertically()),
		view.particleV1(stage =>
			new Particle.Static(stage, x + 24, y + 24, "SMALL_THUNDER_3", 125).setFlicker(THUNDER_FLICKER_2).delayStart(25).flipHorizontally().flipVertically()),

		// VERTICALS

		view.particleV1(stage =>
			new Particle.Static(stage, x, y - 20, "SMALL_THUNDER_1", 125 - THUNDER_FLICKER_1).setFlicker(THUNDER_FLICKER_1).delayStart(25 + THUNDER_FLICKER_1)),
		view.particleV1(stage =>
			new Particle.Static(stage, x, y - 28, "SMALL_THUNDER_1", 125 - THUNDER_FLICKER_2).setFlicker(THUNDER_FLICKER_2).delayStart(25 + THUNDER_FLICKER_2)),

		view.particleV1(stage =>
			new Particle.Static(stage, x, y + 20, "SMALL_THUNDER_1", 125 - THUNDER_FLICKER_1).setFlicker(THUNDER_FLICKER_1).delayStart(25 + THUNDER_FLICKER_1).flipVertically()),
		view.particleV1(stage =>
			new Particle.Static(stage, x, y + 28, "SMALL_THUNDER_1", 125 - THUNDER_FLICKER_2).setFlicker(THUNDER_FLICKER_2).delayStart(25 + THUNDER_FLICKER_2).flipVertically()),

		// HORIZONTALS

		view.particleV1(stage =>
			new Particle.Static(stage, x + 20, y, "SMALL_THUNDER_2", 125 - THUNDER_FLICKER_1).setFlicker(THUNDER_FLICKER_1).delayStart(25 + THUNDER_FLICKER_1)),
		view.particleV1(stage =>
			new Particle.Static(stage, x + 28, y, "SMALL_THUNDER_2", 125 - THUNDER_FLICKER_2).setFlicker(THUNDER_FLICKER_2).delayStart(25 + THUNDER_FLICKER_2)),

		view.particleV1(stage =>
			new Particle.Static(stage, x - 20, y, "SMALL_THUNDER_2", 125 - THUNDER_FLICKER_1).setFlicker(THUNDER_FLICKER_1).delayStart(25 + THUNDER_FLICKER_1).flipHorizontally().flipVertically()),
		view.particleV1(stage =>
			new Particle.Static(stage, x - 28, y, "SMALL_THUNDER_2", 125 - THUNDER_FLICKER_2).setFlicker(THUNDER_FLICKER_2).delayStart(25 + THUNDER_FLICKER_2).flipHorizontally().flipVertically()),

		Events.wait(150 + 24)
	]);
}

function thunder(x: number, y: number): (view: View) => Event {
	const STRIKE = 12;
	const LIFE = 42;
	const area = (w: number) => (t: number) =>
		new PIXI.Rectangle(0, 0, w, t < STRIKE / LIFE ? (Math.floor((t * LIFE /  STRIKE) * 56 / 8) * 8) : 56);
	return view => Events.flatten([
		view.particleV1(stage => new Particle.Static(stage, x + 14, y, "THUNDER_SIDE", LIFE).subArea(area(24)).unanchorY().delayStart(15)),
		view.particleV1(stage => new Particle.Static(stage, x - 14, y, "THUNDER_SIDE", LIFE).subArea(area(24)).unanchorY().flipHorizontally()),
		view.particleV1(stage => new Particle.Static(stage, x, y, "THUNDER_MID", LIFE).subArea(area(16)).unanchorY().delayStart(30)),
		view.invertColors(),
		Events.wait(8),
		view.invertColors(),
		Events.wait(8),
		view.invertColors(),
		Events.wait(8),
		view.invertColors(),
		Events.wait(8),
		view.invertColors(),
		Events.wait(8),
		view.invertColors(),
		Events.wait(8),
		view.invertColors(),
		Events.wait(8),
		view.invertColors(),
		Events.wait(8),
		view.invertColors(),
		Events.wait(8),
		view.invertColors(),
		Events.wait(8),
		view.invertColors(),
		Events.wait(8),
		view.invertColors(),
		Events.wait(8),
		Events.wait(120-96)
	]);
}

const swift = (x: number, y: number, delay: number, dir: number = 1, texture: Particle.AttackTexture = "STAR", spread: number = 0, xDist: number = 40) => (view: View) => {
	const speed = 2;
	const initialLife = xDist / speed;
	const loopLife = 30;
	const loopXRad = 24;
	const loopYRad = 8;
	function yPos(t: number) {
		return  t * (xDist * speed / 2 * -dir + spread);
	}
	return Events.flatten([
		view.particleV1(stage => new Particle.Static(stage, x, y, texture, initialLife).delayStart(delay)
			.offsetX(t => t * xDist * speed * dir).offsetY(yPos)),
		view.particleV1(stage => new Particle.Static(stage, x + xDist * speed * dir, y + yPos(1), texture, loopLife).delayStart(delay + initialLife)
			.offsetX(t => -loopXRad + Math.cos(2 * Math.PI * t) * loopXRad).offsetY(t => dir * -Math.sin(2 * Math.PI * t) * loopYRad)),
		view.particleV1(stage => new Particle.Static(stage, x + xDist * speed * dir, y + yPos(1), texture, loopLife).delayStart(delay + initialLife + loopLife)
			.offsetX(t => t * xDist * speed * dir).offsetY(yPos))
	]);
};

const mudslap = (x: number, y: number, dir: number = 1) => (view: View) => {
	const evt: DeepEvent[] = [];
	const dist = 120-54;
	const particle = (index: number, delay: number) => (stage: PIXI.Container) => {
		const p = new Particle.Static(stage, x, y, "DIRT_SHADOW", 12).delayStart(delay)
			.offsetX(t => dir * dist * t).offsetY(t =>- dir * t * (24 + index * 12));
		return dir === -1 ? p.flipHorizontally() : p;
	};
	for (let i = 0; i < 8; i++) {
		for (let j = 0; j < 4; j++) {
			evt.push(view.particleV1(particle(j, 4 * i)));
		}
	}
	evt.push(Events.wait(60));
	return Events.flatten(evt);
}

const amnesia = (x: number, y: number, dir: number = 1) => (view: View) => {
	const lifespan = 100;
	return Events.flatten([
		view.particle("Static", x, y, "AMNESIA_1", lifespan),
		Events.wait(20),
		view.particle("Static", x + 4 * dir, y - 8, "AMNESIA_2", lifespan - 20),
		Events.wait(20),
		view.particle("Static", x + 8 * dir, y - 8 - 12, "AMNESIA_3", lifespan - 40),
		Events.wait(lifespan - 40),
	]);
};

const sunnyDay = (view: View) => {
	const evt: DeepEvent[] = [];
	const lifespan = 16;
	evt.push(view.brighten());
	for (let i = 0; i < 100; i++) {
		const x = Math.random() * (Graphics.GAMEBOY_WIDTH * 1.5) - Graphics.GAMEBOY_WIDTH * 0.5;
		evt.push(view.particleV1(stage => new Particle.Static(stage, x, 0, "SHINE_LIGHT", lifespan)
			.offsetX(t => t * 96).offsetY(t => t * 96)));
		if (i % 4 === 0) {
			evt.push(Events.wait(3));
		}
	}
	evt.push(Events.wait(lifespan));
	evt.push(view.resetMatrixFilter());
	return Events.flatten(evt);
};

const solarBeamCharge = (x: number, y: number) => (view: View) => {
	const r = 40;
	const sq2_2 = r * 0.70710678;
	const charge1 = (dx: number, dy: number) => {
		return view.particleV1(stage => new Particle.Sequence(stage, x + dx, y + dy, [ "SOLAR_BEAM_1", "SOLAR_BEAM_2", "SOLAR_BEAM_3",  "SOLAR_BEAM_3"  ], 28, 80)
			.offsetX(t => t * -dx).offsetY(t => t * -dy));
	}
	return Events.flatten([
		charge1(-r, 0),
		charge1(r, 0),
		charge1(0, -r),
		charge1(0, r),
		charge1(0 - sq2_2, 0 - sq2_2),
		charge1(0 - sq2_2, 0 + sq2_2),
		charge1(0 + sq2_2, 0 - sq2_2),
		charge1(0 + sq2_2, 0 + sq2_2),
		Events.wait(28),
		view.particleV1(stage => new Particle.Sequence(stage, x, y, [ "SOLAR_BEAM_4", "SOLAR_BEAM_5", "SOLAR_BEAM_6" ], 33, 99)),
		Events.wait(70),
		() => view.getStage().visible = false,
		Events.wait(4),
		() => view.getStage().visible = true,
		Events.wait(25),
		view.particleV1(stage => new Particle.Static(stage, x, y, "SOLAR_BEAM_6", 33).setFlicker(4)),
		Events.wait(40)
	]);
};

const solarBeam = (x: number, y: number, dir: number = 1) => (view: View) => {
	// 54 80
	const delay = 4;
	const lifespan = 80;
	const length = 8;
	const evt: DeepEvent[] = [];
	const laser12: Particle.AttackTexture[] = [ "LASER_1", "LASER_2" ];
	const laser21: Particle.AttackTexture[] = [ "LASER_2", "LASER_1" ];
	for (let i = 0; i < length; i++) {
		evt.push(view.particleV1(stage => new Particle.Static(stage, x + dir * (4 + 8 * (i + 1)),  y + dir * (- 2 - 4 * (i + 1)), i % 2 === 0 ? "LASER_END_1" : "LASER_END_2", delay)
			.delayStart(delay * i).flipHorizontally(dir < 0).flipVertically(dir < 0)));
		evt.push(view.particleV1(stage => new Particle.Sequence(stage, x + dir * (8 * i), y + dir * (- 4 * i), i % 2 === 0 ? laser12 : laser21, delay, lifespan).delayStart(delay * i)));
	}
	evt.push([
		Events.wait(delay * length),
		view.particleV1(stage => new Particle.Sequence(stage, x + dir * (2 + 8 * length), y + dir * (- 4 * length), [ "LASER_SPLASH_1", "LASER_SPLASH_2" ], delay, lifespan)
			.flipHorizontally(dir < 0).flipVertically(dir < 0)),
		Events.wait(lifespan + 40)
	]);
	return Events.flatten(evt);
};

const wingAttack = (x: number, y: number) => (view: View) => {
	return Events.flatten([
		view.particle("Static", x, y, "BOOM_MED", 8),
		view.particle("Static", x + 32, y, "BOOM_MED", 8),
		Events.wait(8),
		view.particle("Static", x + 4, y, "BOOM_MED", 8),
		view.particle("Static", x + 32 - 4, y, "BOOM_MED", 8),
		Events.wait(8),
		view.particle("Static", x + 8, y, "BOOM_MED", 8),
		view.particle("Static", x + 32 - 8, y, "BOOM_MED", 8),
		Events.wait(8 + 80),
	]);
};

const firespin = (x: number, y: number, dir: number = 1, xDist: number = 40) => (view: View) => {
	const evt: DeepEvent = [];
	for (let i = 0; i < 8; i++) {
		evt.push(swift(x, y, i * 4, dir, i % 2 === 0 ? "FIRE_SMALL_1" : "FIRE_SMALL_2", Math.random() * 32 - 16, xDist)(view));
	}
	evt.push(Events.wait(160));
	return Events.flatten(evt);
}

const effects: { [attack: string]: Effect } = {

	"FIRE SPIN": {
		ply: firespin(54 + 8, 80 - 8),
		opp: firespin(112, 44, -1, 24)
	},

	"WING ATTACK": {
		ply: wingAttack(108, 40),
		opp: wingAttack(24, 80)
	},

	"SYNTHESIS": {
		ply: view => Events.flatten([
			view.shader(true, "synthesis", 80, 1),
			view.particle("Twinkle", 36, 48),
			Events.wait(6),
			view.particle("Twinkle", 16, 80),
			Events.wait(6),
			view.particle("Twinkle", 48, 88),
			Events.wait(60),
		]),
		opp: view => Events.flatten([
			view.shader(false, "synthesis", 80, 1),
			view.particle("Twinkle", 36 + 88, 48 - 40),
			Events.wait(6),
			view.particle("Twinkle", 16 + 88, 80 - 40),
			Events.wait(6),
			view.particle("Twinkle", 48 + 88, 88 - 40),
			Events.wait(60),
		])
	},

	"SOLAR BEAM": {
		ply: solarBeam(54, 76),
		opp: solarBeam(112, 40, -1)
	},

	"SOLAR BEAM_STILL": {
		ply: solarBeamCharge(40, 68),
		opp: solarBeamCharge(120, 20),
	},

	"SUNNY DAY": {
		ply: sunnyDay,
		opp: sunnyDay
	},

	"AMNESIA": {
		ply: amnesia(52, 64),
		opp: amnesia(104, 28, -1)
	},

	"SNORE_PRE": {
		ply: view => Events.flatten([
			view.particle("Z", 54, 68, -1),
			Events.wait(20),
		]),
		opp: view => Events.flatten([
			view.particle("Z", 108, 32, 1),
			Events.wait(20),
		])
	},

	"SNORE": {
		ply: view => Events.flatten([
			() => view.getFullStage().x = 2,
			growl(true, 2)(view),
			Events.wait(20),
			() => view.getFullStage().x = 0,
		]),
		opp: view => Events.flatten([
			() => view.getFullStage().x = -2,
			growl(false, 2)(view),
			Events.wait(20),
			() => view.getFullStage().x = 0,
		])
	},

	"MUD-SLAP": {
		ply: mudslap(54, 80),
		opp: mudslap(102, 36, -1)
	},

	"SWIFT": {
		ply: view => Events.flatten([
			swift(56, 72, 0)(view),
			swift(62, 56, 8)(view),
			swift(59, 63, 12)(view),
			Events.wait(30 + 20 + 20)
		]),
		opp: view => Events.flatten([
			swift(92 + 48, 28, 0, -1)(view),
			swift(104 + 32, 16, 8, -1)(view),
			swift(113 + 32, 35, 12, -1)(view),
			Events.wait(30 + 20 + 20)
		])
	},

	"THUNDER": {
		ply: thunder(122, 0),
		opp: thunder(36, 40)
	},

	"CHARM": {
		ply: view => Events.flatten([
			view.particleV1(stage => new Particle.Static(stage, 56, 64, "HEART", 36).offsetY(t => -t * 24).offsetX(t => Math.sin(2 * Math.PI * t) * 8)),
			{
				done: t => {
					view.getPlayerSprite().x = Graphics.PLAYER_SPRITE_X + Math.sin(4 * Math.PI * t / 36) * 8;
					return t >= 36;
				}
			}
		]),
		opp: view => Events.flatten([
			view.particleV1(stage => new Particle.Static(stage, 96, 32, "HEART", 36).offsetY(t => -t * 24).offsetX(t => Math.sin(2 * Math.PI * t) * 8)),
			{
				done: t => {
					view.getOpponentSprite().x = Graphics.OPPONENT_SPRITE_X + Math.sin(4 * Math.PI * t / 36) * 8;
					return t >= 36;
				}
			}
		])
	},

	"CHARM_POST": WIGGLE,

	"RETURN": {
		ply: view => Events.flatten([
			sinkPly(view, 2, 35),
			Events.wait(30),
			tacklePly(view, "BOOM_MED"),
			Events.wait(16)
		]),
		opp: view => Events.flatten([
			sinkOpp(view, 2, 35),
			Events.wait(30),
			tackleOpp(view, "BOOM_MED"),
			Events.wait(16)
		])
	},

	"BODY SLAM": {
		ply: view => Events.flatten([
			view.particleV1(stage => new Particle.Static(stage, 128, 28, "BOOM_MED", 6).delayStart(TACKLE_DUR)),
			view.particleV1(stage => new Particle.Static(stage, 128 + 8, 28, "BOOM_MED", 6).delayStart(TACKLE_DUR + 6)),
			{
				done: t => {
					view.getPlayerSprite().x = Graphics.PLAYER_SPRITE_X + lerp(t / TACKLE_DUR)(0, 12);
					return t >= TACKLE_DUR;
				}
			},
			{
				done: t => {
					view.getPlayerSprite().x = Graphics.PLAYER_SPRITE_X + lerp(t / TACKLE_DUR)(12, 0);
					return t >= TACKLE_DUR;
				}
			},
			Events.wait(24)
		]),
		opp: view => Events.flatten([
			
			view.particleV1(stage => new Particle.Static(stage, 34, 72, "BOOM_MED", 6).delayStart(TACKLE_DUR)),
			view.particleV1(stage => new Particle.Static(stage, 34 - 8, 72, "BOOM_MED", 6).delayStart(TACKLE_DUR + 6)),
			{
				done: t => {
					view.getOpponentSprite().x = Graphics.OPPONENT_SPRITE_X + lerp(t / TACKLE_DUR)(0, -12);
					return t >= TACKLE_DUR;
				}
			},
			{
				done: t => {
					view.getOpponentSprite().x = Graphics.OPPONENT_SPRITE_X + lerp(t / TACKLE_DUR)(-12, 0);
					return t >= TACKLE_DUR;
				}
			},
			Events.wait(24)
		]),
	},

	"BODY SLAM_PRE": {
		ply: view => Events.flatten([
			sinkPly(view)
		]),
		opp: view => Events.flatten([
			sinkOpp(view)
		])
	},

	"FIRE BLAST": {
		ply: fireBlast(56, 76, 126, 32),
		opp: fireBlast(108, 28, 36, 74)
	},

	"GIGA DRAIN": {
		ply: view => Events.flatten([
			gigaDrain(114, 26, 40, 68)(view),
			view.shaderBothMembers("synthesis", 60 * 3 + 30),
			longTwinkle(32, 68)(view)
		]),
		opp: view => Events.flatten([
			gigaDrain(40, 68, 114, 26)(view),
			view.shaderBothMembers("synthesis", 60 * 3 + 30),
			longTwinkle(122, 30)(view)
		])
	},

	ENCORE: {
		ply: encore(56, 64),
		opp: encore(100, 24),
	},

	DISABLE: {
		ply: disable(128, 40 + 16),
		opp: disable(40, 76 + 20)
	},

	FLICKER: {
		opp: view => ({
			done: t => {
				view.getOpponentSprite().visible = Math.floor(t / 5) % 2 === 0;
				return t >= 30;
			}
		})
	},

	"TAIL WHIP_POST": WIGGLE,

	SCRATCH: { ply: scratch(120, 24), opp: scratch(12 + 32, 40 + 24) },

	TACKLE: {
		ply: view => tacklePly(view),
		opp: view => tackleOpp(view)
	},

	"BURNED": {
		ply: burned(46, 76, -1),
		opp: burned(112, 28)
	},

	"FLAMETHROWER": {
		ply: flamethrower(56, 76, 136, 28),
		opp: flamethrower(106, 32, 28, 80),
	},

	"EARTHQUAKE": {
		ply: earthquake,
		opp: earthquake,
	},

	"RAGE": {
		ply: rage(108, 56, true),
		opp: rage(ATTACK_PLY_X - 8, ATTACK_PLY_Y + 16, false)
	},

	// 2 cycles, in 30 frames, 7 amplitude
	"TAIL WHIP": {
		opp: view => ({
			done: t => {
				view.getOpponentSprite().x = Graphics.OPPONENT_SPRITE_X
						+ Math.floor(7 * Math.sin(2 * Math.PI * t * 2 / 30))
				return t >= 30;
			}
		}),
		ply: view => ({
			done: t => {
				view.getPlayerSprite().x = Graphics.PLAYER_SPRITE_X
						+ Math.floor(7 * Math.sin(2 * Math.PI * t * 2 / 30))
				return t >= 30;
			}
		})
	},

	"VINE WHIP": {
		opp: view => Events.flatten([
			view.particle("VineWhip", 56, 76, -1, 1),
			Events.wait(6),
			view.particle("VineWhip", 56 - 16, 76 + 10, 1, -1),
			Events.wait(12)
		]),
		ply: view => Events.flatten([
			view.particle("VineWhip", ATTACK_OPP_X, ATTACK_OPP_Y, -1, 1),
			Events.wait(6),
			view.particle("VineWhip", ATTACK_OPP_X - 16, ATTACK_OPP_Y + 10, 1, -1),
			Events.wait(12)
		])
	},

	"GROWL": {
		opp: growl(false),
		ply: growl(true)
	},

	"SING": {
		opp: notes(112, 32, -2, 1),
		ply: notes(ATTACK_PLY_X + 16, ATTACK_PLY_Y, 2, -1)
	},

	"SUPERSONIC": {
		opp: rings(112, 32, -2, 1),
		ply: rings(ATTACK_PLY_X + 16, ATTACK_PLY_Y, 2, -1)
	},

	"REFLECT": {
		opp: view => Events.flatten([
			reflect(88, 0)(view),
			view.invertColors(),
			Events.wait(6),
			view.invertColors(),
			Events.wait(2 * 13 - 6),
			reflect(88, 0)(view),
			view.invertColors(),
			Events.wait(6),
			view.invertColors(),
			Events.wait(2 * 13 - 6),
		]),
		ply: view => Events.flatten([
			reflect(44, 36)(view),
			view.invertColors(),
			Events.wait(6),
			view.invertColors(),
			Events.wait(2 * 13 - 6),
			reflect(44, 36)(view),
			view.invertColors(),
			Events.wait(6),
			view.invertColors(),
			Events.wait(2 * 13 - 6),
		]),
	},

	"PSYCHIC": {
		opp: view => Events.flatten([
			() => view.addStageFilter("psychic"),
			rings(112, 32, -2, 1, 9)(view),
			Events.wait(95),
			() => view.removeStageFilter("psychic"),
			Events.wait(10),
		]),
		ply: view => Events.flatten([
			() => view.addStageFilter("psychic"),
			rings(ATTACK_PLY_X + 16, ATTACK_PLY_Y, 2, -1, 9)(view),
			Events.wait(95),
			() => view.removeStageFilter("psychic"),
			Events.wait(10),
		])
	},


	// 2.5s = 150 frames
	"THUNDERBOLT": {
		opp: thunderbolt(ATTACK_PLY_X, ATTACK_PLY_Y),
		ply: thunderbolt(ATTACK_OPP_X,  ATTACK_OPP_Y + 4),
	},

	"SLUDGE BOMB": {
		opp: view => Events.flatten([
			// TODO: darken effect?
			view.particle("Bomb", 108, 32, -2, -3, 88),
			Events.wait(12),
			psnBubbles(ATTACK_PLY_X + 4, ATTACK_PLY_Y + 20)(view),
			Events.wait(48)
		]),
		ply: view => Events.flatten([
			// TODO: darken effect?
			view.particle("Bomb", ATTACK_PLY_X + 16, ATTACK_PLY_Y, 3, -4, ATTACK_OPP_Y + 20),
			Events.wait(12),
			psnBubbles(ATTACK_OPP_X - 4, ATTACK_OPP_Y + 20)(view),
			Events.wait(48)
		]),
	},

	"SLEEP": { opp: sleepAnim(false, true), ply: sleepAnim(true, true) },

	"SLEEP TALK": { opp: sleepAnim(false, false), ply: sleepAnim(true, false) },

	"EXTREMESPEED": {
		opp: view => Events.flatten([
			view.hideOpponent(),
			view.particle("Speed", ATTACK_OPP_X - 4, ATTACK_OPP_Y),
			Events.wait(10),
			view.particle("Slash", ATTACK_PLY_X + 12, ATTACK_PLY_Y - 8, 5),
			Events.wait(24),
			view.showOpponent()
		]),
		ply: view => Events.flatten([
			view.hidePlayer(),
			view.particle("Speed", ATTACK_PLY_X - 4, ATTACK_PLY_Y),
			Events.wait(10),
			view.particle("Slash", ATTACK_OPP_X + 4, ATTACK_OPP_Y - 8, 5),
			Events.wait(24),
			view.showPlayer()
		])
	},

	"QUICK ATTACK": {
		opp: view => Events.flatten([
			view.hideOpponent(),
			view.particle("Speed", ATTACK_OPP_X - 4, ATTACK_OPP_Y),
			Events.wait(10),
			view.particle("Static", ATTACK_PLY_X, ATTACK_PLY_Y, "BOOM_MED", 6),
			Events.wait(32),
			view.showOpponent()
		]),
		ply: view => Events.flatten([
			view.hidePlayer(),
			view.particle("Speed", ATTACK_PLY_X - 4, ATTACK_PLY_Y),
			Events.wait(10),
			view.particle("Static", ATTACK_OPP_X, ATTACK_OPP_Y, "BOOM_MED", 6),
			Events.wait(32),
			view.showPlayer()
		])
	},

	"SHADOW BALL": {
		opp: view => Events.flatten([
			view.invertColors(),
			view.particle("ShadowBall", ATTACK_OPP_X - 22, ATTACK_OPP_Y, -1),
			Events.wait(34),
			view.particle("Open", ATTACK_PLY_X, ATTACK_PLY_Y),
			Events.wait(16),
			view.invertColors()
		]),

		ply: view => Events.flatten([
			view.invertColors(),
			view.particle("ShadowBall", ATTACK_PLY_X + 20, ATTACK_PLY_Y, 1),
			Events.wait(34),
			view.particle("Open", ATTACK_OPP_X, ATTACK_OPP_Y),
			Events.wait(16),
			view.invertColors()
		])
	},

	"SWORDS DANCE": {
		opp: view => Events.flatten([
			view.particle("Sword", ATTACK_OPP_X - 4, ATTACK_OPP_Y + 16, 0),
			view.particle("Sword", ATTACK_OPP_X - 4, ATTACK_OPP_Y + 16, 1),
			view.particle("Sword", ATTACK_OPP_X - 4, ATTACK_OPP_Y + 16, 2),
			view.particle("Sword", ATTACK_OPP_X - 4, ATTACK_OPP_Y + 16, 3),
			view.particle("Sword", ATTACK_OPP_X - 4, ATTACK_OPP_Y + 16, 4),
			Events.wait(34)
		]),
		ply: view => Events.flatten([
			view.particle("Sword", ATTACK_PLY_X + 4, ATTACK_PLY_Y + 16, 0),
			view.particle("Sword", ATTACK_PLY_X + 4, ATTACK_PLY_Y + 16, 1),
			view.particle("Sword", ATTACK_PLY_X + 4, ATTACK_PLY_Y + 16, 2),
			view.particle("Sword", ATTACK_PLY_X + 4, ATTACK_PLY_Y + 16, 3),
			view.particle("Sword", ATTACK_PLY_X + 4, ATTACK_PLY_Y + 16, 4),
			Events.wait(34)
		]),
	},

	"CRUNCH": { opp: crunch(ATTACK_PLY_X, ATTACK_PLY_Y), ply: crunch(ATTACK_OPP_X - 4, ATTACK_OPP_Y) },

	"ICE BEAM": {
		opp: iceBeam(12, 104, 112, 32, -4, 2),
		ply: iceBeam(ATTACK_OPP_X - 24, ATTACK_OPP_Y + 36, ATTACK_PLY_X + 16, ATTACK_PLY_Y, 4, -2)
	},

	"JUMP KICK": {
		opp: jumpKick(ATTACK_PLY_X, ATTACK_PLY_Y),
		ply: jumpKick(ATTACK_OPP_X, ATTACK_OPP_Y)
	},


	"DYNAMICPUNCH": {
		opp: dynamicPunch(ATTACK_PLY_X, ATTACK_PLY_Y),
		ply: dynamicPunch(ATTACK_OPP_X - 4, ATTACK_OPP_Y + 4)
	},

	"FOCUS ENERGY": {
		opp: focusEnergy(ATTACK_OPP_X - 4, ATTACK_OPP_Y + 24),
		ply: focusEnergy(ATTACK_PLY_X - 4, ATTACK_PLY_Y + 22)
	},

	"DEFENSE CURL": {
		opp: view => Events.flatten([
			view.particle("Sphere", ATTACK_OPP_X - 4, ATTACK_OPP_Y),
			Events.wait(114)
		]),
		ply: view => Events.flatten([
			view.particle("Sphere", ATTACK_PLY_X + 4, ATTACK_PLY_Y),
			Events.wait(114)
		])
	},

	SLASH: {
		opp: view => Events.flatten([
			view.particle("Slash", ATTACK_PLY_X + 12, ATTACK_PLY_Y - 12, 6),
			view.particle("Slash", ATTACK_PLY_X + 16, ATTACK_PLY_Y - 8, 6),
			Events.wait(24)
		]),
		ply: view => Events.flatten([
			view.particle("Slash", ATTACK_OPP_X + 12, ATTACK_OPP_Y - 12, 6),
			view.particle("Slash", ATTACK_OPP_X + 16, ATTACK_OPP_Y - 8, 6),
			Events.wait(24)
		])
	},

	MOONLIGHT: {
		opp: view => Events.flatten([
			view.invertColors(),
			moonlight(ATTACK_OPP_X - 32, ATTACK_OPP_Y - 21, 5)(view),
			Events.wait(72),
			view.particle("Twinkle", 36 + 88, 48 - 40),
			Events.wait(6),
			view.particle("Twinkle", 16 + 88, 80 - 40),
			Events.wait(6),
			view.particle("Twinkle", 48 + 88, 88 - 40),
			Events.wait(6),
			view.invertColors()
		]),
		ply: view => Events.flatten([
			view.invertColors(),
			moonlight(ATTACK_PLY_X - 32, ATTACK_PLY_Y - 21, 5)(view),
			Events.wait(72),
			view.particle("Twinkle", 36, 48),
			Events.wait(6),
			view.particle("Twinkle", 16, 80),
			Events.wait(6),
			view.particle("Twinkle", 48, 88),
			Events.wait(6),
			view.invertColors()
		])
	},


	"FLY_STILL": {
		opp: view => Events.flatten([
			view.hideOpponent(),
			view.particle("Fly",ATTACK_OPP_X,ATTACK_OPP_Y-4),
			Events.wait(70)
		]),
		ply: view => Events.flatten([
			view.hidePlayer(),
			view.particle("Fly",ATTACK_PLY_X,ATTACK_PLY_Y-4),
			Events.wait(70)
		])
	},

	"FLY": {
		opp: view => Events.flatten([
			view.particle("Static", ATTACK_PLY_X, ATTACK_PLY_Y, "BOOM_MED", 12),
			Events.wait(24),
			view.showOpponent(),
			Events.wait(90-24)
		]),
		ply: view => Events.flatten([
			view.particle("Static", ATTACK_OPP_X, ATTACK_OPP_Y, "BOOM_MED", 12),
			Events.wait(24),
			view.showPlayer(),
			Events.wait(90-24)
		]),
	},

	"METRONOME": {
		ply: metronome(64,64),
		opp: metronome(96, 24)
	},

	"SUBSTITUTE_LEAVE": {
		ply: view => Events.flatten([
			{
				done: t => {
					view.getPlayerSprite().x -= 4;
					return view.getPlayerSprite().x <= -16; 
				}
			},
			Events.wait(30),
			{
				init: (state?: EventState) => {
					view.setPlayerTexture(state!.playerId);
					view.getPlayerSprite().x = Graphics.PLAYER_SPRITE_X;
					view.getPlayerSprite().y = Graphics.PLAYER_SPRITE_Y;
				}
			},
			Events.wait(15)
		]),
		opp: view => Events.flatten([
			{
				done: t => {
					view.getOpponentSprite().x += 4;
					return view.getOpponentSprite().x >= Graphics.GAMEBOY_WIDTH; 
				}
			},
			Events.wait(30),
			{
				init: state => {
					view.setOpponentTexture(state.opponentId);
					view.getOpponentSprite().x = Graphics.OPPONENT_SPRITE_X;
					view.getOpponentSprite().y = Graphics.OPPONENT_SPRITE_Y;
				}
			},
			Events.wait(15)
		]),
	},

	"SUBSTITUTE_ENTER": {
		ply: view => Events.flatten([
			slideOut(4, true)(view),
			Events.wait(30),
			() => {
				view.getPlayerSprite().x = 32;
				view.getPlayerSprite().y = 80;
				view.setPlayerSubtitute();
			},
			Events.wait(15)
		]),
		opp: view => Events.flatten([
			slideOut(4, false)(view),
			Events.wait(30),
			() => {
				view.getOpponentSprite().x = 112;
				view.getOpponentSprite().y = 40;
				view.setOpponentSubtitute();
			},
			Events.wait(15)
		])
	},

	"SUBSTITUTE": {
		ply: view => Events.flatten([
			slideOut(2, true)(view),
			Events.wait(30),
			() => {
				view.getPlayerSprite().x = 32;
				view.getPlayerSprite().y = 80;
				view.setPlayerSubtitute();
			},
			view.particle("Open", 40, 80),
			Events.wait(30)
		]),
		opp: view => Events.flatten([
			slideOut(2, false)(view),
			Events.wait(30),
			() => {
				view.getOpponentSprite().x = 112;
				view.getOpponentSprite().y = 40;
				view.setOpponentSubtitute();
			},
			view.particle("Open", 120, 40),
			Events.wait(30)
		])
	},

	"ROAR": {
		ply: view => Events.flatten([
			growl(true)(view),
			slideOut(2, false)(view),
			view.hideOpponent(),
			() => {
				view.getOpponentSprite().x = Graphics.OPPONENT_SPRITE_X;
				view.getOpponentSprite().y = Graphics.OPPONENT_SPRITE_Y;
			}
		]),
		opp: view => Events.flatten([
			growl(false)(view),
			slideOut(2, true)(view),
			view.hidePlayer(),
			() => {
				view.getPlayerSprite().x = Graphics.PLAYER_SPRITE_X;
				view.getPlayerSprite().y = Graphics.PLAYER_SPRITE_Y;
			}
		])
	}
};

export default effects;