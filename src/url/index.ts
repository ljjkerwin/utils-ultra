import queryString from 'query-string';


/**
 * 解析search字符串
 * @param {string} search 
 * @return {object} 解析后的query对象
 */
export function parseSearch(search: string) {
  return queryString.parse(search);
}


/**
 * 解析url字符串，同时支持scheme的解析
 * @param {string} url
 * @return {object} 解析后的url对象
 * @example
 * ```typescript
 * const url = 'https://myuser:mypass@abc.com:8443/home?t=123#/agent/list?page=1&limit=1000&tab=my';
 * const parsed = parseUrl(url);
 * 
 * // 返回结果：
 * {
 *   href: "https://myuser:mypass@abc.com:8443/home?t=123#/agent/list?page=1&limit=1000&tab=my",
 *   protocol: "https:",
 *   username: "myuser",
 *   password: "mypass",
 *   origin: "https://abc.com:8443",
 *   host: "abc.com:8443",
 *   hostname: "abc.com",
 *   port: "8443",
 *   pathname: "/home",
 *   search: "?t=123",
 *   query: {
 *     t: "123"
 *   },
 *   hash: "#/agent/list?page=1&limit=1000&tab=my",
 *   hashPathname: "/agent/list",
 *   hashSearch: "?page=1&limit=1000&tab=my",
 *   hashQuery: {
 *     page: "1",
 *     limit: "1000",
 *     tab: "my"
 *   }
 * }
 * ```
 */
export type UrlObjType = {
  /** 完整的URL字符串 */
  href: string;
  /** 协议部分，如 'https:' */
  protocol: string;
  /** 用户名 */
  username: string;
  /** 密码 */
  password: string;
  /** 源，包含协议、主机名和端口 */
  origin: string;
  /** 主机，包含主机名和端口 */
  host: string;
  /** 主机名 */
  hostname: string;
  /** 端口号 */
  port: string;
  /** 路径部分 */
  pathname: string;
  /** 查询字符串，包含 '?' */
  search: string;
  /** 解析后的查询对象 */
  query: Record<string, any>;
  /** 哈希部分，包含 '#' */
  hash: string;
  /** 哈希中的路径部分 */
  hashPathname: string;
  /** 哈希中的查询字符串部分 */
  hashSearch: string;
  /** 哈希中解析后的查询对象 */
  hashQuery: Record<string, any>;
};

export function parseUrl(url: string): UrlObjType {
  url = String(url);

  // 先赋默认值
  const urlObj = {
    href: url,
    protocol: '',
    username: '',
    password: '',
    origin: '',
    host: '',
    hostname: '',
    port: '',
    pathname: '',
    search: '',
    query: {},
    hash: '',
    hashPathname: '',
    hashSearch: '',
    hashQuery: {}
  }

  try {
    // 使用原生 URL API 进行基础解析
    const parsedUrl = new URL(url);
    
    urlObj.protocol = parsedUrl.protocol;
    urlObj.username = parsedUrl.username;
    urlObj.password = parsedUrl.password;
    urlObj.origin = parsedUrl.origin;
    urlObj.host = parsedUrl.host;
    urlObj.hostname = parsedUrl.hostname;
    urlObj.port = parsedUrl.port;
    urlObj.pathname = parsedUrl.pathname;
    urlObj.search = parsedUrl.search;
    urlObj.hash = parsedUrl.hash;
    
    // 解析查询参数
    if (urlObj.search) {
      urlObj.query = parseSearch(urlObj.search) as Record<string, string>;
    }
    
    // 解析 hash 中的路径和查询参数
    if (urlObj.hash) {
      const hashContent = urlObj.hash.slice(1); // 去掉 '#'
      const hashParts = hashContent.split('?');
      
      urlObj.hashPathname = hashParts[0] || '';
      
      if (hashParts.length > 1) {
        urlObj.hashSearch = '?' + hashParts.slice(1).join('?');
        urlObj.hashQuery = parseSearch(urlObj.hashSearch) as Record<string, string>;
      }
    }
  } catch (error) {
    // 如果 URL 无效，保持默认值
    // console.warn('Invalid URL:', url, error);
  }

  return urlObj;
}
