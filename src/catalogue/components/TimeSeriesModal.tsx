import React, { useEffect } from 'react';
import '../styles/TimeSeriesModal.css';
import '../styles/Modal.css';

interface MyProps {
    toggleExportModal: () => void
};

const TimeSeriesModal: React.FC<MyProps> = (props) => {
    const closeModalOnEsc = (e) => {
        if (e.key === 'Escape') {
            props.toggleExportModal();
        };
    };

    useEffect(() => {
        window.addEventListener('keydown', closeModalOnEsc);
        return window.removeEventListener('keydown', closeModalOnEsc);
    });

    return (
        <div className="modal-main modal-timeseries">
            <div className="timeseries">
                Timeseries selection modal
            </div>

            {/* eslint-disable-next-line */}
            <a className="modal-close" onClick={props.toggleExportModal}>&times;</a>
        </div>
    );
};

export default TimeSeriesModal;