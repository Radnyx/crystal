const pressed: { [key: string]: boolean } = {};

let focused = false;

// OK, basically
function selected() {
	return pressed['KeyX'] || pressed['Enter'];
}

// NO, basically
function back() {
	return pressed['KeyZ'] || pressed['Backspace'];
}

function AorB() {
	return pressed['KeyZ'] || pressed['KeyX'];
}

// Advance textbox
function advance() {
	return selected() || back();
}

function forceAdvance() {
	pressed['KeyX'] = true;
}

function forceBack() {
	pressed['KeyZ'] = true;
}

function up() {
	return pressed['ArrowUp'];
}

function down() {
	return pressed['ArrowDown'];
}

function left() {
	return pressed['ArrowLeft'];
}

function right() {
	return pressed['ArrowRight'];
}

function release(key: string) {
	pressed[key] = false;
}

function releaseArrows() {
	release('ArrowUp');
	release('ArrowDown');
	release('ArrowLeft');
	release('ArrowRight');
}

function releaseSelect() {
	release('KeyX');
	release('Enter');
}

function releaseBack() {
	release('KeyZ');
	release('Backspace');
}

function keyDown(e: KeyboardEvent) {
	if (focused && !e.repeat) {
		pressed[e.code] = true;
	}
}

function keyUp(e: KeyboardEvent) {
	pressed[e.code] = false;
}

function focus() {
	focused = true;
}

function unfocus() {
	focused = false;
}

export {
	pressed,
	selected,
	advance,
	back,
	AorB,
	release,
	releaseSelect,
	releaseBack,
	releaseArrows,
	keyDown,
	keyUp,
	up,
	down,
	left,
	right,
	focus,
	unfocus,
	forceAdvance,
	forceBack
};