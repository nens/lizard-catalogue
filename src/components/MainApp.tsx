import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Dispatch } from 'redux';
import { fetchRasters, updateBasket, fetchObservationTypes, fetchOrganisations, fetchLizardBootstrap, switchDataType, selectItem, fetchWMSLayers } from '../action';
import { MyStore, getCurrentRasterList, getObservationTypes, getOrganisations, getCurrentDataType, getCurrentWMSList } from '../reducers';
import { RasterActionType, ObservationType, Organisation, Basket, FilterActionType, SwitchDataType } from '../interface';
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
    currentDataType: MyStore['currentDataType'],
};

interface PropsFromDispatch {
    fetchLizardBootstrap: () => void,
    selectItem: (uuid: string) => void,
    fetchRasters: (page: number, searchTerm: string, organisationName: string, observationTypeParameter: string, ordering: string) => void,
    updateBasket: (basket: MyStore['basket']) => void,
    fetchObservationTypes: () => void,
    fetchOrganisations: () => void,
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
    };

    toggleProfileDropdown = (event) => {
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
        this.props.history.push(`/catalogue${this.props.location.search}`);
    };

    //When click on the checkbox in the filter bar, this function will update the observation type state in this component
    onObservationTypeCheckbox = (obsType: ObservationType) => {
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
        this.props.history.push(`/catalogue?search=${this.state.searchTerm}&organisation=${this.state.organisationName}&observation=${obsType.checked ? '' : obsType.parameter}`);
    };

    //When click on the checkbox in the filter bar, this function will update the organisation name state in this component
    onOrganisationCheckbox = (organisation: Organisation) => {
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
        this.props.history.push(`/catalogue?search=${this.state.searchTerm}&organisation=${organisation.checked ? '' : organisation.name}&observation=${this.state.observationType}`);
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
    onViewChange = () => {
        this.setState({
            page: 1,
            searchTerm: '',
            organisationName: '',
            observationType: '',
            ordering: '',
        });
    };

    //Capture the search params in the URL and turn it into an object using URLSearchParams() method
    getUrlParams = () => {
        if (!this.props.location.search) return new URLSearchParams();
        return new URLSearchParams(this.props.location.search);
    };
    //Capture the value of the search property in the search params object
    getSearch = () => {
        let search = this.getUrlParams();
        return search.get('search') || '';
    };
    //Capture the value of the organisation property in the search params object
    getOrganisation = () => {
        let search = this.getUrlParams();
        return search.get('organisation') || '';
    };
    //Capture the value of the observation type property in the search params object
    getObservationType = () => {
        let search = this.getUrlParams();
        return search.get('observation') || '';
    };

    componentDidMount() {
        //When component first mount, capture the search params in the URL and update the component's state
        let search = this.getSearch();
        let organisation = this.getOrganisation();
        let observation = this.getObservationType();
        this.setState({
            searchTerm: search,
            organisationName: organisation,
            observationType: observation
        });
        this.props.fetchLizardBootstrap();
        this.props.fetchRasters(this.state.page, search, organisation, observation, this.state.ordering);
        // this.props.fetchWMSLayers(this.state.page, this.state.searchTerm, this.state.organisationName, this.state.ordering);
    };

    //Component will fetch the Rasters again each time the value of this.state.organisationName changes
    componentWillUpdate(nextProps: MainAppProps, nextState: MyState) {
        //Keep the search params in URL and the searchTerm in the component's state in sync with each other
        let search = this.getSearch();
        if (search !== this.state.searchTerm) {
            return this.props.location.search = `?search=${this.state.searchTerm}&organisation=${this.state.organisationName}&observation=${this.state.observationType}`;
        };

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
            <div className="main-container" onClick={this.toggleProfileDropdown}>
                <div className="main-header">
                    <Header
                        showProfileDropdown={this.state.showProfileDropdown}
                        toggleProfileDropdown={this.toggleProfileDropdown}
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
                        onViewChange={this.onViewChange}
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

const mapDispatchToProps = (dispatch: Dispatch<RasterActionType | Basket | FilterActionType>): PropsFromDispatch => ({
    fetchLizardBootstrap: () => fetchLizardBootstrap(dispatch),
    fetchRasters: (page: number, searchTerm: string, organisationName: string, observationTypeParameter: string, ordering: string) => fetchRasters(page, searchTerm, organisationName, observationTypeParameter, ordering, dispatch),
    updateBasket: (basket: MyStore['basket']) => updateBasket(basket, dispatch),
    fetchObservationTypes: () => fetchObservationTypes(dispatch),
    fetchOrganisations: () => fetchOrganisations(dispatch),
    fetchWMSLayers: (page: number, searchTerm: string, organisationName: string, ordering: string) => fetchWMSLayers(page, searchTerm, organisationName, ordering, dispatch),
    selectItem: (uuid: string) => selectItem(uuid, dispatch),
    switchDataType: (dataType: SwitchDataType['payload']) => switchDataType(dataType, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(MainApp);