import * as React from 'react';
import MDSpinner from "react-md-spinner";
import { connect } from 'react-redux';
import { MonitoringNetwork } from '../../interface';
import { MyStore, getMonitoringNetwork } from '../../reducers';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import '../styles/List.css';

interface MyProps {
    searchTerm: string,

    currentMonitoringNetworkList: MyStore['currentMonitoringNetworkList'] | null,

    onPageClick: (page: number) => void,
    onSearchChange: (event: object) => void,
    onSearchSubmit: (event: object) => void,
    onSorting: (ordering: string) => void,

    selectItem: (uuid: string) => void
};

interface PropsFromState {
    monitoringNetworks: MonitoringNetwork[],
    page: number,
};

type MonitoringNetworkListProps = MyProps & PropsFromState;

class MonitoringNetworkList extends React.Component<MonitoringNetworkListProps> {
    renderLoadingScreen() {
        return <div className="list loading-screen"><MDSpinner size={50} /></div>;
    };

    render() {
        //Destructure all props of the Raster List component
        const { searchTerm, page, onPageClick, onSearchChange, onSearchSubmit, onSorting, currentMonitoringNetworkList, selectItem, monitoringNetworks } = this.props;

        //number of pages displayed in the pagination bar stored in an array with 5 pages
        const paginatedPages = [page - 2, page - 1, page, page + 1, page + 2];

        //If nothing is fetched, show loading screen
        if (!currentMonitoringNetworkList) return <this.renderLoadingScreen />;

        //If data is being requested from the API, show loading screen
        if (currentMonitoringNetworkList.isFetching) return <this.renderLoadingScreen />;

        //Destructure the currentRasterList object
        const { count } = currentMonitoringNetworkList;
        const totalPages = Math.ceil(count / 10);

        return (
            <div className="list">
                <div className="list__top">
                    <SearchBar
                        name="searchBar"
                        searchTerm={searchTerm}
                        title="Type name or UUID"
                        placeholder="Search for data in Lizard"
                        onSearchSubmit={onSearchSubmit}
                        onSearchChange={onSearchChange}
                    />
                    <div className="list__length">{count} items</div>
                </div>
                <div className="list__content">
                    <ul className="list__list">
                        <li className="list__row-header">
                            <div className="list__row list__row-name">
                                Monitoring network
                                <i className="fa fa-sort" onClick={() => onSorting('name')} />
                            </div>
                            <div className="list__row list__row-org">
                                Organisation
                                <i className="fa fa-sort" onClick={() => onSorting('organisation__name')} />
                            </div>
                            <div className="list__row list__row-raster-description">
                                Description
                            </div>
                            <div className="list__row list__row-access" />
                        </li>
                        {monitoringNetworks.map((monitoringNetwork: MonitoringNetwork) => {
                            const renderAccessModifier = () => {
                                if (monitoringNetwork.access_modifier === "Public" || monitoringNetwork.access_modifier === "Publiek") {
                                    return <div className="access-modifier public">{monitoringNetwork.access_modifier.toUpperCase()}</div>
                                } else if (monitoringNetwork.access_modifier === "Private" || monitoringNetwork.access_modifier === "Privaat") {
                                    return <div className="access-modifier private">{monitoringNetwork.access_modifier.toUpperCase()}</div>
                                } else {
                                    return <div className="access-modifier common">{monitoringNetwork.access_modifier.toUpperCase()}</div>
                                }
                            }

                            return (
                                <li className="list__row-li" key={monitoringNetwork.uuid} onClick={() => selectItem(monitoringNetwork.uuid)}>
                                    <div className="list__row list__row-normal list__row-name" title={monitoringNetwork.name}>{monitoringNetwork.name}</div>
                                    <div className="list__row list__row-normal list__row-org" title={monitoringNetwork.organisation && monitoringNetwork.organisation.name}>{monitoringNetwork.organisation && monitoringNetwork.organisation.name}</div>
                                    <div className="list__row list__row-normal list__row-raster-description" title={monitoringNetwork.description}>{monitoringNetwork.description}</div>
                                    <div className="list__row list__row-normal list__row-access">{renderAccessModifier()}</div>
                                </li>
                            )
                        })}
                    </ul>
                </div>
                <div className="list__footer">
                    <Pagination
                        count={count}
                        page={page}
                        paginatedPages={paginatedPages}
                        totalPages={totalPages}
                        onPageClick={onPageClick}
                    />
                </div>
            </div>
        );
    };
};

const mapStateToProps = (state: MyStore, ownProps: MyProps): PropsFromState => {
    if (!ownProps.currentMonitoringNetworkList) return {
        monitoringNetworks: [],
        page: 1,
    };
    return {
        monitoringNetworks: ownProps.currentMonitoringNetworkList.monitoringNetworksList.map(uuid => getMonitoringNetwork(state, uuid)),
        page: state.filters.page,
    };
};

export default connect(mapStateToProps)(MonitoringNetworkList);