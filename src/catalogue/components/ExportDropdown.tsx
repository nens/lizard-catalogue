import * as React from 'react';
import '../styles/ExportDropdown.css';

interface MyProps {
    toggleDropdowns: (event) => void
};

export default class ExportDropdown extends React.Component<MyProps> {
    render() {
        return (
            <div className="export_dropdown" onMouseLeave={this.props.toggleDropdowns}>
                <div className="export_dropdown-file">
                    <div
                        className="export_dropdown-filename"
                        title={"NRR5min.zip (300mb)"}
                    >
                        NRR5min.zip (300mb)
                    </div>
                    <i className="fa fa-download" title="download" />
                    &times;
                </div>
                <div className="export_dropdown-file">
                    <div
                        className="export_dropdown-filename"
                        title={"NRR6min.zip (500mb)"}
                    >
                        NRR6min.zip (500mb)
                    </div>
                    <i className="fa fa-download" title="download" />
                    &times;
                </div>
                <i className="export_dropdown-info">
                    When your files are ready, 
                    click on the download icon.
                </i>
            </div>
        );
    };
};