import * as Graphics from "./Graphics";
import * as PIXI from 'pixi.js';
import * as Particle from "./Particle";
import { HPStatsView, StatsView } from "./StatsView";
import { OpponentTeamStatus, PlayerTeamStatus } from "./TeamStatus";
import Textbox from "./Textbox";
import effects from "./Effect";
import { AnimObject, MemberObject } from "./BattleObjects";
import { Event, DeepEvent, Events } from "./Event";
import { default as PIXI_SOUND } from "pixi-sound";
import IView from "./IView";
import Status from "./Status";
import IResources from "./IResources";

function animate(
    sprite: PIXI.Sprite, 
    textures: PIXI.Texture[], 
    animData: AnimObject = { ref: [ 0 ], delay: [ 0 ] }
): Event {
    const { ref, delay } = animData;
    // I think this was to fix animation data I scraped?
    delay[delay.length - 1] = 0;
    const script: DeepEvent = [];
    for (let i = 0; i < ref.length; i++) {
        script.push({
            init: () => sprite.texture = textures[ref[i]],
            done: t => t >= delay[i]
        });
    }
    return Events.flatten(script);
}

class View implements IView {
    private readonly app: PIXI.Application;
    private readonly resources: IResources;
    private matrixFilter: PIXI.filters.ColorMatrixFilter;

    // comprises all of the following containers
    private readonly fullStage = new PIXI.Container();
    // display textbox here
    private readonly textboxStage = new PIXI.Container();
    // display particles here
    private readonly particleStage = new PIXI.Container();
    // display everything else here
    private readonly stage = new PIXI.Container();

    private readonly textbox: Textbox;

    // Overall team info (basically just number of members and if they're fainted)
    private readonly playerTeamStatus;
    private readonly opponentTeamStatus;

    private readonly playerStats: StatsView;
    private readonly opponentStats: StatsView;

    private readonly particles: Particle.Particle[] = [];

    private readonly trainerSprites: { player: PIXI.Sprite, opponent: PIXI.Sprite };
    private readonly memberSprites: { player: PIXI.Sprite, opponent: PIXI.Sprite };

    private readonly playerStatus: Status = { maxHp: 0, hp: 0, condition: "" };
    private readonly opponentStatus: Status = { maxHp: 0, hp: 0, condition: "" };
    
    private playerMember?: MemberObject;
    private opponentMember?: MemberObject;

    constructor(app: PIXI.Application, resources: IResources) {
        this.app = app;
        this.resources = resources;
        this.matrixFilter = new PIXI.filters.ColorMatrixFilter();

        this.playerStats = new HPStatsView(this.stage, 72, 56, {
            nameX: 1, lvlX: 6, lvlY: 1, hpbarX: 1, hpbarY: 2,
            genderX: 8, genderY: 1, hpTextX: 2, hpTextY: 3, texX: 0, texY: 2,
            statusX: -1, nameY: undefined
        }, Graphics.playerStatsTexture);

        this.opponentStats = new StatsView(this.stage, 8, 0, {
            lvlX: 6, lvlY: 1, hpbarX: 1, hpbarY: 2,
            genderX: 8, genderY: 1, texX: 0, texY: 2,
            statusX: -1, nameX: undefined, nameY: undefined,
            hpTextX: undefined, hpTextY: undefined
        }, Graphics.statsWindowTexture);

        this.playerTeamStatus = new PlayerTeamStatus(this.stage);
        this.opponentTeamStatus = new OpponentTeamStatus(this.stage);

        this.textbox = new Textbox(this.textboxStage);

        this.trainerSprites = {
            player: new PIXI.Sprite(resources.getPlayerTrainerTexture()),
            opponent: new PIXI.Sprite(resources.getOpponentTrainerTexture())
        }

        this.memberSprites = {
            player: new PIXI.Sprite(),
            opponent: new PIXI.Sprite()
        }

        this.memberSprites.player.x = Graphics.PLAYER_SPRITE_X;
        this.memberSprites.player.y = Graphics.PLAYER_SPRITE_Y;

        this.memberSprites.opponent.x = Graphics.OPPONENT_SPRITE_X;
	    this.memberSprites.opponent.y = Graphics.OPPONENT_SPRITE_Y;
        
        this.fullStage.addChild(this.textboxStage);
	    this.fullStage.addChild(this.stage);
	    this.fullStage.addChild(this.particleStage);
        this.stage.sortableChildren = true;
        this.fullStage.sortableChildren = true;
        this.particleStage.zIndex = 2;
        this.particleStage.sortableChildren = true;

        this.textbox.show();
    }

