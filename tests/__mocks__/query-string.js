// Mock implementation of query-string module for Jest tests
module.exports = {
  parse: function(str) {
    if (!str || str === '?') {
      return {};
    }
    
    // Remove leading '?' if present
    str = str.replace(/^\?/, '');
    
    const result = {};
    const pairs = str.split('&');
    
    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      if (key) {
        const decodedKey = decodeURIComponent(key);
        const decodedValue = value === undefined ? null : decodeURIComponent(value);
        
        // Handle array parameters (multiple values with same key)
        if (result[decodedKey] !== undefined) {
          if (Array.isArray(result[decodedKey])) {
            result[decodedKey].push(decodedValue);
          } else {
            result[decodedKey] = [result[decodedKey], decodedValue];
          }
        } else {
          result[decodedKey] = decodedValue;
        }
      }
    }
    
    return result;
  },
  
  stringify: function(obj, options = {}) {
    if (!obj || typeof obj !== 'object') {
      return '';
    }
    
    const pairs = [];
    
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        continue;
      }
      
      const encodedKey = encodeURIComponent(key);
      
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item !== null && item !== undefined) {
            pairs.push(encodedKey + '=' + encodeURIComponent(item));
          }
        }
      } else {
        pairs.push(encodedKey + '=' + encodeURIComponent(value));
      }
    }
    
    return pairs.join('&');
  }
};