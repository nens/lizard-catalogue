import * as React from 'react';
import { connect } from 'react-redux';
import { MyStore, getRaster } from '../reducers';
import { removeItem } from '../action';
import { Raster, LatLng } from '../interface';
import './Header.css';

import { zoomLevelCalculation, getCenterPoint } from '../utils/latLngZoomCalculation';
import { openRastersInLizard } from '../utils/openRaster';

interface PropsFromState {
    basket: Raster[]
};

interface PropsFromDispatch {
    removeItem: (raster: Raster) => void
};

type MyProps = PropsFromState & PropsFromDispatch;

class Header extends React.Component<MyProps> {
    render() {
        const { basket, removeItem } = this.props;

        //Open All Data button will open all rasters in Lizard Client
        //with projection of the last selected raster
        const openInLizard = (basket: PropsFromState['basket']) => {
            //Get the last selected raster in the basket which is the first item in the basket array
            const lastSelectedRaster = basket[0];

            //Get the spatial bounds of the last selected raster, if spatial_bounds is null then set it to the global map
            const { north, east, south, west } = lastSelectedRaster.spatial_bounds ?
                lastSelectedRaster.spatial_bounds : { north: 85, east: 180, south: -85, west: -180 };

            //Get the center point of the raster based on its spatial bounds
            const centerPoint: LatLng = getCenterPoint(north, east, south, west);

            //Calculate the zoom level of the last selected raster by using the zoomLevelCalculation function
            const zoom = zoomLevelCalculation(north, east, south, west);
            
            openRastersInLizard(basket, centerPoint, zoom);
        };

        return (
            <nav className="header">
                <div className="header-logo">
                    <img src="image/lizard.png" alt="logo" className="header-logo__logo" onClick={() => window.location.href = ""} />
                    <h3 className="header-logo__text">Lizard Catalogue</h3>
                </div>
                <div className="header-nav">
                    <a href="#basket" className="header-nav__icon-box" title={`${basket.length} items in the basket`}>
                        <svg className="header-nav__icon">
                            <use xlinkHref="image/symbols.svg#icon-cart" />
                        </svg>
                        {basket.length === 0 ? <span /> : <span className="header-nav__notification">{basket.length}</span>}
                        <span className="header-nav__text">Basket</span>
                    </a>
                    {/* <div className="header-nav__icon-box">
                        <svg className="header-nav__icon">
                            <use xlinkHref="image/symbols.svg#icon-apps" />
                        </svg>
                        <span className="header-nav__text">Apps</span>
                    </div> */}
                    <div className="header-nav__icon-box">
                        <svg className="header-nav__icon">
                            <use xlinkHref="image/symbols.svg#icon-user" />
                        </svg>
                        <span className="header-nav__text">User</span>
                    </div>
                    <div className="header-nav__icon-box">
                        <svg className="header-nav__icon">
                            <use xlinkHref="image/symbols.svg#icon-sort" />
                        </svg>
                        <span className="header-nav__text">Nelen &amp; Schuurmans</span>
                    </div>
                    <a href="#information" className="header-nav__icon-box" title="Info">
                        <svg className="header-nav__icon info-box">
                            <use xlinkHref="image/symbols.svg#icon-info" />
                        </svg>
                    </a>
                </div>
                {/*This is the PopUp window when the basket is clicked*/}
                <div className="header-popup" id="basket">
                    <div className="header-popup__content">
                        <h3>My selection</h3>
                        <div className="header-popup__content-bovenste-laag">
                            <span className="header-popup__content-item">{basket.length} items</span>
                            <span className="header-popup__content-layer-title">Bovenste laag</span>
                        </div>
                        <ul className="header-popup__content-ul">
                            {basket.map(raster => (
                                <li className="header-popup__content-li" key={raster.uuid}>
                                    {raster.temporal ?
                                        <img className="li li-type" src="image/raster-temporal.svg" alt="raster" /> :
                                        <img className="li li-type" src="image/raster-non-temporal.svg" alt="raster" />
                                    }
                                    <div className="li li-name">{raster.name}</div>
                                    <div className="li li-org">{raster.organisation && raster.organisation.name}</div>
                                    <div className="li li-obs">{raster.observation_type && raster.observation_type.parameter}</div>
                                    <div className="li li-time">{new Date(raster.last_modified).toLocaleDateString()}</div>
                                    <div className="li li-basket li-basket__icon-box" onClick={() => removeItem(raster)}>
                                        <svg className="li-basket__icon">
                                            <use xlinkHref="image/symbols.svg#icon-remove_shopping_cart" />
                                        </svg>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <p className="header-popup__content-onderste-laag">Onderste laag</p>
                        <button
                            className="header-popup__content-button raster-list__button-basket"
                            disabled={basket.length === 0 ? true : false}
                            onClick={() => openInLizard(basket)}
                        >
                            Open all data in Lizard
                        </button>
                        {/* eslint-disable-next-line */}
                        <a href="#" className="header-popup__close">&times;</a>
                    </div>
                </div>
                {/*This is the PopUp window for the Information box*/}
                <div className="header-information-box" id="information">
                    <div className="header-information-box__main">
                        <div className="header-information-box__main__top">
                            <h4>Information</h4>
                            <div className="header-information-box__main__content">
                                <p>Welcome to the Lizard Catalogue!</p>
                                <p>
                                    This catalogue provides you a detailed overview of all the raster datasets in Lizard.
                                    You're able to search for datasets, filter them per organisation, view detailed metadata and open datasets in the Lizard Portal and the Lizard API.
                                </p>
                            </div>
                        </div>
                        <div className="header-information-box__footer">
                            <a href="/static_media/documents/privacy.pdf" target="_blank">Privacy Statement</a>
                            <button onClick={() => window.location.href = '#'}>Close</button>
                        </div>
                        {/* eslint-disable-next-line */}
                        <a href="#" className="header-information-box__close">&times;</a>
                    </div>
                </div>
            </nav >
        );
    };
};

const mapStateToProps = (state: MyStore): PropsFromState => {
    return {
        //Get all the rasters by their uuid from the basket and reverse the order
        //so the last selected raster will appear on top of the list
        //and the first selected raster will appear at the bottom of the list
        basket: state.basket.map(uuid => getRaster(state, uuid)).reverse()
    };
};

const mapDispatchToProps = (dispatch): PropsFromDispatch => ({
    removeItem: (raster: Raster) => removeItem(raster, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);