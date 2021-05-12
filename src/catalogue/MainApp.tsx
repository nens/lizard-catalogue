// This file contains the logic of how the catalogue does all the fetching
// of data (e.g. bootstrap, rasters, WMS layers, monitoring networks ...),
// updating states in the Redux store, updating the URL.
// The final part is to render different parts of the catalogue including
// 4 main parts: Header, Filter Bar, List view and Details view

// Several useEffect hooks are used for the above works.

// Firslty, some useEffects are only called when the component first mounted,
// these useEffects are called inside the useMountEffect callback to do the following works:
// 1- fetch static lizard data: bootstrap, organisations, observation types and datasets
// 2- look up queries in the URL to update the filters state of the Redux store
// 3- poll the inbox endpoint frequently to check if any tasks are in progress
// 4- event listener to close modals on ESC

// Secondly, some other useEffects are used whenever some parts of the Redux store changed
// including the currentDataType and the filters state. These are called within the normal
// useEffect hooks to do the following works:
// 1- fetch dynamic data of rasters, WMS layers and monitoring networks based on
// current selected data type and filters state in the Redux store
// 2- update the URL query to keep it in sync with the currently selected data type
// and the filters state in Redux store
// 3- fetch the list of locations and observation types for a selected monitoring network

import React, { EffectCallback, useEffect, useState } from 'react';
import { connect, useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import {
    fetchRasters,
    fetchObservationTypes,
    fetchOrganisations,
    fetchDatasets,
    fetchLizardBootstrap,
    switchDataType,
    selectItem,
    fetchWMSLayers,
    toggleAlert,
    updateBasketWithRaster,
    updateBasketWithWMS,
    requestInbox,
    updateSearch,
    updateOrder,
    updatePage,
    selectOrganisation,
    selectDataset,
    selectObservationType,
    fetchMonitoringNetworks,
    fetchMonitoringNetworkObservationTypes,
    fetchLocations,
} from '../action';
import { getCurrentRasterList, getObservationTypes, getOrganisations, getDatasets, getCurrentDataType, getCurrentWMSList, getCurrentMonitoringNetworkList, getFilters, getSelectedItem } from '../reducers';
import { SwitchDataType } from '../interface';
import { getUrlParams, getSearch, getOrganisation, getObservationType, getDataset, getDataType, newURL, getUUID } from '../utils/getUrlParams';
import RasterList from './rasters/RasterList';
import RasterDetails from './rasters/RasterDetails';
import WMSList from './wms/WMSList';
import WMSDetails from './wms/WMSDetails';
import MonitoringNetworkList from './timeseries/MonitoringNetworkList';
import MonitoringNetworkDetails from './timeseries/MonitoringNetworkDetails';
import FilterBar from './FilterBar';
import Header from './Header';
import AlertPopup from './components/AlertPopup';
import './styles/MainApp.css';

const MainApp: React.FC<DispatchProps & RouteComponentProps> = (props) => {
    const currentRasterList = useSelector(getCurrentRasterList);
    const currentWMSList = useSelector(getCurrentWMSList);
    const currentMonitoringNetworkList = useSelector(getCurrentMonitoringNetworkList);
    const observationTypes = useSelector(getObservationTypes);
    const organisations = useSelector(getOrganisations);
    const datasets = useSelector(getDatasets);
    const currentDataType = useSelector(getCurrentDataType);
    const filters = useSelector(getFilters);
    const selectedItem = useSelector(getSelectedItem);

    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showInboxDropdown, setShowInboxDropdown] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const toggleAlertMessage = () => {
        if (currentRasterList && currentRasterList.showAlert === true) props.toggleAlert();
        if (currentWMSList && currentWMSList.showAlert === true) props.toggleAlert();
        if (currentMonitoringNetworkList && currentMonitoringNetworkList.showAlert === true) props.toggleAlert();
    };

    const closeDropdowns = () => {
        showProfileDropdown && setShowProfileDropdown(false);
        showInboxDropdown && setShowInboxDropdown(false);
    };

    const openProfileDropdown = () => {
        setShowProfileDropdown(true);
        setShowInboxDropdown(false);
    };

    const openInboxDropdown = () => {
        setShowProfileDropdown(false);
        setShowInboxDropdown(true);
    };

    const closeAllDropdowns = () => {
        setShowProfileDropdown(false);
        setShowInboxDropdown(false);
    };

    const onPageClick = (page: number) => {
        if (page < 1) return page = 1;
        props.updatePage(page);
    };

    const onSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const onSearchSubmit = (event) => {
        event.preventDefault();
        props.updateSearch(searchTerm);
        props.updatePage(1); // Go back to page 1 in the result list
    };

    //When switch the view from Rasters to WMS layers and vice versa, set the state of this main container back to initial state
    const onDataTypeChange = (dataType: SwitchDataType['payload']) => {
        props.switchDataType(dataType);

        //Update Redux store and the component's state
        props.selectItem(''); // Remove the previous selected item
        props.updateSearch(''); // Remove the search input
        props.updatePage(1); // Go back to page 1 in the result list
        setSearchTerm('');
    };

    // destructure some dispatch props to use as dependencies in useEffect
    const {
        fetchLocations,
        fetchMonitoringNetworkObservationTypes,
        fetchMonitoringNetworks,
        fetchRasters,
        fetchWMSLayers,
    } = props;

    // useMountEffect to call useEffect only once when component first mounted
    // eslint-disable-next-line
    const useMountEffect = (func: EffectCallback) => useEffect(func, []);

    // useMountEffect for event listener to use ESC to close a modal
    useMountEffect(() => {
        const closeModalsOnEsc = (e) => {
            if (e.key === "Escape") {
                window.location.href = "#";
            };
        };
        window.addEventListener("keydown", closeModalsOnEsc);
        return () => window.removeEventListener("keydown", closeModalsOnEsc);
    });

    // useMountEffect to fetch bootstrap, organisations, observation types and datasets
    useMountEffect(() => {
        // Fetch Lizard Bootstrap
        props.fetchLizardBootstrap();

        // Fetch all organisations, datasets and observation types
        props.fetchObservationTypes();
        props.fetchOrganisations();
        props.fetchDatasets();
    });

    // useMountEffect to update Redux store with URL params
    useMountEffect(() => {
        // Capture the search params in the URL
        const urlSearchParams = getUrlParams(props.location.search);
        const dataType = getDataType(urlSearchParams);
        const search = getSearch(urlSearchParams);
        const organisation = getOrganisation(urlSearchParams);
        const observation = getObservationType(urlSearchParams);
        const dataset = getDataset(urlSearchParams);
        const uuid = getUUID(urlSearchParams);

        // Update Redux filters with URL parameters
        props.updateSearch(search);
        props.selectOrganisation(organisation);
        props.selectDataset(dataset);
        props.selectObservationType(observation);
        props.switchDataType(dataType);
        props.selectItem(uuid);

        // Update the search term in MainApp's state to show the search input
        setSearchTerm(search);
    });

    // useMountEffect to request the inbox which then poll the inbox
    // regularly with timer set inside the requestInbox action
    useMountEffect(() => {
        props.requestInbox();
    });

    // useEffect to update URL based on filters state of the Redux store
    useEffect(() => {
        const url = newURL(
            currentDataType,
            filters.searchTerm,
            filters.organisation,
            currentDataType === 'WMS' ? '' : filters.observationType,
            currentDataType === 'Timeseries' ? '' : filters.dataset,
            selectedItem
        );

        const updateURL = (url: string) => {
            props.history.push(`${url}`);
        };

        updateURL(url);
    }, [
        currentDataType,
        filters.searchTerm,
        filters.organisation,
        filters.observationType,
        filters.dataset,
        selectedItem,
        props.history
    ]);

    // useEffect to fetch rasters, WMS or monitoring networks
    // based on currentDataType and filters state in Redux
    useEffect(() => {
        if (currentDataType === 'Raster') {
            fetchRasters(
                filters.page,
                filters.searchTerm,
                filters.organisation,
                filters.observationType,
                filters.dataset,
                filters.ordering
            );
        } else if (currentDataType === 'WMS') {
            fetchWMSLayers(
                filters.page,
                filters.searchTerm,
                filters.organisation,
                filters.dataset,
                filters.ordering
            );
        } else if (currentDataType === 'Timeseries') {
            fetchMonitoringNetworks(
                filters.page,
                filters.searchTerm,
                filters.organisation,
                filters.ordering
            );
        };
    }, [
        currentDataType,
        fetchMonitoringNetworks,
        fetchRasters,
        fetchWMSLayers,
        filters.dataset,
        filters.observationType,
        filters.ordering,
        filters.organisation,
        filters.page,
        filters.searchTerm
    ]);

    // useEffect to fetch monitoring network observation types and locations
    // of selected monitoring network
    useEffect(() => {
        if (currentDataType === 'Timeseries' && selectedItem) {
            fetchMonitoringNetworkObservationTypes(selectedItem);
            fetchLocations(selectedItem);
        };
    }, [
        currentDataType,
        selectedItem,
        fetchLocations,
        fetchMonitoringNetworkObservationTypes
    ]);

    return (
        <div
            className="main-container"
            onClick={() => {
                toggleAlertMessage();
                closeDropdowns();
            }}
        >
            <div className="main-header">
                <Header
                    showProfileDropdown={showProfileDropdown}
                    showInboxDropdown={showInboxDropdown}
                    toggleAlertMessage={toggleAlertMessage}
                    openProfileDropdown={openProfileDropdown}
                    openInboxDropdown={openInboxDropdown}
                    closeAllDropdowns={closeAllDropdowns}
                />
            </div>
            <div className="main-body">
                <FilterBar
                    observationTypes={observationTypes}
                    organisations={organisations}
                    datasets={datasets}
                    onDataTypeChange={onDataTypeChange}
                    currentDataType={currentDataType}
                />
                {currentDataType === "Raster" ?
                    <>
                        <RasterList
                            searchTerm={searchTerm}
                            currentRasterList={currentRasterList}
                            selectItem={props.selectItem}
                            updateBasketWithRaster={props.updateBasketWithRaster}
                            onPageClick={onPageClick}
                            onSearchChange={onSearchChange}
                            onSearchSubmit={onSearchSubmit}
                            onSorting={props.updateOrder}
                        />
                        <RasterDetails
                            filters={filters}
                        />
                    </>
                : null}
                {currentDataType === "WMS" ?
                    <>
                        <WMSList
                            searchTerm={searchTerm}
                            currentWMSList={currentWMSList}
                            selectItem={props.selectItem}
                            updateBasketWithWMS={props.updateBasketWithWMS}
                            onPageClick={onPageClick}
                            onSearchChange={onSearchChange}
                            onSearchSubmit={onSearchSubmit}
                            onSorting={props.updateOrder}
                        />
                        <WMSDetails />
                    </>
                : null}
                {currentDataType === "Timeseries" ?
                    <>
                        <MonitoringNetworkList
                            searchTerm={searchTerm}
                            currentMonitoringNetworkList={currentMonitoringNetworkList}
                            selectItem={props.selectItem}
                            onPageClick={onPageClick}
                            onSearchChange={onSearchChange}
                            onSearchSubmit={onSearchSubmit}
                            onSorting={props.updateOrder}
                        />
                        <MonitoringNetworkDetails />
                    </>
                : null}
            </div>
            {/* ALERT POPUP */}
            {(
                currentRasterList && currentRasterList.showAlert === true
            ) || (
                currentWMSList && currentWMSList.showAlert === true
            ) || (
                currentMonitoringNetworkList && currentMonitoringNetworkList.showAlert === true
            ) ? (
                <AlertPopup toggleAlert={props.toggleAlert} />
            ) : null}
        </div>
    );
};

