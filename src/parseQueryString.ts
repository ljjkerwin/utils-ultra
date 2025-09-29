import queryString from 'query-string';

/**
 * 解析search字符串
 * @param {string} search 
 * @return {object} 解析后的query对象
 */
export default function (search: string) {
  return queryString.parse(search);
}