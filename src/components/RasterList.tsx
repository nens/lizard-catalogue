import * as React from 'react';
import { connect } from 'react-redux';
import { Raster } from '../interface';
import { MyStore, getRaster } from '../reducers';
import './RasterList.css';

interface MyProps {
    page: number;
    searchTerm: string;

    currentRasterList: MyStore['currentRasterList'] | null;

    onClick: (page: number) => void;
    onChange: (event: object) => void;
    onSubmit: (event: object) => void;

    selectRaster: (uuid: string) => void;
    updateBasket: (basket: MyStore['basket']) => void;
};

interface PropsFromState {
    rasters: Raster[] | null
};

type RasterListProps = MyProps & PropsFromState;

interface MyState {
    checkedRasters: string[]
};

class RasterList extends React.Component<RasterListProps, MyState> {
    state: MyState = {
        checkedRasters: []
    };

    onCheckboxSelect = (uuid: string) => {
        //Check if the raster has already been selected or not
        const selectedUuid = this.state.checkedRasters.filter(id => id === uuid)

        //If not yet selected then add this new uuid into the basket
        if (selectedUuid.length === 0) {
            this.setState({
                checkedRasters: [...this.state.checkedRasters, uuid]
            });
        } else {
            //If already selected then remove this uuid from the basket
            this.setState({
                checkedRasters: this.state.checkedRasters.filter(id => id !== uuid)
            });
        };
    };

    render() {
        //Destructure all props of the Raster List component
        const { searchTerm, page, onClick, onChange, onSubmit, currentRasterList, selectRaster, updateBasket, rasters } = this.props;

        //If nothing is fetched, Loading ... sign appeears
        if (!currentRasterList || !rasters) return <div className="raster-list"><h1>Loading ...</h1></div>;

        //Destructure the currentRasterList object
        const { count, previous, next } = currentRasterList;

        //Add to basket function which will do the followings
        //1- open the notification box
        //2- dispatch an action to update the basket
        //3- set the state of the RasterList component again
        const addToBasket = () => {
            //Click the button will open the notification popup
            window.location.href = 'catalogue#notification';
            
            updateBasket(this.state.checkedRasters); 
            this.setState({checkedRasters: []});
        };
        
        return (
            <div className="raster-list">
                <div className="raster-list__top">
                    <form onSubmit={onSubmit} className="raster-list__searchbar">
                        <input type="text" className="raster-list__searchbar-input" placeholder="Search in Lizard or type an UUID" onChange={onChange} value={searchTerm} />
                        <button className="raster-list__searchbar-button" type="submit">
                            <svg className="raster-list__searchbar-icon">
                                <use xlinkHref="image/symbols.svg#icon-search" />
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
                            <div className="raster-list__row raster-list__row-access" />
                        </li>
                        {rasters.map((raster: Raster) => {
                            //Here is a logic to define whether a raster has been selected (check-box has been checked or not)
                            //if yes then the checked value of the input field will be true
                            //if no then the checked value of the input field will be false
                            const checked = this.state.checkedRasters.filter(uuid => uuid === raster.uuid).length === 0 ? false : true;

                            return (
                                <li className="raster-list__row-li" key={raster.uuid} onClick={() => selectRaster(raster.uuid)} >
                                    <input className="raster-list__row raster-list__row-box" type="checkbox" onChange={() => this.onCheckboxSelect(raster.uuid)} checked={checked} />
                                    {raster.temporal ? 
                                        <img className="raster-list__row raster-list__row-type" src="image/raster-temporal.svg" alt="raster" /> :
                                        <img className="raster-list__row raster-list__row-type" src="image/raster-non-temporal.svg" alt="raster" />
                                    }
                                    <div className="raster-list__row raster-list__row-name">{raster.name}</div>
                                    <div className="raster-list__row raster-list__row-org">{raster.organisation.name}</div>
                                    <div className="raster-list__row raster-list__row-obs">{raster.observation_type.parameter}</div>
                                    <div className="raster-list__row raster-list__row-time">{new Date(raster.last_modified).toLocaleDateString()}</div>
                                    {raster.access_modifier === 'Public' && 'Publiek' ? 
                                        <div className="raster-list__row raster-list__row-access"><div className="access-modifier">{raster.access_modifier.toUpperCase()}</div></div> :
                                        <div className="raster-list__row raster-list__row-access" />
                                    } 
                                </li>
                            )
                        })}
                    </ul>
                </div>
                <div className="raster-list__button-container">
                    <div className="raster-list__button-pagination">
                        {!previous ? null : <button className="raster-list__button-previous" onClick={() => onClick(page - 1)}>Previous</button>}
                        {!next ? null : <button className="raster-list__button-next" onClick={() => onClick(page + 1)}>Next</button>}
                    </div>
                    {this.state.checkedRasters.length === 0 ?
                        <button className="raster-list__button-basket raster-list__button-basket-grey">ADD TO BASKET</button> :
                        <button className="raster-list__button-basket" onClick={addToBasket}>ADD TO BASKET</button>
                    }
                </div>
                {/*Notification popup when click on the Add to Basket button*/}
                <div className="raster-list__popup" id="notification">
                    <div className="raster-list__popup-content">
                        <p>Items successfully added to the Basket. Go to your basket to see which items have been added.</p>
                        <a href="#catalogue" className="raster-list__popup-close">OK</a>
                    </div>
                </div>
            </div>
        );
    };
};

const mapStateToProps = (state: MyStore, ownProps: MyProps): PropsFromState => {
    if (!ownProps.currentRasterList) return {
        rasters: null
    };
    return {
        rasters: ownProps.currentRasterList.rasterList.map(uuid => getRaster(state, uuid))
    };
};

export default connect(mapStateToProps)(RasterList);