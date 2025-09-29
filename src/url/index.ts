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
 * 解析url字符串，支持广义的url片段
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

  // 使用正则表达式解析URL
    // URL正则模式：^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$
    // 分组说明：
    // $1 = 协议部分 (如 "https:")
    // $2 = 协议名 (如 "https")
    // $3 = "//authority" 部分 
    // $4 = authority 部分 (如 "user:pass@host:port")
    // $5 = 路径部分 (如 "/path")
    // $6 = "?query" 部分
    // $7 = query 部分 (不包含?)
    // $8 = "#hash" 部分
    // $9 = hash 部分 (不包含#)
    const urlRegex = /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/;
    const match = url.match(urlRegex);
    
    if (match) {
      // 检查是否是有效的URL格式
      // 有效URL应该有协议+主机，或者是相对路径(以/开头)，或者是协议相对URL(以//开头)
      const hasProtocol = !!match[1];
      const hasAuthority = !!match[3];
      const pathname = match[5] || '';
      const isRelativePath = pathname.startsWith('/');
      const isProtocolRelative = url.startsWith('//');
      
      // 如果URL既没有协议，也没有authority，也不是相对路径或协议相对URL，
      // 那么认为这是一个无效的URL
      if (!hasProtocol && !hasAuthority && !isRelativePath && !isProtocolRelative) {
        // 可能是无效URL，比如 "not-a-valid-url"
        return urlObj;
      }
      
      // 解析协议
      urlObj.protocol = match[1] || '';
      
      // 解析authority部分 (user:pass@hostname:port)
      const authority = match[4] || '';
      if (authority) {
        // 解析认证信息和主机信息
        // authority格式: [user[:password]@]host[:port]
        const authRegex = /^(?:([^:@]+)(?::([^@]*))?@)?(.+)$/;
        const authMatch = authority.match(authRegex);
        
        if (authMatch) {
          urlObj.username = authMatch[1] || '';
          urlObj.password = authMatch[2] || '';
          
          // 解析主机和端口
          const hostPart = authMatch[3] || '';
          // 处理IPv6地址 [::1]:8080 或普通地址 localhost:8080
          const hostPortRegex = /^\[([^\]]+)\](?::(\d+))?$|^([^:]+)(?::(\d+))?$/;
          const hostPortMatch = hostPart.match(hostPortRegex);
          
          if (hostPortMatch) {
            // IPv6地址或普通地址
            urlObj.hostname = hostPortMatch[1] || hostPortMatch[3] || '';
            urlObj.port = hostPortMatch[2] || hostPortMatch[4] || '';
            urlObj.host = urlObj.port ? `${urlObj.hostname}:${urlObj.port}` : urlObj.hostname;
          }
        }
      }
      
      // 解析路径
      urlObj.pathname = pathname;
      // 如果有协议和主机但没有路径，默认为'/'
      if (urlObj.protocol && urlObj.hostname && !urlObj.pathname) {
        urlObj.pathname = '/';
      }
      
      // 解析查询字符串
      if (match[6]) {
        urlObj.search = match[6];
        urlObj.query = parseSearch(match[7] || '');
      }
      
      // 解析hash
      if (match[8]) {
        urlObj.hash = match[8];
        const hashContent = match[9] || '';
        
        // 解析hash中的路径和查询参数
        const hashParts = hashContent.split('?');
        urlObj.hashPathname = hashParts[0] || '';
        
        if (hashParts.length > 1) {
          urlObj.hashSearch = '?' + hashParts.slice(1).join('?');
          urlObj.hashQuery = parseSearch(urlObj.hashSearch);
        }
      }
      
      // 构建origin
      if (urlObj.protocol && urlObj.hostname) {
        urlObj.origin = urlObj.protocol + '//' + urlObj.host;
      }
    }


  return urlObj;
}


/**
 * 修改url中的查询参数，支持url片段
 * @param {string} url 原始URL字符串
 * @param {QueryType | null} query 主查询参数，传入null时删除所有主查询参数，字段传入undefined时删除该字段
 * @param {QueryType | null} hashQuery hash查询参数，传入null时删除所有hash查询参数，字段传入undefined时删除该字段
 * @return {string} 修改后的URL字符串
 * 
 * @example
 * ```typescript
 * // url不是完整url的
 * modifyUrlQuery('/home#/path?param=1', undefined, { param2: 2 });
 * // 结果: /home#/path?param=1&param2=2'
 * 
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
    let newUrl = '';

    if (urlObj.protocol) {
      newUrl += urlObj.protocol + '//';
    }

    // 构建认证信息部分
    let auth = '';
    if (urlObj.username || urlObj.password) {
      auth = urlObj.username;
      if (urlObj.password) {
        auth += ':' + urlObj.password;
      }
      auth += '@';
    }
    newUrl += auth;
    newUrl += urlObj.host;
    newUrl += urlObj.pathname;
    newUrl += urlObj.search;
    newUrl += urlObj.hash;

    urlObj.href = newUrl;
  }

  return urlObj.href;
}