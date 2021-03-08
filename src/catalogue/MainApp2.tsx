import React, { useEffect, useState } from 'react';
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
    const [page, setPage] = useState(1);
    const [initialPage, setInitialPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const toggleAlertMessage = () => {
        if (currentRasterList && currentRasterList.showAlert === true) props.toggleAlert();
        if (currentWMSList && currentWMSList.showAlert === true) props.toggleAlert();
        if (currentMonitoringNetworkList && currentMonitoringNetworkList.showAlert === true) props.toggleAlert();
    };

    const closeModalsOnEsc = (e) => {
        if (e.key === "Escape") {
            window.location.href = "#";
        };
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
    };

    const updateURL = (url: string) => {
        props.history.push(`${url}`);
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

    const {
        fetchLizardBootstrap,
        fetchObservationTypes,
        fetchOrganisations,
        fetchDatasets
    } = props;

    useEffect(() => {
        //Fetch Lizard Bootstrap
        fetchLizardBootstrap();

        //Fetch all organisations, datasets and observation types
        fetchObservationTypes();
        fetchOrganisations();
        fetchDatasets();
    }, [fetchLizardBootstrap, fetchObservationTypes, fetchOrganisations, fetchDatasets]);

    useEffect(() => {
        //When component first mount, capture the search params in the URL
        const urlSearchParams = getUrlParams(props.location.search);
        const dataType = getDataType(urlSearchParams);
        const search = getSearch(urlSearchParams);
        const organisation = getOrganisation(urlSearchParams);
        const observation = getObservationType(urlSearchParams);
        const dataset = getDataset(urlSearchParams);
        const uuid = getUUID(urlSearchParams);

        //Update Redux filters with URL parameters
        props.updateSearch(search);
        props.selectOrganisation(organisation);
        props.selectDataset(dataset);
        props.selectObservationType(observation);
        props.switchDataType(dataType);
        props.selectItem(uuid);

        //Update the search term in MainApp's state to show the search input
        setSearchTerm(search);

        //Poll the inbox regularly with timer set inside the action creator
        props.requestInbox();

        //Fetch relevant data for Rasters or WMS layers or Timeseries monitoring networks
        if (dataType === 'Raster') {
            props.fetchRasters(
                filters.page,
                search, organisation,
                observation,
                dataset,
                filters.ordering
            );
        } else if (dataType === 'WMS') {
            props.fetchWMSLayers(
                filters.page,
                search,
                organisation,
                dataset,
                filters.ordering
            );
        } else { // dataType === 'Timeseries'
            props.fetchMonitoringNetworks(
                filters.page,
                search,
                organisation,
                filters.ordering
            );
            // Fetch the list of observation types and locations by UUID of selected monitoring network
            if (uuid) {
                props.fetchMonitoringNetworkObservationTypes(uuid);
                props.fetchLocations(uuid);
            };
        };

        //Add event listener to use ESC to close a modal
        window.addEventListener("keydown", closeModalsOnEsc);
    
        return () => window.removeEventListener("keydown", closeModalsOnEsc);
    }, []);

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