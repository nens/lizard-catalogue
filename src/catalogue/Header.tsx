import * as React from 'react';
import { connect } from 'react-redux';
import { MyStore, getRaster, getWMS } from '../reducers';
import { Raster, Bootstrap, WMS } from '../interface';
import Basket from './components/Basket';
import Information from './components/Information';
import Export from './components/Export';
import './styles/Header.css';

interface MyProps {
    showProfileDropdown: boolean,
    toggleProfileDropdown: (event) => void
};

interface PropsFromState {
    rasters: Raster[],
    wmsLayers: WMS[],
    user: Bootstrap['user']
};

class Header extends React.Component<MyProps & PropsFromState> {
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
        const { rasters, wmsLayers, user } = this.props;
        const basket = [...rasters, ...wmsLayers];

        return (
            <nav className="header">
                <div className="header-logo">
                    <img src="image/lizard.png" alt="logo" className="header-logo__logo" onClick={() => window.location.href = ""} />
                    <h3 className="header-logo__text">Lizard Catalogue</h3>
                </div>
                <div className="header-nav">
                    <a href="#export" className="header-nav__icon-box" style={{marginRight: "5rem"}}>
                        <svg className="header-nav__icon">
                            <use xlinkHref="image/symbols.svg#icon-download" />
                        </svg>
                        <span className="header-nav__notification">!</span>
                        <span className="header-nav__text">Export</span>
                    </a>
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
                <div className="header-basket" id="basket">
                    <Basket
                        rasters={rasters}
                        wmsLayers={wmsLayers}
                        basket={basket}
                    />
                </div>
                {/*This is the PopUp window for the Information box*/}
                <div className="header-information-box" id="information">
                    <Information />
                </div>
                {/*This is the PopUp window for the export screen*/}
                <div className="header-export" id="export">
                    <Export />
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

export default connect(mapStateToProps)(Header);