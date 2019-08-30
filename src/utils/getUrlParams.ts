//Methods to capture search params in the URL
//Capture the search params in the URL and turn it into an object using URLSearchParams() method
export const getUrlParams = (search: string) => {
    if (!search) return new URLSearchParams();
    return new URLSearchParams(search);
};

//Capture the value of the search property in the search params object
export const getSearch = (urlSearchParams) => {
    return urlSearchParams.get('search') || '';
};
//Capture the value of the organisation property in the search params object
export const getOrganisation = (urlSearchParams) => {
    return urlSearchParams.get('organisation') || '';
};
//Capture the value of the observation type property in the search params object
export const getObservationType = (urlSearchParams) => {
    return urlSearchParams.get('observation') || '';
};
//Capture the current data type selection of the Catalogue (Raster or WMS)
export const getDataType = (urlSearchParams) => {
    //data type can only be WMS or Raster
    return urlSearchParams.get('data') === 'WMS' ? 'WMS' : 'Raster';
};