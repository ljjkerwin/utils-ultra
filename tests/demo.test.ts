import { demoIsObject } from '../src/demo';

describe('对象工具', () => {
  describe('demoIsObject', () => {
    it('应该正确判断非空对象', () => {
      expect(demoIsObject({})).toBe(true);
      expect(demoIsObject({ a: 1 })).toBe(true);
      expect(demoIsObject({ a: 1, b: { c: 2 } })).toBe(true);
      expect(demoIsObject(new Date())).toBe(true);
      expect(demoIsObject(new RegExp('test'))).toBe(true);
    });

    it('应该正确判断非对象', () => {
      expect(demoIsObject(null)).toBe(false);
      expect(demoIsObject(undefined)).toBe(false);
      expect(demoIsObject('string')).toBe(false);
      expect(demoIsObject(123)).toBe(false);
      expect(demoIsObject(true)).toBe(false);
      expect(demoIsObject(false)).toBe(false);
      expect(demoIsObject([])).toBe(false);
      expect(demoIsObject([1, 2, 3])).toBe(false);
      expect(demoIsObject(() => {})).toBe(false);
    });

    it('应该提供正确的类型守卫', () => {
      const value: unknown = { a: 1 };
      
      if (demoIsObject(value)) {
        // TypeScript 应该推断 value 为 Record<string, unknown>
        expect(typeof value).toBe('object');
        expect(value.a).toBe(1);
      }
    });
  });
});