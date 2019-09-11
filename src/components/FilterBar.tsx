import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { ObservationType, Organisation, SwitchDataType } from '../interface';
import { MyStore } from '../reducers';
import './styles/FilterBar.css';
import { getUrlParams, getOrganisation, getObservationType } from '../utils/getUrlParams';

interface MyProps {
    observationTypes: ObservationType[],
    organisations: Organisation[],
    currentDataType: MyStore['currentDataType'],
    fetchObservationTypes: () => void,
    fetchOrganisations: () => void,
    fetchRasters: (page: number, searchTerm: string, organisationName: string, observationTypeParameter: string, ordering: string) => void,
    fetchWMSLayers: (page: number, searchTerm: string, organisationName: string, ordering: string) => void,
    onObservationTypeRadiobutton: (obsType: ObservationType) => void,
    onOrganisationRadiobutton: (organisation: Organisation) => void,
    updateObservationTypeRadiobutton: (parameter: ObservationType['parameter']) => void,
    updateOrganisationRadiobutton: (name: Organisation['name']) => void,
    onDataTypeChange: () => void
    switchDataType: (dataType: SwitchDataType['payload']) => void,
    onOrganisationSearchSubmit: (name: string) => void,
    onObservationTypeSearchSubmit: (obsTypeParameter: string) => void,
};

interface MyState {
    searchObs: string,
    searchOrg: string,
    obsItems: number,
    orgItems: number
};

class FilterBar extends React.Component<MyProps & RouteComponentProps, MyState> {
    state: MyState = {
        searchObs: '',
        searchOrg: '',
        obsItems: 7,
        orgItems: 7
    };

    //Handling on change and on submit for the Observation Type search
    onObsChange = (event) => {
        this.setState({
            searchObs: event.target.value
        });
    };

    onObsSubmit = (event) => {
        event.preventDefault();
        this.props.onObservationTypeSearchSubmit(this.state.searchObs);
    };

    //Handling on change and on submit for the Organisation search
    onOrgChange = (event) => {
        this.setState({
            searchOrg: event.target.value
        });
    };

    onOrgSubmit = (event) => {
        event.preventDefault();
        this.props.onOrganisationSearchSubmit(this.state.searchOrg);
    };

    componentDidMount() {
        this.props.fetchObservationTypes();
        this.props.fetchOrganisations();
        const urlSearchParams = getUrlParams(this.props.location.search);
        const organisation = getOrganisation(urlSearchParams);
        const observation = getObservationType(urlSearchParams);
        this.setState({
            searchOrg: organisation,
            searchObs: observation
        });
    };

