// Check if the user is allowed to manage the raster or wms layer.
// The user is allowed to manage the layer if 
// the user has the 'admin' role in the organisation of the layer or
// the user is the supplier of the layer
// and has the 'supplier' role in the organisation of the layer.
export const isAuthorizedToManageLayer = (layer, userName, userOrganisations) => {
    let authorizedToManageLayer: boolean = false;
    // Find whether the user is in the organisation of the layer.
    let userAndLayerOrganisation = userOrganisations.find(function(organisation) {
        return organisation.name === layer.organisation.name;
    });
    // Check if user is "admin" in the organisation of the layer or
    // "supplier" in the organisation of the layer and supplier of the layer.
    if (userAndLayerOrganisation.roles.includes("admin")) {
        authorizedToManageLayer = true;
    } else if (layer.hasOwnProperty("supplier")) {
        if (userAndLayerOrganisation.roles.includes("supplier") &&
                layer["supplier"] === userName) {
            authorizedToManageLayer = true;
        }
    }
    return authorizedToManageLayer;
}
