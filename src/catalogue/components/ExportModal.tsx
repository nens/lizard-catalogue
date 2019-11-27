import * as React from 'react';
import { connect } from 'react-redux';

import { Map, TileLayer, WMSTileLayer, Rectangle } from 'react-leaflet';
import {MyStore, getExportAvailableGridCells, getExportSelectedGridCellIds} from '../../reducers';
import {addToSelectedExportGridCellIds, removeFromSelectedExportGridCellIds, removeAllSelectedExportGridCellIds } from '../../action';

import { Raster } from '../../interface';
import '../styles/Export.css';

interface MyProps {
    raster: Raster,
    bounds: number[][],
    openDownloadModal: () => void,
    availableGridCells: MyStore['rasterExportState']['availableGridCells'],
    selectedGridCellIds: MyStore['rasterExportState']['selectedGridCellIds'],
    addToSelectedExportGridCellIds: any,
    removeFromSelectedExportGridCellIds: any,
    removeAllSelectedExportGridCellIds: any,
};

class ExportModal extends React.Component<MyProps> {
    render() {
        const { raster, bounds, openDownloadModal } = this.props;
        const exportGridCells = this.props.availableGridCells;
        const selectedGridIds = this.props.selectedGridCellIds; 

        console.log('selectedGridIds render', selectedGridIds);

        return (
            <div className="export_main">
                <div className="export_map-selection">
                    <h3>Export Selection</h3>
                    <div className="export_map-box">
                        <Map bounds={bounds} zoomControl={false} style={{ width: "100%" }}>
                            <TileLayer url="https://{s}.tiles.mapbox.com/v3/nelenschuurmans.iaa98k8k/{z}/{x}/{y}.png" />
                            <WMSTileLayer url={raster.wms_info.endpoint} layers={raster.wms_info.layer} styles={raster.options.styles} />
                            {
                                exportGridCells.map((gridcell) =>{
                                    const isSelected = selectedGridIds.find(item=>{
                                        return item[0] === gridcell.properties.id[0] &&  item[1] === gridcell.properties.id[1];
                                    })
                                    console.log('refraw rectangles', isSelected, gridcell.properties.id[0]);
                                    return (
                                        <Rectangle
                                            bounds={gridcell.geometry.coordinates}
                                            // unfortuenedly react leaflet doesnot seem to update the class
                                            // therefore we set a random key so the elements get rerendered every time
                                            // another option would be to set the color attribute, but this creates difficulties with transparency etc
                                            className={`export_grid_cell ${isSelected? 'selected': 'not_selected' }`}
                                            // key={gridcell.properties.id + ''}
                                            key={Math.random()}
                                            onClick={()=>{
                                                if (isSelected) {
                                                    this.props.removeFromSelectedExportGridCellIds([gridcell.properties.id])
                                                } else {
                                                    this.props.addToSelectedExportGridCellIds([gridcell.properties.id]);
                                                }
                                                
                                            }}
                                            
                                            // onHoover={()=>console.log("hoover")}
                                            // onMouseMove={()=>console.log("hoover")}
                                            // color={`${isSelected? '#E2D300': 'A10000'}`}
                                            // selected items borders should not be colored, but they are. therefore hide them underneath their neightbours
                                            // zIndex={`${isSelected? 10: 20}`}
                                        />
                                    );
                                })
                            }
                        </Map>
                    </div>
                </div>
                <div className="export_content">
                    <div className="export_raster">
                        <h3>Selected Raster</h3>
                        <hr />
                        <div className="export_raster-info">
                            <div className="export_raster-name" title={raster.name}>{raster.name}</div>
                            <br />
                            <div>
                                <h4>Description</h4>
                                <div className="export_raster-description">{raster.description}</div>
                            </div>
                            <br />
                            <div>
                                <h4>Organisation</h4>
                                <span>{raster.organisation && raster.organisation.name}</span>
                            </div>
                            <br />
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
                                    <input type="datetime-local" />
                                </div>
                            )}
                            <br />
                            <div>
                                <h4>Projection</h4>
                                <input type="text" defaultValue={raster.projection} />
                            </div>
                            <br />
                            <div>
                                <h4>Resolution</h4>
                                <input type="text" />
                            </div>
                            <br />
                            <div>
                                <h4>Pixels</h4>
                                <input type="text" />
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
                        <button className="details__button" onClick={openDownloadModal}>
                            <i className="fa fa-download" />
                            &nbsp;&nbsp;Make a selection
                        </button>
                        <button
                            onClick={this.props.removeAllSelectedExportGridCellIds}
                        >
                            Remove Selection
                        </button>
                    </div>
                </div>
            </div>
        );
    };
};

interface PropsFromState {
    availableGridCells: MyStore['rasterExportState']['availableGridCells'],
    selectedGridCellIds: MyStore['rasterExportState']['selectedGridCellIds'],
};

const mapStateToProps = (state: MyStore): PropsFromState => ({
    availableGridCells: getExportAvailableGridCells(state),
    selectedGridCellIds: getExportSelectedGridCellIds(state),
});

interface PropsFromDispatch {
    addToSelectedExportGridCellIds: (ids: any) => void,
    removeFromSelectedExportGridCellIds: (ids: any) => void,
    removeAllSelectedExportGridCellIds: () => void,
};

const mapDispatchToProps = (dispatch: any): PropsFromDispatch => ({
    addToSelectedExportGridCellIds: (ids) => dispatch(addToSelectedExportGridCellIds(ids)),
    removeFromSelectedExportGridCellIds: (ids) => dispatch(removeFromSelectedExportGridCellIds(ids)),
    removeAllSelectedExportGridCellIds: ()=> dispatch(removeAllSelectedExportGridCellIds()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ExportModal);