import type { Meta, StoryObj } from '@storybook/react-vite';
import { BarChart } from './BarChart';

const meta = {
	title: 'BarChart',
	component: BarChart,
	parameters: {
		layout: 'centered',
	},
} satisfies Meta<typeof BarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Simple: Story = {
	args: {
		width: 500,
		height: 400,
		data: [
			{
				label: 'Korea Republic',
				values: [
					{ name: 'Banana', value: 10, color: '#32A575' },
				]
			},
			{
				label: 'Vietnam',
				values: [
					{ name: 'Banana', value: 50, color: '#32A575' },
				]
			},
			{
				label: 'Venezuela',
				values: [
					{ name: 'Banana', value: 30, color: '#32A575' },
				]
			},
			{
				label: 'China',
				values: [
					{ name: 'Banana', value: 60, color: '#32A575' },
				]
			},
			{
				label: 'Japan',
				values: [
					{ name: 'Banana', value: 80, color: '#32A575' },
				]
			},
			{
				label: 'Dominican Republic',
				values: [
					{ name: 'Banana', value: 10, color: '#32A575' },
				]
			},
			{
				label: 'Mexico',
				values: [
					{ name: 'Banana', value: 20, color: '#32A575' },
				]
			},
		],
		axisColor: '#939FB2',
		gridColor: '#303947',
	},
};
