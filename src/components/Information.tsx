import React from 'react';
import styles from './Information.module.css';

export default function Information () {
    return (
        <div className={styles.InformationContainer} id={"information"}>
            <div className={styles.InformationMain}>
                <h4>Information</h4>
                <div className={styles.InformationMainContent}>
                    <p>Welcome to the Lizard Catalogue!</p>
                    <p>
                        This catalogue provides you a detailed overview of all the raster layercollections in Lizard.
                        You can search for layer collections, filter them per organisation, view detailed metadata and open layercollections in the Lizard Portal and the Lizard API.
                    </p>
                </div>
            </div>
            <div className={styles.InformationFooter}>
                <a
                    href="https://docs.lizard.net/e_catalog.html"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Documentation
                </a>
                <button onClick={() => window.location.href = '#'}>Close</button>
            </div>
            {/* eslint-disable-next-line */}
            <a href="#" className={styles.InformationClose}>&times;</a>
        </div>
    )
}