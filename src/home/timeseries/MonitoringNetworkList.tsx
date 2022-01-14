import React from 'react';
import { useSelector } from 'react-redux';
import { MonitoringNetwork } from '../../interface';
import { getCurrentMonitoringNetworkList, getAllMonitoringNetworks, getSelectedItem, getFilters } from '../../reducers';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';
import LoadingScreen from '../../components/LoadingScreen';
import AccessModifier from '../../components/AccessModifier';
import '../../styles/List.css';

interface MyProps {
    searchTerm: string,
    onPageClick: (page: number) => void,
    onSearchChange: (event: object) => void,
    onSearchSubmit: (event: object) => void,
    onSorting: (ordering: string) => void,
    selectItem: (uuid: string) => void
};

export default function MonitoringNetworkList (props: MyProps) {
    const { searchTerm, onPageClick, onSearchChange, onSearchSubmit, onSorting, selectItem } = props;
    const currentMonitoringNetworkList = useSelector(getCurrentMonitoringNetworkList);
    const allMonitoringNetworks = useSelector(getAllMonitoringNetworks);
    const selectedItem = useSelector(getSelectedItem);
    const page = useSelector(getFilters).page;

    // Show loading screen if there is no data or data is being fetched
    if (!currentMonitoringNetworkList || currentMonitoringNetworkList.isFetching) return <LoadingScreen />;

    const { count, monitoringNetworksList } = currentMonitoringNetworkList;
    const monitoringNetworks = monitoringNetworksList.map(uuid => allMonitoringNetworks[uuid]);

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
                <div className="list__length">{count} monitoring networks</div>
            </div>
            <div className="list__content">
                <ul className="list__list">
                    <li className="list__row-header">
                        <div className="list__row list__row-name">
                            Monitoring network
                            <i className="fa fa-sort" onClick={() => onSorting('name')} />
                        </div>
                        <div className="list__row list__row-org">
                            Organisation (owner)
                            <i className="fa fa-sort" onClick={() => onSorting('organisation__name')} />
                        </div>
                        <div className="list__row list__row-raster-description">
                            Description
                        </div>
                        <div className="list__row list__row-access" />
                    </li>
                    {monitoringNetworks.map((monitoringNetwork: MonitoringNetwork) => (
                        <li
                            className={selectedItem === monitoringNetwork.uuid ? "list__row-li list__row-li-selected" : "list__row-li"}
                            key={monitoringNetwork.uuid}
                            onClick={() => selectItem(monitoringNetwork.uuid)}
                        >
                            <div className="list__row list__row-normal list__row-name" title={monitoringNetwork.name}>{monitoringNetwork.name}</div>
                            <div className="list__row list__row-normal list__row-org" title={monitoringNetwork.organisation && monitoringNetwork.organisation.name}>{monitoringNetwork.organisation && monitoringNetwork.organisation.name}</div>
                            <div className="list__row list__row-normal list__row-raster-description" title={monitoringNetwork.description}>{monitoringNetwork.description}</div>
                            <div className="list__row list__row-normal list__row-access">
                                <AccessModifier accessModifier={monitoringNetwork.access_modifier} />
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="list__footer">
                <Pagination
                    count={count}
                    page={page}
                    onPageClick={onPageClick}
                />
            </div>
        </div>
    )
}