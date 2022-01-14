export const getUtcString = (value: string) => {
  const dateObject = new Date(value);
  return dateObject.toUTCString();
};

export const getLocalDateString = (value: string) => {
  const dateObject = new Date(value);
  return dateObject.toLocaleDateString();
};

export const getLocalString = (value: string) => {
  const dateObject = new Date(value);
  return dateObject.toLocaleString();
};