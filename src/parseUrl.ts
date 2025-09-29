import parseQueryString, { UrlQueryType } from "./parseQueryString";


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
  query: UrlQueryType;
  /** 哈希部分，包含 '#' */
  hash: string;
  /** 哈希中的路径部分 */
  hashPathname: string;
  /** 哈希中的查询字符串部分 */
  hashSearch: string;
  /** 哈希中解析后的查询对象 */
  hashQuery: UrlQueryType;
};



/**
 * 解析url字符串，支持广义的url片段
 * @param {string} url
 * @return {UrlObjType}
 * @example
 * 调用方法
 * parseUrl('https://myuser:mypass@abc.com:8443/home?t=123#/agent/list?page=1&limit=1000&tab=my')
 * 
 * 返回结果
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
 * 
 * @example 其他广义的url片段的输入示例
 * ftp://192.168.0.1/home#bb=1
 * //abc.com/home?t=123
 * /home?t=123#/agent/list?page=1&limit=1000&tab=my
 * openapp://appid/page.html?a=1
 * openapp:///?a=1
 */
export default function parseUrl(url: string): UrlObjType {
  url = String(url);

  // 先赋默认值
  const urlObj: UrlObjType = {
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
  };

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
    // 获取各部分
    const pathname = match[5] || '';
    
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
      urlObj.query = parseQueryString(match[7] || '');
    }
    
    // 解析hash
    if (match[8]) {
      urlObj.hash = match[8];
      const hashContent = match[9] || '';
      
      // 解析hash中的路径和查询参数
      if (hashContent) {
        // 如果hashContent以/开头，则认为是路径
        if (hashContent.startsWith('/')) {
          const hashParts = hashContent.split('?');
          urlObj.hashPathname = hashParts[0] || '';
          
          if (hashParts.length > 1) {
            urlObj.hashSearch = '?' + hashParts.slice(1).join('?');
            urlObj.hashQuery = parseQueryString(hashParts.slice(1).join('?'));
          }
        } else {
          // 如果hashContent不以/开头，则整个作为路径名
          const hashParts = hashContent.split('?');
          urlObj.hashPathname = hashParts[0] || '';
          
          if (hashParts.length > 1) {
            urlObj.hashSearch = '?' + hashParts.slice(1).join('?');
            urlObj.hashQuery = parseQueryString(hashParts.slice(1).join('?'));
          }
        }
      }
    }
    
    // 构建origin
    if (urlObj.protocol && urlObj.hostname) {
      urlObj.origin = urlObj.protocol + '//' + urlObj.host;
    }
  }

  return urlObj;
}