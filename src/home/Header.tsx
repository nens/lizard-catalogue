import React from 'react';
import { useSelector } from 'react-redux';
import { getLizardBootstrap, getInbox, getNumberOfItemsInBasket } from '../reducers';
import ProfileDropdown from '../components/ProfileDropdown';
import Basket from '../components/Basket';
import Information from '../components/Information';
import Inbox from '../components/Inbox';
import packageJson from '../../package.json';
import lizardLogo from '../images/lizard-logo.svg';
import exportIcon from '../images/download.svg';
import basketIcon from '../images/shopping-basket.svg';
import userIcon from '../images/user.svg';
import infoIcon from '../images/info.svg';
import '../styles/Header.css';

interface MyProps {
    showProfileDropdown: boolean,
    showInboxDropdown: boolean,
    openProfileDropdown: () => void,
    openInboxDropdown: () => void,
    closeAllDropdowns: () => void,
}

export default function Header (props: MyProps) {
    const user = useSelector(getLizardBootstrap).user;
    const inbox = useSelector(getInbox);
    const numberOfItemsInBasket = useSelector(getNumberOfItemsInBasket);

    const routeCurrentLocationInCatalog = window.location.href.split('?')[1] ? "?" + window.location.href.split('?')[1] : "";

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
                <div className="header-nav__icon-box inbox-dropdown" onClick={props.openInboxDropdown}>
                    <img src={exportIcon} alt="export" className="header-nav__icon" />
                    {inbox.length === 0 ? <span /> : <span className="header-nav__notification">{inbox.length}</span>}
                    <span className="header-nav__inbox-text" style={{marginLeft: "1rem"}}>Export</span>
                    {props.showInboxDropdown && (
                        <Inbox
                            inbox={inbox}
                            closeAllDropdowns={props.closeAllDropdowns}
                        />
                    )}
                </div>
                <a href="#basket" className="header-nav__icon-box" title={`${numberOfItemsInBasket} items in the basket`}>
                    <img src={basketIcon} alt="basket" className="header-nav__icon" />
                    {numberOfItemsInBasket ? <span className="header-nav__notification">{numberOfItemsInBasket}</span> : <span />}
                    <span className="header-nav__text">Basket</span>
                </a>
                {user.authenticated ? (
                    <div className="header-nav__icon-box user-profile" onClick={props.openProfileDropdown}>
                        <img src={userIcon} alt="user" className="header-nav__icon" />
                        <span className="header-nav__text">{user.first_name}</span>
                        {props.showProfileDropdown ? (
                            <ProfileDropdown
                                routeCurrentLocationInCatalog={routeCurrentLocationInCatalog}
                                closeAllDropdowns={props.closeAllDropdowns}
                            />
                        ) : null}
                    </div>
                ) : (
                    <a href={`/accounts/login/?next=/catalogue/${encodeURIComponent(routeCurrentLocationInCatalog)}`} className="header-nav__icon-box user-profile">
                        <img src={userIcon} alt="user" className="header-nav__icon" />
                        <span className="header-nav__text">Login</span>
                    </a>
                )}
                <a href="#information" className="header-nav__icon-box" title="Info">
                    <img src={infoIcon} alt="info" className="header-nav__icon" />
                </a>
            </div>
            {/*This is the PopUp window when the basket is clicked*/}
            <div className="modal" id="basket">
                <Basket />
            </div>
            {/*This is the PopUp window for the Information box*/}
            <div className="modal" id="information">
                <Information />
            </div>
        </nav >
    )
}