import queryString from 'query-string';



export type UrlQueryType = queryString.ParsedQuery<string>;

/**
 * 解析search字符串
 * @param {string} search 
 * @return {object} 解析后的query对象
 */
export default function (search: string): UrlQueryType {
  return queryString.parse(search);
}