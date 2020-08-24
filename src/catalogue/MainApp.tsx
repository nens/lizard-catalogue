import * as React from 'react';
import { connect } from 'react-redux';
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
    fetchTimeseries,
    fetchLocations,
} from '../action';
import { MyStore, getCurrentRasterList, getObservationTypes, getOrganisations, getDatasets, getCurrentDataType, getCurrentWMSList, getCurrentMonitoringNetworkList } from '../reducers';
import { ObservationType, Organisation, Dataset, SwitchDataType } from '../interface';
import { getUrlParams, getSearch, getOrganisation, getObservationType, getDataset, getDataType, newURL, getUUID } from '../utils/getUrlParams';
import RasterList from './rasters/RasterList';
import RasterDetails from './rasters/RasterDetails';
import WMSList from './wms/WMSList';
import MonitoringNetworkList from './timeseries/MonitoringNetworkList';
import WMSDetails from './wms/WMSDetails';
import FilterBar from './FilterBar';
import Header from './Header';
import AlertPopup from './components/AlertPopup';
import './styles/MainApp.css';
import MonitoringNetworkDetails from './timeseries/MonitoringNetworkDetails';

interface PropsFromState {
    currentRasterList: MyStore['currentRasterList'] | null,
    currentWMSList: MyStore['currentWMSList'] | null,
    currentMonitoringNetworkList: MyStore['currentMonitoringNetworkList'] | null,
    observationTypes: ObservationType[],
    organisations: Organisation[],
    datasets: Dataset[],
    currentDataType: MyStore['currentDataType'],
    filters: MyStore['filters'],
    selectedItem: string,
};

interface PropsFromDispatch {
    fetchLizardBootstrap: () => void,
    selectItem: (uuid: string) => void,
    fetchRasters: (page: number, searchTerm: string | null, organisationName: string | null, observationTypeParameter: string | null, datasetSlug: string | null, ordering: string) => void,
    updateBasketWithRaster: (rasters: string[]) => void,
    updateBasketWithWMS: (wmsLayers: string[]) => void,
    fetchObservationTypes: () => void,
    fetchOrganisations: () => void,
    fetchDatasets: () => void,
    fetchWMSLayers: (page: number, searchTerm: string | null, organisationName: string | null, datasetSlug: string | null, ordering: string) => void,
    fetchMonitoringNetworks: (page: number, searchTerm: string | null, organisationName: string | null, observationType: string | null, ordering: string) => void,
    fetchTimeseries: (uuid: string) => void,
    fetchLocations: (uuid: string) => void,
    switchDataType: (dataType: SwitchDataType['payload']) => void,
    toggleAlert: () => void,
    requestInbox: () => void,
    updateSearch: (searchTerm: string) => void,
    updateOrder: (ordering: string) => void,
    updatePage: (page: number) => void,
    selectOrganisation: (organisationName: string) => void,
    selectDataset: (datasetSlug: string) => void,
    selectObservationType: (observationTypeParameter: string) => void,
};

type MainAppProps = PropsFromState & PropsFromDispatch & RouteComponentProps;

interface MyState {
    showProfileDropdown: boolean,
    showInboxDropdown: boolean,
    page: number,
    initialPage: number,
    searchTerm: string,
};

class MainApp extends React.Component<MainAppProps, MyState> {
    state: MyState = {
        showProfileDropdown: false,
        showInboxDropdown: false,
        page: 1,
        initialPage: 1,
        searchTerm: '',
    };

    toggleAlertMessage = () => {
        if (this.props.currentRasterList && this.props.currentRasterList.showAlert === true) this.props.toggleAlert();
        if (this.props.currentWMSList && this.props.currentWMSList.showAlert === true) this.props.toggleAlert();
        if (this.props.currentMonitoringNetworkList && this.props.currentMonitoringNetworkList.showAlert === true) this.props.toggleAlert();
    };

    closeModalsOnEsc = (e) => {
        if (e.key === "Escape") {
            window.location.href = "#";
        };
    };

    closeDropdowns = () => {
        this.state.showProfileDropdown && this.setState({
            showProfileDropdown: false,
        });
        this.state.showInboxDropdown && this.setState({
            showInboxDropdown: false,
        });
    };

    openProfileDropdown = () => {
        this.setState({
            showProfileDropdown: true,
            showInboxDropdown: false
        });
    };

    openInboxDropdown = () => {
        this.setState({
            showProfileDropdown: false,
            showInboxDropdown: true
        });
    };

    closeAllDropdowns = () => {
        this.setState({
            showProfileDropdown: false,
            showInboxDropdown: false
        });
    };

    onPageClick = (page: number) => {
        if (page < 1) return page = 1;
        this.props.updatePage(page);
    };

    onSearchChange = (event) => {
        this.setState({
            searchTerm: event.target.value
        });
    };

    onSearchSubmit = (event) => {
        event.preventDefault();
        this.props.updateSearch(this.state.searchTerm);
    };

    updateURL = (url: string) => {
        this.props.history.push(`${url}`);
    };

