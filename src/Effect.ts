import * as Particle from './Particle';
import { Events, Event, DeepEvent, EventState } from "./Event";
import View from './View';
import * as Graphics from './Graphics';

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

const rings = (x: number, y: number, dx: number, dy: number) => (view: View) => {
	let evt: DeepEvent = [];
	for (let i = 0; i < 10; i++) {
		evt.push([
			view.particle("Ring", x, y, dx, dy),
			Events.wait(6)
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
			view.particle("PoisonBubble", x + xx[i % 3], y),
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
				view.particleV1(stage => new Particle.Sequence(stage, x + POS[j], y,
					["ENERGY_2", "ENERGY_1"], 3, 10)
					.transformY(-6)),
				Events.wait(4)
			]);
		}
	}
	evt.push(Events.wait(18))
	return Events.flatten(evt);
}

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

const growl = (isPlayer: boolean) => (view: View) => {
	const [x,y,dir] = isPlayer 
		? [ATTACK_PLY_X + 16, ATTACK_PLY_Y, 1]
		: [108, 40, -1]; 
	return Events.flatten([
		view.particle("Growl", x, y, dir),
		Events.wait(16),
		view.particle("Growl", x, y, dir),
		Events.wait(16),
		view.particle("Growl", x, y, dir),
		Events.wait(12),
	]);
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

const effects: { [attack: string]: Effect } = {

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
		ply: view => Events.flatten([
			{
				done: t => {
					view.getPlayerSprite().x = (1 - t / TACKLE_DUR) * Graphics.PLAYER_SPRITE_X + 
						(t / TACKLE_DUR) * ( Graphics.PLAYER_SPRITE_X + 12);
					return t >= TACKLE_DUR;
				}
			},
			view.particle("Static", ATTACK_OPP_X, ATTACK_OPP_Y, "BOOM_BIG", 12),
			{ 
				done: t => {
					view.getPlayerSprite().x = (t / TACKLE_DUR) *  Graphics.PLAYER_SPRITE_X + 
						(1 - t / TACKLE_DUR) * ( Graphics.PLAYER_SPRITE_X + 12);
					return t >= TACKLE_DUR;
				}
			}
		]),

		opp: view => Events.flatten([
			{ 
				done: t => {
					view.getOpponentSprite().x = (1 - t / TACKLE_DUR) * Graphics.OPPONENT_SPRITE_X
																+ (t / TACKLE_DUR) * (Graphics.OPPONENT_SPRITE_X - 12);
					return t >= TACKLE_DUR;
				}
			},
			view.particle("Static", ATTACK_PLY_X, ATTACK_PLY_Y, "BOOM_BIG", 12),
			{ 
				done: t => {
					view.getOpponentSprite().x = (t / TACKLE_DUR) * Graphics.OPPONENT_SPRITE_X
															+ (1 - t / TACKLE_DUR) * (Graphics.OPPONENT_SPRITE_X - 12);
					return t >= TACKLE_DUR;
				}
			}
		])
	},

	RAGE: {
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

	// 2.5s = 150 frames
	"THUNDERBOLT": {
		opp: view => Events.flatten([
			view.particleV1(stage =>
				new Particle.Static(stage, ATTACK_PLY_X, ATTACK_PLY_Y, "BLACK_CIRCLE", 150).setFlicker(3)),
			Events.wait(150 + 24)
		]),
		ply: view => Events.flatten([
			view.particleV1(stage =>
				new Particle.Static(stage, ATTACK_OPP_X - 8, ATTACK_OPP_Y + 4, "BLACK_CIRCLE", 150).setFlicker(3)),
			Events.wait(150 + 24)
		]),
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