import * as React from 'react';
import { connect } from 'react-redux';
import { Map, TileLayer, WMSTileLayer } from 'react-leaflet';
import { MyStore, getRaster, getOrganisations, getLizardBootstrap } from '../../reducers';
import { Raster, LatLng, Organisation, Bootstrap } from '../../interface';
import { isAuthorizedToManageLayer } from '../../utils/authorization';
import { zoomLevelCalculation, getCenterPoint, getBounds, boundsToDisplay } from '../../utils/latLngZoomCalculation';
import { openRasterInAPI, openRasterInLizard, getRasterGetCapabilitesURL, getDatasetGetCapabilitesURL } from '../../utils/url';
import Export from '../components/Export';
import '../styles/Details.css';
import '../styles/Export.css';

interface PropsFromState {
    raster: Raster | null,
    organisations: Organisation[],
    bootstrap: Bootstrap
};

interface MyProps {
    filters: MyStore['filters'],
};

interface MyState {
    showExport: boolean
};

class RasterDetails extends React.Component<PropsFromState & MyProps, MyState> {
    state = {
        showExport: false
    };

    toggleExportModal = () => {
        this.setState({
            showExport: !this.state.showExport
        });
    };

    selectedDataset = (raster: Raster) => {
        
        const { dataset } = this.props.filters;
        const selectedDataset = dataset && raster.datasets.find(dataSet => dataSet.slug === dataset);
        return (dataset && selectedDataset) || null;
    };

