import queryString from 'query-string';


type QueryType = Record<string, any>

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
  query: QueryType;
  /** 哈希部分，包含 '#' */
  hash: string;
  /** 哈希中的路径部分 */
  hashPathname: string;
  /** 哈希中的查询字符串部分 */
  hashSearch: string;
  /** 哈希中解析后的查询对象 */
  hashQuery: QueryType;
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
      urlObj.query = parseSearch(urlObj.search);
    }
    
    // 解析 hash 中的路径和查询参数
    if (urlObj.hash) {
      const hashContent = urlObj.hash.slice(1); // 去掉 '#'
      const hashParts = hashContent.split('?');
      
      urlObj.hashPathname = hashParts[0] || '';
      
      if (hashParts.length > 1) {
        urlObj.hashSearch = '?' + hashParts.slice(1).join('?');
        urlObj.hashQuery = parseSearch(urlObj.hashSearch);
      }
    }
  } catch (error) {
    // 如果 URL 无效，保持默认值
    // console.warn('Invalid URL:', url, error);
  }

  return urlObj;
}


/**
 * 修改url中的查询参数
 * @param {string} url 原始URL字符串
 * @param {QueryType | null} query 主查询参数，传入null时删除所有主查询参数，字段传入undefined时删除该字段
 * @param {QueryType | null} hashQuery hash查询参数，传入null时删除所有hash查询参数，字段传入undefined时删除该字段
 * @return {string} 修改后的URL字符串
 * 
 * @example
 * ```typescript
 * // 添加或更新参数
 * modifyUrlQuery('https://example.com?old=1', { new: 'value', old: '2' });
 * // 结果: 'https://example.com?old=2&new=value'
 * 
 * // 删除特定字段（传入undefined）
 * modifyUrlQuery('https://example.com?remove=1&keep=2', { remove: undefined });
 * // 结果: 'https://example.com?keep=2'
 * 
 * // 删除所有主查询参数（传入null）
 * modifyUrlQuery('https://example.com?param1=1&param2=2', null);
 * // 结果: 'https://example.com'
 * 
 * // 删除所有hash查询参数（传入null）
 * modifyUrlQuery('https://example.com#/path?param=1', undefined, null);
 * // 结果: 'https://example.com#/path'
 * ```
 */
export function modifyUrlQuery(url: string, query?: QueryType | null, hashQuery?: QueryType | null) {
  const urlObj = parseUrl(url);

  let isSearchChanged = false;

  if (query !== undefined) {
    if (query === null) {
      // 传入null时，删除所有主查询参数
      urlObj.query = {};
    } else {
      urlObj.query = {
        ...urlObj.query,
        ...query
      };
    }
    urlObj.search = queryString.stringify(urlObj.query);
    if (urlObj.search) {
      urlObj.search = '?' + urlObj.search;
    }
    isSearchChanged = true;
  }

  let isHashSearchChanged = false;
  
  if (hashQuery !== undefined) {
    if (hashQuery === null) {
      // 传入null时，删除所有hash查询参数
      urlObj.hashQuery = {};
    } else {
      urlObj.hashQuery = {
        ...urlObj.hashQuery,
        ...hashQuery
      };
    }
    urlObj.hashSearch = queryString.stringify(urlObj.hashQuery);
    if (urlObj.hashSearch) {
      urlObj.hashSearch = '?' + urlObj.hashSearch;
    }
    urlObj.hash = urlObj.hashPathname + urlObj.hashSearch;
    if (urlObj.hash) {
      urlObj.hash = '#' + urlObj.hash;
    }
    isHashSearchChanged = true;
  }

  // 重新组装url
  if (isSearchChanged || isHashSearchChanged) {
    // 构建认证信息部分
    let auth = '';
    if (urlObj.username || urlObj.password) {
      auth = urlObj.username;
      if (urlObj.password) {
        auth += ':' + urlObj.password;
      }
      auth += '@';
    }
    
    urlObj.href = urlObj.protocol + '//' + auth + urlObj.host + urlObj.pathname + urlObj.search + urlObj.hash;
  }

  return urlObj.href;
}