    render() {
        const { searchObs, searchOrg } = this.state;

        const {
            observationTypes,
            organisations,
            onObservationTypeRadiobutton,
            onOrganisationRadiobutton,
            updateObservationTypeRadiobutton,
            updateOrganisationRadiobutton,
            currentDataType,
            switchDataType,
            onDataTypeChange
        } = this.props;

        //Filter observation types & organisations at the client side instead of fetching again from the server after each search
        const filteredObservationTypes = observationTypes.filter(observationTypes => observationTypes.parameter.toLowerCase().includes(this.state.searchObs.toLowerCase()));
        const filteredOrganisations = organisations.filter(organisation => organisation.name.toLowerCase().includes(this.state.searchOrg.toLowerCase()));

        //Find the the observation type and the organisation that have been checked in the filter list
        const checkedObservationType = observationTypes.find(observationType => observationType.checked)
        const checkedOrganisation = organisations.find(organisation => organisation.checked)

        return (
            <div className="filter-box">
                <div className="switcher">
                    <button 
                        className="switcher-button switcher-button-raster"
                        title="Raster"
                        onClick={() => {
                            //Switching between Rasters and WMS layers will fetch rasters/wms again with initial values
                            //then it will set the local state of this component to initial state
                            //and also set the state of its parent component (the main container) to its initial state
                            //finally remove all the checked organisation and observation type
                            switchDataType("Raster");
                            this.props.fetchRasters(1, '', '', '', '');
                            onDataTypeChange();
                            this.setState({
                                searchObs: '',
                                searchOrg: '',
                                obsItems: 7,
                                orgItems: 7
                            });
                            if (checkedObservationType) updateObservationTypeRadiobutton(checkedObservationType.parameter);
                            if (checkedOrganisation) updateOrganisationRadiobutton(checkedOrganisation.name);
                            //Update the URL and remove all the search parameters
                            this.props.history.push('?data=Raster');
                        }}
                        disabled={currentDataType === "Raster" ? true : false}
                    >
                        Raster
                    </button>
                    <button 
                        className="switcher-button switcher-button-wms"
                        title="WMS layer"
                        onClick={() => {
                            switchDataType("WMS");
                            this.props.fetchWMSLayers(1, '', '', '');
                            onDataTypeChange();
                            this.setState({
                                searchObs: '',
                                searchOrg: '',
                                obsItems: 7,
                                orgItems: 7
                            });
                            if (checkedObservationType) updateObservationTypeRadiobutton(checkedObservationType.parameter);
                            if (checkedOrganisation) updateOrganisationRadiobutton(checkedOrganisation.name);
                            //Update the URL and remove all the search parameters
                            this.props.history.push('?data=WMS');
                        }}
                        disabled={currentDataType === "WMS" ? true : false}
                    >
                        WMS
                    </button>
                </div>
                <div 
                    className="filter-organisation"
                    //if there is no organisation in the filter bar then don't show this section
                    style={{
                        display: organisations.length === 0 ? "none" : ""
                    }}
                >
                    <h4 title="Filter by Organisation">Organisation</h4>
                    <form onSubmit={this.onOrgSubmit} className="list__searchbar" title="Type organisation name">
                        <input type="text" className="filter-box___searchbar-input list__searchbar-input" placeholder="search" onChange={this.onOrgChange} value={searchOrg} />
                        <button className="list__searchbar-button" type="submit">
                            <svg className="list__searchbar-icon">
                                <use xlinkHref="image/symbols.svg#icon-search" />
                            </svg>
                        </button>
                    </form>
                    {checkedOrganisation ?
                        //Showing the checked item and the option the remove this checked item from the filter
                        <div className="filter__checked-item">
                            <button onClick={() => onOrganisationRadiobutton(checkedOrganisation)}>x</button>
                            {checkedOrganisation.name}
                        </div>
                        :
                        <div className="filter__checked-item" />
                    }
                    <ul className="filter-list">
                        {filteredOrganisations.slice(0, this.state.orgItems).map((organisation: Organisation) => (
                            <li className="filter-item" key={organisation.uuid}>
                                <input type="radio" className="filter-radiobutton" onChange={() => onOrganisationRadiobutton(organisation)} checked={organisation.checked} />
                                <span className="filter-item-name">{organisation.name}</span>
                            </li>
                        ))}
                        {this.state.orgItems < filteredOrganisations.length ?
                            <button className="filter-list-button" onClick={() => this.setState({ orgItems: this.state.orgItems + 7 })}>more ...</button> :
                            <button style={{ display: 'none' }} />
                        }
                    </ul>
                </div>
                <div 
                    className="filter-observation-type"
                    //if there is no observation type in the filter bar then don't show this section
                    //Also don't show the observation type filter option for WMS layers
                    style={{ 
                        display: observationTypes.length === 0 || this.props.currentDataType === "WMS" ? "none" : "" 
                    }}
                >
                    <h4 title="Filter by Observation Type">Observation Type</h4>
                    <form onSubmit={this.onObsSubmit} className="list__searchbar" title="Type observation type's parameter name">
                        <input type="text" className="filter-box___searchbar-input list__searchbar-input" placeholder="search" onChange={this.onObsChange} value={searchObs} />
                        <button className="list__searchbar-button" type="submit">
                            <svg className="list__searchbar-icon">
                                <use xlinkHref="image/symbols.svg#icon-search" />
                            </svg>
                        </button>
                    </form>
                    {checkedObservationType ?
                        //Showing the checked item and the option the remove this checked item from the filter
                        <div className="filter__checked-item">
                            <button onClick={() => onObservationTypeRadiobutton(checkedObservationType)}>x</button>
                            {checkedObservationType.parameter}
                        </div>
                        :
                        <div className="filter__checked-item" />
                    }
                    <ul className="filter-list">
                        {filteredObservationTypes.slice(0, this.state.obsItems).map((observationType: ObservationType) => (
                            <li className="filter-item" key={observationType.code}>
                                <input type="radio" className="filter-radiobutton" onChange={() => onObservationTypeRadiobutton(observationType)} checked={observationType.checked} />
                                <span className="filter-item-name">{observationType.parameter}</span>
                            </li>
                        ))}
                        {this.state.obsItems < filteredObservationTypes.length ?
                            <button className="filter-list-button" onClick={() => this.setState({ obsItems: this.state.obsItems + 7 })}>more ...</button> :
                            <button style={{ display: 'none' }} />
                        }
                    </ul>
                </div>
            </div>
        );
    };
};

export default withRouter(FilterBar);