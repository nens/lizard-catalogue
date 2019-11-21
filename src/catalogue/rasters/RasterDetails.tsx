import * as React from 'react';
import { connect } from 'react-redux';
import { Map, TileLayer, WMSTileLayer } from 'react-leaflet';
import { MyStore, getRaster } from '../../reducers';
import { Raster, LatLng, Dataset } from '../../interface';
import '../styles/Details.css';
import '../styles/Export.css';
import '../styles/Modal.css';

import { zoomLevelCalculation, getCenterPoint, getBounds, boundsToDisplay } from '../../utils/latLngZoomCalculation';
import { openRasterInAPI, openRasterInLizard, openRasterGetCapabilities, openDatasetGetCapabilities, getRasterGetCapabilitesURL, getDatasetGetCapabilitesURL } from '../../utils/url';
import Export from '../components/Export';

interface PropsFromState {
    raster: Raster | null
};

interface MyProps {
    datasets: Dataset[]
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

    selectedDataset = (datasets: Dataset[], raster: Raster) => {
        const checkedDataset = datasets.filter(dataset => dataset.checked)[0];
        const selectedDataset = checkedDataset && raster.datasets.find(dataset => dataset.slug === checkedDataset.slug);

        return (checkedDataset && selectedDataset) || null;
    };

    render() {
        //Destructure the props
        const { raster, datasets } = this.props;

        //If no raster is selected, display a text
        if (!raster) return <div className="details details__loading">Please select a raster</div>;
        const dataset = this.selectedDataset(datasets, raster);

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

        return (
            <div className="details">
                <h3 title={raster.name}>{raster.name}</h3>
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
                        <div
                            className="details__get-capabilities-url"
                            title={getRasterGetCapabilitesURL(raster)}
                            onClick={() => openRasterGetCapabilities(raster)}
                        >
                            {getRasterGetCapabilitesURL(raster)}
                        </div>
                    </div>
                    <br/>
                    <div
                        style={{display: dataset ? "block" : "none"}}
                    >
                        For this complete dataset:
                        <div
                            className="details__get-capabilities-url"
                            title={getDatasetGetCapabilitesURL(dataset) || ""}
                            onClick={() => dataset && openDatasetGetCapabilities(dataset)}
                        >
                            {getDatasetGetCapabilitesURL(dataset)}
                        </div>
                    </div>
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
        raster: null
    };
    return {
        raster: getRaster(state, state.selectedItem)
    };
};

export default connect(mapStateToProps)(RasterDetails);