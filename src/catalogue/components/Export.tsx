import * as React from 'react';
import { Raster } from '../../interface';
import DownloadModal from './DownloadModal';
import ExportModal from './ExportModal';
import '../styles/Export.css';

interface MyProps {
    raster: Raster,
    bounds: number[][],
    toggleExportModal: () => void
};

export default class Export extends React.Component<MyProps> {
    state = {
        showDownloadModal: false
    };

    openDownloadModal = () => {
        this.setState({
            showDownloadModal: true
        });
    };

    render() {
        return (
            <div className="export">
                {this.state.showDownloadModal ? (
                    <DownloadModal />
                ) : (
                    <ExportModal
                        raster={this.props.raster}
                        bounds={this.props.bounds}
                        openDownloadModal={this.openDownloadModal}
                    />
                )}
                {/* eslint-disable-next-line */}
                <a className="export_close" onClick={this.props.toggleExportModal}>&times;</a>
            </div>
        );
    };
};