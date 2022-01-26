import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getLizardBootstrap, getOrganisations, getSelectedItem, getWMS, MyStore } from '../../reducers';
import { Map, TileLayer, WMSTileLayer } from 'react-leaflet';
import { LatLng, TableTab } from '../../interface';
import { isAuthorizedToManageLayer } from '../../utils/authorization';
import { openWMSInAPI, openWMSInLizard, openWMSDownloadURL} from '../../utils/url';
import { getCenterPoint, zoomLevelCalculation, getBounds, boundsToDisplay } from '../../utils/latLngZoomCalculation';
import { mapBoxAccesToken } from "../../mapboxConfig.js";
import Action from '../../components/Action';
import manageIcon from '../../images/manage.svg';
import styles from '../../styles/Details.module.css';
import buttonStyles from '../../styles/Buttons.module.css';

const WMSDetails = () => {
    const selectedItem = useSelector(getSelectedItem);
    const wms = useSelector((state: MyStore) => getWMS(state, selectedItem));
    const organisations = useSelector(getOrganisations);
    const user = useSelector(getLizardBootstrap).user;

    const [showTableTab, setShowTableTab] = useState<TableTab>('Details');
    const [authorizedToManageLayer, setAuthorizedToManageLayer] = useState<boolean>(false);

    useEffect(() => {
        if (wms && user) {
            const authorized = isAuthorizedToManageLayer(wms, user.username, organisations);
            setAuthorizedToManageLayer(authorized);
        };
        return () => setAuthorizedToManageLayer(false);
    }, [wms, user, organisations]);

    if (!wms) return <div className={`${styles.Details} ${styles.DetailsText}`}>Please select a WMS Layer</div>;

    //Get WMS layer's getCapabilities link based on WMS layer's URL
    const wmsUrl = wms.wms_url && `${wms.wms_url}/?request=GetCapabilities`;

    //Get spatial bounds of the WMS layer
    const wmsBounds = getBounds(wms);
    const bounds = boundsToDisplay(wmsBounds);

    //Get the center point of the raster based on its spatial bounds
    const centerPoint: LatLng = getCenterPoint(wmsBounds);

    //Calculate the zoom level of the raster by using the zoomLevelCalculation function
    const zoom = zoomLevelCalculation(wmsBounds);

    return (
        <div
            className={styles.Details}
            style={{
                gridTemplateRows: "6rem 20rem auto 4rem auto 6rem 4rem 1fr"
            }}
        >
            <div className={styles.NameUuidContainer}>
                <div className={styles.Name}>
                    <h3 title={wms.name}>
                        {wms.name}
                    </h3>
                    {authorizedToManageLayer ? (
                        <img
                            className={styles.ManageIcon}
                            src={manageIcon}
                            title='To manage this WMS layer'
                            alt="Manage"
                            onClick={() => window.open(`/management/data_management/wms_layers/${wms.uuid}`)}
                        />
                    ) : null}
                </div>
                <div className={styles.Uuid}>
                    <div title={wms.uuid}>{wms.uuid}</div>
                    <button
                        className={buttonStyles.ButtonCopy}
                        onClick={() => navigator.clipboard.writeText(wms.uuid)}
                    >
                        <i className="fa fa-clone" />
                    </button>
                </div>
            </div>
            <div className={styles.Map}>
                <Map bounds={bounds} zoom={wms.min_zoom} zoomControl={false} style={{ width: '100%' }}>
                    <TileLayer url={`https://api.mapbox.com/styles/v1/nelenschuurmans/ck8sgpk8h25ql1io2ccnueuj6/tiles/256/{z}/{x}/{y}@2x?access_token=${mapBoxAccesToken}`} />
                    {wms.wms_url ? (
                        <WMSTileLayer
                            url={wms.wms_url}
                            layers={wms.slug}
                            transparent={true}
                            format="image/png"
                        />
                    ) : null}
                </Map>
            </div>
            <div className={styles.InfoBox}>
                <span className={styles.InfoBoxTitle}>Description</span>
                <span className={styles.InfoBoxDescription} id="scrollbar">{wms.description}</span>
            </div>
            <div className={styles.InfoBox}>
                <span className={styles.InfoBoxTitle}>Organisation</span>
                <span>{wms.organisation && wms.organisation.name}</span>
            </div>
            {wms.layer_collections && wms.layer_collections[0] ? (
                <div className={styles.InfoBox}>
                    <span className={styles.InfoBoxTitle}>Layer collection</span>
                    <span>{wms.layer_collections && wms.layer_collections[0] && wms.layer_collections[0].slug}</span>
                </div>
            ) : <div />}
            {wms.wms_url ? (
                <div className={styles.InfoBox}>
                    <div className={styles.InfoBoxTitle}>WMS Layer's URL</div>
                    <div className={styles.GetCapabilitiesUrlBox}>
                        <input
                            type="text"
                            className={styles.GetCapabilitiesUrl}
                            title={wmsUrl}
                            value={wmsUrl}
                            spellCheck={false}
                            readOnly={true}
                        />
                        <button
                            className={buttonStyles.ButtonLinkCopy}
                            onClick={() => navigator.clipboard.writeText(wmsUrl)}
                        >
                            Copy link
                        </button>
                    </div>
                </div>
            ) : null}
            <div className={`${styles.Grid} ${styles.GridHeader}`}>
                <div
                    className={showTableTab === 'Details' ? styles.GridHeaderSelected : ''}
                    onClick={() => setShowTableTab('Details')}
                >
                    Details
                </div>
                <div
                    className={showTableTab === 'Actions' ? styles.GridHeaderSelected : ''}
                    onClick={() => setShowTableTab('Actions')}
                >
                    Actions
                </div>
            </div>
            {showTableTab === 'Details' ? (
                <div className={`${styles.Grid} ${styles.GridBody} ${styles.GridBodyDetails}`} id='scrollbar'>
                    <div>Data type</div>
                    <div>WMS layer</div>
                    <div>Slug</div>
                    <div>{wms.slug}</div>
                </div>
            ) : (
                <div className={`${styles.Grid} ${styles.GridBody} ${styles.GridBodyActions}`} id='scrollbar'>
                    <Action
                        title='Open in Viewer'
                        description='Open in the Lizard Viewer to analyze (open in a new browser tab)'
                        onClick={() => openWMSInLizard(wms, centerPoint, zoom)}
                    />
                    <Action
                        title='Open in API'
                        description='Show the API detail page (open in a new browser tab)'
                        onClick={() => openWMSInAPI(wms)}
                    />
                    {wms.download_url ? (
                        <Action
                            title='Download'
                            description='Download the WMS to your local machine'
                            tooltip='Click to download'
                            onClick={() => openWMSDownloadURL(wms)}
                        />
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default WMSDetails;