// This file contains the logic of how the catalogue does all the fetching
// of data (e.g. bootstrap, rasters, WMS layers, monitoring networks ...),
// updating states in the Redux store, updating the URL.
// The final part is to render different parts of the catalogue including
// 4 main parts: Header, Filter Bar, List view and Details view

// Several useEffect hooks are used for the above works.

// Firslty, some useEffects are only called when the component first mounted,
// these useEffects are called inside the useMountEffect callback to do the following works:
// 1- fetch static lizard data: bootstrap, organisations, observation types and layercollections
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

import { EffectCallback, useEffect, useState } from 'react';
import { connect, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router';
import { RootDispatch } from '../store';
import {
    fetchRasters,
    fetchObservationTypes,
    fetchOrganisations,
    fetchLayercollections,
    fetchProjects,
    fetchLizardBootstrap,
    switchDataType,
    selectItem,
    fetchWMSLayers,
    toggleAlert,
    updateBasketWithRaster,
    updateBasketWithWMS,
    updateBasketWithScenarios,
    requestInbox,
    updateSearch,
    updateOrder,
    updatePage,
    removeSearch,
    removeOrder,
    selectOrganisation,
    selectLayercollection,
    selectObservationType,
    selectProject,
    fetchMonitoringNetworks,
    fetchMonitoringNetworkObservationTypes,
    fetchLocations,
    fetchUserOrganisations,
    fetchScenarios,
    fetchRaster,
    fetchWmsLayer,
    fetchScenario,
    fetchMonitoringNetwork,
} from '../action';
import {
    getCurrentRasterList,
    getObservationTypes,
    getOrganisations,
    getLayercollections,
    getProjects,
    getCurrentDataType,
    getCurrentWMSList,
    getCurrentMonitoringNetworkList,
    getCurrentScenariosList,
    getFilters,
    getSelectedItem,
    getLizardBootstrap
} from '../reducers';
import { SwitchDataType } from '../action';
import {
    getUrlParams,
    getSearch,
    getOrganisation,
    getObservationType,
    getLayercollection,
    getProject,
    getDataType,
    newURL,
    getUUID
} from '../utils/getUrlParams';
import RasterList from './rasters/RasterList';
import RasterDetails from './rasters/RasterDetails';
import WMSList from './wms/WMSList';
import WMSDetails from './wms/WMSDetails';
import ScenarioList from './scenarios/ScenarioList';
import ScenarioDetails from './scenarios/ScenarioDetails';
import MonitoringNetworkList from './timeseries/MonitoringNetworkList';
import MonitoringNetworkDetails from './timeseries/MonitoringNetworkDetails';
import FilterBar from './FilterBar';
import Header from './Header';
import AlertPopup from '../components/AlertPopup';
import styles from './MainApp.module.css';

const MainApp: React.FC<DispatchProps> = (props) => {
    const currentRasterList = useSelector(getCurrentRasterList);
    const currentWMSList = useSelector(getCurrentWMSList);
    const currentMonitoringNetworkList = useSelector(getCurrentMonitoringNetworkList);
    const currentScenariosList = useSelector(getCurrentScenariosList);
    const observationTypes = useSelector(getObservationTypes);
    const organisations = useSelector(getOrganisations);
    const layercollections = useSelector(getLayercollections);
    const projects = useSelector(getProjects);
    const currentDataType = useSelector(getCurrentDataType);
    const filters = useSelector(getFilters);
    const selectedItem = useSelector(getSelectedItem);
    const userId = useSelector(getLizardBootstrap).user.id;

    const navigate = useNavigate();
    const location = useLocation();

    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showInboxDropdown, setShowInboxDropdown] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const toggleAlertMessage = () => {
        if (currentRasterList && currentRasterList.showAlert === true) props.toggleAlert();
        if (currentWMSList && currentWMSList.showAlert === true) props.toggleAlert();
        if (currentMonitoringNetworkList && currentMonitoringNetworkList.showAlert === true) props.toggleAlert();
        if (currentScenariosList && currentScenariosList.showAlert === true) props.toggleAlert();
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

    const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const onSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        props.updateSearch(searchTerm);
        props.updatePage(1); // Go back to page 1 in the result list
    };

    // When switch the view from Rasters to WMS layers and vice versa, set the state of this main container back to initial state
    const onDataTypeChange = (dataType: SwitchDataType['payload']) => {
        props.switchDataType(dataType);

        // Update Redux store and the component's state
        props.selectItem(''); // Remove the previous selected item
        props.removeSearch(); // Remove the search input
        props.updatePage(1); // Go back to page 1 in the result list
        props.removeOrder(); // Remove previous ordering
        setSearchTerm('');
    };

    // destructure some dispatch props to use as dependencies in useEffect
    const {
        fetchLocations,
        fetchMonitoringNetworkObservationTypes,
        fetchMonitoringNetworks,
        fetchRasters,
        fetchScenarios,
        fetchWMSLayers,
        fetchUserOrganisations,
    } = props;

    // useMountEffect to call useEffect only once when component first mounted
    // eslint-disable-next-line
    const useMountEffect = (func: EffectCallback) => useEffect(func, []);

    // useMountEffect for event listener to use ESC to close a modal
    useMountEffect(() => {
        const closeModalsOnEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                window.location.href = "#";
            };
        };
        window.addEventListener("keydown", closeModalsOnEsc);
        return () => window.removeEventListener("keydown", closeModalsOnEsc);
    });

    // useMountEffect to fetch bootstrap, organisations, observation types and layercollections
    useMountEffect(() => {
        // Fetch Lizard Bootstrap
        props.fetchLizardBootstrap();

        // Fetch all organisations, layercollections and observation types
        props.fetchObservationTypes();
        props.fetchOrganisations();
        props.fetchLayercollections();
        props.fetchProjects();
    });

    // useEffect to fetch list of organisations which the currently login user is a member of
    useEffect(() => {
        if (userId) {
            fetchUserOrganisations(userId);
        };
    }, [userId, fetchUserOrganisations]);

    // useMountEffect to update Redux store with URL params
    useMountEffect(() => {
        // Capture the search params in the URL
        const urlSearchParams = getUrlParams(location.search);
        const dataType = getDataType(urlSearchParams);
        const search = getSearch(urlSearchParams);
        const organisation = getOrganisation(urlSearchParams);
        const observation = getObservationType(urlSearchParams);
        const layercollection = getLayercollection(urlSearchParams);
        const project = getProject(urlSearchParams);
        const uuid = getUUID(urlSearchParams);

        // Update Redux filters with URL parameters
        props.updateSearch(search);
        props.selectOrganisation(organisation);
        props.selectLayercollection(layercollection);
        props.selectProject(project);
        props.selectObservationType(observation);
        props.switchDataType(dataType as SwitchDataType['payload']);
        props.selectItem(uuid);

        // Update the search term in MainApp's state to show the search input
        setSearchTerm(search);

        // If uuid is found in the URL then fetch the respective data set
        if (uuid) {
            if (dataType === 'Raster') {
                props.fetchRaster(uuid);
            } else if (dataType === 'WMS') {
                props.fetchWmsLayer(uuid);
            } else if (dataType === 'Scenario') {
                props.fetchScenario(uuid);
            } else if (dataType === 'Timeseries') {
                props.fetchMonitoringNetwork(uuid);
            };
        };
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
            currentDataType === 'Raster' ? filters.observationType : '',
            currentDataType === 'Raster' || currentDataType === 'WMS' ? filters.layercollection : '',
            currentDataType === 'Scenario' ? filters.project : '',
            selectedItem
        );

        const updateURL = (url: string) => {
            navigate(`${url}`);
        };

        updateURL(url);
    }, [
        currentDataType,
        filters.searchTerm,
        filters.organisation,
        filters.observationType,
        filters.layercollection,
        filters.project,
        selectedItem,
        navigate
    ]);

    // useEffect to fetch rasters, WMS, scenarios and monitoring networks
    // based on currentDataType and filters state in Redux
    useEffect(() => {
        if (currentDataType === 'Raster') {
            fetchRasters(
                filters.page,
                filters.searchTerm,
                filters.organisation,
                filters.observationType,
                filters.layercollection,
                filters.ordering
            );
        } else if (currentDataType === 'WMS') {
            fetchWMSLayers(
                filters.page,
                filters.searchTerm,
                filters.organisation,
                filters.layercollection,
                filters.ordering
            );
        } else if (currentDataType === 'Scenario') {
            fetchScenarios(
                filters.page,
                filters.searchTerm,
                filters.organisation,
                filters.project,
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
        fetchScenarios,
        fetchWMSLayers,
        filters.layercollection,
        filters.observationType,
        filters.ordering,
        filters.organisation,
        filters.project,
        filters.page,
        filters.searchTerm
    ]);

    // useEffect to fetch monitoring network observation types and locations
    // of selected monitoring network
    useEffect(() => {
        // Add abort controller for the fetch requests
        const controller = new AbortController();

        if (currentDataType === 'Timeseries' && selectedItem) {
            fetchMonitoringNetworkObservationTypes(selectedItem, controller.signal);
            fetchLocations(selectedItem, controller.signal);
        };

        // Abort the current fetch request when component unmounted
        return () => controller.abort();
    }, [
        currentDataType,
        selectedItem,
        fetchLocations,
        fetchMonitoringNetworkObservationTypes
    ]);

    return (
        <div
            className={styles.MainContainer}
            onClick={() => {
                toggleAlertMessage();
                closeDropdowns();
            }}
        >
            <div className={styles.MainHeader}>
                <Header
                    showProfileDropdown={showProfileDropdown}
                    showInboxDropdown={showInboxDropdown}
                    openProfileDropdown={openProfileDropdown}
                    openInboxDropdown={openInboxDropdown}
                    closeAllDropdowns={closeAllDropdowns}
                />
            </div>
            <div className={styles.MainBody}>
                <FilterBar
                    observationTypes={observationTypes}
                    organisations={organisations}
                    layercollections={layercollections}
                    projects={projects}
                    onDataTypeChange={onDataTypeChange}
                    currentDataType={currentDataType}
                />
                {currentDataType === "Raster" ? (
                    <>
                        <RasterList
                            searchTerm={searchTerm}
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
                ) : null}
                {currentDataType === "WMS" ? (
                    <>
                        <WMSList
                            searchTerm={searchTerm}
                            selectItem={props.selectItem}
                            updateBasketWithWMS={props.updateBasketWithWMS}
                            onPageClick={onPageClick}
                            onSearchChange={onSearchChange}
                            onSearchSubmit={onSearchSubmit}
                            onSorting={props.updateOrder}
                        />
                        <WMSDetails />
                    </>
                ) : null}
                {currentDataType === "Timeseries" ? (
                    <>
                        <MonitoringNetworkList
                            searchTerm={searchTerm}
                            selectItem={props.selectItem}
                            onPageClick={onPageClick}
                            onSearchChange={onSearchChange}
                            onSearchSubmit={onSearchSubmit}
                            onSorting={props.updateOrder}
                        />
                        <MonitoringNetworkDetails />
                    </>
                ) : null}
                {currentDataType === "Scenario" ? (
                    <>
                        <ScenarioList
                            searchTerm={searchTerm}
                            selectItem={props.selectItem}
                            updateBasketWithScenarios={props.updateBasketWithScenarios}
                            onPageClick={onPageClick}
                            onSearchChange={onSearchChange}
                            onSearchSubmit={onSearchSubmit}
                            onSorting={props.updateOrder}
                        />
                        <ScenarioDetails />
                    </>
                ) : null}
            </div>
            {/* ALERT POPUP */}
            {(
                currentRasterList && currentRasterList.showAlert === true
            ) || (
                currentWMSList && currentWMSList.showAlert === true
            ) || (
                currentMonitoringNetworkList && currentMonitoringNetworkList.showAlert === true
            ) || (
                currentScenariosList && currentScenariosList.showAlert === true
            ) ? (
                <AlertPopup toggleAlert={props.toggleAlert} />
            ) : null}
        </div>
    );
};

const mapDispatchToProps = (dispatch: RootDispatch) => ({
    fetchLizardBootstrap: () => dispatch(fetchLizardBootstrap()),
    fetchRaster: (uuid: string) => dispatch(fetchRaster(uuid)),
    fetchRasters: (
        page: number,
        searchTerm: string,
        organisationName: string,
        observationTypeParameter: string,
        layercollectionSlug: string,
        ordering: string
    ) => dispatch(fetchRasters(page, searchTerm, organisationName, observationTypeParameter, layercollectionSlug, ordering)),
    updateBasketWithRaster: (rasters: string[]) => dispatch(updateBasketWithRaster(rasters)),
    updateBasketWithWMS: (wmsLayers: string[]) => dispatch(updateBasketWithWMS(wmsLayers)),
    updateBasketWithScenarios: (scenarios: string[]) => dispatch(updateBasketWithScenarios(scenarios)),
    fetchObservationTypes: () => dispatch(fetchObservationTypes()),
    fetchOrganisations: () => dispatch(fetchOrganisations()),
    fetchUserOrganisations: (userId: number) => dispatch(fetchUserOrganisations(userId)),
    fetchLayercollections: () => dispatch(fetchLayercollections()),
    fetchProjects: () => dispatch(fetchProjects()),
    fetchWmsLayer: (uuid: string) => dispatch(fetchWmsLayer(uuid)),
    fetchWMSLayers: (
        page: number,
        searchTerm: string,
        organisationName: string,
        layercollectionSlug: string,
        ordering: string
    ) => dispatch(fetchWMSLayers(page, searchTerm, organisationName, layercollectionSlug, ordering)),
    fetchScenario: (uuid: string) => dispatch(fetchScenario(uuid)),
    fetchScenarios: (
        page: number,
        searchTerm: string,
        organisationName: string,
        projectName: string,
        ordering: string
    ) => dispatch(fetchScenarios(page, searchTerm, organisationName, projectName, ordering)),
    fetchMonitoringNetwork: (uuid: string) => dispatch(fetchMonitoringNetwork(uuid)),
    fetchMonitoringNetworks: (
        page: number,
        searchTerm: string,
        organisationName: string,
        ordering: string
    ) => dispatch(fetchMonitoringNetworks(page, searchTerm, organisationName, ordering)),
    fetchMonitoringNetworkObservationTypes: (uuid: string, signal?: AbortSignal) => dispatch(fetchMonitoringNetworkObservationTypes(uuid, signal)),
    fetchLocations: (uuid: string, signal?: AbortSignal) => dispatch(fetchLocations(uuid, signal)),
    selectItem: (uuid: string) => dispatch(selectItem(uuid)),
    switchDataType: (dataType: SwitchDataType['payload']) => dispatch(switchDataType(dataType)),
    toggleAlert: () => dispatch(toggleAlert()),
    requestInbox: () => dispatch(requestInbox()),
    updateSearch: (searchTerm: string) => dispatch(updateSearch(searchTerm)),
    removeSearch: () => dispatch(removeSearch()),
    updateOrder: (ordering: string) => dispatch(updateOrder(ordering)),
    removeOrder: () => dispatch(removeOrder()),
    updatePage: (page: number) => dispatch(updatePage(page)),
    selectOrganisation: (organisationName: string) => dispatch(selectOrganisation(organisationName)),
    selectLayercollection: (layercollectionSlug: string) => dispatch(selectLayercollection(layercollectionSlug)),
    selectProject: (project: string) => dispatch(selectProject(project)),
    selectObservationType: (observationTypeParameter: string) => dispatch(selectObservationType(observationTypeParameter)),
});
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

export default connect(null, mapDispatchToProps)(MainApp);