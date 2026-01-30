import { LightningElement, api } from 'lwc';

const TILE_WRAPPER_SELECTED_CLASS = 'tile-wrapper selected';
const TILE_WRAPPER_UNSELECTED_CLASS = 'tile-wrapper';
const TILE_DISABLE_CLASS = ' tile-wrapper tile-disable';

export default class YachtTile extends LightningElement {
    @api yacht;
    @api selectedyachtId;

    // Getter for dynamically setting the background image for the picture
    get backgroundStyle() {
        return 'background-image:url(' + this.yacht.imageURL + ')';
    }


    // Getter for dynamically setting the tile class based on whether the
    // current boat is selected
    get tileClass() {
        

        // if(this.yacht.yachtId == this.selectedyachtId){
        //     return TILE_WRAPPER_SELECTED_CLASS;
        // }
        if (!this.yacht.isAvailable) {
            return TILE_DISABLE_CLASS;
        }
        return TILE_WRAPPER_UNSELECTED_CLASS;
    }

    get isYachtAvailable() {
        return this.yacht.isAvailable;
    }

    // @api updatedselectedyachtId(yachtId){
    //     this.selectedyachtId = yachtId;
    // }

    // Fires event with the Id of the boat that has been selected.
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