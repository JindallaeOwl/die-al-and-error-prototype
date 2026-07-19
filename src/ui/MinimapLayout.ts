export interface MinimapCellLayout {
  size: number;
  gap: number;
}

const EXPANDED_MAP_PADDING = 8;
const EXPANDED_GAP_RATIO = 0.25;
const MAX_EXPANDED_CELL_SIZE = 18;

export function calculateExpandedMinimapCellLayout(
  columns: number,
  rows: number,
  panelWidth: number,
  panelHeight: number,
): MinimapCellLayout {
  const safeColumns = Math.max(1, columns);
  const safeRows = Math.max(1, rows);
  const availableWidth = Math.max(1, panelWidth - EXPANDED_MAP_PADDING * 2);
  const availableHeight = Math.max(1, panelHeight - EXPANDED_MAP_PADDING * 2);
  const widthFactor = 1 + (safeColumns - 1) * (1 + EXPANDED_GAP_RATIO);
  const heightFactor = 1 + (safeRows - 1) * (1 + EXPANDED_GAP_RATIO);
  const size = Math.min(
    MAX_EXPANDED_CELL_SIZE,
    availableWidth / widthFactor,
    availableHeight / heightFactor,
  );

  return {
    size,
    gap: Math.max(3, size * EXPANDED_GAP_RATIO),
  };
}
