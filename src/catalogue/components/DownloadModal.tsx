import * as React from 'react';
import { connect } from 'react-redux';
import { Circle } from 'rc-progress';
import '../styles/Download.css';
import { MyStore } from '../../reducers';
import { Message } from '../../interface';

interface PropsFromState {
    inbox: Message[],
    pendingExportTasks: number,
};

class DownloadModal extends React.Component<PropsFromState> {
    render() {
        const { inbox, pendingExportTasks } = this.props;
        const succesfulTasks = inbox.length;
        const allTasks = pendingExportTasks + succesfulTasks;
        const progressInPercentage = succesfulTasks / allTasks * 100;

        return (
            <div className="download">
                <h3>Getting your request ready ...</h3>
                <div className="download-progress">
                    <Circle
                        className="download-progress-circle"
                        percent={progressInPercentage}
                        strokeWidth={4}
                        trailWidth={4}
                        strokeColor="#2FCBAB"
                    />
                    <i>{succesfulTasks} / {allTasks} export(s) finished ({Math.round(progressInPercentage)}%)</i>
                </div>
                <div className="download-text">
                    This can take a while. You can wait here, 
                    or we will let you know when the file is ready
                </div>
            </div>
        );
    };
};

const mapStateToProps = (state: MyStore): PropsFromState => ({
    inbox: state.inbox,
    pendingExportTasks: state.pendingExportTasks,
});

export default connect(mapStateToProps)(DownloadModal);