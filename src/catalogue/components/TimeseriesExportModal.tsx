import React, { useEffect, useState } from 'react';
import { connect, useSelector } from 'react-redux';
import { getInbox, getTimeseriesObject } from '../../reducers';
import { addNotification, addTimeseriesExportTask } from '../../action';
import { timeValidator } from '../../utils/timeValidator';
import { requestTimeseriesExport } from '../../utils/url';
import { TimeseriesPeriodFilter } from './TimeseriesPeriodFilter';
import '../styles/TimeseriesExportModal.css';
import '../styles/Modal.css';
import '../styles/Buttons.css';
import '../styles/Icons.css';

interface MyProps {
    defaultStart: number | null,
    defaultEnd: number | null,
    selectedLocations: string[],
    toggleModal: () => void,
};

const TimeSeriesExportModal: React.FC<MyProps & PropsFromDispatch> = (props) => {
    const {
        defaultStart,
        defaultEnd,
        selectedLocations
    } = props;

    const inbox = useSelector(getInbox);

    const timeseriesObject = useSelector(getTimeseriesObject);
    const timeseries = timeseriesObject ? timeseriesObject.timeseries : {};

    const currentDateTimeInMilliseconds = (new Date()).valueOf();

    const [start, setStart] = useState<number | null>(defaultStart);
    const [end, setEnd] = useState<number | null>(defaultEnd || currentDateTimeInMilliseconds);

    // Add event listener to close modal on ESCAPE
    useEffect(() => {
        const closeExportModalOnEsc = (e: any) => {
            if (e.key === 'Escape') props.toggleModal();
        };
        window.addEventListener('keydown', closeExportModalOnEsc);
        return () => window.removeEventListener('keydown', closeExportModalOnEsc);
    });

    return (
        <div className="modal-main modal-timeseries-export">
            <div className="modal-header">
                <span>Export period</span>
                <button onClick={props.toggleModal}>&times;</button>
            </div>
            <div className="timeseries-export">
                <div className="timeseries-export-title">
                    <h4>Choose a period for your export.</h4>
                    <span>If the filter period is filled in, it will be used as the default period.</span>
                </div>
                <TimeseriesPeriodFilter
                    start={start}
                    end={end}
                    setStart={setStart}
                    setEnd={setEnd}
                    startDateRequired
                />
                <button
                    className="button-action"
                    title={
                        !start ? 'Please select a start date to export the Time Series' :
                        timeValidator(start, end) ? timeValidator(start, end) as string :
                        'Export Time Series'
                    }
                    onClick={() => {
                        if (!start) return;
                        const arrayOfTimeseriesUUIDs = selectedLocations.map(uuid => {
                            const selectedTimeseries = Object.values(timeseries).filter(ts => ts.location.uuid === uuid);
                            return selectedTimeseries.map(ts => ts.uuid);
                        });
                        return requestTimeseriesExport(arrayOfTimeseriesUUIDs, start, end).then(
                            res => {
                                if (res.status === 200) {
                                    props.addNotification('Success! Time Series exported successfully. Please check your inbox!', 3000);
                                    return res.json();
                                } else {
                                    props.addNotification('Error! Time Series export failed.', 3000);
                                };
                            }
                        ).then(
                            task => props.addTimeseriesExportTask(inbox.length, task.task_id)
                        ).catch(console.error);
                    }}
                    disabled={!selectedLocations.length || !start || !!timeValidator(start, end)}
                    style={{
                        width: 200,
                        position: 'absolute',
                        bottom: 0,
                        right: 0
                    }}
                >
                    Export
                </button>
            </div>
        </div>
    );
};

const mapDispatchToProps = (dispatch: any) => ({
    addNotification: (message: string, timeout: number) => dispatch(addNotification(message, timeout)),
    addTimeseriesExportTask: (numberOfInboxMessages: number, taskUuid: string) => dispatch(addTimeseriesExportTask(numberOfInboxMessages, taskUuid)),
});
type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

export default connect(null, mapDispatchToProps)(TimeSeriesExportModal);