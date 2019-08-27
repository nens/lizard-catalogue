import * as React from 'react';
import MDSpinner from "react-md-spinner";
import { connect } from 'react-redux';
import { Raster } from '../../interface';
import { MyStore, getRaster } from '../../reducers';
import '../styles/List.css';

interface MyProps {
    page: number,
    searchTerm: string,

    currentRasterList: MyStore['currentRasterList'] | null,

    onPageClick: (page: number) => void,
    onSearchChange: (event: object) => void,
    onSearchSubmit: (event: object) => void,
    onSorting: (ordering: string) => void,

    selectItem: (uuid: string) => void,
    updateBasket: (basket: MyStore['basket']) => void
};

interface PropsFromState {
    rasters: Raster[]
};

type RasterListProps = MyProps & PropsFromState;

interface MyState {
    checkedRasters: string[]
};

class RasterList extends React.Component<RasterListProps, MyState> {
    state: MyState = {
        checkedRasters: []
    };

    onCheckboxSelect = (uuid: string) => {
        //Check if the raster has already been selected or not
        const selectedUuid = this.state.checkedRasters.filter(id => id === uuid)

        //If not yet selected then add this new uuid into the basket
        if (selectedUuid.length === 0) {
            this.setState({
                checkedRasters: [...this.state.checkedRasters, uuid]
            });
        } else {
            //If already selected then remove this uuid from the basket
            this.setState({
                checkedRasters: this.state.checkedRasters.filter(id => id !== uuid)
            });
        };
    };

    renderLoadingScreen() {
        return <div className="list loading-screen"><MDSpinner size={50} /></div>;
    };

