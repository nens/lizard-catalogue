import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { ObservationType, Organisation, Dataset, SwitchDataType } from '../interface';
import { MyStore } from '../reducers';
import SearchBar from './components/SearchBar';
import { selectOrganisation, removeOrganisation, selectDataset, selectObservationType, removeObservationType, removeDataset } from '../action';
import './styles/FilterBar.css';

interface MyProps {
    observationTypes: ObservationType[],
    organisations: Organisation[],
    datasets: Dataset[],
    currentDataType: MyStore['currentDataType'],
    onDataTypeChange: (dataType: SwitchDataType['payload']) => void,
};

interface MyState {
    searchObs: string,
    searchOrg: string,
    searchDataset: string,
    obsItems: number,
    orgItems: number,
    datasetItems: number
};

interface PropsFromState {
    filters: MyStore['filters'],
};

interface PropsFromDispatch {
    selectOrganisation: (organisationName: string) => void,
    removeOrganisation: () => void,
    selectDataset: (datasetSlug: string) => void,
    removeDataset: () => void,
    selectObservationType: (observationTypeParameter: string) => void,
    removeObservationType: () => void,
};

type FilterBarProps = MyProps & PropsFromState & PropsFromDispatch & RouteComponentProps;

class FilterBar extends React.Component<FilterBarProps, MyState> {
    state: MyState = {
        searchObs: '',
        searchOrg: '',
        searchDataset: '',
        obsItems: 4,
        orgItems: 4,
        datasetItems: 4
    };

    onFilterChange = (event, formName: string) => {
        //for organisation
        if (formName === 'organisation') this.setState({
            searchOrg: event.target.value
        });
        //for dataset
        if (formName === 'dataset') this.setState({
            searchDataset: event.target.value
        });
        //for observation type
        if (formName === 'observationType') this.setState({
            searchObs: event.target.value
        });
    };

    onFilterSubmit = (event) => {
        event.preventDefault();
    };

