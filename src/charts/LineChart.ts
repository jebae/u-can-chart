import { getAxisTick } from "../utils/axis";
import Chart, { type RenderOptions as BaseRenderOptions } from "./Chart";

export interface LineData {
	label: string;
	values: { name: string; value: number }[];
}

interface Series {
	color: string;
	values: (number | null)[];
}

interface RenderOptions extends BaseRenderOptions {
	data: LineData[];
	colors: Record<string, string>;
	axisColor: string;
	gridColor: string;
	lineWidth: number;
}

const CHART_MARGIN = 30;
const AXIS_FONT = '14px Arial';
const DOT_RADIUS = 4;
const FOCUSED_DOT_RADIUS = 8;

export default class LineChart extends Chart {
	private data: LineData[] = [];
	private seriesMap: Record<string, Series> = {};
	private axisColor: string = '#FFFFFF';
	private gridColor: string = '#FFFFFF';
	private lineWidth: number = 1;
	private colors: Record<string, string> = {};
	private originX: number = 0;
	private endX: number = 0;
	private originY: number = 0;
	private intervalX: number = 0;
	private intervalY: number = 0;
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
		this.data = options.data;
		this.colors = options.colors;
		this.axisColor = options.axisColor;
		this.gridColor = options.gridColor;
		this.lineWidth = options.lineWidth;
		this.seriesMap = this.getSeriesMap(options.data);

