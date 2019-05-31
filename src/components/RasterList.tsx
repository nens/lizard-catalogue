import * as React from 'react';
import { connect } from 'react-redux';
import { Raster } from '../interface';
import './RasterList.css';
import { MyStore, getRasterObject } from '../reducers';

interface MyProps {
    page: number;
    searchTerm: string;

    onClick: (page: number) => void;
    onChange: (event: object) => void;
    onSubmit: (event: object) => void;

    currentRasterList: MyStore['currentRasterList'] | null;
    allRasters: MyStore['allRasters'];
    rasters2: Raster[] | [];

    selectRaster: (uuid: string) => void;
    updateBasket: (basket) => void;
};

interface MyState {
    checkedRaster: string[];
};

class RasterList extends React.Component<MyProps, MyState> {
    state = {
        checkedRaster: []
    };

    onCheckboxSelect = (uuid: string) => {
        //Check if the raster has already been selected or not
        const selectedUuid = this.state.checkedRaster.filter(id => id === uuid)

        //If not yet selected then add this new uuid into the basket
        if (selectedUuid.length === 0) {
            this.setState({
                checkedRaster: [...this.state.checkedRaster, uuid]
            });
        } else {
            //If already selected then remove this uuid from the basket
            this.setState({
                checkedRaster: this.state.checkedRaster.filter(id => id !== uuid)
            });
        };
    };

    render() {
        //Destructure all props of the Raster List component
        const { searchTerm, page, onClick, onChange, onSubmit, currentRasterList, allRasters, selectRaster, updateBasket } = this.props;

        //If nothing is fetched, Loading ... sign appeears
        if (!currentRasterList) return <div className="raster-list"><h1>Loading ...</h1></div>;

        //Destructure rasterAPI object
        const { count, previous, next, rasterList } = currentRasterList;

        //Assign the rasters props to a variable
        const rasters3 = rasterList.map(uuid => allRasters[uuid])
        const rasters = this.props.rasters2

        console.log(rasters)
        console.log(rasters3)

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
                            const checked = this.state.checkedRaster.filter(uuid => uuid === raster.uuid).length === 0 ? false : true;

                            return (
                                <li className="raster-list__row-li" key={raster.uuid} onClick={() => selectRaster(raster.uuid)} >
                                    <input className="raster-list__row raster-list__row-box" type="checkbox" onClick={() => this.onCheckboxSelect(raster.uuid)} defaultChecked={checked} />
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
                    {this.state.checkedRaster.length === 0 ?
                        <button className="raster-list__button raster-list__button-grey">ADD TO BASKET</button> :
                        <button className="raster-list__button" onClick={() => updateBasket(this.state.checkedRaster)}>ADD TO BASKET</button>
                    }
                </div>
            </div>
        );
    }
};

const mapStateToProps = (state: MyStore, ownProps: MyProps) => {
    if (!ownProps.currentRasterList) return null
    return {
        rasters2: ownProps.currentRasterList.rasterList.map(uuid => getRasterObject(state, uuid))
    }
}

export default connect(mapStateToProps)(RasterList);