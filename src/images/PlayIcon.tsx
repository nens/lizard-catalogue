import React, { FC } from 'react';
import styles from './PlayIcon.module.css';

interface MyProps {
  disabled?: boolean
}

const PlayIcon: FC<MyProps> = ({ disabled }) => {
  return (
    <div
      className={styles.OuterCircle}
      style={{
        backgroundColor: disabled ? "#BFBFBF" : undefined
      }}
    >
      <div className={styles.InnerCircle}>
        <div
          className={styles.PlayIcon}
          style={{
            borderLeftColor: disabled ? "#BFBFBF" : undefined
          }}
        />
      </div>
    </div>
  )
}

export default PlayIcon;