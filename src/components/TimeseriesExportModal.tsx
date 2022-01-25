import { FC, useEffect, useState } from 'react';
import { connect, useSelector } from 'react-redux';
import { getInbox } from './../reducers';
import { addNotification, addTimeseriesExportTask } from './../action';
import { timeValidator } from './../utils/timeValidator';
import { requestTimeseriesExport } from './../utils/url';
import { TimeseriesPeriodFilter } from './TimeseriesPeriodFilter';
import styles from './TimeseriesExportModal.module.css';
import '../styles/Modal.css';
import '../styles/Buttons.css';

interface MyProps {
    defaultStart: number | null,
    defaultEnd: number | null,
    selectedTimeseries: string[],
    toggleModal: () => void,
};

const TimeSeriesExportModal: FC<MyProps & PropsFromDispatch> = (props) => {
    const {
        defaultStart,
        defaultEnd,
        selectedTimeseries
    } = props;

    const inbox = useSelector(getInbox);

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
            <div className={styles.TimeseriesExport}>
                <div className={styles.TimeseriesExportTitle}>
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
                        return requestTimeseriesExport(selectedTimeseries, start, end).then(
                            res => {
                                if (res.status === 200) {
                                    props.addNotification('Success! Time Series exported successfully. Please check your inbox!', 3000);
                                    props.toggleModal(); // close the modal
                                    return res.json();
                                } else {
                                    props.addNotification('Error! Time Series export failed.', 3000);
                                };
                            }
                        ).then(
                            task => props.addTimeseriesExportTask(inbox.length, task.task_id)
                        ).catch(console.error);
                    }}
                    disabled={!selectedTimeseries.length || !start || !!timeValidator(start, end)}
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