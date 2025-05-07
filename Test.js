import {
  POSITIONS,
  positionTooltip,
  determineAutoPosition,
  applyTooltipPosition,
  findParentDialog,
} from './tooltipPositioner';

describe('Tooltip Positioning - Extended Tests', () => {
  let tooltip, trigger;

  const createRect = (overrides = {}) => ({
    left: 100,
    top: 100,
    right: 200,
    bottom: 130,
    width: 100,
    height: 30,
    ...overrides,
  });

  beforeEach(() => {
    tooltip = {
      getBoundingClientRect: jest.fn(() => createRect({ width: 50, height: 30 })),
      style: {},
      parentElement: null,
    };
    trigger = {
      getBoundingClientRect: jest.fn(() => createRect()),
    };
    global.innerWidth = 1024;
    global.innerHeight = 768;
  });

  test.each([
    [POSITIONS.LEFT],
    [POSITIONS.RIGHT],
    [POSITIONS.TOP],
    [POSITIONS.BOTTOM],
  ])('applyTooltipPosition applies correct styles for %s', (position) => {
    applyTooltipPosition(tooltip, createRect(), createRect({ width: 50, height: 30 }), position);
    expect(tooltip.style.top).toMatch(/px$/);
    expect(tooltip.style.left).toMatch(/px$/);
  });

  test('determineAutoPosition falls back to direction with most space', () => {
    const smallTrigger = createRect({ left: 0, top: 0, right: 10, bottom: 10 });
    const largeTooltip = createRect({ width: 2000, height: 2000 });
    const pos = determineAutoPosition(tooltip, smallTrigger, largeTooltip, POSITIONS.LEFT);
    expect(Object.values(POSITIONS)).toContain(pos);
  });

  test('determineAutoPosition uses preferred if space available', () => {
    const triggerRect = createRect();
    const tooltipRect = createRect({ width: 50 });
    const result = determineAutoPosition(tooltip, triggerRect, tooltipRect, POSITIONS.RIGHT);
    expect(result).toBe(POSITIONS.RIGHT);
  });

  test('determineAutoPosition avoids preferred if no space', () => {
    const triggerRect = createRect({ left: 0, right: 10 });
    const tooltipRect = createRect({ width: 1000 });
    const result = determineAutoPosition(tooltip, triggerRect, tooltipRect, POSITIONS.RIGHT);
    expect(result).not.toBe(POSITIONS.RIGHT);
  });

  test('applyTooltipPosition adjusts for overflow to the right', () => {
    const triggerRect = createRect({ left: 950, width: 100 });
    const tooltipRect = createRect({ width: 200 });
    applyTooltipPosition(tooltip, triggerRect, tooltipRect, POSITIONS.RIGHT);
    expect(parseFloat(tooltip.style.left)).toBeLessThan(0); // Adjusted leftwards
  });

  test('positionTooltip works without preferredPosition', () => {
    const result = positionTooltip({
      tooltipElement: tooltip,
      triggerElement: trigger,
      isAutoPosition: false,
    });
    expect(result).toBe(POSITIONS.RIGHT); // default fallback
  });

  test('positionTooltip uses determineAutoPosition when isAutoPosition is true', () => {
    const result = positionTooltip({
      tooltipElement: tooltip,
      triggerElement: trigger,
      isAutoPosition: true,
      preferredPosition: POSITIONS.TOP,
    });
    expect(Object.values(POSITIONS)).toContain(result);
  });

  test('findParentDialog returns null when no dialog ancestor', () => {
    const el = { parentElement: null };
    expect(findParentDialog(el)).toBeNull();
  });

  test('findParentDialog returns element with role="dialog"', () => {
    const dialogEl = {
      classList: { contains: jest.fn(() => false) },
      getAttribute: jest.fn(() => 'dialog'),
      parentElement: null,
    };
    const el = { parentElement: dialogEl };
    expect(findParentDialog(el)).toBe(dialogEl);
  });

  test('findParentDialog returns element with class "modal"', () => {
    const modalEl = {
      classList: { contains: (cls) => cls === 'modal' },
      getAttribute: () => null,
      parentElement: null,
    };
    const el = { parentElement: modalEl };
    expect(findParentDialog(el)).toBe(modalEl);
  });
});
