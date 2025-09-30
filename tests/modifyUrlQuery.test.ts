import modifyUrlQuery from '../src/modifyUrlQuery';
import { UrlQueryType } from '../src/parseQueryString';

describe('URL查询参数修改工具', () => {
  describe('modifyUrlQuery', () => {
    it('应该正确添加新的查询参数', () => {
      const result = modifyUrlQuery('https://example.com', { new: 'value' });
      expect(result).toBe('https://example.com?new=value');
    });

    it('应该正确更新现有查询参数', () => {
      const result = modifyUrlQuery('https://example.com?old=1', { old: '2' });
      expect(result).toBe('https://example.com?old=2');
    });

    it('应该正确添加和更新查询参数', () => {
      const result = modifyUrlQuery('https://example.com?old=1', { new: 'value', old: '2' });
      expect(result).toBe('https://example.com?old=2&new=value');
    });

    it('应该正确删除特定字段（传入undefined）', () => {
      const result = modifyUrlQuery('https://example.com?remove=1&keep=2', { remove: undefined } as unknown as UrlQueryType);
      expect(result).toBe('https://example.com?keep=2');
    });

    it('应该正确删除所有主查询参数（传入null）', () => {
      const result = modifyUrlQuery('https://example.com?param1=1&param2=2', null);
      expect(result).toBe('https://example.com');
    });

    it('应该正确处理hash查询参数的添加', () => {
      const result = modifyUrlQuery('https://example.com#/path', undefined, { param: 'value' });
      expect(result).toBe('https://example.com#/path?param=value');
    });

    it('应该正确更新hash查询参数', () => {
      const result = modifyUrlQuery('https://example.com#/path?old=1', undefined, { old: '2' });
      expect(result).toBe('https://example.com#/path?old=2');
    });

    it('应该正确添加和更新hash查询参数', () => {
      const result = modifyUrlQuery('https://example.com#/path?old=1', undefined, { new: 'value', old: '2' });
      expect(result).toBe('https://example.com#/path?old=2&new=value');
    });

    it('应该正确删除hash中的特定字段（传入undefined）', () => {
      const result = modifyUrlQuery('https://example.com#/path?remove=1&keep=2', undefined, { remove: undefined } as unknown as UrlQueryType);
      expect(result).toBe('https://example.com#/path?keep=2');
    });

    it('应该正确删除所有hash查询参数（传入null）', () => {
      const result = modifyUrlQuery('https://example.com#/path?param=1', undefined, null);
      expect(result).toBe('https://example.com#/path');
    });

    it('应该同时处理主查询参数和hash查询参数', () => {
      const result = modifyUrlQuery('https://example.com?main=1#/path?hash=1', { main: '2', new: 'value' }, { hash: '2', newHash: 'value' });
      expect(result).toBe('https://example.com?main=2&new=value#/path?hash=2&newHash=value');
    });

    it('应该正确处理相对路径URL', () => {
      const result = modifyUrlQuery('/home', { param: 'value' });
      expect(result).toBe('/home?param=value');
    });

    it('应该正确处理带hash的相对路径URL', () => {
      const result = modifyUrlQuery('/home#/path', undefined, { param: 'value' });
      expect(result).toBe('/home#/path?param=value');
    });

    it('应该正确处理协议相对URL', () => {
      const result = modifyUrlQuery('//example.com/home', { param: 'value' });
      expect(result).toBe('//example.com/home?param=value');
    });

    it('应该正确处理查询字符串开头的URL', () => {
      const result = modifyUrlQuery('?param=1', null, { param2: '2' });
      expect(result).toBe('#?param2=2');
    });

    it('应该正确处理只包含hash的URL', () => {
      const result = modifyUrlQuery('#/path?param=1', undefined, { param: '2', new: 'value' });
      expect(result).toBe('#/path?param=2&new=value');
    });

    it('应该正确处理复杂URL', () => {
      const result = modifyUrlQuery('https://user:pass@example.com:8080/path?param=1#/hash/path?hashParam=1', { param: '2', new: 'value' }, { hashParam: '2', newHash: 'value' });
      expect(result).toBe('https://user:pass@example.com:8080/path?param=2&new=value#/hash/path?hashParam=2&newHash=value');
    });

    it('应该正确处理数组参数', () => {
      const result = modifyUrlQuery('https://example.com?tags=red', { tags: ['blue', 'green'] });
      expect(result).toBe('https://example.com?tags=blue&tags=green');
    });

    it('应该正确处理空参数', () => {
      const result = modifyUrlQuery('https://example.com?param=value', {});
      expect(result).toBe('https://example.com?param=value');
    });

    it('应该正确处理空hash参数', () => {
      const result = modifyUrlQuery('https://example.com#/path?param=value', undefined, {});
      expect(result).toBe('https://example.com#/path?param=value');
    });

    it('应该正确处理URL编码', () => {
      const result = modifyUrlQuery('https://example.com', { 'param with spaces': 'value with spaces' });
      expect(result).toBe('https://example.com?param%20with%20spaces=value%20with%20spaces');
    });
    
    it('应该保留URL中的认证信息', () => {
      const result = modifyUrlQuery('https://user:pass@example.com/path?param=1', { param: '2' });
      expect(result).toBe('https://user:pass@example.com/path?param=2');
    });
  });
});