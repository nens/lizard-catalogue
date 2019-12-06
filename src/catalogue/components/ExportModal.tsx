import * as React from 'react';
import { connect } from 'react-redux';

import { Map, TileLayer, WMSTileLayer, 
    //Rectangle
    GeoJSON,
     Polygon } from 'react-leaflet';
import {MyStore, getExportAvailableGridCells, getExportSelectedGridCellIds, getExportGridCellResolution, getExportGridCellProjection, getExportGridCellTileWidth, getExportGridCellTileHeight} from '../../reducers';
import {addToSelectedExportGridCellIds, removeFromSelectedExportGridCellIds, removeAllSelectedExportGridCellIds, updateExportFormAndFetchExportGridCells, 
    // setRasterExportBoundingBox 
    requestRasterExports,
} from '../../action';
import {areGridCelIdsEqual, AddToSelectedExportGridCellIds, ExportGridCelId, RemoveFromSelectedExportGridCellIds,RemoveAllSelectedExportGridCellIds} from '../../interface';

import { Raster } from '../../interface';
import '../styles/Export.css';

interface MyProps {
    raster: Raster,
    bounds: number[][],
    openDownloadModal: () => void,
    availableGridCells: MyStore['rasterExportState']['availableGridCells'],
    selectedGridCellIds: MyStore['rasterExportState']['selectedGridCellIds'],
    addToSelectedExportGridCellIds: (gridCellIds: ExportGridCelId[]) => AddToSelectedExportGridCellIds,
    removeFromSelectedExportGridCellIds: (gridCellIds: ExportGridCelId[]) => RemoveFromSelectedExportGridCellIds,
    removeAllSelectedExportGridCellIds: () => RemoveAllSelectedExportGridCellIds,
    // fetchExportGridCells: (rasterUuid: string, projection: string, resolution: number, width: number, height: number, bbox: number[][]) => void,
    updateExportFormAndFetchExportGridCells: (fieldValuePairs: any[]) => void,
    resolution: MyStore['rasterExportState']['resolution'],
    projection: MyStore['rasterExportState']['projection'],
    tileWidth: MyStore['rasterExportState']['tileWidth'],
    tileHeight: MyStore['rasterExportState']['tileHeight'],
    // setRasterExportBoundingBox: any,
    requestRasterExports: ()=> void,
};

class ExportModal extends React.Component<MyProps> {