    //When switch the view from Rasters to WMS layers and vice versa, set the state of this main container back to initial state
    onDataTypeChange = (dataType: SwitchDataType['payload']) => {
        this.props.switchDataType(dataType);

        //Update Redux store and the component's state
        this.props.selectItem(''); // Remove the previous selected item
        this.props.updateSearch(''); // Remove the search input
        this.props.updatePage(1); // Go back to page 1 in the result list
        this.setState({
            searchTerm: ''
        });
    };

    componentDidMount() {
        //Fetch Lizard Bootstrap
        this.props.fetchLizardBootstrap();

        //Fetch all organisations, datasets and observation types
        this.props.fetchObservationTypes();
        this.props.fetchOrganisations();
        this.props.fetchDatasets();

        //When component first mount, capture the search params in the URL
        const urlSearchParams = getUrlParams(this.props.location.search);
        const dataType = getDataType(urlSearchParams);
        const search = getSearch(urlSearchParams);
        const organisation = getOrganisation(urlSearchParams);
        const observation = getObservationType(urlSearchParams);
        const dataset = getDataset(urlSearchParams);
        const uuid = getUUID(urlSearchParams);

        //Update Redux filters with URL parameters
        this.props.updateSearch(search);
        this.props.selectOrganisation(organisation);
        this.props.selectDataset(dataset);
        this.props.selectObservationType(observation);
        this.props.switchDataType(dataType);
        this.props.selectItem(uuid);

        //Update the search term in MainApp's state to show the search input
        this.setState({
            searchTerm: search
        });

        //Poll the inbox regularly with timer set inside the action creator
        this.props.requestInbox();

        //Fetch relevant data for Rasters or WMS layers or Timeseries monitoring networks
        if (dataType === 'Raster') {
            this.props.fetchRasters(
                this.props.filters.page,
                search, organisation,
                observation,
                dataset,
                this.props.filters.ordering
            );
        } else if (dataType === 'WMS') {
            this.props.fetchWMSLayers(
                this.props.filters.page,
                search,
                organisation,
                dataset,
                this.props.filters.ordering
            );
        } else { // dataType === 'Timeseries'
            this.props.fetchMonitoringNetworks(
                this.props.filters.page,
                search,
                organisation,
                observation,
                this.props.filters.ordering
            );
            // Fetch the list of timeseries and locations by UUID of selected monitoring network
            if (uuid) {
                this.props.fetchTimeseries(uuid);
                this.props.fetchLocations(uuid);
            };
        };

        //Add event listener to use ESC to close a modal
        window.addEventListener("keydown", this.closeModalsOnEsc);
    };

    componentWillUnmount() {
        window.removeEventListener("keydown", this.closeModalsOnEsc);
    };

    componentWillUpdate(nextProps: MainAppProps) {
        const { currentDataType, filters } = this.props;
        const nextFilters = nextProps.filters;
        if (
            nextProps.currentDataType !== currentDataType ||
            nextFilters.searchTerm !== filters.searchTerm ||
            nextFilters.organisation !== filters.organisation ||
            nextFilters.dataset !== filters.dataset ||
            nextFilters.observationType !== filters.observationType ||
            nextFilters.ordering !== filters.ordering
        ) {
            const url = newURL(
                nextProps.currentDataType,
                nextFilters.searchTerm,
                nextFilters.organisation,
                nextProps.currentDataType === "WMS" ? '' : nextFilters.observationType,
                nextProps.currentDataType === "Timeseries" ? '': nextFilters.dataset,
                nextProps.selectedItem
            );
            this.updateURL(url);
            if (nextFilters.page !== 1) this.props.updatePage(1);
            if (nextProps.currentDataType === "Raster") {
                this.props.fetchRasters(
                    1,
                    nextFilters.searchTerm,
                    nextFilters.organisation,
                    nextFilters.observationType,
                    nextFilters.dataset,
                    nextFilters.ordering
                );
            } else if (nextProps.currentDataType === "WMS") {
                this.props.fetchWMSLayers(
                    1,
                    nextFilters.searchTerm,
                    nextFilters.organisation,
                    nextFilters.dataset,
                    nextFilters.ordering
                );
            } else { //dataType === "Timeseries"
                this.props.fetchMonitoringNetworks(
                    1,
                    nextFilters.searchTerm,
                    nextFilters.organisation,
                    nextFilters.observationType,
                    nextFilters.ordering
                );
            };
        } else if (nextProps.selectedItem !== this.props.selectedItem) {
            //If selected item is changed then update the URL only
            const url = newURL(
                nextProps.currentDataType,
                nextFilters.searchTerm,
                nextFilters.organisation,
                nextProps.currentDataType === "WMS" ? '' : nextFilters.observationType,
                nextProps.currentDataType === "Timeseries" ? '': nextFilters.dataset,
                nextProps.selectedItem
            );
            this.updateURL(url);

            //Fetch timeseries and locations based on the selected monitoring network
            if (currentDataType === "Timeseries") {
                this.props.fetchTimeseries(nextProps.selectedItem);
                this.props.fetchLocations(nextProps.selectedItem);
            };
        } else if (nextFilters.page !== filters.page) {
            //Fetch rasters/wms layers if page number changed without updating the URL
            if (nextProps.currentDataType === "Raster") {
                this.props.fetchRasters(
                    nextFilters.page,
                    nextFilters.searchTerm,
                    nextFilters.organisation,
                    nextFilters.observationType,
                    nextFilters.dataset,
                    nextFilters.ordering
                );
            } else if (nextProps.currentDataType === "WMS") {
                this.props.fetchWMSLayers(
                    nextFilters.page,
                    nextFilters.searchTerm,
                    nextFilters.organisation,
                    nextFilters.dataset,
                    nextFilters.ordering
                );
            } else { //dataType === "Timeseries"
                this.props.fetchMonitoringNetworks(
                    nextFilters.page,
                    nextFilters.searchTerm,
                    nextFilters.organisation,
                    nextFilters.observationType,
                    nextFilters.ordering
                );
            };
        };
    };

