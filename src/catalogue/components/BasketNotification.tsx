import * as React from 'react';
import '../styles/BasketNotification.css';

export default class BasketNotification extends React.Component {
    render() {
        return (
            <div className="notification">
                <p>Your selection has been updated successfully! Please go to the basket to see your selected item(s).</p>
                {/* eslint-disable-next-line */}
                <a href="#" className="notification-close">OK</a>
            </div>
        );
    };
};