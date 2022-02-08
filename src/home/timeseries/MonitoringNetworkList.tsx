import { useSelector } from 'react-redux';
import { getCurrentMonitoringNetworkList, getAllMonitoringNetworks, getSelectedItem, getFilters } from '../../reducers';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';
import LoadingScreen from '../../components/LoadingScreen';
import AccessModifier from '../../components/AccessModifier';
import styles from '../../styles/List.module.css';

interface MyProps {
    searchTerm: string,
    onPageClick: (page: number) => void,
    onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
    onSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void,
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
        <div className={styles.List}>
            <div className={styles.ListTop}>
                <SearchBar
                    name="searchBar"
                    searchTerm={searchTerm}
                    title="Type name or UUID"
                    placeholder="Search for data in Lizard"
                    onSearchSubmit={onSearchSubmit}
                    onSearchChange={onSearchChange}
                />
                <div className={styles.ListLength}>{count} monitoring networks</div>
            </div>
            <div className={styles.ListContent}>
                <ul className={styles.ListMainList}>
                    <li className={styles.ListRowHeader}>
                        <div className={`${styles.ListRow} ${styles.ListRowName}`}>
                            Monitoring network
                            <i className="fa fa-sort" onClick={() => onSorting('name')} />
                        </div>
                        <div className={`${styles.ListRow} ${styles.ListRowOrg}`}>
                            Organisation (owner)
                            <i className="fa fa-sort" onClick={() => onSorting('organisation__name')} />
                        </div>
                        <div className={`${styles.ListRow} ${styles.ListRowRasterDescription}`}>
                            Description
                        </div>
                        <div className={`${styles.ListRow} ${styles.ListRowAccess}`} />
                    </li>
                    {monitoringNetworks.map(monitoringNetwork => (
                        <li
                            className={selectedItem === monitoringNetwork.uuid ? `${styles.ListRowLi} ${styles.ListRowLi__Selected}` : styles.ListRowLi}
                            key={monitoringNetwork.uuid}
                            onClick={() => selectItem(monitoringNetwork.uuid)}
                        >
                            <div className={`${styles.ListRow} ${styles.ListRowNormal} ${styles.ListRowName}`} title={monitoringNetwork.name}>{monitoringNetwork.name}</div>
                            <div className={`${styles.ListRow} ${styles.ListRowNormal} ${styles.ListRowOrg}`} title={monitoringNetwork.organisation && monitoringNetwork.organisation.name}>{monitoringNetwork.organisation && monitoringNetwork.organisation.name}</div>
                            <div className={`${styles.ListRow} ${styles.ListRowNormal} ${styles.ListRowRasterDescription}`} title={monitoringNetwork.description}>{monitoringNetwork.description}</div>
                            <div className={`${styles.ListRow} ${styles.ListRowNormal} ${styles.ListRowAccess}`}>
                                <AccessModifier accessModifier={monitoringNetwork.access_modifier} />
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div className={styles.ListFooter}>
                <Pagination
                    count={count}
                    page={page}
                    onPageClick={onPageClick}
                />
            </div>
        </div>
    )
}