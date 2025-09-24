import { getAxisTick } from "../utils/axis";
import Chart, { type RenderOptions as BaseRenderOptions } from "./Chart";

export interface BarData {
	label: string;
	values: { name: string; value: number, color: string }[];
}

interface RenderOptions extends BaseRenderOptions {
	data: BarData[];
	axisColor: string;
	gridColor: string;
}

const CHART_MARGIN = 30;
const AXIS_FONT = '14px Arial';

export default class BarChart extends Chart {
	private data: (BarData & { sum: number })[] = [];
	private axisColor: string = '#FFFFFF';
	private gridColor: string = '#FFFFFF';
	private originX: number = 0;
	private originY: number = 0;
	private intervalX: number = 0;
	private intervalY: number = 0;
	private barWidth: number = 0;
	private axisHeight: number = 0;
	private tick: number = 0;
	private labelTiltAngle: number = 0;
	private minValue: number = 0;
	private maxValue: number = 0;
	private animation: ReturnType<typeof window.requestAnimationFrame> | null = null;
	private focusedIdx: number = -1;

	constructor() {
		super();
		this.container.addEventListener('pointermove', this.handlePointerMove);
	}

	public render(options: RenderOptions) {
		this.data = this.normalizeData(options.data);
		this.axisColor = options.axisColor;
		this.gridColor = options.gridColor;

		this.appendContainerToSlot(options.slot);
		this.setCanvasScale(options);
		this.setStartX();
		this.setXAxisInfo();
		this.setYAxisInfo();
		this.drawAnimated();
	}

	private normalizeData(data: RenderOptions['data']) {
		return data.map(({ values, ...rest }) => ({
			values,
			sum: values.reduce((acc, { value }) => acc + value, 0),
			...rest,
		}));
	}

	private handlePointerMove = (event: PointerEvent) => {
		if (this.animation) {
			return;
		}

		this.renderFocused(event);
	};

	private renderFocused(event: PointerEvent) {
		const { x, y } = this.getPointerPosition(event);
		let focusedIdx = -1;

		if (
			x >= this.originX && x <= this.width - CHART_MARGIN
			&& y >= CHART_MARGIN && y <= this.originY
		) {
			focusedIdx = Math.trunc((x - this.originX) / this.intervalX);
		}

		if (this.focusedIdx === focusedIdx) {
			return;
		}

		this.focusedIdx = focusedIdx;
		this.drawFocused();
	}

	private setStartX() {
		this.ctx.font = AXIS_FONT;
		const buffer = 20;
		const maxValueWidth = Math.max(...this.data.map(({ sum }) => this.ctx.measureText(sum.toString()).width));

		this.originX = maxValueWidth + buffer + CHART_MARGIN;
	}

	private setXAxisInfo() {
		// calculate angle of label with max width
		this.ctx.font = AXIS_FONT;

		const maxLabelWidth = Math.max(...this.data.map(({ label }) => this.ctx.measureText(label).width));
		const fontHeight = 14;
		this.intervalX = (this.width - this.originX - CHART_MARGIN) / this.data.length;
		this.barWidth = this.intervalX / 2;
		this.labelTiltAngle = maxLabelWidth > this.intervalX ? Math.acos(this.intervalX / maxLabelWidth) : 0;

		// calculate adjusted origin y position
		this.originY = this.height - maxLabelWidth * Math.sin(this.labelTiltAngle) - CHART_MARGIN - fontHeight;
	}

	private setYAxisInfo() {
		// calculate min, max value in nice tick
		this.axisHeight = this.originY - CHART_MARGIN;
		const minValue = 0; // fixed with 0
		const maxValue = Math.max(...this.data.map(({ sum }) => sum));
		const delta = maxValue - minValue;
		const bufferedMaxValue = maxValue + delta * 0.1;
		const bufferedMinValue = Math.max(0, minValue - delta * 0.1);
		const axisTick = getAxisTick(bufferedMinValue, bufferedMaxValue, this.axisHeight);

		this.tick = axisTick.tick;
		this.maxValue = axisTick.max;
		this.minValue = axisTick.min;
		this.intervalY = axisTick.interval;
	}

	private drawXAxis() {
		const end = this.width - CHART_MARGIN;

		// draw main line
		this.drawLine({
			from: [this.originX, this.originY],
			to: [end, this.originY],
			width: 0.5,
			color: this.axisColor,
		});

		// draw ticks and grid
		for (let i = 0; i < this.data.length + 1; i++) {
			const x = this.originX + i * this.intervalX;

			this.drawLine({
				from: [x, this.originY],
				to: [x, this.originY + 5],
				width: 0.5,
				color: this.axisColor,
			});

			this.drawLine({
				from: [x, this.originY],
				to: [x, CHART_MARGIN],
				width: 0.5,
				color: this.gridColor,
			});
		}

		// draw labels
		for (let i = 0; i < this.data.length; i++) {
			const { width } = this.ctx.measureText(this.data[i].label);
			const textWidth = width * Math.cos(this.labelTiltAngle);
			const x = this.originX + i * this.intervalX + this.intervalX / 2  - textWidth / 2;

			this.drawText({
				x,
				y: this.originY + 20,
				tiltAngle: this.labelTiltAngle,
				text: this.data[i].label,
				color: this.axisColor,
				font: AXIS_FONT,
				align: 'left',
				baseline: 'middle',
			});
		}
	}

