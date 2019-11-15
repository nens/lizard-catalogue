import * as React from 'react';
import { connect } from 'react-redux';
import { Raster, WMS, LatLng } from '../interface';
import { getCenterPoint, zoomLevelCalculation, getBounds } from '../utils/latLngZoomCalculation';
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
    //with projection of the last selected raster or WMS layer
    openInLizard = (rasters: Raster[], wmsLayers: WMS[]) => {
        //Get the last selected raster in the basket or last selected WMS layer if there is no raster
        let lastSelectedObject: Raster | WMS | null = null;

        //The first item in the rasters/WMS layers array is the last selected object
        if (rasters.length > 0) {
            lastSelectedObject = rasters[0];
        } else if (wmsLayers.length > 0) {
            lastSelectedObject = wmsLayers[0];
        };

        //Get the spatial bounds of the last selected object,
        //if lastSelectedObject is null then set it to the global map
        const bounds = lastSelectedObject ? getBounds(lastSelectedObject) : {
            north: 85, east: 180, south: -85, west: -180
        };

        //Get the center point based on its spatial bounds
        const centerPoint: LatLng = getCenterPoint(bounds);

        //Calculate the zoom level by using the zoomLevelCalculation function
        const zoom = zoomLevelCalculation(bounds);

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

export default connect(null, mapDispatchToProps)(Basket);