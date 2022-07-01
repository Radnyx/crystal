import * as PIXI from 'pixi.js';
import moveInfo from './MoveInfo';
import { BattleInfo, MemberObject } from "./BattleObjects";
import { FighterLoader, StorageLoader } from './Downloader';
import IResources from './IResources';

const GLOBAL_ASSETS = {
	shaders: [
		'faint', 'oppAppear', 'plyAppear', 'invert'
	],
	sfx: [
		'pressab', 'denied', 'ballpoof', 'hit', 'hitresisted',
		'hitsupereffective', 'faint', 'confused', 'confused_hit',
		'sleeping', 'frz'
	]
};

class Resources implements IResources {
	private resources: Partial<Record<string, PIXI.LoaderResource>> = null;
	private battle: BattleInfo;

	private playerTrainerTexture: PIXI.Texture = null;
	private opponentTrainerTexture: PIXI.Texture = null;
	private readonly fronts: { [id: string]: PIXI.Texture[] } = {};
	private readonly backs: { [id: string]: PIXI.Texture } = {};
	private readonly cries: { [id: string]: string } = {};
	private readonly shaders: { [id: string]: PIXI.Filter } = {};
	uniforms: any;

	constructor(resources: Partial<Record<string, PIXI.LoaderResource>>, battle: BattleInfo,  shaderNames: Set<string>) {
		this.resources = resources;
		this.battle = battle;
		this.createTeamAssets();
		this.createShaders(shaderNames);
	}

	createFrontBackTextures(id: string, front: string, back: string) {
		if (!this.fronts[id] && this.resources[front]) {
			const sheet = [];
			const tex = this.resources[front].texture as PIXI.Texture;
			for (let i = 0; i < tex.width / 56; i++) {
				sheet.push(new PIXI.Texture(tex.baseTexture, new PIXI.Rectangle(i * 56, 0, 56, 56)));
			}
			this.fronts[id] = sheet;
		}
		if (!this.backs[id] && this.resources[back]) {
			this.backs[id] = this.resources[back].texture;
		}
	}

	createTeamFrontBackTextures(team: MemberObject[]) {
		for (let i = 0; i < team.length; i++) {
			const member = team[i];
			this.createFrontBackTextures(member.id, this.battle.data[member.id].front, this.battle.data[member.id].back);
		}
	}

	createCrySound(id: string, cry: string) {
		if (!this.cries[id] && this.resources[cry]) {
			this.cries[id] = cry;
		}
	}

	createTeamCrySounds(team: MemberObject[]) {
		for (let i = 0; i < team.length; i++) {
			const member = team[i];
			this.createCrySound(member.id, this.battle.data[member.id].cry);
		}
	}

	createShaders(shaderNames: Set<string>) {
		for (const name of shaderNames) {
			this.uniforms[name] = { step: 0 };
			this.shaders[name] = new PIXI.Filter(undefined,
				this.resources[`shaders/${name}.fs`].data, this.uniforms[name]);
		}
	}

	createTeamAssets() {
		this.playerTrainerTexture = this.resources['plyTrainer'].texture;
		this.opponentTrainerTexture = this.resources['oppTrainer'].texture;
		this.createTeamFrontBackTextures(this.battle.info.player.team);
		this.createTeamFrontBackTextures(this.battle.info.opponent.team);
		this.createTeamCrySounds(this.battle.info.player.team);
		this.createTeamCrySounds(this.battle.info.opponent.team);
	}

	merge(resources: Partial<Record<string, PIXI.LoaderResource>>): Resources {
		for (const [ name, value ] of Object.entries(resources)) {
			this.resources[name] = value;
		}
		return this;
	}

	getPlayerTrainerTexture(): PIXI.Texture {
		return this.playerTrainerTexture;
	}

	getOpponentTrainerTexture(): PIXI.Texture {
		return this.opponentTrainerTexture;
	}

	getFront(name: string): PIXI.Texture[] {
		return this.fronts[name];
	}

	getBack(name: string): PIXI.Texture {
		return this.backs[name];
	}

	getCry(name: string): string {
		return this.cries[name];
	}

	getShader(name: string): PIXI.Filter {
		return this.shaders[name];
	}

	getMusic(): PIXI.sound.Sound {
		return this.resources["music"].sound;
	}
}

class ResourceLoader {
	private resources: Resources = null;

	readonly fighterLoader = new FighterLoader();
	readonly storageLoader = new StorageLoader();

	private loader = new PIXI.Loader();
	private readonly shaderNames = new Set<string>();

	private readonly loaded: { [id: string]: boolean } = {};

	constructor () {
		for (const s of GLOBAL_ASSETS.shaders) {
			this.shaderNames.add(s);
			this.add(`shaders/${s}.fs`);
		}
		for (const s of GLOBAL_ASSETS.sfx) {
			this.add(s, `sfx/${s}.wav`)
		}
	}

	reset() {
		this.loader.reset();
	}

	/* Add and cache a file we should add include loading, along with its URL. */
	add(name: string | null, file: string = name) {
		if (name != null && !this.loaded[name]) {
			this.loader.add(name, file);
			this.loaded[name] = true;
		}
	}

	addAttacks(team: MemberObject[]) {
		for (const member of team) {
			for (const move of member.moves.filter(m => m != null && m !== "")) {
				const info = moveInfo[move];
				const infoStill = moveInfo[move+"_STILL"];
				if (info.sfx != null) {
					this.add(info.sfx, `sfx/attacks/${info.sfx}.wav`);
				}
				if (infoStill?.sfx != null) {
					this.add(infoStill.sfx, `sfx/attacks/${infoStill.sfx}.wav`);
				}
				if (info.shaders !== undefined) {
					for (const s of info.shaders) {
						this.shaderNames.add(s);
						this.add(`shaders/${s}.fs`);
					}
				}
			}
		}
	}

	loadTeams(battleInfo: BattleInfo): Promise<[BattleInfo, Resources]> {
		return new Promise((resolve, reject) => {
			this.add("music", "music/Battle! Gym Leader.mp3");
			this.add("plyTrainer", battleInfo.info.player.trainer);
			this.add("oppTrainer", battleInfo.info.opponent.trainer);
			this.addAttacks(battleInfo.info.player.team);
			this.addAttacks(battleInfo.info.opponent.team);

			this.loader.onError.add(reject);
			this.loader.load((_, resources) => {
				if (this.resources == null) {
					this.resources = new Resources(resources, battleInfo, this.shaderNames);
				} else {
					this.resources.merge(resources);
				}
				this.loader = new PIXI.Loader()
				resolve([ battleInfo, this.resources ]);
			});
		});
	}

	load(): Promise<Resources> {
		return new Promise((resolve, reject) => {
			this.loader.onError.add(reject);
			this.loader.load((_, resources) => resolve(this.resources.merge(resources)));
		});
	}
}

export { ResourceLoader, Resources };