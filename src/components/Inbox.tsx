import { useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { RootDispatch } from '../store';
import { Message } from './../interface';
import { removeMessage, downloadFile, removeCurrentExportTasks } from './../action';
import { getRasterExportState, getTimeseriesExport } from './../reducers';
import styles from './Inbox.module.css';

interface MyProps {
    inbox: Message[]
};

const Inbox: React.FC<MyProps & PropsFromDispatch> = ({
    inbox,
    downloadFile,
    removeCurrentExportTasks,
    removeMessage
}) => {
    const rasterExportState = useSelector(getRasterExportState);
    const numberOfinboxMessagesBeforeRequest = rasterExportState.numberOfinboxMessagesBeforeRequest;
    const rasterExportRequests = rasterExportState.rasterExportRequests;
    const timeseriesExportTasks = Object.keys(useSelector(getTimeseriesExport));

    const removeMessageFromInbox = (message: Message) => {
        fetch(`/api/v3/inbox/${message.id}/read/`, {
            credentials: "same-origin",
            method: 'POST'
        });
        removeMessage(message.id);
    };

    const getNumberOfPendingExportTasks = () => {
        const totalExportRequests = rasterExportRequests.length + timeseriesExportTasks.length;
        // Return the number of pending export tasks that are not ready yet
        return totalExportRequests && (
            totalExportRequests - (inbox.length - numberOfinboxMessagesBeforeRequest)
        );
    };

    useEffect(() => {
        // Remove all current export tasks and set number of inbox messages before request
        // back to 0 if all export tasks have been finished
        const totalExportRequests = rasterExportRequests.length + timeseriesExportTasks.length;
        if (totalExportRequests && getNumberOfPendingExportTasks() === 0) {
            removeCurrentExportTasks();
        };
    });

    const pendingExportTasks = getNumberOfPendingExportTasks();

    return (
        <div
            className={styles.Inbox}
            onClick={(e) => e.stopPropagation()}
        >
            {inbox.map(message => (
                <div className={styles.InboxFile} key={message.id}>
                    <div
                        className={styles.InboxFilename}
                        title={message.message}
                    >
                        {message.message}
                    </div>
                    {message.url ? (
                        <a
                            title="download file"
                            href={message.url}
                            onClick={() => downloadFile(message.id)}
                        >
                            <i className={`fa fa-download ${styles.InboxDownload}`} />
                        </a>
                    ) : null}
                    {/* User can only remove the message if either the file
                    has been downloaded or the export task failed */}
                    <div
                        className={styles.InboxRead}
                        title="remove file"
                        onClick={() => removeMessageFromInbox(message)}
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
                    className={`${styles.InboxFile} ${styles.InboxPendingExports}`}
                    title={`${pendingExportTasks} export(s) in progress`}
                >
                    <div className={styles.InboxFilename}>
                        {pendingExportTasks} export(s) in progress
                    </div>
                    <i className={`fa fa-download ${styles.InboxPendingDownloads}`} />
                    <div className={styles.InboxRead} />
                </div>
            ): null}
            {(inbox.length === 0 && pendingExportTasks === 0) ? (
                <i className={styles.InboxInfo}>
                    No export tasks at the moment.
                </i>
            ) : (
                <i className={styles.InboxInfo}>
                    When your files are ready, 
                    click on the download icon.
                </i>
            )}
        </div>
    )
}

const mapDispatchToProps = (dispatch: RootDispatch) => ({
    removeMessage: (id: string) => dispatch(removeMessage(id)),
    downloadFile: (id: string) => dispatch(downloadFile(id)),
    removeCurrentExportTasks: () => dispatch(removeCurrentExportTasks()),
});
type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

export default connect(null, mapDispatchToProps)(Inbox);