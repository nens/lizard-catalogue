// Check if the user is allowed to manage the raster or wms layer.
// The user is allowed to manage the layer if 
// the user has the 'admin' role in the organisation of the layer or
// the user is the supplier of the layer
// and has the 'supplier' role in the organisation of the layer.
export const isAuthorizedToManageLayer = (layer, userName, allOrganisations) => {

    let authorizedToManageLayer: boolean = false;
    let layerOrganisationWithRolesOfUser = allOrganisations.find(function(organisation) {
        return organisation.name === layer.organisation.name;
    });
    if (layerOrganisationWithRolesOfUser.length === 0) {
        return authorizedToManageLayer;
    }

    // Check if user is "admin" in the organisation of the layer or
    // "supplier" in the organisation of the layer and supplier of the layer.
    if (layerOrganisationWithRolesOfUser.roles.includes("admin")) {
        authorizedToManageLayer = true;
    } else if (layerOrganisationWithRolesOfUser.roles.includes("supplier") &&
            layer["supplier"] === userName) {
        authorizedToManageLayer = true;
    }

    return authorizedToManageLayer;
}
