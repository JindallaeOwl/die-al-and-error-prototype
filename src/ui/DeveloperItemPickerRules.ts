export type ItemPickerDirection = 'left' | 'right' | 'up' | 'down';

export function moveItemPickerSelection(
  currentIndex: number,
  direction: ItemPickerDirection,
  itemCount: number,
  columnCount: number,
): number {
  if (itemCount <= 0) {
    return 0;
  }

  const index = Math.min(Math.max(currentIndex, 0), itemCount - 1);
  const columns = Math.max(1, columnCount);

  if (direction === 'left') {
    return (index - 1 + itemCount) % itemCount;
  }

  if (direction === 'right') {
    return (index + 1) % itemCount;
  }

  if (direction === 'up') {
    return index - columns >= 0 ? index - columns : index;
  }

  return index + columns < itemCount ? index + columns : index;
}