    startMusic() {
        if (this.resources.getMusic().isPlaying) {
            this.resources.getMusic().stop();
        }
        this.resources.getMusic().play({ loop: true, volume: 0.1 });
    }
    
    stopMusic() {
        this.resources.getMusic().stop();
    }

    resumeMusic() {
        this.resources.getMusic().resume();
    }

    pauseMusic() {
        this.resources.getMusic().pause();
    }

    restart() {
        this.stage.removeChildren();
        this.particleStage.removeChildren();
        this.textboxStage.removeChildren();
        this.textbox.show();
    }
    
    getStage(): PIXI.Container {
        return this.stage;
    }

    getFullStage(): PIXI.Container {
        return this.fullStage;
    }

    invertColors(): Event {
        return { 
            init: () => { 
                this.matrixFilter.negative(true);
                if (this.app.renderer.backgroundColor === 0xF8F8F8) {
                    this.app.renderer.backgroundColor = 0x080808;
                } else {
                    this.app.renderer.backgroundColor = 0xF8F8F8;
                }
            }
        };
    }

    getMemberSprite(isPlayer: boolean): PIXI.Sprite {
        if (isPlayer) {
            return this.memberSprites.player;
        }
        return this.memberSprites.opponent;
    }

    getOpponentStatsStage(): PIXI.Container {
        return this.opponentStats.getStage();
    }


    update() {
        this.textbox.update();
        this.playerStats.update();
        this.opponentStats.update();
        this.stage.filters = [ this.matrixFilter ];
        this.particles.forEach(p => p.update());
        // cleanup dead particles
        for (let i = 0; i < this.particles.length; i++) {
            if (this.particles[i].dead) {
                this.particles.splice(i, 1);
                i--;
            }
        }
    }

    showPlayerTeamStatus(hp: number[]): Event {
        return { 
            init: () => this.playerTeamStatus.show(hp) 
        };
    }

    showOpponentTeamStatus(hp: number[]): Event {
        return { 
            init: () => this.opponentTeamStatus.show(hp) 
        };
    }

    hidePlayerTeamStatus(): Event {
        return { init: () => this.playerTeamStatus.hide() };
    }

    hideOpponentTeamStatus(): Event {
        return { init: () => this.opponentTeamStatus.hide() };
    }

    showPlayerStats(member?: MemberObject): Event {
        let showMember: MemberObject;
        if (member == null) {
            if (this.playerMember == null) {
                throw new Error("View.showPlayerStats: player member is null");
            }
            showMember = this.playerMember;
        } else {
            showMember = member;
            this.playerMember = member;
        }
        return { init: () => this.playerStats.show(showMember, this.playerStatus) };
    }

    showOpponentStats(member?: MemberObject): Event {
        let showMember: MemberObject;
        if (member == null) {
            if (this.opponentMember == null) {
                throw new Error("View.showPlayerStats: opponent member is null");
            }
            showMember = this.opponentMember;
        } else {
            showMember = member;
            this.opponentMember = member;
        }
        return { init: () => this.opponentStats.show(showMember, this.opponentStatus) };
    }

    hidePlayerStats(): Event {
        return { init: () => this.playerStats.hide() };
    }

    hideOpponentStats(): Event {
        return { init: () => this.opponentStats.hide() };
    }

    refreshStats() {
        if (this.playerStats.visible) {
            this.playerStats.hide();
            if (this.playerMember == null) {
                throw new Error("View.refreshStats: player member is null");
            }
            this.playerStats.show(this.playerMember, this.playerStatus);
        }
        if (this.opponentStats.visible) {
            this.opponentStats.hide();
            if (this.opponentMember == null) {
                throw new Error("View.refreshStats: opponent member is null");
            }
            this.opponentStats.show(this.opponentMember, this.playerStatus);
        }
    }

