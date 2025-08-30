import Chart, { type RenderOptions as BaseRenderOptions } from "./Chart";

export interface PieData {
	label: string;
	value: number;
	color: string;
}

interface RenderOptions extends BaseRenderOptions {
	data: PieData[];
	innerRadius: number;
	legendTextColor: string;
}

const CHART_MARGIN = 30;
const LEGEND_FONT = '14px Arial';

export default class PieChart extends Chart {
	private data: (PieData & { ratio: number /* 0~1 */ })[] = [];
	private center: { x: number, y: number } = { x: 0, y: 0 };
	private radius: number = 0;
	private innerRadius: number = 0;
	private legendStartX: number = 0;
	private legendTextColor: string = '#FFFFFF';
	private animation: ReturnType<typeof window.requestAnimationFrame> | null = null;
	private focusedIdx: number = -1;

	constructor() {
		super();
		this.container.addEventListener('pointermove', this.handlePointerMove);
	}

	public render(options: RenderOptions) {
		this.data = this.normalizeData(options.data);
		this.innerRadius = options.innerRadius;
		this.legendTextColor = options.legendTextColor;

		this.appendContainerToSlot(options.slot);
		this.setCanvasScale(options);
		this.drawLegend();
		this.setPieInfo();
		this.drawAnimated();
	}

