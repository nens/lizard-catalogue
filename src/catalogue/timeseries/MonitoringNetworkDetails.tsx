import * as React from 'react';
import { connect } from 'react-redux';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { MyStore, getOrganisations, getMonitoringNetwork, getTimeseriesObject, getLocationsObject } from '../../reducers';
import { Organisation, MonitoringNetwork } from '../../interface';
import {mapBoxAccesToken} from "../../mapboxConfig.js"
import '../styles/Details.css';
import '../styles/Export.css';

interface PropsFromState {
    monitoringNetwork: MonitoringNetwork | null,
    timeseriesObject: MyStore['timeseriesObject'],
    locationsObject: MyStore['locationsObject'],
    organisations: Organisation[],
};

interface MyState {
    showTimeseriesModal: boolean
};

class MonitoringNetworkDetails extends React.Component<PropsFromState, MyState> {
    state = {
        showTimeseriesModal: false
    };

    toggleTimeseriesModal = () => {
        this.setState({
            showTimeseriesModal: !this.state.showTimeseriesModal
        });
    };

    render() {
        //Destructure the props
        const { monitoringNetwork, locationsObject } = this.props;

        //If no monitoring network is selected, display a text
        if (!monitoringNetwork || !locationsObject) return <div className="details details__loading">Please select a monitoring network</div>;

        const coordinatesArray = Object.values(locationsObject.locations).filter(
            location => location.geometry !== null
        ).map(
            location => location.geometry!.coordinates
        );

        return (
            <div className="details">
                <h3>
                    <span className="details__title_text" title={monitoringNetwork.name}>
                        {monitoringNetwork.name}
                    </span>
                </h3>
                <div className="details__main-box">
                    <div className="details__description-box">
                        <h4>Description</h4>
                        <span className="description">{monitoringNetwork.description}</span>
                        <h4>Organisation</h4>
                        <span>{monitoringNetwork.organisation && monitoringNetwork.organisation.name}</span>
                        <h4>UUID</h4>
                        <span>{monitoringNetwork.uuid}</span>
                    </div>
                    <div className="details__map-box">
                        <Map
                            bounds={locationsObject.spatialBounds}
                            zoom={10}
                        >
                            {coordinatesArray.map((coordinates, i) => (
                                <Marker key={i} position={[coordinates[1], coordinates[0]]} />
                            ))}
                            <TileLayer url={`https://api.mapbox.com/styles/v1/nelenschuurmans/ck8sgpk8h25ql1io2ccnueuj6/tiles/256/{z}/{x}/{y}@2x?access_token=${mapBoxAccesToken}`} />
                        </Map>
                    </div>
                </div>
                <div className="details__metadata">
                    <h4>Details</h4><hr/>
                    <div className="row">
                        <p className="column column-1">Data type</p><p className="column column-2">Time Series</p>
                    </div>
                </div>
                <div className="details__button-container">
                    <h4>Actions</h4><hr/>
                    <div className="details__buttons">
                        <button 
                            className="details__button" 
                            onClick={this.toggleTimeseriesModal} 
                        >
                            SELECT TIME SERIES
                        </button>
                    </div>
                </div>
                {/*This is the PopUp window for the time series selection screen*/}
                {/* {this.state.showTimeseriesModal && (
                    <div className="raster-export">
                        <div />
                    </div>
                )} */}
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