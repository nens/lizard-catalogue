import {ExportGridCellId, ExportGridCell} from '../interface';

export const areGridCelIdsEqual = (id1:ExportGridCellId, id2:ExportGridCellId): boolean => (id1[0]+'') === (id2[0]+'') && (id1[1] + '') === (id2[1]+'')
export const haveGridCellsSameId = (cell1:ExportGridCell, cell2:ExportGridCell): boolean => { 
    const id1 = cell1.properties.id;
    const id2 = cell2.properties.id;
    return areGridCelIdsEqual(id1, id2);
}