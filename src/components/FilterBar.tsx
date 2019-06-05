import * as React from 'react';
import './FilterBar.css';
import { ObservationType, Organisation } from '../interface';

interface MyProps {
    fetchObservationTypes: () => void,
    fetchOrganisations: (searchTerm: string) => void,
    observationTypes: ObservationType[],
    organisations: Organisation[]
};

interface MyState {
    searchTerm: string,
    obsItems: number,
    orgItems: number
};

class FilterBar extends React.Component<MyProps, MyState> {
    state: MyState = {
        searchTerm: '',
        obsItems: 7,
        orgItems: 7
    };

    onChange = (event) => {
        this.setState({
            searchTerm: event.target.value
        });
    };

    onSubmit = (event) => {
        event.preventDefault();
        this.props.fetchOrganisations(this.state.searchTerm);
        this.setState({
            searchTerm: ''
        });
    };

    componentDidMount() {
        this.props.fetchObservationTypes();
        this.props.fetchOrganisations(this.state.searchTerm);
    };

    render() {
        const { searchTerm } = this.state;

        const { observationTypes, organisations } = this.props;

        if (observationTypes.length === 0 || organisations.length === 0) return (
            <div className="filter">
                <div className="filter-title">Filters</div>
                <div className="filter-box"><h3>Loading ...</h3></div>
            </div>
        );

        return (
            <div className="filter">
                <div className="filter-title">Filters</div>
                <div className="filter-box">
                    <form onSubmit={this.onSubmit} className="raster-list__searchbar">
                        <input type="text" className="filter-box___searchbar-input raster-list__searchbar-input" placeholder="search" onChange={this.onChange} value={searchTerm} />
                        <button className="raster-list__searchbar-button" type="submit">
                            <svg className="raster-list__searchbar-icon">
                                <use xlinkHref="image/symbols.svg#icon-search" />
                            </svg>
                        </button>
                    </form>
                    <div className="filter-observation-type">
                        <h4>Observation Type</h4>
                        <ul className="filter-list">
                            {observationTypes.slice(0, this.state.obsItems).map((observationType: ObservationType) => (
                                <li className="filter-item" key={observationType.code}>
                                    <input type="checkbox" className="filter-checkbox" />
                                    <span className="filter-item-name">{observationType.parameter}</span>
                                </li>
                            ))}
                            <button className="filter-list-button" onClick={() => this.setState({obsItems: this.state.obsItems + 7})}>more ...</button>
                        </ul>
                    </div>
                    <div className="filter-organisation">
                        <h4>Organisation</h4>
                        <ul className="filter-list">
                            {organisations.slice(0, this.state.orgItems).map((organisation: Organisation) => (
                                <li className="filter-item" key={organisation.name}>
                                    <input type="checkbox" className="filter-checkbox" />
                                    <span className="filter-item-name">{organisation.name}</span>
                                </li>
                            ))}
                            <button className="filter-list-button" onClick={() => this.setState({orgItems: this.state.orgItems + 7})}>more ...</button>
                        </ul>
                    </div>
                </div>
            </div>
        );
    };
};

export default FilterBar;