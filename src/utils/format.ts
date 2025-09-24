const ONE_THOUSAND = 10 ** 3;
const ONE_MILLION = 10 ** 6;
const ONE_BILLION = 10 ** 9;

export const formatNumber = (number: number) => {
	if (number < ONE_THOUSAND) {
		return number.toString();
	} else if (number < ONE_MILLION) {
		return (number / ONE_THOUSAND).toFixed(0) + 'K';
	} else if (number < ONE_BILLION) {
		return (number / ONE_MILLION).toFixed(0) + 'M';
	} else {
		return (number / ONE_BILLION).toFixed(0) + 'B';
	}
};

export const formatTime = (time: number, format: 'YYYY-MM-DD' | 'HH:mm' | 'HH:mm:ss' | 'YYYY-MM-DD HH:mm:ss') => {
	const date = new Date(time);
	const month = (date.getMonth() + 1).toString().padStart(2, '0');
	const day = date.getDate().toString().padStart(2, '0');
	const hour = date.getHours().toString().padStart(2, '0');
	const minute = date.getMinutes().toString().padStart(2, '0');
	const second = date.getSeconds().toString().padStart(2, '0');

	switch (format) {
		case 'YYYY-MM-DD':
			return `${date.getFullYear()}-${month}-${day}`;
		case 'HH:mm:ss':
			return `${hour}:${minute}:${second}`;
		case 'HH:mm':
			return `${hour}:${minute}`;
		case 'YYYY-MM-DD HH:mm:ss':
		default:
			return `${date.getFullYear()}-${month}-${day} ${hour}:${minute}:${second}`;
	}
}