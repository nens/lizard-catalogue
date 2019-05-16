import React from 'react';
import { connect } from 'react-redux';
import { fetchRasters } from '../actions'

class RasterList extends React.Component {
    componentDidMount() {
        this.props.fetchRasters()
    }

    render() {
        const { rasters } = this.props

        if (!rasters) return <h1>Loading ...</h1>

        return (
            <div>
                {this.props.rasters.map(raster => (
                    <p key={raster.uuid}>{raster.name}</p>
                ))}
            </div>
        )
        
        
    }
}

const mapStateToProps = state => ({
    rasters: state.rasters
})

export default connect(mapStateToProps, { fetchRasters })(RasterList);