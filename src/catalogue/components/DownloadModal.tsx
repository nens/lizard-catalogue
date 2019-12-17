import * as React from 'react';
import { connect } from 'react-redux';
import { Circle } from 'rc-progress';
import '../styles/Download.css';
import { MyStore } from '../../reducers';
import { Message, RasterExportRequest } from '../../interface';

interface PropsFromState {
    inbox: Message[],
    numberOfinboxMessagesBeforeRequest: number,
    rasterExportRequests: RasterExportRequest[],
};

class DownloadModal extends React.Component<PropsFromState> {
    render() {
        const { inbox, numberOfinboxMessagesBeforeRequest } = this.props;
        const finishedTasks = inbox.length - numberOfinboxMessagesBeforeRequest;
        const allTasks =  this.props.rasterExportRequests.length;
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
    numberOfinboxMessagesBeforeRequest: state.rasterExportState.numberOfinboxMessagesBeforeRequest,
    rasterExportRequests: state.rasterExportState.rasterExportRequests,
});

export default connect(mapStateToProps)(DownloadModal);