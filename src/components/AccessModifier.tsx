import React from 'react';
import '../styles/List.css';

interface MyProps {
  accessModifier: string
}

// Helper function
const getAccessModifierClassName = (accessModifier: string) => {
  if (accessModifier === "Public" || accessModifier === "Publiek") {
    return "public";
  } else if (accessModifier === "Private" || accessModifier === "Privaat") {
    return "private";
  } else {
    return "common";
  };
};

export default function AccessModifier (props: MyProps) {
  const { accessModifier } = props;
  return (
    <div
      className={`access-modifier ${getAccessModifierClassName(accessModifier)}`}
    >
      {accessModifier.toUpperCase()}
    </div>
  )
}