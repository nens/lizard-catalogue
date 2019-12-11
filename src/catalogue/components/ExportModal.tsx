import * as React from 'react';
import { connect } from 'react-redux';

import { 
    Map, 
    TileLayer, 
    WMSTileLayer, 
    GeoJSON,
} from 'react-leaflet';
import {
    MyStore, 
    getExportAvailableGridCells, 
    getExportSelectedGridCellIds, 
    getExportGridCellResolution, 
    getExportGridCellProjection, 
    getExportGridCellTileWidth, 
    getExportGridCellTileHeight,
    getDateTimeStart, 
    getProjections,
    getExportGridCellCellFetchingState,
} from '../../reducers';
import {
    addToSelectedExportGridCellIds, 
    removeFromSelectedExportGridCellIds, 
    removeAllSelectedExportGridCellIds, 
    updateExportFormAndFetchExportGridCells, 
    requestRasterExports,
    requestProjections,
} from '../../action';
import { AddToSelectedExportGridCellIds, ExportGridCelId, RemoveFromSelectedExportGridCellIds,RemoveAllSelectedExportGridCellIds,} from '../../interface';
import {areGridCelIdsEqual} from '../../utils/rasterExportUtils';
import { Raster, FieldValuePair } from '../../interface';
import '../styles/Export.css';
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import moment from "moment";
import MDSpinner from "react-md-spinner";



interface MyProps {
    raster: Raster,
    bounds: number[][],
    openDownloadModal: () => void,
    fetchingGridState: MyStore['rasterExportState']['fetchingStateGrid'],
    availableProjections: MyStore['rasterExportState']['projectionsAvailableForCurrentRaster']['projections'],
    availableGridCells: MyStore['rasterExportState']['availableGridCells'],
    selectedGridCellIds: MyStore['rasterExportState']['selectedGridCellIds'],
    addToSelectedExportGridCellIds: (gridCellIds: ExportGridCelId[]) => AddToSelectedExportGridCellIds,
    removeFromSelectedExportGridCellIds: (gridCellIds: ExportGridCelId[]) => RemoveFromSelectedExportGridCellIds,
    removeAllSelectedExportGridCellIds: () => RemoveAllSelectedExportGridCellIds,
    updateExportFormAndFetchExportGridCells: (fieldValuePairs: any[]) => void,
    requestProjections: (rasterUuid:string) => void,
    resolution: MyStore['rasterExportState']['resolution'],
    projection: MyStore['rasterExportState']['projection'],
    tileWidth: MyStore['rasterExportState']['tileWidth'],
    tileHeight: MyStore['rasterExportState']['tileHeight'],
    requestRasterExports: (numberOfInboxMessages:number)=> void,
    dateTimeStart: MyStore['rasterExportState']['dateTimeStart'],
    inbox: MyStore['inbox'],
};

class ExportModal extends React.Component<MyProps> {

    componentDidMount() {
        this.props.requestProjections(this.props.raster.uuid);
        this.props.updateExportFormAndFetchExportGridCells([
            {field: "projection", value: this.props.raster.projection},
            {field: "resolution", value: '100'},
            {field: "tileWidth", value: '1000'},
            {field: "tileHeight", value: '1000'},
            {field:'dateTimeStart', value: ""},
            {
                field: 'bounds',
                value: { 
                    north: this.props.bounds[0][0],
                    east: this.props.bounds[0][1],
                    south: this.props.bounds[1][0],
                    west: this.props.bounds[1][1],
                }
            },
        ]);
    }

    render() {
        const { raster, bounds, openDownloadModal } = this.props;
        const exportGridCells = this.props.availableGridCells;
        const selectedGridIds = this.props.selectedGridCellIds; 

        console.log('bounds render', bounds, this.props.dateTimeStart);

        return (
            <div className="export_main">
                <div className="export_map-selection">
                    <h3>Export Selection</h3>
                    <div className="export_map-box" style={{position:"relative"}}>
                        { 
                            this.props.fetchingGridState !== "RECEIVED"?
                            <div 
                                className="loading-screen"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    position: "absolute",
                                    zIndex: 999999999,
                                    display: "flex",
                                    flexDirection: "column",
                                    backgroundColor: "rgba(0,0,0,0.3)",
                                }}
                            >
                                <MDSpinner size={150} />
                                <div
                                    style={{
                                        fontSize: "3rem",
                                        marginTop: "3rem",
                                        color: "white",
                                    }}
                                >
                                    {
                                         this.props.fetchingGridState === "SENT" || this.props.fetchingGridState === "NOT_SENT" ? 
                                        "Retrieving Grid Cells..."
                                        : this.props.fetchingGridState === "FAILED" ?
                                        "Failed Retrieving Grid Cells... Please try different settings"
                                        :
                                        // should never happen ..
                                        null
                                    }
                                </div>
                            </div>
                            :
                            null
                        }
                        