    componentWillMount() {
        this.props.updateExportFormAndFetchExportGridCells([
            {field: "projection", value: this.props.raster.projection},
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

        console.log('bounds render', bounds);
        console.log('exportGridCells', exportGridCells)

        console.log('1234',{"type": "FeatureCollection", "features": exportGridCells});

        return (
            <div className="export_main">
                <div className="export_map-selection">
                    <h3>Export Selection</h3>
                    <div className="export_map-box">
                        <Map 
                            bounds={bounds} 
                            zoomControl={false} 
                            style={{ width: "100%" }}
                            onMoveend={event=>{
                                console.log('event', event.target.getBounds())
                                const bounds = event.target.getBounds();
                                // this.props.setRasterExportBoundingBox({
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
                            // onClick={(event:any)=>{console.log(event)}}
                        >
                            <TileLayer url="https://{s}.tiles.mapbox.com/v3/nelenschuurmans.iaa98k8k/{z}/{x}/{y}.png" />
                            <WMSTileLayer url={raster.wms_info.endpoint} layers={raster.wms_info.layer} styles={raster.options.styles} />
                            {exportGridCells.length !== 0 ?
                                <GeoJSON 
                                    className={"export_grid_cell"}
                                    data={{"type": "FeatureCollection", "features": exportGridCells}}
                                    // data={{"type": "FeatureCollection", "features": [{"id": "0", "type": "Feature", "properties": {"bbox": [-200000.0, 200000.0, -100000.0, 300000.0], "id": [-2, 2]}, "geometry": {"type": "Polygon", "coordinates": [[[1.8501631773301483, 49.736243006370565], [1.7822310702379, 50.63366714033131], [0.372909109841634, 50.580885971644655], [0.46720641603762614, 49.684777837135755], [1.8501631773301483, 49.736243006370565]]]}}, {"id": "1", "type": "Feature", "properties": {"bbox": [-100000.0, 200000.0, 0.0, 300000.0], "id": [-1, 2]}, "geometry": {"type": "Polygon", "coordinates": [[[3.2360236872980184, 49.77088572023665], [3.1946514272479276, 50.6691975494639], [1.7822310702379, 50.63366714033131], [1.8501631773301483, 49.736243006370565], [3.2360236872980184, 49.77088572023665]]]}}, {"id": "2", "type": "Feature", "properties": {"bbox": [0.0, 200000.0, 100000.0, 300000.0], "id": [0, 2]}, "geometry": {"type": "Polygon", "coordinates": [[[4.623655874101782, 49.78864483219235], [4.6089625409324455, 50.68741231509743], [3.1946514272479276, 50.6691975494639], [3.2360236872980184, 49.77088572023665], [4.623655874101782, 49.78864483219235]]]}}, {"id": "3", "type": "Feature", "properties": {"bbox": [100000.0, 200000.0, 200000.0, 300000.0], "id": [1, 2]}, "geometry": {"type": "Polygon", "coordinates": [[[6.011917876575837, 49.78948891591059], [6.02394586014303, 50.68827808498438], [4.6089625409324455, 50.68741231509743], [4.623655874101782, 49.78864483219235], [6.011917876575837, 49.78948891591059]]]}}, {"id": "4", "type": "Feature", "properties": {"bbox": [200000.0, 200000.0, 300000.0, 300000.0], "id": [2, 2]}, "geometry": {"type": "Polygon", "coordinates": [[[7.399664343383534, 49.77341647527777], [7.438378942738331, 50.67179327124784], [6.02394586014303, 50.68827808498438], [6.011917876575837, 49.78948891591059], [7.399664343383534, 49.77341647527777]]]}}, {"id": "5", "type": "Feature", "properties": {"bbox": [300000.0, 200000.0, 400000.0, 300000.0], "id": [3, 2]}, "geometry": {"type": "Polygon", "coordinates": [[[8.7857527804975, 49.74045595440707], [8.851042532061102, 50.63798806147714], [7.438378942738331, 50.67179327124784], [7.399664343383534, 49.77341647527777], [8.7857527804975, 49.74045595440707]]]}}, {"id": "6", "type": "Feature", "properties": {"bbox": [-200000.0, 300000.0, -100000.0, 400000.0], "id": [-2, 3]}, "geometry": {"type": "Polygon", "coordinates": [[[1.7822310702379, 50.63366714033131], [1.711197597393428, 51.5310767746455], [0.27431946836265075, 51.476928332687876], [0.372909109841634, 50.580885971644655], [1.7822310702379, 50.63366714033131]]]}}, {"id": "7", "type": "Feature", "properties": {"bbox": [-100000.0, 300000.0, 0.0, 400000.0], "id": [-1, 3]}, "geometry": {"type": "Polygon", "coordinates": [[[3.1946514272479276, 50.6691975494639], [3.151386587793483, 51.567529617317525], [1.711197597393428, 51.5310767746455], [1.7822310702379, 50.63366714033131], [3.1946514272479276, 50.6691975494639]]]}}, {"id": "8", "type": "Feature", "properties": {"bbox": [0.0, 300000.0, 100000.0, 400000.0], "id": [0, 3]}, "geometry": {"type": "Polygon", "coordinates": [[[4.6089625409324455, 50.68741231509743], [4.593596352212663, 51.58621791523736], [3.151386587793483, 51.567529617317525], [3.1946514272479276, 50.6691975494639], [4.6089625409324455, 50.68741231509743]]]}}, {"id": "9", "type": "Feature", "properties": {"bbox": [100000.0, 300000.0, 200000.0, 400000.0], "id": [1, 3]}, "geometry": {"type": "Polygon", "coordinates": [[[6.02394586014303, 50.68827808498438], [6.036524612425704, 51.58710622263444], [4.593596352212663, 51.58621791523736], [4.6089625409324455, 50.68741231509743], [6.02394586014303, 50.68827808498438]]]}}, {"id": "10", "type": "Feature", "properties": {"bbox": [200000.0, 300000.0, 300000.0, 400000.0], "id": [2, 3]}, "geometry": {"type": "Polygon", "coordinates": [[[7.438378942738331, 50.67179327124784], [7.478864741877623, 51.57019285187375], [6.036524612425704, 51.58710622263444], [6.02394586014303, 50.68827808498438], [7.438378942738331, 50.67179327124784]]]}}, {"id": "11", "type": "Feature", "properties": {"bbox": [300000.0, 300000.0, 400000.0, 400000.0], "id": [3, 3]}, "geometry": {"type": "Polygon", "coordinates": [[[8.851042532061102, 50.63798806147714], [8.91931367394979, 51.53550988578174], [7.478864741877623, 51.57019285187375], [7.438378942738331, 50.67179327124784], [8.851042532061102, 50.63798806147714]]]}}, {"id": "12", "type": "Feature", "properties": {"bbox": [-200000.0, 400000.0, -100000.0, 500000.0], "id": [-2, 4]}, "geometry": {"type": "Polygon", "coordinates": [[[1.711197597393428, 51.5310767746455], [1.6368499469182358, 52.42835876893176], [0.17114418195077252, 52.372788325609335], [0.27431946836265075, 51.476928332687876], [1.711197597393428, 51.5310767746455]]]}}, {"id": "13", "type": "Feature", "properties": {"bbox": [-100000.0, 400000.0, 0.0, 500000.0], "id": [-1, 4]}, "geometry": {"type": "Polygon", "coordinates": [[[3.151386587793483, 51.567529617317525], [3.1060989375780497, 52.46577113679766], [1.6368499469182358, 52.42835876893176], [1.711197597393428, 51.5310767746455], [3.151386587793483, 51.567529617317525]]]}}, {"id": "14", "type": "Feature", "properties": {"bbox": [0.0, 400000.0, 100000.0, 500000.0], "id": [0, 4]}, "geometry": {"type": "Polygon", "coordinates": [[[4.593596352212663, 51.58621791523736], [4.577510941188332, 52.484952060923774], [3.1060989375780497, 52.46577113679766], [3.151386587793483, 51.567529617317525], [4.593596352212663, 51.58621791523736]]]}}, {"id": "15", "type": "Feature", "properties": {"bbox": [100000.0, 400000.0, 200000.0, 500000.0], "id": [1, 4]}, "geometry": {"type": "Polygon", "coordinates": [[[6.036524612425704, 51.58710622263444], [6.049692090195035, 52.485863815109646], [4.577510941188332, 52.484952060923774], [4.593596352212663, 51.58621791523736], [6.036524612425704, 51.58710622263444]]]}}, {"id": "16", "type": "Feature", "properties": {"bbox": [200000.0, 400000.0, 300000.0, 500000.0], "id": [2, 4]}, "geometry": {"type": "Polygon", "coordinates": [[[7.478864741877623, 51.57019285187375], [7.52124364534677, 52.46850460304518], [6.049692090195035, 52.485863815109646], [6.036524612425704, 51.58710622263444], [7.478864741877623, 51.57019285187375]]]}}, {"id": "17", "type": "Feature", "properties": {"bbox": [300000.0, 400000.0, 400000.0, 500000.0], "id": [3, 4]}, "geometry": {"type": "Polygon", "coordinates": [[[8.91931367394979, 51.53550988578174], [8.990770855851407, 52.43290857203957], [7.52124364534677, 52.46850460304518], [7.478864741877623, 51.57019285187375], [8.91931367394979, 51.53550988578174]]]}}, {"id": "18", "type": "Feature", "properties": {"bbox": [-200000.0, 500000.0, -100000.0, 600000.0], "id": [-2, 5]}, "geometry": {"type": "Polygon", "coordinates": [[[1.6368499469182358, 52.42835876893176], [1.5589553575777897, 53.325399822427414], [0.06306259341768702, 53.26834886819162], [0.17114418195077252, 52.372788325609335], [1.6368499469182358, 52.42835876893176]]]}}, {"id": "19", "type": "Feature", "properties": {"bbox": [-100000.0, 500000.0, 0.0, 600000.0], "id": [-1, 5]}, "geometry": {"type": "Polygon", "coordinates": [[[3.1060989375780497, 52.46577113679766], [3.0586459928019014, 53.36381138493425], [1.5589553575777897, 53.325399822427414], [1.6368499469182358, 52.42835876893176], [3.1060989375780497, 52.46577113679766]]]}}, {"id": "20", "type": "Feature", "properties": {"bbox": [0.0, 500000.0, 100000.0, 600000.0], "id": [0, 5]}, "geometry": {"type": "Polygon", "coordinates": [[[4.577510941188332, 52.484952060923774], [4.560655570713313, 53.38350536085984], [3.0586459928019014, 53.36381138493425], [3.1060989375780497, 52.46577113679766], [4.577510941188332, 52.484952060923774]]]}}, {"id": "21", "type": "Feature", "properties": {"bbox": [100000.0, 500000.0, 200000.0, 600000.0], "id": [1, 5]}, "geometry": {"type": "Polygon", "coordinates": [[[6.049692090195035, 52.485863815109646], [6.063489828224687, 53.384441534606], [4.560655570713313, 53.38350536085984], [4.577510941188332, 52.484952060923774], [6.049692090195035, 52.485863815109646]]]}}, {"id": "22", "type": "Feature", "properties": {"bbox": [200000.0, 500000.0, 300000.0, 600000.0], "id": [2, 5]}, "geometry": {"type": "Polygon", "coordinates": [[[7.52124364534677, 52.46850460304518], [7.565649029761415, 53.36661799121682], [6.063489828224687, 53.384441534606], [6.049692090195035, 52.485863815109646], [7.52124364534677, 52.46850460304518]]]}}, {"id": "23", "type": "Feature", "properties": {"bbox": [300000.0, 500000.0, 400000.0, 600000.0], "id": [3, 5]}, "geometry": {"type": "Polygon", "coordinates": [[[8.990770855851407, 52.43290857203957], [9.06563792013123, 53.33007113171128], [7.565649029761415, 53.36661799121682], [7.52124364534677, 52.46850460304518], [8.990770855851407, 52.43290857203957]]]}}, {"id": "24", "type": "Feature", "properties": {"bbox": [-200000.0, 600000.0, -100000.0, 700000.0], "id": [-2, 6]}, "geometry": {"type": "Polygon", "coordinates": [[[1.5589553575777897, 53.325399822427414], [1.4772587287782413, 54.222086510175316], [-0.050276556303332984, 54.16349238796077], [0.06306259341768702, 53.26834886819162], [1.5589553575777897, 53.325399822427414]]]}}, {"id": "25", "type": "Feature", "properties": {"bbox": [-100000.0, 600000.0, 0.0, 700000.0], "id": [-1, 6]}, "geometry": {"type": "Polygon", "coordinates": [[[3.0586459928019014, 53.36381138493425], [3.0088715426890134, 54.26153976587525], [1.4772587287782413, 54.222086510175316], [1.5589553575777897, 53.325399822427414], [3.0586459928019014, 53.36381138493425]]]}}, {"id": "26", "type": "Feature", "properties": {"bbox": [0.0, 600000.0, 100000.0, 700000.0], "id": [0, 6]}, "geometry": {"type": "Polygon", "coordinates": [[[4.560655570713313, 53.38350536085984], [4.542974606072823, 54.281768681249396], [3.0088715426890134, 54.26153976587525], [3.0586459928019014, 53.36381138493425], [4.560655570713313, 53.38350536085984]]]}}, {"id": "27", "type": "Feature", "properties": {"bbox": [100000.0, 600000.0, 200000.0, 700000.0], "id": [1, 6]}, "geometry": {"type": "Polygon", "coordinates": [[[6.063489828224687, 53.384441534606], [6.077963370933247, 54.2827303170466], [4.542974606072823, 54.281768681249396], [4.560655570713313, 53.38350536085984], [6.063489828224687, 53.384441534606]]]}}, {"id": "28", "type": "Feature", "properties": {"bbox": [200000.0, 600000.0, 300000.0, 700000.0], "id": [2, 6]}, "geometry": {"type": "Polygon", "coordinates": [[[7.565649029761415, 53.36661799121682], [7.61222712488127, 54.264422628485434], [6.077963370933247, 54.2827303170466], [6.063489828224687, 53.384441534606], [7.565649029761415, 53.36661799121682]]]}}, {"id": "29", "type": "Feature", "properties": {"bbox": [300000.0, 600000.0, 400000.0, 700000.0], "id": [3, 6]}, "geometry": {"type": "Polygon", "coordinates": [[[9.06563792013123, 53.33007113171128], [9.144160202448333, 54.226884482427685], [7.61222712488127, 54.264422628485434], [7.565649029761415, 53.36661799121682], [9.06563792013123, 53.33007113171128]]]}}, {"id": "30", "type": "Feature", "properties": {"bbox": [-200000.0, 700000.0, -100000.0, 800000.0], "id": [-2, 7]}, "geometry": {"type": "Polygon", "coordinates": [[[1.4772587287782413, 54.222086510175316], [1.3914798789931362, 55.1183053122111], [-0.16925885730442528, 55.058100806844536], [-0.050276556303332984, 54.16349238796077], [1.4772587287782413, 54.222086510175316]]]}}, {"id": "31", "type": "Feature", "properties": {"bbox": [-100000.0, 700000.0, 0.0, 800000.0], "id": [-1, 7]}, "geometry": {"type": "Polygon", "coordinates": [[[3.0088715426890134, 54.26153976587525], [2.9566039568575095, 55.15884587092278], [1.3914798789931362, 55.1183053122111], [1.4772587287782413, 54.222086510175316], [3.0088715426890134, 54.26153976587525]]]}}, {"id": "32", "type": "Feature", "properties": {"bbox": [0.0, 700000.0, 100000.0, 800000.0], "id": [0, 7]}, "geometry": {"type": "Polygon", "coordinates": [[[4.542974606072823, 54.281768681249396], [4.5244069096142265, 55.17963322192657], [2.9566039568575095, 55.15884587092278], [3.0088715426890134, 54.26153976587525], [4.542974606072823, 54.281768681249396]]]}}, {"id": "33", "type": "Feature", "properties": {"bbox": [100000.0, 700000.0, 200000.0, 800000.0], "id": [1, 7]}, "geometry": {"type": "Polygon", "coordinates": [[[6.077963370933247, 54.2827303170466], [6.093162768057815, 55.1806214389809], [4.5244069096142265, 55.17963322192657], [4.542974606072823, 54.281768681249396], [6.077963370933247, 54.2827303170466]]]}}, {"id": "34", "type": "Feature", "properties": {"bbox": [200000.0, 700000.0, 300000.0, 800000.0], "id": [2, 7]}, "geometry": {"type": "Polygon", "coordinates": [[[7.61222712488127, 54.264422628485434], [7.661138599038438, 55.16180833490906], [6.093162768057815, 55.1806214389809], [6.077963370933247, 54.2827303170466], [7.61222712488127, 54.264422628485434]]]}}, {"id": "35", "type": "Feature", "properties": {"bbox": [300000.0, 700000.0, 400000.0, 800000.0], "id": [3, 7]}, "geometry": {"type": "Polygon", "coordinates": [[[9.144160202448333, 54.226884482427685], [9.226607171019513, 55.12323548089245], [7.661138599038438, 55.16180833490906], [7.61222712488127, 54.264422628485434], [9.144160202448333, 54.226884482427685]]]}}]}}
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
                                    // onclick={(event)=>{console.log(event)}}
                                    onEachFeature={(feature, layer) => {
                                        console.log(feature);
                                        layer.on({
                                        //   mouseover: this.highlightFeature.bind(this),
                                        //   mouseout: this.resetHighlight.bind(this),
                                          click: (event)=>{
                                                console.log(selectedGridIds, event)
                                                const gridcell = event.target.feature;
                                                const isSelected = selectedGridIds.find(item=>{
                                                    console.log('item item', item, gridcell.properties.id);
                                                    return areGridCelIdsEqual(gridcell.properties.id, item);
                                                })
                                                if (isSelected) {
                                                    this.props.removeFromSelectedExportGridCellIds([gridcell.properties.id])
                                                } else {
                                                    this.props.addToSelectedExportGridCellIds([gridcell.properties.id]);
                                                }

                                            },
                                            // mouseover: (event)=>{
                                            //     console.log(event);
                                            //     // feature.setStyle({
                                            //     //     "color": "#A10000",
                                            //     //     "fillColor": "#E2D300",
                                            //     //     "fillOpacity": "0.15",
        
                                            //     // })
                                            // },
                                            // class: "export_grid_cell",
                                        });
                                      }}
                                />
                            :
                            null
                            }
                            {
                                 null && 
                                exportGridCells.map((gridcell) =>{
                                    return null;
                                    const isSelected = selectedGridIds.find(item=>{
                                        return areGridCelIdsEqual(gridcell.properties.id, item);
                                    })
                                    console.log('redraw rectangles', 
                                    // isSelected, gridcell.properties.id[0], gridcell.geometry.coordinates
                                    gridcell
                                    );
                                    const flippedCoordinates = gridcell.geometry.coordinates[0].map(coord=>{
                                        return [coord[1], coord[0]];
                                    })
                                    return (
                                        <Polygon
                                            // bounds={gridcell.geometry.coordinates}
                                            // positions={gridcell.geometry.coordinates}
                                            positions={flippedCoordinates}
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
                            {/* {raster.temporal && (
                                <div>
                                    <h4>Date / Time</h4>
                                    <input type="datetime-local" />
                                </div>
                            )}
                            <br /> */}
                            <div>
                                <h4>Projection</h4>
                                <input 
                                    type="text" 
                                    value={this.props.projection}
                                    onChange={(event)=> {
                                        this.props.updateExportFormAndFetchExportGridCells([{field:'projection', value: event.target.value+''}]);
                                        
                                    }} 
                                />
                            </div>
                            <br />
                            <div>
                                <h4>Resolution (based on projection)</h4>
                                <input 
                                    type="text"
                                    value={this.props.resolution}
                                    onChange={(event)=> {
                                        if (parseInt(event.target.value)) {
                                            // this.props.setRasterExportResolution(parseInt(event.target.value));
                                            this.props.updateExportFormAndFetchExportGridCells([{field:'resolution', value: event.target.value}]);
                                        } else if (event.target.value==="") {
                                            // this.props.setRasterExportResolution("");
                                            this.props.updateExportFormAndFetchExportGridCells([{field:'resolution', value: ""}]);
                                        }
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
                                        if (parseInt(event.target.value)) {
                                            // this.props.setRasterExportResolution(parseInt(event.target.value));
                                            this.props.updateExportFormAndFetchExportGridCells([{field:'tileWidth', value: event.target.value}]);
                                        } else if (event.target.value==="") {
                                            // this.props.setRasterExportResolution("");
                                            this.props.updateExportFormAndFetchExportGridCells([{field:'tileWidth', value: ""}]);
                                        }
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
                                        if (parseInt(event.target.value)) {
                                            // this.props.setRasterExportResolution(parseInt(event.target.value));
                                            this.props.updateExportFormAndFetchExportGridCells([{field:'tileHeight', value: event.target.value}]);
                                        } else if (event.target.value==="") {
                                            // this.props.setRasterExportResolution("");
                                            this.props.updateExportFormAndFetchExportGridCells([{field:'tileHeight', value: ""}]);
                                        }
                                    }}
                                />
                                {this.props.tileHeight === ""? <span>* Choose a number</span>:null}
                            </div>
                            <br />
                            {/* <div>
                                <h4>Pixels</h4>
                                <input type="text" />
                            </div> */}
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
                        {/* <button 
                            className="details__button" 
                            onClick={()=>{
                                true || openDownloadModal();
                                if (this.props.resolution !== "") {
                                    this.props.fetchExportGridCells([{field:'resolution', value:"2"}]);
                                } 
                            }}
                        >
                            <i className="fa fa-download" />
                            &nbsp;&nbsp;Make a selection
                        </button> */}
                        <button 
                            className="details__button" 
                            onClick={()=>{
                                this.props.requestRasterExports();
                                openDownloadModal();
                            }}
                        >
                            <i className="fa fa-download" />
                            &nbsp;&nbsp;Download selection
                        </button>
                        {/* <button
                            onClick={this.props.removeAllSelectedExportGridCellIds}
                        >
                            Remove Selection
                        </button> */}
                    </div>
                </div>
            </div>
        );
    };
};

interface PropsFromState {
    availableGridCells: MyStore['rasterExportState']['availableGridCells'],
    selectedGridCellIds: MyStore['rasterExportState']['selectedGridCellIds'],
    resolution: MyStore['rasterExportState']['resolution'],
    projection: MyStore['rasterExportState']['projection'],
    tileWidth: MyStore['rasterExportState']['tileWidth'],
    tileHeight: MyStore['rasterExportState']['tileHeight'],

};

const mapStateToProps = (state: MyStore): PropsFromState => ({
    availableGridCells: getExportAvailableGridCells(state),
    selectedGridCellIds: getExportSelectedGridCellIds(state),
    resolution: getExportGridCellResolution(state),
    projection: getExportGridCellProjection(state),
    tileWidth: getExportGridCellTileWidth(state),
    tileHeight: getExportGridCellTileHeight(state),
});

interface PropsFromDispatch {
    addToSelectedExportGridCellIds: (ids: ExportGridCelId[]) => void,
    removeFromSelectedExportGridCellIds: (ids: ExportGridCelId[]) => void,
    removeAllSelectedExportGridCellIds: () => void,
    // fetchExportGridCells: (rasterUuid: string, projection: string, resolution: number, width: number, height: number, bbox: number[][]) => void,
    updateExportFormAndFetchExportGridCells: (fieldValuePairs: any[]) => void,
    // setRasterExportBoundingBox: (bounds: any) => void
    requestRasterExports: ()=> void,
};

const mapDispatchToProps = (dispatch: any): PropsFromDispatch => ({
    addToSelectedExportGridCellIds: (ids) => dispatch(addToSelectedExportGridCellIds(ids)),
    removeFromSelectedExportGridCellIds: (ids) => dispatch(removeFromSelectedExportGridCellIds(ids)),
    removeAllSelectedExportGridCellIds: ()=> dispatch(removeAllSelectedExportGridCellIds()),
    updateExportFormAndFetchExportGridCells: (fieldValuePairs: any[])=> updateExportFormAndFetchExportGridCells(fieldValuePairs, dispatch),
    // setRasterExportBoundingBox: (bounds: any) => dispatch(setRasterExportBoundingBox(bounds)),
    requestRasterExports: ()=> requestRasterExports(dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ExportModal);