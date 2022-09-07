import * as PIXI from 'pixi.js-legacy';
import * as PIXI_SOUND from '@pixi/sound';
import * as Graphics from './Graphics';
import * as Input from './Input.js';

const APOSTROPHE_LETTERS = ['d', 'l', 'm', 'r', 's', 't', 'v'];

const textboxTexture = PIXI.Texture.from('textbox.png');
const textboxSprite = new PIXI.Sprite(textboxTexture);
const contArrowSprite = new PIXI.Sprite(Graphics.charTex(11, 5));

enum State {
	SHOW,
	WAIT,
	SCROLL_1,
	SCROLL_2,
	DONE,
	NONE
}

class Textbox {
	private forceAdvance: boolean = false;
	data: string[] = [];
	showArrow = false;
	line = 0;
	idx =  0;
	offset = 0; // move cursor back when compressing apostrophes
	sprites: PIXI.Sprite[] = [];
	state: State = State.NONE;
	auto = false;
	ticks = 0;
	private readonly stage: PIXI.Container;

	constructor(stage: PIXI.Container) {
		this.stage = stage;
	}

	advance() {
		this.forceAdvance = true;
	}

	hide() {
		this.clear();
		this.stage.removeChild(textboxSprite);
		this.stage.removeChild(contArrowSprite);
	}

	show() {
		this.stage.zIndex = 1;
		this.stage.addChild(textboxSprite);
		this.stage.addChild(contArrowSprite);
	}

	private currentLine(): string {
		const line = this.data[this.line];
		if (line == null) {
			throw new Error(`Textbox.currentLine: bad line, line=${this.line} data=${JSON.stringify(this.data)}`);
		}
		return line;
	}

	apostrophe(c: string) {
		const letter = this.currentLine()[this.idx + 1];
		if (c === "'" && (letter && APOSTROPHE_LETTERS.includes(letter))) {
			this.idx += 1;
			this.offset += 1;
			return "'" + letter;
		}
		return c;
	}

	ellipse(c: string) {
		const l = this.currentLine();
		if (c === '.' && l[this.idx + 1] === '.' && l[this.idx + 2] === '.') {
			this.idx += 2;
			this.offset += 2;
			return "...";
		}
		return c;
	}

	update() {
		//console.log(this.state, this.ticks);
		textboxSprite.y = Graphics.GAMEBOY_HEIGHT - textboxSprite.height;
		contArrowSprite.x = textboxSprite.x + 18 * 8;
		contArrowSprite.y = textboxSprite.y + 5 * 8;
		contArrowSprite.visible = this.showArrow;

		switch (this.state) {
			case State.SHOW:
				if (this.ticks >= (Input.advance() ? 0 : 1)) {
					// Finish page
					if (this.line >= 2) {
						this.showArrow = true;
						this.state = State.WAIT;
						Input.releaseSelect();
						Input.releaseBack();
						return;
					}
					const current = this.currentLine();
					// Finish line
					if (this.idx >= current.length) {
						this.line += 1;
						this.idx = 0;
						this.offset = 0;
						return;
					}
					let c = current[this.idx]!;
					c = this.ellipse(this.apostrophe(c));
					// add single character to line
					const tex = Graphics.font[c];
					const spr = new PIXI.Sprite(tex);
					spr.x = 8 + (this.idx - this.offset) * 8;
					spr.y = textboxSprite.y + 16 + this.line * 16;
					this.sprites.push(spr);
					this.stage.addChild(spr);

					this.idx += 1;
					this.ticks = 0;
				}
			break;
			case State.WAIT:
				const done = this.data!.length <= this.line;
				const doAuto = done && this.auto;

				if (this.ticks >= 16 && !doAuto) {
					this.showArrow = !this.showArrow;
					this.ticks = 0;
				}

				if (Input.advance() || doAuto || this.forceAdvance) {
					if (Input.advance() || this.forceAdvance) {
						if (!doAuto) PIXI_SOUND.sound.play('pressab');
						Input.releaseSelect();
						Input.releaseBack();
					}
					if (this.showArrow) {
						contArrowSprite.visible = false;
					}
					this.showArrow = false;

					// more text to show!
					if (done) {
						this.state = State.DONE;
					} else {
						for (const spr of this.sprites) {
							spr.y -= 8;
						}
						this.state = State.SCROLL_1;
					}
					this.ticks = 0;
				}
			break;
			case State.SCROLL_1:
				if (this.ticks >= 6) {
					const remove = this.sprites.filter(spr => spr.y === 104);
					remove.forEach(spr => this.stage.removeChild(spr));
					this.sprites = this.sprites.slice(remove.length);
					for (const spr of this.sprites) {
						spr.y -= 8;
					}
					this.state = State.SCROLL_2;
					this.ticks = 0;
				}
			break;
			case State.SCROLL_2:
				if (this.ticks >= 6) {
					this.state = State.SHOW;
					this.line -= 1;
					this.data = this.data!.slice(1);
					this.ticks = 0;
				}
			break;
			default:
		}

		
		this.forceAdvance = false;
		this.ticks++;
	}

	reset(lines: string[], auto: boolean) {
		this.stage.zIndex = 1;
		while (lines.length < 2) lines.push("");
		this.auto = auto;
		this.line = 0;
		this.data = lines;
		this.showArrow = false;
		this.sprites.forEach(spr => this.stage.removeChild(spr));
		this.sprites = [];
		this.state = State.SHOW;
		this.ticks = 0;
	}

	clear() {
		this.stage.zIndex = -1;
		this.sprites.forEach(spr => this.stage.removeChild(spr));
	}

	done(): boolean { 
		return this.state === State.DONE;
	}
}

export { Textbox as default };