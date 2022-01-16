import React from 'react';
import { connect, useSelector } from 'react-redux';
import { openAllInLizard } from './../utils/url';
import { getLocalDateString } from '../utils/dateUtils';
import { removeRasterFromBasket, removeScenarioFromBasket, removeWMSFromBasket } from './../action';
import { getAllRasters, getAllScenarios, getAllWms, getNumberOfItemsInBasket, MyStore } from '../reducers';
import rasterTemporalIcon from './../images/raster-temporal.svg';
import rasterNonTemporalIcon from './../images/raster-non-temporal.svg';
import wmsIcon from './../images/wms.svg';
import removeIcon from './../images/remove_shopping_cart.svg';
import '../styles/Basket.css';

const Basket = (props: DispatchProps) => {
    const numberOfItemsInBasket = useSelector(getNumberOfItemsInBasket);
    const allRasters = useSelector(getAllRasters);
    const allWmsLayers = useSelector(getAllWms);
    const allScenarios = useSelector(getAllScenarios);

    // reverse the order so the last selected item will appear on top of the respective list
    const rasters = useSelector((state: MyStore) => state.basket.rasters.map(uuid => allRasters[uuid]).reverse());
    const wmsLayers = useSelector((state: MyStore) => state.basket.wmsLayers.map(uuid => allWmsLayers[uuid]).reverse());
    const scenarios = useSelector((state: MyStore) => state.basket.scenarios.map(uuid => allScenarios[uuid]).reverse());

    return (
        <div className="basket">
            <h3>My selection</h3>
            <div className="basket_upper-layer">
                <span className="basket_number-of-items">{numberOfItemsInBasket} items</span>
                <span className="basket_layer-title">Upper layer</span>
            </div>
            <ul className="basket_items" id="scrollbar">
                {rasters.map(raster => (
                    <li className="basket_item" key={raster.uuid}>
                        {raster.temporal ?
                            <img className="li li-type" src={rasterTemporalIcon} alt="temporal" /> :
                            <img className="li li-type" src={rasterNonTemporalIcon} alt="non-temporal" />
                        }
                        <div className="li li-name">{raster.name}</div>
                        <div className="li li-org">{raster.organisation && raster.organisation.name}</div>
                        <div className="li li-time">{getLocalDateString(raster.last_modified)}</div>
                        <div className="li li-basket li-basket__icon-box" onClick={() => props.removeRasterFromBasket(raster.uuid)}>
                            <img className="li-basket__icon" src={removeIcon} alt="remove" />
                        </div>
                    </li>
                ))}
                {wmsLayers.map(wms => (
                    <li className="basket_item" key={wms.uuid}>
                        <img className="li li-type" src={wmsIcon} alt="wms" />
                        <div className="li li-name">{wms.name}</div>
                        <div className="li li-org">{wms.organisation && wms.organisation.name}</div>
                        <div className="li li-time" />
                        <div className="li li-basket li-basket__icon-box" onClick={() => props.removeWMSFromBasket(wms.uuid)}>
                            <img className="li-basket__icon" src={removeIcon} alt="remove" />
                        </div>
                    </li>
                ))}
                {scenarios.map(scenario => (
                    <li className="basket_item" key={scenario.uuid}>
                        <img className="li li-type" src={rasterNonTemporalIcon} alt="wms" />
                        <div className="li li-name">{scenario.name}</div>
                        <div className="li li-org">{scenario.organisation && scenario.organisation.name}</div>
                        <div className="li li-time">{getLocalDateString(scenario.last_modified)}</div>
                        <div className="li li-basket li-basket__icon-box" onClick={() => props.removeScenarioFromBasket(scenario.uuid)}>
                            <img className="li-basket__icon" src={removeIcon} alt="remove" />
                        </div>
                    </li>
                ))}
            </ul>
            <p className="basket_lower-layer">Lower layer</p>
            <button
                className="basket_button"
                disabled={!numberOfItemsInBasket}
                onClick={() => openAllInLizard(rasters, wmsLayers, scenarios)}
            >
                Open all data in Lizard
            </button>
            {/* eslint-disable-next-line */}
            <a href="#" className="basket_close">&times;</a>
        </div>
    );
};

const mapDispatchToProps = (dispatch) => ({
    removeRasterFromBasket: (uuid: string) => removeRasterFromBasket(uuid, dispatch),
    removeWMSFromBasket: (uuid: string) => removeWMSFromBasket(uuid, dispatch),
    removeScenarioFromBasket: (uuid: string) => removeScenarioFromBasket(uuid, dispatch)
});
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

export default connect(null, mapDispatchToProps)(Basket);