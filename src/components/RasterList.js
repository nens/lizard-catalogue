import React from 'react';
import { connect } from 'react-redux';
import { fetchRasters } from '../actions'

class RasterList extends React.Component {
    componentDidMount() {
        this.props.fetchRasters()
    }

    render() {
        return <h2>Raster List</h2>
    }
}

export default connect(null, { fetchRasters })(RasterList);