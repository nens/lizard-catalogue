import * as React from 'react';
import { connect } from 'react-redux';
import { fetchRasters, selectRaster, updateBasket } from '../action';
import { MyStore, getAllRasters, getCurrentRasterList, getRaster } from '../reducers';
import RasterList from './RasterList';
import RasterDetails from './RasterDetails';
import { RasterActionType } from '../interface';
import { Dispatch } from 'redux';
import './Raster.css';

interface PropsFromState {
    currentRasterList: MyStore['currentRasterList'] | null;
    allRasters: MyStore['allRasters'];
    selectedRaster: string | null;
};

interface PropsFromDispatch {
    selectRaster: (uuid: string) => void;
    fetchRasters: (page: number, searchTerm: string) => void;
    updateBasket: (basket) => void;
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
                    currentRasterList={this.props.currentRasterList}
                    allRasters={this.props.allRasters}
                    selectRaster={this.props.selectRaster}
                    updateBasket={this.props.updateBasket}
                    onClick={this.onClick}
                    onChange={this.onChange}
                    onSubmit={this.onSubmit}
                    rasters2={[]}
                />
                <RasterDetails selectedRaster={this.props.selectedRaster} allRasters={this.props.allRasters} />
            </div>
        );
    };
};

const mapStateToProps = (state: MyStore): PropsFromState => ({
    currentRasterList: getCurrentRasterList(state),
    selectedRaster: getRaster(state),
    allRasters: getAllRasters(state)
});

const mapDispatchToProps = (dispatch: Dispatch<RasterActionType>): PropsFromDispatch => ({
    fetchRasters: (page: number, searchTerm: string) => fetchRasters(page, searchTerm, dispatch),
    selectRaster: (uuid: string) => selectRaster(uuid, dispatch),
    updateBasket: (basket) => updateBasket(basket, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(RasterContainer);