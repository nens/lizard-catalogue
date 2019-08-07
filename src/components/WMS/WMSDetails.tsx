import * as React from 'react';
import { connect } from 'react-redux';
import { Map, TileLayer, WMSTileLayer } from 'react-leaflet';
import { MyStore, getWMS } from '../../reducers';
import { WMS } from '../../interface';
import './../RasterDetails.css';

interface PropsFromState {
    wms: WMS | null
};

class WMSDetails extends React.Component<PropsFromState> {
    render() {
        //Destructure the props
        const { wms } = this.props;

        //If no WMS layer is selected, display a text
        if (!wms) return <div className="raster-details raster-details__loading">Please select a WMS Layer</div>;

        return (
            <div className="raster-details">
                <h3 title="Raster's name">{wms.name}</h3>
                <span className="raster-details__uuid" title="Raster's UUID">{wms.uuid}</span>
                <div className="raster-details__main-box">
                    <div className="raster-details__description-box">
                        <h4>Description</h4>
                        <div className="description">{wms.description}</div>
                        <br />
                        <h4>Organisation</h4>
                        <span>{wms.organisation && wms.organisation.name}</span>
                    </div>
                    <div className="raster-details__map-box">
                        <Map center={[0,0]} zoom={wms.min_zoom} >
                            <TileLayer url="https://{s}.tiles.mapbox.com/v3/nelenschuurmans.iaa98k8k/{z}/{x}/{y}.png" />
                            <WMSTileLayer url={wms.url} layers={wms.slug} transparent={true} format="image/png" />
                        </Map>
                    </div>
                </div>
                <br />
                <div className="raster-details__button-container">
                    <h4>View data in</h4>
                    <div>
                        <button className="raster-details__button button-api">API</button>
                        <button className="raster-details__button button-lizard">PORTAL</button>
                    </div>
                </div>
            </div>
        );
    };
};

const mapStateToProps = (state: MyStore): PropsFromState => {
    if (!state.selectedItem) return {
        wms: null
    };
    return {
        wms: getWMS(state, state.selectedItem)
    };
};

export default connect(mapStateToProps)(WMSDetails); 
