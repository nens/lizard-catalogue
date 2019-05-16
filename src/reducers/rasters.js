export default (state = null, action) => {
    switch (action.type) {
        case 'RASTERS_FETCHED':
            console.log(action)
            return action.payload
        default:
            return state
    }
}