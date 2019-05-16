export const baseUrl = (() => {
    let absoluteBase = 'http://demo.lizard.net/api/v4';
  
    if (typeof window !== 'undefined') {
      const protocol = window && window.location.protocol;
  
      const host = window && window.location.host;
  
      absoluteBase = `${protocol}//${host}/api/v4`;
    }
    return absoluteBase;
})();

// export const baseUrl = 'http://localhost:3000/api/v4';