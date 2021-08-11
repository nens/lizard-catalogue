import React from 'react';
import { connect } from 'react-redux';
import { MyStore, getRaster, getWMS } from '../reducers';
import { Raster, Bootstrap, WMS, Message } from '../interface';
import Basket from './components/Basket';
import Information from './components/Information';
import Inbox from './components/Inbox';
import packageJson from '../../package.json';
import lizardLogo from '../images/lizard-logo.svg';
import exportIcon from '../images/download.svg';
import basketIcon from '../images/shopping-basket.svg';
import userIcon from '../images/user.svg';
import infoIcon from '../images/info.svg';
import './styles/Header.css';

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

const Header: React.FC<MyProps & PropsFromState> = (props) => {
    const { rasters, wmsLayers, user, inbox, openInboxDropdown, openProfileDropdown, closeAllDropdowns } = props;
    const basket = [...rasters, ...wmsLayers];

    const routeCurrentLocationInCatalog = window.location.href.split('?')[1] ? "?" + window.location.href.split('?')[1] : "";

    const renderProfileDropdown = (routeCurrentLocationInCatalog: string) => {
        return (
            <div className="user-profile_dropdown" onMouseLeave={props.closeAllDropdowns}>
                {/* 
                comment this out for ticket:
                https://github.com/nens/lizard-catalogue/issues/252
                */}
                {/* <a
                    href="https://sso.lizard.net/accounts/profile/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <i className="fa fa-pencil" style={{ paddingRight: "2rem" }} />
                    Edit Profile
                </a> */}
                <a href={`/accounts/logout/?next=/catalogue/${encodeURIComponent(routeCurrentLocationInCatalog)}`}>
                    <i className="fa fa-power-off" style={{ paddingRight: "2rem" }} />
                    Logout
                </a>
            </div>
        )
    };

    return (
        <nav className="header">
            <div className="header-logo" title={"client-version: " +packageJson.version}>
                <img src={lizardLogo} alt="logo" className="header-logo__logo" onClick={() => window.location.href = "/"} />
                <h3 className="header-logo__text">Catalogue</h3>
            </div>
            <div className="header-nav">
                <a href="/" className="header-nav__icon-box">
                    <i className="fa fa-home" style={{fontSize: "20px", }} />
                    <span className="header-nav__text">Home</span>
                </a>
                <div className="header-nav__icon-box inbox-dropdown" onClick={openInboxDropdown}>
                    <img src={exportIcon} alt="export" className="header-nav__icon" />
                    {inbox.length === 0 ? <span /> : <span className="header-nav__notification">{inbox.length}</span>}
                    <span className="header-nav__inbox-text" style={{marginLeft: "1rem"}}>Export</span>
                    {props.showInboxDropdown && (
                        <Inbox
                            inbox={inbox}
                            closeAllDropdowns={closeAllDropdowns}
                        />
                    )}
                </div>
                <a href="#basket" className="header-nav__icon-box" title={`${basket.length } items in the basket`}>
                    <img src={basketIcon} alt="basket" className="header-nav__icon" />
                    {basket.length === 0 ? <span /> : <span className="header-nav__notification">{basket.length}</span>}
                    <span className="header-nav__text">Basket</span>
                </a>
                {user.authenticated ?
                    <div className="header-nav__icon-box user-profile" onClick={openProfileDropdown}>
                        <img src={userIcon} alt="user" className="header-nav__icon" />
                        <span className="header-nav__text">{user.first_name}</span>
                        {props.showProfileDropdown && renderProfileDropdown(routeCurrentLocationInCatalog)}
                    </div>
                    :
                    <a href={`/accounts/login/?next=/catalogue/${encodeURIComponent(routeCurrentLocationInCatalog)}`} className="header-nav__icon-box user-profile">
                        <img src={userIcon} alt="user" className="header-nav__icon" />
                        <span className="header-nav__text">Login</span>
                    </a>
                }
                <a href="#information" className="header-nav__icon-box" title="Info">
                    <img src={infoIcon} alt="info" className="header-nav__icon" />
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