import * as React from 'react';
import { Message } from '../../interface';
import { connect } from 'react-redux';
import { removeMessage, downloadFile } from '../../action';
import { MyStore } from '../../reducers';
import MDSpinner from 'react-md-spinner';
import '../styles/Inbox.css';

interface MyProps {
    inbox: Message[],
    closeAllDropdowns: () => void,
};

interface PropsFromState {
    pendingExportTasks: number,
};

interface PropsFromDispatch {
    removeMessage: (id: string) => void,
    downloadFile: (id: string) => void,
};

type InboxProps = MyProps & PropsFromState & PropsFromDispatch;

class Inbox extends React.Component<InboxProps> {
    removeMessage = (message: Message) => {
        fetch(`/api/v3/inbox/${message.id}/read/`, {
            credentials: "same-origin",
            method: 'POST'
        });
        this.props.removeMessage(message.id);
    };

    render() {
        return (
            <div
                className="inbox"
                onMouseLeave={this.props.closeAllDropdowns}
                onClick={(e) => e.stopPropagation()}
            >
                {this.props.inbox.map(message => (
                    <div className="inbox-file" key={message.id}>
                        <div
                            className="inbox-filename"
                            title={message.message}
                        >
                            {message.message}
                        </div>
                        {message.url ? (
                            <a
                                title="download file"
                                href={message.url}
                                onClick={() => this.props.downloadFile(message.id)}
                            >
                                <i className="fa fa-download inbox-download" />
                            </a>
                        ) : null}
                        {/* User can only remove the message if either the file
                        has been downloaded or the export task failed */}
                        <div
                            className="inbox-read"
                            title="remove file"
                            onClick={() => this.removeMessage(message)}
                            style={{
                                visibility: (message.downloaded || !message.url) ? 'visible' : 'hidden'
                            }}
                        >
                            &times;
                        </div>
                    </div>
                ))}
                {this.props.pendingExportTasks ? (
                    <div
                        className="inbox-file inbox-pending-exports"
                        title={`${this.props.pendingExportTasks} export(s) in progress`}
                    >
                        <div className="inbox-filename">
                            {this.props.pendingExportTasks} export(s) in progress
                        </div>
                        <MDSpinner style={{backgroundColor: 'inherit'}} />
                    </div>
                ): null}
                {(this.props.inbox.length === 0 && this.props.pendingExportTasks === 0) ? (
                    <i className="inbox-info">
                        No export tasks at the moment.
                    </i>
                ) : (
                    <i className="inbox-info">
                        When your files are ready, 
                        click on the download icon.
                    </i>
                )}
            </div>
        );
    };
};

const mapStateToProps = (state: MyStore): PropsFromState => ({
    pendingExportTasks: state.pendingExportTasks,
});

const mapDispatchToProps = (dispatch): PropsFromDispatch => ({
    removeMessage: (id: string) => removeMessage(dispatch, id),
    downloadFile: (id: string) => downloadFile(dispatch, id),
});

export default connect(mapStateToProps, mapDispatchToProps)(Inbox);