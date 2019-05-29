import * as React from 'react';
import { connect } from 'react-redux';
import { fetchRasters, selectRaster, addToBasket } from '../action';
import { MyStore, getRasterUuid, getRasterAPI, getAllRasters } from '../reducers';
import RasterList from './RasterList';
import RasterDetails from './RasterDetails';
import { RasterActionType } from '../interface';
import { Dispatch } from 'redux';
import './Raster.css';

interface PropsFromState {
  rasterAPI: MyStore['rasterAPI'] | null;
  allRasters: MyStore['allRasters'];
  uuid: string | null;
}

interface PropsFromDispatch {
  selectRaster: (uuid: string) => void;
  fetchRasters: (page: number, searchTerm: string) => void;
  addToBasket: (basket) => void;
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
                <RasterList 
                    searchTerm={this.state.searchTerm}
                    page={this.state.page} 
                    rasterAPI={this.props.rasterAPI}
                    allRasters={this.props.allRasters}
                    selectRaster={this.props.selectRaster}
                    addToBasket={this.props.addToBasket} 
                    onClick={this.onClick}
                    onChange={this.onChange}
                    onSubmit={this.onSubmit}
                />
                <RasterDetails uuid={this.props.uuid} allRasters={this.props.allRasters} />
            </div>
        );
    };
};

const mapStateToProps = (state: MyStore): PropsFromState => {
    return {
      rasterAPI: getRasterAPI(state),
      uuid: getRasterUuid(state),
      allRasters: getAllRasters(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<RasterActionType>): PropsFromDispatch => ({
    fetchRasters: (page: number, searchTerm: string) => fetchRasters(page, searchTerm, dispatch),
    selectRaster: (uuid: string) => selectRaster(uuid, dispatch),
    addToBasket: (basket) => addToBasket(basket, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(RasterContainer);