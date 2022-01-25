import { useEffect } from 'react';
import { Message } from './../interface';
import { connect, useSelector } from 'react-redux';
import { removeMessage, downloadFile, removeCurrentExportTasks } from './../action';
import { getRasterExportState, getTimeseriesExport } from './../reducers';
import '../styles/Inbox.css';

interface MyProps {
    inbox: Message[],
    closeAllDropdowns: () => void,
};

const Inbox: React.FC<MyProps & PropsFromDispatch> = (props) => {
    const rasterExportState = useSelector(getRasterExportState);
    const numberOfinboxMessagesBeforeRequest = rasterExportState.numberOfinboxMessagesBeforeRequest;
    const rasterExportRequests = rasterExportState.rasterExportRequests;
    const timeseriesExportTasks = Object.keys(useSelector(getTimeseriesExport));

    const removeMessage = (message: Message) => {
        fetch(`/api/v3/inbox/${message.id}/read/`, {
            credentials: "same-origin",
            method: 'POST'
        });
        props.removeMessage(message.id);
    };

    const getNumberOfPendingExportTasks = () => {
        const totalExportRequests = rasterExportRequests.length + timeseriesExportTasks.length;
        // Return the number of pending export tasks that are not ready yet
        return totalExportRequests && (
            totalExportRequests - (props.inbox.length - numberOfinboxMessagesBeforeRequest)
        );
    };

    useEffect(() => {
        // Remove all current export tasks and set number of inbox messages before request
        // back to 0 if all export tasks have been finished
        const totalExportRequests = rasterExportRequests.length + timeseriesExportTasks.length;
        if (totalExportRequests && getNumberOfPendingExportTasks() === 0) {
            props.removeCurrentExportTasks();
        };
    });

    const pendingExportTasks = getNumberOfPendingExportTasks();

    return (
        <div
            className="inbox"
            onClick={(e) => e.stopPropagation()}
        >
            {props.inbox.map(message => (
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
                            onClick={() => props.downloadFile(message.id)}
                        >
                            <i className="fa fa-download inbox-download" />
                        </a>
                    ) : null}
                    {/* User can only remove the message if either the file
                    has been downloaded or the export task failed */}
                    <div
                        className="inbox-read"
                        title="remove file"
                        onClick={() => removeMessage(message)}
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
            {(props.inbox.length === 0 && pendingExportTasks === 0) ? (
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
    )
}

const mapDispatchToProps = (dispatch) => ({
    removeMessage: (id: string) => removeMessage(dispatch, id),
    downloadFile: (id: string) => downloadFile(dispatch, id),
    removeCurrentExportTasks: () => removeCurrentExportTasks(dispatch),
});
type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

export default connect(null, mapDispatchToProps)(Inbox);