import React from 'react';
import styles from './ProfileDropdown.module.css';

interface MyProps {
  routeCurrentLocationInCatalog: string,
  closeAllDropdowns: () => void,
}

export default function ProfileDropdown (props: MyProps) {
  return (
    <div className={styles.ProfileDropdown} onMouseLeave={props.closeAllDropdowns}>
      <a href={`/accounts/logout/?next=/catalogue/${encodeURIComponent(props.routeCurrentLocationInCatalog)}`}>
        <i className="fa fa-power-off" style={{ paddingRight: "2rem" }} />
        Logout
      </a>
    </div>
  )
}