		this.appendContainerToSlot(options.slot);
		this.setCanvasScale(options);
		this.setStartX();
		this.setXAxisInfo();
		this.setYAxisInfo();
		this.drawAnimated();
	}

	private getSeriesMap(data: RenderOptions['data']) {
		const seriesMap: Record<string, Series> = {};

		for (let i=0; i < data.length; i++) {
			const { values } = data[i];

			for (const { name, value } of values) {
				if (!seriesMap[name]) {
					seriesMap[name] = {
						color: this.colors[name],
						values: new Array(data.length).fill(null),
					};
				}

				seriesMap[name].values[i] = value;
			}
		}

		return seriesMap;
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
			x >= this.originX && x <= this.endX
			&& y >= CHART_MARGIN && y <= this.originY
		) {
			focusedIdx = Math.round((x - this.originX) / this.intervalX);
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
		const maxValueWidth = Math.max(
			...this.data.map(({ values }) => {
				return Math.max(
					...values.map(({ value }) => this.ctx.measureText(value.toString()).width)
				);
			})
		);

		this.originX = maxValueWidth + buffer + CHART_MARGIN;
	}

	private setXAxisInfo() {
		// calculate angle of label with max width
		this.ctx.font = AXIS_FONT;

		const maxLabelWidth = Math.max(...this.data.map(({ label }) => this.ctx.measureText(label).width));
		const fontHeight = 14;
		const lastLabelWidth = this.ctx.measureText(this.data[this.data.length - 1].label).width;

		this.endX = this.width - CHART_MARGIN - lastLabelWidth / 2;
		this.intervalX = (this.endX - this.originX) / (this.data.length - 1);
		this.labelTiltAngle = maxLabelWidth > this.intervalX ? Math.acos(this.intervalX / maxLabelWidth) : 0;

		// calculate adjusted origin y position
		this.originY = this.height - maxLabelWidth * Math.sin(this.labelTiltAngle) - CHART_MARGIN - fontHeight;
	}

	private setYAxisInfo() {
		// calculate min, max value in nice tick
		this.axisHeight = this.originY - CHART_MARGIN;
		const minValue = Math.min(
			...this.data.map(({ values }) => {
				const minValue = Math.min(...values.map(({ value }) => value));
				return minValue;
			}),
			0,
		);
		const maxValue = Math.max(
			...this.data.map(({ values }) => {
				const maxValue = Math.max(...values.map(({ value }) => value));
				return maxValue;
			})
		);
		const delta = maxValue - minValue;
		const bufferedMaxValue = maxValue + delta * 0.1;
		const bufferedMinValue = minValue < 0
			? minValue - delta * 0.1
			: 0;
		const axisTick = getAxisTick(bufferedMinValue, bufferedMaxValue, this.axisHeight);

		this.tick = axisTick.tick;
		this.maxValue = axisTick.max;
		this.minValue = axisTick.min;
		this.intervalY = axisTick.interval;
	}

	private drawXAxis() {
		// draw main line
		this.drawLine({
			from: [this.originX, this.originY],
			to: [this.endX, this.originY],
			width: 0.5,
			color: this.axisColor,
		});

		// draw ticks and grid
		for (let i = 0; i < this.data.length; i++) {
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
			const x = this.originX + i * this.intervalX - textWidth / 2;

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
				to: [this.endX, y],
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

	private drawSeries({
		series: { color, values },
		endIndex,
	}: {
		series: Series,
		endIndex: number
	}) {
		this.ctx.lineWidth = 1;
		this.ctx.strokeStyle = color;
		const completeDrawingIndex = Math.floor(endIndex);
		let i = 0;
		let x = 0;
		let y = 0;

		while (i <= completeDrawingIndex) {
			while (values[i] === null && i <= completeDrawingIndex) {
				i++;
			}

			if (i > completeDrawingIndex) {
				break;
			}

			x = this.originX + i * this.intervalX;
			y = this.getY(values[i] as number);
			this.drawCircle({ x, y, radius: DOT_RADIUS, color });

			i++;

			while (values[i] !== null && i <= completeDrawingIndex) {
				const prevX = x;
				const prevY = y;

				x += this.intervalX;
				y = this.getY(values[i] as number);
				this.drawLine({
					from: [prevX, prevY],
					to: [x, y],
					width: this.lineWidth,
					color,
				});
				this.drawCircle({ x, y, radius: 4, color });
				i++;
			}
		}

		// draw partial line
		if (completeDrawingIndex < endIndex && values[i] !== null && values[i - 1] !== null) {
			const y1 = y;
			const y2 = this.getY(values[i] as number);
			const slope = (y2 - y1) / this.intervalX;
			const yIntercept = y2 - slope * (x + this.intervalX);
			const toX = this.originX + endIndex * this.intervalX;
			const toY = slope * toX + yIntercept;

			this.drawCircle({ x, y, radius: 4, color });
			this.drawLine({
				from: [x, y],
				to: [toX, toY],
				width: this.lineWidth,
				color,
			});
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

		const draw = () => {
			const t = Math.min((Date.now() - startTime) / 1500, 1);
			const ratio = getAnimationRatio(t);
			const endIndex = (this.data.length - 1) * ratio;

			this.clearChart();

			for (const series of Object.values(this.seriesMap)) {
				this.drawSeries({ series, endIndex })
			}

			if (t < 1) {
				this.animation = window.requestAnimationFrame(draw);
			} else {
				this.animation = null;
			}
		};

		this.animation = window.requestAnimationFrame(draw);
	}

	private drawFocused() {
		this.clearChart();

		for (const series of Object.values(this.seriesMap)) {
			this.drawSeries({ series, endIndex: this.data.length - 1 });
		}

		if (this.focusedIdx === -1) {
			this.hideTooltip();
			return;
		}

		const focusedX = this.originX + this.focusedIdx * this.intervalX;

		// draw focused dot
		for (const { name, value } of this.data[this.focusedIdx].values) {
			if (typeof value === 'number') {
				const y = this.getY(value);

				this.drawCircle({
					x: focusedX,
					y, radius: FOCUSED_DOT_RADIUS,
					color: this.colors[name],
					opacity: 0.4
				});
			}
		}

		// draw guide line
		this.drawLine({
			from: [focusedX, this.originY],
			to: [focusedX, CHART_MARGIN],
			width: 0.5,
			color: this.axisColor,
			dash: [5, 10],
		});

		this.showTooltip();
	}

	private showTooltip = () => {
		const { label, values } = this.data[this.focusedIdx];

		this.tooltip.innerHTML = /* html */`
			<p class="title">${label}</p>
			<ul>
				${values.map(({ name, value }) => /* html */`
					<li>
						<div class="label">
							<span class="color" style="background-color: ${this.colors[name]};"></span>
							<span>${name}</span>
						</div>
						<div>${value}</div>
					</li>
				`).join('')}
			</ul>
		`;
		this.tooltip.style.display = '';

		const average = values.reduce((sum, { value }) => sum + value, 0) / values.length;
		const y = Math.max(
			Math.min(
				this.getY(average) - this.tooltip.offsetHeight / 2,
				this.originY - this.tooltip.offsetHeight
			),
			CHART_MARGIN
		);
		let x = this.originX + this.focusedIdx * this.intervalX + FOCUSED_DOT_RADIUS;

		if (x + this.tooltip.offsetWidth > this.width - CHART_MARGIN) {
			x -= this.tooltip.offsetWidth + FOCUSED_DOT_RADIUS;
		}

		this.tooltip.style.transform = `translate(${x}px, ${y}px)`;
	};

	private getY(value: number) {
		return this.originY - (value - this.minValue) * this.axisHeight / (this.maxValue - this.minValue);
	}

	private clearChart() {
		this.ctx.clearRect(0, 0, this.width, this.height);
		this.drawXAxis();
		this.drawYAxis();
	}

	public cleanup() {
		if (this.animation) {
			window.cancelAnimationFrame(this.animation);
		}
	}
}
