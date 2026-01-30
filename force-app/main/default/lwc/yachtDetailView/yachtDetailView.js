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

export default class YachtDetailView extends LightningElement {
  label = {
    SELECT_YACHT_PROMPT: LABEL_SELECT_YACHT_PROMPT,
    ENTER_DETAILS: LABEL_ENTER_DETAILS,
    RES_SUBMITTED: LABEL_RES_SUBMITTED,
    RES_NOT_AVAILABLE: LABEL_RES_NOT_AVAILABLE,
    RES_NOT_AVAILABLE_BODY: LABEL_RES_NOT_AVAILABLE_BODY
  };

  subscription = null;
  // Initialize messageContext for Message Service
  @wire(MessageContext)
  messageContext;

  yachtInfo;
  reserveModalOpen = false;
  guestfullName;
  guestemail;
  reservationHeader = '';
  reservationMessage = '';
  showToast = false;
  isSubmitting = false;

  // label = {
  //   labelDetails,
  //   labelReviews,
  //   labelAddReview,
  //   labelFullDetails,
  //   labelPleaseSelectABoat
  // }


  get yachtName() {
    return this.yachtInfo ? this.yachtInfo.yachtName : '';
  }

  get yachtCapacity() {
    return this.yachtInfo ? this.yachtInfo.capacity : '';
  }

  get yachtLength() {
    return this.yachtInfo ? this.yachtInfo.length : '';
  }

  get yachtAvailability() {
    return this.yachtInfo.isAvailable ? 'Yes' : 'No';
  }

  get isYachtAvailable() {
    return !this.yachtInfo.isAvailable;
  }

  get detailsTabIconName() {
    return this.yachtInfo ? 'utility:anchor' : null;
  }

  get backgroundStyle() {
    return 'background-image:url(' + this.yachtInfo.imageURL + ')';
  }

  get yachtType() {
    return this.yachtInfo ? this.yachtInfo.yachtType : '';
  }

  get yachtPrice() {
    return this.yachtInfo ? this.yachtInfo.price : '';
  }

  get yachtDescription() {
    return this.yachtInfo ? this.yachtInfo.description : '';
  }




  handleFullNameChange(event) {
    this.guestfullName = event.target.value;
  }

  handleEmailChange(event) {
    this.guestemail = event.target.value;
  }

  handleClose() {
    this.reserveModalOpen = false;
    this.guestemail = '';
    this.guestfullName = '';
  }

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


  connectedCallback() {
    this.subscribeMC();
  }


  handleReservation() {
    this.reserveModalOpen = true;
  }

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

  get IsguestInfoadded() {
    return !(this.guestfullName && this.guestemail)
  }

  handleClose1() {
    this.showToast = false;
    this.reservationMessage = '';
    this.reservationHeader = '';
  }

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

  sendMessageService(yachtId) {
    // explicitly pass yacht data to the parameter recordId
    publish(this.messageContext, YachtResultChannel, { recordId: yachtId });
  }

}