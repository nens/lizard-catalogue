import React from 'react';
import { useSelector } from 'react-redux';
import { Circle } from 'rc-progress';
import { getInbox, getRasterExportState } from './../reducers';
import '../styles/Download.css';

export default function DownloadModal () {
    const inbox = useSelector(getInbox);
    const rasterExportState = useSelector(getRasterExportState);
    const numberOfinboxMessagesBeforeRequest = rasterExportState.numberOfinboxMessagesBeforeRequest;
    const rasterExportRequests = rasterExportState.rasterExportRequests;
    const finishedTasks = inbox.length - numberOfinboxMessagesBeforeRequest;
    const allTasks =  rasterExportRequests.length;
    const progressInPercentage = finishedTasks / allTasks * 100;

    return (
        <div className="download">
            <h3>{progressInPercentage===100 ? "Finished!" : "Getting your request ready ..."}</h3>
            <div className="download-progress">
                <Circle
                    className="download-progress-circle"
                    percent={progressInPercentage}
                    strokeWidth={4}
                    trailWidth={4}
                    strokeColor="#008080"
                />
                <i>{finishedTasks} / {allTasks} export(s) finished ({Math.round(progressInPercentage)}%)</i>
            </div>
            <div className="download-text">
            {progressInPercentage===100 ?
                "Find your results in the 'Export' tab after closing this screen."
            :
                "This may take a while. You can wait here, but we'll let you know when your files are available in the Export Inbox."
            }
            </div>
        </div>
    )
}