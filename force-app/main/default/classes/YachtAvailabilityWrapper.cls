/**
 * @description Wrapper class for deserializing Yacht Availability API responses
 * Usage:
 * YachtAvailabilityWrapper.QueryResponse q = (YachtAvailabilityWrapper.QueryResponse) JSON.deserialize(jsonString..replaceAll('__c','_temp'), YachtAvailabilityWrapper.QueryResponse.class);
 */
public with sharing class YachtAvailabilityWrapper {
    /**
     * @description Total size of the query result
     */
    public Integer totalSize;	    
    /**
     * @description Flag indicating if the query is done
     */
	public boolean done;
    /**
     * @description List of records returned by the query
     */
	public List<records> records;

    /**
     * @description Inner class representing individual records in the response
     */
	public class records {
        /**
         * @description Attributes of the record
         */
		public attributes attributes;
        /**
         * @description Flag indicating if the yacht is available
         */
		public boolean Is_Available_temp;
        /**
         * @description Date of availability in YYYY-MM-DD format
         */
		public String Date_of_Availability_temp;	    //2026-01-26
        /**
         * @description External ID of the individual yacht
         */
		public String Individual_Yacht_temp;	    //a0Maj000000i6CGEAY
        /**
         * @description Rental price of the yacht
         */
		public Decimal Yacht_Rent_temp;	    //3509
	}

    /**
     * @description Inner class representing record attributes
     */
	class attributes {
        /**
         * @description Type of the record
         */
		public String type;	    //Yacht_Availability__c
        /**
         * @description URL of the record
         */
		public String url;	    ///services/data/v57.0/sobjects/Yacht_Availability__c/a0Oaj00000MB3jYEAT
	}
}
