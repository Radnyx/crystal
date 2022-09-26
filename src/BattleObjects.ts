/**
 * Schematics for Battle JSON
 */

interface MemberObject {
	id: string;
	level: number;
	gender: "male" | "female" | "none";
	moves: string[];
	name: string;
}

interface TeamObject {
	name: string;
	trainer: string;
	team: MemberObject[];
}

interface BattleObject {
	player: TeamObject;
	opponent: TeamObject;
	winMessage?: string;
	battleMusic?: string;
}

interface AnimObject {
	delay: number[];
	ref: number[];
}

interface FighterObject {
	baseAtk: number;
	baseDef: number;
	baseHp: number;
	baseSpAtk: number;
	baseSpDef: number;
	baseSpd: number;
	cry: string;
	front: string;
	back: string;
	name: string;
	types: string[];
	icon?: number;
	music?: string;
	anim: AnimObject;
}

interface BattleInfo {
	info: BattleObject;
	data: { [url: string]: FighterObject };
}

function cloneMemberObject(obj: MemberObject): MemberObject {
	return {
		id: obj.id,
		level: obj.level,
		gender: obj.gender,
		moves: [...obj.moves],
		name: obj.name
	}
}

function cloneTeamObject(obj: TeamObject): TeamObject {
	return {
		name: obj.name,
		trainer: obj.trainer,
		team: obj.team.map(cloneMemberObject)
	}
}

function cloneBattleObject(obj: BattleObject | null): BattleObject | null {
	if (obj == null) return null;
	return {
		player: cloneTeamObject(obj.player),
		opponent: cloneTeamObject(obj.opponent),
		battleMusic: obj.battleMusic,
		winMessage: obj.winMessage
	};
}

function membersEqual(obj1: MemberObject, obj2: MemberObject): boolean {
	return obj1.id === obj2.id && obj1.level === obj2.level && obj1.gender === obj2.gender && 
		obj1.name === obj2.name && obj1.moves.length === obj2.moves.length && 
		obj1.moves.every((move, i) => obj2.moves[i] === move);
}

function teamsEqual(obj1: TeamObject, obj2: TeamObject): boolean {
	return obj1.name === obj2.name && obj1.trainer === obj2.trainer && obj1.team.length === obj2.team.length &&
		obj1.team.every((member, i) => membersEqual(member, obj2.team[i]));
}

function objectsEqual(obj1: BattleObject | null, obj2: BattleObject | null): boolean {
	if (obj1 == null && obj2 == null) return true;
	if (obj1 == null || obj2 == null) return false;
	return obj1.battleMusic === obj2.battleMusic &&
		obj1.winMessage === obj2.winMessage &&
		teamsEqual(obj1.player, obj2.player) && 
		teamsEqual(obj1.opponent, obj2.opponent);
}

export { 
	MemberObject, TeamObject, BattleObject, FighterObject, AnimObject, BattleInfo, 
	cloneBattleObject, objectsEqual
};