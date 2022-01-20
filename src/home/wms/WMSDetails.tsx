import React, { useEffect, useState } from 'react';
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
import '../../styles/Details.css';
import '../../styles/Buttons.css';

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

    //If no WMS layer is selected, display a text
    if (!wms) return <div className="details details-loading">Please select a WMS Layer</div>;

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
        <div className="details" id="scrollbar">
            <div className="details-name">
                <h3 title={wms.name}>
                    {wms.name}
                </h3>
                <span title="To manage this WMS layer">
                    {authorizedToManageLayer ? (
                        <a
                            href={`/management/data_management/wms_layers/${wms.uuid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img
                                className="details-manage-icon"
                                src={manageIcon}
                                alt="View in manage client"
                            />
                        </a>
                    ) :null}
                </span>
            </div>
            <div className="details-uuid">
                <span>{wms.uuid}</span>
                <button
                    className="button-copy"
                    onClick={() => navigator.clipboard.writeText(wms.uuid)}
                >
                    <i className="fa fa-clone" />
                </button>
            </div>
            <div className="details-map">
                <Map bounds={bounds} zoom={wms.min_zoom} zoomControl={false}>
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
            <div className="details-info">
                <span className="details-title">Description</span>
                <span className="description" id="scrollbar">{wms.description}</span>
            </div>
            <div className="details-info">
                <span className="details-title">Organisation</span>
                <span>{wms.organisation && wms.organisation.name}</span>
            </div>
            {wms.layer_collections && wms.layer_collections[0] ? (
                <div className="details-info">
                    <span className="details-title">Layer collection</span>
                    <span>{wms.layer_collections && wms.layer_collections[0] && wms.layer_collections[0].slug}</span>
                </div>
            ) : null}
            {wms.wms_url ? (
                <div className="details-info">
                    <span className="details-title">WMS layer's URL</span>
                    <div className="details__url-field">
                        <input
                            type="text"
                            className="details__get-capabilities-url"
                            title={wmsUrl}
                            value={wmsUrl}
                            spellCheck={false}
                            readOnly={true}
                        />
                        <button
                            className="details__button-copy"
                            title="Copy link"
                            onClick={() => navigator.clipboard.writeText(wmsUrl)}
                        >
                            Copy link
                        </button>
                    </div>
                </div>
            ) : null}
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
                    <div>Data type</div>
                    <div>WMS layer</div>
                    <div>Slug</div>
                    <div>{wms.slug}</div>
                </div>
            ) : (
                <div className="details-grid details-grid-body details-grid-actions">
                    <Action
                        title='Open in Portal'
                        description='Open in the viewer to playback and analyze (open in a new browser tab)'
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