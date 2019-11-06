import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Dispatch } from 'redux';
import { fetchRasters, updateBasket, fetchObservationTypes, fetchOrganisations, fetchDatasets, fetchLizardBootstrap, switchDataType, selectItem, fetchWMSLayers, updateOrganisationRadiobutton, updateObservationTypeRadiobutton, updateDatasetRadiobutton, toggleAlert } from '../action';
import { MyStore, getCurrentRasterList, getObservationTypes, getOrganisations, getDatasets, getCurrentDataType, getCurrentWMSList } from '../reducers';
import { RasterActionType, ObservationType, Organisation, Dataset, Basket, FilterActionType, SwitchDataType, UpdateRadiobuttonActionType } from '../interface';
import { getUrlParams, getSearch, getOrganisation, getObservationType, getDataset, getDataType, newURL } from '../utils/getUrlParams';
import RasterList from './rasters/RasterList';
import RasterDetails from './rasters/RasterDetails';
import WMSList from './wms/WMSList';
import WMSDetails from './wms/WMSDetails';
import FilterBar from './FilterBar';
import Header from './Header';
import './styles/MainApp.css';

interface PropsFromState {
    currentRasterList: MyStore['currentRasterList'] | null,
    currentWMSList: MyStore['currentWMSList'] | null,
    observationTypes: ObservationType[],
    organisations: Organisation[],
    datasets: Dataset[],
    currentDataType: MyStore['currentDataType'],
};

interface PropsFromDispatch {
    fetchLizardBootstrap: () => void,
    selectItem: (uuid: string) => void,
    fetchRasters: (page: number, searchTerm: string, organisationName: string, observationTypeParameter: string, datasetSlug: string, ordering: string) => void,
    updateBasket: (basket: MyStore['basket']) => void,
    fetchObservationTypes: (parameter: ObservationType['parameter']) => void,
    fetchOrganisations: (name: Organisation['name']) => void,
    fetchDatasets: (slug: Dataset['slug']) => void,
    updateObservationTypeRadiobutton: (parameter: ObservationType['parameter']) => void,
    updateOrganisationRadiobutton: (name: Organisation['name']) => void,
    updateDatasetRadiobutton: (slug: Dataset['slug']) => void,
    fetchWMSLayers: (page: number, searchTerm: string, organisationName: string, datasetSlug: string, ordering: string) => void,
    switchDataType: (dataType: SwitchDataType['payload']) => void,
    toggleAlert: () => void,
};

type MainAppProps = PropsFromState & PropsFromDispatch & RouteComponentProps;

interface MyState {
    showProfileDropdown: boolean,
    page: number,
    initialPage: number,
    searchTerm: string,
    ordering: string,
    raster: {
        organisationName: string,
        observationType: string,
        datasetSlug: string,
    },
    wms: {
        organisationName: string,
        datasetSlug: string,
    }
};

class MainApp extends React.Component<MainAppProps, MyState> {
    state: MyState = {
        showProfileDropdown: false,
        page: 1,
        initialPage: 1,
        searchTerm: '',
        ordering: '',
        raster: {
            organisationName: '',
            observationType: '',
            datasetSlug: ''
        },
        wms: {
            organisationName: '',
            datasetSlug: ''
        }
    };

    toggleProfileDropdownAndAlertMessage = (event) => {
        if (this.props.currentRasterList && this.props.currentRasterList.showAlert === true) this.props.toggleAlert();
        if (this.props.currentWMSList && this.props.currentWMSList.showAlert === true) this.props.toggleAlert();
        return event.target.id === "user-profile" ?
            this.setState({ showProfileDropdown: !this.state.showProfileDropdown }) :
            this.setState({ showProfileDropdown: false });
    };

    onPageClick = (page: number) => {
        if (page < 1) return page = 1;
        this.props.currentDataType === "Raster" ? this.props.fetchRasters(
            page,
            this.state.searchTerm,
            this.state.raster.organisationName,
            this.state.raster.observationType,
            this.state.raster.datasetSlug,
            this.state.ordering
        ) : this.props.fetchWMSLayers(
            page,
            this.state.searchTerm,
            this.state.wms.organisationName,
            this.state.wms.datasetSlug,
            this.state.ordering
        );
        this.setState({
            page: page,
        });
    };

    onSearchChange = (event) => {
        this.setState({
            searchTerm: event.target.value
        });
    };

