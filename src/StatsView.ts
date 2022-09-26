import * as PIXI from 'pixi.js-legacy';
import { MemberObject } from './BattleObjects';
import * as Graphics from './Graphics';
import Text from './Text';
import Status from "./Status";

const levelTexture = Graphics.charTex(12, 6);
const maleTexture = Graphics.charTex(14, 6);
const femaleTexture = Graphics.charTex(13, 6);
const hpbarTexture = PIXI.Texture.from('hpbar.png');

interface Offsets {
 	nameX?: number;
	nameY?: number;
	lvlX: number;
	lvlY: number;
	hpbarX: number;
	hpbarY: number;
	genderX?: number;
	genderY?: number; 
	texX?: number; 
	texY?: number; 
	statusX: number;
	hpTextX?: number;
	hpTextY?: number;
}

/* Displays member name, level, gender, and health within an optional window. */
class StatsView {
	protected stage;
	protected myStage;
	protected lvlX;
	public visible;
	protected levelText: Text;
	protected statusText: Text;
	protected nameText;
	protected levelSpr;
	protected hpbarSpr;
	protected genderSpr;
	protected healthRect;
	protected extraSpr;
	protected lastCondition: string = "";

	protected member: MemberObject | null = null;
	protected status: Status | null = null;

	constructor(
		stage: PIXI.Container, 
		x: number, 
		y: number, 
		{ nameX = 0, nameY = 0, lvlX, lvlY, hpbarX, hpbarY,
			genderX, genderY, texX, texY, statusX }: Offsets, 
		tex: PIXI.Texture | undefined = undefined
	) {
		
		this.stage = stage;
		this.myStage = new PIXI.Container();
		this.myStage.filters = [ Graphics.removeAlpha ];
		this.myStage.zIndex = -1;
		this.myStage.sortableChildren = true;
		this.myStage.x = x;
		this.myStage.y = y;
		this.lvlX = lvlX;

		this.visible = false;
		this.levelText = new Text(this.myStage, -1, lvlY * 8);
		this.statusText = new Text(this.myStage, lvlX * 8 + statusX * 8, lvlY * 8);

		this.nameText = new Text(this.myStage, nameX * 8, nameY * 8);
		this.levelSpr = new PIXI.Sprite(levelTexture);
		this.levelSpr.x = lvlX * 8 - 8;
		this.levelSpr.y = lvlY * 8;
		this.hpbarSpr = new PIXI.Sprite(hpbarTexture);
		this.hpbarSpr.x = hpbarX * 8;
		this.hpbarSpr.y = hpbarY * 8;
		if (genderX != null && genderY != null) {
			this.genderSpr = new PIXI.Sprite(undefined);
			this.genderSpr.x = genderX * 8;
			this.genderSpr.y = genderY * 8;
			this.genderSpr.zIndex = -1;
		}

		this.healthRect = PIXI.Sprite.from(PIXI.Texture.WHITE);
		this.healthRect.x = (hpbarX + 2) * 8;
		this.healthRect.y = hpbarY * 8 + 3;
		this.healthRect.height = 2;

		// for drawing the little windows surrounding the stats
		if (tex != null && texX != null && texY != null) {
			this.extraSpr = new PIXI.Sprite(tex);
			this.extraSpr.x = texX * 8;
			this.extraSpr.y = texY * 8;
		}
	}

	update() {
		if (this.status == null) return;
		
		const hp = this.status.hp;
		const maxHp = this.status.maxHp;
		const progress = hp / maxHp;
		if (progress <= 0.2) {
			this.healthRect.tint = 0xF80000;
		} else if (progress <= 0.5) {
			this.healthRect.tint = 0xF8A800;
		} else {
			this.healthRect.tint = 0x00B800;
		}
		this.healthRect.width = Math.floor(progress * 48);

		if (this.status.condition !== this.lastCondition) {
			this.updateStatusText();
		}
		this.lastCondition = this.status.condition;
	}

	hide() {
		this.visible = false;
		this.stage.removeChild(this.myStage);

		this.myStage.removeChild(this.healthRect);
		this.myStage.removeChild(this.levelSpr);
		this.myStage.removeChild(this.hpbarSpr);
		if (this.extraSpr) this.myStage.removeChild(this.extraSpr);
		if (this.genderSpr) this.myStage.removeChild(this.genderSpr);

		this.levelText.clear();
		this.nameText.clear();
	}

	refreshLevel(level: number) {
		this.levelText.change(level.toString());
	}

	show(member: MemberObject, status: Status) {
		this.member = member;
		this.status = status;
		this.visible = true;
		this.stage.addChild(this.myStage);

		//this.member = member;
		const level = member.level;
		// level 100 covers the L
		if (level >= 100) {
			this.levelText.x = this.lvlX * 8 - 8;
			this.levelSpr.visible = false;
		} else {
			this.levelText.x = this.lvlX * 8;
			this.levelSpr.visible = true;
		}
		this.levelText.change(level.toString());
		this.nameText.change(member.name);

		this.myStage.addChild(this.healthRect);
		this.myStage.addChild(this.levelSpr);
		this.myStage.addChild(this.hpbarSpr);
		if (this.genderSpr != null) {
			this.genderSpr.texture = undefined as any;
			if (member.gender === "male") {
				this.genderSpr.texture = maleTexture;
			} else if (member.gender === "female") {
				this.genderSpr.texture = femaleTexture;
			}
			this.myStage.addChild(this.genderSpr);
		}
		if (this.extraSpr) this.myStage.addChild(this.extraSpr);

		this.updateStatusText();
	}

	updateStatusText() {
		if (this.status == null) {
			throw new Error("StatsView.updateStatusText: status is null");
		}

		this.statusText.change(this.status.condition.toUpperCase());
	}

	getStage() {
		return this.myStage;
	}
}

/* Displays stats showing the numerical value of the HP out of the total. */
class HPStatsView extends StatsView {

	protected hpText;
	protected maxHpText;
	protected lastHp: number = -1;

	constructor(
		stage: PIXI.Container, 
		x: number, 
		y: number, 
		offsets: Offsets, 
		tex: PIXI.Texture | undefined = undefined
	) {
		super(stage, x, y, offsets, tex);
		this.hpText = new Text(this.myStage, offsets.hpTextX! * 8, offsets.hpTextY! * 8, { padding: 3});
		this.maxHpText = new Text(this.myStage, (offsets.hpTextX! + 4) * 8, offsets.hpTextY! * 8, { padding: 3});
	}

	update() {
		super.update();
		// update text if HP changes
		if (this.status != null &&
				this.lastHp !== this.status.hp) {
			this.hpText.change(Math.floor(this.status.hp).toString() + "/");
			this.lastHp = this.status.hp;
		}
	}

	// redraw with new member or updated status
	refresh(newMember: MemberObject | null = null, newStatus: Status | null = null) {
		this.hide();
		const refreshMember = newMember || this.member;
		const refreshStatus = newStatus || this.status;
		if (refreshMember == null) {
			throw new Error("HPStatsView.refresh: can't show stats for null member");
		}
		if (refreshStatus == null) {
			throw new Error("HPStatsView.refresh: can't show stats for null status");
		}
		this.show(refreshMember, refreshStatus);
	}

	hide() {
		super.hide();
		this.hpText.clear();
		this.maxHpText.clear();
	}

	show(member: MemberObject, status: Status) {
		super.show(member, status);

		this.hpText.change(status.hp.toString() + "/");
		this.maxHpText.change(status.maxHp.toString());
		this.lastHp = status.hp;
	}
}

export { StatsView, HPStatsView };