import { useEffect, useState } from 'react';
import { LatLngBounds } from 'leaflet';
import { Raster } from './../interface';
import DownloadModal from './DownloadModal';
import ExportModal from './ExportModal';
import styles from '../styles/Modal.module.css';

interface MyProps {
    raster: Raster,
    bounds: LatLngBounds,
    toggleExportModal: () => void
}

export default function Export (props: MyProps) {
    const { raster, bounds, toggleExportModal } = props;
    const [downloadModal, setDownloadModal] = useState<boolean>(false);

    useEffect(() => {
        const closeModalsOnEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                toggleExportModal();
            };
        };
        window.addEventListener("keydown", closeModalsOnEsc);
        return () => window.removeEventListener("keydown", closeModalsOnEsc);
    });

    return (
        <div className={`${styles.ModalMain} ${styles.ModalRasterExport}`}>
            {downloadModal ? (
                <DownloadModal />
            ) : (
                <ExportModal
                    raster={raster}
                    bounds={bounds}
                    openDownloadModal={() => setDownloadModal(true)}
                />
            )}
            {/* eslint-disable-next-line */}
            <a className={styles.ModalClose} onClick={toggleExportModal}>&times;</a>
        </div>
    )
}