    render() {
        //Destructure all props of the Raster List component
        const { searchTerm, page, onPageClick, onSearchChange, onSearchSubmit, onSorting, currentRasterList, selectItem, updateBasket, rasters } = this.props;
        const { checkedRasters } = this.state;

        //number of pages displayed in the pagination bar stored in an array with 5 pages
        const paginatedPages = [page - 2, page - 1, page, page + 1, page + 2];

        //If nothing is fetched, show loading screen
        if (!currentRasterList) return <this.renderLoadingScreen />;

        //If data is being requested from the API, show loading screen
        if (currentRasterList.isFetching) return <this.renderLoadingScreen />;

        //Destructure the currentRasterList object
        const { count } = currentRasterList;
        const totalPages = Math.ceil(count / 10);

        //Add to basket function which will do the followings
        //1- open the notification box
        //2- dispatch an action to update the basket
        //3- set the state of the RasterList component again
        const addToBasket = () => {
            //Click the button will open the notification popup
            window.location.href = '#notification';

            updateBasket(checkedRasters);
            this.setState({ 
                checkedRasters: [] 
            });
        };

        return (
            <div className="list">
                <div className="list__top">
                    <form onSubmit={onSearchSubmit} className="list__searchbar" title="Type raster name or raster's UUID">
                        <input type="text" className="list__searchbar-input" placeholder="Search in Lizard or type an UUID" onChange={onSearchChange} value={searchTerm} />
                        <button className="list__searchbar-button" type="submit">
                            <svg className="list__searchbar-icon">
                                <use xlinkHref="image/symbols.svg#icon-search" />
                            </svg>
                        </button>
                    </form>
                    <div className="list__length">{count} Items</div>
                </div>

                <div className="list__content">
                    <ul className="list__list">
                        <li className="list__row-title">
                            <div className="list__row list__row-box" />
                            <div className="list__row list__row-type">
                                Type
                                <i className="fa fa-sort" onClick={() => onSorting('temporal')} />
                            </div>
                            <div className="list__row list__row-name">
                                Name
                                <i className="fa fa-sort" onClick={() => onSorting('name')} />
                            </div>
                            <div className="list__row list__row-org">
                                Organisation
                                <i className="fa fa-sort" onClick={() => onSorting('organisation__name')} />
                            </div>
                            <div className="list__row list__row-obs">
                                Obs.Type
                                <i className="fa fa-sort" onClick={() => onSorting('observation_type__parameter')} />
                            </div>
                            <div className="list__row list__row-time">
                                Latest update
                                <i className="fa fa-sort" onClick={() => onSorting('last_modified')} />
                            </div>
                            <div className="list__row list__row-access" />
                        </li>
                        {rasters.map((raster: Raster) => {
                            //Here is a logic to define whether a raster has been selected (check-box has been checked or not)
                            //if yes then the checked value of the input field will be true
                            //if no then the checked value of the input field will be false
                            const checked = checkedRasters.filter(uuid => uuid === raster.uuid).length === 0 ? false : true;

                            const renderAccessModifier = () => {
                                if (raster.access_modifier === "Public" || raster.access_modifier === "Publiek") {
                                    return <div className="access-modifier public">{raster.access_modifier.toUpperCase()}</div>
                                } else if (raster.access_modifier === "Private" || raster.access_modifier === "Privaat") {
                                    return <div className="access-modifier private">{raster.access_modifier.toUpperCase()}</div>
                                } else {
                                    return <div className="access-modifier common">{raster.access_modifier.toUpperCase()}</div>
                                }
                            }

                            return (
                                <li className="list__row-li" key={raster.uuid} onClick={() => selectItem(raster.uuid)} >
                                    <input className="list__row list__row-box" type="checkbox" onChange={() => this.onCheckboxSelect(raster.uuid)} checked={checked} />
                                    {raster.temporal ?
                                        <img className="list__row list__row-type" src="image/raster-temporal.svg" alt="raster" /> :
                                        <img className="list__row list__row-type" src="image/raster-non-temporal.svg" alt="raster" />
                                    }
                                    <div className="list__row list__row-name">{raster.name}</div>
                                    <div className="list__row list__row-org">{raster.organisation && raster.organisation.name}</div>
                                    <div className="list__row list__row-obs">{raster.observation_type && raster.observation_type.parameter}</div>
                                    <div className="list__row list__row-time">{new Date(raster.last_modified).toLocaleDateString()}</div>
                                    <div className="list__row list__row-access">{renderAccessModifier()}</div>
                                </li>
                            )
                        })}
                    </ul>
                </div>
                <div className="list__footer">
                    <div 
                        className="list__pagination"
                        style={{
                            visibility: count === 0 ? "hidden" : "visible"
                        }}
                    >
                        <button
                            onClick={() => onPageClick(page - 1)}
                            disabled={page > 1 ? false : true}
                        >
                            &lsaquo;
                        </button>
                        <div className="list__pagination-pages">
                            {paginatedPages.map(pageNumber => {
                                if (pageNumber > 0 && pageNumber <= totalPages) {
                                    return (
                                        <span
                                            key={pageNumber}
                                            onClick={() => pageNumber !== page ? onPageClick(pageNumber) : null}
                                            className={pageNumber === page
                                                ? "list__pagination-current-page"
                                                : "list__pagination-page"
                                            }
                                        >
                                            {pageNumber}
                                        </span>
                                    )
                                }
                                return null;
                            })}
                        </div>
                        <button
                            onClick={() => onPageClick(page + 1)}
                            disabled={page < totalPages ? false : true}
                        >
                            &rsaquo;
                        </button>
                    </div>
                    <button
                        className="list__button-basket"
                        disabled={checkedRasters.length === 0 ? true : false}
                        onClick={addToBasket}
                    >
                        ADD TO BASKET
                    </button>
                </div>
                {/*Notification popup when click on the Add to Basket button*/}
                <div className="list__popup" id="notification">
                    <div className="list__popup-content">
                        <p>Items successfully added to the Basket. Go to your basket to see which items have been added.</p>
                        {/* eslint-disable-next-line */}
                        <a href="#" className="list__popup-close">OK</a>
                    </div>
                </div>
            </div>
        );
    };
};

const mapStateToProps = (state: MyStore, ownProps: MyProps): PropsFromState => {
    if (!ownProps.currentRasterList) return {
        rasters: []
    };
    return {
        rasters: ownProps.currentRasterList.rasterList.map(uuid => getRaster(state, uuid))
    };
};

export default connect(mapStateToProps)(RasterList);