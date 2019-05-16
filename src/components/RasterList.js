import React from 'react';
import { connect } from 'react-redux';
import { fetchRasters } from '../actions';
import RasterDetails from './RasterDetails';

class RasterList extends React.Component {
    state = {
        raster: null
    };

    componentDidMount() {
        this.props.fetchRasters()
    };

    onClick = (raster) => {
        this.setState({
            raster: raster
        })
        console.log(this.state)
    };

    render() {
        const { rasters } = this.props

        if (!rasters) return <h1>Loading ...</h1>

        return (
            <div>
                {this.props.rasters.map(raster => (
                    <p key={raster.uuid} onClick={() => this.onClick(raster)}>{raster.name}</p>
                ))}
                <RasterDetails raster={this.state.raster} />
            </div>
        )
    };
};

const mapStateToProps = state => ({
    rasters: state.rasters
});

export default connect(mapStateToProps, { fetchRasters })(RasterList);