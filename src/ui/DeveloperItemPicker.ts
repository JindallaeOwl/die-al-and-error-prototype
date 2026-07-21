import { moveItemPickerSelection, type ItemPickerDirection } from './DeveloperItemPickerRules';

export interface DeveloperItemPickerOption {
  id: string;
  itemNumber: number;
  name: string;
  imageSource: CanvasImageSource;
}

interface DeveloperItemPickerConfig {
  root: HTMLElement;
  grid: HTMLElement;
  dragHandle: HTMLElement;
  resizeHandle: HTMLElement;
  getOptions: () => readonly DeveloperItemPickerOption[];
  onSelect: (option: DeveloperItemPickerOption) => void;
  onClose: () => void;
}

interface ItemPickerWindowInteraction {
  type: 'drag' | 'resize';
  pointerId: number;
  startPointerX: number;
  startPointerY: number;
  startLeft: number;
  startTop: number;
  startWidth: number;
  startHeight: number;
}

interface StoredItemPickerWindowState {
  left: number;
  top: number;
  width: number;
  height: number;
}

const ITEM_MIN_WIDTH = 104;
const WINDOW_STATE_KEY = 'gamzaissac.developer-item-picker.window.v1';
const WINDOW_MARGIN = 8;
const MIN_WINDOW_WIDTH = 360;
const MIN_WINDOW_HEIGHT = 260;

export class DeveloperItemPicker {
  private readonly root: HTMLElement;
  private readonly grid: HTMLElement;
  private readonly dragHandle: HTMLElement;
  private readonly resizeHandle: HTMLElement;
  private readonly getOptions: () => readonly DeveloperItemPickerOption[];
  private readonly onSelect: (option: DeveloperItemPickerOption) => void;
  private readonly onClose: () => void;
  private options: readonly DeveloperItemPickerOption[] = [];
  private buttons: HTMLButtonElement[] = [];
  private selectedIndex = 0;
  private windowInteraction: ItemPickerWindowInteraction | null = null;

  constructor(config: DeveloperItemPickerConfig) {
    this.root = config.root;
    this.grid = config.grid;
    this.dragHandle = config.dragHandle;
    this.resizeHandle = config.resizeHandle;
    this.getOptions = config.getOptions;
    this.onSelect = config.onSelect;
    this.onClose = config.onClose;
    this.root.hidden = true;
    this.restoreWindowState();
    this.root.addEventListener('keydown', this.handleKeyDown);
    this.dragHandle.addEventListener('pointerdown', this.handleDragPointerDown);
    this.resizeHandle.addEventListener('pointerdown', this.handleResizePointerDown);
    window.addEventListener('pointermove', this.handleWindowPointerMove);
    window.addEventListener('pointerup', this.handleWindowPointerUp);
    window.addEventListener('pointercancel', this.handleWindowPointerUp);
    window.addEventListener('resize', this.handleWindowResize);
  }

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  open(): void {
    const selectedItemId = this.options[this.selectedIndex]?.id;
    const nextOptions = this.getOptions();

    if (this.optionsChanged(nextOptions)) {
      this.options = nextOptions;
      this.buttons = this.options.map((option, index) => this.createButton(option, index));
      this.grid.replaceChildren(...this.buttons);
    } else {
      this.options = nextOptions;
    }

    this.selectedIndex = Math.max(
      0,
      selectedItemId ? this.options.findIndex((option) => option.id === selectedItemId) : 0,
    );
    this.root.hidden = false;
    this.updateSelection(true);
    window.requestAnimationFrame(() => {
      if (this.isOpen) {
        this.clampWindowToViewport();
      }
    });
  }

  close(): void {
    if (!this.isOpen) {
      return;
    }

    this.root.hidden = true;
    this.cancelWindowInteraction();
    this.onClose();
  }

  destroy(): void {
    this.root.removeEventListener('keydown', this.handleKeyDown);
    this.dragHandle.removeEventListener('pointerdown', this.handleDragPointerDown);
    this.resizeHandle.removeEventListener('pointerdown', this.handleResizePointerDown);
    window.removeEventListener('pointermove', this.handleWindowPointerMove);
    window.removeEventListener('pointerup', this.handleWindowPointerUp);
    window.removeEventListener('pointercancel', this.handleWindowPointerUp);
    window.removeEventListener('resize', this.handleWindowResize);
    this.cancelWindowInteraction();
    this.root.hidden = true;
    this.grid.replaceChildren();
    this.buttons = [];
    this.options = [];
  }

