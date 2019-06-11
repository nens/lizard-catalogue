import * as React from 'react';
import './FilterBar.css';
import { ObservationType, Organisation } from '../interface';

interface MyProps {
    fetchObservationTypes: (searchObs: string) => void,
    fetchOrganisations: (searchOrg: string) => void,
    observationTypes: ObservationType[],
    organisations: Organisation[],
    onObservationTypeCheckbox: (obsType: ObservationType) => void,
    onOrganisationCheckbox: (organisation: Organisation) => void
};

interface MyState {
    searchObs: string,
    searchOrg: string,
    obsItems: number,
    orgItems: number
};

class FilterBar extends React.Component<MyProps, MyState> {
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
        this.props.fetchObservationTypes(this.state.searchObs);
        this.setState({
            searchObs: ''
        });
    };

    //Handling on change and on submit for the Organisation search
    onOrgChange = (event) => {
        this.setState({
            searchOrg: event.target.value
        });
    };

    onOrgSubmit = (event) => {
        event.preventDefault();
        this.props.fetchOrganisations(this.state.searchOrg);
        this.setState({
            searchOrg: ''
        });
    };

    //Handling changes when click on the checkbox
    onObservationTypeChange = (observationType: ObservationType, observationTypes: MyProps['observationTypes']) => {
        //Toggle the checked property on click
        observationType.checked = !observationType.checked;
        //Only one observation type can be selected at a time
        observationTypes.filter(obs => obs.parameter !== observationType.parameter).map(obs => obs.checked = false);
    };

    onOrganisationChange = (organisation: Organisation, organisations: MyProps['organisations']) => {
        //Toggle the checked property on click
        organisation.checked = !organisation.checked;
        //Only one organisation can be selected at a time
        organisations.filter(org => org.uuid !== organisation.uuid).map(org => org.checked = false);
    };

    componentDidMount() {
        this.props.fetchObservationTypes(this.state.searchObs);
        this.props.fetchOrganisations(this.state.searchOrg);
    };

    render() {
        const { searchObs, searchOrg } = this.state;

        const { observationTypes, organisations, onObservationTypeCheckbox, onOrganisationCheckbox } = this.props;

        return (
            <div className="filter">
                <div className="filter-title">Filters</div>
                <div className="filter-box">
                    <div className="filter-observation-type">
                        <h4>Observation Type</h4>
                        <form onSubmit={this.onObsSubmit} className="raster-list__searchbar">
                            <input type="text" className="filter-box___searchbar-input raster-list__searchbar-input" placeholder="search" onChange={this.onObsChange} value={searchObs} />
                            <button className="raster-list__searchbar-button" type="submit">
                                <svg className="raster-list__searchbar-icon">
                                    <use xlinkHref="image/symbols.svg#icon-search" />
                                </svg>
                            </button>
                        </form>
                        <ul className="filter-list">
                            {observationTypes.slice(0, this.state.obsItems).map((observationType: ObservationType) => (
                                <li className="filter-item" key={observationType.code}>
                                    <input type="checkbox" className="filter-checkbox" onClick={() => onObservationTypeCheckbox(observationType)} onChange={() => this.onObservationTypeChange(observationType, observationTypes)} checked={observationType.checked} />
                                    <span className="filter-item-name">{observationType.parameter}</span>
                                </li>
                            ))}
                            {this.state.obsItems < observationTypes.length ?
                                <button className="filter-list-button" onClick={() => this.setState({ obsItems: this.state.obsItems + 7 })}>more ...</button> :
                                <button style={{ display: 'none' }} />
                            }
                        </ul>
                    </div>
                    <div className="filter-organisation">
                        <h4>Organisation</h4>
                        <form onSubmit={this.onOrgSubmit} className="raster-list__searchbar">
                            <input type="text" className="filter-box___searchbar-input raster-list__searchbar-input" placeholder="search" onChange={this.onOrgChange} value={searchOrg} />
                            <button className="raster-list__searchbar-button" type="submit">
                                <svg className="raster-list__searchbar-icon">
                                    <use xlinkHref="image/symbols.svg#icon-search" />
                                </svg>
                            </button>
                        </form>
                        <ul className="filter-list">
                            {organisations.slice(0, this.state.orgItems).map((organisation: Organisation) => (
                                <li className="filter-item" key={organisation.name}>
                                    <input type="checkbox" className="filter-checkbox" onClick={() => onOrganisationCheckbox(organisation)} onChange={() => this.onOrganisationChange(organisation, organisations)} checked={organisation.checked} />
                                    <span className="filter-item-name">{organisation.name}</span>
                                </li>
                            ))}
                            {this.state.orgItems < organisations.length ?
                                <button className="filter-list-button" onClick={() => this.setState({ orgItems: this.state.orgItems + 7 })}>more ...</button> :
                                <button style={{ display: 'none' }} />
                            }
                        </ul>
                    </div>
                </div>
            </div>
        );
    };
};

export default FilterBar;