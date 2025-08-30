import type { Meta, StoryObj } from '@storybook/react-vite';
import { LineChart } from './LineChart';

const meta = {
	title: 'LineChart',
	component: LineChart,
	parameters: {
		layout: 'centered',
	},
} satisfies Meta<typeof LineChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Simple: Story = {
	args: {
		width: 500,
		height: 400,
		colors: { Banana: '#32A575' },
		data: [
			{
				label: '2025-01',
				values: [
					{ name: 'Banana', value: 10 },
				]
			},
			{
				label: '2025-02',
				values: [
					{ name: 'Banana', value: 50 },
				]
			},
			{
				label: '2025-03',
				values: [
					{ name: 'Banana', value: 30 },
				]
			},
			{
				label: '2025-04',
				values: [
					{ name: 'Banana', value: 60 },
				]
			},
			{
				label: '2025-05',
				values: [
					{ name: 'Banana', value: 80 },
				]
			},
			{
				label: '2025-06',
				values: [
					{ name: 'Banana', value: 10 },
				]
			},
			{
				label: '2025-07',
				values: [
					{ name: 'Banana', value: 20 },
				]
			},
		],
		axisColor: '#939FB2',
		gridColor: '#303947',
		lineWidth: 1.5,
	},
};
