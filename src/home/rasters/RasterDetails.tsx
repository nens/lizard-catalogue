import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Map, TileLayer, WMSTileLayer } from 'react-leaflet';
import { MyStore, getRaster, getOrganisations, getLizardBootstrap, getSelectedItem } from '../../reducers';
import { Raster, LatLng, TableTab } from '../../interface';
import { isAuthorizedToManageLayer } from '../../utils/authorization';
import { zoomLevelCalculation, getCenterPoint, getBounds, boundsToDisplay } from '../../utils/latLngZoomCalculation';
import { openRasterInAPI, openRasterInLizard, getLayercollectionGetCapabilitesURL, getRasterGetCapabilitesURL } from '../../utils/url';
import { mapBoxAccesToken } from "../../mapboxConfig.js";
import Export from '../../components/Export';
import manageIcon from '../../images/manage.svg';
import '../../styles/Details.css';
import '../../styles/Modal.css';
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

    //If no raster is selected, display a text
    if (!raster) return <div className="details details-loading">Please select a raster</div>;
    const layercollection = selectedLayercollection(raster);

    //Set the Map with bounds coming from spatial_bounds of the Raster
    const rasterBounds = getBounds(raster);
    const bounds = boundsToDisplay(rasterBounds);

    //Get the center point of the raster based on its spatial bounds
    const centerPoint: LatLng = getCenterPoint(rasterBounds);

    //Calculate the zoom level of the raster by using the zoomLevelCalculation function
    const zoom = zoomLevelCalculation(rasterBounds);

    //Get the Date from the timestamp string
    const lastestUpdateDate = new Date(raster.last_modified);
    const startDate = new Date(raster.first_value_timestamp);
    const stopDate = new Date(raster.last_value_timestamp);

    //Turn the new Date into a string with the date format of DD-MM-YYYY
    const latestUpdate = lastestUpdateDate.toLocaleDateString();
    const start = startDate.toLocaleDateString();
    const stop = stopDate.toLocaleDateString();

    //Calculate raster resolution and decide to show it in m2 or square degrees
    const rasterResolution = Math.abs(raster.pixelsize_x * raster.pixelsize_y);
    //If the projection is EPSG:4326, the resolution is calculated in square degrees, otherwise it is in m2
    const resolution = raster.projection === "EPSG:4326" ? rasterResolution.toFixed(6) + " deg2" : rasterResolution + " m2";

    return (
        <div className="details" id="scrollbar">
            <div className="details-name">
                <h3 title={raster.name}>
                    {raster.name}
                </h3>
                <span title="To manage this raster">
                    {authorizedToManageLayer ? (
                        <a
                            href={`/management/data_management/rasters/layers/${raster.uuid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img
                                className="details-manage-icon"
                                src={manageIcon}
                                alt="View in manage client"
                            />
                        </a>
                    ) : null}
                </span>
            </div>
            <div className="details-uuid">
                <span>{raster.uuid}</span>
                <button
                    className="button-copy"
                    onClick={() => navigator.clipboard.writeText(raster.uuid)}
                >
                    <i className="fa fa-clone" />
                </button>
            </div>
            <div className="details-map">
                <Map bounds={bounds} zoomControl={false}>
                    <TileLayer url={`https://api.mapbox.com/styles/v1/nelenschuurmans/ck8sgpk8h25ql1io2ccnueuj6/tiles/256/{z}/{x}/{y}@2x?access_token=${mapBoxAccesToken}`} />
                    <WMSTileLayer url={raster.wms_info.endpoint} layers={raster.wms_info.layer} styles={raster.options.styles} />
                </Map>
            </div>
            <div className="details-info">
                <span className="details-title">Description</span>
                <span className="description" id="scrollbar">{raster.description}</span>
            </div>
            <div className="details-info">
                <span className="details-title">Organisation</span>
                <span>{raster.organisation && raster.organisation.name}</span>
            </div>
            {layercollection ? (
                <div className="details-info">
                    <span className="details-title">Layer collection</span>
                    <span>{layercollection && layercollection.slug}</span>
                </div>
            ) : null}
            <div className="details-capabilities">
                <span className="details-title">Lizard WMS GetCapabilities</span>
                <div style={{ marginBottom: "5px" }}>
                    For this raster:
                    <div className="details__url-field">
                        <input
                            type="text"
                            className="details__get-capabilities-url"
                            title={getRasterGetCapabilitesURL(raster)}
                            value={getRasterGetCapabilitesURL(raster)}
                            spellCheck={false}
                            readOnly={true}
                        />
                        <button
                            className="details__button-copy"
                            title="Copy link"
                            onClick={() => navigator.clipboard.writeText(getRasterGetCapabilitesURL(raster))}
                        >
                            Copy link
                        </button>
                    </div>
                </div>
                {layercollection ? (
                    <div>
                        For this complete layercollection:
                        <div className="details__url-field">
                            <input
                                type="text"
                                className="details__get-capabilities-url"
                                title={getLayercollectionGetCapabilitesURL(layercollection)}
                                value={getLayercollectionGetCapabilitesURL(layercollection)}
                                spellCheck={false}
                                readOnly={true}
                            />
                            <button
                                className="details__button-copy"
                                title="Copy link"
                                onClick={() => navigator.clipboard.writeText(getLayercollectionGetCapabilitesURL(layercollection))}
                            >
                                Copy link
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
            <div className="details-grid details-grid-header">
                <div
                    className={showTableTab === 'Details' ? 'details-grid-header-selected' : ''}
                    onClick={() => setShowTableTab('Details')}
                >
                    Details
                </div>
                <div
                    className={showTableTab === 'Actions' ? 'details-grid-header-selected' : ''}
                    onClick={() => setShowTableTab('Actions')}
                >
                    Actions
                </div>
            </div>
            {showTableTab === 'Details' ? (
                <div className="details-grid details-grid-body">
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
                    <div>Latest update</div>
                    <div>{latestUpdate}</div>
                    {raster.temporal ? (
                        <>
                        <div>Interval</div>
                        <div>{raster.interval}</div>
                        <div>Start</div>
                        <div>{start}</div>
                        <div>End</div>
                        <div>{stop}</div>
                        </>
                    ) : null}
                </div>
            ) : (
                <div className="details-grid details-grid-body details-grid-actions">
                    <div />
                    <div>
                        <button
                            className="button-action"
                            onClick={() => openRasterInLizard(raster, centerPoint, zoom)}
                            title="Open in Portal"
                        >
                            OPEN IN VIEWER
                        </button>
                    </div>
                    <div />
                    <div>
                        <button
                            className="button-action"
                            onClick={() => openRasterInAPI(raster)}
                            title="Open in API"
                        >
                            OPEN IN API
                        </button>
                    </div>
                    <div />
                    <div>
                        <button
                            className="button-action"
                            onClick={() => setRasterExport(!rasterExport)}
                            disabled={!user.authenticated}
                            title={!user.authenticated? "Log in to export" : "Export"}
                        >
                            EXPORT RASTER
                        </button>
                    </div>
                </div>
            )}
            {/*This is the PopUp window for the export screen*/}
            {rasterExport && (
                <div className="modal-background">
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