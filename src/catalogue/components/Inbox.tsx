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
    timeseriesExportTasks: string[],
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

    getNumberOfPendingExportTasks = () => {
        const {
            inbox,
            numberOfinboxMessagesBeforeRequest,
            rasterExportRequests,
            timeseriesExportTasks
        } = this.props;
        const totalExportRequests = rasterExportRequests.length + timeseriesExportTasks.length;
        // Return the number of pending export tasks that are not ready yet
        return totalExportRequests && (
            totalExportRequests - (inbox.length - numberOfinboxMessagesBeforeRequest)
        );
    };

    componentDidUpdate() {
        // Remove all current export tasks and set number of inbox messages before request
        // back to 0 if all export tasks have been finished
        const totalExportRequests = this.props.rasterExportRequests.length + this.props.timeseriesExportTasks.length;
        if (totalExportRequests && this.getNumberOfPendingExportTasks() === 0) {
            this.props.removeCurrentExportTasks();
        };
    };

    render() {
        const pendingExportTasks = this.getNumberOfPendingExportTasks();

        return (
            <div
                className="inbox"
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
                {(this.props.inbox.length === 0 && pendingExportTasks === 0) ? (
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
    timeseriesExportTasks: Object.keys(state.timeseriesExport),
});

const mapDispatchToProps = (dispatch) => ({
    removeMessage: (id: string) => removeMessage(dispatch, id),
    downloadFile: (id: string) => downloadFile(dispatch, id),
    removeCurrentExportTasks: () => removeCurrentExportTasks(dispatch),
});
type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

export default connect(mapStateToProps, mapDispatchToProps)(Inbox);