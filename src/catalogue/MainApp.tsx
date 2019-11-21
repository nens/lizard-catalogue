import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Dispatch } from 'redux';
import { fetchRasters, fetchObservationTypes, fetchOrganisations, fetchDatasets, fetchLizardBootstrap, switchDataType, selectItem, fetchWMSLayers, updateOrganisationRadiobutton, updateObservationTypeRadiobutton, updateDatasetRadiobutton, toggleAlert, updateBasketWithRaster, updateBasketWithWMS } from '../action';
import { MyStore, getCurrentRasterList, getObservationTypes, getOrganisations, getDatasets, getCurrentDataType, getCurrentWMSList } from '../reducers';
import { RasterActionType, ObservationType, Organisation, Dataset, FilterActionType, SwitchDataType, UpdateRadiobuttonActionType } from '../interface';
import { getUrlParams, getSearch, getOrganisation, getObservationType, getDataset, getDataType, newURL } from '../utils/getUrlParams';
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
};

interface PropsFromDispatch {
    fetchLizardBootstrap: () => void,
    selectItem: (uuid: string) => void,
    fetchRasters: (page: number, searchTerm: string, organisationName: string, observationTypeParameter: string, datasetSlug: string, ordering: string) => void,
    updateBasketWithRaster: (rasters: string[]) => void,
    updateBasketWithWMS: (wmsLayers: string[]) => void,
    fetchObservationTypes: (parameter: ObservationType['parameter']) => void,
    fetchOrganisations: (name: Organisation['name']) => void,
    fetchDatasets: (slug: Dataset['slug']) => void,
    updateObservationTypeRadiobutton: (parameter: ObservationType['parameter']) => void,
    updateOrganisationRadiobutton: (name: Organisation['name']) => void,
    updateDatasetRadiobutton: (slug: Dataset['slug']) => void,
    fetchWMSLayers: (page: number, searchTerm: string, organisationName: string, datasetSlug: string, ordering: string) => void,
    switchDataType: (dataType: SwitchDataType['payload']) => void,
    toggleAlert: () => void,
};

type MainAppProps = PropsFromState & PropsFromDispatch & RouteComponentProps;

interface MyState {
    showProfileDropdown: boolean,
    showInboxDropdown: boolean,
    page: number,
    initialPage: number,
    searchTerm: string,
    organisationName: string,
    observationType: string,
    datasetSlug: string,
    ordering: string,
};

class MainApp extends React.Component<MainAppProps, MyState> {
    state: MyState = {
        showProfileDropdown: false,
        showInboxDropdown: false,
        page: 1,
        initialPage: 1,
        searchTerm: '',
        organisationName: '',
        observationType: '',
        datasetSlug: '',
        ordering: '',
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
        this.props.currentDataType === "Raster" ? this.props.fetchRasters(
            page,
            this.state.searchTerm,
            this.state.organisationName,
            this.state.observationType,
            this.state.datasetSlug,
            this.state.ordering
        ) : this.props.fetchWMSLayers(
            page,
            this.state.searchTerm,
            this.state.organisationName,
            this.state.datasetSlug,
            this.state.ordering
        );
        this.setState({
            page: page,
        });
    };

    onSearchChange = (event) => {
        this.setState({
            searchTerm: event.target.value
        });
    };

    onSearchSubmit = (event) => {
        event.preventDefault();
        this.setState({
            page: 1
        });

        this.props.currentDataType === "Raster" ? this.props.fetchRasters(
            this.state.initialPage,
            this.state.searchTerm,
            this.state.organisationName,
            this.state.observationType,
            this.state.datasetSlug,
            this.state.ordering
        ) : this.props.fetchWMSLayers(
            this.state.page,
            this.state.searchTerm,
            this.state.organisationName,
            this.state.datasetSlug,
            this.state.ordering
        );
        //Update the URL search params with the new search term
        const url = newURL(
            this.props.currentDataType,
            this.state.searchTerm,
            this.state.organisationName,
            this.state.observationType,
            this.state.datasetSlug
        );
        this.updateURL(url);
    };

    updateURL = (url: string) => {
        this.props.history.push(`${url}`);
    };

    //When click on the radio button in the filter bar, this function will dispatch an action to toggle the checked property of the observation type
    //and update the observation type state in this component
    onObservationTypeRadiobutton = (obsType: ObservationType) => {
        this.props.updateObservationTypeRadiobutton(obsType.parameter);
        if (!obsType.checked) {
            this.setState({
                observationType: obsType.parameter
            });
        } else {
            this.setState({
                observationType: ''
            });
        };
        //Update the URL search params with the selected observation type
        const url = newURL(
            this.props.currentDataType,
            this.state.searchTerm,
            this.state.organisationName,
            (!obsType.checked ? obsType.parameter : ''),
            this.state.datasetSlug
        );
        this.updateURL(url);
    };

