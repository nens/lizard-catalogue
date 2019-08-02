import * as React from 'react';
import MDSpinner from "react-md-spinner";
import { connect } from 'react-redux';
import { WMS } from '../../interface';
import { MyStore, getWMS } from '../../reducers';
import './../RasterList.css';

interface MyProps {
    page: number,
    searchTerm: string,

    currentWMSList: MyStore['currentWMSList'] | null,

    onPageClick: (page: number) => void,
    onSearchChange: (event: object) => void,
    onSearchSubmit: (event: object) => void,
    onSorting: (ordering: string) => void,

    selectItem: (uuid: string) => void,
    updateBasket: (basket: MyStore['basket']) => void
};

interface PropsFromState {
    wmsLayers: WMS[]
};

type WMSListProps = MyProps & PropsFromState;

interface MyState {
    checkedWMSLayers: string[]
};

class WMSList extends React.Component<WMSListProps, MyState> {
    state: MyState = {
        checkedWMSLayers: []
    };

    onCheckboxSelect = (uuid: string) => {
        //Check if the WMS layer has already been selected or not
        const selectedUuid = this.state.checkedWMSLayers.filter(id => id === uuid)

        //If not yet selected then add this new uuid into the basket
        if (selectedUuid.length === 0) {
            this.setState({
                checkedWMSLayers: [...this.state.checkedWMSLayers, uuid]
            });
        } else {
            //If already selected then remove this uuid from the basket
            this.setState({
                checkedWMSLayers: this.state.checkedWMSLayers.filter(id => id !== uuid)
            });
        };
    };

    renderLoadingScreen() {
        return <div className="raster-list loading-screen"><MDSpinner size={50}/></div>;
    };

    render() {
        //Destructure all props of the WMS List component
        const { searchTerm, page, onPageClick, onSearchChange, onSearchSubmit, onSorting, currentWMSList, selectItem, updateBasket, wmsLayers } = this.props;

        //If nothing is fetched, show loading screen
        if (!currentWMSList) return <this.renderLoadingScreen />;
        
        //If data is being requested from the API, show loading screen
        if (currentWMSList.isFetching) return <this.renderLoadingScreen />;

        //Destructure the currentWMSList object
        const { count, previous, next } = currentWMSList;

        //Add to basket function which will do the followings
        //1- open the notification box
        //2- dispatch an action to update the basket
        //3- set the state of the WMSList component again
        const addToBasket = () => {
            //Click the button will open the notification popup
            window.location.href = '#notification';
            
            updateBasket(this.state.checkedWMSLayers); 
            this.setState({checkedWMSLayers: []});
        };
        
        return (
            <div className="raster-list">
                <div className="raster-list__top">
                    <form onSubmit={onSearchSubmit} className="raster-list__searchbar" title="Type raster name or raster's UUID">
                        <input type="text" className="raster-list__searchbar-input" placeholder="Search in Lizard or type an UUID" onChange={onSearchChange} value={searchTerm} />
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
                            <div className="raster-list__row raster-list__row-name">
                                Name 
                                <i className="fa fa-sort" onClick={() => onSorting('name')}/>
                            </div>
                            <div className="raster-list__row raster-list__row-org">
                                Organisation 
                                <i className="fa fa-sort" onClick={() => onSorting('organisation__name')}/>
                            </div>
                            <div className="raster-list__row raster-list__row-access" />
                        </li>
                        {wmsLayers.map((wms: WMS) => {
                            //Here is a logic to define whether a wms layer has been selected (check-box has been checked or not)
                            //if yes then the checked value of the input field will be true
                            //if no then the checked value of the input field will be false
                            const checked = this.state.checkedWMSLayers.filter(uuid => uuid === wms.uuid).length === 0 ? false : true;

                            const renderAccessModifier = () => {
                                if (wms.access_modifier === "Public" || wms.access_modifier === "Publiek") {
                                    return <div className="access-modifier public">{wms.access_modifier.toUpperCase()}</div>
                                } else if (wms.access_modifier === "Private" || wms.access_modifier === "Privaat") {
                                    return <div className="access-modifier private">{wms.access_modifier.toUpperCase()}</div>
                                } else {
                                    return <div className="access-modifier common">{wms.access_modifier.toUpperCase()}</div>
                                }
                            }

                            return (
                                <li className="raster-list__row-li" key={wms.uuid} onClick={() => selectItem(wms.uuid)} >
                                    <input className="raster-list__row raster-list__row-box" type="checkbox" onChange={() => this.onCheckboxSelect(wms.uuid)} checked={checked} />
                                    <div className="raster-list__row raster-list__row-name">{wms.name}</div>
                                    <div className="raster-list__row raster-list__row-org">{wms.organisation && wms.organisation.name}</div>
                                    <div className="raster-list__row raster-list__row-access">{renderAccessModifier()}</div>
                                </li>
                            )
                        })}
                    </ul>
                </div>
                <div className="raster-list__button-container">
                    <div className="raster-list__button-pagination">
                        {!previous ? <button className="raster-list__button-grey">&lsaquo;</button> : <button className="raster-list__button-previous" onClick={() => onPageClick(page - 1)}>&lsaquo;</button>}
                        <ul className="raster-list__button-pagination-ul">
                            <li className="raster-list__button-pagination-li" onClick={() => onPageClick(page - 2)}>{page <= 2 ? null : page - 2}</li>
                            <li className="raster-list__button-pagination-li" onClick={() => onPageClick(page - 1)}>{page <= 1 ? null : page - 1}</li>
                            <li className="raster-list__button-pagination-li raster-list__button-pagination-li-active">{page}</li>
                            <li className="raster-list__button-pagination-li" onClick={() => onPageClick(page + 1)}>{page >= Math.ceil(currentWMSList.count/10) ? null : page + 1}</li>
                            <li className="raster-list__button-pagination-li" onClick={() => onPageClick(page + 2)}>{page >= (Math.ceil(currentWMSList.count/10) - 1) ? null : page + 2}</li>
                        </ul>
                        {!next ? <button className="raster-list__button-grey">&rsaquo;</button> : <button className="raster-list__button-next" onClick={() => onPageClick(page + 1)}>&rsaquo;</button>}
                    </div>
                        <button 
                            className="raster-list__button-basket"
                            disabled={this.state.checkedWMSLayers.length === 0 ? true : false}
                            onClick={addToBasket}
                        >
                            ADD TO BASKET
                        </button>
                </div>
                {/*Notification popup when click on the Add to Basket button*/}
                <div className="raster-list__popup" id="notification">
                    <div className="raster-list__popup-content">
                        <p>Items successfully added to the Basket. Go to your basket to see which items have been added.</p>
                        {/* eslint-disable-next-line */}
                        <a href="#" className="raster-list__popup-close">OK</a>
                    </div>
                </div>
            </div>
        );
    };
};

const mapStateToProps = (state: MyStore, ownProps: MyProps): PropsFromState => {
    if (!ownProps.currentWMSList) return {
        wmsLayers: []
    };
    return {
        wmsLayers: ownProps.currentWMSList.wmsList.map(uuid => getWMS(state, uuid))
    };
};

export default connect(mapStateToProps)(WMSList);