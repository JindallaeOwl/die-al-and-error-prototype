import { moveItemPickerSelection, type ItemPickerDirection } from './DeveloperItemPickerRules';

export interface DeveloperItemPickerOption {
  id: string;
  itemNumber: number;
  name: string;
  imageUrl: string;
}

interface DeveloperItemPickerConfig {
  root: HTMLElement;
  grid: HTMLElement;
  getOptions: () => readonly DeveloperItemPickerOption[];
  onSelect: (option: DeveloperItemPickerOption) => void;
  onClose: () => void;
}

const ITEM_MIN_WIDTH = 104;

export class DeveloperItemPicker {
  private readonly root: HTMLElement;
  private readonly grid: HTMLElement;
  private readonly getOptions: () => readonly DeveloperItemPickerOption[];
  private readonly onSelect: (option: DeveloperItemPickerOption) => void;
  private readonly onClose: () => void;
  private options: readonly DeveloperItemPickerOption[] = [];
  private buttons: HTMLButtonElement[] = [];
  private selectedIndex = 0;

  constructor(config: DeveloperItemPickerConfig) {
    this.root = config.root;
    this.grid = config.grid;
    this.getOptions = config.getOptions;
    this.onSelect = config.onSelect;
    this.onClose = config.onClose;
    this.root.hidden = true;
    this.root.addEventListener('keydown', this.handleKeyDown);
  }

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  open(): void {
    this.options = this.getOptions();
    this.selectedIndex = 0;
    this.buttons = this.options.map((option, index) => this.createButton(option, index));
    this.grid.replaceChildren(...this.buttons);
    this.root.hidden = false;
    this.updateSelection(true);
  }

  close(): void {
    if (!this.isOpen) {
      return;
    }

    this.root.hidden = true;
    this.grid.replaceChildren();
    this.buttons = [];
    this.options = [];
    this.onClose();
  }

  destroy(): void {
    this.root.removeEventListener('keydown', this.handleKeyDown);
    this.root.hidden = true;
    this.grid.replaceChildren();
    this.buttons = [];
    this.options = [];
  }

  private createButton(option: DeveloperItemPickerOption, index: number): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.itemIndex = `${index}`;
    button.setAttribute('role', 'gridcell');
    button.setAttribute('aria-label', `ID ${option.itemNumber}: ${option.name}`);

    const image = document.createElement('img');
    image.src = option.imageUrl;
    image.alt = '';
    image.draggable = false;

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
