export const getAxisTick = (min: number, max: number, axisHeight: number) => {
	const minTickHeight = 40;
	const minTick = minTickHeight * (max - min) / axisHeight;
	const exp = Math.trunc(Math.log10(minTick));
	const fraction = minTick / (10 ** exp);

	const tick = (() => {
		if (fraction <= 2) {
			return 2 * (10 ** exp);
		} else if (fraction <= 5) {
			return 5 * (10 ** exp);
		} else {
			return 10 ** (exp + 1);
		}
	})();

	max = Math.ceil(max / tick) * tick;
	min = Math.floor(min / tick) * tick;
	const interval = tick * axisHeight / (max - min);

	return {
		tick,
		max,
		min,
		interval,
	};
}