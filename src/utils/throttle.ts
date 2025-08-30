// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debounce = <F extends (...args: any[]) => any>(
	fn: F,
	delay: number,
): F => {
	let tid: number | null = null;

	return ((...args: Parameters<F>) => {
		if (tid) {
			window.clearTimeout(tid);
		}

		tid = window.setTimeout(() => {
			fn(...args);
		}, delay);
	}) as F;
};