const mapDispatchToProps = (dispatch: any) => ({
    fetchLizardBootstrap: () => fetchLizardBootstrap(dispatch),
    fetchRasters: (
        page: number,
        searchTerm: string,
        organisationName: string,
        observationTypeParameter: string,
        datasetSlug: string,
        ordering: string
    ) => fetchRasters(page, searchTerm, organisationName, observationTypeParameter, datasetSlug, ordering, dispatch),
    updateBasketWithRaster: (rasters: string[]) => updateBasketWithRaster(rasters, dispatch),
    updateBasketWithWMS: (wmsLayers: string[]) => updateBasketWithWMS(wmsLayers, dispatch),
    fetchObservationTypes: () => fetchObservationTypes(dispatch),
    fetchOrganisations: () => fetchOrganisations(dispatch),
    fetchDatasets: () => fetchDatasets(dispatch),
    fetchWMSLayers: (
        page: number,
        searchTerm: string,
        organisationName: string,
        datasetSlug: string,
        ordering: string
    ) => fetchWMSLayers(page, searchTerm, organisationName, datasetSlug, ordering, dispatch),
    fetchMonitoringNetworks: (
        page: number,
        searchTerm: string,
        organisationName: string,
        ordering: string
    ) => fetchMonitoringNetworks(page, searchTerm, organisationName, ordering, dispatch),
    fetchMonitoringNetworkObservationTypes: (uuid: string) => dispatch(fetchMonitoringNetworkObservationTypes(uuid)),
    fetchLocations: (uuid: string) => dispatch(fetchLocations(uuid)),
    selectItem: (uuid: string) => selectItem(uuid, dispatch),
    switchDataType: (dataType: SwitchDataType['payload']) => switchDataType(dataType, dispatch),
    toggleAlert: () => toggleAlert(dispatch),
    requestInbox: () => requestInbox(dispatch),
    updateSearch: (searchTerm: string) => updateSearch(dispatch, searchTerm),
    updateOrder: (ordering: string) => updateOrder(dispatch, ordering),
    updatePage: (page: number) => updatePage(dispatch, page),
    selectOrganisation: (organisationName: string) => selectOrganisation(dispatch, organisationName),
    selectDataset: (datasetSlug: string) => selectDataset(dispatch, datasetSlug),
    selectObservationType: (observationTypeParameter: string) => selectObservationType(dispatch, observationTypeParameter),
});
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

export default connect(null, mapDispatchToProps)(MainApp);