import { useSelector } from 'react-redux';
import { Circle } from 'rc-progress';
import { getInbox, getRasterExportState } from './../reducers';
import styles from './DownloadModal.module.css';

export default function DownloadModal () {
    const inbox = useSelector(getInbox);
    const rasterExportState = useSelector(getRasterExportState);
    const numberOfinboxMessagesBeforeRequest = rasterExportState.numberOfinboxMessagesBeforeRequest;
    const rasterExportRequests = rasterExportState.rasterExportRequests;
    const finishedTasks = inbox.length - numberOfinboxMessagesBeforeRequest;
    const allTasks =  rasterExportRequests.length;
    const progressInPercentage = finishedTasks / allTasks * 100;

    return (
        <div className={styles.Download}>
            <h3>{progressInPercentage===100 ? "Finished!" : "Getting your request ready ..."}</h3>
            <div className={styles.DownloadProgress}>
                <Circle
                    className={styles.DownloadProgressCircle}
                    percent={progressInPercentage}
                    strokeWidth={4}
                    trailWidth={4}
                    strokeColor="#008080"
                />
                <i>{finishedTasks} / {allTasks} export(s) finished ({Math.round(progressInPercentage)}%)</i>
            </div>
            <div className={styles.DownloadText}>
            {progressInPercentage===100 ?
                "Find your results in the 'Export' tab after closing this screen."
            :
                "This may take a while. You can wait here, but we'll let you know when your files are available in the Export Inbox."
            }
            </div>
        </div>
    )
}