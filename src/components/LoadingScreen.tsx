import MDSpinner from 'react-md-spinner';
import styles from '../styles/List.module.css';

export default function LoadingScreen () {
  return (
    <div className={`${styles.List} ${styles.LoadingScreen}`}><MDSpinner size={50} /></div>
  )
}