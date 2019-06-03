import * as React from 'react';
import './Header.css';

class Header extends React.Component {
    render() {
        return (
            <nav className="header">
                <div className="header-logo">
                    <img src="image/lizard.png" alt="logo" className="header-logo__logo"/>
                    <h3 className="header-logo__text">Lizard Catalogue</h3>
                </div>
                <div className="header-nav">
                    <div className="header-nav__icon-box">
                        <svg className="header-nav__icon">
                            <use xlinkHref="image/symbols.svg#icon-cart" />
                        </svg>
                        <span className="header-nav__notification">116</span>
                    </div>
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
                        <span className="header-nav__text">Jan de Vries</span>
                    </div>
                    <div className="header-nav__icon-box">
                        <svg className="header-nav__icon">
                            <use xlinkHref="image/symbols.svg#icon-sort" />
                        </svg>
                        <span className="header-nav__text">Nelen Schuurmans</span>
                    </div>
                </div>
            </nav>
        );
    };
};

export default Header;