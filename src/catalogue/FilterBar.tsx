import React from 'react';
import { connect, useSelector } from 'react-redux';
import { ObservationType, Organisation, Dataset, SwitchDataType } from '../interface';
import { getFilters, MyStore } from '../reducers';
import {
    selectOrganisation,
    removeOrganisation,
    selectDataset,
    selectObservationType,
    removeObservationType,
    removeDataset,
    updatePage
} from '../action';
import FilterOption from './components/FilterOption';
import './styles/FilterBar.css';

interface MyProps {
    observationTypes: ObservationType[],
    organisations: Organisation[],
    datasets: Dataset[],
    currentDataType: MyStore['currentDataType'],
    onDataTypeChange: (dataType: SwitchDataType['payload']) => void,
};

const FilterBar: React.FC<MyProps & DispatchProps> = (props)=> {
    const {
        observationTypes,
        organisations,
        datasets,
        currentDataType,
        onDataTypeChange,
        selectOrganisation,
        removeOrganisation,
        selectDataset,
        removeDataset,
        selectObservationType,
        removeObservationType,
        updatePage
    } = props;

    const filters = useSelector(getFilters);

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
                selectItem={value => {
                    updatePage(1);
                    selectOrganisation(value);
                }}
                removeItem={removeOrganisation}
            />
            {currentDataType !== "Timeseries" ? (
                <FilterOption
                    filterOption="dataset"
                    listOfItems={datasets}
                    filterValue={filters.dataset}
                    selectItem={value => {
                        updatePage(1);
                        selectDataset(value);
                    }}
                    removeItem={removeDataset}
                />
            ) : null}
            {currentDataType === "Raster" ? (
                <FilterOption
                    filterOption="observationType"
                    listOfItems={observationTypes}
                    filterValue={filters.observationType}
                    selectItem={value => {
                        updatePage(1);
                        selectObservationType(value);
                    }}
                    removeItem={removeObservationType}
                />
            ) : null}
        </div>
    );
};

const mapDispatchToProps = (dispatch: any) => ({
    selectOrganisation: (organisationName: string) => selectOrganisation(dispatch, organisationName),
    removeOrganisation: () => removeOrganisation(dispatch),
    selectDataset: (datasetSlug: string) => selectDataset(dispatch, datasetSlug),
    removeDataset: () => removeDataset(dispatch),
    selectObservationType: (observationTypeParameter: string) => selectObservationType(dispatch, observationTypeParameter),
    removeObservationType: () => removeObservationType(dispatch),
    updatePage: (page: number) => updatePage(dispatch, page),
});
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

export default connect(null, mapDispatchToProps)(FilterBar);