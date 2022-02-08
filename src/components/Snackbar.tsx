import { connect, useSelector } from 'react-redux';
import { RootDispatch } from '../store';
import { dismissNotification } from './../action';
import { getNotification } from './../reducers';
import styles from './SnackBar.module.css';

const Snackbar: React.FC<PropsFromDispatch> = (props) => {
    const notification = useSelector(getNotification);
    const { dismiss } = props;

    return (
        <div className={styles.SnackbarWrapper}>
            <div
                className={`${styles.Snackbar} ${notification ? styles.SnackbarShow : styles.SnackbarHide}`}
            >
                <span className={styles.SnackbarMessage}>
                    {notification}
                </span>
                <div
                    className={styles.SnackbarDismiss}
                    onClick={dismiss}
                >
                    Dismiss
                </div>
            </div>
        </div>
    );
};

const mapDispatchToProps = (dispatch: RootDispatch) => ({
    dismiss: () => dispatch(dismissNotification())
});
type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

export default connect(null, mapDispatchToProps)(Snackbar);