                        <Map 
                            bounds={bounds} 
                            zoomControl={false} 
                            style={{ width: "100%" }}
                            onMoveend={event=>{
                                const bounds = event.target.getBounds();
                                this.props.updateExportFormAndFetchExportGridCells([
                                    {
                                    field: 'bounds',
                                    value: { 
                                        north: bounds._northEast.lat,
                                        east: bounds._northEast.lng,
                                        south: bounds._southWest.lat,
                                        west: bounds._southWest.lng,
                                    }
                                }])
                            }}
                        >
                            <TileLayer url="https://{s}.tiles.mapbox.com/v3/nelenschuurmans.iaa98k8k/{z}/{x}/{y}.png" />
                            <WMSTileLayer url={raster.wms_info.endpoint} layers={raster.wms_info.layer} styles={raster.options.styles} />
                            {exportGridCells.length !== 0 ?
                                <GeoJSON 
                                    className={"export_grid_cell"}
                                    data={{"type": "FeatureCollection", "features": exportGridCells}}
                                    style={(feature)=>{
                                        const isSelected = selectedGridIds.find(item=>{
                                            return areGridCelIdsEqual(feature.properties.id, item);
                                        })
                                        if (isSelected) {
                                            return {
                                                "color": "#A10000",
                                                "fillColor": "#E2D300",
                                                "fillOpacity": "0.71",
    
                                            }
                                        } else {
                                            return {
                                                "color": "#A10000",
                                                "fillOpacity": "0",
    
                                            }
                                        }
                                        
                                    }}
                                    key={JSON.stringify(exportGridCells) + JSON.stringify(selectedGridIds)}
                                    onEachFeature={(_, layer) => { // _ = feature
                                        layer.on({
                                          click: (event)=>{
                                                const gridcell = event.target.feature;
                                                const isSelected = selectedGridIds.find(item=>{
                                                    return areGridCelIdsEqual(gridcell.properties.id, item);
                                                })
                                                if (isSelected) {
                                                    this.props.removeFromSelectedExportGridCellIds([gridcell.properties.id])
                                                } else {
                                                    this.props.addToSelectedExportGridCellIds([gridcell.properties.id]);
                                                }

                                            },
                                            
                                        });
                                      }}
                                />
                            :
                            null
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
                                    <Datetime
                                        // For now do not set value because the field keeps itself in sync. TODO keep field in sync
                                        // value={e.dateTime}
                                        onChange={event => {
                                            const isoDateTime = event === ''? '' : moment(event).toISOString()
                                            this.props.updateExportFormAndFetchExportGridCells([{field:'dateTimeStart', value: isoDateTime}]);
                                                
                                        }}
                                    />
                                </div>
                            )}
                            <br />
                            <div>
                                <h4>Projection</h4>
                                <select
                                    value={this.props.projection}
                                    onChange={(event)=> {
                                        this.props.updateExportFormAndFetchExportGridCells([{field:'projection', value: event.target.value+''}]);
                                    }} 
                                >
                                    {this.props.availableProjections.map(projectionObj=>{
                                        return (
                                            <option
                                                value={projectionObj.code }
                                            >
                                                {projectionObj.name}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                            <br />
                            <div>
                                <h4>Resolution (based on projection)</h4>
                                <input 
                                    type="text"
                                    value={this.props.resolution}
                                    onChange={(event)=> {
                                        const filteredString = (event.target.value+'').replace(/[^\d.]/g, '');
                                        this.props.updateExportFormAndFetchExportGridCells([{field:'resolution', value: filteredString}]);
                                    }}
                                />
                                {this.props.resolution === ""? <span>* Choose a number</span>:null}
                            </div>
                            <br />
                            <div>
                                <h4>Tile Width in Pixels</h4>
                                <input 
                                    type="text"
                                    value={this.props.tileWidth}
                                    onChange={(event)=> {
                                        const filteredString = (event.target.value+'').replace(/[^\d]/g, '');
                                        this.props.updateExportFormAndFetchExportGridCells([{field:'tileWidth', value: filteredString}]);
                                    }}
                                />
                                {this.props.tileWidth === ""? <span><br/>* Choose a number</span>:null}
                            </div>
                            <br />
                            <div>
                                <h4>Tile Height in Pixels</h4>
                                <input 
                                    type="text"
                                    value={this.props.tileHeight}
                                    onChange={(event)=> {
                                        const filteredString = (event.target.value+'').replace(/[^\d]/g, '');
                                        this.props.updateExportFormAndFetchExportGridCells([{field:'tileHeight', value: filteredString}]);
                                    }}
                                />
                                {this.props.tileHeight === ""? <span>* Choose a number</span>:null}
                                {
                                    parseInt(this.props.tileHeight + '') && 
                                    parseInt(this.props.tileWidth + '') && 
                                    (parseInt(this.props.tileHeight+'') * parseInt(this.props.tileWidth+'') > 1000000000) 
                                    ? 
                                    <div style={{color:"#A10000", marginTop: "1rem"}}> 
                                        <span
                                            style={{fontSize: "1.5rem"}}
                                        >
                                            Too many pixels: 
                                        </span>
                                        <br/>
                                        Tile-Width × Tile-Height
                                        <br/>
                                        must be below 
                                        <br/>
                                        1.000.000.000 pixels 
                                    </div>
                                    :
                                    null
                                }
                            </div>
                        </div>
                    </div>
                    <div className="export_text">
                        First choose your settings then select the
                        desired tiles to export/download
                        </div>
                    <div className="export_buttons">
                        <button 
                            className={`details__button`}
                            disabled={this.props.selectedGridCellIds.length === 0}
                            title={this.props.selectedGridCellIds.length === 0 ? "First make a selection on the map" : undefined}  
                            onClick={()=>{
                                this.props.requestRasterExports(this.props.inbox.length);
                                openDownloadModal();
                            }}
                        >
                            <i className="fa fa-download" />
                            {`Download ${this.props.selectedGridCellIds.length}  selected cells`}
                        </button>
                        <button 
                            className={`details__button`}
                            disabled={this.props.selectedGridCellIds.length === 0? true: false}
                            title={this.props.selectedGridCellIds.length === 0 ? "No grid cells selected" : undefined}  
                            onClick={()=>{
                                this.props.removeAllSelectedExportGridCellIds();
                            }}
                        >
                            Cancel selection
                        </button>
                    </div>
                </div>
            </div>
        );
    };
};

interface PropsFromState {
    fetchingGridState: MyStore['rasterExportState']['fetchingStateGrid'],
    availableProjections: MyStore['rasterExportState']['projectionsAvailableForCurrentRaster']['projections'],
    availableGridCells: MyStore['rasterExportState']['availableGridCells'],
    selectedGridCellIds: MyStore['rasterExportState']['selectedGridCellIds'],
    resolution: MyStore['rasterExportState']['resolution'],
    projection: MyStore['rasterExportState']['projection'],
    tileWidth: MyStore['rasterExportState']['tileWidth'],
    tileHeight: MyStore['rasterExportState']['tileHeight'],
    dateTimeStart: MyStore['rasterExportState']['dateTimeStart'],
    inbox: MyStore['inbox'],
};

const mapStateToProps = (state: MyStore): PropsFromState => ({
    fetchingGridState: getExportGridCellCellFetchingState(state),
    availableGridCells: getExportAvailableGridCells(state),
    availableProjections: getProjections(state),
    selectedGridCellIds: getExportSelectedGridCellIds(state),
    resolution: getExportGridCellResolution(state),
    projection: getExportGridCellProjection(state),
    tileWidth: getExportGridCellTileWidth(state),
    tileHeight: getExportGridCellTileHeight(state),
    dateTimeStart: getDateTimeStart(state),
    inbox: state.inbox,
});

interface PropsFromDispatch {
    addToSelectedExportGridCellIds: (ids: ExportGridCelId[]) => void,
    removeFromSelectedExportGridCellIds: (ids: ExportGridCelId[]) => void,
    removeAllSelectedExportGridCellIds: () => void,
    updateExportFormAndFetchExportGridCells: (fieldValuePairs: any[]) => void,
    requestRasterExports: (numberOfInboxMessages:number)=> void,
    requestProjections: (rasterUuid:string) => void,
};

const mapDispatchToProps = (dispatch: any): PropsFromDispatch => ({
    addToSelectedExportGridCellIds: (ids) => dispatch(addToSelectedExportGridCellIds(ids)),
    removeFromSelectedExportGridCellIds: (ids) => dispatch(removeFromSelectedExportGridCellIds(ids)),
    removeAllSelectedExportGridCellIds: ()=> dispatch(removeAllSelectedExportGridCellIds()),
    updateExportFormAndFetchExportGridCells: (fieldValuePairs: FieldValuePair[])=> updateExportFormAndFetchExportGridCells(fieldValuePairs, dispatch),
    requestRasterExports: (numberOfInboxMessages:number)=> requestRasterExports(numberOfInboxMessages,dispatch),
    requestProjections: (rasterUuid:string) => requestProjections(rasterUuid, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ExportModal);