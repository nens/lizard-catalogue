import * as React from 'react';
import { connect } from 'react-redux';
import { Raster, WMS, LatLng } from '../interface';
import { getCenterPoint, zoomLevelCalculation } from '../utils/latLngZoomCalculation';
import { openAllInLizard } from '../utils/url';
import { removeRasterFromBasket, removeWMSFromBasket } from '../action';
import './styles/Basket.css';

interface PropsFromDispatch {
    removeRasterFromBasket: (uuid: string) => void,
    removeWMSFromBasket: (uuid: string) => void
};

interface MyProps {
    rasters: Raster[],
    wmsLayers: WMS[],
    basket: (Raster | WMS)[],
};

class Basket extends React.Component<PropsFromDispatch & MyProps> {
    //Open All Data button will open all rasters and WMS layers in Lizard Client
    //with projection of the last selected raster
    openInLizard = (rasters: Raster[], wmsLayers: WMS[]) => {
        //Get the last selected raster in the basket which is the first item in the rasters array
        const lastSelectedRaster = rasters.length !== 0 ? rasters[0] : null;

        //Get the spatial bounds of the last selected raster, if spatial_bounds is null then set it to the global map
        const { north, east, south, west } = (lastSelectedRaster && lastSelectedRaster.spatial_bounds) ?
            lastSelectedRaster.spatial_bounds : { north: 85, east: 180, south: -85, west: -180 };

        //Get the center point of the raster based on its spatial bounds
        const centerPoint: LatLng = getCenterPoint(north, east, south, west);

        //Calculate the zoom level of the last selected raster by using the zoomLevelCalculation function
        const zoom = zoomLevelCalculation(north, east, south, west);

        //Open all rasters and WMS layers in Lizard
        openAllInLizard(rasters, centerPoint, zoom, wmsLayers);
    };

    render() {
        const { rasters, wmsLayers, basket, removeRasterFromBasket, removeWMSFromBasket } = this.props;

        return (
            <div className="basket">
                        <h3>My selection</h3>
                        <div className="basket_upper-layer">
                            <span className="basket_number-of-items">{basket.length} items</span>
                            <span className="basket_layer-title">Upper layer</span>
                        </div>
                        <ul className="basket_items">
                            {rasters.map(raster => (
                                <li className="basket_item" key={raster.uuid}>
                                    {raster.temporal ?
                                        <img className="li li-type" src="image/raster-temporal.svg" alt="raster" /> :
                                        <img className="li li-type" src="image/raster-non-temporal.svg" alt="raster" />
                                    }
                                    <div className="li li-name">{raster.name}</div>
                                    <div className="li li-org">{raster.organisation && raster.organisation.name}</div>
                                    {/* <div className="li li-obs">{raster.observation_type && raster.observation_type.parameter}</div> */}
                                    <div className="li li-time">{new Date(raster.last_modified).toLocaleDateString()}</div>
                                    <div className="li li-basket li-basket__icon-box" onClick={() => removeRasterFromBasket(raster.uuid)}>
                                        <svg className="li-basket__icon">
                                            <use xlinkHref="image/symbols.svg#icon-remove_shopping_cart" />
                                        </svg>
                                    </div>
                                </li>
                            ))}
                            {wmsLayers.map(wms => (
                                <li className="basket_item" key={wms.uuid}>
                                    <img className="li li-type" src="image/wms.svg" alt="wms" />
                                    <div className="li li-name">{wms.name}</div>
                                    <div className="li li-org">{wms.organisation && wms.organisation.name}</div>
                                    {/* <div className="li li-obs">{wms.slug}</div> */}
                                    <div className="li li-time" />
                                    <div className="li li-basket li-basket__icon-box" onClick={() => removeWMSFromBasket(wms.uuid)}>
                                        <svg className="li-basket__icon">
                                            <use xlinkHref="image/symbols.svg#icon-remove_shopping_cart" />
                                        </svg>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <p className="basket_lower-layer">Lower layer</p>
                        <button
                            className="basket_button"
                            disabled={basket.length === 0 ? true : false}
                            onClick={() => this.openInLizard(rasters, wmsLayers)}
                        >
                            Open all data in Lizard
                        </button>
                        {/* eslint-disable-next-line */}
                        <a href="#" className="basket_close">&times;</a>
                    </div>
        );
    };
};

const mapDispatchToProps = (dispatch): PropsFromDispatch => ({
    removeRasterFromBasket: (uuid: string) => removeRasterFromBasket(uuid, dispatch),
    removeWMSFromBasket: (uuid: string) => removeWMSFromBasket(uuid, dispatch)
});

export default connect (null, mapDispatchToProps)(Basket);