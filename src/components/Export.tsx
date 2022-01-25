import { useEffect, useState } from 'react';
import { Raster } from './../interface';
import DownloadModal from './DownloadModal';
import ExportModal from './ExportModal';
import '../styles/Export.css';
import '../styles/Modal.css';

interface MyProps {
    raster: Raster,
    bounds: number[][],
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
        <div className="modal-main modal-raster-export">
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
            <a className="modal-close" onClick={toggleExportModal}>&times;</a>
        </div>
    )
}