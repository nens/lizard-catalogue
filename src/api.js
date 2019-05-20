//Construct baseUrl for API endpoint 

export const baseUrl = (() => {
    //set the API endpoint 
    let absoluteBase = 'http://demo.lizard.net/api/v4';

    //set absoluteBase in relation to the current hosting service
    if (typeof window !== 'undefined') {
      const protocol = window && window.location.protocol;
  
      const host = window && window.location.host;
  
      absoluteBase = `${protocol}//${host}/api/v4`;
    }
    return absoluteBase;
})();