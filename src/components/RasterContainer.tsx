import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { fetchRasters, selectRaster, updateBasket, fetchObservationTypes, fetchOrganisations } from '../action';
import { MyStore, getCurrentRasterList, getObservationTypes, getOrganisations } from '../reducers';
import { RasterActionType, ObservationType, Organisation, Basket, FilterActionType } from '../interface';
import RasterList from './RasterList';
import RasterDetails from './RasterDetails';
import FilterBar from './FilterBar';
import Header from './Header';
import './Raster.css';

interface PropsFromState {
    currentRasterList: MyStore['currentRasterList'] | null;
    observationTypes: ObservationType[];
    organisations: Organisation[];
};

interface PropsFromDispatch {
    selectRaster: (uuid: string) => void;
    fetchRasters: (page: number, searchTerm: string, organisationName: string) => void;
    updateBasket: (basket: MyStore['basket']) => void;
    fetchObservationTypes: (searchObs: string) => void;
    fetchOrganisations: (searchOrg: string) => void;
};

type RasterContainerProps = PropsFromState & PropsFromDispatch;

interface MyState {
    page: number;
    initialPage: number;
    searchTerm: string;
    organisationName: string
};

class RasterContainer extends React.Component<RasterContainerProps, MyState> {
    state: MyState = {
        page: 1,
        initialPage: 1,
        searchTerm: '',
        organisationName: ''
    };

    onClick = (page: number) => {
        if (page < 1) return page = 1;
        this.props.fetchRasters(page, this.state.searchTerm, this.state.organisationName);
        this.setState({
            page: page,
        });
    };

    onChange = (event) => {
        this.setState({
            searchTerm: event.target.value
        });
    };

    onSubmit = (event) => {
        event.preventDefault();
        this.setState({
            page: 1
        });
        this.props.fetchRasters(this.state.initialPage, this.state.searchTerm, this.state.organisationName);
    };

    //When click on the checkbox in the filter bar, this function will update the organisation name state in this component
    onOrganisationCheckBox = (organisation: Organisation) => {
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

    componentDidMount() {
        this.props.fetchRasters(this.state.page, this.state.searchTerm, this.state.organisationName);
    };

    //Component will fetch the Rasters again each time the value of this.state.organisationName changes
    componentWillUpdate(nextProps: RasterContainerProps, nextState: MyState) {
        if (nextProps && nextState.organisationName !== this.state.organisationName) {
            this.props.fetchRasters(this.state.page, this.state.searchTerm, nextState.organisationName);
        };
    };

    render() {
        return (
            <div className="raster-container">
                <div className="raster-header">
                    <Header />
                </div>
                <div className="raster-main">
                    <FilterBar
                        fetchObservationTypes={this.props.fetchObservationTypes}
                        observationTypes={this.props.observationTypes}
                        fetchOrganisations={this.props.fetchOrganisations}
                        organisations={this.props.organisations}
                        onOrganisationCheckbox={this.onOrganisationCheckBox}
                    />
                    <RasterList
                        searchTerm={this.state.searchTerm}
                        page={this.state.page}
                        currentRasterList={this.props.currentRasterList}
                        selectRaster={this.props.selectRaster}
                        updateBasket={this.props.updateBasket}
                        onClick={this.onClick}
                        onChange={this.onChange}
                        onSubmit={this.onSubmit}
                    />
                    <RasterDetails />
                </div>
            </div>
        );
    };
};

const mapStateToProps = (state: MyStore): PropsFromState => ({
    currentRasterList: getCurrentRasterList(state),
    observationTypes: getObservationTypes(state),
    organisations: getOrganisations(state)
});

const mapDispatchToProps = (dispatch: Dispatch<RasterActionType | Basket | FilterActionType>): PropsFromDispatch => ({
    fetchRasters: (page: number, searchTerm: string, organisationName: string) => fetchRasters(page, searchTerm, organisationName, dispatch),
    selectRaster: (uuid: string) => selectRaster(uuid, dispatch),
    updateBasket: (basket: MyStore['basket']) => updateBasket(basket, dispatch),
    fetchObservationTypes: (searchObs: string) => fetchObservationTypes(dispatch, searchObs),
    fetchOrganisations: (searchOrg: string) => fetchOrganisations(dispatch, searchOrg)
});

export default connect(mapStateToProps, mapDispatchToProps)(RasterContainer);