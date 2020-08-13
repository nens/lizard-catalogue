import * as React from 'react';
import { connect } from 'react-redux';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { MyStore, getOrganisations, getMonitoringNetwork } from '../../reducers';
import { Organisation, MonitoringNetwork } from '../../interface';
import {mapBoxAccesToken} from "../../mapboxConfig.js"
import '../styles/Details.css';
import '../styles/Export.css';

interface PropsFromState {
    monitoringNetwork: MonitoringNetwork | null,
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
        const { monitoringNetwork } = this.props;

        //If no monitoring network is selected, display a text
        if (!monitoringNetwork) return <div className="details details__loading">Please select a monitoring network</div>;

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
                            center={[52.06683513154142, 5.110813411429112]}
                            zoom={10}
                        >
                            <Marker position={[52.06683513154142, 5.110813411429112]} />
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
        organisations: getOrganisations(state),
    };
    return {
        monitoringNetwork: getMonitoringNetwork(state, state.selectedItem),
        organisations: getOrganisations(state),
    };
};

export default connect(mapStateToProps)(MonitoringNetworkDetails);