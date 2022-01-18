import React, { useState } from 'react';
import MDSpinner from 'react-md-spinner';
import { Results, ResultType } from '../home/scenarios/ScenarioResults';
import { Raster } from '../interface';
import { getUuidFromUrl } from '../utils/getUuidFromUrl';
import downloadIcon from '../images/download-icon.svg';
import rasterExportIcon from '../images/raster-export.svg';
import styles from './ResultCard.module.css';

interface MyProps {
  resultType: ResultType,
  results: Results
}

export default function ResultCard (props: MyProps) {
  const { resultType, results } = props;
  const [raster, setRaster] = useState<Raster | null>(null);
  console.log(raster);

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
              <span>{result.result_type.name}</span>
              {result.raster ? (
                <img
                  title="Export raster"
                  alt="export"
                  src={rasterExportIcon}
                  onClick={async () => {
                    const uuid = getUuidFromUrl(result.raster);
                    const apiResponse = await fetch(`/api/v4/rasters/${uuid}/`);
                    if (!apiResponse.ok) {
                      console.error(`Failed to fetch raster with uuid: ${uuid} with status: ${apiResponse.status}.`);
                      return;
                    }
                    const jsonResponse = await apiResponse.json();
                    setRaster(jsonResponse);
                  }}
                />
              ) : (
                <img
                  title="Download result"
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
    </div>
  )
}