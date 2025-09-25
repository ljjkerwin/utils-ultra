import { parseSearch, parseUrl } from '../src/url/index';
import type { UrlObjType } from '../src/url/index';

describe('URL工具', () => {
  describe('parseSearch', () => {
    it('应该正确解析简单的查询字符串', () => {
      const result = parseSearch('?name=test&age=25');
      expect(result).toEqual({
        name: 'test',
        age: '25'
      });
    });

    it('应该正确处理中文字符', () => {
      const result = parseSearch('?name=测试&city=北京');
      expect(result).toEqual({
        name: '测试',
        city: '北京'
      });
    });

    it('应该正确处理特殊符号编码', () => {
      const result = parseSearch('?query=a%2Bb%3Dc&symbol=%21%40%23%24');
      expect(result).toEqual({
        query: 'a+b=c',
        symbol: '!@#$'
      });
    });

    it('应该正确处理重复的键值对', () => {
      const result = parseSearch('?color=red&color=blue&color=green');
      expect(result).toEqual({
        color: ['red', 'blue', 'green']
      });
    });

    it('应该正确处理空键名', () => {
      const result = parseSearch('?=value&normal=test');
      expect(result).toEqual({
        normal: 'test'
      });
    });

    it('应该正确处理包含等号的值', () => {
      const result = parseSearch('?equation=x%3D1%2B2&normal=test');
      expect(result).toEqual({
        equation: 'x=1+2',
        normal: 'test'
      });
    });

    it('应该正确解析不带问号的查询字符串', () => {
      const result = parseSearch('name=test&age=25');
      expect(result).toEqual({
        name: 'test',
        age: '25'
      });
    });

    it('应该正确解析空值的查询字符串', () => {
      const result = parseSearch('?name=&age=25&empty');
      expect(result).toEqual({
        name: '',
        age: '25',
        empty: null
      });
    });

    it('应该正确解析包含特殊字符的查询字符串', () => {
      const result = parseSearch('?name=hello%20world&email=test%40example.com');
      expect(result).toEqual({
        name: 'hello world',
        email: 'test@example.com'
      });
    });

    it('应该正确解析数组形式的查询字符串', () => {
      const result = parseSearch('?tags=js&tags=ts&tags=react');
      expect(result).toEqual({
        tags: ['js', 'ts', 'react']
      });
    });

    it('应该正确处理空字符串', () => {
      const result = parseSearch('');
      expect(result).toEqual({});
    });

    it('应该正确处理只有问号的字符串', () => {
      const result = parseSearch('?');
      expect(result).toEqual({});
    });
  });

  describe('parseUrl', () => {
    it('应该正确解析完整的HTTPS URL', () => {
      const url = 'https://myuser:mypass@abc.com:8443/home?t=123#/agent/list?page=1&limit=1000&tab=my';
      const result = parseUrl(url);
      
      expect(result).toEqual({
        href: url,
        protocol: 'https:',
        username: 'myuser',
        password: 'mypass',
        origin: 'https://abc.com:8443',
        host: 'abc.com:8443',
        hostname: 'abc.com',
        port: '8443',
        pathname: '/home',
        search: '?t=123',
        query: {
          t: '123'
        },
        hash: '#/agent/list?page=1&limit=1000&tab=my',
        hashPathname: '/agent/list',
        hashSearch: '?page=1&limit=1000&tab=my',
        hashQuery: {
          page: '1',
          limit: '1000',
          tab: 'my'
        }
      });
    });

    it('应该正确解析简单的HTTP URL', () => {
      const url = 'http://example.com/path';
      const result = parseUrl(url);
      
      expect(result.href).toBe(url);
      expect(result.protocol).toBe('http:');
      expect(result.hostname).toBe('example.com');
      expect(result.pathname).toBe('/path');
      expect(result.port).toBe('');
      expect(result.search).toBe('');
      expect(result.hash).toBe('');
      expect(result.query).toEqual({});
      expect(result.hashQuery).toEqual({});
    });

    it('应该正确解析带查询参数的URL', () => {
      const url = 'https://example.com/search?q=test&category=tech&sort=date';
      const result = parseUrl(url);
      
      expect(result.search).toBe('?q=test&category=tech&sort=date');
      expect(result.query).toEqual({
        q: 'test',
        category: 'tech',
        sort: 'date'
      });
    });

    it('应该正确解析带hash的URL', () => {
      const url = 'https://example.com/app#/dashboard';
      const result = parseUrl(url);
      
      expect(result.hash).toBe('#/dashboard');
      expect(result.hashPathname).toBe('/dashboard');
      expect(result.hashSearch).toBe('');
      expect(result.hashQuery).toEqual({});
    });

    it('应该正确解析hash中包含查询参数的URL', () => {
      const url = 'https://example.com/#/users?page=2&size=10';
      const result = parseUrl(url);
      
      expect(result.hash).toBe('#/users?page=2&size=10');
      expect(result.hashPathname).toBe('/users');
      expect(result.hashSearch).toBe('?page=2&size=10');
      expect(result.hashQuery).toEqual({
        page: '2',
        size: '10'
      });
    });

    it('应该正确解析hash中包含多个问号的URL', () => {
      const url = 'https://example.com/#/path?param1=value1?param2=value2';
      const result = parseUrl(url);
      
      expect(result.hashPathname).toBe('/path');
      expect(result.hashSearch).toBe('?param1=value1?param2=value2');
    });

    it('应该正确解析localhost URL', () => {
      const url = 'http://localhost:3000/api/users?id=123';
      const result = parseUrl(url);
      
      expect(result.protocol).toBe('http:');
      expect(result.hostname).toBe('localhost');
      expect(result.port).toBe('3000');
      expect(result.pathname).toBe('/api/users');
      expect(result.query).toEqual({ id: '123' });
    });

    it('应该正确解析IP地址URL', () => {
      const url = 'http://192.168.1.1:8080/admin';
      const result = parseUrl(url);
      
      expect(result.hostname).toBe('192.168.1.1');
      expect(result.port).toBe('8080');
      expect(result.pathname).toBe('/admin');
    });

    it('应该正确处理IPv6地址URL', () => {
      const url = 'http://[2001:db8::1]:8080/path';
      const result = parseUrl(url);
      
      expect(result.hostname).toBe('[2001:db8::1]'); // IPv6地址在hostname中保留括号
      expect(result.port).toBe('8080');
      expect(result.host).toBe('[2001:db8::1]:8080');
    });

    it('应该正确处理包含中文的URL', () => {
      const url = 'https://example.com/路径?名称=测试&城市=北京';
      const result = parseUrl(url);
      
      expect(result.pathname).toBe('/%E8%B7%AF%E5%BE%84'); // 中文会被URL编码
      expect(result.query).toEqual({
        '名称': '测试',
        '城市': '北京'
      });
    });

    it('应该正确处理非常长的URL', () => {
      const longPath = '/very/long/path/'.repeat(50);
      const longQuery = 'param=value&'.repeat(100).slice(0, -1);
      const url = `https://example.com${longPath}?${longQuery}`;
      const result = parseUrl(url);
      
      expect(result.pathname).toBe(longPath);
      expect(result.search).toBe(`?${longQuery}`);
      expect(typeof result.query).toBe('object');
    });

    it('应该正确处理包含井号但无hash路径的URL', () => {
      const url = 'https://example.com/path#';
      const result = parseUrl(url);
      
      expect(result.hash).toBe(''); // 只有#时，浏览器会清空hash
      expect(result.hashPathname).toBe('');
      expect(result.hashSearch).toBe('');
      expect(result.hashQuery).toEqual({});
    });

    it('应该正确处理相对协议URL', () => {
      const url = '//example.com/path';
      const result = parseUrl(url);
      
      // 相对协议URL在没有base URL的情况下会被视为无效
      expect(result.href).toBe(url);
      expect(result.protocol).toBe('');
    });

    it('应该正确处理URL中的保留字符', () => {
      const url = 'https://example.com/path?query=hello%20world&encoded=%21%40%23%24%25';
      const result = parseUrl(url);
      
      expect(result.query).toEqual({
        query: 'hello world',
        encoded: '!@#$%'
      });
    });

    it('应该正确处理同时包含查询参数和hash查询参数的复杂URL', () => {
      const url = 'https://user:pass@example.com:8080/path?page=1&size=10#/hash/path?filter=active&sort=date';
      const result = parseUrl(url);
      
      expect(result.username).toBe('user');
      expect(result.password).toBe('pass');
      expect(result.port).toBe('8080');
      expect(result.query).toEqual({ page: '1', size: '10' });
      expect(result.hashPathname).toBe('/hash/path');
      expect(result.hashQuery).toEqual({ filter: 'active', sort: 'date' });
    });

    it('应该正确处理URL中的特殊端口号', () => {
      const urls = [
        'https://example.com:443/path',  // 默认HTTPS端口
        'http://example.com:80/path',    // 默认HTTP端口
        'https://example.com:8443/path', // 自定义端口
      ];
      
      urls.forEach(url => {
        const result = parseUrl(url);
        expect(result.href).toBe(url);
        expect(result.hostname).toBe('example.com');
      });
    });

    it('应该正确处理不安全的输入', () => {
      const dangerousInputs = [
        null,
        undefined,
        {},
        [],
        true,
        false,
        NaN,
        Infinity
      ];
      
      dangerousInputs.forEach(input => {
        expect(() => {
          const result = parseUrl(input as any);
          expect(typeof result).toBe('object');
          expect(result.href).toBe(String(input));
        }).not.toThrow();
      });
    });

    it('应该确保所有属性都是正确的类型', () => {
      const url = 'https://user:pass@example.com:8080/path?param=value#hash';
      const result = parseUrl(url);
      
      // 验证字符串类型属性
      const stringProps = [
        'href', 'protocol', 'username', 'password', 'origin',
        'host', 'hostname', 'port', 'pathname', 'search', 'hash',
        'hashPathname', 'hashSearch'
      ];
      
      stringProps.forEach(prop => {
        expect(typeof result[prop as keyof typeof result]).toBe('string');
      });
      
      // 验证对象类型属性
      expect(typeof result.query).toBe('object');
      expect(typeof result.hashQuery).toBe('object');
      expect(result.query).not.toBeNull();
      expect(result.hashQuery).not.toBeNull();
    });

    it('应该正确处理hash中的空查询参数', () => {
      const url = 'https://example.com/#/path?empty=&hasValue=test&noValue';
      const result = parseUrl(url);
      
      expect(result.hashQuery).toEqual({
        empty: '',
        hasValue: 'test',
        noValue: null
      });
    });

    it('应该正确处理malformed的查询字符串', () => {
      const url = 'https://example.com/path?invalid=value&=empty&broken';
      const result = parseUrl(url);
      
      expect(result.query).toHaveProperty('invalid', 'value');
      expect(result.query).toHaveProperty('broken', null);
    });

    it('应该正确处理只有域名的URL', () => {
      const url = 'https://example.com';
      const result = parseUrl(url);
      
      expect(result.pathname).toBe('/');
      expect(result.search).toBe('');
      expect(result.hash).toBe('');
    });

    it('应该正确处理带用户名但没有密码的URL', () => {
      const url = 'https://user@example.com/path';
      const result = parseUrl(url);
      
      expect(result.username).toBe('user');
      expect(result.password).toBe('');
    });

    it('应该正确处理FTP协议URL', () => {
      const url = 'ftp://user:pass@ftp.example.com/files';
      const result = parseUrl(url);
      
      expect(result.protocol).toBe('ftp:');
      expect(result.username).toBe('user');
      expect(result.password).toBe('pass');
      expect(result.hostname).toBe('ftp.example.com');
    });

    it('应该处理无效的URL并返回默认值', () => {
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

    it('应该处理空字符串URL', () => {
      const result = parseUrl('');
      
      expect(result.href).toBe('');
      expect(result.protocol).toBe('');
      expect(result.hostname).toBe('');
    });

    it('应该处理数字类型的输入', () => {
      const result = parseUrl(123 as any);
      
      expect(result.href).toBe('123');
      expect(result.protocol).toBe('');
    });

    it('应该确保返回对象符合UrlObjType类型', () => {
      const url = 'https://example.com/path?param=value#hash';
      const result: UrlObjType = parseUrl(url);
      
      // 验证所有必需的属性都存在
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