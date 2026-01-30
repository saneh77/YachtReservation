/**
 * @description Queueable class to create Yacht_Reservation__c via REST callout.
 * Uses Named Credential 'YachtReservation' and logs results to Integration_Logs__c.
 * Follows: with sharing, enums for constants, Database methods, early return, bulk-safe patterns.
 */
public without sharing class YachtReservationQueueable implements Queueable, Database.AllowsCallouts {


    /**
     * @description Reference to the YachtReservation__mdt custom metadata record for reservation API configuration
     */
    private static YachtReservation__mdt reservationAPI =  YachtReservation__mdt.getInstance('Reservation');
    

    /**
     * @description Wrapper class for deserializing reservation API responses
     */
    public class ReservationAPIResponseWrapper {
        public String id;
        public Boolean success;
        public List<String> errors;
    }      

    /**
     * @description Request payload DTO for reservation API calls
     */
    public class ReservationRequestDTO {
        public String guest_Email_temp;
        public String guest_Name_temp;
        public String individual_Yacht_temp;
        public Decimal party_Size_temp;
        public Date reservation_Date_temp;
        public String status_temp;
    }

    /**
     * @description Constructor parameters
     */
    private final String guestEmail;
    private final String guestName;
    private final String externalYachtId;
    private final Decimal partySize;
    private final Date reservationDate;
    private final String status;
    private final String reservationId;

   
    /**
     * @description Full constructor with optional local record linkage for logging
     * @param reservationId The ID of the Yacht_Reservation__c record
     * @param guestEmail The email of the guest
     * @param guestName The name of the guest
     * @param externalYachtId The external ID of the yacht
     * @param partySize The size of the party
     * @param reservationDate The date of the reservation
     * @param status The status of the reservation
     */
    public YachtReservationQueueable(
        String reservationId,
        String guestEmail,
        String guestName,
        String externalYachtId,
        Decimal partySize,
        Date reservationDate,
        String status
    ) {
        this.reservationId = reservationId;
        this.guestEmail = guestEmail;
        this.guestName = guestName;
        this.externalYachtId = externalYachtId;
        this.partySize = partySize;
        this.reservationDate = reservationDate;
        this.status = status;
    }

    /**
     * @description Executes the queueable job to create a reservation in the external system
     * @param context The QueueableContext
     */
    public void execute(QueueableContext context) {

        

        // Build payload
        ReservationRequestDTO dto = new ReservationRequestDTO();
        dto.guest_Email_temp = guestEmail;
        dto.guest_Name_temp = guestName;
        dto.individual_Yacht_temp = externalYachtId;
        dto.party_Size_temp = partySize;
        dto.reservation_Date_temp = reservationDate;
        dto.status_temp = status;

        String requestPayload = JSON.serialize(dto);
        requestPayload = requestPayload.replaceAll('_temp','__c');
        // Endpoint via Named Credential
        String endpoint = reservationAPI.Named_Credential__c + reservationAPI.Endpoint_Path__c;

        HttpRequest req = new HttpRequest();
        req.setEndpoint(endpoint);
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        // Authorization handled by Named Credential
        req.setBody(requestPayload);

        Http http = new Http();
        String responseBody;
        Integer statusCode;
        String reservationExternalId;
        String errorCode;
        String errorMessage;
        

        try {
            HttpResponse res = http.send(req);
            statusCode = res.getStatusCode();
            responseBody = res.getBody();

            if (statusCode != null && statusCode >= 200 && statusCode < 300) {
                system.debug('responseBody ::' + responseBody);
                 ReservationAPIResponseWrapper resp = (ReservationAPIResponseWrapper) JSON.deserialize(responseBody, ReservationAPIResponseWrapper.class);
                 if (resp != null && string.isNotBlank(resp.Id)) {
                    reservationExternalId = resp.Id;
                    if(String.isNotBlank(reservationExternalId) && String.isNotBlank(reservationId)){

                        Yacht_Reservation__c reservation = new Yacht_Reservation__c();
                        reservation.Id = reservationId;
                        reservation.Reservation_External_Id__c = reservationExternalId;
                        reservation.Status__c = 'Confirmed';
                        update reservation;
                    }
                 }
                 
            } else {
                system.debug('statusCode ::'  + statusCode); 
                system.debug('responseBody ::'  + responseBody); 

                Yacht_Reservation__c reservation = new Yacht_Reservation__c();
                reservation.Id = reservationId;
                //reservation.Reservation_External_Id__c = reservationExternalId;
                reservation.Status__c = 'Failed';
                update reservation;
               // errorCode = statusCode != null ? String.valueOf(statusCode) : 'HTTP_ERROR';
               // errorMessage = responseBody;
               // isSuccess = false;
                YachtReservationHelperClass.createIntegrationlogs('Reservation', reservationId, requestPayload, responseBody, string.valueOf(statusCode), responseBody);           

            }
        } catch (Exception ex) {

            system.debug('Exception ::'  + ex.getMessage()); 
            // statusCode = null;
            // responseBody = null;
            // errorCode = ex.getClass().getName();
            // errorMessage = ex.getMessage();
            // isSuccess = false;
            YachtReservationHelperClass.createIntegrationlogs('Reservation', reservationId, requestPayload, responseBody, string.valueOf(statusCode), responseBody);           

        }

       // logResult(requestPayload, responseBody, isSuccess ? IntegrationStatus.SUCCESS : IntegrationStatus.FAILED, errorCode, errorMessage, createdId);
    }

}
