import React from 'react';
import styles from './BasketNotification.module.css';

export default function BasketNotification () {
    return (
        <div className={styles.Notification}>
            <p>Your selection has been updated successfully! Please go to the basket to see your selected item(s).</p>
            {/* eslint-disable-next-line */}
            <a href="#" className={styles.NotificationClose}>OK</a>
        </div>
    )
}