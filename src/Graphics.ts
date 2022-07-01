import * as PIXI from 'pixi.js';

const GAMEBOY_WIDTH = 160;
const GAMEBOY_HEIGHT = 144;

const PLAYER_SPRITE_X = 12;
const PLAYER_SPRITE_Y = 40;

const OPPONENT_SPRITE_X = 96;
const OPPONENT_SPRITE_Y = 0;

const OPPONENT_STATS_X = 8;

const playerStatsTexture = PIXI.Texture.from('playerstats.png');
const statsWindowTexture = PIXI.Texture.from('statswindow.png');
const teamStatusTexture = PIXI.Texture.from('teamstatus.png');
const iconTexture = PIXI.Texture.from('icons.png');
const fontTexture = PIXI.Texture.from('font.png');

const attackTexture = PIXI.Texture.from('attacks.png');

/* Create font textures from spritesheet. */

const FONT_STR =
  "ABCDEFGHIJKLMNOP" +
  "QRSTUVWXYZ():;[]" +
  "abcdefghijklmnop" +
  "qrstuvwxyz      " +
  "ÄÖÜäöü          " +
  "'  -?!.&é   * /," +
  "$0123456789     ";

const font: { [char: string]: PIXI.Texture } = { };

const charTex = (i: number, j: number) => 
  new PIXI.Texture(fontTexture as any, new PIXI.Rectangle(i * 8, j * 8, 8, 8));

const attack = (i: number, j: number, w: number, h: number) =>
  new PIXI.Texture(attackTexture as any, new PIXI.Rectangle(i * 8, j * 8, 8 * w, 8 * h));

for (let i = 0; i < FONT_STR.length; i++) {
	const x = i % 16;
	const y = Math.floor(i / 16);
	font[FONT_STR[i]] = charTex(x, y);
}

font["'d"] = charTex(6, 4);
font["'l"] = charTex(7, 4);
font["'m"] = charTex(8, 4);
font["'r"] = charTex(9, 4);
font["'s"] = charTex(10, 4);
font["'t"] = charTex(11, 4);
font["'v"] = charTex(12, 4);
font["..."] = charTex(11, 6);

/* Create textures for team member status balls. */

const teamStatus = [];

for (let i = 0; i < 4; i++) {
  teamStatus.push(new PIXI.Texture(teamStatusTexture as any, new PIXI.Rectangle(0, i * 8, 8, 8)));
}

/* Create textures for icon frames. */

const icons = [];

for (let i = 0; i < 37; i++) {
  icons.push([
    new PIXI.Texture(iconTexture as any, new PIXI.Rectangle(0, i * 16, 16, 16)),
    new PIXI.Texture(iconTexture as any, new PIXI.Rectangle(16, i * 16, 16, 16))
  ]);
}


function tileHorizontal(tex: PIXI.Texture, w: number, h: number, n: number) {
  const list = [];
  for (let i = 0; i < n; i++) {
    list.push(new PIXI.Texture(tex as any, new PIXI.Rectangle(i * w, 0, w, h)));
  }
  return list;
}

export {
	GAMEBOY_WIDTH,
	GAMEBOY_HEIGHT,
  PLAYER_SPRITE_X,
  PLAYER_SPRITE_Y,
  OPPONENT_SPRITE_X,
  OPPONENT_SPRITE_Y,
  OPPONENT_STATS_X,
	charTex,
	font,
  playerStatsTexture,
  statsWindowTexture,
  teamStatus,
  icons,
  tileHorizontal,
  attack
}