	private drawYAxis() {
		const end = CHART_MARGIN;

		// draw main line
		this.drawLine({
			from: [this.originX, this.originY],
			to: [this.originX, end],
			width: 0.5,
			color: this.axisColor,
		});

		// draw ticks and grid
		for (let y = this.originY - this.intervalY; Math.round(y) >= end; y -= this.intervalY) {
			this.drawLine({
				from: [this.originX, y],
				to: [this.originX - 5, y],
				width: 0.5,
				color: this.axisColor,
			});

			this.drawLine({
				from: [this.originX, y],
				to: [this.width - CHART_MARGIN, y],
				width: 0.5,
				color: this.gridColor,
			});
		}

		// draw labels
		let label = this.minValue;

		for (let y = this.originY; Math.round(y) >= end; y -= this.intervalY) {
			this.drawText({
				x: this.originX - 15,
				y,
				tiltAngle: 0,
				text: label.toString(),
				color: this.axisColor,
				font: AXIS_FONT,
				align: 'right',
				baseline: 'middle',
			});
			label += this.tick;
		}
	}

	private drawBar({
		index,
		ratio,
	}: {
		index: number;
		ratio: number;
	}) {
		const { sum } = this.data[index];
		const values = this.data[index].values.filter(({ value }) => value !== 0);
		const height = this.getBarHeight(index) * ratio;
		const x = this.originX + index * this.intervalX + this.intervalX / 2 - this.barWidth / 2;
		let segmentStart = this.originY;

		for (let i = 0; i < values.length; i++) {
			const { value, color } = values[i];
			const segmentHeight = height * value / sum;

			segmentStart -= segmentHeight;
			this.ctx.fillStyle = color;

			if (i === values.length - 1) {
				this.ctx.beginPath();
				this.ctx.roundRect(x, segmentStart, this.barWidth, segmentHeight, [5, 5, 0, 0]);
				this.ctx.fill();
			} else {
				this.ctx.fillRect(x, segmentStart, this.barWidth, segmentHeight);
			}
		}
	}

	private drawAnimated() {
		this.drawXAxis();
		this.drawYAxis();

		const startTime = Date.now();

		const getAnimationRatio = (t: number) => {
			if (t <= 0.5) {
				return 4 * Math.pow(t, 3);
			} else {
				return 1 - 4 * Math.pow(1 - t, 3);
			}
		};

		const drawBars = () => {
			const t = Math.min((Date.now() - startTime) / 1500, 1);
			const ratio = getAnimationRatio(t);

			for (let i = 0; i < this.data.length; i++) {
				this.drawBar({ index: i, ratio });
			}

			if (t < 1) {
				this.animation = window.requestAnimationFrame(drawBars);
			} else {
				this.animation = null;
			}
		};

		this.animation = window.requestAnimationFrame(drawBars);
	}

	private drawFocused() {
		this.ctx.clearRect(0, 0, this.width, this.height);
		this.drawXAxis();
		this.drawYAxis();

		if (this.focusedIdx === -1) {
			this.hideTooltip();
		}

		for (let i = 0; i < this.data.length; i++) {
			this.ctx.globalAlpha = i === this.focusedIdx || this.focusedIdx === -1 ? 1 : 0.3;
			this.drawBar({ index: i, ratio: 1 });

			if (i === this.focusedIdx) {
				this.showTooltip();
			}
		}

		this.ctx.globalAlpha = 1;
	}

	private showTooltip = () => {
		const data = this.data[this.focusedIdx];
		const values = [ ...data.values ].reverse();

		this.tooltip.innerHTML = /* html */`
			<ul>
				${values.map(({ name, value, color }) => /* html */`
					<li>
						<div class="label">
							<span class="color" style="background-color: ${color};"></span>
							<span>${name}</span>
						</div>
						<div>${value}</div>
					</li>
				`).join('')}
			</ul>
		`;
		this.tooltip.style.display = '';

		const barHeight = this.getBarHeight(this.focusedIdx);
		const y = Math.min(this.originY - barHeight, this.originY - this.tooltip.offsetHeight);
		let x = this.originX + this.focusedIdx * this.intervalX + this.intervalX / 2 + this.barWidth / 2;

		if (x + this.tooltip.offsetWidth > this.width - CHART_MARGIN) {
			x -= this.barWidth + this.tooltip.offsetWidth;
		}

		this.tooltip.style.transform = `translate(${x}px, ${y}px)`;
	};

	private getBarHeight(index: number) {
		const { sum } = this.data[index];

		return (sum - this.minValue) * this.axisHeight / (this.maxValue - this.minValue);
	}

	public cleanup() {
		if (this.animation) {
			window.cancelAnimationFrame(this.animation);
		}
	}
}