    render() {
        return (
            <div
                className="main-container"
                onClick={() => {
                    this.toggleAlertMessage();
                    this.closeDropdowns();
                }}
            >
                <div className="main-header">
                    <Header
                        showProfileDropdown={this.state.showProfileDropdown}
                        showInboxDropdown={this.state.showInboxDropdown}
                        toggleAlertMessage={this.toggleAlertMessage}
                        openProfileDropdown={this.openProfileDropdown}
                        openInboxDropdown={this.openInboxDropdown}
                        closeAllDropdowns={this.closeAllDropdowns}
                    />
                </div>
                <div className="main-body">
                    <FilterBar
                        observationTypes={this.props.observationTypes}
                        organisations={this.props.organisations}
                        datasets={this.props.datasets}
                        onDataTypeChange={this.onDataTypeChange}
                        currentDataType={this.props.currentDataType}
                    />
                    {this.props.currentDataType === "Raster" ?
                        <>
                            <RasterList
                                searchTerm={this.state.searchTerm}
                                currentRasterList={this.props.currentRasterList}
                                selectItem={this.props.selectItem}
                                updateBasketWithRaster={this.props.updateBasketWithRaster}
                                onPageClick={this.onPageClick}
                                onSearchChange={this.onSearchChange}
                                onSearchSubmit={this.onSearchSubmit}
                                onSorting={this.props.updateOrder}
                            />
                            <RasterDetails
                                filters={this.props.filters}
                            />
                        </>
                    : null}
                    {this.props.currentDataType === "WMS" ?
                        <>
                            <WMSList
                                searchTerm={this.state.searchTerm}
                                currentWMSList={this.props.currentWMSList}
                                selectItem={this.props.selectItem}
                                updateBasketWithWMS={this.props.updateBasketWithWMS}
                                onPageClick={this.onPageClick}
                                onSearchChange={this.onSearchChange}
                                onSearchSubmit={this.onSearchSubmit}
                                onSorting={this.props.updateOrder}
                            />
                            <WMSDetails />
                        </>
                    : null}
                    {this.props.currentDataType === "Timeseries" ?
                        <>
                            <MonitoringNetworkList
                                searchTerm={this.state.searchTerm}
                                currentMonitoringNetworkList={this.props.currentMonitoringNetworkList}
                                selectItem={this.props.selectItem}
                                onPageClick={this.onPageClick}
                                onSearchChange={this.onSearchChange}
                                onSearchSubmit={this.onSearchSubmit}
                                onSorting={this.props.updateOrder}
                            />
                            <MonitoringNetworkDetails />
                        </>
                    : null}
                </div>
                {/* ALERT POPUP */}
                {(
                    this.props.currentRasterList && this.props.currentRasterList.showAlert === true
                ) || (
                    this.props.currentWMSList && this.props.currentWMSList.showAlert === true
                ) || (
                    this.props.currentMonitoringNetworkList && this.props.currentMonitoringNetworkList.showAlert === true
                ) ? (
                    <AlertPopup toggleAlert={this.props.toggleAlert} />
                ) : null}
            </div>
        );
    };
};

const mapStateToProps = (state: MyStore): PropsFromState => ({
    currentRasterList: getCurrentRasterList(state),
    currentWMSList: getCurrentWMSList(state),
    currentMonitoringNetworkList: getCurrentMonitoringNetworkList(state),
    observationTypes: getObservationTypes(state),
    organisations: getOrganisations(state),
    datasets: getDatasets(state),
    currentDataType: getCurrentDataType(state),
    filters: state.filters,
    selectedItem: state.selectedItem,
});

const mapDispatchToProps = (dispatch): PropsFromDispatch => ({
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
        observationType: string,
        ordering: string
    ) => fetchMonitoringNetworks(page, searchTerm, organisationName, observationType, ordering, dispatch),
    fetchTimeseries: (uuid: string) => fetchTimeseries(uuid, dispatch),
    fetchLocations: (uuid: string) => fetchLocations(uuid, dispatch),
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

export default connect(mapStateToProps, mapDispatchToProps)(MainApp);