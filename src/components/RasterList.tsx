import * as React from 'react';
import { Raster } from '../interface';
import { extractDate } from '../action';
import './RasterList.css';

interface MyProps {
    rasters: Raster[] | null;
    selectRaster: (raster: Raster) => void;
}

const RasterList = (props: MyProps) => {
    const { rasters, selectRaster } = props;

    if (!rasters) return <div className="raster-list"><h1>Loading ...</h1></div>;

    return (
        <div className="raster-list">
            <form action="#" className="raster-list__searchbar">
                <input type="text" className="raster-list__searchbar-input" placeholder="Search in Lizard or type an UUID" />
                {/* <button className="raster-list__searchbar-button">
                    <svg className="raster-list__searchbar-icon">
                        <use xlinkHref="img/icomoon/sprite.svg#icon-magnifying-glass" />
                    </svg>
                </button> */}
            </form>
            <div className="raster-list__length">{rasters.length} Items</div>
            <div className="raster-list__content">
                <ul className="raster-list__list">
                    <li className="raster-list__row-title">
                        <div className="raster-list__row-box">#</div>
                        <div className="raster-list__row-type">Type</div>
                        <div className="raster-list__row-name">Name</div>
                        <div className="raster-list__row-org">Organisation</div>
                        <div className="raster-list__row-obs">Obs.Type</div>
                        <div className="raster-list__row-time">Latest update</div>
                        <div className="raster-list__row-acc" />
                    </li>
                    {rasters.map((raster: Raster) => (
                    <li className="raster-list__row" key={raster.uuid} onClick={() => selectRaster(raster)}>
                        
                        <div className="raster-list__row-box">#</div>
                        <div className="raster-list__row-type">#</div>
                        <div className="raster-list__row-name">{raster.name}</div>
                        <div className="raster-list__row-org">{raster.organisation.name}</div>
                        <div className="raster-list__row-obs">{raster.observation_type.code}</div>
                        <div className="raster-list__row-time">{extractDate(raster.last_modified)}</div>
                        <div className="raster-list__row-acc" />
                    </li>
                ))}
                </ul>
            </div>
            <div className="raster-list__button-container">
                <button className="raster-list__button">Select</button>
            </div>
        </div>
    );
};

export default RasterList;
