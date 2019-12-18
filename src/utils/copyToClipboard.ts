export const copyToClipboard = (value: string | null) => {
    if (!value) return null;
    const dummy = document.createElement("input");
    document.body.appendChild(dummy);
    dummy.setAttribute('value', value);
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
};