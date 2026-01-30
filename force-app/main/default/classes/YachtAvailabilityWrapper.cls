/*
 * Usage:
 * YachtAvailabilityWrapper.QueryResponse q = (YachtAvailabilityWrapper.QueryResponse) JSON.deserialize(jsonString..replaceAll('__c','_temp'), YachtAvailabilityWrapper.QueryResponse.class);
 */
public with sharing class YachtAvailabilityWrapper {
    public Integer totalSize;	    
	public boolean done;
	public List<records> records;

	public class records {
		public attributes attributes;
		public boolean Is_Available_temp;
		public String Date_of_Availability_temp;	    //2026-01-26
		public String Individual_Yacht_temp;	    //a0Maj000000i6CGEAY
		public Decimal Yacht_Rent_temp;	    //3509
	}

	class attributes {
		public String type;	    //Yacht_Availability__c
		public String url;	    ///services/data/v57.0/sobjects/Yacht_Availability__c/a0Oaj00000MB3jYEAT
	}
}