    render() {
        //Destructure the props
        const { raster, organisations, bootstrap } = this.props;

        //If no raster is selected, display a text
        if (!raster) return <div className="details details__loading">Please select a raster</div>;
        const dataset = this.selectedDataset(raster);

        //Set the Map with bounds coming from spatial_bounds of the Raster
        const rasterBounds = getBounds(raster);
        const bounds = boundsToDisplay(rasterBounds);

        //Get the center point of the raster based on its spatial bounds
        const centerPoint: LatLng = getCenterPoint(rasterBounds);

        //Calculate the zoom level of the raster by using the zoomLevelCalculation function
        const zoom = zoomLevelCalculation(rasterBounds);

        //Get the Date from the timestamp string
        const lastestUpdateDate = new Date(raster.last_modified);
        const startDate = new Date(raster.first_value_timestamp);
        const stopDate = new Date(raster.last_value_timestamp);

        //Turn the new Date into a string with the date format of DD-MM-YYYY
        const latestUpdate = lastestUpdateDate.toLocaleDateString();
        const start = startDate.toLocaleDateString();
        const stop = stopDate.toLocaleDateString();

        //Calculate raster resolution and decide to show it in m2 or square degrees
        const rasterResolution = Math.abs(raster.pixelsize_x * raster.pixelsize_y);
        //If the projection is EPSG:4326, the resolution is calculated in square degrees, otherwise it is in m2
        const resolution = raster.projection === "EPSG:4326" ? rasterResolution.toFixed(6) + " deg2" : rasterResolution + " m2"

        // Only show manage button if user is admin of the organisation of the layer
        // or the supplier of the layer and supplier in the organsation of the layer.
        let authorizedToManageLayer: boolean = false;
        if (raster && bootstrap) {
            authorizedToManageLayer = isAuthorizedToManageLayer(
                raster, bootstrap.user.username, organisations
            );
        }

        return (
            <div className="details">
                <h3 title={raster.name}>
                    <span className="details__title_text">
                        {raster.name}
                    </span>
                    <span>
                        { authorizedToManageLayer ?
                            <a
                                href={`/management/#/data_management/rasters/${raster.uuid}`}
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
                        <div className="description">{raster.description}</div>
                        <br />
                        <h4>Organisation</h4>
                        <span>{raster.organisation && raster.organisation.name}</span>
                        <br />
                        <h4>UUID</h4>
                        <span>{raster.uuid}</span>
                        <br />
                        <h4>Dataset</h4>
                        <span>{dataset && dataset.slug}</span>
                    </div>
                    <div className="details__map-box">
                        <Map bounds={bounds} zoomControl={false}>
                            <TileLayer url="https://{s}.tiles.mapbox.com/v3/nelenschuurmans.iaa98k8k/{z}/{x}/{y}.png" />
                            <WMSTileLayer url={raster.wms_info.endpoint} layers={raster.wms_info.layer} styles={raster.options.styles} />
                        </Map>
                    </div>
                </div>
                <div className="details__metadata">
                    <h4>Details</h4><hr/>
                    <div className="row">
                        <p className="column column-1">Temporal</p><p className="column column-2">{raster.temporal ? 'Yes' : 'No'} </p>
                    </div>
                    <div className="row">
                        <p className="column column-1">Resolution</p><p className="column column-2">{resolution}</p>
                    </div>
                    <div className="row">
                        <p className="column column-1">Data type</p><p className="column column-2">Raster</p>
                    </div>
                    <div className="row">
                        <p className="column column-1">Observation type</p><p className="column column-2">{raster.observation_type && raster.observation_type.parameter}</p>
                    </div>
                    <div className="row">
                        <p className="column column-1">Measuring unit</p><p className="column column-2">{raster.observation_type && raster.observation_type.unit}</p>
                    </div>
                    <div className="row">
                        <p className="column column-1">Scale</p><p className="column column-2">{raster.observation_type && raster.observation_type.scale}</p>
                    </div>
                    <div className="row">
                        <p className="column column-1">Latest update</p><p className="column column-2">{latestUpdate}</p>
                    </div>
                    <div className="row" style={{display: raster.temporal ? 'flex' : 'none'}}>
                        <p className="column column-1">Interval</p><p className="column column-2">{raster.interval}</p>
                    </div>
                    <div className="row" style={{display: raster.temporal ? 'flex' : 'none'}}>
                        <p className="column column-1">Start</p><p className="column column-2">{start}</p>
                    </div>
                    <div className="row" style={{display: raster.temporal ? 'flex' : 'none'}}>
                        <p className="column column-1">End</p><p className="column column-2">{stop}</p>
                    </div>
                </div>
                <div className="details__get-capabilities">
                    <h4>Lizard WMS GetCapabilities</h4>
                    <hr/>
                    <div>
                        For this raster:
                        <div className="details__url-field">
                            <div
                                className="details__get-capabilities-url"
                                title={getRasterGetCapabilitesURL(raster)}
                            >
                                {getRasterGetCapabilitesURL(raster)}
                            </div>
                            <button
                                className="details__button-copy"
                                title="Copy link"
                                onClick={() => navigator.clipboard.writeText(getRasterGetCapabilitesURL(raster))}
                            >
                                Copy link
                            </button>
                        </div>
                    </div>
                    <br/>
                    {dataset ? (
                        <div>
                            For this complete dataset:
                            <div className="details__url-field">
                                <div
                                    className="details__get-capabilities-url"
                                    title={getDatasetGetCapabilitesURL(dataset) || ""}
                                >
                                    {getDatasetGetCapabilitesURL(dataset)}
                                </div>
                                <button
                                    className="details__button-copy"
                                    title="Copy link"
                                    onClick={() => navigator.clipboard.writeText(getDatasetGetCapabilitesURL(dataset))}
                                >
                                    Copy link
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>
                <div className="details__button-container">
                    <h4>Actions</h4><hr/>
                    <div className="details__buttons">
                        <button className="details__button" onClick={() => openRasterInLizard(raster, centerPoint, zoom)} title="Open in Portal">
                            <i className="fa fa-external-link"/>
                            &nbsp;&nbsp;OPEN IN PORTAL
                        </button>
                        <button className="details__button" onClick={() => openRasterInAPI(raster)} title="Open in API">
                            <i className="fa fa-external-link"/>
                            &nbsp;&nbsp;OPEN IN API
                        </button>
                        <button className="details__button" onClick={this.toggleExportModal} title="Export">
                            <i className="fa fa-download"/>
                            &nbsp;&nbsp;EXPORT RASTER
                        </button>
                    </div>
                </div>
                {/*This is the PopUp window for the export screen*/}
                {this.state.showExport && (
                    <div className="raster-export">
                        <Export
                            raster={raster}
                            bounds={bounds}
                            toggleExportModal={this.toggleExportModal}
                        />
                    </div>
                )}
            </div>
        );
    };
};

const mapStateToProps = (state: MyStore): PropsFromState => {
    if (!state.selectedItem) return {
        raster: null,
        organisations: getOrganisations(state),
        bootstrap: getLizardBootstrap(state)
    };
    return {
        raster: getRaster(state, state.selectedItem),
        organisations: getOrganisations(state),
        bootstrap: getLizardBootstrap(state)
    };
};

export default connect(mapStateToProps)(RasterDetails);