  private readonly handleDragPointerDown = (event: PointerEvent): void => {
    this.startWindowInteraction(event, 'drag');
  };

  private readonly handleResizePointerDown = (event: PointerEvent): void => {
    this.startWindowInteraction(event, 'resize');
  };

  private readonly handleWindowPointerMove = (event: PointerEvent): void => {
    const interaction = this.windowInteraction;

    if (!interaction || event.pointerId !== interaction.pointerId) {
      return;
    }

    event.preventDefault();
    const deltaX = event.clientX - interaction.startPointerX;
    const deltaY = event.clientY - interaction.startPointerY;

    if (interaction.type === 'drag') {
      const maxLeft = Math.max(
        WINDOW_MARGIN,
        window.innerWidth - interaction.startWidth - WINDOW_MARGIN,
      );
      const maxTop = Math.max(
        WINDOW_MARGIN,
        window.innerHeight - interaction.startHeight - WINDOW_MARGIN,
      );
      this.root.style.left = `${clamp(interaction.startLeft + deltaX, WINDOW_MARGIN, maxLeft)}px`;
      this.root.style.top = `${clamp(interaction.startTop + deltaY, WINDOW_MARGIN, maxTop)}px`;
      return;
    }

    const maxWidth = Math.max(1, window.innerWidth - interaction.startLeft - WINDOW_MARGIN);
    const maxHeight = Math.max(1, window.innerHeight - interaction.startTop - WINDOW_MARGIN);
    const minWidth = Math.min(MIN_WINDOW_WIDTH, maxWidth);
    const minHeight = Math.min(MIN_WINDOW_HEIGHT, maxHeight);
    this.root.style.width = `${clamp(interaction.startWidth + deltaX, minWidth, maxWidth)}px`;
    this.root.style.height = `${clamp(interaction.startHeight + deltaY, minHeight, maxHeight)}px`;
  };

  private readonly handleWindowPointerUp = (event: PointerEvent): void => {
    if (!this.windowInteraction || event.pointerId !== this.windowInteraction.pointerId) {
      return;
    }

    this.cancelWindowInteraction();
    this.saveWindowState();
    this.buttons[this.selectedIndex]?.focus();
  };

  private readonly handleWindowResize = (): void => {
    if (!this.isOpen) {
      return;
    }

    this.clampWindowToViewport();
    this.saveWindowState();
  };

  private startWindowInteraction(event: PointerEvent, type: 'drag' | 'resize'): void {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const rect = this.root.getBoundingClientRect();
    this.root.style.right = 'auto';
    this.root.style.bottom = 'auto';
    this.windowInteraction = {
      type,
      pointerId: event.pointerId,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startLeft: rect.left,
      startTop: rect.top,
      startWidth: rect.width,
      startHeight: rect.height,
    };
    document.body.classList.add('developer-console-adjusting');
  }

  private cancelWindowInteraction(): void {
    this.windowInteraction = null;
    document.body.classList.remove('developer-console-adjusting');
  }

  private clampWindowToViewport(): void {
    const rect = this.root.getBoundingClientRect();
    const maxWidth = Math.max(1, window.innerWidth - WINDOW_MARGIN * 2);
    const maxHeight = Math.max(1, window.innerHeight - WINDOW_MARGIN * 2);
    const width = clamp(rect.width, Math.min(MIN_WINDOW_WIDTH, maxWidth), maxWidth);
    const height = clamp(rect.height, Math.min(MIN_WINDOW_HEIGHT, maxHeight), maxHeight);
    const maxLeft = Math.max(WINDOW_MARGIN, window.innerWidth - width - WINDOW_MARGIN);
    const maxTop = Math.max(WINDOW_MARGIN, window.innerHeight - height - WINDOW_MARGIN);

    this.root.style.right = 'auto';
    this.root.style.bottom = 'auto';
    this.root.style.width = `${width}px`;
    this.root.style.height = `${height}px`;
    this.root.style.left = `${clamp(rect.left, WINDOW_MARGIN, maxLeft)}px`;
    this.root.style.top = `${clamp(rect.top, WINDOW_MARGIN, maxTop)}px`;
  }

