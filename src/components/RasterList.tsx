import * as React from 'react';
import { Raster, RastersObject } from '../interface';
import './RasterList.css';

interface MyProps {
    rastersObject: RastersObject | null;
    selectRaster: (raster: Raster) => void;
    page: number;
    searchTerm: string;
    onClick: (page: number) => void;
    onChange: (event: object) => void;
    onSubmit: (event: object) => void;
    addToBasket: (basket) => void;
}

class RasterList extends React.Component<MyProps, {}> {
    state = {};

    onCheckboxSelect = (raster: Raster) => {
        if (!this.state[raster.uuid]) {
            this.setState({
                [raster.uuid]: raster
            });
        } else {
            delete this.state[raster.uuid];
            this.setState({});
        };
    };

    render() {
        const { rastersObject, selectRaster, page, searchTerm, onClick, onChange, onSubmit, addToBasket } = this.props;

        if (!rastersObject) return <div className="raster-list"><h1>Loading ...</h1></div>;

        const { count, previous, next } = rastersObject;
        const rasters = rastersObject.results;

        return (
            <div className="raster-list">
                <div className="raster-list__top">
                    <form onSubmit={onSubmit} className="raster-list__searchbar">
                        <input type="text" className="raster-list__searchbar-input" placeholder="Search in Lizard or type an UUID" onChange={onChange} value={searchTerm} />
                        <button className="raster-list__searchbar-button" type="submit">
                            <svg className="raster-list__searchbar-icon">
                                <use xlinkHref="image/symbol.svg#icon-search" />
                            </svg>
                        </button>
                    </form>
                    <div className="raster-list__length">{count} Items</div>
                </div>

                <div className="raster-list__content">
                    <ul className="raster-list__list">
                        <li className="raster-list__row-title">
                            <div className="raster-list__row raster-list__row-box" />
                            <div className="raster-list__row raster-list__row-type">Type</div>
                            <div className="raster-list__row raster-list__row-name">Name</div>
                            <div className="raster-list__row raster-list__row-org">Organisation</div>
                            <div className="raster-list__row raster-list__row-obs">Obs.Type</div>
                            <div className="raster-list__row raster-list__row-time">Latest update</div>
                            <div className="raster-list__row raster-list__row-acc" />
                        </li>
                        {rasters.map((raster: Raster) => {
                            //Here is a logic to define whether a raster has been selected (check-box has been checked or not)
                            //if yes then the default checked value of the input field will be true
                            //if no then the default checked value of the input field will be false
                            const rasterUuid = this.state[raster.uuid];
                            const checked = rasterUuid ? true : false;

                            return (
                                <li className="raster-list__row-li" key={raster.uuid} onClick={() => selectRaster(raster)} >
                                    <input className="raster-list__row raster-list__row-box" type="checkbox" onClick={() => this.onCheckboxSelect(raster)} defaultChecked={checked} />
                                    <div className="raster-list__row raster-list__row-type">#</div>
                                    <div className="raster-list__row raster-list__row-name">{raster.name}</div>
                                    <div className="raster-list__row raster-list__row-org">{raster.organisation.name}</div>
                                    <div className="raster-list__row raster-list__row-obs">{raster.observation_type.parameter}</div>
                                    <div className="raster-list__row raster-list__row-time">{new Date(raster.last_modified).toLocaleDateString()}</div>
                                    <div className="raster-list__row raster-list__row-acc" />
                                </li>
                            )
                        })}
                    </ul>
                    <div className="raster-list__pagination">
                        {!previous ? null : <button className="raster-list__button-previous" onClick={() => onClick(page - 1)}>Previous</button>}
                        {!next ? null : <button className="raster-list__button-next" onClick={() => onClick(page + 1)}>Next</button>}
                    </div>
                </div>
                <div className="raster-list__button-container">
                    {Object.keys(this.state).length === 0 ?
                        <button className="raster-list__button raster-list__button-grey">ADD TO BASKET</button> :
                        <button className="raster-list__button" onClick={() => addToBasket(this.state)}>ADD TO BASKET</button>
                    }
                </div>
            </div>
        );
    }
};

export default RasterList;
