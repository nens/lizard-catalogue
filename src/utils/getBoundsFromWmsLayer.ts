import request from 'superagent';
import X2JS from 'x2js';
import { WMS, WMSBounds } from "../interface";

export const getBoundsFromWmsLayer = (wms: WMS, updateWmsBounds: (wmsBounds: WMSBounds) => void) => {
    //This proxy URL is to avoid the request is blocked by CORS or CORB
    //In production, it should be working without the prefix /proxy/
    const proxyUrl = `/proxy/${wms.url}`;

    request
        .get(proxyUrl, {
            request: "getCapabilities"
        })
        .then(response => {
            //response is in XML format so use X2JS library to convert it to JSON format
            const xml2Json = new X2JS();
            const responseInJson: any = xml2Json.xml2js(response.text)
            //Look for the correct WMS layer in the response data
            //Collect all WMS layers availabe in an array
            const wmsLayers = responseInJson && responseInJson.WMS_Capabilities && responseInJson.WMS_Capabilities.Capability.Layer.Layer
            //Filter through the array of WMS layers to find the one that we need by matching layer's name with wms's slug
            const wmsLayer = wmsLayers && wmsLayers.filter(layer => layer.Name === wms.slug || wms.slug.includes(layer.Name))
            //Get the bounding box coordinates of the WMS layer
            //If the wmsLayer cannot be found then return the coordinates of the global map
            //Otherwise, return the coordinates found from the response data
            const wmsBounds = !wmsLayer || wmsLayer.length === 0 ?
                {
                    north: 85,
                    east: 180,
                    south: -85,
                    west: -180,
                }
                :
                {
                    north: parseFloat(wmsLayer[0].EX_GeographicBoundingBox.northBoundLatitude),
                    east: parseFloat(wmsLayer[0].EX_GeographicBoundingBox.eastBoundLongitude),
                    south: parseFloat(wmsLayer[0].EX_GeographicBoundingBox.southBoundLatitude),
                    west: parseFloat(wmsLayer[0].EX_GeographicBoundingBox.westBoundLongitude),
                };
            //Set the wmsBounds state with these new values using the updateWmsBounds() function
            updateWmsBounds(wmsBounds);
        })
        .catch(e => console.log(e));
};