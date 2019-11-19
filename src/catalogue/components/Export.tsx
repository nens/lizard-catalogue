import * as React from 'react';
import { Map, TileLayer, WMSTileLayer } from 'react-leaflet';
import { Raster } from '../../interface';
import '../styles/Export.css';
import Download from './Download';

interface MyProps {
    raster: Raster,
    bounds: number[][],
    toggleExportModal: () => void
};

export default class Export extends React.Component<MyProps> {
    state = {
        showDownloadModal: false
    };

    render() {
        const { raster, bounds, toggleExportModal } = this.props;
        const { showDownloadModal } = this.state;

        return (
            <div className="export">
                <div
                    className="export_main"
                    style={{
                        display: showDownloadModal ? "none" : "flex"
                    }}
                >
                    <div className="export_map-selection">
                        <h3>Export Selection</h3>
                        <div className="export_map-box">
                            <Map bounds={bounds} zoomControl={false} style={{width: "100%"}}>
                                <TileLayer url="https://{s}.tiles.mapbox.com/v3/nelenschuurmans.iaa98k8k/{z}/{x}/{y}.png" />
                                <WMSTileLayer url={raster.wms_info.endpoint} layers={raster.wms_info.layer} styles={raster.options.styles} />
                            </Map>
                        </div>
                    </div>
                    <div className="export_content">
                        <div className="export_raster">
                            <h3>Selected Raster</h3>
                            <hr />
                            <div className="export_raster-info">
                                <div className="export_raster-name" title={raster.name}>{raster.name}</div>
                                <br/>
                                <div>
                                    <h4>Description</h4>
                                    <div className="export_raster-description">{raster.description}</div>
                                </div>
                                <br/>
                                <div>
                                    <h4>Organisation</h4>
                                    <span>{raster.organisation && raster.organisation.name}</span>
                                </div>
                                <br/>
                                <div>
                                    <h4>UUID</h4>
                                    <span>{raster.uuid}</span>
                                </div>
                            </div>
                        </div>
                        <div className="export_settings">
                            <h3>Export Settings</h3>
                            <hr />
                            <div>
                                {/* Datetime picker for temporal raster */}
                                {raster.temporal && (
                                    <div>
                                        <h4>Date / Time</h4>
                                        <input type="datetime-local"/>
                                    </div>
                                )}
                                <br/>
                                <div>
                                    <h4>Projection</h4>
                                    <input type="text" defaultValue={raster.projection}/>
                                </div>
                                <br/>
                                <div>
                                    <h4>Resolution</h4>
                                    <input type="text"/>
                                </div>
                                <br/>
                                <div>
                                    <h4>Pixels</h4>
                                    <input type="text"/>
                                </div>
                            </div>
                        </div>
                        <div className="export_text">
                            First choose your settings then select the
                            desired tiles to export/download
                        </div>
                        <div className="export_buttons">
                            <button className="details__button">
                                Cancel
                            </button>
                            <button className="details__button" onClick={() => this.setState({showDownloadModal: true})}>
                                <i className="fa fa-download"/>
                                &nbsp;&nbsp;Make a selection
                            </button>
                        </div>
                    </div>
                </div>
                {/*This is the PopUp window for the download modal*/}
                {showDownloadModal && (
                    <div className="export_download">
                        <Download />
                    </div>
                )}
                {/* eslint-disable-next-line */}
                <a className="export_close" onClick={toggleExportModal}>&times;</a>
            </div>
        );
    };
};