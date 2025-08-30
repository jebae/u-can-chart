import { useEffect, useRef } from 'react';
import Chart, { type LineData } from '../charts/LineChart';
import './chart.css';

export interface Props {
	width: number;
	height: number;
	data: LineData[];
	colors: Record<string, string>;
	axisColor: string;
	gridColor: string;
	lineWidth: number;
}

export const LineChart = ({ ...props }: Props) => {
	const slotRef = useRef<HTMLDivElement>(null);
	const chartRef = useRef(new Chart());

	useEffect(() => {
		const slot = slotRef.current;
		const chart = chartRef.current;

		if (!slot) {
			return;
		}

		chart.render({
			slot,
			width: props.width,
			height: props.height,
			data: props.data,
			colors: props.colors,
			axisColor: props.axisColor,
			gridColor: props.gridColor,
			lineWidth: props.lineWidth,
		});

		return () => {
			chart.cleanup();
		};
	}, [props]);

	return (
		<div ref={slotRef}/>
	);
};