    onSearchSubmit = (event) => {
        event.preventDefault();
        this.setState({
            page: 1
        });

        if (this.props.currentDataType === 'Raster') {
            this.props.fetchRasters(
                this.state.initialPage,
                this.state.searchTerm,
                this.state.raster.organisationName,
                this.state.raster.observationType,
                this.state.raster.datasetSlug,
                this.state.ordering
            );
            //Update the URL search params with the new search term
            const url = newURL(
                this.props.currentDataType,
                this.state.searchTerm,
                this.state.raster.organisationName,
                this.state.raster.observationType,
                this.state.raster.datasetSlug
            );
            this.updateURL(url);
        } else { // dataType === "WMS"
            this.props.fetchWMSLayers(
                this.state.page,
                this.state.searchTerm,
                this.state.wms.organisationName,
                this.state.wms.datasetSlug,
                this.state.ordering
            );
            //Update the URL search params with the new search term
            const url = newURL(
                this.props.currentDataType,
                this.state.searchTerm,
                this.state.wms.organisationName,
                '',
                this.state.wms.datasetSlug
            );
            this.updateURL(url);
        };
    };

    updateURL = (url: string) => {
        this.props.history.push(`${url}`);
    };

    //When click on the radio button in the filter bar, this function will dispatch an action to toggle the checked property of the observation type
    //and update the observation type state in this component
    onObservationTypeRadiobutton = (obsType: ObservationType) => {
        this.props.updateObservationTypeRadiobutton(obsType.parameter);
        if (!obsType.checked) {
            this.setState({
                raster: {
                    ...this.state.raster,
                    observationType: obsType.parameter
                }
            });
        } else {
            this.setState({
                raster: {
                    ...this.state.raster,
                    observationType: ''
                }
            });
        };
        //Update the URL search params with the selected observation type
        const url = newURL(
            this.props.currentDataType,
            this.state.searchTerm,
            this.state.raster.organisationName,
            (!obsType.checked ? obsType.parameter : ''),
            this.state.raster.datasetSlug
        );
        this.updateURL(url);
    };

    //Submit the search in observation type filter bar will update the radio button and set the observationType state of this component
    //then update the URL search params
    onObservationTypeSearchSubmit = (obsTypeParameter: string) => {
        this.props.updateObservationTypeRadiobutton(obsTypeParameter);
        this.setState({
            raster: {
                ...this.state.raster,
                observationType: obsTypeParameter
            }
        });
        //Update the URL search params with the selected observation type
        const url = newURL(
            this.props.currentDataType,
            this.state.searchTerm,
            this.state.raster.organisationName,
            obsTypeParameter,
            this.state.raster.datasetSlug
        );
        this.updateURL(url);
    };

    //When click on the radio button in the filter bar, this function will dispatch an action to toggle the checked property of the organisation
    //and update the organisation name state in this component
    onOrganisationRadiobutton = (organisation: Organisation, dataType: SwitchDataType['payload']) => {
        this.props.updateOrganisationRadiobutton(organisation.name);
        if (dataType === 'Raster') {
            if (!organisation.checked) {
                this.setState({
                    raster: {
                        ...this.state.raster,
                        organisationName: organisation.name
                    }
                });
            } else {
                this.setState({
                    raster: {
                        ...this.state.raster,
                        organisationName: ''
                    }
                });
            };
            //Update the URL search params with the selected organisation
            const url = newURL(
                this.props.currentDataType,
                this.state.searchTerm,
                (!organisation.checked ? organisation.name : ''),
                this.state.raster.observationType,
                this.state.raster.datasetSlug
            );
            this.updateURL(url);
        } else { // dataType === "WMS"
            if (!organisation.checked) {
                this.setState({
                    wms: {
                        ...this.state.wms,
                        organisationName: organisation.name
                    }
                });
            } else {
                this.setState({
                    wms: {
                        ...this.state.wms,
                        organisationName: ''
                    }
                });
            };
            //Update the URL search params with the selected organisation
            const url = newURL(
                this.props.currentDataType,
                this.state.searchTerm,
                (!organisation.checked ? organisation.name : ''),
                '',
                this.state.wms.datasetSlug
            );
            this.updateURL(url);
        };
    };

