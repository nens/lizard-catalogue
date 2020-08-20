import * as React from 'react';
import MDSpinner from "react-md-spinner";
import { connect } from 'react-redux';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { MyStore, getOrganisations, getMonitoringNetwork, getTimeseriesObject, getLocationsObject } from '../../reducers';
import { Organisation, MonitoringNetwork, Location } from '../../interface';
import {mapBoxAccesToken} from "../../mapboxConfig.js";
import TimeSeriesModal from '../components/TimeSeriesModal';
import '../styles/Details.css';
import '../styles/Buttons.css';
import '../styles/Modal.css';

interface PropsFromState {
    monitoringNetwork: MonitoringNetwork | null,
    timeseriesObject: MyStore['timeseriesObject'],
    locationsObject: MyStore['locationsObject'],
    organisations: Organisation[],
};

interface MyState {
    showTimeseriesModal: boolean,
    showTableTab: string,
};

// Helper function
const getAllCoordinates = (locations: Location[]) => {
    return locations.filter(location => location.geometry !== null).map(location => location.geometry!.coordinates);
};

class MonitoringNetworkDetails extends React.Component<PropsFromState, MyState> {
    state = {
        showTimeseriesModal: false,
        showTableTab: 'Details',
    };

    toggleTimeseriesModal = () => {
        this.setState({
            showTimeseriesModal: !this.state.showTimeseriesModal
        });
    };

    render() {
        //Destructure the props
        const { monitoringNetwork, timeseriesObject, locationsObject } = this.props;

        //If no monitoring network is selected, display a text
        if (!monitoringNetwork) return <div className="details details-loading">Please select a monitoring network</div>;

        return (
            <div className="details">
                <div className="details-name">
                    <h3 title={monitoringNetwork.name}>
                        {monitoringNetwork.name}
                    </h3>
                </div>
                <div className="details-uuid">
                    <span>{monitoringNetwork.uuid}</span>
                    <i
                        className="fa fa-clone"
                        onClick={() => navigator.clipboard.writeText(monitoringNetwork.uuid)}
                    />
                </div>
                <div className="details-map">
                    {locationsObject && locationsObject.isFetching ? (
                        <div className="details-map-loading">
                            <MDSpinner />
                        </div>
                    ) : null}
                    <Map
                        bounds={locationsObject ? locationsObject.spatialBounds : [[85, 180], [-85, -180]]}
                        zoom={10}
                        style={{
                            opacity: locationsObject && locationsObject.isFetching ? 0.4 : 1
                        }}
                    >
                        {locationsObject ? (
                            getAllCoordinates(Object.values(locationsObject.locations)).map((coordinates, i) => (
                                <Marker key={i} position={[coordinates[1], coordinates[0]]} />
                            ))
                        ) : null}
                        <TileLayer url={`https://api.mapbox.com/styles/v1/nelenschuurmans/ck8sgpk8h25ql1io2ccnueuj6/tiles/256/{z}/{x}/{y}@2x?access_token=${mapBoxAccesToken}`} />
                    </Map>
                </div>
                <div className="details-info">
                    <span className="details-title">Description</span>
                    <span className="description">{monitoringNetwork.description}</span>
                </div>
                <div className="details-info">
                    <span className="details-title">Organisation</span>
                    <span>{monitoringNetwork.organisation && monitoringNetwork.organisation.name}</span>
                </div>
                <table className="details-table">
                    <tbody>
                        <tr>
                            <th
                                className={this.state.showTableTab === 'Details' ? 'details-table-selected' : ''}
                                onClick={() => this.setState({showTableTab: 'Details'})}
                            >
                                Details
                            </th>
                            <th
                                className={this.state.showTableTab === 'Actions' ? 'details-table-selected' : ''}
                                onClick={() => this.setState({showTableTab: 'Actions'})}
                            >
                                Actions
                            </th>
                        </tr>
                        <tr className="details-table-empty-row"><td /></tr>
                        {this.state.showTableTab === 'Details' && timeseriesObject ? (
                            <tr>
                                <td>Observation types</td>
                                {timeseriesObject.isFetching ? (
                                    <td style={{ textAlign: 'center' }}>
                                        <MDSpinner />
                                    </td>
                                ) : (
                                    <td>
                                        {Object.values(timeseriesObject.observationTypes).map(observationType => (
                                            <p key={observationType.id}>{observationType.parameter}</p>
                                        ))}
                                    </td>
                                )}
                            </tr>
                        ) : (
                            <tr>
                                <td />
                                <td>
                                    <button
                                        className="button-action"
                                        onClick={this.toggleTimeseriesModal}
                                    >
                                        SELECT TIME SERIES
                                    </button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {/*This is the PopUp window for the time series selection screen*/}
                {this.state.showTimeseriesModal && (
                    <div className="modal-background">
                        <TimeSeriesModal
                            toggleExportModal={this.toggleTimeseriesModal}
                        />
                    </div>
                )}
            </div>
        );
    };
};

const mapStateToProps = (state: MyStore): PropsFromState => {
    if (!state.selectedItem) return {
        monitoringNetwork: null,
        timeseriesObject: null,
        locationsObject: null,
        organisations: getOrganisations(state),
    };
    return {
        monitoringNetwork: getMonitoringNetwork(state, state.selectedItem),
        timeseriesObject: getTimeseriesObject(state),
        locationsObject: getLocationsObject(state),
        organisations: getOrganisations(state),
    };
};

export default connect(mapStateToProps)(MonitoringNetworkDetails);