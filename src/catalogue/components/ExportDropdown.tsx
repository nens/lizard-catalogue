import * as React from 'react';
import { connect } from 'react-redux';
import { removeMessage, downloadMessage } from '../../action';
import { Message } from '../../interface';
import '../styles/ExportDropdown.css';

interface MyProps {
    toggleDropdowns: (event) => void,
    messages: Message[],
};

interface PropsFromDispatch {
    removeMessage: (id: string) => void,
    downloadMessage: (id: string) => void,
};

class ExportDropdown extends React.Component<MyProps & PropsFromDispatch> {
    removeMessage = (message: Message) => {
        if (message.downloaded) {
            fetch(`/api/v3/inbox/${message.id}/read/`, {
                credentials: "same-origin",
                method: 'POST'
            });
            this.props.removeMessage(message.id);
        };
    };

    downloadFile = (message: Message) => {
        if (message.url) {
            this.props.downloadMessage(message.id);
            return window.open(message.url);
        };
    };

    render() {
        return (
            <div className="export_dropdown" onMouseLeave={this.props.toggleDropdowns}>
                {this.props.messages.map(message => (
                    <div className="export_dropdown-file" key={message.id}>
                        <div className="export_dropdown-filename" title={message.message}>
                            {message.message}
                        </div>
                        <i 
                            className={`fa ${message.url ? 'fa-download' : 'fa-spinner'}`}
                            title={message.url ? 'download' : 'loading'}
                            onClick={() => this.downloadFile(message)}
                        />
                        <div
                            className="export_dropdown-close"
                            title="remove file"
                            style={{
                                display: message.downloaded ? 'block' : 'none'
                            }}
                            onClick={() => this.removeMessage(message)}
                        >
                            &times;
                        </div>
                    </div>
                ))}
                <i className="export_dropdown-info">
                    When your files are ready, 
                    click on the download icon.
                </i>
            </div>
        );
    };
};

const mapDispatchToProps = (dispatch): PropsFromDispatch => ({
    removeMessage: (id: string) => removeMessage(dispatch, id),
    downloadMessage: (id: string) => downloadMessage(dispatch, id),
});

export default connect(null, mapDispatchToProps)(ExportDropdown);