  private restoreWindowState(): void {
    try {
      const rawState = window.localStorage.getItem(WINDOW_STATE_KEY);

      if (!rawState) {
        return;
      }

      const state = JSON.parse(rawState) as Partial<StoredItemPickerWindowState>;

      if (![state.left, state.top, state.width, state.height].every(Number.isFinite)) {
        return;
      }

      this.root.style.right = 'auto';
      this.root.style.bottom = 'auto';
      this.root.style.left = `${state.left}px`;
      this.root.style.top = `${state.top}px`;
      this.root.style.width = `${state.width}px`;
      this.root.style.height = `${state.height}px`;
    } catch {
      // The picker still uses its default layout when storage is unavailable.
    }
  }

  private saveWindowState(): void {
    const rect = this.root.getBoundingClientRect();

    try {
      window.localStorage.setItem(
        WINDOW_STATE_KEY,
        JSON.stringify({
          left: Math.round(rect.left),
          top: Math.round(rect.top),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        } satisfies StoredItemPickerWindowState),
      );
    } catch {
      // Moving and resizing still work when storage is unavailable.
    }
  }

  private createButton(option: DeveloperItemPickerOption, index: number): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.itemIndex = `${index}`;
    button.setAttribute('role', 'gridcell');
    button.setAttribute('aria-label', `ID ${option.itemNumber}: ${option.name}`);

    const image = document.createElement('canvas');
    image.className = 'developer-item-icon';
    image.width = 32;
    image.height = 32;
    image.setAttribute('aria-hidden', 'true');
    image.draggable = false;
    const context = image.getContext('2d');

    if (context) {
      context.imageSmoothingEnabled = false;
      context.drawImage(option.imageSource, 0, 0, image.width, image.height);
    }

    const number = document.createElement('span');
    number.className = 'developer-item-number';
    number.textContent = `ID: ${option.itemNumber.toString().padStart(3, '0')}`;

    const name = document.createElement('strong');
    name.textContent = option.name;
    button.append(image, number, name);
    button.addEventListener('pointerenter', () => {
      this.selectedIndex = index;
      this.updateSelection(false);
    });
    button.addEventListener('click', () => this.select(index));
    return button;
  }

  private optionsChanged(nextOptions: readonly DeveloperItemPickerOption[]): boolean {
    return (
      this.options.length !== nextOptions.length ||
      nextOptions.some((option, index) => {
        const previous = this.options[index];
        return (
          !previous ||
          previous.id !== option.id ||
          previous.itemNumber !== option.itemNumber ||
          previous.name !== option.name ||
          previous.imageSource !== option.imageSource
        );
      })
    );
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    const direction = this.getDirection(event.code);

    if (direction) {
      event.preventDefault();
      event.stopPropagation();
      const columns = Math.max(1, Math.floor(this.grid.clientWidth / ITEM_MIN_WIDTH));
      this.selectedIndex = moveItemPickerSelection(
        this.selectedIndex,
        direction,
        this.options.length,
        columns,
      );
      this.updateSelection(true);
      return;
    }

    if (event.code === 'Enter' || event.code === 'Space') {
      event.preventDefault();
      event.stopPropagation();
      this.select(this.selectedIndex);
    }
  };

  private getDirection(code: string): ItemPickerDirection | null {
    if (code === 'ArrowLeft') {
      return 'left';
    }

    if (code === 'ArrowRight') {
      return 'right';
    }

    if (code === 'ArrowUp') {
      return 'up';
    }

    return code === 'ArrowDown' ? 'down' : null;
  }

  private select(index: number): void {
    const option = this.options[index];

    if (option) {
      this.onSelect(option);
    }
  }

  private updateSelection(focus: boolean): void {
    this.buttons.forEach((button, index) => {
      const selected = index === this.selectedIndex;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-selected', `${selected}`);
      button.tabIndex = selected ? 0 : -1;
    });

    const selectedButton = this.buttons[this.selectedIndex];

    if (focus) {
      selectedButton?.focus();
    }

    selectedButton?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
