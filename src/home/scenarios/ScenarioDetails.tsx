import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { MyStore, getOrganisations, getLizardBootstrap, getSelectedItem, getScenario } from '../../reducers';
import { isAuthorizedToManageLayer } from '../../utils/authorization';
import { getScenarioGetCapabilitesURL, openScenarioInAPI, openScenarioInLizard } from '../../utils/url';
import { getLocalDateString, getLocalString } from '../../utils/dateUtils';
import { bytesToMb } from '../../utils/byteConversionUtils';
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
            <div className="details-info">
                <span className="details-title">Model Name</span>
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
                    <div>Data type</div>
                    <div>Scenario</div>
                    <div>Model revision</div>
                    <div>{scenario.model_revision}</div>
                    <div>Model URL</div>
                    <div>{scenario.model_url}</div>
                    <div>Simulation ID</div>
                    <div>{scenario.simulation_id}</div>
                    <div>Username</div>
                    <div>{scenario.username}</div>
                    <div>Created</div>
                    <div>{getLocalDateString(scenario.created)}</div>
                    <div>Lastest update</div>
                    <div>{getLocalDateString(scenario.last_modified)}</div>
                    <div>For ICMS</div>
                    <div>{scenario.for_icms ? 'Yes' : 'No'}</div>
                    <div>Raw results</div>
                    <div>{scenario.has_raw_results ? 'Yes' : 'No'}</div>
                    <div>Total size</div>
                    <div>{bytesToMb(scenario.total_size)}</div>
                    <div>Start</div>
                    <div>{getLocalString(scenario.start_time_sim)}</div>
                    <div>End</div>
                    <div>{getLocalString(scenario.end_time_sim)}</div>
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