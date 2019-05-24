import * as React from 'react';
import { Raster } from '../interface';
import './RasterList.css';

interface MyProps {
    rasters: Raster[] | null;
    selectRaster: (raster: Raster) => void;
    page: number;
    searchTerm: string;
    onClick: (page: number) => void;
    onChange: (event: object) => void;
    onSubmit: (event: object) => void;
}

const RasterList = (props: MyProps) => {
    const { rasters, selectRaster, page, searchTerm, onClick, onChange, onSubmit } = props;

    if (!rasters) return <div className="raster-list"><h1>Loading ...</h1></div>;
    
    return (
        <div className="raster-list">
            <div className="raster-list__top">
                <form onSubmit={onSubmit} className="raster-list__searchbar">
                    <input type="text" className="raster-list__searchbar-input" placeholder="Search in Lizard or type an UUID" onChange={onChange} value={searchTerm}/>
                    <button className="raster-list__searchbar-button" type="submit">
                        <svg className="raster-list__searchbar-icon">
                            <use xlinkHref="image/symbol.svg#icon-search" />
                        </svg>
                    </button>
                </form>
                <div className="raster-list__length">{rasters.length} Items</div>
            </div>

            <div className="raster-list__content">
                <ul className="raster-list__list">
                    <li className="raster-list__row-title">
                        <div className="raster-list__row-box" />
                        <div className="raster-list__row-type">Type</div>
                        <div className="raster-list__row-name">Name</div>
                        <div className="raster-list__row-org">Organisation</div>
                        <div className="raster-list__row-obs">Obs.Type</div>
                        <div className="raster-list__row-time">Latest update</div>
                        <div className="raster-list__row-acc" />
                    </li>
                    {rasters.map((raster: Raster) => (
                        <li className="raster-list__row" key={raster.uuid} onClick={() => selectRaster(raster)}>
                            <input type="checkbox" className="raster-list__row-box" />
                            <div className="raster-list__row-type">#</div>
                            <div className="raster-list__row-name">{raster.name}</div>
                            <div className="raster-list__row-org">{raster.organisation.name}</div>
                            <div className="raster-list__row-obs">{raster.observation_type.parameter}</div>
                            <div className="raster-list__row-time">{new Date(raster.last_modified).toLocaleDateString()}</div>
                            <div className="raster-list__row-acc" />
                        </li>
                    ))}
                </ul>
                <div className="raster-list__pagination">
                    <button className="raster-list__button-previous" onClick={() => onClick(page - 1)}>Previous</button>
                    <button className="raster-list__button-next" onClick={() => onClick(page + 1)}>Next</button>
                </div>
            </div>
            <div className="raster-list__button-container">
                <button className="raster-list__button">ADD TO BASKET</button>
            </div>
        </div>
    );
};

export default RasterList;
