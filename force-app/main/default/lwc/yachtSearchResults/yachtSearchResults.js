import { LightningElement, wire, api, track } from 'lwc';
import getAvailability from '@salesforce/apex/YachtAvailabilityService.getAvailability';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import YachtMessageChannel from '@salesforce/messageChannel/YachtMessageChannel__c';
import YachtResultChannel from '@salesforce/messageChannel/YachtResultChannel__c';
import { publish, MessageContext, subscribe, unsubscribe, APPLICATION_SCOPE } from 'lightning/messageService';
import NO_YACHTS_MSG from '@salesforce/label/c.No_Yachts_Available_Message';


const PAGE_SIZE = 9;

export default class YachtSearchResults extends LightningElement {
    label = {
        NO_YACHTS_MSG
    };

    selectedyachtInfo;

    @api
    selectedyachtId;
    isLoading = false;
    @track yachts;
    @track visibleYachts = [];
    currentIndex = 0;
    isLoadingMore = false;
    noyachtFound = false;

    subscription = null;



   

    loadMore() {

        if (this.isLoadingMore)
            return;

        this.isLoadingMore = true;
        const nextChunk = this.yachts.slice(this.currentIndex, this.currentIndex + PAGE_SIZE);
        this.visibleYachts = [...this.visibleYachts, ...nextChunk];
        this.currentIndex += PAGE_SIZE; this.isLoadingMore = false;

    }

    // Subscribe to reservation result channel to mark yacht unavailable in the UI
    connectedCallback() {
        this.subscribeResultChannel();
    }

    disconnectedCallback() {
        this.unsubscribeResultChannel();
    }

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

    unsubscribeResultChannel() {
        if (this.subscription) {
            unsubscribe(this.subscription);
            this.subscription = null;
        }
    }

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

    get areYachtsavailable() {
        return this.visibleYachts.length > PAGE_SIZE - 1 ? "height: 120vh;" : ""
    }



    handleScroll(event) {
        const { scrollTop, scrollHeight, clientHeight } = event.target;
        // Load more when user reaches bottom 
        if (scrollTop + clientHeight >= scrollHeight - 50) {
            if (this.currentIndex < this.yachts.length) {
                this.loadMore();
            }
        }
    }



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


    @wire(MessageContext)
    messageContext

    updateSelectedTile(event) {
        this.selectedyachtInfo = event.detail.yachtInfo;
        this.sendMessageService(this.selectedyachtInfo)
    }



    sendMessageService(yachtInfo) {
        // explicitly pass yacht data to the parameter recordId
        publish(this.messageContext, YachtMessageChannel, { recordId: yachtInfo });
    }

}
