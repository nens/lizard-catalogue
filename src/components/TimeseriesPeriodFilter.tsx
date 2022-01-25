import moment from 'moment';
import Datetime from 'react-datetime';
import { timeValidator } from './../utils/timeValidator';
import 'react-datetime/css/react-datetime.css';
import '../styles/DatetimePicker.css'; // this css file is to customize the position of the datetime picker
import '../styles/TimeSeriesModal.css';

interface MyProps {
    start: number | null,
    end: number | null,
    setStart: (value: number) => void,
    setEnd: (value: number) => void,
    startDateRequired?: boolean,
};

export const TimeseriesPeriodFilter: React.FC<MyProps> = ({
    start, end, setStart, setEnd, startDateRequired
}) => {
    return (
        <div>
            <div className="timeseries-period-container">
                <div className="timeseries-time-selection">
                    <span>Start</span>
                    <Datetime
                        dateFormat={'DD/MM/YYYY'}
                        timeFormat={'HH:mm'}
                        inputProps={{
                            className: `timeseries-datetime ${startDateRequired && !start ? 'timeseries-datetime-error' : ''}`,
                            placeholder: '---'
                        }}
                        defaultValue={moment(start || '')}
                        onChange={(e) => setStart(moment(e).valueOf())}
                    />
                </div>
                <span className="timeseries-period-arrow">&#8594;</span>
                <div className="timeseries-time-selection">
                    <span>End</span>
                    <Datetime
                        dateFormat={'DD/MM/YYYY'}
                        timeFormat={'HH:mm'}
                        inputProps={{
                            className: !timeValidator(start, end) ? 'timeseries-datetime' : 'timeseries-datetime timeseries-datetime-error',
                            placeholder: '---'
                        }}
                        defaultValue={moment(end || '')}
                        onChange={(e) => setEnd(moment(e).valueOf())}
                    />
                </div>
            </div>
            <div style={{ color: 'red', marginTop: 5 }}>{timeValidator(startDateRequired ? (start || NaN) : start, end)}</div>
        </div>
    );
};