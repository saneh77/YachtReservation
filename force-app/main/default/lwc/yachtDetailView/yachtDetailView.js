import { LightningElement, wire } from 'lwc';
import createReservation from '@salesforce/apex/YachtAvailabilityService.createReservation';
import YachtMessageChannel from '@salesforce/messageChannel/YachtMessageChannel__c';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import YachtResultChannel from '@salesforce/messageChannel/YachtResultChannel__c';
import { publish } from 'lightning/messageService';
import LABEL_SELECT_YACHT_PROMPT from '@salesforce/label/c.Select_Yacht_Prompt';
import LABEL_ENTER_DETAILS from '@salesforce/label/c.Enter_Your_Details_Header';
import LABEL_RES_SUBMITTED from '@salesforce/label/c.Reservation_Submitted_Success';
import LABEL_RES_NOT_AVAILABLE from '@salesforce/label/c.Reservation_Not_Available_Header';
import LABEL_RES_NOT_AVAILABLE_BODY from '@salesforce/label/c.Reservation_Not_Available_Body';

import {
  subscribe, MessageContext, unsubscribe, APPLICATION_SCOPE

} from 'lightning/messageService';

/**
 * @description LWC component for displaying yacht detail view and handling reservations
 * @author Salesforce Developer
 */
export default class YachtDetailView extends LightningElement {
  /**
   * @description Labels for UI elements
   */
  label = {
    SELECT_YACHT_PROMPT: LABEL_SELECT_YACHT_PROMPT,
    ENTER_DETAILS: LABEL_ENTER_DETAILS,
    RES_SUBMITTED: LABEL_RES_SUBMITTED,
    RES_NOT_AVAILABLE: LABEL_RES_NOT_AVAILABLE,
    RES_NOT_AVAILABLE_BODY: LABEL_RES_NOT_AVAILABLE_BODY
  };

  /**
   * @description Subscription object for message channel
   */
  subscription = null;
  
  /**
   * @description Initialize messageContext for Message Service
   */
  @wire(MessageContext)
  messageContext;

  /**
   * @description Yacht information
   */
  yachtInfo;
  
  /**
   * @description Flag indicating if reservation modal is open
   */
  reserveModalOpen = false;
  
  /**
   * @description Guest full name
   */
  guestfullName;
  
  /**
   * @description Guest email
   */
  guestemail;
  
  /**
   * @description Reservation header message
   */
  reservationHeader = '';
  
  /**
   * @description Reservation message
   */
  reservationMessage = '';
  
  /**
   * @description Flag indicating if toast notification should be shown
   */
  showToast = false;
  
  /**
   * @description Flag indicating if reservation is submitting
   */
  isSubmitting = false;

  // label = {
  //   labelDetails,
  //   labelReviews,
  //   labelAddReview,
  //   labelFullDetails,
  //   labelPleaseSelectABoat
  // }


  /**
   * @description Getter for yacht name
   * @returns {String} Yacht name or empty string
   */
  get yachtName() {
    return this.yachtInfo ? this.yachtInfo.yachtName : '';
  }

  /**
   * @description Getter for yacht capacity
   * @returns {Number} Yacht capacity or empty string
   */
  get yachtCapacity() {
    return this.yachtInfo ? this.yachtInfo.capacity : '';
  }

  /**
   * @description Getter for yacht length
   * @returns {Number} Yacht length or empty string
   */
  get yachtLength() {
    return this.yachtInfo ? this.yachtInfo.length : '';
  }

  /**
   * @description Getter for yacht availability status
   * @returns {String} 'Yes' if available, 'No' otherwise
   */
  get yachtAvailability() {
    return this.yachtInfo.isAvailable ? 'Yes' : 'No';
  }

  /**
   * @description Getter for checking if yacht is not available
   * @returns {Boolean} True if yacht is not available, false otherwise
   */
  get isYachtAvailable() {
    return !this.yachtInfo.isAvailable;
  }

  /**
   * @description Getter for details tab icon name
   * @returns {String} Icon name or null
   */
  get detailsTabIconName() {
    return this.yachtInfo ? 'utility:anchor' : null;
  }

  /**
   * @description Getter for background style with yacht image
   * @returns {String} CSS background-image style
   */
  get backgroundStyle() {
    return 'background-image:url(' + this.yachtInfo.imageURL + ')';
  }

  /**
   * @description Getter for yacht type
   * @returns {String} Yacht type or empty string
   */
  get yachtType() {
    return this.yachtInfo ? this.yachtInfo.yachtType : '';
  }

