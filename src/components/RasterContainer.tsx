import * as React from 'react';
import { connect } from 'react-redux';
import { fetchRasters, selectRaster } from '../action';
import { getRasters, getRaster } from '../reducers';
import RasterList from './RasterList';
import RasterDetails from './RasterDetails';
import { MyStore, Raster, RasterActionType } from '../interface';
import './Raster.css';
import { Dispatch } from 'redux';

interface PropsFromState {
  rasters: Raster[] | null;
  raster: Raster | null;
}

interface PropsFromDispatch {
  selectRaster: (raster: Raster) => void;
  fetchRasters: () => void;
};

type RasterContainerProps = PropsFromState & PropsFromDispatch;

interface MyState {
    page: number;
};

class RasterContainer extends React.Component<RasterContainerProps, MyState> {

    componentDidMount() {
        this.props.fetchRasters();
    };

    render() {
        return (
            <div className="raster-container">
                <RasterList rasters={this.props.rasters} selectRaster={this.props.selectRaster} />
                <RasterDetails raster={this.props.raster} />
            </div>
        );
    };
};

const mapStateToProps = (state: MyStore): PropsFromState => {
    return {
      rasters: getRasters(state),
      raster: getRaster(state),
    }
};

const mapDispatchToProps = (dispatch: Dispatch<RasterActionType>): PropsFromDispatch => ({
    fetchRasters: () => fetchRasters(dispatch),
    selectRaster: (raster: Raster) => selectRaster(raster, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(RasterContainer);
