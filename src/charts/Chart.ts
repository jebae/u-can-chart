export interface RenderOptions {
	slot: HTMLElement;
	width: number;
	height: number;
}

export default class Chart {
  private slot: HTMLElement | null = null;
	private canvas: HTMLCanvasElement;
	protected ctx: CanvasRenderingContext2D;
	protected container: HTMLElement;
	protected tooltip: HTMLElement;
	protected width: number = 0;
	protected height: number = 0;

	constructor() {
		this.container = this.createContainer();
		this.tooltip = this.createTooltip();
		this.canvas = document.createElement('canvas');
		const ctx = this.canvas.getContext('2d');

		if (!ctx) {
			throw new Error('Failed to get canvas context');
		}

		this.ctx = ctx;
		this.container.appendChild(this.canvas);
		this.container.appendChild(this.tooltip);
	}

	protected createContainer() {
		const container = document.createElement('div');

		container.className = 'chart-container';
		return container;
	}

	protected createTooltip() {
		const tooltip = document.createElement('div');

		tooltip.className = 'chart-tooltip';
		tooltip.style.display = 'none';
		return tooltip;
	}

	protected setCanvasScale(options: RenderOptions) {
		this.width = options.width;
		this.height = options.height;
		this.canvas.style.width = `${this.width}px`;
		this.canvas.style.height = `${this.height}px`;
		this.canvas.width = Math.floor(this.width * window.devicePixelRatio);
		this.canvas.height = Math.floor(this.height * window.devicePixelRatio);
		this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
	}

	protected appendContainerToSlot(slot: HTMLElement) {
		this.slot = slot;

		if (!this.slot.contains(this.container)) {
			this.slot.appendChild(this.container);
		}
	}

	protected hideTooltip() {
		this.tooltip.style.display = 'none';
	}

	protected getPointerPosition(event: PointerEvent) {
		const containerRect = this.container.getBoundingClientRect();
		const x = event.clientX - containerRect.left;
		const y = event.clientY - containerRect.top;

		return { x, y };
	}

	protected drawLine({
		from,
		to,
		width,
		color,
		dash,
	}: {
		from: [number, number],
		to: [number, number],
		width: number,
		color: string,
		dash?: [number, number],
	}) {
		this.ctx.lineWidth = width;
		this.ctx.strokeStyle = color;
		if (dash) {
			this.ctx.setLineDash(dash);
		}
		this.ctx.beginPath();
		this.ctx.moveTo(from[0], from[1]);
		this.ctx.lineTo(to[0], to[1]);
		this.ctx.stroke();
		if (dash) {
			this.ctx.setLineDash([]);
		}
	}

	protected drawText({
		x,
		y,
		tiltAngle,
		text,
		color,
		font,
		align,
		baseline,
	}: {
		x: number;
		y: number;
		tiltAngle: number;
		text: string;
		color: string;
		font: string;
		align: CanvasTextAlign;
		baseline: CanvasTextBaseline;
	}) {
		this.ctx.fillStyle = color;
		this.ctx.font = font;
		this.ctx.textAlign = align;
		this.ctx.textBaseline = baseline;
		this.ctx.save();
		this.ctx.translate(x, y);
		this.ctx.rotate(tiltAngle);
		this.ctx.fillText(text, 0, 0);
		this.ctx.restore();
	}

	protected drawCircle({
		x,
		y,
		radius,
		color,
		opacity = 1.0,
	}: {
		x: number;
		y: number;
		radius: number;
		color: string;
		opacity?: number;
	}) {
		this.ctx.globalAlpha = opacity;
		this.ctx.beginPath();
		this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
		this.ctx.fillStyle = color;
		this.ctx.fill();
		this.ctx.globalAlpha = 1.0;
	}

	protected getEllipsisLabel(label: string, maxWidth: number, font: string) {
		const prevFont = this.ctx.font;

		this.ctx.font = font;

		while (this.ctx.measureText(label).width > maxWidth) {
			const shortLabel = `${label.slice(0, -2)}…`;

			if (shortLabel === '…') {
				break;
			}
			label = shortLabel;
		}

		this.ctx.font = prevFont;
		return label;
	}
}