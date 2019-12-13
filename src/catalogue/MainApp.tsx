import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { fetchRasters, fetchObservationTypes, fetchOrganisations, fetchDatasets, fetchLizardBootstrap, switchDataType, selectItem, fetchWMSLayers, toggleAlert, updateBasketWithRaster, updateBasketWithWMS, requestInbox, updateSearch, updateOrder, updatePage, selectOrganisation, selectDataset, selectObservationType, fetchRasterByUUID, fetchWMSByUUID } from '../action';
import { MyStore, getCurrentRasterList, getObservationTypes, getOrganisations, getDatasets, getCurrentDataType, getCurrentWMSList } from '../reducers';
import { ObservationType, Organisation, Dataset, SwitchDataType } from '../interface';
import { getUrlParams, getSearch, getOrganisation, getObservationType, getDataset, getDataType, newURL, getUUID } from '../utils/getUrlParams';
import RasterList from './rasters/RasterList';
import RasterDetails from './rasters/RasterDetails';
import WMSList from './wms/WMSList';
import WMSDetails from './wms/WMSDetails';
import FilterBar from './FilterBar';
import Header from './Header';
import './styles/MainApp.css';

interface PropsFromState {
    currentRasterList: MyStore['currentRasterList'] | null,
    currentWMSList: MyStore['currentWMSList'] | null,
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
    fetchRasterByUUID: (uuid: string) => void,
    updateBasketWithRaster: (rasters: string[]) => void,
    updateBasketWithWMS: (wmsLayers: string[]) => void,
    fetchObservationTypes: () => void,
    fetchOrganisations: () => void,
    fetchDatasets: () => void,
    fetchWMSLayers: (page: number, searchTerm: string | null, organisationName: string | null, datasetSlug: string | null, ordering: string) => void,
    fetchWMSByUUID: (uuid: string) => void,
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

    async componentDidMount() {
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
        if (dataType === 'Raster') {
            this.props.fetchRasters(
                this.props.filters.page,
                search, organisation,
                observation,
                dataset,
                this.props.filters.ordering
            );
            //Fetch the raster by UUID from the url
            if (uuid) this.props.fetchRasterByUUID(uuid);
        } else { // dataType === 'WMS'
            this.props.fetchWMSLayers(
                this.props.filters.page,
                search,
                organisation,
                dataset,
                this.props.filters.ordering
            );
            //Fetch the WMS layer by UUID from the url
            if (uuid) this.props.fetchWMSByUUID(uuid);
        };
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
                nextProps.currentDataType === "Raster" ? nextFilters.observationType : '',
                nextFilters.dataset,
                nextProps.selectedItem
            );
            this.updateURL(url);
            if (nextFilters.page !== 1) this.props.updatePage(1);
            nextProps.currentDataType === "Raster" ? this.props.fetchRasters(
                1,
                nextFilters.searchTerm,
                nextFilters.organisation,
                nextFilters.observationType,
                nextFilters.dataset,
                nextFilters.ordering
            ) : this.props.fetchWMSLayers(
                1,
                nextFilters.searchTerm,
                nextFilters.organisation,
                nextFilters.dataset,
                nextFilters.ordering
            );
        } else if (nextProps.selectedItem !== this.props.selectedItem) {
            //If selected item is changed then update the URL only
            const url = newURL(
                nextProps.currentDataType,
                nextFilters.searchTerm,
                nextFilters.organisation,
                nextProps.currentDataType === "Raster" ? nextFilters.observationType : '',
                nextFilters.dataset,
                nextProps.selectedItem
            );
            this.updateURL(url);
        } else if (nextFilters.page !== filters.page) {
            //Fetch rasters/wms layers if page number changed without updating the URL
            nextProps.currentDataType === "Raster" ? this.props.fetchRasters(
                nextFilters.page,
                nextFilters.searchTerm,
                nextFilters.organisation,
                nextFilters.observationType,
                nextFilters.dataset,
                nextFilters.ordering
            ) : this.props.fetchWMSLayers(
                nextFilters.page,
                nextFilters.searchTerm,
                nextFilters.organisation,
                nextFilters.dataset,
                nextFilters.ordering
            );
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
                        :
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
                    }
                    {this.props.currentDataType === "Raster" ?
                        <RasterDetails
                            filters={this.props.filters}
                        />
                        :
                        <WMSDetails />
                    }
                </div>
                {/* ALERT POPUP */}
                <div
                    className="authorisation-alert"
                    style={{
                        display: (this.props.currentRasterList && this.props.currentRasterList.showAlert === true) || (this.props.currentWMSList && this.props.currentWMSList.showAlert === true) ? "flex" : "none"
                    }}
                    onClick={() => this.props.toggleAlert()}
                >
                    No Rasters/WMS layers found!
                    Please check your search selection
                    <br />
                    You may need to login or might have insufficient rights to view
                    the Rasters/WMS layers
                </div>
            </div>
        );
    };
};

const mapStateToProps = (state: MyStore): PropsFromState => ({
    currentRasterList: getCurrentRasterList(state),
    currentWMSList: getCurrentWMSList(state),
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
    fetchRasterByUUID: (uuid: string) => fetchRasterByUUID(uuid, dispatch),
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
    fetchWMSByUUID: (uuid: string) => fetchWMSByUUID(uuid, dispatch),
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