import { isExpanded, filterByScope } from '../src/utils';

test('isExpanded', () => {
  expect(isExpanded(1)).toBe('foo');
  expect(isExpanded(4)).toBe('bar');
  expect(isExpanded(-2)).toBe('bar');
});

test('filterByScope', () => {
  const obj = { workspaceId: '123' };
  expect(filterByScope([obj], null, true)).toEqual([obj]);
  expect(filterByScope([obj], null, false)).toEqual([]);
  expect(filterByScope([obj], { id: '321' }, false)).toEqual([]);
  expect(filterByScope([obj], { id: '123' }, false)).toEqual([obj]);
});
