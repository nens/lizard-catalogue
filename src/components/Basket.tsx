import { connect, useSelector } from 'react-redux';
import { openAllInLizard } from './../utils/url';
import { getLocalDateString } from '../utils/dateUtils';
import { removeRasterFromBasket, removeScenarioFromBasket, removeWMSFromBasket } from './../action';
import { getAllRasters, getAllScenarios, getAllWms, getNumberOfItemsInBasket, MyStore } from '../reducers';
import rasterTemporalIcon from './../images/raster-temporal.svg';
import rasterNonTemporalIcon from './../images/raster-non-temporal.svg';
import wmsIcon from './../images/wms.svg';
import scenarioIcon from './../images/3di.svg';
import removeIcon from './../images/remove_shopping_cart.svg';
import styles from './Basket.module.css';

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
        <div className={styles.Basket} id="basket">
            <h3>My selection</h3>
            <div className={styles.BasketUpperLayer}>
                <span className={styles.BasketNumberOfItems}>{numberOfItemsInBasket} items</span>
                <span className={styles.BasketLayerTitle}>Upper layer</span>
            </div>
            <ul className={styles.BasketItems} id="scrollbar">
                {rasters.map(raster => (
                    <li className={styles.BasketItem} key={raster.uuid}>
                        {raster.temporal ?
                            <img className={styles.BasketItemLi} src={rasterTemporalIcon} alt="temporal" /> :
                            <img className={styles.BasketItemLi} src={rasterNonTemporalIcon} alt="non-temporal" />
                        }
                        <div className={`${styles.BasketItemLi} ${styles.BasketItemName}`} title={raster.name}>{raster.name}</div>
                        <div className={`${styles.BasketItemLi} ${styles.BasketItemOrg}`}>{raster.organisation && raster.organisation.name}</div>
                        <div className={`${styles.BasketItemLi} ${styles.BasketItemTime}`}>{getLocalDateString(raster.last_modified)}</div>
                        <div className={`${styles.BasketItemLi} ${styles.BasketItemBasket} ${styles.BasketIconContainer}`} onClick={() => props.removeRasterFromBasket(raster.uuid)}>
                            <img className={styles.BasketIcon} src={removeIcon} alt="remove" />
                        </div>
                    </li>
                ))}
                {wmsLayers.map(wms => (
                    <li className={styles.BasketItem} key={wms.uuid}>
                        <img className={styles.BasketItemLi} src={wmsIcon} alt="wms" />
                        <div className={`${styles.BasketItemLi} ${styles.BasketItemName}`} title={wms.name}>{wms.name}</div>
                        <div className={`${styles.BasketItemLi} ${styles.BasketItemOrg}`}>{wms.organisation && wms.organisation.name}</div>
                        <div className={`${styles.BasketItemLi} ${styles.BasketItemTime}`} />
                        <div className={`${styles.BasketItemLi} ${styles.BasketItemBasket} ${styles.BasketIconContainer}`} onClick={() => props.removeWMSFromBasket(wms.uuid)}>
                            <img className={styles.BasketIcon} src={removeIcon} alt="remove" />
                        </div>
                    </li>
                ))}
                {scenarios.map(scenario => (
                    <li className={styles.BasketItem} key={scenario.uuid}>
                        <img className={styles.BasketItemLi} src={scenarioIcon} alt="wms" />
                        <div className={`${styles.BasketItemLi} ${styles.BasketItemName}`} title={scenario.name}>{scenario.name}</div>
                        <div className={`${styles.BasketItemLi} ${styles.BasketItemOrg}`}>{scenario.organisation && scenario.organisation.name}</div>
                        <div className={`${styles.BasketItemLi} ${styles.BasketItemTime}`}>{getLocalDateString(scenario.last_modified)}</div>
                        <div className={`${styles.BasketItemLi} ${styles.BasketItemBasket} ${styles.BasketIconContainer}`} onClick={() => props.removeScenarioFromBasket(scenario.uuid)}>
                            <img className={styles.BasketIcon} src={removeIcon} alt="remove" />
                        </div>
                    </li>
                ))}
            </ul>
            <p className={styles.BasketLowerLayer}>Lower layer</p>
            <button
                className={styles.BasketButton}
                disabled={!numberOfItemsInBasket}
                onClick={() => openAllInLizard(rasters, wmsLayers, scenarios)}
            >
                Open all data in Lizard
            </button>
            {/* eslint-disable-next-line */}
            <a href="#" className={styles.BasketClose}>&times;</a>
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