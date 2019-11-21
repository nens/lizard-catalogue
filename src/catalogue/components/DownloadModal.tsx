import * as React from 'react';
import '../styles/Download.css';

export default class DownloadModal extends React.Component {
    render() {
        return (
            <div className="download">
                <h3>Getting your request ready ...</h3>
                <div className="download-progress"/>
                <div className="download-text">
                    This can take a while. You can wait here, 
                    or we will let you know when the file is ready
                </div>
            </div>
        );
    };
};