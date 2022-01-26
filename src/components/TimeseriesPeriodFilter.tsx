import moment from 'moment';
import Datetime from 'react-datetime';
import { timeValidator } from './../utils/timeValidator';
import styles from './TimeseriesPeriodFilter.module.css';
import 'react-datetime/css/react-datetime.css';
import '../styles/DatetimePicker.css'; // this css file is to customize the position of the datetime picker

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
            <div className={styles.TimeseriesPeriodContainer}>
                <div className={styles.TimeseriesTimeSelection}>
                    <span>Start</span>
                    <Datetime
                        dateFormat={'DD/MM/YYYY'}
                        timeFormat={'HH:mm'}
                        inputProps={{
                            className: `${styles.TimeseriesDatetime} ${startDateRequired && !start ? styles.TimeseriesDatetimeError : ''}`,
                            placeholder: '---'
                        }}
                        defaultValue={moment(start || '')}
                        onChange={(e) => setStart(moment(e).valueOf())}
                    />
                </div>
                <span className={styles.TimeseriesPeriodArrow}>&#8594;</span>
                <div className={styles.TimeseriesTimeSelection}>
                    <span>End</span>
                    <Datetime
                        dateFormat={'DD/MM/YYYY'}
                        timeFormat={'HH:mm'}
                        inputProps={{
                            className: !timeValidator(start, end) ? styles.TimeseriesDatetime : `${styles.TimeseriesDatetime} ${styles.TimeseriesDatetimeError}`,
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