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

type MyProps = PropsFromState & PropsFromDispatch

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

            //Open the link in a another tab
            window.open(`https://demo.lizard.net/nl/map/topography${urlPath}`);
        };

        return (
            <nav className="header">
                <div className="header-logo">
                    <img src="image/lizard.png" alt="logo" className="header-logo__logo" />
                    <h3 className="header-logo__text">Lizard Catalogue</h3>
                </div>
                <div className="header-nav">
                    <a href="#basket" className="header-nav__icon-box">
                        <svg className="header-nav__icon">
                            <use xlinkHref="image/symbols.svg#icon-cart" />
                        </svg>
                        <span className="header-nav__notification">{basket.length}</span>
                        <span className="header-nav__text">Basket</span>
                    </a>
                    <div className="header-nav__icon-box">
                        <svg className="header-nav__icon">
                            <use xlinkHref="image/symbols.svg#icon-apps" />
                        </svg>
                        <span className="header-nav__text">Apps</span>
                    </div>
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
                        <span className="header-nav__text">Nelen Schuurmans</span>
                    </div>
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
                        <a href="#catalogue" className="header-popup__close">&times;</a>
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