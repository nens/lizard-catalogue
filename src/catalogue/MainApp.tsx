import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Dispatch } from 'redux';
import { fetchRasters, fetchObservationTypes, fetchOrganisations, fetchDatasets, fetchLizardBootstrap, switchDataType, selectItem, fetchWMSLayers, toggleAlert, updateBasketWithRaster, updateBasketWithWMS, updateSearch, updateOrder, updatePage } from '../action';
import { MyStore, getCurrentRasterList, getObservationTypes, getOrganisations, getDatasets, getCurrentDataType, getCurrentWMSList } from '../reducers';
import { RasterActionType, ObservationType, Organisation, Dataset, FilterActionType, SwitchDataType } from '../interface';
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
    selectedItem: MyStore['selectedItem'],
};

interface PropsFromDispatch {
    fetchLizardBootstrap: () => void,
    selectItem: (uuid: string | null) => void,
    fetchRasters: (page: number, searchTerm: string | null, organisationName: string | null, observationTypeParameter: string | null, datasetSlug: string | null, ordering: string) => void,
    updateBasketWithRaster: (rasters: string[]) => void,
    updateBasketWithWMS: (wmsLayers: string[]) => void,
    fetchObservationTypes: () => void,
    fetchOrganisations: () => void,
    fetchDatasets: () => void,
    fetchWMSLayers: (page: number, searchTerm: string | null, organisationName: string | null, datasetSlug: string | null, ordering: string) => void,
    switchDataType: (dataType: SwitchDataType['payload']) => void,
    toggleAlert: () => void,
    updateSearch: (searchTerm: string) => void,
    updateOrder: (ordering: string) => void,
    updatePage: (page: number) => void,
};

type MainAppProps = PropsFromState & PropsFromDispatch & RouteComponentProps;

interface MyState {
    showProfileDropdown: boolean,
    searchTerm: string,
};

class MainApp extends React.Component<MainAppProps, MyState> {
    state: MyState = {
        showProfileDropdown: false,
        searchTerm: '',
    };

    toggleProfileDropdownAndAlertMessage = (event) => {
        if (this.props.currentRasterList && this.props.currentRasterList.showAlert === true) this.props.toggleAlert();
        if (this.props.currentWMSList && this.props.currentWMSList.showAlert === true) this.props.toggleAlert();
        return event.target.id === "user-profile" ?
            this.setState({ showProfileDropdown: !this.state.showProfileDropdown }) :
            this.setState({ showProfileDropdown: false });
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

        //Reset the search and page in state and Redux store
        this.props.selectItem(null);
        this.props.updateSearch('');
        this.props.updatePage(1);
        this.setState({
            searchTerm: ''
        });
    };

    async componentDidMount() {
        //When component first mount, capture the search params in the URL
        const urlSearchParams = getUrlParams(this.props.location.search);
        const search = getSearch(urlSearchParams);
        const organisation = getOrganisation(urlSearchParams);
        const observation = getObservationType(urlSearchParams);
        const dataset = getDataset(urlSearchParams);
        const uuid = getUUID(urlSearchParams);

        //Update the Redux store and MainApp's state
        this.props.selectItem(uuid);
        this.props.updateSearch(search);
        this.setState({
            searchTerm: search
        });

        const dataType = getDataType(urlSearchParams);
        //Dispatch the switchDataType action to update the currentDataType state in Redux store with the data param
        this.props.switchDataType(dataType);

        //Fetch Lizard Bootstrap
        this.props.fetchLizardBootstrap();

        //Fetch Rasters or WMS layers depends on the selected data type
        dataType === 'Raster' ? this.props.fetchRasters(
            this.props.filters.page, search, organisation, observation, dataset, this.props.filters.ordering
        ) : this.props.fetchWMSLayers(
            this.props.filters.page, search, organisation, dataset, this.props.filters.ordering
        );
    };

    componentWillUpdate(nextProps: MainAppProps) {
        const { currentDataType, filters, selectedItem } = this.props;
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
                nextProps.selectedItem,
            );
            this.updateURL(url);
            this.props.updatePage(1);
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
        } else if (nextFilters.page !== filters.page) {
            //Fetch rasters/wms layers if page number changed
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
        } else if (nextProps.selectedItem !== selectedItem) {
            const url = newURL(
                nextProps.currentDataType,
                nextFilters.searchTerm,
                nextFilters.organisation,
                nextProps.currentDataType === "Raster" ? nextFilters.observationType : '',
                nextFilters.dataset,
                nextProps.selectedItem,
            );
            this.updateURL(url);
        };
    };

    render() {
        return (
            <div className="main-container" onClick={this.toggleProfileDropdownAndAlertMessage}>
                <div className="main-header">
                    <Header
                        showProfileDropdown={this.state.showProfileDropdown}
                        toggleProfileDropdown={this.toggleProfileDropdownAndAlertMessage}
                    />
                </div>
                <div className="main-body">
                    <FilterBar
                        fetchObservationTypes={this.props.fetchObservationTypes}
                        observationTypes={this.props.observationTypes}
                        fetchOrganisations={this.props.fetchOrganisations}
                        organisations={this.props.organisations}
                        fetchDatasets={this.props.fetchDatasets}
                        datasets={this.props.datasets}
                        onDataTypeChange={this.onDataTypeChange}
                        fetchRasters={this.props.fetchRasters}
                        fetchWMSLayers={this.props.fetchWMSLayers}
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

const mapDispatchToProps = (dispatch: Dispatch<RasterActionType | FilterActionType>): PropsFromDispatch => ({
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
    selectItem: (uuid: string | null) => selectItem(uuid, dispatch),
    switchDataType: (dataType: SwitchDataType['payload']) => switchDataType(dataType, dispatch),
    toggleAlert: () => toggleAlert(dispatch),
    updateSearch: (searchTerm: string) => updateSearch(dispatch, searchTerm),
    updateOrder: (ordering: string) => updateOrder(dispatch, ordering),
    updatePage: (page: number) => updatePage(dispatch, page),
});

export default connect(mapStateToProps, mapDispatchToProps)(MainApp);