    //Submit the search in observation type filter bar will update the radio button and set the observationType state of this component
    //then update the URL search params
    onObservationTypeSearchSubmit = (obsTypeParameter: string) => {
        this.props.updateObservationTypeRadiobutton(obsTypeParameter);
        this.setState({
            observationType: obsTypeParameter
        });
        //Update the URL search params with the selected observation type
        const url = newURL(
            this.props.currentDataType,
            this.state.searchTerm,
            this.state.organisationName,
            obsTypeParameter,
            this.state.datasetSlug
        );
        this.updateURL(url);
    };

    //When click on the radio button in the filter bar, this function will dispatch an action to toggle the checked property of the organisation
    //and update the organisation name state in this component
    onOrganisationRadiobutton = (organisation: Organisation) => {
        this.props.updateOrganisationRadiobutton(organisation.name);
        if (!organisation.checked) {
            this.setState({
                organisationName: organisation.name
            });
        } else {
            this.setState({
                organisationName: ''
            });
        };
        //Update the URL search params with the selected organisation
        const url = newURL(
            this.props.currentDataType,
            this.state.searchTerm,
            (!organisation.checked ? organisation.name : ''),
            this.state.observationType,
            this.state.datasetSlug
        );
        this.updateURL(url);
    };

    //Submit the search in organisation filter bar will update the radio button and set the organisationName state of this component
    //then update the URL search params
    onOrganisationSearchSubmit = (organisationName: string) => {
        this.props.updateOrganisationRadiobutton(organisationName);
        this.setState({
            organisationName: organisationName
        });
        //Update the URL search params with the selected organisation
        const url = newURL(
            this.props.currentDataType,
            this.state.searchTerm,
            organisationName,
            this.state.observationType,
            this.state.datasetSlug
        );
        this.updateURL(url);
    };

    //When click on the radio button in the filter bar, this function will dispatch an action to toggle the checked property of the dataset
    //and update the dataset state in this component
    onDatasetRadiobutton = (dataset: Dataset) => {
        this.props.updateDatasetRadiobutton(dataset.slug);
        if (!dataset.checked) {
            this.setState({
                datasetSlug: dataset.slug
            });
        } else {
            this.setState({
                datasetSlug: ''
            });
        };
        //Update the URL search params with the selected dataset
        const url = newURL(
            this.props.currentDataType,
            this.state.searchTerm,
            this.state.organisationName,
            this.state.observationType,
            (!dataset.checked ? dataset.slug : '')
        );
        this.updateURL(url);
    };

    //Submit the search in dataset filter bar will update the radio button and set the datasetSlug state of this component
    //then update the URL search params
    onDatasetSearchSubmit = (datasetSlug: string) => {
        this.props.updateDatasetRadiobutton(datasetSlug);
        this.setState({
            datasetSlug: datasetSlug
        });
        //Update the URL search params with the selected dataset
        const url = newURL(
            this.props.currentDataType,
            this.state.searchTerm,
            this.state.organisationName,
            this.state.observationType,
            datasetSlug
        );
        this.updateURL(url);
    };

    //When click on the sorting icon in the raster list, this function will update the ordering state in this component
    onSorting = (ordering: string) => {
        //Sorting rasters in 2 ways if user clicks on the sorting icon multiple times
        if (ordering !== this.state.ordering) {
            this.setState({
                ordering: ordering
            });
        } else {
            this.setState({
                ordering: `-${ordering}`
            });
        };
    };

    //When switch the view from Rasters to WMS layers and vice versa, set the state of this main container back to initial state
    onDataTypeChange = (dataType: SwitchDataType['payload']) => {
        const {
            organisationName,
            observationType,
            datasetSlug,
            ordering
        } = this.state;

        //Switching the data type
        this.props.switchDataType(dataType);

        //Fetch rasters or WMS layers based on selected data type and update the URL
        dataType === 'Raster' ? this.props.fetchRasters(
            1,
            '',
            organisationName,
            observationType,
            datasetSlug,
            ordering
        ) : this.props.fetchWMSLayers(
            1,
            '',
            organisationName,
            datasetSlug,
            ordering
        );
        //Update the URL
        const url = newURL(
            dataType,
            '',
            organisationName,
            //Update the URL with selected observation type or not
            dataType === 'Raster' ? observationType : '',
            datasetSlug,
        );
        this.updateURL(url);

        //Reset the state
        this.setState({
            page: 1,
            searchTerm: ''
        });
    };

