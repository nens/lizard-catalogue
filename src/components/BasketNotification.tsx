import * as React from 'react';
import './styles/BasketNotification.css';

export default class BasketNotification extends React.Component {
    render() {
        return (
            <div className="notification">
                <p>Items successfully added to the Basket. Go to your basket to see which items have been added.</p>
                {/* eslint-disable-next-line */}
                <a href="#" className="notification-close">OK</a>
            </div>
        );
    };
};