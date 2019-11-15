import * as React from 'react';
import { Raster } from '../../interface';
import '../styles/Export.css';

interface MyProps {
    raster: Raster,
    toggleExportModal: () => void
};

export default class Export extends React.Component<MyProps> {
    render() {
        const { raster, toggleExportModal } = this.props;
        console.log(raster);

        return (
            <div className="export">
                <div className="export_main">
                    <div className="export_map-selection">
                        <h4>Export Selection</h4>
                    </div>
                    <div className="export_content">
                        <div className="export_raster">
                            <h4>Selected Raster</h4>
                            <hr/>
                        </div>
                        <div className="export_settings">
                            <h4>Export Settings</h4>
                            <hr/>
                        </div>
                        <div className="export_text">
                            First choose your settings then select the
                            desired tiles to export/download
                        </div>
                        <div className="export_buttons">
                            <button>Cancell</button>
                            <button>Make a selection</button>
                        </div>
                    </div>
                </div>
                {/* eslint-disable-next-line */}
                <a className="export_close" onClick={toggleExportModal}>&times;</a>
            </div>
        );
    };
};