import parseUrl from '../src/parseUrl';

describe('URL解析工具', () => {
  describe('parseUrl', () => {
    it('应该正确解析完整的URL', () => {
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

    it('应该正确解析FTP URL', () => {
      const url = 'ftp://192.168.0.1/home#bb=1';
      const result = parseUrl(url);
      
      expect(result.protocol).toBe('ftp:');
      expect(result.hostname).toBe('192.168.0.1');
      expect(result.pathname).toBe('/home');
      expect(result.hash).toBe('#bb=1');
      expect(result.hashPathname).toBe('bb=1'); // 没有以/开头，整个作为路径名
      expect(result.hashSearch).toBe('');
      expect(result.hashQuery).toEqual({});
    });

    it('应该正确解析协议相对URL', () => {
      const url = '//abc.com/home?t=123';
      const result = parseUrl(url);
      
      expect(result.protocol).toBe('');
      expect(result.hostname).toBe('abc.com');
      expect(result.pathname).toBe('/home');
      expect(result.search).toBe('?t=123');
      expect(result.query).toEqual({ t: '123' });
    });

    it('应该正确解析相对路径URL', () => {
      const url = '/home?t=123#/agent/list?page=1&limit=1000&tab=my';
      const result = parseUrl(url);
      
      expect(result.protocol).toBe('');
      expect(result.hostname).toBe('');
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

    it('应该正确解析自定义协议URL', () => {
      const url = 'openapp://appid/page.html?a=1';
      const result = parseUrl(url);
      
      expect(result.protocol).toBe('openapp:');
      expect(result.hostname).toBe('appid');
      expect(result.pathname).toBe('/page.html');
      expect(result.search).toBe('?a=1');
      expect(result.query).toEqual({ a: '1' });
    });

    it('应该正确解析根路径自定义协议URL', () => {
      const url = 'openapp:///?a=1';
      const result = parseUrl(url);
      
      expect(result.protocol).toBe('openapp:');
      expect(result.hostname).toBe('');
      expect(result.pathname).toBe('/');
      expect(result.search).toBe('?a=1');
      expect(result.query).toEqual({ a: '1' });
    });

    it('应该正确处理没有查询参数和hash的URL', () => {
      const url = 'https://example.com/path';
      const result = parseUrl(url);
      
      expect(result.protocol).toBe('https:');
      expect(result.hostname).toBe('example.com');
      expect(result.pathname).toBe('/path');
      expect(result.search).toBe('');
      expect(result.query).toEqual({});
      expect(result.hash).toBe('');
      expect(result.hashPathname).toBe('');
      expect(result.hashSearch).toBe('');
      expect(result.hashQuery).toEqual({});
    });

    it('应该正确处理只有查询参数的URL', () => {
      const url = 'https://example.com/path?param1=value1&param2=value2';
      const result = parseUrl(url);
      
      expect(result.protocol).toBe('https:');
      expect(result.hostname).toBe('example.com');
      expect(result.pathname).toBe('/path');
      expect(result.search).toBe('?param1=value1&param2=value2');
      expect(result.query).toEqual({
        param1: 'value1',
        param2: 'value2'
      });
      expect(result.hash).toBe('');
    });

    it('应该正确处理只有hash的URL', () => {
      const url = 'https://example.com/path#section';
      const result = parseUrl(url);
      
      expect(result.protocol).toBe('https:');
      expect(result.hostname).toBe('example.com');
      expect(result.pathname).toBe('/path');
      expect(result.search).toBe('');
      expect(result.query).toEqual({});
      expect(result.hash).toBe('#section');
      expect(result.hashPathname).toBe('section'); // 没有以/开头，整个作为路径名
      expect(result.hashSearch).toBe('');
      expect(result.hashQuery).toEqual({});
    });

    it('应该正确处理IPv6地址', () => {
      const url = 'https://[2001:db8::1]:8080/path';
      const result = parseUrl(url);
      
      expect(result.protocol).toBe('https:');
      expect(result.hostname).toBe('2001:db8::1');
      expect(result.port).toBe('8080');
      expect(result.host).toBe('2001:db8::1:8080');
      expect(result.pathname).toBe('/path');
    });

    it('应该正确处理空字符串输入', () => {
      const url = '';
      const result = parseUrl(url);
      
      expect(result.href).toBe('');
      expect(result.protocol).toBe('');
      expect(result.hostname).toBe('');
      expect(result.pathname).toBe('');
    });

    it('应该正确处理无效URL', () => {
      const url = 'not-a-valid-url';
      const result = parseUrl(url);
      
      expect(result.href).toBe('not-a-valid-url');
      expect(result.protocol).toBe('');
      expect(result.hostname).toBe('');
      expect(result.pathname).toBe('not-a-valid-url'); // 无效URL，整个作为路径名
    });
  });
});