    setStatus(isPlayer: boolean, status: Partial<Status>) {
        if (isPlayer) {
            this.playerStatus.maxHp = status.maxHp || this.playerStatus.maxHp;
            this.playerStatus.hp = status.hp || this.playerStatus.hp;
            this.playerStatus.condition = status.condition || this.playerStatus.condition;
        } else {
            this.opponentStatus.maxHp = status.maxHp || this.opponentStatus.maxHp;
            this.opponentStatus.hp = status.hp || this.opponentStatus.hp;
            this.opponentStatus.condition = status.condition || this.opponentStatus.condition;

        }
    }

    getPlayerStatus(): Status {
        return this.playerStatus;
    }

    getOpponentStatus(): Status {
        return this.opponentStatus;
    }

    slideInTrainers(): Event {
        const SLIDE_IN_LIMIT = 75;
        return {
			init: () => {
				this.stage.addChild(this.trainerSprites.opponent);
				this.stage.addChild(this.trainerSprites.player);
				this.trainerSprites.player.y = 48;
			},
			done: t => {
				const progress = t / SLIDE_IN_LIMIT;
				this.trainerSprites.player.x = (1.0 - progress) * Graphics.GAMEBOY_WIDTH + progress * 16;
				this.trainerSprites.opponent.x = (1.0 - progress) * -56 + progress * Graphics.OPPONENT_SPRITE_X;
				return t >= SLIDE_IN_LIMIT;
			}
		};
    }

    slideOutPlayerTrainer(): Event {
        const PLY_SLIDE_OUT_LIMIT = 16;
        return Events.flatten([
            {
                done: t => {
                    const progress = t / PLY_SLIDE_OUT_LIMIT;
                    const x = (1.0 - progress) * 16 + progress * -48;
                    this.trainerSprites.player.x = Math.floor(x / 8) * 8;
                    return t >= PLY_SLIDE_OUT_LIMIT;
                }
            },
            () => this.removePlayerTrainer() 
        ]);
    }

    slideOutOpponentTrainer(): Event {
        const OPP_SLIDE_OUT_LIMIT = 18;
        return Events.flatten([
            {
                done: t => {
                    const progress = t / OPP_SLIDE_OUT_LIMIT;
                    const x = (1.0 - progress) * Graphics.OPPONENT_SPRITE_X + progress * Graphics.GAMEBOY_WIDTH;
                    this.trainerSprites.opponent.x = Math.floor(x / 8) * 8;
                    return t >= OPP_SLIDE_OUT_LIMIT;
                }
            },
            () => this.removeOpponentTrainer() 
        ]);
    }

    showPlayer(): Event {
        return { init: () => this.stage.addChild(this.memberSprites.player) };
    }

    showOpponent(): Event {
        return { init: () => this.stage.addChild(this.memberSprites.opponent) };
    }

    hidePlayer(): Event {
        return { init: () => this.stage.removeChild(this.memberSprites.player) };
    }

    hideOpponent(): Event {
        return { init: () => this.stage.removeChild(this.memberSprites.opponent) };
    }

    removePlayerTrainer() {
        this.stage.removeChild(this.trainerSprites.player);
    }

    removeOpponentTrainer() {
        this.stage.removeChild(this.trainerSprites.opponent);
    }

    setPlayerTexture(id?: string) {
        this.memberSprites.player.texture = id && this.resources.getBack(id) as any;
    }

    setPlayerSubtitute() {
        this.memberSprites.player.texture = Particle.attackTex.SUBSTITUTE_BACK;
    }

    setOpponentSubtitute() {
        this.memberSprites.opponent.texture = Particle.attackTex.SUBSTITUTE_FRONT;
    }

    setOpponentTexture(id?: string) {
        this.memberSprites.opponent.texture = id && this.resources.getFront(id)[0] as any;
    }

    /* Old-style particle rendering. Try to avoid this. */
    particleV1(particle: (stage: PIXI.Container) => Particle.Particle): Event {
        return { init: () => this.particles.push(particle(this.particleStage)) };
    }

