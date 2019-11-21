import * as React from 'react';
import '../styles/Inbox.css';

interface MyProps {
    closeAllDropdowns: () => void,
};

export default class Inbox extends React.Component<MyProps> {
    render() {
        return (
            <div className="inbox" onMouseLeave={this.props.closeAllDropdowns}>
                <div className="inbox-file">
                    <div
                        className="inbox-filename"
                        title={"NRR5min.zip (300mb)"}
                    >
                        NRR5min.zip (300mb)
                    </div>
                    <i className="fa fa-download" title="download" />
                    &times;
                </div>
                <div className="inbox-file">
                    <div
                        className="inbox-filename"
                        title={"NRR6min.zip (500mb)"}
                    >
                        NRR6min.zip (500mb)
                    </div>
                    <i className="fa fa-download" title="download" />
                    &times;
                </div>
                <i className="inbox-info">
                    When your files are ready, 
                    click on the download icon.
                </i>
            </div>
        );
    };
};