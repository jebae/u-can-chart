import type { Meta, StoryObj } from '@storybook/react-vite';
import { PieChart } from './PieChart';

const meta = {
	title: 'PieChart',
	component: PieChart,
	parameters: {
		layout: 'centered',
	},
} satisfies Meta<typeof PieChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Simple: Story = {
	args: {
		width: 500,
		height: 400,
		data: [
			{ label: 'Melon', value: 30, color: '#07beb8' },
			{ label: 'Grape', value: 30, color: '#9170d5' },
			{ label: 'Tomato', value: 20, color: '#db5a42' },
			{ label: 'Orange', value: 15, color: '#f37f3f' },
			{ label: 'Banana', value: 10, color: '#ffd275' },
			{ label: 'Apple', value: 5, color: '#c33149' },
		],
		innerRadius: 0,
		legendTextColor: '#939FB2',
	},
};
