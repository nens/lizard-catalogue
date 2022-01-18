import React, { useState } from 'react';
import MDSpinner from 'react-md-spinner';
import { Results, ResultType } from '../home/scenarios/ScenarioResults';
import { Raster } from '../interface';
import { getUuidFromUrl } from '../utils/getUuidFromUrl';
import { boundsToDisplay, getBounds } from '../utils/latLngZoomCalculation';
import Export from './Export';
import downloadIcon from '../images/download-icon.svg';
import rasterExportIcon from '../images/raster-export.svg';
import styles from './ResultCard.module.css';

interface MyProps {
  resultType: ResultType,
  results: Results
}

interface RasterState {
  id: number,
  isFetching: boolean,
  raster?: Raster
}

export default function ResultCard (props: MyProps) {
  const { resultType, results } = props;
  const [rasterState, setRasterState] = useState<RasterState | null>(null);

  // Fetch function to fetch scenario raster result
  const fetchRaster = async (id: number, rasterUrl: string) => {
    const uuid = getUuidFromUrl(rasterUrl);

    if (!uuid) {
      console.error("No UUID can be found for raster URL: ", rasterUrl);
      return;
    };

    setRasterState({
      id,
      isFetching: true
    })

    const apiResponse = await fetch(`/api/v4/rasters/${uuid}/`);

    if (!apiResponse.ok) {
      console.error(`Failed to fetch raster with uuid: ${uuid} with status: ${apiResponse.status}.`);
      return;
    };

    const jsonResponse = await apiResponse.json();
    setRasterState({
      id,
      isFetching: false,
      raster: jsonResponse
    });
  };

  return (
    <div className={styles.ResultContainer}>
      <div
        className={styles.ResultType}
      >
        {resultType.toUpperCase()}
      </div>
      <ul
        className={styles.ResultList}
      >
        {!results.isFetching ? (
          results.results.map(result => (
            <li key={result.id}>
              <a
                title={result.raster ? 'Click to open Raster export modal' : 'Click to download result'}
                href={result.attachment_url ? result.attachment_url : '#'}
                onClick={() => result.raster && fetchRaster(result.id, result.raster)}
              >
                {result.result_type.name}
              </a>
              {result.raster ? (
                rasterState && rasterState.id === result.id && rasterState.isFetching ? (
                  <MDSpinner size={16} />
                ) : (
                  <img
                    title="Open export modal"
                    alt="export"
                    src={rasterExportIcon}
                    onClick={() => fetchRaster(result.id, result.raster)}
                  />
                )
              ) : (
                <img
                  title="Download"
                  alt="download"
                  src={downloadIcon}
                  onClick={() => window.open(result.attachment_url)}
                />
              )}
            </li>
          ))
        ) : (
          <MDSpinner />
        )}
      </ul>
      {/* Raster export modal */}
      {rasterState && rasterState.raster ? (
        <div className="modal-background">
          <Export
            raster={rasterState.raster}
            bounds={boundsToDisplay(getBounds(rasterState.raster))}
            toggleExportModal={() => setRasterState(null)}
          />
        </div>
      ) : null}
    </div>
  )
}