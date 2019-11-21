import * as React from 'react';
import '../styles/Inbox.css';

interface MyProps {
    toggleDropdowns: (event) => void
};

export default class Inbox extends React.Component<MyProps> {
    render() {
        return (
            <div className="inbox" onMouseLeave={this.props.toggleDropdowns}>
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
                        NRR66666666666666666666666666666min.zip (500mb)
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