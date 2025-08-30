import type { Meta, StoryObj } from '@storybook/react-vite';
import { LineChart } from './LineChart';

const meta = {
	title: 'LineChart',
	component: LineChart,
	parameters: {
		layout: 'centered',
	},
	// More on argTypes: https://storybook.js.org/docs/api/argtypes
	argTypes: {
		// backgroundColor: { control: 'color' },
	},
	// Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
	// args: { onClick: fn() },
} satisfies Meta<typeof LineChart>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const MultiLine: Story = {
	args: {
		width: 500,
		height: 400,
		colors: { Banana: '#ffd275', Tomato: '#db5a42' },
		data: [
			{
				label: '2025-01',
				values: [
					{ name: 'Banana', value: 10 },
					{ name: 'Tomato', value: 30 },
				]
			},
			{
				label: '2025-02',
				values: [
					{ name: 'Banana', value: 50 },
					{ name: 'Tomato', value: 40 },
				]
			},
			{
				label: '2025-03',
				values: [
					{ name: 'Banana', value: 30 },
					{ name: 'Tomato', value: 50 },
				]
			},
			{
				label: '2025-04',
				values: [
					{ name: 'Banana', value: 60 },
					{ name: 'Tomato', value: 30 },
				]
			},
			{
				label: '2025-05',
				values: [
					{ name: 'Banana', value: 80 },
					{ name: 'Tomato', value: 20 },
				]
			},
			{
				label: '2025-06',
				values: [
					{ name: 'Banana', value: 10 },
					{ name: 'Tomato', value: 40 },
				]
			},
			{
				label: '2025-07',
				values: [
					{ name: 'Banana', value: 20 },
					{ name: 'Tomato', value: 100 },
				]
			},
		],
		axisColor: '#939FB2',
		gridColor: '#303947',
		lineWidth: 1.5
	},
};
