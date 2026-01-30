import { LightningElement, api } from 'lwc';

/**
 * @description LWC component for displaying a single yacht tile
 * @author Salesforce Developer
 */
const TILE_WRAPPER_SELECTED_CLASS = 'tile-wrapper selected';
const TILE_WRAPPER_UNSELECTED_CLASS = 'tile-wrapper';
const TILE_DISABLE_CLASS = ' tile-wrapper tile-disable';

export default class YachtTile extends LightningElement {
    /**
     * @description API property for yacht data
     */
    @api yacht;
    
    /**
     * @description API property for selected yacht ID
     */
    @api selectedyachtId;

    /**
     * @description Getter for dynamically setting the background image for the picture
     * @returns {String} CSS background-image style
     */
    get backgroundStyle() {
        return 'background-image:url(' + this.yacht.imageURL + ')';
    }


    /**
     * @description Getter for dynamically setting the tile class based on whether the
     * current boat is selected or unavailable
     * @returns {String} CSS class for the tile wrapper
     */
    get tileClass() {
        

        // if(this.yacht.yachtId == this.selectedyachtId){
        //     return TILE_WRAPPER_SELECTED_CLASS;
        // }
        if (!this.yacht.isAvailable) {
            return TILE_DISABLE_CLASS;
        }
        return TILE_WRAPPER_UNSELECTED_CLASS;
    }

    /**
     * @description Getter for checking if yacht is available
     * @returns {Boolean} True if yacht is available, false otherwise
     */
    get isYachtAvailable() {
        return this.yacht.isAvailable;
    }

    /**
     * @description Method to handle yacht selection and dispatch custom event
     * Fires event with the Id of the boat that has been selected.
     */
    selectYacht() {
        this.selectedyachtId = this.yacht.yachtId;
        const boatselect = new CustomEvent('yachtselect', {
            detail: {
                yachtInfo: this.yacht
            }
        });
        // Fire the custom event
        this.dispatchEvent(boatselect);
    }
}
