import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getyachtTypes from '@salesforce/apex/YachtAvailabilityService.getyachtTypes';

/**
 * @description LWC component for searching available yachts based on criteria
 * @author Salesforce Developer
 */
export default class YachtSearch extends NavigationMixin(LightningElement) {
  /**
   * @description UI state flag indicating if component is loading
   */
  isLoading = false;

  /**
   * @description Form state for yacht type selection
   */
  yachtType = 'All Types';
  
  /**
   * @description Form state for party size
   */
  partySize;
  
  /**
   * @description Form state for reservation date
   */
  reservationDate;
  
  /**
   * @description Array of yacht type options for dropdown
   */
  yachtTypesOption = [];
  
  /**
   * @description Flag to show/hide search results section
   */
  showsearchsection = false;

  /**
   * @description Getter for yacht type options to display in dropdown
   * @returns {Array} Array of options for yacht type dropdown
   */
  get yachtTypeOptions() {
    return this.yachtTypesOption;
  }

  /**
   * @description Wire adapter to fetch yacht types from Apex
   * @param {Object} data - The data returned from the Apex method
   * @param {Object} error - The error returned from the Apex method
   */
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

  /**
   * @description Getter to determine if search button should be disabled
   * @returns {Boolean} True if reservation date is not set, false otherwise
   */
  get isSearchDisabled() {
    return !this.reservationDate;
  }

  /**
   * @description Handler for yacht type change event
   * @param {Event} event - The change event from the dropdown
   */
  handleYachtTypeChange(event) {
    this.yachtType = event.detail.value;
    console.log('this.yachtType :: ' + this.yachtType);
  }

  /**
   * @description Handler for party size change event
   * @param {Event} event - The change event from the input field
   */
  handlePartySizeChange(event) {
    this.partySize = event.detail.value;
    console.log('this.partySize :: ' + this.partySize);
  }

  /**
   * @description Handler for reservation date change event
   * @param {Event} event - The change event from the date input
   */
  handleReservationDateChange(event) {
    this.reservationDate = event.detail.value;
    console.log('this.reservationDate :: ' + this.reservationDate);
  }

  /**
   * @description Handler for search button click event
   * Validates form inputs and triggers search for available yachts
   */
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

  /**
   * @description Handler for loading event - sets loading state to true
   */
  handleLoading() {
    this.isLoading = true;
  }

  /**
   * @description Handler for done loading event - sets loading state to false
   */
  handleDoneLoading() {
    this.isLoading = false;
  }

  /**
   * @description Legacy handler for search boat event (commented out)
   * This custom event comes from the form
   *   searchBoats(event) {
   *     let boatTypeId = event.detail.boatTypeId;
   *     this.template.querySelector('c-boat-search-results').searchBoats(boatTypeId);
   *     this.handleDoneLoading();
   *   }
   */


}
