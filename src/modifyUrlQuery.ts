import queryString from 'query-string';
import parseUrl from "./parseUrl";
import { UrlQueryType } from './parseQueryString';

/**
 * 修改url中的查询参数，支持url片段，不影响除了查询参数外的路径部分
 * @param {string} url 原始URL字符串
 * @param {QueryType | null} query 主查询参数，传入null时删除所有主查询参数，字段传入undefined时删除该字段
 * @param {QueryType | null} hashQuery hash查询参数，传入null时删除所有hash查询参数，字段传入undefined时删除该字段
 * @return {string} 修改后的URL字符串
 * 
 * @example
 * ```typescript
 * // url不是完整url的
 * modifyUrlQuery('/home#/path?param=1', undefined, { param2: 2 });
 * // 结果: '/home#/path?param=1&param2=2'
 * 
 * modifyUrlQuery('?param=1', null, { param2: 2 });
 * // 结果: '#param2=2'
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
export default function modifyUrlQuery(url: string, query?: UrlQueryType | null, hashQuery?: UrlQueryType | null) {
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
    // 截取原url前面的部分，除去search和hash，使用正则
    urlObj.href = url.replace(/([?#].*)$/, '');
    urlObj.href += urlObj.search + urlObj.hash;
  }

  return urlObj.href;
}