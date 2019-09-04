import { ObservationType, Organisation } from "../interface";

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

//Generate new URLs with different search params for sharing searches
export const newURL = (dataType: string, searchTerm: string, organisationName: string, observationTypeParameter: string) => {
    const dataTypeParam = `data=${dataType}`;
    const searchParam = searchTerm === '' ? '' : `&search=${encodeURIComponent(searchTerm)}`;
    const organisationParam = organisationName === '' ? '' : `&organisation=${encodeURIComponent(organisationName)}`;
    const observationParam = observationTypeParameter === '' ? '' : `&observation=${encodeURIComponent(observationTypeParameter)}`;

    return `?${dataTypeParam}${searchParam}${organisationParam}${observationParam}`;
};

export const newURLWithObservationTypeOnCheckboxClick = (dataType: string, searchTerm: string, organisationName: string, observationType: ObservationType) => {
    const dataTypeParam = `data=${dataType}`;
    const searchParam = searchTerm === '' ? '' : `&search=${encodeURIComponent(searchTerm)}`;
    const organisationParam = organisationName === '' ? '' : `&organisation=${encodeURIComponent(organisationName)}`;
    const observationParam = observationType.checked ? '' : `&observation=${encodeURIComponent(observationType.parameter)}`;

    return `?${dataTypeParam}${searchParam}${organisationParam}${observationParam}`;
};

export const newURLWithOrganisationOnCheckboxClick = (dataType: string, searchTerm: string, organisation: Organisation, observationTypeParameter: string) => {
    const dataTypeParam = `data=${dataType}`;
    const searchParam = searchTerm === '' ? '' : `&search=${encodeURIComponent(searchTerm)}`;
    const organisationParam = organisation.checked ? '' : `&organisation=${encodeURIComponent(organisation.name)}`;
    const observationParam = observationTypeParameter === '' ? '' : `&observation=${encodeURIComponent(observationTypeParameter)}`;

    return `?${dataTypeParam}${searchParam}${organisationParam}${observationParam}`;
};