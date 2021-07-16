const getRelativePathFromUrl = (url: string) => {
    // Split the URL on "lizard.net" as it is contained in both nxt3.staging.lizard.net/api/v4
    // and demo.lizard.net/api/v4 to get the relative URL to the API (e.g. /api/v4/...)
    return url.split("lizard.net")[1];
};

export const paginatedFetchHelper = async (url: string, previousResults: any[]): Promise<any> => {
    if (!url) return;

    try {
        const response = await fetch(url, { credentials: "same-origin" });

        if (response.status !== 200) {
            console.error(`Failed to send GET request to ${url} with status: `, response.status);
            return;
        };

        const data = await response.json();
        const results = previousResults.concat(data.results);

        if (data.next) {
            return await paginatedFetchHelper(getRelativePathFromUrl(data.next), results);
        };

        return results;
    } catch (e) {
        console.error(e);
        return;
    };
};