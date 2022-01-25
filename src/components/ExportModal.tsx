import { useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { mapBoxAccesToken } from './../mapboxConfig.js';
import { Map, TileLayer, WMSTileLayer, GeoJSON } from 'react-leaflet';
import { getInbox, getRasterExportState } from './../reducers';
import { AppDispatch } from './../store';
import {
    addToSelectedExportGridCellIds,
    removeFromSelectedExportGridCellIds,
    removeAllSelectedExportGridCellIds,
    updateExportFormAndFetchExportGridCells,
    requestRasterExports,
    requestProjections,
} from './../action';
import { getSpatialBoundsIntersect, gridPolygonToSpatialBounds } from './../utils/geoUtils';
import { areGridCelIdsEqual } from './../utils/rasterExportUtils';
import { Raster, FieldValuePair } from './../interface';
import Datetime from "react-datetime";
import moment from "moment";
import MDSpinner from "react-md-spinner";
import '../styles/Export.css';
import "react-datetime/css/react-datetime.css";

const maximumSelectForExport = 3;

interface MyProps {
    raster: Raster,
    bounds: number[][],
    openDownloadModal: () => void,
}

function ExportModal (props: MyProps & PropsFromDispatch) {
    const { raster, bounds, openDownloadModal, requestProjections, updateExportFormAndFetchExportGridCells } = props;

    const inbox = useSelector(getInbox);
    const rasterExportState = useSelector(getRasterExportState);
    const fetchingGridState = rasterExportState.fetchingStateGrid;
    const availableGridCells = rasterExportState.availableGridCells;
    const availableProjections = rasterExportState.projectionsAvailableForCurrentRaster.projections;
    const selectedGridCellIds = rasterExportState.selectedGridCellIds;
    const resolution = rasterExportState.resolution;
    const projection = rasterExportState.projection;
    const tileWidth = rasterExportState.tileWidth;
    const tileHeight = rasterExportState.tileHeight;
    const exportBounds = rasterExportState.bounds;
    const noDataValue = rasterExportState.noDataValue;
    // const dateTimeStart = rasterExportState.dateTimeStart;

    const exportGridCells = availableGridCells.filter(grid => getSpatialBoundsIntersect(gridPolygonToSpatialBounds(grid), exportBounds));

    useEffect(() => {
        requestProjections(raster.uuid);
        updateExportFormAndFetchExportGridCells(raster.uuid, [
            {field: "projection", value: raster.projection},
            {field: "resolution", value: '100'},
            {field: "tileWidth", value: '1000'},
            {field: "tileHeight", value: '1000'},
            {field:'dateTimeStart', value: ""},
            {field: "noDataValue", value: undefined},
            {
                field: 'bounds',
                value: { 
                    north: bounds[0][0],
                    east: bounds[0][1],
                    south: bounds[1][0],
                    west: bounds[1][1],
                }
            }
        ]);
    }, [raster, bounds, requestProjections, updateExportFormAndFetchExportGridCells]);

    return (
        <div className="export">
            <div className="export_map-selection">
                <h3>Export Selection</h3>
                <div className="export_map-box">
                    {
                        // show spinner if gridcells are not yet retrieved
                        (fetchingGridState === "SENT" || fetchingGridState === "NOT_SENT") && exportGridCells.length===0 ? (
                        <div
                            className="loading-screen loading-screen-export"
                        >
                            <MDSpinner size={150} />
                            <div
                                className="loading-screen-export-text"
                            >
                                Retrieving Grid Cells..."
                            </div>
                        </div>
                        ) : null
                    }
                    <Map
                        bounds={bounds}
                        zoomControl={false}
                        style={{ width: "100%" }}
                        onMoveend={event=>{
                            const bounds = event.target.getBounds();
                            const mapSpatialBounds = {
                                north: bounds._northEast.lat,
                                east: bounds._northEast.lng,
                                south: bounds._southWest.lat,
                                west: bounds._southWest.lng,
                            };
                            const rasterBounds = raster.spatial_bounds;
                            const intersectSpatialBounds = getSpatialBoundsIntersect(mapSpatialBounds, rasterBounds);
                            if (intersectSpatialBounds===null) {
                                return;
                            }

                            props.updateExportFormAndFetchExportGridCells(
                                props.raster.uuid,
                                [{
                                    field: 'bounds',
                                    value: intersectSpatialBounds
                                }]
                            )
                        }}
                    >
                        <TileLayer url={`https://api.mapbox.com/styles/v1/nelenschuurmans/ck8sgpk8h25ql1io2ccnueuj6/tiles/256/{z}/{x}/{y}@2x?access_token=${mapBoxAccesToken}`} />
                        <WMSTileLayer url={raster.wms_info.endpoint} layers={raster.wms_info.layer} styles={raster.options.styles} />
                        {exportGridCells.length !== 0 ? (
                            <GeoJSON 
                                className={"export_grid_cell"}
                                data={{"type": "FeatureCollection", "features": exportGridCells}}
                                style={(feature)=>{
                                    const isSelected = selectedGridCellIds.find(item=>{
                                        return areGridCelIdsEqual(feature.properties.id, item);
                                    })
                                    if (isSelected) {
                                        return {
                                            "color": "#A10000",
                                            "fillColor": "#E2D300",
                                            "fillOpacity": "0.71",

                                        }
                                    } else if (selectedGridCellIds.length === maximumSelectForExport) {
                                        return {
                                            "color": "#A10000",
                                            "fillColor": "transparent",
                                            "fillOpacity": "0.71",

                                        }
                                    } else {
                                        return {
                                            "color": "#A10000",
                                            "fillOpacity": "0",

                                        }
                                    }
                                    
                                }}
                                key={exportGridCells.length + JSON.stringify(selectedGridCellIds)}
                                onEachFeature={(_, layer) => { // _ = feature
                                    layer.on({
                                        click: (event)=>{
                                            const gridcell = event.target.feature;
                                            const isSelected = selectedGridCellIds.find(item=>{
                                                return areGridCelIdsEqual(gridcell.properties.id, item);
                                            })
                                            if (isSelected) {
                                                props.removeFromSelectedExportGridCellIds([gridcell.properties.id])
                                            } else if (selectedGridCellIds.length < maximumSelectForExport) {
                                                props.addToSelectedExportGridCellIds([gridcell.properties.id]);
                                            }

                                        },
                                        
                                    });
                                    }}
                            />
                        ) : null}
                    </Map>
                </div>
            </div>
            <div className="export_rightsidebar">
                <div className="export_raster">
                    <h3>Selected Raster</h3>
                    <div className="export_raster-info">
                        <div className="export_raster-name" title={raster.name}>{raster.name}</div>
                        <div>
                            <h4>Description</h4>
                            <div className="export_raster-description">{raster.description}</div>
                        </div>
                        <div>
                            <h4>Organisation</h4>
                            <span>{raster.organisation && raster.organisation.name}</span>
                        </div>
                        <div>
                            <h4>UUID</h4>
                            <span>{raster.uuid}</span>
                        </div>
                    </div>
                </div>
                <div className="export_settings">
                    <h3>Export Settings</h3>
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
                                        props.updateExportFormAndFetchExportGridCells(props.raster.uuid, [{field:'dateTimeStart', value: isoDateTime}]);
                                            
                                    }}
                                />
                            </div>
                        )}
                        <br />
                        <div>
                            <h4>Projection</h4>
                            <select
                                className="export_input" 
                                value={projection}
                                onChange={(event)=> {
                                    props.updateExportFormAndFetchExportGridCells(props.raster.uuid, [{field:'projection', value: event.target.value+''}]);
                                }} 
                            >
                                {availableProjections.map((projectionObj, i)=>{
                                    return (
                                        <option
                                            key={i}
                                            value={projectionObj.code}
                                        >
                                            {projectionObj.code+ " - "+ projectionObj.name}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                        <br />
                        <div>
                            <h4>Pixel size (based on projection)</h4>
                            <input 
                                className="export_input" 
                                type="text"
                                value={resolution}
                                onChange={(event)=> {
                                    const filteredString = (event.target.value+'').replace(/[^\d.]/g, '');
                                    props.updateExportFormAndFetchExportGridCells(props.raster.uuid, [{field:'resolution', value: filteredString}]);
                                }}
                            />
                            {resolution === ""? <span>* Choose a number</span>:null}
                        </div>
                        <br />
                        <div>
                            <h4>Tile Width in Pixels</h4>
                            <input 
                                className="export_input" 
                                type="text"
                                value={tileWidth}
                                onChange={(event)=> {
                                    const filteredString = (event.target.value+'').replace(/[^\d]/g, '');
                                    props.updateExportFormAndFetchExportGridCells(props.raster.uuid, [{field:'tileWidth', value: filteredString}]);
                                }}
                            />
                            {tileWidth === ""? <span><br/>* Choose a number</span>:null}
                        </div>
                        <br />
                        <div>
                            <h4>Tile Height in Pixels</h4>
                            <input
                                className="export_input" 
                                type="text"
                                value={tileHeight}
                                onChange={(event)=> {
                                    const filteredString = (event.target.value+'').replace(/[^\d]/g, '');
                                    props.updateExportFormAndFetchExportGridCells(props.raster.uuid, [{field:'tileHeight', value: filteredString}]);
                                }}
                            />
                            {tileHeight === ""? <span>* Choose a number</span>:null}
                        </div>
                        <br />
                        <div>
                            <h4>No data value (optional)</h4>
                            <input
                                className="export_input"
                                type="number"
                                value={noDataValue || ''}
                                onChange={(event)=> {
                                    props.updateExportFormAndFetchExportGridCells(props.raster.uuid, [{field:'noDataValue', value: event.target.value}]);
                                }}
                            />
                        </div>
                    </div>
                </div>
                
                <div className="export_text">
                    {
                        exportGridCells.length > 1500 ? (
                        <div className="export-input-error-msg"> 
                            <span
                                className="export-input-error-msg-large"
                            >
                                Resolution too small: 
                            </span>
                            <span>
                            <br/>
                            Zoom-in when using a fine resolution
                            </span>
                        </div>
                        ) :
                        parseInt(tileWidth + '') && 
                        parseInt(tileHeight + '') && 
                        (parseInt(tileHeight+'') * parseInt(tileWidth+'') > 1000000000) 
                        ? (
                        <div className="export-input-error-msg"> 
                            <span
                                className="export-input-error-msg-large"
                            >
                                Too many pixels: 
                            </span>
                            <span>
                            <br/>
                            Tile-Width × Tile-Height
                            <br/>
                            must be below 1.000.000.000 pixels 
                            </span>
                        </div>
                        ) : selectedGridCellIds.length === maximumSelectForExport ? (
                        <div className="export-input-error-msg"> 
                            <span
                                className="export-input-error-msg-large"
                            >
                                Maximum amount selected: 
                            </span>
                            <span>
                            <br/>
                            It is not allowed to export more then 3 items at once
                            </span>
                        </div>
                        ) : (
                        <span>
                        First choose your settings then select the
                        desired tiles to export/download
                        </span>
                        )
                    }
                    
                </div>
                <div className="export_buttons">
                    <button 
                        className={"button-action button-export"}
                        disabled={selectedGridCellIds.length === 0}
                        title={selectedGridCellIds.length === 0 ? "First make a selection on the map" : undefined}  
                        onClick={()=>{
                            props.requestRasterExports(inbox.length, openDownloadModal, props.raster.uuid);
                        }}
                    >
                        <i className="fa fa-download" />
                        &nbsp;&nbsp;
                        {`Download ${selectedGridCellIds.length}  selected cells`}
                    </button>
                    <button 
                        className={"button-action button-action-danger button-export"}
                        disabled={selectedGridCellIds.length === 0? true: false}
                        title={selectedGridCellIds.length === 0 ? "No grid cells selected" : undefined}  
                        onClick={()=>{
                            props.removeAllSelectedExportGridCellIds();
                        }}
                    >
                        Cancel selection
                    </button>
                </div>
            </div>
        </div>
    );
};

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    addToSelectedExportGridCellIds: (ids) => dispatch(addToSelectedExportGridCellIds(ids)),
    removeFromSelectedExportGridCellIds: (ids) => dispatch(removeFromSelectedExportGridCellIds(ids)),
    removeAllSelectedExportGridCellIds: ()=> dispatch(removeAllSelectedExportGridCellIds()),
    updateExportFormAndFetchExportGridCells: (rasterUuid: string, fieldValuePairs: FieldValuePair[])=> dispatch(updateExportFormAndFetchExportGridCells(rasterUuid, fieldValuePairs)),
    requestRasterExports: (numberOfInboxMessages:number, openDownloadModal: Function, rasterUuid: string)=> dispatch(requestRasterExports(numberOfInboxMessages, openDownloadModal, rasterUuid)),
    requestProjections: (rasterUuid:string) => dispatch(requestProjections(rasterUuid)),
});
type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>

export default connect(null, mapDispatchToProps)(ExportModal);