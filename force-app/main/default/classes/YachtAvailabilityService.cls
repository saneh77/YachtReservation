/**
* @description Service to query Yacht Availability via Named Credential callout and handle responses/errors.
* Follows .a4drules:
* - with sharing
* - Invocable for Flow
* - Enums over string constants
* - Database methods with USER_MODE
* - Return early pattern
* - ApexDocs
*/
public with sharing class YachtAvailabilityService {
    

private static YachtReservation__mdt availabilityAPI =  YachtReservation__mdt.getInstance('Availability');

    /**
* LWC imperative entry point.
* Note: cacheable=false because this performs a callout and depends on parameters.
*/
    @AuraEnabled(cacheable=false)
    public static List<AvailableYachtsInfo> getAvailability(Date reservationDate, String yachtType, Integer minimumCapacity) {
       return queryAvailability(reservationDate, yachtType, minimumCapacity);
    }
    
    public static List<AvailableYachtsInfo> queryAvailability(Date dateOfAvailability, String yachtType, Integer minCapacity) {
        
        // Construct SOQL string per user-provided pattern, with safe escaping where applicable
        // Note: Date literal formatted as ISO yyyy-MM-dd
        List<AvailableYachtsInfo> listofavailableYachtsInfo = new List<AvailableYachtsInfo>();
        Map<Id, YachtAvailabilityWrapper.records> yachtAvailabilityMap = new Map<Id, YachtAvailabilityWrapper.records>();
        String dateLiteral = String.valueOf(dateOfAvailability);
        
        String soql =
            'SELECT Is_Available__c, Date_of_Availability__c, Individual_Yacht__c, Yacht_Rent__c ' +
            'FROM Yacht_Availability__c ' +
            'WHERE Date_of_Availability__c = ' + dateLiteral;
            if(String.isNotBlank(yachtType) && yachtType != 'All Types'){
               soql += ' AND Yacht_Type__c = \'' + String.escapeSingleQuotes(yachtType) + '\' ';
            }
            soql += 'AND Individual_Yacht__r.Capacity__c >= ' + minCapacity + ' order by Is_Available__c desc';
        
        
        String endpoint = availabilityAPI.Named_Credential__c + availabilityAPI.Endpoint_Path__c +
            '?q=' + EncodingUtil.urlEncode(soql, 'UTF-8');
        
        HttpRequest req = new HttpRequest();
        req.setEndpoint(endpoint);
        req.setMethod('GET');
        req.setHeader('Content-Type', 'application/json');
        
        Http http = new Http();
        HttpResponse res;
        Integer statusCode;
        String body;
        try {
            res = http.send(req);
            statusCode = res.getStatusCode();
            body = res.getBody();
            system.debug('YachtAvailabilityService.queryAvailability: ' + body);
            if(statusCode == 200) {
                YachtAvailabilityWrapper yachtAvailability = (YachtAvailabilityWrapper ) JSON.deserialize(body.replaceAll('__c','_temp'), YachtAvailabilityWrapper.class);
                system.debug(' yachtAvailability ::' + yachtAvailability.records);
                if(yachtAvailability.totalSize > 0){

                    for(YachtAvailabilityWrapper.records rec : yachtAvailability.records){
                        yachtAvailabilityMap.put(rec.Individual_Yacht_temp,rec);
                    }

                    List<Individual_Yacht__c> listofavailableYachts= [select id,name,Description__c,length__c,Yacht_Type__r.name,Yacht_External_ID__c,Capacity__c,Image_URL__c from Individual_Yacht__c where  Yacht_External_ID__c in :yachtAvailabilityMap.keySet() AND Active__c = true with SECURITY_ENFORCED];
                    if(!listofavailableYachts.isEmpty()){
                        for(Individual_Yacht__c yacht : listofavailableYachts){

                            AvailableYachtsInfo yachtInfo = new AvailableYachtsInfo();
                            yachtInfo.partSize = minCapacity;
                            yachtInfo.reservationDate = yachtAvailabilityMap.get(yacht.Yacht_External_ID__c).Date_of_Availability_temp;
                            yachtInfo.yachtId = yacht.id;
                            yachtInfo.isAvailable = yachtAvailabilityMap.get(yacht.Yacht_External_ID__c).Is_Available_temp;
                            yachtInfo.yachtName = yacht.name;
                            yachtInfo.yachtType = yacht.Yacht_Type__r.name;
                            yachtInfo.imageURL =  yacht.Image_URL__c;
                            yachtInfo.capacity = yacht.Capacity__c;
                            yachtInfo.price = yachtAvailabilityMap.get(yacht.Yacht_External_ID__c).Yacht_Rent_temp;
                            yachtInfo.description = yacht.Description__c;
                            yachtInfo.length = yacht.length__c;
                            listofavailableYachtsInfo.add(yachtInfo);
                        }

                        system.debug('listofavailableYachtsInfo ' + listofavailableYachtsInfo);
                    }
                }
            }
            else{
                 system.debug('API Response code ::' + statusCode);
                 system.debug('API Response body ::' + body);

                YachtReservationHelperClass.createIntegrationlogs('Availability', null, endpoint, body, '', 'HTTP ' + String.valueOf(statusCode));           

            }
        } catch (System.CalloutException ex) {
            // Persist error to Integration_Logs__c (best-effort)
            
    
                YachtReservationHelperClass.createIntegrationlogs('Availability', null, endpoint, body, '', 'CalloutException:  ' + ex.getMessage());           

            
        } catch (Exception ex) {
            // Persist error to Integration_Logs__c (best-effort)
            
                YachtReservationHelperClass.createIntegrationlogs('Availability', null, endpoint, body, '', 'Unexpected Exception: ' + ex.getMessage());           
            
        }

        return listofavailableYachtsInfo;
    }

    @AuraEnabled(cacheable=true)
    public static List<Yacht_Type__c> getyachtTypes(){
        try {
            // Validate CRUD (read) before SOQL and enforce FLS via WITH SECURITY_ENFORCED
            Schema.DescribeSObjectResult d = Yacht_Type__c.SObjectType.getDescribe();
            if (!d.isAccessible()) {
                throw new AuraHandledException('Insufficient access to read Yacht Types.');
            }
            return [
                SELECT Name
                FROM Yacht_Type__c
                WITH SECURITY_ENFORCED
            ];
        }
        catch (Exception e) {
            // Return a safe, user-facing message without leaking internals
            throw new AuraHandledException('Unable to load Yacht Types at this time.');
        }
    }

    @AuraEnabled
    public static string createReservation(String reservationInformation){

        ReservationInfo reservationInfo = (ReservationInfo) JSON.deserialize(reservationInformation, ReservationInfo.class);
        Yacht_Reservation__c reservation = new Yacht_Reservation__c();
        string reservationMessage;
        try {
            reservation.Individual_Yacht__c = reservationInfo.yachtId;
            reservation.Reservation_Date__c = reservationInfo.reservationDate;
            reservation.Party_Size__c = reservationInfo.partySize;
            reservation.Guest_Name__c = reservationInfo.guestName;
            reservation.Guest_Email__c = reservationInfo.guestEmail;
            reservation.Final_Price__c = reservationInfo.price;
            reservation.Unique_Key__c = reservationInfo.yachtId + '_' +  reservationInfo.reservationDate;
            reservation.Status__c = 'Pending';
            insert reservation;
            if(reservation.Id != null){
                reservationMessage = Label.Reservation_Confirmation_Message;
            }

            YachtReservationHelperClass.createReservationInExternalSystem(reservation.id);            

        } catch (Exception e) {
            // Return a safe, user-facing message without leaking internals
            YachtReservationHelperClass.createIntegrationlogs('Reservation', '', reservationInformation, '', '', 'Unexpected Exception: ' + e.getMessage());           

            throw new AuraHandledException('Reservation failed. Error details :: ' + e.getMessage());

        }

        return reservationMessage;
    }



    
    public class AvailableYachtsInfo{
        @AuraEnabled
        public Decimal partSize;
        @AuraEnabled
        public Decimal length;
        @AuraEnabled
        public String description;
        @AuraEnabled
        public string reservationDate;
        @AuraEnabled
        public Id yachtId;
        @AuraEnabled
        public Boolean isAvailable;
        @AuraEnabled
        public String yachtName;
        @AuraEnabled
        public String yachtType;
        @AuraEnabled
        public Decimal capacity;
        @AuraEnabled
        public string imageURL;
        @AuraEnabled
        public Decimal price;

    }

     
    public class ReservationInfo{
        @AuraEnabled
        public String yachtName;
        @AuraEnabled
        public Date reservationDate;
        @AuraEnabled
        public Id yachtId;
        @AuraEnabled
        public Decimal price;
        @AuraEnabled
        public Decimal partySize;
        @AuraEnabled
        public String guestName;
        @AuraEnabled
        public String guestEmail;
    }
    
}