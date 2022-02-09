import PlayIcon from '../images/PlayIcon';
import styles from './Action.module.css';

interface MyProps {
  title: string,
  description: string,
  tooltip?: string,
  disabled?: boolean,
  onClick?: () => void,
}

const Action: React.FC<MyProps> = ({
  title,
  description,
  tooltip,
  disabled,
  onClick
}) => {
  return (
    <div className={styles.ActionContainer}>
      <button
        className={styles.ActionButton}
        onClick={onClick}
        title={tooltip || 'Click to open'}
        style={{
          cursor: disabled ? 'not-allowed' : undefined
        }}
        disabled={disabled}
      >
        <PlayIcon disabled={disabled} />
      </button>
      <div className={styles.ActionTextBox}>
        <span className={styles.ActionTitle}>{title}</span>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default Action;