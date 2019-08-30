import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Dispatch } from 'redux';
import { fetchRasters, updateBasket, fetchObservationTypes, fetchOrganisations, fetchLizardBootstrap, switchDataType, selectItem, fetchWMSLayers, updateOrganisationCheckbox, updateObservationTypeCheckbox } from '../action';
import { MyStore, getCurrentRasterList, getObservationTypes, getOrganisations, getCurrentDataType, getCurrentWMSList } from '../reducers';
import { RasterActionType, ObservationType, Organisation, Basket, FilterActionType, SwitchDataType, UpdateCheckboxActionType } from '../interface';
import { getUrlParams, getSearch, getOrganisation, getObservationType, getDataType } from '../utils/getUrlParams';
import RasterList from './rasters/RasterList';
import RasterDetails from './rasters/RasterDetails';
import WMSList from './wms/WMSList';
import WMSDetails from './wms/WMSDetails';
import FilterBar from './FilterBar';
import Header from './Header';
import { baseUrl } from '../api';
import './styles/MainApp.css';

interface PropsFromState {
    currentRasterList: MyStore['currentRasterList'] | null,
    currentWMSList: MyStore['currentWMSList'] | null,
    observationTypes: ObservationType[],
    organisations: Organisation[],
    currentDataType: MyStore['currentDataType'],
};

interface PropsFromDispatch {
    fetchLizardBootstrap: () => void,
    selectItem: (uuid: string) => void,
    fetchRasters: (page: number, searchTerm: string, organisationName: string, observationTypeParameter: string, ordering: string) => void,
    updateBasket: (basket: MyStore['basket']) => void,
    fetchObservationTypes: () => void,
    fetchOrganisations: () => void,
    updateObservationTypeCheckbox: (parameter: ObservationType['parameter']) => void,
    updateOrganisationCheckbox: (name: Organisation['name']) => void,
    fetchWMSLayers: (page: number, searchTerm: string, organisationName: string, ordering: string) => void,
    switchDataType: (dataType: SwitchDataType['payload']) => void
};

type MainAppProps = PropsFromState & PropsFromDispatch & RouteComponentProps;

interface MyState {
    showProfileDropdown: boolean,
    page: number,
    initialPage: number,
    searchTerm: string,
    organisationName: string,
    observationType: string,
    ordering: string,
    showAlert: boolean,
};

class MainApp extends React.Component<MainAppProps, MyState> {
    state: MyState = {
        showProfileDropdown: false,
        page: 1,
        initialPage: 1,
        searchTerm: '',
        organisationName: '',
        observationType: '',
        ordering: '',
        showAlert: false,
    };

    toggleProfileDropdownAndAlertMessage = (event) => {
        if (this.state.showAlert === true) this.setState({ showAlert: false });
        return event.target.id === "user-profile" ?
            this.setState({ showProfileDropdown: !this.state.showProfileDropdown }) :
            this.setState({ showProfileDropdown: false });
    };

    onPageClick = (page: number) => {
        if (page < 1) return page = 1;
        this.props.currentDataType === "Raster" ? 
            this.props.fetchRasters(page, this.state.searchTerm, this.state.organisationName, this.state.observationType, this.state.ordering) :
            this.props.fetchWMSLayers(page, this.state.searchTerm, this.state.organisationName, this.state.ordering);
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

        this.props.currentDataType === "Raster" ? 
            this.props.fetchRasters(this.state.initialPage, this.state.searchTerm, this.state.organisationName, this.state.observationType, this.state.ordering) :
            this.props.fetchWMSLayers(this.state.page, this.state.searchTerm, this.state.organisationName, this.state.ordering);
        //Update the URL search params with the new search term
        this.props.history.push(`?data=${this.props.currentDataType}${this.state.searchTerm === '' ? '' : `&search=${this.state.searchTerm}`}${this.state.organisationName === '' ? '' : `&organisation=${this.state.organisationName}`}${this.state.observationType === '' ? '' : `&observation=${this.state.observationType}`}`);
    };

    //When click on the checkbox in the filter bar, this function will dispatch an action to toggle the checked property of the observation type
    //and update the observation type state in this component
    onObservationTypeCheckbox = (obsType: ObservationType) => {
        this.props.updateObservationTypeCheckbox(obsType.parameter);
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
        this.props.history.push(`?data=${this.props.currentDataType}${this.state.searchTerm === '' ? '' : `&search=${this.state.searchTerm}`}${this.state.organisationName === '' ? '' : `&organisation=${this.state.organisationName}`}${obsType.checked ? '' : `&observation=${obsType.parameter}`}`);
    };

