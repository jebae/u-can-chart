import { useEffect, useRef } from 'react';
import Chart from '../charts/SeriesBarChart';
import './chart.css';
import { generateSeriesData } from '../utils/mock';

export interface Props {
	width: number;
	height: number;
	count: number;
	maxTimeRange: number;
	range: '5s' | '10s' | '15s' | '30s' | '1m' | '5m' | '10m' | '30m' | '1h';
	drawInterval: '1s' | '5s' | '10s' | '15s' | '30s';
	axisColor: string;
	gridColor: string;
	barColor: string;
	addDataFrequency: number;
}

const parseTime = (range: string) => {
	const unit = range.at(-1);

	switch (unit) {
		case 's':
			return parseInt(range) * 1000;
		case 'm':
			return parseInt(range) * 60 * 1000;
		case 'h':
			return parseInt(range) * 60 * 60 * 1000;
		default:
			return parseInt(range);
	}
}

export const SeriesBarChart = ({ ...props }: Props) => {
	const slotRef = useRef<HTMLDivElement>(null);
	const chartRef = useRef(new Chart());

	useEffect(() => {
		const slot = slotRef.current;
		const chart = chartRef.current;
		let interval;

		if (!slot) {
			return;
		}

		chart.render({
			slot,
			width: props.width,
			height: props.height,
			data: generateSeriesData(props.count, props.maxTimeRange),
			range: parseTime(props.range),
			drawInterval: parseTime(props.drawInterval),
			axisColor: props.axisColor,
			gridColor: props.gridColor,
			barColor: props.barColor,
		});

		interval = window.setInterval(() => {
			const time = Date.now();

			if (Math.random() < 0.5) {
				return;
			}
			chart.addData({ time });
		}, props.addDataFrequency);

		return () => {
			chart.cleanup();
			window.clearInterval(interval);
		};
	}, [props]);

	return (
		<div ref={slotRef}/>
	);
};
