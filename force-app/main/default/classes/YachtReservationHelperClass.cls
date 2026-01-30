public without sharing class YachtReservationHelperClass {
    
    public static void createReservationInExternalSystem(Id reservationId){

        try{
        List<Yacht_Reservation__c> reservation = [select id,Individual_Yacht__c,name,Guest_Email__c,Party_Size__c,Reservation_Date__c,Guest_Name__c,Individual_Yacht__r.Yacht_External_ID__c from Yacht_Reservation__c where id =: reservationId with SECURITY_ENFORCED];
            
           
            if(!reservation.isEmpty() && reservation[0].id != null){
            System.enqueueJob(
                    new YachtReservationQueueable(
                        reservation[0].id,
                        reservation[0].Guest_Email__c,
                        reservation[0].Guest_Name__c,
                        reservation[0].Individual_Yacht__r.Yacht_External_ID__c,
                        reservation[0].Party_Size__c,
                        reservation[0].Reservation_Date__c,
                        'Confirmed')
                    );
            }
        }
        catch(Exception e){
            System.debug('Exception ::' + e.getMessage());
            createIntegrationlogs('Reservation', reservationId, '', '', '', e.getMessage());            
        }
    }

    public static void createIntegrationlogs(
        String IntegrationType,
        Id reservationId,
        String requestPayload,
        String responsePayload,
        String errorCode,
        String errorMessage){
            try{
                Integration_Logs__c il = new Integration_Logs__c();
                il.Integration_Type__c = IntegrationType;
                il.Status__c = 'Failed';
                il.Request_Payload__c = requestPayload;
                il.Error_Message__c = errorMessage;
                il.Error_Code__c = errorCode;
                if(IntegrationType == 'Reservation' && reservationId != null){
                    il.Yacht_Reservation__c = reservationId;
                }
                il.Response_Payload__c = responsePayload;
                Database.insert(new List<Integration_Logs__c>{ il }, AccessLevel.USER_MODE);
            }
            catch(Exception e){
                System.debug(' createIntegrationlogs Exception ::' + e.getMessage());
            }
        }

}