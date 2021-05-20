import * as React from 'react';
import { connect } from 'react-redux';
import { Map, TileLayer, WMSTileLayer } from 'react-leaflet';
import { MyStore, getRaster, getOrganisations, getLizardBootstrap } from '../../reducers';
import { Raster, LatLng, Organisation, Bootstrap } from '../../interface';
import { isAuthorizedToManageLayer } from '../../utils/authorization';
import { zoomLevelCalculation, getCenterPoint, getBounds, boundsToDisplay } from '../../utils/latLngZoomCalculation';
import { openRasterInAPI, openRasterInLizard, getDatasetGetCapabilitesURL, getRasterGetCapabilitesURL } from '../../utils/url';
import { mapBoxAccesToken } from "../../mapboxConfig.js";
import Export from '../components/Export';
import manageIcon from '../../images/manage.svg';
import '../styles/Details.css';
import '../styles/Modal.css';
import '../styles/Buttons.css';

interface PropsFromState {
    raster: Raster | null,
    organisations: Organisation[],
    bootstrap: Bootstrap,
    user: Bootstrap['user'],
};

interface MyProps {
    filters: MyStore['filters'],
};

interface MyState {
    showExport: boolean,
    showTableTab: string,
};

class RasterDetails extends React.Component<PropsFromState & MyProps, MyState> {
    state = {
        showExport: false,
        showTableTab: 'Details',
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
        if (!raster) return <div className="details details-loading">Please select a raster</div>;
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
            <div className="details" id="scrollbar">
                <div className="details-name">
                    <h3 title={raster.name}>
                        {raster.name}
                    </h3>
                    <span title="To manage this raster">
                        {authorizedToManageLayer ?
                            <a
                                href={`/management/#/data_management/rasters/layers/${raster.uuid}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img
                                    className="details-manage-icon"
                                    src={manageIcon}
                                    alt="View in manage client"
                                />
                            </a>
                        :null
                        }
                    </span>
                </div>
                <div className="details-uuid">
                    <span>{raster.uuid}</span>
                    <button
                        className="button-copy"
                        onClick={() => navigator.clipboard.writeText(raster.uuid)}
                    >
                        <i className="fa fa-clone" />
                    </button>
                </div>
                <div className="details-map">
                    <Map bounds={bounds} zoomControl={false}>
                        <TileLayer url={`https://api.mapbox.com/styles/v1/nelenschuurmans/ck8sgpk8h25ql1io2ccnueuj6/tiles/256/{z}/{x}/{y}@2x?access_token=${mapBoxAccesToken}`} />
                        <WMSTileLayer url={raster.wms_info.endpoint} layers={raster.wms_info.layer} styles={raster.options.styles} />
                    </Map>
                </div>
                <div className="details-info">
                    <span className="details-title">Description</span>
                    <span className="description" id="scrollbar">{raster.description}</span>
                </div>
                <div className="details-info">
                    <span className="details-title">Organisation</span>
                    <span>{raster.organisation && raster.organisation.name}</span>
                </div>
                {dataset ? (
                    <div className="details-info">
                        <span className="details-title">Dataset</span>
                        <span>{dataset && dataset.slug}</span>
                    </div>
                ) : null}
                <div className="details-capabilities">
                    <span className="details-title">Lizard WMS GetCapabilities</span>
                    <div style={{ marginBottom: "5px" }}>
                        For this raster:
                        <div className="details__url-field">
                            <input
                                type="text"
                                className="details__get-capabilities-url"
                                title={getRasterGetCapabilitesURL(raster)}
                                value={getRasterGetCapabilitesURL(raster)}
                                spellCheck={false}
                                readOnly={true}
                            />
                            <button
                                className="details__button-copy"
                                title="Copy link"
                                onClick={() => navigator.clipboard.writeText(getRasterGetCapabilitesURL(raster))}
                            >
                                Copy link
                            </button>
                        </div>
                    </div>
                    {dataset ? (
                        <div>
                            For this complete dataset:
                            <div className="details__url-field">
                                <input
                                    type="text"
                                    className="details__get-capabilities-url"
                                    title={getDatasetGetCapabilitesURL(dataset)}
                                    value={getDatasetGetCapabilitesURL(dataset)}
                                    spellCheck={false}
                                    readOnly={true}
                                />
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
                <div className="details-grid details-grid-header">
                    <div
                        className={this.state.showTableTab === 'Details' ? 'details-grid-header-selected' : ''}
                        onClick={() => this.setState({showTableTab: 'Details'})}
                    >
                        Details
                    </div>
                    <div
                        className={this.state.showTableTab === 'Actions' ? 'details-grid-header-selected' : ''}
                        onClick={() => this.setState({showTableTab: 'Actions'})}
                    >
                        Actions
                    </div>
                </div>
                {this.state.showTableTab === 'Details' ? (
                    <div className="details-grid details-grid-body">
                        <div>Temporal</div>
                        <div>{raster.temporal ? 'Yes' : 'No'}</div>
                        <div>Resolution</div>
                        <div>{resolution}</div>
                        <div>Data type</div>
                        <div>Raster</div>
                        <div>Observation type</div>
                        <div>{raster.observation_type && raster.observation_type.parameter}</div>
                        <div>Measuring unit</div>
                        <div>{raster.observation_type && raster.observation_type.unit}</div>
                        <div>Scale</div>
                        <div>{raster.observation_type && raster.observation_type.scale}</div>
                        <div>Latest update</div>
                        <div>{latestUpdate}</div>
                        {raster.temporal ? (
                            <>
                            <div>Interval</div>
                            <div>{raster.interval}</div>
                            <div>Start</div>
                            <div>{start}</div>
                            <div>End</div>
                            <div>{stop}</div>
                            </>
                        ) : null}
                    </div>
                ) : (
                    <div className="details-grid details-grid-body details-grid-actions">
                        <div />
                        <div>
                            <button
                                className="button-action"
                                onClick={() => openRasterInLizard(raster, centerPoint, zoom)}
                                title="Open in Portal"
                            >
                                OPEN IN PORTAL
                            </button>
                        </div>
                        <div />
                        <div>
                            <button
                                className="button-action"
                                onClick={() => openRasterInAPI(raster)}
                                title="Open in API"
                            >
                                OPEN IN API
                            </button>
                        </div>
                        <div />
                        <div>
                            <button
                                className="button-action"
                                onClick={this.toggleExportModal}
                                disabled={!this.props.user.authenticated}
                                title={!this.props.user.authenticated? "Log in to export" : "Export"}
                            >
                                EXPORT RASTER
                            </button>
                        </div>
                    </div>
                )}
                {/*This is the PopUp window for the export screen*/}
                {this.state.showExport && (
                    <div className="modal-background">
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
        bootstrap: getLizardBootstrap(state),
        user: state.bootstrap.user,
    };
    return {
        raster: getRaster(state, state.selectedItem),
        organisations: getOrganisations(state),
        bootstrap: getLizardBootstrap(state),
        user: state.bootstrap.user,
    };
};

export default connect(mapStateToProps)(RasterDetails);