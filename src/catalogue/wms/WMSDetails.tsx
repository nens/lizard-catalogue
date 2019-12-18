import * as React from 'react';
import { connect } from 'react-redux';
import { Map, TileLayer, WMSTileLayer } from 'react-leaflet';
import { MyStore, getWMS, getOrganisations, getLizardBootstrap } from '../../reducers';
import { WMS, LatLng, Organisation, Bootstrap } from '../../interface';
import { isAuthorizedToManageLayer } from '../../utils/authorization';
import { openWMSInAPI, openWMSInLizard, openWMSDownloadURL, getDatasetGetCapabilitesURL, openDatasetGetCapabilities } from '../../utils/url';
import { getCenterPoint, zoomLevelCalculation, getBounds, boundsToDisplay } from '../../utils/latLngZoomCalculation';
import '../styles/Details.css';

interface PropsFromState {
    wms: WMS | null,
    organisations: Organisation[],
    bootstrap: Bootstrap
};

interface MyProps {
    filters: MyStore['filters'],
};

class WMSDetails extends React.Component<PropsFromState & MyProps> {
    selectedDataset = (wms: WMS) => {
        const { dataset } = this.props.filters;
        const selectedDataset = dataset && wms.datasets.find(dataSet => dataSet.slug === dataset);
        return (dataset && selectedDataset) || null;
    };

    render() {
        //Destructure the props
        const { wms, organisations, bootstrap } = this.props;

        //If no WMS layer is selected, display a text
        if (!wms) return <div className="details details__loading">Please select a WMS Layer</div>;
        const dataset = this.selectedDataset(wms);

        //Get WMS layer's getCapabilities link based on WMS layer's URL
        const wmsUrl = wms.wms_url && `${wms.wms_url}/?request=GetCapabilities`;

        //Get spatial bounds of the WMS layer
        const wmsBounds = getBounds(wms);
        const bounds = boundsToDisplay(wmsBounds);

        //Get the center point of the raster based on its spatial bounds
        const centerPoint: LatLng = getCenterPoint(wmsBounds);

        //Calculate the zoom level of the raster by using the zoomLevelCalculation function
        const zoom = zoomLevelCalculation(wmsBounds);

        // Only show manage button if user is admin of the organisation of the layer
        // or the supplier of the layer and supplier in the organsation of the layer.
        let authorizedToManageLayer: boolean = false;
        if (wms && bootstrap) {
            authorizedToManageLayer = isAuthorizedToManageLayer(
                wms, bootstrap.user.username, organisations
            );
        }

        return (
            <div className="details">
                <h3 title={wms.name}>
                    <span className="details__title_text">
                        {wms.name}
                    </span>
                    <span>
                        { authorizedToManageLayer ?
                            <a
                                href={`/management/#/data_management/rasters/${wms.uuid}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img
                                    className="details__icon"
                                    src="image/manageButton.svg"
                                    alt="View in manage client"
                                />
                            </a>
                        :null
                        }
                    </span>
                </h3>
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
                    <div
                        className="details__url-field"
                        style={{
                            visibility: wms.wms_url ? "visible" : "hidden"
                        }}
                    >
                        <div
                            className="details__get-capabilities-url"
                            title={wmsUrl}
                            onClick={() => window.open(wmsUrl, '_blank')}
                        >
                            {wmsUrl}
                        </div>
                        <i
                            className="fas fa-copy"
                            title="Copy to clipboard"
                            onClick={() => navigator.clipboard.writeText(wmsUrl)}
                        />
                    </div>
                    <br /><br />
                    <h4>Slug</h4>
                    <span>{wms.slug}</span>
                </div>
                <br />
                {dataset ? (
                    <div className="details__get-capabilities">
                        <h4>Lizard WMS GetCapabilities</h4>
                        <hr/>
                        <div>
                            For this complete dataset:
                            <div className="details__url-field">
                                <div
                                    className="details__get-capabilities-url"
                                    title={getDatasetGetCapabilitesURL(dataset) || ""}
                                    onClick={() => openDatasetGetCapabilities(dataset)}
                                >
                                    {getDatasetGetCapabilitesURL(dataset)}
                                </div>
                                <i
                                    className="fas fa-copy"
                                    title="Copy to clipboard"
                                    onClick={() => navigator.clipboard.writeText(getDatasetGetCapabilitesURL(dataset))}
                                />
                            </div>
                        </div>
                    </div>
                ) : null}
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
        wms: null,
        organisations: getOrganisations(state),
        bootstrap: getLizardBootstrap(state)
    };
    return {
        wms: getWMS(state, state.selectedItem),
        organisations: getOrganisations(state),
        bootstrap: getLizardBootstrap(state)
    };
};

export default connect(mapStateToProps)(WMSDetails); 
