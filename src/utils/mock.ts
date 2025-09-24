export const generateSeriesData = (count: number, maxTimeRange: number) => {
	const now = Date.now();
	const data = [];

	for (let i = 0; i < count; i++) {
		const randomTime = Math.random() * maxTimeRange;
		data.push({ time: now - randomTime });
	}

	return data.sort((a, b) => a.time - b.time);
}
