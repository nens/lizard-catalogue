import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Map, TileLayer } from 'react-leaflet';
import { MyStore, getOrganisations, getLizardBootstrap, getSelectedItem, getScenario } from '../../reducers';
import { isAuthorizedToManageLayer } from '../../utils/authorization';
import { getScenarioGetCapabilitesURL, openScenarioInAPI, openScenarioInLizard } from '../../utils/url';
import { mapBoxAccesToken } from "../../mapboxConfig.js";
import manageIcon from '../../images/manage.svg';
import '../../styles/Details.css';
import '../../styles/Modal.css';
import '../../styles/Buttons.css';

const ScenarioDetails = () => {
    const selectedItem = useSelector(getSelectedItem);
    const scenario = useSelector((state: MyStore) => getScenario(state, selectedItem));
    const organisations = useSelector(getOrganisations);
    const user = useSelector(getLizardBootstrap).user;

    const [showTableTab, setShowTableTab] = useState<string>('Details');
    const [authorizedToManageLayer, setAuthorizedToManageLayer] = useState<boolean>(false);

    useEffect(() => {
        if (scenario && user) {
            const authorized = isAuthorizedToManageLayer(scenario, user.username, organisations);
            setAuthorizedToManageLayer(authorized);
        };
        return () => setAuthorizedToManageLayer(false);
    }, [scenario, user, organisations]);

    //If no raster is selected, display a text
    if (!scenario) return <div className="details details-loading">Please select a scenario</div>;

    return (
        <div className="details" id="scrollbar">
            <div className="details-name">
                <h3 title={scenario.name}>
                    {scenario.name}
                </h3>
                <span title="To manage this raster">
                    {authorizedToManageLayer ? (
                        <a
                            href={`/management/data_management/scenarios/${scenario.uuid}`}
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
                <span>{scenario.uuid}</span>
                <button
                    className="button-copy"
                    onClick={() => navigator.clipboard.writeText(scenario.uuid)}
                >
                    <i className="fa fa-clone" />
                </button>
            </div>
            <div className="details-map">
                <Map zoomControl={false}>
                    <TileLayer url={`https://api.mapbox.com/styles/v1/nelenschuurmans/ck8sgpk8h25ql1io2ccnueuj6/tiles/256/{z}/{x}/{y}@2x?access_token=${mapBoxAccesToken}`} />
                </Map>
            </div>
            <div className="details-info">
                <span className="details-title">Model name</span>
                <span className="description">{scenario.model_name}</span>
            </div>
            <div className="details-info">
                <span className="details-title">Organisation</span>
                <span>{scenario.organisation && scenario.organisation.name}</span>
            </div>
            <div className="details-capabilities">
                <span className="details-title">Lizard WMS GetCapabilities</span>
                <div className="details__url-field">
                    <input
                        type="text"
                        className="details__get-capabilities-url"
                        title={getScenarioGetCapabilitesURL(scenario)}
                        value={getScenarioGetCapabilitesURL(scenario)}
                        spellCheck={false}
                        readOnly={true}
                    />
                    <button
                        className="details__button-copy"
                        title="Copy link"
                        onClick={() => navigator.clipboard.writeText(getScenarioGetCapabilitesURL(scenario))}
                    >
                        Copy link
                    </button>
                </div>
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
                    <div>Name</div>
                    <div>{scenario.name}</div>
                </div>
            ) : (
                <div className="details-grid details-grid-body details-grid-actions">
                    <div />
                    <div>
                        <button
                            className="button-action"
                            onClick={() => openScenarioInLizard(scenario)}
                            title="Open in Viewer"
                        >
                            OPEN IN VIEWER
                        </button>
                    </div>
                    <div />
                    <div>
                        <button
                            className="button-action"
                            onClick={() => openScenarioInAPI(scenario)}
                            title="Open in API"
                        >
                            OPEN IN API
                        </button>
                    </div>
                    <div />
                </div>
            )}
        </div>
    );
};

export default ScenarioDetails;