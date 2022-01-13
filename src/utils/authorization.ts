// Check if the user is allowed to manage the raster or wms layer.
// The user is allowed to manage the layer if 
// the user has the 'admin' role in the organisation of the layer or
// the user is the supplier of the layer
// and has the 'supplier' role in the organisation of the layer.

import { Organisation, Raster, Scenario, WMS } from "../interface";

export const isAuthorizedToManageLayer = (
    layer: Raster | WMS | Scenario,
    userName: string | null,
    organisations: Organisation[]
) => {
    if (!userName) return false;

    const layerOrganisationWithRolesOfUser = organisations.find(organisation => {
        return organisation.name === layer.organisation.name;
    });

    if (!layerOrganisationWithRolesOfUser) {
        return false;
    };
    if ( !layerOrganisationWithRolesOfUser.roles) {
        return false;
    };

    // Check if user is "admin" in the organisation of the layer or
    // "supplier" in the organisation of the layer and supplier of the layer.
    if (layerOrganisationWithRolesOfUser.roles.includes("admin")) {
        return true;
    } else if (
        layerOrganisationWithRolesOfUser.roles.includes("supplier") &&
        layer["supplier"] === userName
    ) {
        return true;
    };
    return false;
};