    //When click on the checkbox in the filter bar, this function will dispatch an action to toggle the checked property of the organisation
    //and update the organisation name state in this component
    onOrganisationCheckbox = (organisation: Organisation) => {
        this.props.updateOrganisationCheckbox(organisation.name);
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
        this.props.history.push(`?data=${this.props.currentDataType}${this.state.searchTerm === '' ? '' : `&search=${this.state.searchTerm}`}${organisation.checked ? '' : `&organisation=${organisation.name}`}${this.state.observationType === '' ? '' : `&observation=${this.state.observationType}`}`);
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
    onDataTypeChange = () => {
        this.setState({
            page: 1,
            searchTerm: '',
            organisationName: '',
            observationType: '',
            ordering: '',
        });
    };

    async componentDidMount() {
        //When component first mount, capture the search params in the URL and update the component's state
        const urlSearchParams = getUrlParams(this.props.location.search);
        const search = getSearch(urlSearchParams);
        const organisation = getOrganisation(urlSearchParams);
        const observation = getObservationType(urlSearchParams);
        this.setState({
            searchTerm: search,
            organisationName: organisation,
            observationType: observation
        });

        const dataType = getDataType(urlSearchParams);
        //Dispatch the switchDataType action to update the currentDataType state in Redux store with the data param
        this.props.switchDataType(dataType);

        //Fetch Lizard Bootstrap
        this.props.fetchLizardBootstrap();

        //Fetch Rasters or WMS layers depends on the selected data type
        dataType === 'Raster' ? this.props.fetchRasters(
            this.state.page, search, organisation, observation, this.state.ordering
        ) : this.props.fetchWMSLayers(
            this.state.page, search, organisation, this.state.ordering
        );

        //Do an attempt to fetch Rasters/WMS layers and see if there are any results back
        //If no raster or WMS layer returns back then display an alert to users to warn them about their authorisation right
        //This alert only shows once when you open the app
        if (dataType === 'Raster') {
            const response = await fetch(`${baseUrl}/rasters?name__icontains=${search}&page=${this.state.page}&organisation__name__icontains=${organisation}&observation_type__parameter__icontains=${observation}&ordering=${this.state.ordering}`);
            const data = await response.json();
            if (data.count === 0) this.setState({ showAlert: true });
        } else {
            const response = await fetch(`${baseUrl}/wmslayers?name__icontains=${search}&page=${this.state.page}&organisation__name__icontains=${organisation}&ordering=${this.state.ordering}`);
            const data = await response.json();
            if (data.count === 0) this.setState({ showAlert: true });
        };
    };

    //Component will fetch the Rasters again each time the value of this.state.organisationName changes
    componentWillUpdate(nextProps: MainAppProps, nextState: MyState) {
        if (nextProps && (nextState.organisationName !== this.state.organisationName || nextState.observationType !== this.state.observationType || nextState.ordering !== this.state.ordering)) {
            this.props.currentDataType === "Raster" ? 
                this.props.fetchRasters(this.state.initialPage, this.state.searchTerm, nextState.organisationName, nextState.observationType, nextState.ordering) :
                this.props.fetchWMSLayers(this.state.initialPage, this.state.searchTerm, nextState.organisationName, nextState.ordering);
            this.setState({
                page: 1
            });
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
                        onObservationTypeCheckbox={this.onObservationTypeCheckbox}
                        onOrganisationCheckbox={this.onOrganisationCheckbox}
                        updateObservationTypeCheckbox={this.props.updateObservationTypeCheckbox}
                        updateOrganisationCheckbox={this.props.updateOrganisationCheckbox}
                        onDataTypeChange={this.onDataTypeChange}
                        fetchRasters={this.props.fetchRasters}
                        fetchWMSLayers={this.props.fetchWMSLayers}
                        switchDataType={this.props.switchDataType}
                        currentDataType={this.props.currentDataType}
                    />
                    {this.props.currentDataType === "Raster" ?
                        <RasterList
                            searchTerm={this.state.searchTerm}
                            page={this.state.page}
                            currentRasterList={this.props.currentRasterList}
                            selectItem={this.props.selectItem}
                            updateBasket={this.props.updateBasket}
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
                            updateBasket={this.props.updateBasket}
                            onPageClick={this.onPageClick}
                            onSearchChange={this.onSearchChange}
                            onSearchSubmit={this.onSearchSubmit}
                            onSorting={this.onSorting}
                        />
                    }
                    {this.props.currentDataType === "Raster" ?
                        <RasterDetails />
                        :
                        <WMSDetails />
                    }
                </div>
                {/* ALERT POPUP */}
                <div
                    className="authorisation-alert"
                    style={{
                        display: this.state.showAlert ? "flex" : "none"
                    }}
                    onClick={() => this.setState({ showAlert: false })}
                >
                    No Rasters/WMS layers found! You may need to login or might have insufficient right to view
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
    currentDataType: getCurrentDataType(state),
});

const mapDispatchToProps = (dispatch: Dispatch<RasterActionType | Basket | FilterActionType | UpdateCheckboxActionType>): PropsFromDispatch => ({
    fetchLizardBootstrap: () => fetchLizardBootstrap(dispatch),
    fetchRasters: (page: number, searchTerm: string, organisationName: string, observationTypeParameter: string, ordering: string) => fetchRasters(page, searchTerm, organisationName, observationTypeParameter, ordering, dispatch),
    updateBasket: (basket: MyStore['basket']) => updateBasket(basket, dispatch),
    fetchObservationTypes: () => fetchObservationTypes(dispatch),
    fetchOrganisations: () => fetchOrganisations(dispatch),
    updateObservationTypeCheckbox: (parameter: ObservationType['parameter']) =>updateObservationTypeCheckbox(parameter, dispatch),
    updateOrganisationCheckbox: (name: Organisation['name']) => updateOrganisationCheckbox(name, dispatch),
    fetchWMSLayers: (page: number, searchTerm: string, organisationName: string, ordering: string) => fetchWMSLayers(page, searchTerm, organisationName, ordering, dispatch),
    selectItem: (uuid: string) => selectItem(uuid, dispatch),
    switchDataType: (dataType: SwitchDataType['payload']) => switchDataType(dataType, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(MainApp);