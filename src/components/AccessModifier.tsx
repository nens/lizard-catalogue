import React from 'react';
import styles from './AccessModifier.module.css';

interface MyProps {
  accessModifier: string
}

const getAccessModifierStyles = (accessModifier: string) => {
  if (accessModifier === "Public" || accessModifier === "Publiek") {
    return styles.Public;
  } else if (accessModifier === "Private" || accessModifier === "Privaat") {
    return styles.Private;
  } else {
    return styles.Common;
  };
};

export default function AccessModifier (props: MyProps) {
  const { accessModifier } = props;
  return (
    <div
      className={`${styles.AccessModifier} ${getAccessModifierStyles(accessModifier)}`}
    >
      {accessModifier.toUpperCase()}
    </div>
  )
}