import { useEffect, useRef } from 'react';
import Chart, { type BarData } from '../charts/BarChart';
import './chart.css';

export interface Props {
	width: number;
	height: number;
	data: BarData[];
	axisColor: string;
	gridColor: string;
}

export const BarChart = ({ ...props }: Props) => {
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
			axisColor: props.axisColor,
			gridColor: props.gridColor,
		});

		return () => {
			chart.cleanup();
		};
	}, [props]);

	return (
		<div ref={slotRef}/>
	);
};
