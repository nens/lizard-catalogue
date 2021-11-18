import React from 'react';
import { connect, useSelector } from 'react-redux';
import { dismissNotification } from './../action';
import { getNotification } from './../reducers';
import '../styles/Snackbar.css';

const Snackbar: React.FC<PropsFromDispatch> = (props) => {
    const notification = useSelector(getNotification);
    const { dismiss } = props;

    return (
        <div className={'snackbar-wrapper'}>
            <div
                className={`snackbar ${notification ? 'snackbar-show' : 'snackbar-hide'}`}
            >
                <span className={'snackbar-message'}>
                    {notification}
                </span>
                <div
                    className={'snackbar-dismiss'}
                    onClick={dismiss}
                >
                    Dismiss
                </div>
            </div>
        </div>
    );
};

const mapDispatchToProps = (dispatch) => ({
    dismiss: () => dispatch(dismissNotification())
});
type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

export default connect(null, mapDispatchToProps)(Snackbar);
