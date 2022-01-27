//Methods to capture search params in the URL
//Capture the search params in the URL and turn it into an object using URLSearchParams() method
export const getUrlParams = (search: string) => {
    if (!search) return new URLSearchParams();
    return new URLSearchParams(search);
};

//Capture the value of the search property in the search params object
export const getSearch = (urlSearchParams: URLSearchParams) => {
    return urlSearchParams.get('search') || '';
};
//Capture the value of the organisation property in the search params object
export const getOrganisation = (urlSearchParams: URLSearchParams) => {
    return urlSearchParams.get('organisation') || '';
};
//Capture the value of the observation type property in the search params object
export const getObservationType = (urlSearchParams: URLSearchParams) => {
    return urlSearchParams.get('observation') || '';
};
//Capture the value of the layercollection property in the search params object
export const getLayercollection = (urlSearchParams: URLSearchParams) => {
    return urlSearchParams.get('layercollection') || '';
};
//Capture the current data type selection of the Catalogue (Raster or WMS)
export const getDataType = (urlSearchParams: URLSearchParams) => {
    //data type can only be WMS or Raster
    return urlSearchParams.get('data') || 'Raster';
};
//Capture the selected item's UUID
export const getUUID = (URLSearchParams: URLSearchParams) => {
    return URLSearchParams.get('uuid') || '';
};

//Generate new URLs with different search params for sharing searches
export const newURL = (dataType: string, searchTerm: string, organisationName: string, observationTypeParameter: string, layercollectionSlug: string, uuid: string) => {
    const params: string[] = [];

    if (dataType) params.push(`data=${dataType}`);
    if (searchTerm) params.push(`search=${encodeURIComponent(searchTerm)}`);
    if (organisationName) params.push(`organisation=${encodeURIComponent(organisationName)}`);
    if (layercollectionSlug) params.push(`layercollection=${encodeURIComponent(layercollectionSlug)}`);
    if (observationTypeParameter) params.push(`observation=${encodeURIComponent(observationTypeParameter)}`);
    if (uuid) params.push(`uuid=${uuid}`);

    const queries = params.join('&');

    return `?${queries}`;
};