import * as React from 'react';
import { connect } from 'react-redux';
import { MyStore, getRaster } from '../reducers';
import { Raster } from '../interface';
import './styles/Export.css';

interface PropsFromState {
    raster: Raster | null
};

class Export extends React.Component<PropsFromState> {
    render() {
        const { raster } = this.props;
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
                        </div>
                        <div className="export_settings">
                            <h4>Export Settings</h4>
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
                <a href="#" className="export_close">&times;</a>
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

export default connect(mapStateToProps)(Export);