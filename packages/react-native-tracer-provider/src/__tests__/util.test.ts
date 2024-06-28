import { HrTime, TimeInput } from '@opentelemetry/api';
import { isAttributes, normalizeTime } from '../index';

describe('normalizeTime', () => {
  it.each([
    { timeInput: undefined, expected: 0 },
    { timeInput: 1718306365001, expected: 1718306365001 },
    {
      timeInput: new Date(Date.UTC(2024, 5, 13, 19, 19, 25, 1)),
      expected: 1718306365001,
    },
    { timeInput: [1718306365, 1000000] as HrTime, expected: 1718306365001 },
  ])(
    '%#',
    ({ timeInput, expected }: { timeInput?: TimeInput; expected: number }) => {
      expect(normalizeTime(timeInput)).toBe(expected);
    }
  );
});

describe('isAttributes', () => {
  it.each([
    { input: { attr: 'foo' }, expected: true },
    { input: {}, expected: true },
    { input: undefined, expected: false },
    { input: new Date(), expected: false },
    { input: 3333, expected: false },
    { input: [213, 123] as HrTime, expected: false },
  ])('%#', ({ input, expected }) => {
    expect(isAttributes(input)).toBe(expected);
  });
});
