/**
 * 对象工具函数
 */

/**
 * 判断值是否为非空对象（排除null和数组）
 * @param value 要检查的值
 * @returns 如果是非空对象返回true，否则返回false
 */
export function demoIsObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}