    particle(t: string, ...args: (number | string | string[])[]): Event {
        const Type: (new (stage: PIXI.Container, ...args: any[]) => Particle.Particle) = (Particle as any)[t];
        if (typeof Type !== "function") {
            console.error(`Unknown particle: "${t}".`);
            return {};
        }
        return { init: () => this.particles.push(new Type(this.particleStage, ...args)) };
    }

    saveParticle(t: string, ...args: any[]): Event {
        const Type: (new (stage: PIXI.Container, ...args: any[]) => Particle.Particle) = (Particle as any)[t];
        return { 
            init: state => {
                const p = new Type(this.particleStage, ...args);
                this.particles.push(p);
                state.object = p;
            } 
        };
    }

    static waitForParticle(): Event {
        return { done: (_, state) => (state.object as Particle.Particle).dead }
    }

    effect(name: string, isPlayer: boolean): Event | undefined {
        const anim = effects[name];
        if (isPlayer) {
            return anim?.ply && anim.ply(this);
        }
        return anim?.opp && anim.opp(this);
    }

    screenShake(time: number = 30, delay: number = 4, magnitude: number = 2, y: boolean = true): Event {
        return Events.flatten([
            {
                done: t => {
                    const pos = (t % (delay * 2) < delay) ? -magnitude : magnitude;
                    if (y) {
                        this.fullStage.y = pos;
                        if (t >= time) this.stage.y = 0;
                    } else {
                        this.fullStage.x = pos;
                        if (t >= time) this.stage.x = 0;
                    }
                    return t >= time;
                },
            },
            { init: () => this.fullStage.x = 0 },
            { init: () => this.fullStage.y = 0 }
        ]);
    }

    sfx(name: string, wait: boolean = false, panning: number = 0): Event {
        if (name == null) return {};
        const sound: PIXI_SOUND.Sound = PIXI_SOUND.find(name);
        if (sound == null) {
            console.error(`Could not play sound: "${name}".`);
            return {};
        }
        if (panning !== 0) {
            sound.filters = [ new PIXI_SOUND.filters.StereoFilter(panning) ];
        }
        return {
            init: state => { 
                if (wait) state.waiting = true;
                sound.play({
                    complete: () => {
                        sound.filters = [];
                        state.waiting = false;
                    }
                })
            },
            done: (_, state) => !state.waiting
        }
    }

    cry(id: string, wait: boolean, isPlayer: boolean): Event {
        return this.sfx(this.resources.getCry(id), wait, isPlayer ? -0.5 : 0.5);
    }

    shader(isPlayer: boolean, name: string, steps: number, delay: number, reverse: boolean = false): Event {
        const sprite = this.getMemberSprite(isPlayer);
        const script: DeepEvent = [ 
            { 
                init: () => {
                    sprite.filters = [ this.resources.getShader(name) ];
                    sprite.visible = true;
                }
            } 
        ];
        for (let i = 0; i < steps; i++) {
            const j = reverse ? steps - i - 1 : i;
            script.push([
                { init: () => this.resources.uniforms[name].step = j },
                { done: t => t >= delay }
            ])
        }
        script.push({ init: () => sprite.filters = [] });
        return Events.flatten(script);
    }

    getTextbox() {
        return this.textbox;
    }

    clearTextbox(): Event {
        return { init: () => this.textbox.clear() };
    }

    text(text: string[], auto: boolean = false) { 
        return {
            init: () => this.textbox.reset(text, auto),
            done: () => this.textbox.done()
        };
    }

    anim(id: string, anim: AnimObject): Event {
        return animate(
            this.getOpponentSprite(), 
            this.resources.getFront(id), 
            anim
        );
    }

    public getPlayerSprite() {
        return this.memberSprites.player;
    }

    public getOpponentSprite() {
        return this.memberSprites.opponent;
    }

    public screenWiggle(): Event {
        return Events.flatten([
            {
                done: t => {
                    this.fullStage.x = Math.floor(6 * Math.sin(2 * Math.PI * t * 1 / 30));
                    return t >= 30;
                }
            },
            () => this.fullStage.x = 0
        ]);
    }
}

export default View;