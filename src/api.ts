//Construct baseUrl for API endpoint 
export const baseUrl = (() => {
    //set the API endpoint 
    let absoluteBase = 'http://demo.lizard.net';

    //set absoluteBase in relation to the current hosting service
    if (typeof window !== 'undefined') {
      const protocol = window && window.location.protocol;
  
      const host = window && window.location.host;
  
      absoluteBase = `${protocol}//${host}`;
    }
    return absoluteBase;
})();