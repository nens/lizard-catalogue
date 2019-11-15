import * as React from 'react';
import { connect } from 'react-redux';
import { Map, TileLayer, WMSTileLayer } from 'react-leaflet';
import { MyStore, getWMS } from '../../reducers';
import { WMS, LatLng } from '../../interface';
import '../styles/Details.css';

import { openWMSInAPI, openWMSInLizard, openWMSDownloadURL } from '../../utils/url';
import { getCenterPoint, zoomLevelCalculation, getBounds, boundsToDisplay } from '../../utils/latLngZoomCalculation';

interface PropsFromState {
    wms: WMS | null
};

class WMSDetails extends React.Component<PropsFromState> {
    render() {
        //Destructure the props
        const { wms } = this.props;

        //If no WMS layer is selected, display a text
        if (!wms) return <div className="details details__loading">Please select a WMS Layer</div>;

        //Get spatial bounds of the WMS layer
        const wmsBounds = getBounds(wms);
        const bounds = boundsToDisplay(wmsBounds);

        //Get the center point of the raster based on its spatial bounds
        const centerPoint: LatLng = getCenterPoint(wmsBounds);

        //Calculate the zoom level of the raster by using the zoomLevelCalculation function
        const zoom = zoomLevelCalculation(wmsBounds);

        return (
            <div className="details">
                <h3 title={wms.name}>{wms.name}</h3>
                <div className="details__main-box">
                    <div className="details__description-box">
                        <h4>Description</h4>
                        <div className="description">{wms.description}</div>
                        <br />
                        <h4>Organisation</h4>
                        <span>{wms.organisation && wms.organisation.name}</span>
                        <br />
                        <h4>UUID</h4>
                        <span>{wms.uuid}</span>
                        <br />
                        <h4>Dataset</h4>
                        <span>{wms.datasets && wms.datasets[0] && wms.datasets[0].slug}</span>
                    </div>
                    <div className="details__map-box">
                        <Map bounds={bounds} zoom={wms.min_zoom} zoomControl={false}>
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
                <div className="details__wms-info">
                    <h4>Details</h4><hr/><br/>
                    <h4>WMS layer's URL</h4>
                    <span>{wms.wms_url}</span>
                    <br /><br />
                    <h4>Slug</h4>
                    <span>{wms.slug}</span>
                </div>
                <br />
                <div className="details__button-container">
                    <h4>Actions</h4><hr/>
                    <div className="details__buttons">
                        <button className="details__button" onClick={() => openWMSInLizard(wms, centerPoint, zoom)} title="Open in Portal">
                            <i className="fa fa-external-link"/>
                            &nbsp;&nbsp;OPEN IN PORTAL
                        </button>
                        <button className="details__button" onClick={() => openWMSInAPI(wms)} title="Open in API">
                            <i className="fa fa-external-link"/>
                            &nbsp;&nbsp;OPEN IN API
                        </button>
                        <button
                            className="details__button"
                            style={{
                                visibility: wms.download_url ? "visible" : "hidden"
                            }}
                            onClick={() => openWMSDownloadURL(wms)}
                            title="Download"
                        >
                            <i className="fa fa-download"/>
                            &nbsp;&nbsp;DOWNLOAD
                        </button>
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