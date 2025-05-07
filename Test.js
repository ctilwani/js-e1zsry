import {
  POSITIONS,
  positionTooltip,
  determineAutoPosition,
  applyTooltipPosition,
} from './tooltipPositioner';

describe('Tooltip Positioning', () => {
  let tooltip, trigger;

  beforeEach(() => {
    tooltip = {
      getBoundingClientRect: jest.fn(() => ({ width: 50, height: 30 })),
      style: {},
    };
    trigger = {
      getBoundingClientRect: jest.fn(() => ({
        left: 100,
        right: 200,
        top: 100,
        bottom: 130,
        width: 100,
        height: 30,
      })),
    };
    window.innerWidth = 1024;
    window.innerHeight = 768;
  });

  test('returns preferredPosition when tooltip or trigger is missing', () => {
    expect(positionTooltip({ tooltipElement: null, triggerElement: null, preferredPosition: POSITIONS.LEFT }))
      .toBe(POSITIONS.LEFT);
  });

  test('returns preferredPosition if autoPosition is false', () => {
    const result = positionTooltip({
      tooltipElement: tooltip,
      triggerElement: trigger,
      preferredPosition: POSITIONS.RIGHT,
      isAutoPosition: false,
    });
    expect(result).toBe(POSITIONS.RIGHT);
  });

  test('returns an available direction when preferred position has no space', () => {
    tooltip.getBoundingClientRect = jest.fn(() => ({ width: 2000, height: 2000 }));
    const result = positionTooltip({
      tooltipElement: tooltip,
      triggerElement: trigger,
      preferredPosition: POSITIONS.RIGHT,
      isAutoPosition: true,
    });
    expect(Object.values(POSITIONS)).toContain(result);
  });

  test('applyTooltipPosition sets correct style for RIGHT', () => {
    const triggerRect = trigger.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    applyTooltipPosition(tooltip, triggerRect, tooltipRect, POSITIONS.RIGHT);

    expect(tooltip.style.top).toMatch(/px$/);
    expect(tooltip.style.left).toMatch(/px$/);
  });

  test('determineAutoPosition prefers available preferred direction', () => {
    const triggerRect = trigger.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    const pos = determineAutoPosition(tooltip, triggerRect, tooltipRect, POSITIONS.LEFT);
    expect(Object.values(POSITIONS)).toContain(pos);
  });
});
