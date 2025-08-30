import { useEffect, useRef } from 'react';
import Chart, { type PieData } from '../charts/PieChart';
import './chart.css';

export interface Props {
	width: number;
	height: number;
	data: PieData[];
	innerRadius: number;
	legendTextColor: string;
}

export const PieChart = ({ ...props }: Props) => {
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
			innerRadius: props.innerRadius,
			legendTextColor: props.legendTextColor,
		});

		return () => {
			chart.cleanup();
		};
	}, [props]);

	return (
		<div ref={slotRef}/>
	);
};
