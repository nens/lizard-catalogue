import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Map, TileLayer, WMSTileLayer } from 'react-leaflet';
import { MyStore, getRaster, getOrganisations, getLizardBootstrap, getSelectedItem } from '../../reducers';
import { Raster, LatLng, TableTab } from '../../interface';
import { getLocalDateString } from '../../utils/dateUtils';
import { isAuthorizedToManageLayer } from '../../utils/authorization';
import { zoomLevelCalculation, getCenterPoint, getBounds, boundsToDisplay } from '../../utils/latLngZoomCalculation';
import { openRasterInAPI, openRasterInLizard, getLayercollectionGetCapabilitesURL, getRasterGetCapabilitesURL } from '../../utils/url';
import { mapBoxAccesToken } from "../../mapboxConfig.js";
import Export from '../../components/Export';
import Action from '../../components/Action';
import manageIcon from '../../images/manage.svg';
import styles from '../../styles/Details.module.css';
import modalStyles from '../../styles/Modal.module.css';
import '../../styles/Buttons.css';

interface MyProps {
    filters: MyStore['filters'],
};

const RasterDetails = (props: MyProps) => {
    const selectedItem = useSelector(getSelectedItem);
    const raster = useSelector((state: MyStore) => getRaster(state, selectedItem));
    const organisations = useSelector(getOrganisations);
    const user = useSelector(getLizardBootstrap).user;

    const [rasterExport, setRasterExport] = useState<boolean>(false);
    const [showTableTab, setShowTableTab] = useState<TableTab>('Details');
    const [authorizedToManageLayer, setAuthorizedToManageLayer] = useState<boolean>(false);

    useEffect(() => {
        if (raster && user) {
            const authorized = isAuthorizedToManageLayer(raster, user.username, organisations);
            setAuthorizedToManageLayer(authorized);
        };
        return () => setAuthorizedToManageLayer(false);
    }, [raster, user, organisations]);

    const selectedLayercollection = (raster: Raster) => {
        const { layercollection } = props.filters;
        const selectedLayercollection = layercollection && raster.layer_collections.find(layercollectionParameter => layercollectionParameter.slug === layercollection);
        return (layercollection && selectedLayercollection) || null;
    };

    if (!raster) return <div className={`${styles.Details} ${styles.DetailsText}`}>Please select a raster</div>;
    const layercollection = selectedLayercollection(raster);

    //Set the Map with bounds coming from spatial_bounds of the Raster
    const rasterBounds = getBounds(raster);
    const bounds = boundsToDisplay(rasterBounds);

    //Get the center point of the raster based on its spatial bounds
    const centerPoint: LatLng = getCenterPoint(rasterBounds);

    //Calculate the zoom level of the raster by using the zoomLevelCalculation function
    const zoom = zoomLevelCalculation(rasterBounds);


    //Calculate raster resolution and decide to show it in m2 or square degrees
    const rasterResolution = Math.abs(raster.pixelsize_x * raster.pixelsize_y);
    //If the projection is EPSG:4326, the resolution is calculated in square degrees, otherwise it is in m2
    const resolution = raster.projection === "EPSG:4326" ? rasterResolution.toFixed(6) + " deg2" : rasterResolution + " m2";

    return (
        <div
            className={styles.Details}
            style={{
                gridTemplateRows: "6rem 20rem auto 4rem auto auto 4rem 1fr"
            }}
        >
            <div className={styles.NameUuidContainer}>
                <div className={styles.Name}>
                    <h3 title={raster.name}>
                        {raster.name}
                    </h3>
                    {authorizedToManageLayer ? (
                        <img
                            className={styles.ManageIcon}
                            src={manageIcon}
                            title='To manage this raster'
                            alt="Manage"
                            onClick={() => window.open(`/management/data_management/rasters/layers/${raster.uuid}`)}
                        />
                    ) : null}
                </div>
                <div className={styles.Uuid}>
                    <div title={raster.uuid}>{raster.uuid}</div>
                    <button
                        className="button-copy"
                        onClick={() => navigator.clipboard.writeText(raster.uuid)}
                    >
                        <i className="fa fa-clone" />
                    </button>
                </div>
            </div>
            <div className={styles.Map}>
                <Map bounds={bounds} zoomControl={false} style={{ width: '100%' }}>
                    <TileLayer url={`https://api.mapbox.com/styles/v1/nelenschuurmans/ck8sgpk8h25ql1io2ccnueuj6/tiles/256/{z}/{x}/{y}@2x?access_token=${mapBoxAccesToken}`} />
                    <WMSTileLayer url={raster.wms_info.endpoint} layers={raster.wms_info.layer} styles={raster.options.styles} />
                </Map>
            </div>
            <div className={styles.InfoBox}>
                <span className={styles.InfoBoxTitle}>Description</span>
                <span className={styles.InfoBoxDescription} id="scrollbar">{raster.description}</span>
            </div>
            <div className={styles.InfoBox}>
                <span className={styles.InfoBoxTitle}>Organisation</span>
                <span>{raster.organisation && raster.organisation.name}</span>
            </div>
            {layercollection ? (
                <div className={styles.InfoBox}>
                    <span className={styles.InfoBoxTitle}>Layer collection</span>
                    <span>{layercollection && layercollection.slug}</span>
                </div>
            ) : <div />}
            <div className={styles.InfoBox} style={{ minHeight: '8rem', maxHeight: '13rem' }}>
                <span className={styles.InfoBoxTitle}>Lizard WMS GetCapabilities</span>
                <div style={{ marginBottom: "5px" }}>
                    For this raster:
                    <div className={styles.GetCapabilitiesUrlBox}>
                        <input
                            type="text"
                            className={styles.GetCapabilitiesUrl}
                            title={getRasterGetCapabilitesURL(raster)}
                            value={getRasterGetCapabilitesURL(raster)}
                            spellCheck={false}
                            readOnly={true}
                        />
                        <button
                            className={styles.ButtonLinkCopy}
                            onClick={() => navigator.clipboard.writeText(getRasterGetCapabilitesURL(raster))}
                        >
                            Copy link
                        </button>
                    </div>
                </div>
                {layercollection ? (
                    <div>
                        For this complete layer collection:
                        <div className={styles.GetCapabilitiesUrlBox}>
                            <input
                                type="text"
                                className={styles.GetCapabilitiesUrl}
                                title={getLayercollectionGetCapabilitesURL(layercollection)}
                                value={getLayercollectionGetCapabilitesURL(layercollection)}
                                spellCheck={false}
                                readOnly={true}
                            />
                            <button
                                className={styles.ButtonLinkCopy}
                                onClick={() => navigator.clipboard.writeText(getLayercollectionGetCapabilitesURL(layercollection))}
                            >
                                Copy link
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
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
                    <div>Temporal</div>
                    <div>{raster.temporal ? 'Yes' : 'No'}</div>
                    <div>Resolution</div>
                    <div>{resolution}</div>
                    <div>Data type</div>
                    <div>Raster</div>
                    <div>Observation type</div>
                    <div>{raster.observation_type && raster.observation_type.parameter}</div>
                    <div>Measuring unit</div>
                    <div>{raster.observation_type && raster.observation_type.unit}</div>
                    <div>Scale</div>
                    <div>{raster.observation_type && raster.observation_type.scale}</div>
                    <div>Last update</div>
                    <div>{getLocalDateString(raster.last_modified)}</div>
                    {raster.temporal ? (
                        <>
                        <div>Interval</div>
                        <div>{raster.interval}</div>
                        <div>Start</div>
                        <div>{getLocalDateString(raster.first_value_timestamp)}</div>
                        <div>End</div>
                        <div>{getLocalDateString(raster.last_value_timestamp)}</div>
                        </>
                    ) : null}
                </div>
            ) : (
                <div className={`${styles.Grid} ${styles.GridBody} ${styles.GridBodyActions}`} id='scrollbar'>
                    <Action
                        title='Open in Viewer'
                        description='Open in the Lizard Viewer to analyze (open in a new browser tab)'
                        onClick={() => openRasterInLizard(raster, centerPoint, zoom)}
                    />
                    <Action
                        title='Open in API'
                        description='Show the API detail page (open in a new browser tab)'
                        onClick={() => openRasterInAPI(raster)}
                    />
                    <Action
                        title='Export raster'
                        description='Open the raster export modal'
                        tooltip={!user.authenticated ? 'Please login to export' : undefined}
                        disabled={!user.authenticated}
                        onClick={() => setRasterExport(!rasterExport)}
                    />
                </div>
            )}
            {/* Raster export modal */}
            {rasterExport && (
                <div className={modalStyles.ModalBackground}>
                    <Export
                        raster={raster}
                        bounds={bounds}
                        toggleExportModal={() => setRasterExport(!rasterExport)}
                    />
                </div>
            )}
        </div>
    );
};

export default RasterDetails;