import * as React from 'react';
import { connect } from 'react-redux';
import { ObservationType, Organisation, Dataset, SwitchDataType } from '../interface';
import { MyStore } from '../reducers';
import { selectOrganisation, removeOrganisation, selectDataset, selectObservationType, removeObservationType, removeDataset } from '../action';
import FilterOption from './components/FilterOption';
import './styles/FilterBar.css';

interface MyProps {
    observationTypes: ObservationType[],
    organisations: Organisation[],
    datasets: Dataset[],
    currentDataType: MyStore['currentDataType'],
    onDataTypeChange: (dataType: SwitchDataType['payload']) => void,
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

class FilterBar extends React.Component<MyProps & PropsFromState & PropsFromDispatch> {
    render() {
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
                <FilterOption
                    filterOption="organisation"
                    listOfItems={organisations}
                    filterValue={filters.organisation}
                    selectItem={selectOrganisation}
                    removeItem={removeOrganisation}
                />
                {currentDataType !== "Timeseries" ? (
                    <FilterOption
                        filterOption="dataset"
                        listOfItems={datasets}
                        filterValue={filters.dataset}
                        selectItem={selectDataset}
                        removeItem={removeDataset}
                    />
                ) : null}
                {currentDataType !== "WMS" ? (
                    <FilterOption
                        filterOption="observationType"
                        listOfItems={observationTypes}
                        filterValue={filters.observationType}
                        selectItem={selectObservationType}
                        removeItem={removeObservationType}
                    />
                ) : null}
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

export default connect(mapStateToProps, mapDispatchToProps)(FilterBar);