    render() {
        const { searchObs, searchOrg, searchDataset } = this.state;

        const {
            observationTypes,
            organisations,
            datasets,
            currentDataType,
            onDataTypeChange,
            filters,
            selectOrganisation,
            removeOrganisation,
            selectDataset,
            removeDataset,
            selectObservationType,
            removeObservationType,
        } = this.props;

        //Filter observation types & organisations & datasets at the client side instead of fetching again from the server after each search
        const filteredObservationTypes = observationTypes.filter(observationTypes => observationTypes.parameter.toLowerCase().includes(this.state.searchObs.toLowerCase()));
        const filteredOrganisations = organisations.filter(organisation => organisation.name.toLowerCase().includes(this.state.searchOrg.toLowerCase()));
        const filteredDatasets = datasets.filter(dataset => dataset.slug.toLowerCase().includes(this.state.searchDataset.toLowerCase()));

        return (
            <div className="filter-box">
                <select
                    className="switcher"
                    value={currentDataType}
                    onChange={e => {
                        if (
                            e.target.value === "Raster" ||
                            e.target.value === "WMS" ||
                            e.target.value === "Timeseries"
                        ) {
                            onDataTypeChange(e.target.value)
                        };
                    }}
                >
                    <option value="Raster">RASTER</option>
                    <option value="WMS">WMS LAYER</option>
                    <option value="Timeseries">TIME SERIES</option>
                </select>
                <div 
                    className="filter-organisation"
                    //if there is no organisation in the filter bar then don't show this section
                    style={{
                        display: organisations.length === 0 ? "none" : ""
                    }}
                >
                    <h4 title="Filter by Organisation">Organisation</h4>
                    <SearchBar
                        name="filterSearchBar"
                        searchTerm={searchOrg}
                        title="Type organisation name"
                        placeholder="search"
                        onSearchSubmit={this.onFilterSubmit}
                        onSearchChange={(event) => this.onFilterChange(event, 'organisation')}
                    />
                    {filters.organisation ? (
                        <div className="filter__checked-item">
                            <button onClick={removeOrganisation}>x</button>
                            {filters.organisation}
                        </div>
                    ) : (
                        <div className="filter__checked-item" />
                    )}
                    <ul className="filter-list">
                        {filteredOrganisations.slice(0, this.state.orgItems).map(organisation => (
                            <li className="filter-item" key={organisation.uuid}>
                                <input
                                    type="radio"
                                    name="organisation"
                                    className="filter-radiobutton"
                                    onChange={() => selectOrganisation(organisation.name)}
                                    checked={organisation.name === filters.organisation}
                                />
                                <label className="filter-item-name">{organisation.name}</label>
                            </li>
                        ))}
                        {this.state.orgItems < filteredOrganisations.length ?
                            <button className="filter-list-button" onClick={() => this.setState({ orgItems: this.state.orgItems + 4 })}>more ...</button> :
                            <button style={{ display: 'none' }} />
                        }
                    </ul>
                </div>
                <div 
                    className="filter-dataset"
                    //if there is no dataset in the filter bar then don't show this section
                    style={{
                        display: datasets.length === 0 ? "none" : "" || this.props.currentDataType === "Timeseries" ? "none" : ""
                    }}
                >
                    <h4 title="Filter by Dataset">Dataset</h4>
                    <SearchBar
                        name="filterSearchBar"
                        searchTerm={searchDataset}
                        title="Type dataset name"
                        placeholder="search"
                        onSearchSubmit={this.onFilterSubmit}
                        onSearchChange={(event) => this.onFilterChange(event, 'dataset')}
                    />
                    {filters.dataset ?
                        <div className="filter__checked-item">
                            <button onClick={removeDataset}>x</button>
                            {filters.dataset}
                        </div>
                        :
                        <div className="filter__checked-item" />
                    }
                    <ul className="filter-list">
                        {filteredDatasets.slice(0, this.state.datasetItems).map(dataset => (
                            <li className="filter-item" key={dataset.slug}>
                                <input
                                    type="radio"
                                    name="dataset"
                                    className="filter-radiobutton"
                                    onChange={() => selectDataset(dataset.slug)}
                                    checked={dataset.slug === filters.dataset}
                                />
                                <label className="filter-item-name">{dataset.slug}</label>
                            </li>
                        ))}
                        {this.state.datasetItems < filteredDatasets.length ?
                            <button className="filter-list-button" onClick={() => this.setState({ datasetItems: this.state.datasetItems + 4 })}>more ...</button> :
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
                    <SearchBar
                        name="filterSearchBar"
                        searchTerm={searchObs}
                        title="Type observation type's parameter name"
                        placeholder="search"
                        onSearchSubmit={this.onFilterSubmit}
                        onSearchChange={(event) => this.onFilterChange(event, 'observationType')}
                    />
                    {filters.observationType ? (
                        <div className="filter__checked-item">
                            <button onClick={removeObservationType}>x</button>
                            {filters.observationType}
                        </div>
                    ) : (
                        <div className="filter__checked-item" />
                    )}
                    <ul className="filter-list">
                        {filteredObservationTypes.slice(0, this.state.obsItems).map(observationType => (
                            <li className="filter-item" key={observationType.code}>
                                <input
                                    type="radio"
                                    name="observationType"
                                    className="filter-radiobutton"
                                    onChange={() => selectObservationType(observationType.parameter)}
                                    checked={observationType.parameter === filters.observationType}
                                />
                                <span className="filter-item-name">{observationType.parameter}</span>
                            </li>
                        ))}
                        {this.state.obsItems < filteredObservationTypes.length ?
                            <button className="filter-list-button" onClick={() => this.setState({ obsItems: this.state.obsItems + 4 })}>more ...</button> :
                            <button style={{ display: 'none' }} />
                        }
                    </ul>
                </div>
            </div>
        );
    };
};

const mapStateToProps = (state: MyStore): PropsFromState => ({
    filters: state.filters,
});

const mapDispatchToProps = (dispatch): PropsFromDispatch => ({
    selectOrganisation: (organisationName: string) => selectOrganisation(dispatch, organisationName),
    removeOrganisation: () => removeOrganisation(dispatch),
    selectDataset: (datasetSlug: string) => selectDataset(dispatch, datasetSlug),
    removeDataset: () => removeDataset(dispatch),
    selectObservationType: (observationTypeParameter: string) => selectObservationType(dispatch, observationTypeParameter),
    removeObservationType: () => removeObservationType(dispatch),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(FilterBar));