  /**
   * @description Getter for yacht price
   * @returns {Number} Yacht price or empty string
   */
  get yachtPrice() {
    return this.yachtInfo ? this.yachtInfo.price : '';
  }

  /**
   * @description Getter for yacht description
   * @returns {String} Yacht description or empty string
   */
  get yachtDescription() {
    return this.yachtInfo ? this.yachtInfo.description : '';
  }




  /**
   * @description Handler for full name change event
   * @param {Event} event - The change event from the input field
   */
  handleFullNameChange(event) {
    this.guestfullName = event.target.value;
  }

  /**
   * @description Handler for email change event
   * @param {Event} event - The change event from the input field
   */
  handleEmailChange(event) {
    this.guestemail = event.target.value;
  }

  /**
   * @description Handler for closing reservation modal
   */
  handleClose() {
    this.reserveModalOpen = false;
    this.guestemail = '';
    this.guestfullName = '';
  }

  /**
   * @description Subscribe to YachtMessageChannel to receive yacht information
   */
  subscribeMC() {
    // recordId is populated on Record Pages, and this component
    // should not update when this component is on a record page.
    if (this.subscription) {
      return;
    }

    this.subscription = subscribe(
      this.messageContext,
      YachtMessageChannel,
      (message) => { this.yachtInfo = message.recordId },
      { scope: APPLICATION_SCOPE }
    );

  }


  /**
   * @description Lifecycle callback when component is connected
   */
  connectedCallback() {
    this.subscribeMC();
  }


  /**
   * @description Handler for reservation button click
   */
  handleReservation() {
    this.reserveModalOpen = true;
  }

  /**
   * @description Handler for form submission
   */
  handleSubmit() {

    const inputFields = this.template.querySelectorAll('lightning-input');
    let isValid = true;

    // Loop through and report validity for all fields
    inputFields.forEach(field => {
      if (!field.reportValidity()) {
        isValid = false;
      }
    });

    if (isValid) {
      this.isSubmitting = true;

      const reservationObj = {
        yachtName: this.yachtInfo.yachtName,
        reservationDate: this.yachtInfo.reservationDate,
        yachtId: this.yachtInfo.yachtId,
        price: this.yachtInfo.price,
        partySize: this.yachtInfo.partSize,
        guestName: this.guestfullName,
        guestEmail: this.guestemail
      };

      this.CreateReservation(JSON.stringify(reservationObj));
      //this.showNotification('Reservation submitted successfully', 'test', 'success');

    }



  }

  /**
   * @description Getter for checking if guest info is added
   * @returns {Boolean} True if guest info is not added, false otherwise
   */
  get IsguestInfoadded() {
    return !(this.guestfullName && this.guestemail)
  }

  /**
   * @description Handler for closing toast notification
   */
  handleClose1() {
    this.showToast = false;
    this.reservationMessage = '';
    this.reservationHeader = '';
  }

  /**
   * @description Method to create reservation
   * @param {String} reservationObj - JSON string of reservation object
   */
  CreateReservation(reservationObj) {
    createReservation({ reservationInformation: reservationObj })
      .then(result => {
        console.log('result :: ' + result);
        if (result) {
          this.showToast = true;
          this.reservationHeader = this.label.RES_SUBMITTED;
          this.reservationMessage = result;
          //  this.showNotification('Reservation submitted successfully', 'test', 'success');
          // Update local view state so the detail component reflects unavailability immediately
          this.yachtInfo = { ...this.yachtInfo, isAvailable: false };
          // Notify search results to disable the corresponding tile
          this.sendMessageService(this.yachtInfo.yachtId);
          this.handleClose();
          this.isSubmitting = false;
        }
      })
      .catch(error => {
        this.isSubmitting = false;
        console.log('error :: ' + JSON.stringify(error));
        if (error?.body?.message && error.body.message.includes('DUPLICATE_VALUE')) {
          this.showToast = true;
          this.reservationHeader = this.label.RES_NOT_AVAILABLE;
          this.reservationMessage = this.label.RES_NOT_AVAILABLE_BODY;
          this.handleClose();
          // this.showNotification('Reservation Not Available', 'This yacht is already booked on the requested Date. Please choose a different date, or yacht.', 'warning');
        }
      })
  }

  /**
   * @description Send message to YachtResultChannel to notify other components
   * @param {String} yachtId - The ID of the yacht
   */
  sendMessageService(yachtId) {
    // explicitly pass yacht data to the parameter recordId
    publish(this.messageContext, YachtResultChannel, { recordId: yachtId });
  }

}
