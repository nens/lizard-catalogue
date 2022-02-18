import { connect, useSelector } from 'react-redux';
import { ObservationType, Organisation, Layercollection } from '../interface';
import { getFilters, MyStore } from '../reducers';
import { RootDispatch } from '../store';
import {
    selectOrganisation,
    removeOrganisation,
    selectLayercollection,
    selectObservationType,
    removeObservationType,
    removeLayercollection,
    updatePage,
    SwitchDataType
} from '../action';
import FilterOption from '../components/FilterOption';
import styles from './FilterBar.module.css';

interface MyProps {
    observationTypes: ObservationType[],
    organisations: Organisation[],
    layercollections: Layercollection[],
    currentDataType: MyStore['currentDataType'],
    onDataTypeChange: (dataType: SwitchDataType['payload']) => void,
};

const FilterBar: React.FC<MyProps & DispatchProps> = (props)=> {
    const {
        observationTypes,
        organisations,
        layercollections,
        currentDataType,
        onDataTypeChange,
        selectOrganisation,
        removeOrganisation,
        selectLayercollection,
        removeLayercollection,
        selectObservationType,
        removeObservationType,
        updatePage
    } = props;

    const filters = useSelector(getFilters);

    return (
        <div className={styles.FilterBox}>
            <select
                className={styles.DataSwitcher}
                value={currentDataType}
                onChange={e => {
                    if (
                        e.target.value === "Raster" ||
                        e.target.value === "WMS" ||
                        e.target.value === "Timeseries" ||
                        e.target.value === "Scenario"
                    ) {
                        onDataTypeChange(e.target.value)
                    };
                }}
            >
                <option value="Raster">RASTER</option>
                <option value="WMS">WMS LAYER</option>
                <option value="Timeseries">TIME SERIES</option>
                <option value="Scenario">SCENARIO</option>
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
            {currentDataType === "Raster" || currentDataType === "WMS" ? (
                <FilterOption
                    filterOption="layercollection"
                    listOfItems={layercollections}
                    filterValue={filters.layercollection}
                    selectItem={value => {
                        updatePage(1);
                        selectLayercollection(value);
                    }}
                    removeItem={removeLayercollection}
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

const mapDispatchToProps = (dispatch: RootDispatch) => ({
    selectOrganisation: (organisationName: string) => dispatch(selectOrganisation(organisationName)),
    removeOrganisation: () => dispatch(removeOrganisation()),
    selectLayercollection: (layercollectionSlug: string) => dispatch(selectLayercollection(layercollectionSlug)),
    removeLayercollection: () => dispatch(removeLayercollection()),
    selectObservationType: (observationTypeParameter: string) => dispatch(selectObservationType(observationTypeParameter)),
    removeObservationType: () => dispatch(removeObservationType()),
    updatePage: (page: number) => dispatch(updatePage(page)),
});
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

export default connect(null, mapDispatchToProps)(FilterBar);