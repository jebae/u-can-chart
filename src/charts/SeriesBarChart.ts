import Chart, { type RenderOptions as BaseRenderOptions } from "./Chart";
import { SECOND, MINUTE, HOUR, DAY } from "../../constants/time";
import { getAxisTick } from "../utils/axis";
import { formatNumber, formatTime } from "../utils/format";

export interface Data {
	time: number;
}

interface Group {
	time: number;
	series: Data[];
}

type Snapshot = Record<number, { x: number; height: number; }>;

interface RenderOptions extends BaseRenderOptions {
	data: Data[];
	range: number;
	drawInterval: number;
	axisColor: string;
	gridColor: string;
	barColor: string;
}

const CHART_MARGIN = 30;
const MIN_BAR_WIDTH = 20;
const AXIS_FONT = '14px Arial';
const BAR_MARGIN_RATIO = 0.4 / 2;
const BAR_WIDTH_RATIO = 1 - BAR_MARGIN_RATIO * 2;

const INTERVALS = [
	SECOND,
	5 * SECOND,
	10 * SECOND,
	15 * SECOND,
	30 * SECOND,
	MINUTE,
	5 * MINUTE,
	10 * MINUTE,
	15 * MINUTE,
	30 * MINUTE,
	HOUR,
	2 * HOUR,
	4 * HOUR,
	6 * HOUR,
	12 * HOUR,
	DAY,
	7 * DAY,
	30 * DAY,
]

class SeriesBarChart extends Chart {
	private range: number = 0;
	private interval: number = 0;
	private startTime: number = 0;
	private endTime: number = 0;
	private intervalX: number = 0;
	private intervalY: number = 0;
	private originX: number = 0;
	private originY: number = 0;
	private axisWidth: number = 0;
	private axisHeight: number = 0;
	private tick: number = 0;
	private minValue: number = 0;
	private maxValue: number = 0;
	private drawInterval: number = 0;
	private series: Data[] = [];
	private groups: Group[] = [];
	private snapshot: Snapshot | null = null;
	private axisColor: string = '#FFFFFF';
	private gridColor: string = '#FFFFFF';
	private barColor: string = '#FFFFFF';
	private animation: ReturnType<typeof window.requestAnimationFrame> | null = null;
	private drawIntervalId: number | null = null;
	private focusedIdx: number = -1;

	constructor() {
		super();
		this.container.addEventListener('pointermove', this.handlePointerMove);
	}

	public render(options: RenderOptions) {
		this.series = options.data;
		this.range = options.range;
		this.drawInterval = options.drawInterval;
		this.axisColor = options.axisColor;
		this.gridColor = options.gridColor;
		this.barColor = options.barColor;
		this.snapshot = null;

		this.appendContainerToSlot(options.slot);
		this.setCanvasScale(options);
		this.axisWidth = this.width - CHART_MARGIN * 3;
		this.axisHeight = this.height - CHART_MARGIN * 3;
		this.originX = CHART_MARGIN * 2;
		this.originY = this.height - CHART_MARGIN * 2;
		this.setInterval();
		this.groupByInterval();

		this.drawAnimated();
		this.drawIntervalId = window.setInterval(() => {
			this.drawAnimated();
		}, this.drawInterval);
	}

	private handlePointerMove = (event: PointerEvent) => {
		if (this.series) {
			this.renderFocused(event);
		}
	};

	private renderFocused(event: PointerEvent) {
		const { x, y } = this.getPointerPosition(event);

		if (
			x >= this.originX && x <= this.originX + this.axisWidth
			&& y >= this.originY - this.axisHeight && y <= this.originY
		) {
			this.focusedIdx = Math.trunc((x - this.originX) / this.intervalX);
			this.showTooltip();
		} else {
			this.focusedIdx = -1;
			this.hideTooltip();
		}
	}

	public addData(data: Data) {
		this.series.push(data);
		const groupTime = this.getGroupTime(data);

		if (this.groups.at(-1)?.time === groupTime) {
			this.groups.at(-1)?.series.push(data);
		} else {
			this.groups.push({ time: groupTime, series: [data] });
		}
	}

	private setInterval() {
		let barCounts = Math.floor(this.axisWidth / MIN_BAR_WIDTH);
		const rawInterval = this.range / barCounts;

		this.interval = INTERVALS.find(interval => {
			return rawInterval <= interval && this.range % interval === 0;
		}) ?? (this.range / 2);
	}

