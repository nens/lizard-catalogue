import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Scenario, TableTab } from '../../interface';
import { MyStore, getOrganisations, getLizardBootstrap, getSelectedItem, getScenario } from '../../reducers';
import { isAuthorizedToManageLayer } from '../../utils/authorization';
import { getScenarioGetCapabilitesURL, openScenarioInAPI, openScenarioInLizard } from '../../utils/url';
import { getLocalDateString, getLocalString } from '../../utils/dateUtils';
import { bytesToMb } from '../../utils/byteConversionUtils';
import ScenarioResults from './ScenarioResults';
import Action from '../../components/Action';
import manageIcon from '../../images/manage.svg';
import styles from '../../styles/Details.module.css';
import buttonStyles from '../../styles/Buttons.module.css';

const ScenarioDetails = () => {
    const selectedItem = useSelector(getSelectedItem);
    const scenario = useSelector((state: MyStore) => getScenario(state, selectedItem)) as Scenario;
    const organisations = useSelector(getOrganisations);
    const user = useSelector(getLizardBootstrap).user;

    const [showTableTab, setShowTableTab] = useState<TableTab>('Details');
    const [authorizedToManageLayer, setAuthorizedToManageLayer] = useState<boolean>(false);

    useEffect(() => {
        if (scenario && user) {
            const authorized = isAuthorizedToManageLayer(scenario, user.username, organisations);
            setAuthorizedToManageLayer(authorized);
        };
        return () => setAuthorizedToManageLayer(false);
    }, [scenario, user, organisations]);

    if (!scenario) return <div className={`${styles.Details} ${styles.DetailsText}`}>Please select a scenario</div>;

    return (
        <div
            className={styles.Details}
            style={{
                gridTemplateRows: "6rem auto 4rem 6rem 4rem 1fr"
            }}
        >
            <div className={styles.NameUuidContainer}>
                <div className={styles.Name}>
                    <h3 title={scenario.name}>
                        {scenario.name}
                    </h3>
                    {authorizedToManageLayer ? (
                        <img
                            className={styles.ManageIcon}
                            src={manageIcon}
                            title='To manage this scenario'
                            alt="Manage"
                            onClick={() => window.open(`/management/data_management/scenarios/${scenario.uuid}`)}
                        />
                    ) : null}
                </div>
                <div className={styles.Uuid}>
                    <div title={scenario.uuid}>{scenario.uuid}</div>
                    <button
                        className={buttonStyles.ButtonCopy}
                        onClick={() => navigator.clipboard.writeText(scenario.uuid)}
                    >
                        <i className="fa fa-clone" />
                    </button>
                </div>
            </div>
            <div className={styles.InfoBox} style={{ maxHeight: 'unset', wordBreak: 'break-all' }}>
                <span className={styles.InfoBoxTitle}>Model Name</span>
                <span className={styles.InfoBoxDescription}>{scenario.model_name}</span>
            </div>
            <div className={styles.InfoBox}>
                <span className={styles.InfoBoxTitle}>Organisation</span>
                <span>{scenario.organisation && scenario.organisation.name}</span>
            </div>
            <div className={styles.InfoBox}>
                <div className={styles.InfoBoxTitle}>Lizard WMS GetCapabilities</div>
                <div className={styles.GetCapabilitiesUrlBox}>
                    <input
                        type="text"
                        className={styles.GetCapabilitiesUrl}
                        title={getScenarioGetCapabilitesURL(scenario)}
                        value={getScenarioGetCapabilitesURL(scenario)}
                        spellCheck={false}
                        readOnly={true}
                    />
                    <button
                        className={styles.ButtonLinkCopy}
                        onClick={() => navigator.clipboard.writeText(getScenarioGetCapabilitesURL(scenario))}
                    >
                        Copy link
                    </button>
                </div>
            </div>
            <div
                className={`${styles.Grid} ${styles.GridHeader}`}
                style={{
                    gridTemplateColumns: '1fr 1fr 1fr'
                }}
            >
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
                <div
                    className={showTableTab === 'Results' ? styles.GridHeaderSelected : ''}
                    onClick={() => setShowTableTab('Results')}
                >
                    Results
                </div>
            </div>
            {showTableTab === 'Details' ? (
                <div className={`${styles.Grid} ${styles.GridBody} ${styles.GridBodyDetails}`} id='scrollbar'>
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
                    <div>Last update</div>
                    <div>{getLocalDateString(scenario.last_modified)}</div>
                    <div>Raw results</div>
                    <div>{scenario.has_raw_results ? 'Yes' : 'No'}</div>
                    <div>Total size</div>
                    <div>{bytesToMb(scenario.total_size)}</div>
                    <div>Start</div>
                    <div>{getLocalString(scenario.start_time_sim)}</div>
                    <div>End</div>
                    <div>{getLocalString(scenario.end_time_sim)}</div>
                </div>
            ) : showTableTab === 'Actions' ? (
                <div className={`${styles.Grid} ${styles.GridBody} ${styles.GridBodyActions}`} id='scrollbar'>
                    <Action
                        title='Open in Viewer'
                        description='Open in the Lizard Viewer to playback and analyze (open in a new browser tab)'
                        onClick={() => openScenarioInLizard(scenario)}
                    />
                    <Action
                        title='Open in API'
                        description='Show the API detail page (open in a new browser tab)'
                        onClick={() => openScenarioInAPI(scenario)}
                    />
                </div>
            ) : ( // Results tab
                <div className={`${styles.Grid} ${styles.GridBody} ${styles.GridBodyResults}`} id='scrollbar'>
                    <ScenarioResults uuid={scenario.uuid} />
                </div>
            )}
        </div>
    );
};

export default ScenarioDetails;