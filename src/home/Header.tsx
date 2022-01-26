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
import styles from './Header.module.css';
import '../styles/Modal.css';

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
        <nav className={styles.Header}>
            <div className={styles.HeaderLogo} title={"client-version: " +packageJson.version}>
                <img src={lizardLogo} alt="logo" className="header-logo__logo" onClick={() => window.location.href = "/"} />
                <h3 className={styles.HeaderLogoText}>Catalogue</h3>
            </div>
            <div className={styles.HeaderNav}>
                <a href="/" className={styles.HeaderNav__IconBox}>
                    <i className="fa fa-home" style={{fontSize: "20px", }} />
                    <span className={styles.HeaderNav__Text}>Home</span>
                </a>
                <div className={`${styles.HeaderNav__IconBox} ${styles.InboxDropdown}`} onClick={props.openInboxDropdown}>
                    <img src={exportIcon} alt="export" className={styles.HeaderNav__Icon} />
                    {inbox.length === 0 ? <span /> : <span className={styles.HeaderNav__Notification}>{inbox.length}</span>}
                    <span className={styles.HeaderNav__InboxText} style={{ marginLeft: 10 }}>Export</span>
                    {props.showInboxDropdown ? <Inbox inbox={inbox} /> : null}
                </div>
                <a href="#basket" className={styles.HeaderNav__IconBox} title={`${numberOfItemsInBasket} items in the basket`}>
                    <img src={basketIcon} alt="basket" className={styles.HeaderNav__Icon} />
                    {numberOfItemsInBasket ? <span className={styles.HeaderNav__Notification}>{numberOfItemsInBasket}</span> : <span />}
                    <span className={styles.HeaderNav__Text}>Basket</span>
                </a>
                {user.authenticated ? (
                    <div className={`${styles.HeaderNav__IconBox} ${styles.UserProfile}`} onClick={props.openProfileDropdown}>
                        <img src={userIcon} alt="user" className={styles.HeaderNav__Icon} />
                        <span className={styles.HeaderNav__Text}>{user.first_name}</span>
                        {props.showProfileDropdown ? (
                            <ProfileDropdown
                                routeCurrentLocationInCatalog={routeCurrentLocationInCatalog}
                                closeAllDropdowns={props.closeAllDropdowns}
                            />
                        ) : null}
                    </div>
                ) : (
                    <a href={`/accounts/login/?next=/catalogue/${encodeURIComponent(routeCurrentLocationInCatalog)}`} className={`${styles.HeaderNav__IconBox} ${styles.UserProfile}`}>
                        <img src={userIcon} alt="user" className={styles.HeaderNav__Icon} />
                        <span className={styles.HeaderNav__Text}>Login</span>
                    </a>
                )}
                <a href="#information" className={styles.HeaderNav__IconBox} title="Info">
                    <img src={infoIcon} alt="info" className={styles.HeaderNav__Icon} />
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