    //Submit the search in organisation filter bar will update the radio button and set the organisationName state of this component
    //then update the URL search params
    onOrganisationSearchSubmit = (organisationName: string, dataType: SwitchDataType['payload']) => {
        this.props.updateOrganisationRadiobutton(organisationName);
        if (dataType === 'Raster') {
            this.setState({
                raster: {
                    ...this.state.raster,
                    organisationName: organisationName
                }
            });
            //Update the URL search params with the selected organisation
            const url = newURL(
                this.props.currentDataType,
                this.state.searchTerm,
                organisationName,
                this.state.raster.observationType,
                this.state.raster.datasetSlug
            );
            this.updateURL(url);
        } else { // dataType === "WMS"
            this.setState({
                wms: {
                    ...this.state.wms,
                    organisationName: organisationName
                }
            });
            //Update the URL search params with the selected organisation
            const url = newURL(
                this.props.currentDataType,
                this.state.searchTerm,
                organisationName,
                '',
                this.state.wms.datasetSlug
            );
            this.updateURL(url);
        };
    };

    //When click on the radio button in the filter bar, this function will dispatch an action to toggle the checked property of the dataset
    //and update the dataset state in this component
    onDatasetRadiobutton = (dataset: Dataset, dataType: SwitchDataType['payload']) => {
        this.props.updateDatasetRadiobutton(dataset.slug);
        if (dataType === 'Raster') {
            if (!dataset.checked) {
                this.setState({
                    raster: {
                        ...this.state.raster,
                        datasetSlug: dataset.slug
                    }
                });
            } else {
                this.setState({
                    raster: {
                        ...this.state.raster,
                        datasetSlug: ''
                    }
                });
            };
            //Update the URL search params with the selected organisation
            const url = newURL(
                this.props.currentDataType,
                this.state.searchTerm,
                this.state.raster.organisationName,
                this.state.raster.observationType,
                (!dataset.checked ? dataset.slug : '')
            );
            this.updateURL(url);
        } else { // dataType === "WMS"
            if (!dataset.checked) {
                this.setState({
                    wms: {
                        ...this.state.wms,
                        datasetSlug: dataset.slug
                    }
                });
            } else {
                this.setState({
                    wms: {
                        ...this.state.wms,
                        datasetSlug: ''
                    }
                });
            };
            //Update the URL search params with the selected organisation
            const url = newURL(
                this.props.currentDataType,
                this.state.searchTerm,
                this.state.wms.organisationName,
                '',
                (!dataset.checked ? dataset.slug : '')
            );
            this.updateURL(url);
        };
    };

    //Submit the search in dataset filter bar will update the radio button and set the datasetSlug state of this component
    //then update the URL search params
    onDatasetSearchSubmit = (datasetSlug: string, dataType: SwitchDataType['payload']) => {
        this.props.updateDatasetRadiobutton(datasetSlug);
        if (dataType === 'Raster') {
            this.setState({
                raster: {
                    ...this.state.raster,
                    datasetSlug: datasetSlug
                }
            });
            //Update the URL search params with the selected dataset
            const url = newURL(
                this.props.currentDataType,
                this.state.searchTerm,
                this.state.raster.organisationName,
                this.state.raster.observationType,
                datasetSlug
            );
            this.updateURL(url);
        } else { // dataType === "WMS"
            this.setState({
                wms: {
                    ...this.state.wms,
                    datasetSlug: datasetSlug
                }
            });
            //Update the URL search params with the selected dataset
            const url = newURL(
                this.props.currentDataType,
                this.state.searchTerm,
                this.state.wms.organisationName,
                '',
                datasetSlug
            );
            this.updateURL(url);
        };
    };

    //When click on the sorting icon in the raster list, this function will update the ordering state in this component
    onSorting = (ordering: string) => {
        //Sorting rasters in 2 ways if user clicks on the sorting icon multiple times
        if (ordering !== this.state.ordering) {
            this.setState({
                ordering: ordering
            });
        } else {
            this.setState({
                ordering: `-${ordering}`
            });
        };
    };

