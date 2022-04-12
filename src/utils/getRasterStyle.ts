import { Raster } from "../interface";

export const getRasterStyle = (raster: Raster): Raster => {
  // There is an exception with Regen raster as its WMS layer name and style
  // when sending request to get the WMS tile layer is not the same as other rasters
  // for regen, we should request for either "radar:5min" or "radar:hour" or "radar:day" for layers
  // and either "radar-5min" or "radar-hour" or "radar-day" for styles
  // Since the default value used in lizard-client is radar:hour, we will hardcode "radar:hour"
  // as regen's wms layer name and "radar-hour" as its styles
  // the UUID of regen raster on staging is "3e5f56a7-b16e-4deb-8449-cc2c88805159"
  // and on production is "730d6675-35dd-4a35-aa9b-bfb8155f9ca7"
  if (raster.uuid === "3e5f56a7-b16e-4deb-8449-cc2c88805159" || raster.uuid === "730d6675-35dd-4a35-aa9b-bfb8155f9ca7") {
    return {
      ...raster,
      options: {
        styles: "radar-hour"
      },
      wms_info: {
        ...raster.wms_info,
        layer: "radar:hour"
      }
    };
  };

  return raster;
};