import * as React from 'react';
import { Message, RasterExportRequest } from '../../interface';
import { connect } from 'react-redux';
import { removeMessage, downloadFile, removeCurrentExportTasks } from '../../action';
import { MyStore } from '../../reducers';
import '../styles/Inbox.css';

interface MyProps {
    inbox: Message[],
    closeAllDropdowns: () => void,
};

interface PropsFromState {
    numberOfinboxMessagesBeforeRequest: number,
    rasterExportRequests: RasterExportRequest[],
};

interface PropsFromDispatch {
    removeMessage: (id: string) => void,
    downloadFile: (id: string) => void,
    removeCurrentExportTasks: () => void,
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

    componentWillUpdate(nextProps: InboxProps) {
        const {
            inbox,
            numberOfinboxMessagesBeforeRequest,
            rasterExportRequests,
        } = nextProps;
        // Remove all current export tasks and set number of inbox messages before request
        // back to 0 after all export tasks have been finished
        if (
            rasterExportRequests.length &&
            (rasterExportRequests.length - (inbox.length - numberOfinboxMessagesBeforeRequest)) === 0
        ) {
            this.props.removeCurrentExportTasks();
        };
    };

    render() {
        const {
            inbox,
            numberOfinboxMessagesBeforeRequest,
            rasterExportRequests,
        } = this.props;

        // Get the number of pending export tasks that are not ready yet
        const pendingExportTasks = rasterExportRequests.length && (
            rasterExportRequests.length - (inbox.length - numberOfinboxMessagesBeforeRequest)
        );

        return (
            <div
                className="inbox"
                onClick={(e) => e.stopPropagation()}
            >
                {inbox.map(message => (
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
                                // visibility: (message.downloaded || !message.url) ? 'visible' : 'hidden'
                            }}
                        >
                            &times;
                        </div>
                    </div>
                ))}
                {pendingExportTasks ? (
                    <div
                        className="inbox-file inbox-pending-exports"
                        title={`${pendingExportTasks} export(s) in progress`}
                    >
                        <div className="inbox-filename">
                            {pendingExportTasks} export(s) in progress
                        </div>
                        <i className="fa fa-download inbox-pending-downloads" />
                        <div className="inbox-read" />
                    </div>
                ): null}
                {(inbox.length === 0 && pendingExportTasks === 0) ? (
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
    numberOfinboxMessagesBeforeRequest: state.rasterExportState.numberOfinboxMessagesBeforeRequest,
    rasterExportRequests: state.rasterExportState.rasterExportRequests,
});

const mapDispatchToProps = (dispatch): PropsFromDispatch => ({
    removeMessage: (id: string) => removeMessage(dispatch, id),
    downloadFile: (id: string) => downloadFile(dispatch, id),
    removeCurrentExportTasks: () => removeCurrentExportTasks(dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Inbox);