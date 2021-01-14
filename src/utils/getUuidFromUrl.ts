export const getUuidFromUrl = (url: string) => {
    // UUID is the last part of the URL
    if (!url) return null;
    if (url.charAt(url.length - 1) !== '/') {
        // Make sure it ends with '/'
        url += '/';
    };
    const urlParts = url.split('/');
    // urlParts's length is at least = 2
    // Return 2nd last element
    return urlParts[urlParts.length - 2];
};

export const getIdFromUrl = (url: string) => {
    // ID is the last part of the URL
    if (url.charAt(url.length - 1) !== '/') {
        // Make sure it ends with '/'
        url += '/';
    };
    const urlParts = url.split('/');
    // urlParts's length is at least = 2
    // Return 2nd last element as number
    return parseInt(urlParts[urlParts.length - 2]);
};