    //Select between Raster or WMS layer data
    onDataSelection = (dataType: SwitchDataType['payload']) => {
        const {
            raster,
            wms
        } = this.state;

        //Set the state back to its initial state
        this.setState({
            page: 1,
            searchTerm: '',
            ordering: ''
        });

        if (dataType === 'Raster') {
            this.props.switchDataType('Raster');
            this.props.fetchRasters(
                1,
                '',
                raster.organisationName,
                raster.observationType,
                raster.datasetSlug,
                ''
            );
            const url = newURL(
                'Raster',
                '',
                raster.organisationName,
                raster.observationType,
                raster.datasetSlug,
            );
            //Update the URL
            this.updateURL(url);

            //Update the radio buttons in the filter bar
            if (wms.organisationName !== raster.organisationName) this.props.updateOrganisationRadiobutton(raster.organisationName);
            if (wms.datasetSlug !== raster.datasetSlug) this.props.updateDatasetRadiobutton(raster.datasetSlug);
        } else { // dataType === "WMS"
            this.props.switchDataType('WMS');
            this.props.fetchWMSLayers(
                1,
                '',
                wms.organisationName,
                wms.datasetSlug,
                ''
            );
            const url = newURL(
                'WMS',
                '',
                wms.organisationName,
                '',
                wms.datasetSlug
            );
            //Update the URL
            this.updateURL(url);

            //Update the radio buttons in the filter bar
            if (wms.organisationName !== raster.organisationName) this.props.updateOrganisationRadiobutton(wms.organisationName);
            if (wms.datasetSlug !== raster.datasetSlug) this.props.updateDatasetRadiobutton(wms.datasetSlug);
        };
    };

    async componentDidMount() {
        //When component first mount, capture the search params in the URL and update the component's state
        const urlSearchParams = getUrlParams(this.props.location.search);
        const search = getSearch(urlSearchParams);
        const organisation = getOrganisation(urlSearchParams);
        const observation = getObservationType(urlSearchParams);
        const dataset = getDataset(urlSearchParams);

        const dataType = getDataType(urlSearchParams);
        //Dispatch the switchDataType action to update the currentDataType state in Redux store with the data param
        this.props.switchDataType(dataType);

        //Update the component's state with the search params in the URL
        if (dataType === 'Raster') {
            this.setState({
                searchTerm: search,
                raster: {
                    organisationName: organisation,
                    observationType: observation,
                    datasetSlug: dataset
                }
            });
        } else { // dataType === "WMS"
            this.setState({
                searchTerm: search,
                wms: {
                    organisationName: organisation,
                    datasetSlug: dataset
                }
            });
        };

        //Fetch Lizard Bootstrap
        this.props.fetchLizardBootstrap();

        //Fetch Rasters or WMS layers depends on the selected data type
        dataType === 'Raster' ? this.props.fetchRasters(
            this.state.page, search, organisation, observation, dataset, this.state.ordering
        ) : this.props.fetchWMSLayers(
            this.state.page, search, organisation, dataset, this.state.ordering
        );
    };

    //Component will fetch the Rasters or WMS again each time the state changes
    componentWillUpdate(nextProps: MainAppProps, nextState: MyState) {
        if (nextProps && (
            nextState.raster.organisationName !== this.state.raster.organisationName ||
            nextState.raster.observationType !== this.state.raster.observationType ||
            nextState.raster.datasetSlug !== this.state.raster.datasetSlug ||
            nextState.wms.organisationName !== this.state.wms.organisationName ||
            nextState.wms.datasetSlug !== this.state.wms.datasetSlug ||
            nextState.ordering !== this.state.ordering
            )
        ) {
            this.props.currentDataType === "Raster" ? this.props.fetchRasters(
                this.state.initialPage,
                this.state.searchTerm,
                nextState.raster.organisationName,
                nextState.raster.observationType,
                nextState.raster.datasetSlug,
                nextState.ordering
            ) : this.props.fetchWMSLayers(
                this.state.initialPage,
                this.state.searchTerm,
                nextState.wms.organisationName,
                nextState.wms.datasetSlug,
                nextState.ordering
            );
            this.setState({
                page: 1
            });
        };
    };

