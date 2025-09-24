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

const COLORS = {
	banana: '#5e60ce',
	tomato: '#48bfe3',
	melon: '#64dfdf',
}

export const Simple: Story = {
	args: {
		width: 500,
		height: 400,
		data: [
			{
				label: 'Korea Republic',
				values: [
					{ name: 'Banana', value: 10, color: COLORS.banana },
				]
			},
			{
				label: 'Vietnam',
				values: [
					{ name: 'Banana', value: 50, color: COLORS.banana },
				]
			},
			{
				label: 'Venezuela',
				values: [
					{ name: 'Banana', value: 30, color: COLORS.banana },
				]
			},
			{
				label: 'China',
				values: [
					{ name: 'Banana', value: 60, color: COLORS.banana },
				]
			},
			{
				label: 'Japan',
				values: [
					{ name: 'Banana', value: 80, color: COLORS.banana },
				]
			},
			{
				label: 'Dominican Republic',
				values: [
					{ name: 'Banana', value: 10, color: COLORS.banana },
				]
			},
			{
				label: 'Mexico',
				values: [
					{ name: 'Banana', value: 20, color: COLORS.banana },
				]
			},
		],
		axisColor: '#939FB2',
		gridColor: '#303947',
	},
};

export const Stack: Story = {
	args: {
		width: 500,
		height: 400,
		data: [
			{
				label: 'Korea Republic',
				values: [
					{ name: 'Banana', value: 10, color: COLORS.banana },
					{ name: 'Tomato', value: 5, color: COLORS.tomato },
					{ name: 'Melon', value: 20, color: COLORS.melon },
				]
			},
			{
				label: 'Vietnam',
				values: [
					{ name: 'Banana', value: 50, color: COLORS.banana },
					{ name: 'Tomato', value: 10, color: COLORS.tomato },
					{ name: 'Melon', value: 5, color: COLORS.melon },
				]
			},
			{
				label: 'Venezuela',
				values: [
					{ name: 'Banana', value: 30, color: COLORS.banana },
					{ name: 'Tomato', value: 24, color: COLORS.tomato },
					{ name: 'Melon', value: 16, color: COLORS.melon },
				]
			},
			{
				label: 'China',
				values: [
					{ name: 'Banana', value: 60, color: COLORS.banana },
					{ name: 'Tomato', value: 0, color: COLORS.tomato },
					{ name: 'Melon', value: 20, color: COLORS.melon },
				]
			},
			{
				label: 'Japan',
				values: [
					{ name: 'Banana', value: 80, color: COLORS.banana },
					{ name: 'Tomato', value: 20, color: COLORS.tomato },
					{ name: 'Melon', value: 10, color: COLORS.melon },
				]
			},
			{
				label: 'Dominican Republic',
				values: [
					{ name: 'Banana', value: 10, color: COLORS.banana },
					{ name: 'Tomato', value: 40, color: COLORS.tomato },
					{ name: 'Melon', value: 0, color: COLORS.melon },
				]
			},
			{
				label: 'Mexico',
				values: [
					{ name: 'Banana', value: 20, color: COLORS.banana },
					{ name: 'Tomato', value: 30, color: COLORS.tomato },
					{ name: 'Melon', value: 30, color: COLORS.melon },
				]
			},
		],
		axisColor: '#939FB2',
		gridColor: '#303947',
	},
};
