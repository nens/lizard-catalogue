import * as React from 'react';
import { connect } from 'react-redux';
import { MyStore, getRaster, getWMS } from '../reducers';
import { removeRasterFromBasket, removeWMSFromBasket } from '../action';
import { Raster, LatLng, Bootstrap, WMS } from '../interface';
import './styles/Header.css';

import { zoomLevelCalculation, getCenterPoint, getBounds } from '../utils/latLngZoomCalculation';
import { openAllInLizard } from '../utils/url';

interface MyProps {
    showProfileDropdown: boolean,
    toggleProfileDropdown: (event) => void
};

interface PropsFromState {
    rasters: Raster[],
    wmsLayers: WMS[],
    user: Bootstrap['user']
};

interface PropsFromDispatch {
    removeRasterFromBasket: (uuid: string) => void,
    removeWMSFromBasket: (uuid: string) => void
};

type HeaderProps = MyProps & PropsFromState & PropsFromDispatch;

class Header extends React.Component<HeaderProps> {
    //Open All Data button will open all rasters and WMS layers in Lizard Client
    //with projection of the last selected raster
    openInLizard = (rasters: Raster[], wmsLayers: WMS[]) => {
        //Get the last selected raster in the basket or last selected WMS layer if there is no raster
        let lastSelectedObject: Raster | WMS | null = null;

        //The first item in the rasters/WMS layers array is the last selected object
        if (rasters.length > 0) {
            lastSelectedObject = rasters[0];
        } else if (wmsLayers.length > 0) {
            lastSelectedObject = wmsLayers[0];
        };

        //Get the spatial bounds of the last selected object,
        //if lastSelectedObject is null then set it to the global map
        const bounds = lastSelectedObject ? getBounds(lastSelectedObject) : {
            north: 85, east: 180, south: -85, west: -180
        };

        //Get the center point of the raster based on its spatial bounds
        const centerPoint: LatLng = getCenterPoint(bounds);

        //Calculate the zoom level of the last selected raster by using the zoomLevelCalculation function
        const zoom = zoomLevelCalculation(bounds);

        //Open all rasters and WMS layers in Lizard
        openAllInLizard(rasters, centerPoint, zoom, wmsLayers);
    };

    renderProfileDropdown() {
        return (
            <div className="user-profile_dropdown" onMouseLeave={this.props.toggleProfileDropdown}>
                <a
                    href="https://sso.lizard.net/accounts/profile/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <i className="fa fa-pencil" style={{ paddingRight: "2rem" }} />
                    Edit Profile
                </a>
                <a href="/accounts/logout/?next=/catalogue/">
                    <i className="fa fa-power-off" style={{ paddingRight: "2rem" }} />
                    Logout
                </a>
            </div>
        )
    };

    render() {
        const { rasters, wmsLayers , removeRasterFromBasket, removeWMSFromBasket, user } = this.props;
        const basket = [...rasters, ...wmsLayers];

        return (
            <nav className="header">
                <div className="header-logo">
                    <img src="image/lizard.png" alt="logo" className="header-logo__logo" onClick={() => window.location.href = ""} />
                    <h3 className="header-logo__text">Lizard Catalogue</h3>
                </div>
                <div className="header-nav">
                    <a href="#basket" className="header-nav__icon-box" title={`${basket.length } items in the basket`}>
                        <svg className="header-nav__icon">
                            <use xlinkHref="image/symbols.svg#icon-shopping-basket" />
                        </svg>
                        {basket.length === 0 ? <span /> : <span className="header-nav__notification">{basket.length}</span>}
                        <span className="header-nav__text">Basket</span>
                    </a>
                    {user.authenticated ?
                        <div className="header-nav__icon-box user-profile" id="user-profile">
                            <svg className="header-nav__icon" id="user-profile">
                                <use xlinkHref="image/symbols.svg#icon-user" id="user-profile" />
                            </svg>
                            <span className="header-nav__text" id="user-profile">{user.first_name}</span>
                            {this.props.showProfileDropdown && this.renderProfileDropdown()}
                        </div>
                        :
                        <a href="/accounts/login/?next=/catalogue/" className="header-nav__icon-box user-profile">
                            <svg className="header-nav__icon" id="user-profile">
                                <use xlinkHref="image/symbols.svg#icon-user" id="user-profile" />
                            </svg>
                            <span className="header-nav__text">Login</span>
                        </a>
                    }
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
                            <span className="header-popup__content-layer-title">Upper layer</span>
                        </div>
                        <ul className="header-popup__content-ul">
                            {rasters.map(raster => (
                                <li className="header-popup__content-li" key={raster.uuid}>
                                    {raster.temporal ?
                                        <img className="li li-type" src="image/raster-temporal.svg" alt="raster" /> :
                                        <img className="li li-type" src="image/raster-non-temporal.svg" alt="raster" />
                                    }
                                    <div className="li li-name">{raster.name}</div>
                                    <div className="li li-org">{raster.organisation && raster.organisation.name}</div>
                                    {/* <div className="li li-obs">{raster.observation_type && raster.observation_type.parameter}</div> */}
                                    <div className="li li-time">{new Date(raster.last_modified).toLocaleDateString()}</div>
                                    <div className="li li-basket li-basket__icon-box" onClick={() => removeRasterFromBasket(raster.uuid)}>
                                        <svg className="li-basket__icon">
                                            <use xlinkHref="image/symbols.svg#icon-remove_shopping_cart" />
                                        </svg>
                                    </div>
                                </li>
                            ))}
                            {wmsLayers.map(wms => (
                                <li className="header-popup__content-li" key={wms.uuid}>
                                    <img className="li li-type" src="image/wms.svg" alt="wms" />
                                    <div className="li li-name">{wms.name}</div>
                                    <div className="li li-org">{wms.organisation && wms.organisation.name}</div>
                                    {/* <div className="li li-obs">{wms.slug}</div> */}
                                    <div className="li li-time" />
                                    <div className="li li-basket li-basket__icon-box" onClick={() => removeWMSFromBasket(wms.uuid)}>
                                        <svg className="li-basket__icon">
                                            <use xlinkHref="image/symbols.svg#icon-remove_shopping_cart" />
                                        </svg>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <p className="header-popup__content-onderste-laag">Lower layer</p>
                        <button
                            className="header-popup__content-button"
                            disabled={basket.length === 0 ? true : false}
                            onClick={() => this.openInLizard(rasters, wmsLayers)}
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
                                    You can search for datasets, filter them per organisation, view detailed metadata and open datasets in the Lizard Portal and the Lizard API.
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
        rasters: state.basket.rasters.map(uuid => getRaster(state, uuid)).reverse(),
        wmsLayers: state.basket.wmsLayers.map(uuid => getWMS(state, uuid)).reverse(),
        //Get user
        user: state.bootstrap.user
    };
};

const mapDispatchToProps = (dispatch): PropsFromDispatch => ({
    removeRasterFromBasket: (uuid: string) => removeRasterFromBasket(uuid, dispatch),
    removeWMSFromBasket: (uuid: string) => removeWMSFromBasket(uuid, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);