    render() {
        return (
            <div className="main-container" onClick={this.toggleProfileDropdownAndAlertMessage}>
                <div className="main-header">
                    <Header
                        showProfileDropdown={this.state.showProfileDropdown}
                        toggleProfileDropdown={this.toggleProfileDropdownAndAlertMessage}
                    />
                </div>
                <div className="main-body">
                    <FilterBar
                        fetchObservationTypes={this.props.fetchObservationTypes}
                        observationTypes={this.props.observationTypes}
                        fetchOrganisations={this.props.fetchOrganisations}
                        organisations={this.props.organisations}
                        fetchDatasets={this.props.fetchDatasets}
                        datasets={this.props.datasets}
                        onObservationTypeRadiobutton={this.onObservationTypeRadiobutton}
                        onOrganisationRadiobutton={this.onOrganisationRadiobutton}
                        onDatasetRadiobutton={this.onDatasetRadiobutton}
                        onOrganisationSearchSubmit={this.onOrganisationSearchSubmit}
                        onObservationTypeSearchSubmit={this.onObservationTypeSearchSubmit}
                        onDatasetSearchSubmit={this.onDatasetSearchSubmit}
                        fetchRasters={this.props.fetchRasters}
                        fetchWMSLayers={this.props.fetchWMSLayers}
                        currentDataType={this.props.currentDataType}
                        onDataSelection={this.onDataSelection}
                    />
                    {this.props.currentDataType === "Raster" ?
                        <RasterList
                            searchTerm={this.state.searchTerm}
                            page={this.state.page}
                            currentRasterList={this.props.currentRasterList}
                            selectItem={this.props.selectItem}
                            updateBasket={this.props.updateBasket}
                            onPageClick={this.onPageClick}
                            onSearchChange={this.onSearchChange}
                            onSearchSubmit={this.onSearchSubmit}
                            onSorting={this.onSorting}
                        />
                        :
                        <WMSList
                            searchTerm={this.state.searchTerm}
                            page={this.state.page}
                            currentWMSList={this.props.currentWMSList}
                            selectItem={this.props.selectItem}
                            updateBasket={this.props.updateBasket}
                            onPageClick={this.onPageClick}
                            onSearchChange={this.onSearchChange}
                            onSearchSubmit={this.onSearchSubmit}
                            onSorting={this.onSorting}
                        />
                    }
                    {this.props.currentDataType === "Raster" ?
                        <RasterDetails />
                        :
                        <WMSDetails />
                    }
                </div>
                {/* ALERT POPUP */}
                <div
                    className="authorisation-alert"
                    style={{
                        display: (this.props.currentRasterList && this.props.currentRasterList.showAlert === true) || (this.props.currentWMSList && this.props.currentWMSList.showAlert === true) ? "flex" : "none"
                    }}
                    onClick={() => this.props.toggleAlert()}
                >
                    No Rasters/WMS layers found!
                    Please check your search selection
                    <br />
                    You may need to login or might have insufficient rights to view
                    the Rasters/WMS layers
                </div>
            </div>
        );
    };
};

const mapStateToProps = (state: MyStore): PropsFromState => ({
    currentRasterList: getCurrentRasterList(state),
    currentWMSList: getCurrentWMSList(state),
    observationTypes: getObservationTypes(state),
    organisations: getOrganisations(state),
    datasets: getDatasets(state),
    currentDataType: getCurrentDataType(state),
});

const mapDispatchToProps = (dispatch: Dispatch<RasterActionType | Basket | FilterActionType | UpdateRadiobuttonActionType>): PropsFromDispatch => ({
    fetchLizardBootstrap: () => fetchLizardBootstrap(dispatch),
    fetchRasters: (
        page: number,
        searchTerm: string,
        organisationName: string,
        observationTypeParameter: string,
        datasetSlug: string,
        ordering: string
    ) => fetchRasters(page, searchTerm, organisationName, observationTypeParameter, datasetSlug, ordering, dispatch),
    updateBasket: (basket: MyStore['basket']) => updateBasket(basket, dispatch),
    fetchObservationTypes: (parameter: ObservationType['parameter']) => fetchObservationTypes(parameter, dispatch),
    fetchOrganisations: (name: Organisation['name']) => fetchOrganisations(name, dispatch),
    fetchDatasets: (slug: Dataset['slug']) => fetchDatasets(slug, dispatch),
    updateObservationTypeRadiobutton: (parameter: ObservationType['parameter']) => updateObservationTypeRadiobutton(parameter, dispatch),
    updateOrganisationRadiobutton: (name: Organisation['name']) => updateOrganisationRadiobutton(name, dispatch),
    updateDatasetRadiobutton: (slug: Dataset['slug']) => updateDatasetRadiobutton(slug, dispatch),
    fetchWMSLayers: (page: number, searchTerm: string, organisationName: string, datasetSlug: string, ordering: string) => fetchWMSLayers(page, searchTerm, organisationName, datasetSlug, ordering, dispatch),
    selectItem: (uuid: string) => selectItem(uuid, dispatch),
    switchDataType: (dataType: SwitchDataType['payload']) => switchDataType(dataType, dispatch),
    toggleAlert: () => toggleAlert(dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(MainApp);