	private setXAxisInfo() {
		const barCounts = this.range / this.interval;
		const now = Date.now();

		this.endTime = Math.ceil(now / this.interval) * this.interval;
		this.startTime = this.endTime - this.range + this.interval;

		// axisWidth : barCounts = intervalX : 1
		this.intervalX = this.axisWidth / barCounts;
	}

	private setYAxisInfo(groups: Group[]) {
		const minValue = 0;
		const maxValue = Math.max(...groups.map(group => group.series.length));
		const delta = maxValue - minValue;
		const bufferedMaxValue = maxValue + delta * 0.1;
		const bufferedMinValue = Math.max(0, minValue - delta * 0.1);
		const axisTick = getAxisTick(bufferedMinValue, bufferedMaxValue, this.axisHeight);

		this.minValue = axisTick.min;
		this.maxValue = axisTick.max;
		this.intervalY = axisTick.interval;
		this.tick = axisTick.tick;
	}

	private getGroupTime(data: Data) {
		return Math.ceil(data.time / this.interval) * this.interval;
	}

	private groupByInterval() {
		this.groups = this.series.reduce((groups: Group[], data) => {
			const groupTime = this.getGroupTime(data);

			if (groups.at(-1)?.time === groupTime) {
				groups.at(-1)?.series.push(data);
			} else {
				groups.push({ time: groupTime, series: [data] });
			}
			return groups;
		}, []);
	}

	private getTimeFormat() {
		if (this.interval < MINUTE) {
			return 'HH:mm:ss';
		} else if (this.interval < DAY) {
			return 'HH:mm';
		} else {
			return 'YYYY-MM-DD';
		}
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

		// draw labels
		const timeFormat = this.getTimeFormat();
		let prevLabelEndX = 0;

		for (let time = this.startTime, i=0; time <= this.endTime; time += this.interval, i++) {
			const text = formatTime(time, timeFormat);
			const { width } = this.ctx.measureText(text);
			const x = this.originX + i * this.intervalX + this.intervalX / 2 - width / 2;
			const labelEndX = x + width;

			if (this.originX <= x && prevLabelEndX <= x && labelEndX <= end) {
				this.drawText({
					x,
					y: this.originY + 20,
					tiltAngle: 0,
					text,
					color: this.axisColor,
					font: AXIS_FONT,
					align: 'left',
					baseline: 'middle',
				});
				prevLabelEndX = labelEndX;
			}
		}
	}

