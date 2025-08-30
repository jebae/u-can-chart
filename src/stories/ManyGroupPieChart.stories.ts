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

export const ManyGroup: Story = {
	args: {
		width: 500,
		height: 400,
		data: [
			{ label: 'Banana', value: 10, color: '#ffd275' },
			{ label: 'Tomato', value: 20, color: '#db5a42' },
			{ label: 'Melon', value: 30, color: '#07beb8' },
			{ label: 'Blueberry', value: 2, color: '#6ab5b5' },
			{ label: 'Apple', value: 5, color: '#c33149' },
			{ label: 'Orange', value: 15, color: '#f37f3f' },
			{ label: 'Grape', value: 31, color: '#9170d5' },
			{ label: 'Peach', value: 10, color: '#ffc598' },
			{ label: 'Cherry', value: 40, color: '#ff5964' },
			{ label: 'Very strange Strawberry', value: 24, color: '#ff7459' },
			{ label: 'Raspberry', value: 80, color: '#ffa200' },
			{ label: 'Blackberry', value: 200, color: '#4f2581' },
			{ label: 'Watermelon', value: 100, color: '#b51d34' },
			{ label: 'Mango', value: 2, color: '#ffc598' },
			{ label: 'Kiwi', value: 50, color: '#ff5964' },
			{ label: 'Lemon', value: 20, color: '#ff7459' },
			{ label: 'Lime', value: 10, color: '#6ab5b5' },
			{ label: 'Carrot', value: 10, color: '#ffa200' },
			{ label: 'Potato', value: 5, color: '#4f2581' },
			{ label: 'Onion', value: 30, color: '#b51d34' },
		],
		innerRadius: 0.5,
		legendTextColor: '#939FB2',
	},
};
