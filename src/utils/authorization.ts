// Check if the user is allowed to manage the raster or wms layer.
// The user is allowed to manage the layer if 
// the user has the 'admin' role in the organisation of the layer or
// the user is the supplier of the layer
// and has the 'supplier' role in the organisation of the layer.
import { Bootstrap, Raster, WMS } from "../interface";

export const isAuthorizedToManageLayer = async (
    layer: Raster | WMS,
    user: Bootstrap['user']
) => {
    const layerOrganisation = layer.organisation;
    if (!user.id) return false;

    const username = user.username;
    const userId = user.id;

    const userInOrganisationView = await fetch(`/api/v4/organisations/${layerOrganisation.uuid}/users/${userId}/`, {
        credentials: 'same-origin'
    }).then(
        response => response.json()
    );

    if (!userInOrganisationView || !userInOrganisationView.roles) return false;

    const userRoles = userInOrganisationView.roles;

    // Check if user is "admin" in the organisation of the layer or
    // "supplier" in the organisation of the layer and supplier of the layer.
    if (userRoles.includes("admin")) {
        return true;
    } else if (
        userRoles.includes("supplier") &&
        layer["supplier"] === username
    ) {
        return true;
    };

    return false;
};