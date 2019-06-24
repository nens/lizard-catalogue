import * as React from 'react';
import { connect } from 'react-redux';
import { MyStore, getRaster } from '../reducers';
import { removeItem } from '../action';
import { Raster } from '../interface';
import './Header.css';

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

        //onClick function for the Open All Data button
        const onClick = (basket: PropsFromState['basket']) => {
            //create an array of short ID of all the rasters in the basket
            const idArray = basket.map(raster => raster.uuid.substr(0, 7));

            //create the url path to display all the rasters in the basket on the map
            //the format of the url is something like: ',raster$rasterID1,raster$rasterID2,...,raster$rasterIDn'
            const urlPath = idArray.map(id => `,raster$${id}`).join('');

            //Open the link in another tab with projection of the last selected raster
                //Get the last selected raster in the basket
                const lastSelectedRaster = basket[basket.length - 1];

                //Get the spatial bounds of the last selected raster, if spatial_bounds is null then set it to the global map
                const { north, east, south, west } = lastSelectedRaster.spatial_bounds ? 
                    lastSelectedRaster.spatial_bounds : {north: 85, east: 180, south: -85, west: -180};

                //Calculate the latitude and longitude based on the spatial bounds
                const rasterLat = (west + east)/2;
                const rasterLong = (north + south)/2;

                //Get the zoom level based on 4 spatial bounds
                //Get reference from stackoverflow on how to calculate the zoom level: 
                //https://stackoverflow.com/questions/6048975/google-maps-v3-how-to-calculate-the-zoom-level-for-a-given-bounds
                const GLOBE_WIDTH = 256; //a constant in Google's map projection
                let angle = east - west;
                if (angle < 0) angle += 360;
                let angle2 = north - south;
                if (angle2 > angle) angle = angle2;
                const zoom = Math.round(Math.log(960 * 360 / angle / GLOBE_WIDTH) / Math.LN2);

            window.open(`https://demo.lizard.net/nl/map/topography${urlPath}/point/@${rasterLong},${rasterLat},${zoom}`);
            //If open all rasters with the projection of the globe then use:
            //window.open(`https://demo.lizard.net/nl/map/topography${urlPath}/point/@0.1,-0.1,2`);
        };

        return (
            <nav className="header">
                <div className="header-logo">
                    <img src="image/lizard.png" alt="logo" className="header-logo__logo" />
                    <h3 className="header-logo__text">Lizard Catalogue</h3>
                </div>
                <div className="header-nav">
                    <a href="#basket" className="header-nav__icon-box" title={`${basket.length} items in the basket`}>
                        <svg className="header-nav__icon">
                            <use xlinkHref="image/symbols.svg#icon-cart" />
                        </svg>
                        <span className="header-nav__notification">{basket.length}</span>
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
                                    <div className="li li-org">{raster.organisation.name}</div>
                                    <div className="li li-obs">{raster.observation_type.parameter}</div>
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
                        {basket.length === 0 ?
                            <button className="header-popup__content-button raster-list__button-basket raster-list__button-basket-grey">Open all data in Lizard</button> :
                            <button className="header-popup__content-button raster-list__button-basket" onClick={() => onClick(basket)}>Open all data in Lizard</button>
                        }
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
                            <button onClick={() => window.location.href='#'}>Close</button>
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
        basket: state.basket.map(uuid => getRaster(state, uuid))
    };
};

const mapDispatchToProps = (dispatch): PropsFromDispatch => ({
    removeItem: (raster: Raster) => removeItem(raster, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);