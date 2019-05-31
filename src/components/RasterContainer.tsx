import * as React from 'react';
import { connect } from 'react-redux';
import { fetchRasters, selectRaster, addToBasket, fetchObservationTypes, fetchOrganisations } from '../action';
import { getRaster, getRastersObject, MyStore, getRasters, getObservationTypes, getOrganisations } from '../reducers';
import RasterList from './RasterList';
import RasterDetails from './RasterDetails';
import { RasterActionType, RastersObject, Raster, ObservationType, Organisation } from '../interface';
import { Dispatch } from 'redux';
import './Raster.css';
import FilterBar from './FilterBar';

interface PropsFromState {
  rastersObject: RastersObject | null;
  raster: Raster | null;
  rasters: {};
  observationTypes: ObservationType[] | null;
  organisations: Organisation[] | null;
};

interface PropsFromDispatch {
  selectRaster: (raster: Raster) => void;
  fetchRasters: (page: number, searchTerm: string) => void;
  addToBasket: (basket) => void;
  fetchObservationTypes: () => void;
  fetchOrganisations: () => void;
};

type RasterContainerProps = PropsFromState & PropsFromDispatch;

interface MyState {
    page: number;
    initialPage: number;
    searchTerm: string;
};

class RasterContainer extends React.Component<RasterContainerProps, MyState> {
    state: MyState = {
        page: 1,
        initialPage: 1,
        searchTerm: ''
    };

    onClick = (page: number) => {
        if (page < 1) return page = 1;
        this.props.fetchRasters(page, this.state.searchTerm);
        this.setState({
            page: page,
        });
    };

    onChange = (event) => {
        this.setState({
            searchTerm: event.target.value
        });
    }

    onSubmit = (event) => {
        event.preventDefault();
        this.setState({
            page: 1
        });
        this.props.fetchRasters(this.state.initialPage, this.state.searchTerm);
    }

    componentDidMount() {
        this.props.fetchRasters(this.state.page, this.state.searchTerm);
    };

    render() {
        return (
            <div className="raster-container">
                <FilterBar 
                    fetchObservationTypes={this.props.fetchObservationTypes}
                    observationTypes={this.props.observationTypes}
                    fetchOrganisations={this.props.fetchOrganisations}
                    organisations={this.props.organisations}
                />
                <RasterList 
                    rastersObject={this.props.rastersObject} 
                    selectRaster={this.props.selectRaster} 
                    page={this.state.page} 
                    searchTerm={this.state.searchTerm}
                    onClick={this.onClick}
                    onChange={this.onChange}
                    onSubmit={this.onSubmit}
                    addToBasket={this.props.addToBasket}
                />
                <RasterDetails raster={this.props.raster} />
            </div>
        );
    };
};

const mapStateToProps = (state: MyStore): PropsFromState => {
    return {
      rastersObject: getRastersObject(state),
      raster: getRaster(state),
      rasters: getRasters(state),
      observationTypes: getObservationTypes(state),
      organisations: getOrganisations(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<RasterActionType>): PropsFromDispatch => ({
    fetchRasters: (page: number, searchTerm: string) => fetchRasters(page, searchTerm, dispatch),
    selectRaster: (raster: Raster) => selectRaster(raster, dispatch),
    addToBasket: (basket) => addToBasket(basket, dispatch),
    fetchObservationTypes: () => fetchObservationTypes(dispatch),
    fetchOrganisations: () => fetchOrganisations(dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(RasterContainer);