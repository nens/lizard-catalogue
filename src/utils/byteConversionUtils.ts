export const bytesToMb = (bytes: number) => {
  return (bytes / 1048576).toFixed(2) + ' Mb';
};