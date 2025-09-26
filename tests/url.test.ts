import { parseSearch, parseUrl, modifyUrlQuery, UrlObjType } from '../src/url';

describe('URL Utils', () => {
  describe('parseSearch', () => {
    it('should parse empty search string', () => {
      expect(parseSearch('')).toEqual({});
      expect(parseSearch('?')).toEqual({});
    });

    it('should parse single parameter', () => {
      expect(parseSearch('?key=value')).toEqual({ key: 'value' });
      expect(parseSearch('key=value')).toEqual({ key: 'value' });
    });

    it('should parse multiple parameters', () => {
      expect(parseSearch('?key1=value1&key2=value2')).toEqual({
        key1: 'value1',
        key2: 'value2'
      });
    });

    it('should handle URL encoded values', () => {
      expect(parseSearch('?name=John%20Doe&email=john%40example.com')).toEqual({
        name: 'John Doe',
        email: 'john@example.com'
      });
    });

    it('should handle parameters without values', () => {
      expect(parseSearch('?key1&key2=value2')).toEqual({
        key1: null,
        key2: 'value2'
      });
    });

    it('should handle array parameters', () => {
      expect(parseSearch('?tags=red&tags=blue&tags=green')).toEqual({
        tags: ['red', 'blue', 'green']
      });
    });
  });

  describe('parseUrl', () => {
    it('should parse simple HTTP URL', () => {
      const url = 'http://example.com';
      const result = parseUrl(url);
      
      expect(result.href).toBe(url);
      expect(result.protocol).toBe('http:');
      expect(result.hostname).toBe('example.com');
      expect(result.host).toBe('example.com');
      expect(result.port).toBe('');
      expect(result.pathname).toBe('/');
      expect(result.search).toBe('');
      expect(result.hash).toBe('');
      expect(result.query).toEqual({});
      expect(result.hashQuery).toEqual({});
    });

    it('should parse HTTPS URL with port', () => {
      const url = 'https://example.com:8443/path';
      const result = parseUrl(url);
      
      expect(result.protocol).toBe('https:');
      expect(result.hostname).toBe('example.com');
      expect(result.host).toBe('example.com:8443');
      expect(result.port).toBe('8443');
      expect(result.pathname).toBe('/path');
    });

    it('should parse URL with authentication', () => {
      const url = 'https://user:pass@example.com:8443/path';
      const result = parseUrl(url);
      
      expect(result.username).toBe('user');
      expect(result.password).toBe('pass');
      expect(result.origin).toBe('https://example.com:8443');
    });

    it('should parse URL with query parameters', () => {
      const url = 'https://example.com/path?param1=value1&param2=value2';
      const result = parseUrl(url);
      
      expect(result.search).toBe('?param1=value1&param2=value2');
      expect(result.query).toEqual({
        param1: 'value1',
        param2: 'value2'
      });
    });

    it('should parse URL with hash', () => {
      const url = 'https://example.com/path#section';
      const result = parseUrl(url);
      
      expect(result.hash).toBe('#section');
      expect(result.hashPathname).toBe('section');
      expect(result.hashSearch).toBe('');
      expect(result.hashQuery).toEqual({});
    });

    it('should parse URL with hash containing query parameters', () => {
      const url = 'https://example.com/path#/section?page=1&limit=10';
      const result = parseUrl(url);
      
      expect(result.hash).toBe('#/section?page=1&limit=10');
      expect(result.hashPathname).toBe('/section');
      expect(result.hashSearch).toBe('?page=1&limit=10');
      expect(result.hashQuery).toEqual({
        page: '1',
        limit: '10'
      });
    });

    it('should parse complex URL from documentation example', () => {
      const url = 'https://myuser:mypass@abc.com:8443/home?t=123#/agent/list?page=1&limit=1000&tab=my';
      const result = parseUrl(url);
      
      expect(result.href).toBe(url);
      expect(result.protocol).toBe('https:');
      expect(result.username).toBe('myuser');
      expect(result.password).toBe('mypass');
      expect(result.origin).toBe('https://abc.com:8443');
      expect(result.host).toBe('abc.com:8443');
      expect(result.hostname).toBe('abc.com');
      expect(result.port).toBe('8443');
      expect(result.pathname).toBe('/home');
      expect(result.search).toBe('?t=123');
      expect(result.query).toEqual({ t: '123' });
      expect(result.hash).toBe('#/agent/list?page=1&limit=1000&tab=my');
      expect(result.hashPathname).toBe('/agent/list');
      expect(result.hashSearch).toBe('?page=1&limit=1000&tab=my');
      expect(result.hashQuery).toEqual({
        page: '1',
        limit: '1000',
        tab: 'my'
      });
    });

    it('should handle invalid URLs gracefully', () => {
      const invalidUrl = 'not-a-valid-url';
      const result = parseUrl(invalidUrl);
      
      expect(result.href).toBe(invalidUrl);
      expect(result.protocol).toBe('');
      expect(result.hostname).toBe('');
      expect(result.pathname).toBe('');
      expect(result.search).toBe('');
      expect(result.hash).toBe('');
      expect(result.query).toEqual({});
      expect(result.hashQuery).toEqual({});
    });

    it('should handle non-string input by converting to string', () => {
      const result = parseUrl(123 as any);
      expect(result.href).toBe('123');
    });

    it('should parse URL with multiple question marks in hash', () => {
      const url = 'https://example.com#/path?param1=value1?param2=value2';
      const result = parseUrl(url);
      
      expect(result.hashPathname).toBe('/path');
      expect(result.hashSearch).toBe('?param1=value1?param2=value2');
    });
  });

  describe('modifyUrlQuery', () => {
    const baseUrl = 'https://example.com/path?existing=value';
    
    it('should add new query parameters', () => {
      const result = modifyUrlQuery(baseUrl, { new: 'param', another: 'value' });
      expect(result).toBe('https://example.com/path?existing=value&new=param&another=value');
    });

    it('should update existing query parameters', () => {
      const result = modifyUrlQuery(baseUrl, { existing: 'updated' });
      expect(result).toBe('https://example.com/path?existing=updated');
    });

    it('should remove query parameters when value is undefined', () => {
      const result = modifyUrlQuery(baseUrl, { existing: undefined });
      expect(result).toBe('https://example.com/path');
    });

    it('should remove all query parameters when query is null', () => {
      const result = modifyUrlQuery(baseUrl, null);
      expect(result).toBe('https://example.com/path');
    });

    it('should not modify URL when query parameter is undefined', () => {
      const result = modifyUrlQuery(baseUrl);
      expect(result).toBe(baseUrl);
    });

    it('should handle URL without query parameters', () => {
      const url = 'https://example.com/path';
      const result = modifyUrlQuery(url, { new: 'param' });
      expect(result).toBe('https://example.com/path?new=param');
    });

    it('should modify hash query parameters', () => {
      const url = 'https://example.com/path#/section?hash=param';
      const result = modifyUrlQuery(url, undefined, { new: 'hashParam' });
      expect(result).toBe('https://example.com/path#/section?hash=param&new=hashParam');
    });

    it('should remove hash query parameters when value is undefined', () => {
      const url = 'https://example.com/path#/section?remove=me&keep=this';
      const result = modifyUrlQuery(url, undefined, { remove: undefined });
      expect(result).toBe('https://example.com/path#/section?keep=this');
    });

    it('should remove all hash query parameters when hashQuery is null', () => {
      const url = 'https://example.com/path#/section?param1=value1&param2=value2';
      const result = modifyUrlQuery(url, undefined, null);
      expect(result).toBe('https://example.com/path#/section');
    });

    it('should handle URL with authentication', () => {
      const url = 'https://user:pass@example.com:8443/path?param=value';
      const result = modifyUrlQuery(url, { new: 'param' });
      expect(result).toBe('https://user:pass@example.com:8443/path?param=value&new=param');
    });

    it('should handle complex URL modification', () => {
      const url = 'https://user:pass@example.com:8443/path?old=value#/section?hashOld=hashValue';
      const result = modifyUrlQuery(
        url,
        { old: 'updated', new: 'added' },
        { hashOld: 'hashUpdated', hashNew: 'hashAdded' }
      );
      expect(result).toBe(
        'https://user:pass@example.com:8443/path?old=updated&new=added#/section?hashOld=hashUpdated&hashNew=hashAdded'
      );
    });

    it('should handle URL with only hash pathname (no hash query)', () => {
      const url = 'https://example.com/path#/section';
      const result = modifyUrlQuery(url, undefined, { new: 'hashParam' });
      expect(result).toBe('https://example.com/path#/section?new=hashParam');
    });

    it('should preserve empty hash pathname when modifying hash query', () => {
      const url = 'https://example.com/path#?existing=value';
      const result = modifyUrlQuery(url, undefined, { new: 'param' });
      expect(result).toBe('https://example.com/path#?existing=value&new=param');
    });

    it('should handle empty values correctly', () => {
      const result = modifyUrlQuery(baseUrl, { empty: '' });
      expect(result).toBe('https://example.com/path?existing=value&empty=');
    });

    it('should handle special characters in values', () => {
      const result = modifyUrlQuery(baseUrl, { special: 'hello world!@#$%' });
      expect(result).toContain('special=hello%20world!');
      expect(result).toContain('%40%23%24%25');
    });

    it('should maintain URL structure when no changes are made', () => {
      const url = 'https://example.com/path?param=value#/hash?hashParam=hashValue';
      const result = modifyUrlQuery(url);
      expect(result).toBe(url);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle URLs with no protocol', () => {
      const result = parseUrl('//example.com/path');
      expect(result.href).toBe('//example.com/path');
      expect(result.protocol).toBe('');
    });

    it('should handle relative URLs', () => {
      const result = parseUrl('/path/to/resource');
      expect(result.href).toBe('/path/to/resource');
      expect(result.protocol).toBe('');
    });

    it('should handle URLs with unusual characters', () => {
      const url = 'https://example.com/path?q=search%20term&special=!@#$%^&*()'
      const result = parseUrl(url);
      expect(result.href).toBe(url);
    });

    it('should handle very long URLs', () => {
      const longPath = '/very/long/path/' + 'segment/'.repeat(100);
      const url = `https://example.com${longPath}?param=value`;
      const result = parseUrl(url);
      expect(result.pathname).toBe(longPath);
    });
  });

  describe('Type compatibility', () => {
    it('should return correct type structure', () => {
      const result: UrlObjType = parseUrl('https://example.com');
      
      // Check that all required properties exist
      expect(typeof result.href).toBe('string');
      expect(typeof result.protocol).toBe('string');
      expect(typeof result.username).toBe('string');
      expect(typeof result.password).toBe('string');
      expect(typeof result.origin).toBe('string');
      expect(typeof result.host).toBe('string');
      expect(typeof result.hostname).toBe('string');
      expect(typeof result.port).toBe('string');
      expect(typeof result.pathname).toBe('string');
      expect(typeof result.search).toBe('string');
      expect(typeof result.query).toBe('object');
      expect(typeof result.hash).toBe('string');
      expect(typeof result.hashPathname).toBe('string');
      expect(typeof result.hashSearch).toBe('string');
      expect(typeof result.hashQuery).toBe('object');
    });
  });
});