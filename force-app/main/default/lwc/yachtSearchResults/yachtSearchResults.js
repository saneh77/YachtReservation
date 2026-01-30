import { LightningElement, wire, api, track } from 'lwc';
import getAvailability from '@salesforce/apex/YachtAvailabilityService.getAvailability';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import YachtMessageChannel from '@salesforce/messageChannel/YachtMessageChannel__c';
import YachtResultChannel from '@salesforce/messageChannel/YachtResultChannel__c';
import { publish, MessageContext, subscribe, unsubscribe, APPLICATION_SCOPE } from 'lightning/messageService';
import NO_YACHTS_MSG from '@salesforce/label/c.No_Yachts_Available_Message';


/**
 * @description LWC component for displaying yacht search results
 * @author Salesforce Developer
 */
const PAGE_SIZE = 9;

export default class YachtSearchResults extends LightningElement {
    /**
     * @description Labels for UI elements
     */
    label = {
        NO_YACHTS_MSG
    };

    /**
     * @description Selected yacht information
     */
    selectedyachtInfo;

    /**
     * @description API property for selected yacht ID
     */
    @api
    selectedyachtId;
    
    /**
     * @description Loading state flag
     */
    isLoading = false;
    
    /**
     * @description Trackable array of all yachts
     */
    @track yachts;
    
    /**
     * @description Trackable array of visible yachts for pagination
     */
    @track visibleYachts = [];
    
    /**
     * @description Current index for pagination
     */
    currentIndex = 0;
    
    /**
     * @description Loading more state flag
     */
    isLoadingMore = false;
    
    /**
     * @description Flag indicating if no yachts are found
     */
    noyachtFound = false;

    /**
     * @description Subscription object for message channel
     */
    subscription = null;



   

    /**
     * @description Loads more yachts for pagination
     */
    loadMore() {

        if (this.isLoadingMore)
            return;

        this.isLoadingMore = true;
        const nextChunk = this.yachts.slice(this.currentIndex, this.currentIndex + PAGE_SIZE);
        this.visibleYachts = [...this.visibleYachts, ...nextChunk];
        this.currentIndex += PAGE_SIZE; this.isLoadingMore = false;

    }

    /**
     * @description Subscribe to reservation result channel to mark yacht unavailable in the UI
     */
    connectedCallback() {
        this.subscribeResultChannel();
    }

    /**
     * @description Unsubscribe from reservation result channel
     */
    disconnectedCallback() {
        this.unsubscribeResultChannel();
    }

    /**
     * @description Subscribe to the YachtResultChannel message channel
     */
    subscribeResultChannel() {
        if (this.subscription) {
            return;
        }
        this.subscription = subscribe(
            this.messageContext,
            YachtResultChannel,
            (message) => this.handleReservationResult(message),
            { scope: APPLICATION_SCOPE }
        );
    }

    /**
     * @description Unsubscribe from the YachtResultChannel message channel
     */
    unsubscribeResultChannel() {
        if (this.subscription) {
            unsubscribe(this.subscription);
            this.subscription = null;
        }
    }

    /**
     * @description Handle reservation result messages to update yacht availability
     * @param {Object} message - The message received from the channel
     */
    handleReservationResult(message) {
        // message shape from publisher: { recordId: yachtId }
        const reservedYachtId = message?.recordId;
        if (!reservedYachtId || !this.yachts || this.yachts.length === 0) {
            return;
        }

        // Update master list
        let updated = false;
        this.yachts = this.yachts.map(y => {
            if (y.yachtId === reservedYachtId) {
                updated = true;
                return { ...y, isAvailable: false };
            }
            return y;
        });

        // Update visible list as well
        this.visibleYachts = this.visibleYachts.map(y => {
            if (y.yachtId === reservedYachtId) {
                return { ...y, isAvailable: false };
            }
            return y;
        });

        if (updated) {
            // Optional: re-sort to keep unavailable at the end/top as per existing sort rule
            this.yachts.sort((a, b) => {
                return (b.isAvailable === true) - (a.isAvailable === true);
            });
        }
    }

    /**
     * @description Getter for CSS height style based on yacht count
     * @returns {String} CSS height style
     */
    get areYachtsavailable() {
        return this.visibleYachts.length > PAGE_SIZE - 1 ? "height: 120vh;" : ""
    }



    /**
     * @description Handle scroll event to load more yachts
     * @param {Event} event - The scroll event
     */
    handleScroll(event) {
        const { scrollTop, scrollHeight, clientHeight } = event.target;
        // Load more when user reaches bottom 
        if (scrollTop + clientHeight >= scrollHeight - 50) {
            if (this.currentIndex < this.yachts.length) {
                this.loadMore();
            }
        }
    }



    /**
     * @description API method to get available yachts based on search criteria
     * @param {String} reservationDate - The reservation date
     * @param {String} yachtType - The yacht type
     * @param {Number} partySize - The party size
     * @returns {Promise} Promise resolving when search is complete
     */
    @api async getAvailableYachts(reservationDate, yachtType, partySize) {
        this.isLoading = true;
        console.log('type ::' + yachtType);
        await getAvailability({ reservationDate: reservationDate, yachtType: yachtType, minimumCapacity: partySize })
            .then(result => {

                this.yachts = result;

                this.yachts.sort((a, b) => {
                    return (b.isAvailable === true) - (a.isAvailable === true);
                });

                this.currentIndex = 0;
                this.visibleYachts = [];
                this.loadMore();

                console.log('result :: ' + JSON.stringify(this.yachts));



                if (this.yachts.length == 0) {
                    this.noyachtFound = true;
                } else {
                    this.noyachtFound = false;
                }

                this.isLoading = false;
            })
            .catch(error => {
                noyachtFound = false;
                this.isLoading = false;
                console.log(error);
            })
    }


    /**
     * @description Wire adapter for message context
     */
    @wire(MessageContext)
    messageContext

    /**
     * @description Update selected tile and send message
     * @param {Event} event - The event from the child component
     */
    updateSelectedTile(event) {
        this.selectedyachtInfo = event.detail.yachtInfo;
        this.sendMessageService(this.selectedyachtInfo)
    }



    /**
     * @description Send message to YachtMessageChannel
     * @param {Object} yachtInfo - The yacht information to send
     */
    sendMessageService(yachtInfo) {
        // explicitly pass yacht data to the parameter recordId
        publish(this.messageContext, YachtMessageChannel, { recordId: yachtInfo });
    }

}
