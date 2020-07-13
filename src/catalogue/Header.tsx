import * as React from 'react';
import { connect } from 'react-redux';
import { MyStore, getRaster, getWMS } from '../reducers';
import { Raster, Bootstrap, WMS, Message } from '../interface';
import Basket from './components/Basket';
import Information from './components/Information';
import './styles/Header.css';
import Inbox from './components/Inbox';

interface MyProps {
    showProfileDropdown: boolean,
    showInboxDropdown: boolean,
    toggleAlertMessage: () => void,
    openProfileDropdown: () => void,
    openInboxDropdown: () => void,
    closeAllDropdowns: () => void,
};

interface PropsFromState {
    rasters: Raster[],
    wmsLayers: WMS[],
    user: Bootstrap['user'],
    inbox: Message[],
};

class Header extends React.Component<MyProps & PropsFromState> {
    renderProfileDropdown() {
        return (
            <div className="user-profile_dropdown" onMouseLeave={this.props.closeAllDropdowns}>
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
        const { rasters, wmsLayers, user, inbox, openInboxDropdown, openProfileDropdown, closeAllDropdowns } = this.props;
        const basket = [...rasters, ...wmsLayers];

        const routeCurrentLocationInCatalog = window.location.href.split('?')[1] ?  
          "?" + window.location.href.split('?')[1]
          :  
          "";
        console.log('routeCurrentLocationInCatalog', routeCurrentLocationInCatalog);

        return (
            <nav className="header">
                <div className="header-logo">
                    <img src="image/lizard-logo-white.svg" alt="logo" className="header-logo__logo" onClick={() => window.location.href = ""} />
                    <h3 className="header-logo__text">Catalogue</h3>
                </div>
                <div className="header-nav">
                    <div className="header-nav__icon-box inbox-dropdown" onClick={openInboxDropdown}>
                        <svg className="header-nav__icon">
                            <use xlinkHref="image/symbols.svg#icon-download" />
                        </svg>
                        {inbox.length === 0 ? <span /> : <span className="header-nav__notification">{inbox.length}</span>}
                        <span className="header-nav__inbox-text" style={{marginLeft: "1rem"}}>Export</span>
                        {
                        this.props.showInboxDropdown && (
                            <Inbox
                                inbox={inbox}
                                closeAllDropdowns={closeAllDropdowns}
                            />
                        )}
                    </div>
                    <a href="#basket" className="header-nav__icon-box" title={`${basket.length } items in the basket`}>
                        <svg className="header-nav__icon">
                            <use xlinkHref="image/symbols.svg#icon-shopping-basket" />
                        </svg>
                        {basket.length === 0 ? <span /> : <span className="header-nav__notification">{basket.length}</span>}
                        <span className="header-nav__text">Basket</span>
                    </a>
                    {user.authenticated ?
                        <div className="header-nav__icon-box user-profile" onClick={openProfileDropdown}>
                            <svg className="header-nav__icon">
                                <use xlinkHref="image/symbols.svg#icon-user" />
                            </svg>
                            <span className="header-nav__text">{user.first_name}</span>
                            {this.props.showProfileDropdown && this.renderProfileDropdown()}
                        </div>
                        :
                        <a href={`/accounts/login/?next=/catalogue/${encodeURIComponent(routeCurrentLocationInCatalog)}`} className="header-nav__icon-box user-profile">
                            <svg className="header-nav__icon">
                                <use xlinkHref="image/symbols.svg#icon-user" />
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
                <div className="modal" id="basket">
                    <Basket
                        rasters={rasters}
                        wmsLayers={wmsLayers}
                        basket={basket}
                    />
                </div>
                {/*This is the PopUp window for the Information box*/}
                <div className="modal" id="information">
                    <Information />
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
        user: state.bootstrap.user,
        //Get inbox messages
        inbox: state.inbox,
    };
};

export default connect(mapStateToProps)(Header);