import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { fetchRasters, selectRaster, updateBasket, fetchObservationTypes, fetchOrganisations, fetchLizardBootstrap, switchView, fetchWMSLayers, selectWMS } from '../action';
import { MyStore, getCurrentRasterList, getObservationTypes, getOrganisations, getLizardBootstrap, getCurrentWMSList } from '../reducers';
import { RasterActionType, ObservationType, Organisation, Basket, FilterActionType, Bootstrap } from '../interface';
import RasterList from './RasterList';
import WMSList from './WMS/WMSList';
import RasterDetails from './RasterDetails';
import FilterBar from './FilterBar';
import Header from './Header';
import './Raster.css';

interface PropsFromState {
    currentRasterList: MyStore['currentRasterList'] | null,
    currentWMSList: MyStore['currentWMSList'] | null,
    observationTypes: ObservationType[],
    organisations: Organisation[],
    bootstrap: Bootstrap
};

interface PropsFromDispatch {
    getLizardBootstrap: () => void,
    selectRaster: (uuid: string) => void,
    selectWMS: (uuid: string) => void,
    fetchRasters: (page: number, searchTerm: string, organisationName: string, observationTypeParameter: string, ordering: string) => void,
    updateBasket: (basket: MyStore['basket']) => void,
    fetchObservationTypes: () => void,
    fetchOrganisations: () => void,
    switchView: () => void,
    fetchWMSLayers: (page: number, searchTerm: string, organisationName: string, ordering: string) => void,
};

type RasterContainerProps = PropsFromState & PropsFromDispatch;

interface MyState {
    showProfileDropdown: boolean,
    page: number,
    initialPage: number,
    searchTerm: string,
    organisationName: string,
    observationType: string,
    ordering: string,
};

class RasterContainer extends React.Component<RasterContainerProps, MyState> {
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
        !this.props.bootstrap.viewWMS ?
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

        !this.props.bootstrap.viewWMS ?
            this.props.fetchRasters(this.state.initialPage, this.state.searchTerm, this.state.organisationName, this.state.observationType, this.state.ordering) :
            this.props.fetchWMSLayers(this.state.page, this.state.searchTerm, this.state.organisationName, this.state.ordering);
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

    componentDidMount() {
        this.props.getLizardBootstrap();
        this.props.fetchRasters(this.state.page, this.state.searchTerm, this.state.organisationName, this.state.observationType, this.state.ordering);
        // this.props.fetchWMSLayers(this.state.page, this.state.searchTerm, this.state.organisationName, this.state.ordering);
    };

    //Component will fetch the Rasters again each time the value of this.state.organisationName changes
    componentWillUpdate(nextProps: RasterContainerProps, nextState: MyState) {
        if (nextProps && (nextState.organisationName !== this.state.organisationName || nextState.observationType !== this.state.observationType || nextState.ordering !== this.state.ordering)) {
            !this.props.bootstrap.viewWMS ?
                this.props.fetchRasters(this.state.initialPage, this.state.searchTerm, nextState.organisationName, nextState.observationType, nextState.ordering) :
                this.props.fetchWMSLayers(this.state.initialPage, this.state.searchTerm, nextState.organisationName, nextState.ordering);
            this.setState({
                page: 1
            });
        };
    };

    render() {
        const { bootstrap } = this.props;

        return (
            <div className="raster-container" onClick={this.toggleProfileDropdown}>
                <div className="raster-header">
                    <Header
                        showProfileDropdown={this.state.showProfileDropdown}
                        toggleProfileDropdown={this.toggleProfileDropdown}
                    />
                </div>
                <div className="raster-main">
                    <FilterBar
                        fetchObservationTypes={this.props.fetchObservationTypes}
                        observationTypes={this.props.observationTypes}
                        fetchOrganisations={this.props.fetchOrganisations}
                        organisations={this.props.organisations}
                        onObservationTypeCheckbox={this.onObservationTypeCheckbox}
                        onOrganisationCheckbox={this.onOrganisationCheckbox}
                        switchView={this.props.switchView}
                        bootstrap={bootstrap}
                        onViewChange={this.onViewChange}
                        fetchRasters={this.props.fetchRasters}
                        fetchWMSLayers={this.props.fetchWMSLayers}
                    />
                    {!bootstrap.viewWMS ?
                        <RasterList
                            searchTerm={this.state.searchTerm}
                            page={this.state.page}
                            currentRasterList={this.props.currentRasterList}
                            selectRaster={this.props.selectRaster}
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
                            selectWMS={this.props.selectWMS}
                            updateBasket={this.props.updateBasket}
                            onPageClick={this.onPageClick}
                            onSearchChange={this.onSearchChange}
                            onSearchSubmit={this.onSearchSubmit}
                            onSorting={this.onSorting}
                        />
                    }
                    <RasterDetails />
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
    bootstrap: getLizardBootstrap(state)
});

const mapDispatchToProps = (dispatch: Dispatch<RasterActionType | Basket | FilterActionType>): PropsFromDispatch => ({
    getLizardBootstrap: () => fetchLizardBootstrap(dispatch),
    fetchRasters: (page: number, searchTerm: string, organisationName: string, observationTypeParameter: string, ordering: string) => fetchRasters(page, searchTerm, organisationName, observationTypeParameter, ordering, dispatch),
    selectRaster: (uuid: string) => selectRaster(uuid, dispatch),
    selectWMS: (uuid: string) => selectWMS(uuid, dispatch),
    updateBasket: (basket: MyStore['basket']) => updateBasket(basket, dispatch),
    fetchObservationTypes: () => fetchObservationTypes(dispatch),
    fetchOrganisations: () => fetchOrganisations(dispatch),
    switchView: () => switchView(dispatch),
    fetchWMSLayers: (page: number, searchTerm: string, organisationName: string, ordering: string) => fetchWMSLayers(page, searchTerm, organisationName, ordering, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(RasterContainer);