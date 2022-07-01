const Ease = {
	inOutQuad: (t: number) => t < 0.5
		? 2 * t * t
		: 1 - 2 * (t - 1) * (t - 1),
	triangle: (t: number) => {
		t = t - Math.floor(t);
		return t < 0.5
		  ? 2 * t
		  : 2 - 2 * t;
	}
}; 

export default Ease;