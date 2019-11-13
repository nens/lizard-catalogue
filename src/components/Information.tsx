import * as React from 'react';
import './styles/Information.css';

export default class Information extends React.Component {
    render() {
        return (
            <div className="information">
                <div className="information_main">
                    <h4>Information</h4>
                    <div className="information_main-content">
                        <p>Welcome to the Lizard Catalogue!</p>
                        <p>
                            This catalogue provides you a detailed overview of all the raster datasets in Lizard.
                            You can search for datasets, filter them per organisation, view detailed metadata and open datasets in the Lizard Portal and the Lizard API.
                        </p>
                    </div>
                </div>
                <div className="information_footer">
                    <a href="/static_media/documents/privacy.pdf" target="_blank">Privacy Statement</a>
                    <button onClick={() => window.location.href = '#'}>Close</button>
                </div>
                {/* eslint-disable-next-line */}
                <a href="#" className="information_close">&times;</a>
            </div>
        );
    };
};