    async componentDidMount() {
        //When component first mount, capture the search params in the URL and update the component's state
        const urlSearchParams = getUrlParams(this.props.location.search);
        const search = getSearch(urlSearchParams);
        const organisation = getOrganisation(urlSearchParams);
        const observation = getObservationType(urlSearchParams);
        const dataset = getDataset(urlSearchParams);
        this.setState({
            searchTerm: search,
            organisationName: organisation,
            observationType: observation,
            datasetSlug: dataset
        });

        const dataType = getDataType(urlSearchParams);
        //Dispatch the switchDataType action to update the currentDataType state in Redux store with the data param
        this.props.switchDataType(dataType);

        //Fetch Lizard Bootstrap
        this.props.fetchLizardBootstrap();

        //Fetch Rasters or WMS layers depends on the selected data type
        dataType === 'Raster' ? this.props.fetchRasters(
            this.state.page, search, organisation, observation, dataset, this.state.ordering
        ) : this.props.fetchWMSLayers(
            this.state.page, search, organisation, dataset, this.state.ordering
        );
    };

    //Component will fetch the Rasters again each time the value of this.state.organisationName or observation type or dataset changes
    componentWillUpdate(nextProps: MainAppProps, nextState: MyState) {
        if (nextProps && (nextState.organisationName !== this.state.organisationName || nextState.observationType !== this.state.observationType || nextState.datasetSlug !== this.state.datasetSlug || nextState.ordering !== this.state.ordering)) {
            this.props.currentDataType === "Raster" ? this.props.fetchRasters(
                this.state.initialPage,
                this.state.searchTerm,
                nextState.organisationName,
                nextState.observationType,
                nextState.datasetSlug,
                nextState.ordering
            ) : this.props.fetchWMSLayers(
                this.state.initialPage,
                this.state.searchTerm,
                nextState.organisationName,
                nextState.datasetSlug,
                nextState.ordering
            );
            this.setState({
                page: 1
            });
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
                        fetchObservationTypes={this.props.fetchObservationTypes}
                        observationTypes={this.props.observationTypes}
                        fetchOrganisations={this.props.fetchOrganisations}
                        organisations={this.props.organisations}
                        fetchDatasets={this.props.fetchDatasets}
                        datasets={this.props.datasets}
                        onObservationTypeRadiobutton={this.onObservationTypeRadiobutton}
                        onOrganisationRadiobutton={this.onOrganisationRadiobutton}
                        onDatasetRadiobutton={this.onDatasetRadiobutton}
                        onOrganisationSearchSubmit={this.onOrganisationSearchSubmit}
                        onObservationTypeSearchSubmit={this.onObservationTypeSearchSubmit}
                        onDatasetSearchSubmit={this.onDatasetSearchSubmit}
                        onDataTypeChange={this.onDataTypeChange}
                        fetchRasters={this.props.fetchRasters}
                        fetchWMSLayers={this.props.fetchWMSLayers}
                        currentDataType={this.props.currentDataType}
                    />
                    {this.props.currentDataType === "Raster" ?
                        <RasterList
                            searchTerm={this.state.searchTerm}
                            page={this.state.page}
                            currentRasterList={this.props.currentRasterList}
                            selectItem={this.props.selectItem}
                            updateBasketWithRaster={this.props.updateBasketWithRaster}
                            onPageClick={this.onPageClick}
                            onSearchChange={this.onSearchChange}
                            onSearchSubmit={this.onSearchSubmit}
                            onSorting={this.onSorting}
                        />
                        :
                        <WMSList
                            searchTerm={this.state.searchTerm}
                            page={this.state.page}
                            currentWMSList={this.props.currentWMSList}
                            selectItem={this.props.selectItem}
                            updateBasketWithWMS={this.props.updateBasketWithWMS}
                            onPageClick={this.onPageClick}
                            onSearchChange={this.onSearchChange}
                            onSearchSubmit={this.onSearchSubmit}
                            onSorting={this.onSorting}
                        />
                    }
                    {this.props.currentDataType === "Raster" ?
                        <RasterDetails
                            datasets={this.props.datasets}
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
});

const mapDispatchToProps = (dispatch: Dispatch<RasterActionType | FilterActionType | UpdateRadiobuttonActionType>): PropsFromDispatch => ({
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
    fetchObservationTypes: (parameter: ObservationType['parameter']) => fetchObservationTypes(parameter, dispatch),
    fetchOrganisations: (name: Organisation['name']) => fetchOrganisations(name, dispatch),
    fetchDatasets: (slug: Dataset['slug']) => fetchDatasets(slug, dispatch),
    updateObservationTypeRadiobutton: (parameter: ObservationType['parameter']) => updateObservationTypeRadiobutton(parameter, dispatch),
    updateOrganisationRadiobutton: (name: Organisation['name']) => updateOrganisationRadiobutton(name, dispatch),
    updateDatasetRadiobutton: (slug: Dataset['slug']) => updateDatasetRadiobutton(slug, dispatch),
    fetchWMSLayers: (page: number, searchTerm: string, organisationName: string, datasetSlug: string, ordering: string) => fetchWMSLayers(page, searchTerm, organisationName, datasetSlug, ordering, dispatch),
    selectItem: (uuid: string) => selectItem(uuid, dispatch),
    switchDataType: (dataType: SwitchDataType['payload']) => switchDataType(dataType, dispatch),
    toggleAlert: () => toggleAlert(dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(MainApp);