	private normalizeData(data: RenderOptions['data']) {
		const total = data.reduce((sum, { value }) => sum + value, 0);

		return data.map(({ value, ...rest }) => ({
			...rest,
			value,
			ratio: value / total,
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
		const dx = x - this.center.x;
		const dy = y - this.center.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		let focusedIdx = -1;

		if (distance > this.radius) {
			focusedIdx = -1;
		} else {
			let angle = Math.atan2(dy, dx) + Math.PI / 2;

			if (angle < 0) {
				angle += 2 * Math.PI;
			}

			const focusedRatio = angle / (2 * Math.PI);
			let ratio = 0;

			for (let i = 0; i < this.data.length; i++) {
				const piece = this.data[i];

				ratio += piece.ratio;
				if (focusedRatio <= ratio) {
					focusedIdx = i;
					break;
				}
			}
		}

		if (this.focusedIdx === focusedIdx) {
			return;
		}

		this.focusedIdx = focusedIdx;
		this.drawFocused();
	}

	private setPieInfo() {
		this.center = {
			x: (CHART_MARGIN + (this.legendStartX - 20)) / 2,
			y: this.height / 2,
		};
		this.radius = Math.min(this.center.x - CHART_MARGIN, this.center.y - CHART_MARGIN);
	}

	private drawLegend() {
		this.legendStartX = this.width - CHART_MARGIN;
		const legendHeight = 20;
		const groupRightMargin = 10;
		const legendColorMarkerWidth = 10;

		const groups: { maxTextWidth: number, data: PieData[] }[] = [];
		const height = this.height - CHART_MARGIN * 2;
		const countByGroup = Math.floor(height / legendHeight);

		if (countByGroup <= 0) {
			return;
		}

		this.ctx.font = LEGEND_FONT;

		for (let start = 0; start < this.data.length; start += countByGroup) {
			const end = start + countByGroup;
			const group = this.data.slice(start, end);
			let maxTextWidth = group.reduce((max, { label }) => {
				return Math.max(max, this.ctx.measureText(label).width)
			}, 0);

			maxTextWidth = Math.min(maxTextWidth, this.width * 0.2);
			groups.push({ maxTextWidth, data: group });
		}

		groups.reverse();

		let x = this.width - CHART_MARGIN;

		for (const { maxTextWidth, data } of groups) {
			const width = legendColorMarkerWidth + 10 + maxTextWidth + groupRightMargin;

			x -= width;

			let y = CHART_MARGIN;

			for (const { label, color } of data) {
				const ellipsisLabel = this.getEllipsisLabel(label, maxTextWidth, LEGEND_FONT);

				// draw color marker
				this.ctx.fillStyle = color;
				this.ctx.fillRect(x, y, legendColorMarkerWidth, legendColorMarkerWidth);

				// draw text
				this.drawText({
					x: x + legendColorMarkerWidth + 10,
					y: y + legendColorMarkerWidth / 2,
					tiltAngle: 0,
					text: ellipsisLabel,
					color: this.legendTextColor,
					font: LEGEND_FONT,
					align: 'left',
					baseline: 'middle',
				})

				y += legendHeight;
			}
		}

		this.legendStartX = x;
	}

	private drawPie(ratio: number) {
		this.clearChart();
		const innerRadius = this.innerRadius * this.radius;
		let startAngle = Math.PI * 1.5;

		if (this.radius < 0) {
			return;
		}

		for (const piece of this.data) {
			const pieceRatio = Math.min(piece.ratio, ratio);
			const endAngle = startAngle + 2 * Math.PI * pieceRatio;
			const path = new Path2D();

			path.arc(this.center.x, this.center.y, this.radius, startAngle, endAngle);
			path.arc(this.center.x, this.center.y, innerRadius, endAngle, startAngle, true);
			path.closePath();
			this.ctx.fillStyle = piece.color;
			this.ctx.fill(path, 'evenodd');

			startAngle = endAngle;
			ratio -= piece.ratio;

			if (ratio <= 0) {
				break;
			}
		}
	}

	private drawAnimated() {
		const startTime = Date.now();

		const getAnimationRatio = (t: number) => {
			if (t <= 0.5) {
				return 4 * Math.pow(t, 3);
			} else {
				return 1 - 4 * Math.pow(1 - t, 3);
			}
		};

		const drawPie = () => {
			const t = Math.min((Date.now() - startTime) / 1500, 1);
			const ratio = getAnimationRatio(t);

			this.drawPie(ratio);

			if (t < 1) {
				this.animation = window.requestAnimationFrame(drawPie);
			} else {
				this.animation = null;
			}
		}

		this.animation = window.requestAnimationFrame(drawPie);
	}

	private drawFocused() {
		this.drawPie(1);

		if (this.focusedIdx === -1) {
			this.hideTooltip();
			return;
		}

		let startAngle = Math.PI * 1.5;

		for (let i = 0; i < this.data.length; i++) {
			const piece = this.data[i];
			const endAngle = startAngle + 2 * Math.PI * piece.ratio;

			if (this.focusedIdx === i) {
				const path = new Path2D();

				path.arc(this.center.x, this.center.y, this.radius, startAngle, endAngle);
				path.arc(this.center.x, this.center.y, this.innerRadius * this.radius, endAngle, startAngle, true);
				path.closePath();
				this.ctx.lineWidth = 3;
				this.ctx.strokeStyle = '#FFFFFF';
				this.ctx.stroke(path);
				this.showTooltip((startAngle + endAngle) / 2);
				break;
			}

			startAngle = endAngle;
		}
	}

	private showTooltip(angle: number) {
		const { label, color, value, ratio } = this.data[this.focusedIdx];

		this.tooltip.innerHTML = /* html */`
			<ul>
				<li>
					<div class="label">
						<span class="color" style="background-color: ${color};"></span>
						<span>${label}</span>
					</div>
					<div>${value} (${(ratio * 100).toFixed(1)}%)</div>
				</li>
			</ul>
		`;
		this.tooltip.style.display = '';

		const distance = (this.radius + this.innerRadius * this.radius) / 2;
		const y = Math.max(
			Math.min(
				this.center.y + distance * Math.sin(angle),
				this.height - CHART_MARGIN - this.tooltip.offsetHeight,
			),
			CHART_MARGIN,
		);
		const x = Math.min(
			this.center.x + distance * Math.cos(angle),
			this.width - CHART_MARGIN - this.tooltip.offsetWidth,
		);

		this.tooltip.style.transform = `translate(${x}px, ${y}px)`;
	}

	private clearChart() {
		this.ctx.clearRect(0, 0, this.legendStartX, this.height);
	}

	public cleanup() {
		if (this.animation) {
			window.cancelAnimationFrame(this.animation);
		}
	}
}