import * as React from 'react';
import { connect } from 'react-redux';
import { fetchRasters, selectRaster } from '../action';
import { getRasters, getRaster } from '../reducers';
import RasterList from './RasterList';
import RasterDetails from './RasterDetails';
import { MyProps } from '../interface';
import './Raster.css'

class RasterContainer extends React.Component<MyProps> {
    
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

const mapStateToProps = state => ({
    rasters: getRasters(state),
    raster: getRaster(state)
});

const mapDispatchToProps = (dispatch) => ({
    fetchRasters: () => fetchRasters(dispatch),
    selectRaster: (raster) => selectRaster(raster, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(RasterContainer);