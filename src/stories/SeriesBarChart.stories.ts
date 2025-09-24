import type { Meta, StoryObj } from '@storybook/react-vite';
import { SeriesBarChart } from './SeriesBarChart';
import { MINUTE, SECOND } from '../../constants/time';

const meta = {
	title: 'SeriesBarChart',
	component: SeriesBarChart,
	parameters: {
		layout: 'centered',
	},
} satisfies Meta<typeof SeriesBarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Simple: Story = {
	args: {
		width: 800,
		height: 400,
		count: 100,
		maxTimeRange: 2 * MINUTE,
		range: '1m',
		drawInterval: '1s',
		axisColor: '#939FB2',
		gridColor: '#303947',
		barColor: '#32A576',
		addDataFrequency: 500,
	},
};

export const HighFrequency: Story = {
	args: {
		width: 800,
		height: 400,
		count: 100,
		maxTimeRange: 10 * SECOND,
		range: '30s',
		drawInterval: '1s',
		axisColor: '#939FB2',
		gridColor: '#303947',
		barColor: '#32A576',
		addDataFrequency: 100,
	},
};

export const LowFrequency: Story = {
	args: {
		width: 800,
		height: 400,
		count: 300,
		maxTimeRange: 30 * MINUTE,
		range: '30m',
		drawInterval: '1s',
		axisColor: '#939FB2',
		gridColor: '#303947',
		barColor: '#32A576',
		addDataFrequency: SECOND,
	},
};