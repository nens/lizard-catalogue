import * as React from 'react';
import { connect } from 'react-redux';
import { Circle } from 'rc-progress';
import '../styles/Download.css';
import { MyStore } from '../../reducers';
import { Message } from '../../interface';

interface PropsFromState {
    inbox: Message[],
    pendingExportTasks: number,
    numberOfinboxMessagesBeforeRequest: number,
    rasterExportRequests: any[],
};

class DownloadModal extends React.Component<PropsFromState> {
    render() {
        const { inbox, pendingExportTasks, numberOfinboxMessagesBeforeRequest } = this.props; console.log(pendingExportTasks)
        const finishedTasks = inbox.length - numberOfinboxMessagesBeforeRequest;
        const allTasks =  this.props.rasterExportRequests.length;//finishedTasks - numberOfinboxMessagesBeforeRequest;//pendingExportTasks ;//+ finishedTasks;
        const progressInPercentage = finishedTasks / allTasks * 100;

        return (
            <div className="download">
                <h3>
                {progressInPercentage===100? 
                "Finished!"
                :
                "Getting your request ready ..."
                }
                </h3>
                <div className="download-progress">
                    <Circle
                        className="download-progress-circle"
                        percent={progressInPercentage}
                        strokeWidth={4}
                        trailWidth={4}
                        strokeColor="#2FCBAB"
                    />
                    <i>{finishedTasks} / {allTasks} export(s) finished ({Math.round(progressInPercentage)}%)</i>
                </div>
                <div className="download-text">
                {progressInPercentage===100? 
                "Find your results in the 'Export' tab after closing this screen"
                :
                "This can take a while. You can wait here, or we will let you know when the file is ready"
                }
                    
                </div>
            </div>
        );
    };
};

const mapStateToProps = (state: MyStore): PropsFromState => ({
    inbox: state.inbox,
    pendingExportTasks: state.pendingExportTasks,
    numberOfinboxMessagesBeforeRequest: state.rasterExportState.numberOfinboxMessagesBeforeRequest,
    rasterExportRequests: state.rasterExportState.rasterExportRequests,
});

export default connect(mapStateToProps)(DownloadModal);