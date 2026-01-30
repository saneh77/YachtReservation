import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getyachtTypes from '@salesforce/apex/YachtAvailabilityService.getyachtTypes';

export default class YachtSearch extends NavigationMixin(LightningElement) {
  // UI state
  isLoading = false;

  // Form state
  yachtType = 'All Types';
  partySize;
  reservationDate;
  yachtTypesOption = [];
  showsearchsection = false;

  // Picklist options for boat type (placeholder options – replace/augment as needed)
  get yachtTypeOptions() {
    return this.yachtTypesOption;
  }

  @wire(getyachtTypes, {})
  wiredyachtTypes({ data, error }) {
    if (data) {


      this.yachtTypesOption = data.map(item => ({
        label: item.Name,
        value: item.Name
      }));
      this.yachtTypesOption.push({ label: 'All Types', value: 'All Types' })
      console.log('this.yachtTypesOption :: ' + JSON.stringify(this.yachtTypesOption));
    }
    else if (error) {
      console.log('error :: ' + JSON.stringify(error));
    }
  }

  get isSearchDisabled() {
    return !this.reservationDate;
  }

  // Handlers for form inputs
  handleYachtTypeChange(event) {
    this.yachtType = event.detail.value;
    console.log('this.yachtType :: ' + this.yachtType);

  }

  handlePartySizeChange(event) {
    this.partySize = event.detail.value;
    console.log('this.partySize :: ' + this.partySize);
  }

  handleReservationDateChange(event) {
    this.reservationDate = event.detail.value;
    console.log('this.reservationDate :: ' + this.reservationDate);
  }

  // Search click handler
  handleSearch() {
    // this.showsearchsection = true;
    const inputFields = this.template.querySelectorAll('lightning-input');
    let isValid = true;

    // Today (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    inputFields.forEach(field => {
      // Custom validation for date field
      if (field.type === 'date' && field.value) {
        if (field.value < today) {
          field.setCustomValidity('Date cannot be in the past');
        } else {
          field.setCustomValidity('');
        }
      }

      if (!field.reportValidity()) {
        isValid = false;
      }
    });
    if (isValid) {
      this.template.querySelector('c-yacht-search-results').getAvailableYachts(this.reservationDate, this.yachtType, this.partySize);
    }

  }


  // Handles loading event
  handleLoading() {
    this.isLoading = true;
  }

  // Handles done loading event
  handleDoneLoading() {
    this.isLoading = false;
  }

  // Handles search boat event (legacy)
  // This custom event comes from the form
  //   searchBoats(event) {
  //     let boatTypeId = event.detail.boatTypeId;
  //     this.template.querySelector('c-boat-search-results').searchBoats(boatTypeId);
  //     this.handleDoneLoading();
  //   }


}