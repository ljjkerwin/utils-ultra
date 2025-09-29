import parseQueryString from '../src/parseQueryString';

describe('URL查询字符串解析工具', () => {
  describe('parseQueryString', () => {
    it('应该正确解析基础查询字符串', () => {
      expect(parseQueryString('name=john&age=25')).toEqual({
        name: 'john',
        age: '25'
      });
      
      expect(parseQueryString('?name=john&age=25')).toEqual({
        name: 'john',
        age: '25'
      });
    });

    it('应该正确处理空值情况', () => {
      expect(parseQueryString('')).toEqual({});
      expect(parseQueryString('?')).toEqual({});
    });

    it('应该正确解析单个参数', () => {
      expect(parseQueryString('name=john')).toEqual({
        name: 'john'
      });
      
      expect(parseQueryString('?name=john')).toEqual({
        name: 'john'
      });
    });

    it('应该正确处理没有值的参数', () => {
      expect(parseQueryString('name=')).toEqual({
        name: ''
      });
      
      expect(parseQueryString('name')).toEqual({
        name: null
      });
    });

    it('应该正确处理URL编码的参数', () => {
      expect(parseQueryString('name=john%20doe&city=san%20francisco')).toEqual({
        name: 'john doe',
        city: 'san francisco'
      });
      
      expect(parseQueryString('search=%E4%B8%AD%E6%96%87')).toEqual({
        search: '中文'
      });
    });

    it('应该正确处理特殊字符', () => {
      expect(parseQueryString('name=john&symbol=%26%3D%3F')).toEqual({
        name: 'john',
        symbol: '&=?'
      });
      
      expect(parseQueryString('email=test%40example.com')).toEqual({
        email: 'test@example.com'
      });
    });

    it('应该正确处理多个相同键的参数（数组）', () => {
      expect(parseQueryString('tag=red&tag=blue&tag=green')).toEqual({
        tag: ['red', 'blue', 'green']
      });
      
      expect(parseQueryString('id=1&id=2')).toEqual({
        id: ['1', '2']
      });
    });

    it('应该正确处理复杂的查询字符串', () => {
      const complexQuery = 'name=john%20doe&age=25&city=san%20francisco&tags=web&tags=dev&active=true&score=';
      expect(parseQueryString(complexQuery)).toEqual({
        name: 'john doe',
        age: '25',
        city: 'san francisco',
        tags: ['web', 'dev'],
        active: 'true',
        score: ''
      });
    });

    it('应该正确处理包含等号的值', () => {
      expect(parseQueryString('equation=x%3D1&formula=a%3Db%2Bc')).toEqual({
        equation: 'x=1',
        formula: 'a=b+c'
      });
    });

    it('应该正确处理布尔值类型的参数', () => {
      expect(parseQueryString('active=true&disabled=false')).toEqual({
        active: 'true',
        disabled: 'false'
      });
    });

    it('应该正确处理数字类型的参数', () => {
      expect(parseQueryString('count=10&price=99.99&negative=-5')).toEqual({
        count: '10',
        price: '99.99',
        negative: '-5'
      });
    });

    it('应该正确处理空键名', () => {
      expect(parseQueryString('=value&name=john')).toEqual({
        name: 'john'
      });
    });

    it('应该正确处理包含&符号的键值', () => {
      expect(parseQueryString('key1=value1%26more&key2=normal')).toEqual({
        key1: 'value1&more',
        key2: 'normal'
      });
    });

    it('应该保持参数解析的一致性', () => {
      const testCases = [
        'a=1&b=2&c=3',
        '?a=1&b=2&c=3',
        'x=hello%20world&y=test',
        'empty=&full=value',
        'arr=1&arr=2&arr=3'
      ];

      testCases.forEach(query => {
        const result = parseQueryString(query);
        expect(typeof result).toBe('object');
        expect(result).not.toBeNull();
      });
    });

    it('应该正确处理边界情况', () => {
      // 只有分隔符的情况
      expect(parseQueryString('&&&')).toEqual({});
      
      // 只有等号的情况
      expect(parseQueryString('===')).toEqual({});
      
      // 混合空值的情况
      expect(parseQueryString('&name=john&&age=25&')).toEqual({
        name: 'john',
        age: '25'
      });
    });

    it('应该正确处理Unicode字符', () => {
      expect(parseQueryString('emoji=%F0%9F%98%80&chinese=%E4%B8%AD%E6%96%87')).toEqual({
        emoji: '😀',
        chinese: '中文'
      });
    });

    it('应该返回正确的数据类型', () => {
      const result = parseQueryString('name=john&age=25');
      expect(typeof result).toBe('object');
      expect(Array.isArray(result)).toBe(false);
      expect(result.constructor).toBe(Object);
    });
  });
});