	private drawYAxis() {
		const end = CHART_MARGIN;

		// draw main line
		this.drawLine({
			from: [this.originX, this.originY],
			to: [this.originX, this.originY - this.axisHeight],
			width: 0.5,
			color: this.axisColor,
		});

		// draw ticks and grid
		for (let y = this.originY - this.intervalY; Math.floor(y) >= end; y -= this.intervalY) {
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

		for (let y = this.originY; Math.floor(y) >= end; y -= this.intervalY) {
			this.drawText({
				x: this.originX - 15,
				y,
				tiltAngle: 0,
				text: formatNumber(label),
				color: this.axisColor,
				font: AXIS_FONT,
				align: 'right',
				baseline: 'middle',
			});
			label += this.tick;
		}
	}

	private getTargetGroups(startTime: number, endTime: number) {
		const groups: Group[] = [];

		for (let idx = this.groups.length - 1; idx >= 0; idx--) {
			const group = this.groups[idx];

			if (group.time < startTime) {
				return groups;
			}

			if (group.time <= endTime) {
				groups.push(group);
			}
		}
		return groups;
	}

	private getSnapshot(groups: Group[], startTime: number) {
		const snapshot: Snapshot = {};

		for (const group of groups) {
			snapshot[group.time] = {
				// (group.time - this.startTime) : x = this.interval : this.intervalX
				x: (group.time - startTime) * this.intervalX / this.interval
					+ this.intervalX * BAR_MARGIN_RATIO,
				// (group.series.length - this.minValue) : height = (this.maxValue - this.minValue) : this.axisHeight
				height: (group.series.length - this.minValue) * this.axisHeight / (this.maxValue - this.minValue),
			}
		}

		return snapshot;
	}

	private coalescePrevSnapshot(prevSnapshot: Snapshot | null, curSnapshot: Snapshot, startTime: number) {
		if (!prevSnapshot) {
			return Object.entries(curSnapshot).reduce<Snapshot>((snapshot, [time, cur]) => {
				snapshot[parseInt(time)] = { x: cur.x, height: 0 };
				return snapshot;
			}, {})
		}

		const coalsceSnapshot: Snapshot = { ...prevSnapshot };

		for (const time of Object.keys(curSnapshot)) {
			const numTime = parseInt(time);

			if (!prevSnapshot[numTime]) {
				coalsceSnapshot[numTime] = {
					// (group.time - this.startTime) : x = this.interval : this.intervalX
					x: (numTime - startTime) * this.intervalX / this.interval
						+ this.intervalX * BAR_MARGIN_RATIO,
					height: 0,
				}
			}
		}

		return coalsceSnapshot;
	}

	private drawAnimated() {
		let prevSnapshot = this.snapshot;
		const prevStartTime = this.startTime;
		const animationStartTime = Date.now();

		this.setXAxisInfo();
		const targetGroups = this.getTargetGroups(prevStartTime || this.startTime, this.endTime);
		this.setYAxisInfo(targetGroups);
		const curSnapshot = this.getSnapshot(targetGroups, this.startTime);
		prevSnapshot = this.coalescePrevSnapshot(prevSnapshot, curSnapshot, prevStartTime);

		if (this.focusedIdx >= 0) {
			this.showTooltip();
		}

		const draw = () => {
			// linear animation
			const t = Math.min((Date.now() - animationStartTime) / 200, 1);

			this.ctx.clearRect(0, 0, this.width, this.height);
			this.drawXAxis();
			this.drawYAxis();
			this.drawBars(curSnapshot, prevSnapshot, t);

			if (t < 1) {
				this.animation = window.requestAnimationFrame(draw);
			} else {
				this.animation = null;
				this.snapshot = curSnapshot;
			}
		}
		this.animation = window.requestAnimationFrame(draw);
	}

	private drawBars(snapshot: Snapshot, prevSnapshot: Snapshot, t: number) {
		const fullWidth = this.intervalX * BAR_WIDTH_RATIO;

		Object.entries(snapshot).forEach(([time, cur]) => {
			const numTime = parseInt(time);
			const prev = prevSnapshot[numTime];
			let x = prev.x + (cur.x - prev.x) * t;
			let endX = x + fullWidth;

			if (x >= this.axisWidth || endX <= 0) {
				return;
			}

			x = Math.max(0, x);
			endX = Math.max(0, Math.min(this.axisWidth, endX));

			const height = prev.height + (cur.height - prev.height) * t;

			this.ctx.fillStyle = this.barColor;
			this.ctx.fillRect(
				this.originX + x,
				this.originY - height,
				endX - x,
				height,
			);
		});
	}

	private showTooltip() {
		const focusedTime = this.startTime + this.focusedIdx * this.interval;
		const group = this.groups.find(({ time }) => time === focusedTime);

		this.tooltip.innerHTML = /* html */`
			<p class="title">${formatTime(focusedTime, 'YYYY-MM-DD HH:mm:ss')}</p>
			<ul>
				<li>
					<div class="label">
						<span>count</span>
					</div>
					<div>${group?.series.length ?? 0}</div>
				</li>
			</ul>
		`;
		this.tooltip.style.display = '';

		const barWidth = this.intervalX * BAR_WIDTH_RATIO;
		let x = this.originX + this.focusedIdx * this.intervalX + this.intervalX / 2 + barWidth / 2;
		const height = this.snapshot?.[group?.time ?? 0]?.height ?? 0
		const y = Math.min(this.originY - height, this.originY - this.tooltip.offsetHeight);

		if (x + this.tooltip.offsetWidth > this.width - CHART_MARGIN) {
			x -= barWidth + this.tooltip.offsetWidth;
		}

		this.tooltip.style.transform = `translate(${x}px, ${y}px)`;
	}

	public cleanup() {
		if (this.animation) {
			window.cancelAnimationFrame(this.animation);
		}
		if (this.drawIntervalId) {
			window.clearInterval(this.drawIntervalId);
		}
		this.snapshot = null;
	}
}

export default SeriesBarChart;