import * as React from 'react';
import { connect } from 'react-redux';
import { Map, TileLayer, WMSTileLayer } from 'react-leaflet';
import { MyStore, getWMS } from '../../reducers';
import { WMS } from '../../interface';
import '../styles/Details.css';
import { openWMSInAPI, openWMSInLizard } from '../../utils/url';

interface PropsFromState {
    wms: WMS | null
};

class WMSDetails extends React.Component<PropsFromState> {
    render() {
        //Destructure the props
        const { wms } = this.props;

        //If no WMS layer is selected, display a text
        if (!wms) return <div className="details details__loading">Please select a WMS Layer</div>;

        return (
            <div className="details wms-details">
                <h3 title="WMS layer's name">{wms.name}</h3>
                <span className="details__uuid" title="WMS layer's UUID">{wms.uuid}</span>
                <div className="details__main-box">
                    <div className="details__description-box">
                        <h4>Description</h4>
                        <div className="description">{wms.description}</div>
                        <br />
                        <h4>Organisation</h4>
                        <span>{wms.organisation && wms.organisation.name}</span>
                    </div>
                    <div className="details__map-box">
                        <Map center={[0,0]} zoom={wms.min_zoom} >
                            <TileLayer url="https://{s}.tiles.mapbox.com/v3/nelenschuurmans.iaa98k8k/{z}/{x}/{y}.png" />
                            {wms.wms_url ? <WMSTileLayer
                                url={wms.wms_url}
                                layers={wms.slug}
                                transparent={true}
                                format="image/png"
                            /> : null}
                        </Map>
                    </div>
                </div>
                <div className="wms-details__info">
                    <h4>WMS layer's URL</h4>
                    <span>{wms.wms_url}</span>
                    <br />
                    <h4>Slug</h4>
                    <span>{wms.slug}</span>
                </div>
                <br />
                <div className="details__button-container wms-details__button-container">
                    <h4>View data in</h4>
                    <div>
                        <button className="details__button button-api" onClick={() => openWMSInAPI(wms)}>API</button>
                        <button className="details__button button-lizard" onClick={() => openWMSInLizard(wms)}>PORTAL</button>
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
