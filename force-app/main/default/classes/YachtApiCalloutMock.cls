/**
 * @description Mock class for Yacht API callouts to enable testing of YachtAvailabilityService without actual HTTP calls
 * Follows .a4drules:
 * - with sharing
 * - ApexDocs
 * - Return early pattern
 */
public with sharing class YachtApiCalloutMock implements HttpCalloutMock {
    
    /**
     * @description Mock implementation for HTTP callouts to Yacht API
     * @param req The HTTP request to mock
     * @return The mocked HTTP response
     */
    public HTTPResponse respond(HTTPRequest req) {
        // Validate request method
        
        HttpResponse res = new HttpResponse();

        // Validate endpoint - checking for the YachtReservation named credential
            if( req.getMethod() == 'GET' && req.getEndpoint().contains('/services/data/v57.0/query')){
                    // Default to success response with sample data
                res.setStatusCode(200);
                String body = '{"totalSize":1,"done":true,"records":[{' +
                    '"Is_Available__c":true,' +
                    '"Date_of_Availability__c":"2026-03-22",' +
                    '"Individual_Yacht__c":"a00gK00000caARFQA2",' +
                    '"Yacht_Rent__c":1234.56,' +
                    '"Capacity__c":40}' +
                ']}';
                res.setBody(body);
            }
            else if(req.getMethod() == 'POST' && req.getEndpoint().contains('services/data/v57.0/sobjects/Yacht_Reservation__c')){
                res.setStatusCode(201);
                String body = '{ "id": "a01XX000003DUMMY","success": true,"errors": []}';
                res.setBody(body);
            }
        return res;
    }
    
    
    // public static HttpResponse createServerErrorResponse() {
    //     HttpResponse res = new HttpResponse();
    //     res.setStatusCode(500);
    //     res.setBody('{"message":"Server error"}');
    //     return res;
    // }
    
    // /**
    //  * @description Creates a mock response for invalid JSON responses
    //  * @return The mocked HTTP response for parse errors
    //  */
    // public static HttpResponse createParseErrorResponse() {
    //     HttpResponse res = new HttpResponse();
    //     res.setStatusCode(200);
    //     res.setBody('this is not json');
    //     return res;
    // }
    
    // /**
    //  * @description Creates a mock response for successful availability queries
    //  * @param yachtId The ID of the yacht to include in the response
    //  * @param date The date of availability
    //  * @param isAvailable Whether the yacht is available
    //  * @param price The rental price
    //  * @param capacity The yacht capacity
    //  * @return The mocked HTTP response
    //  */
    // public static HttpResponse createSuccessResponse(
    //     String yachtId, 
    //     String Availabilitydate, 
    //     Boolean isAvailable, 
    //     Decimal price, 
    //     Integer capacity) {
        
    //     HttpResponse res = new HttpResponse();
    //     res.setStatusCode(200);
        
    //     String body = '{"totalSize":1,"done":true,"records":[{' +
    //         '"Is_Available__c":' + isAvailable + ',' +
    //         '"Date_of_Availability__c":"' + Availabilitydate + '",' +
    //         '"Individual_Yacht__c":"' + yachtId + '",' +
    //         '"Yacht_Rent__c":' + price + ',' +
    //         '"Individual_Yacht__r":{"Capacity__c":' + capacity + '}' +
    //     '}]}';
    //     res.setBody(body);
        
    //     return res;
    // }
}