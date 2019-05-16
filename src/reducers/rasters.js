import { RASTERS_FETCHED } from "../actions";

export default (state = null, action) => {
    switch (action.type) {
        case RASTERS_FETCHED:
            return action.payload
        default:
            return state
    }
}