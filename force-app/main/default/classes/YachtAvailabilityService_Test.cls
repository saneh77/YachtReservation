/**
 * @description Unit tests for YachtAvailabilityService.
 * - Uses HttpCalloutMock
 * - Covers success, error, and parse error paths
 * - No SeeAllData
 * - Uses Test.startTest/stopTest
 */
@IsTest
private class YachtAvailabilityService_Test {
    
    /**
     * @description Setup method to create test data for yacht types and individual yachts
     */
    @testSetup 
    static void yachtDatasetup() {
        
        List<Yacht_Type__c> yachtTypeList = new List<Yacht_Type__c>();

        Yacht_Type__c yachtType = new Yacht_Type__c();
        yachtType.Name = 'Luxury Day Yacht';

        Yacht_Type__c yachtType1 = new Yacht_Type__c();
        yachtType.Name = 'Luxury Day Yacht1';

        yachtTypeList.add(yachtType);
        yachtTypeList.add(yachtType1);
        
        insert yachtTypeList;

        List<Individual_Yacht__c> individualYachtList = new List<Individual_Yacht__c>();

        
            Individual_Yacht__c yacht = new Individual_Yacht__c();
            yacht.Name = 'Luxury Day Yacht';
            yacht.Yacht_Type__c = yachtTypeList[0].Id;
            yacht.Capacity__c = 35;
            yacht.Description__c = 'This is a luxury day yacht';
            yacht.Length__c = 35;
            yacht.Image_URL__c = 'https://www.google.com';
            yacht.Active__c = true;
            yacht.Yacht_External_ID__c = 'a00gK00000caARFQA2';
            individualYachtList.add(yacht);
       

        insert individualYachtList;
    
    }
    

    /**
     * @description Test method for getyachtTypes method
     */
    @IsTest
    static void testgetyachtTypes(){


        List<Yacht_Type__c> yachtTypeList = new List<Yacht_Type__c>();
        Test.startTest();
        yachtTypeList = YachtAvailabilityService.getyachtTypes();
        Test.stopTest();

        System.Assert.areEqual(2, yachtTypeList.size());
        
    }


    /**
     * @description Test method for successful getAvailability call
     */
    @IsTest
    static void test_getAvailability_success() {

        Date d = Date.newInstance(2026, 3, 22);
        YachtApiCalloutMock mock = new YachtApiCalloutMock();
        Test.setMock(HttpCalloutMock.class, mock);

        Test.startTest();
        List<YachtAvailabilityService.AvailableYachtsInfo> result = YachtAvailabilityService.getAvailability(d, 'Luxury Day Yacht', 35);
        Test.stopTest();
        
         System.assertEquals(1, result.size());
         System.assertEquals(true, result[0].isAvailable);
    }
    
    /**
     * @description Test method for successful reservation creation
     */
    @IsTest
    static void testcreateReservation() {

        List<Individual_Yacht__c> Yachtinfo = [select id,name from Individual_Yacht__c where name = 'Luxury Day Yacht' ];
        
        YachtAvailabilityService.ReservationInfo reservationInfo = new YachtAvailabilityService.ReservationInfo();
         
        reservationInfo.yachtName = Yachtinfo[0].name;
        reservationInfo.reservationDate = Date.newInstance(2026, 3, 22);
        reservationInfo.yachtId = Yachtinfo[0].id;
        reservationInfo.price = 1250.00;
        reservationInfo.partySize = 35;
        reservationInfo.guestName = 'test';
        reservationInfo.guestEmail = 'test@test.com';

        YachtApiCalloutMock mock = new YachtApiCalloutMock();
        Test.setMock(HttpCalloutMock.class, mock);
        Test.startTest();
        YachtAvailabilityService.createReservation(JSON.serialize(reservationInfo));
        Test.stopTest();

    }
    /**
     * @description Test method for reservation creation with callout error
     */
    @IsTest
    static void testcreateReservationException() {

        List<Individual_Yacht__c> Yachtinfo = [select id,name from Individual_Yacht__c where name = 'Luxury Day Yacht' ];
        
        YachtAvailabilityService.ReservationInfo reservationInfo = new YachtAvailabilityService.ReservationInfo();
         
        reservationInfo.yachtName = Yachtinfo[0].name;
        reservationInfo.reservationDate = Date.newInstance(2026, 3, 22);
        reservationInfo.yachtId = Yachtinfo[0].id;
        reservationInfo.price = 1250.00;
        reservationInfo.partySize = 35;
        reservationInfo.guestName = 'test';
        reservationInfo.guestEmail = 'test@test.com';

        CalloutErrorMock mock = new CalloutErrorMock();
        Test.setMock(HttpCalloutMock.class, mock);
        Test.startTest();
        YachtAvailabilityService.createReservation(JSON.serialize(reservationInfo));
        Test.stopTest();

    }
    /**
     * @description Test method for reservation creation with Aura exception
     */
    @IsTest
    static void testcreateReservationAuraException() {

        List<Individual_Yacht__c> Yachtinfo = [select id,name from Individual_Yacht__c where name = 'Luxury Day Yacht' ];
        
        YachtAvailabilityService.ReservationInfo reservationInfo = new YachtAvailabilityService.ReservationInfo();
         
        reservationInfo.yachtName = Yachtinfo[0].name;
        reservationInfo.reservationDate = Date.newInstance(2026, 3, 22);
        reservationInfo.yachtId = Yachtinfo[0].id;
        reservationInfo.price = 1250.00;
        reservationInfo.partySize = 35;
        reservationInfo.guestName = 'test';
        reservationInfo.guestEmail = 'test@test.com';

        ExceptionErrorMock mock = new ExceptionErrorMock();
        Test.setMock(HttpCalloutMock.class, mock);
        Test.startTest();
        YachtAvailabilityService.createReservation(JSON.serialize(reservationInfo));
        Test.stopTest();

    }
    /**
     * @description Test method for reservation creation with server error
     */
    @IsTest
    static void testcreateReservationServerError() {

        List<Individual_Yacht__c> Yachtinfo = [select id,name from Individual_Yacht__c where name = 'Luxury Day Yacht' ];
        
        YachtAvailabilityService.ReservationInfo reservationInfo = new YachtAvailabilityService.ReservationInfo();
         
        reservationInfo.yachtName = Yachtinfo[0].name;
        reservationInfo.reservationDate = Date.newInstance(2026, 3, 22);
        reservationInfo.yachtId = Yachtinfo[0].id;
        reservationInfo.price = 1250.00;
        reservationInfo.partySize = 35;
        reservationInfo.guestName = 'test';
        reservationInfo.guestEmail = 'test@test.com';

        ServerErrorMock mock = new ServerErrorMock();
        Test.setMock(HttpCalloutMock.class, mock);
        Test.startTest();
        YachtAvailabilityService.createReservation(JSON.serialize(reservationInfo));
        Test.stopTest();

    }
    /**
     * @description Test method for getAvailability exception handling with callout error
     */
    @IsTest
    static void test_getAvailability_exception_handling() {
        // Test that exceptions in getAvailability are properly handled
        Date d = Date.newInstance(2026, 3, 22);
        
       
        Test.setMock(HttpCalloutMock.class, new CalloutErrorMock());
        
        Test.startTest();
        List<YachtAvailabilityService.AvailableYachtsInfo> result = YachtAvailabilityService.getAvailability(d, 'Luxury Day Yacht', 35);
        Test.stopTest();
        
        
    }

    /**
     * @description Test method for getAvailability exception handling with general exception
     */
    @IsTest
    static void test_getAvailability_exception_handling1() {
        // Test that exceptions in getAvailability are properly handled
        Date d = Date.newInstance(2026, 3, 22);
        
       
        Test.setMock(HttpCalloutMock.class, new ExceptionErrorMock());
        
        Test.startTest();
        List<YachtAvailabilityService.AvailableYachtsInfo> result = YachtAvailabilityService.getAvailability(d, 'Luxury Day Yacht', 35);
        Test.stopTest();
        
        
    }

    /**
     * @description Test method for getAvailability server error handling
     */
    @IsTest
    static void test_getAvailability_server_error_handling() {
        // Test that exceptions in getAvailability are properly handled
        Date d = Date.newInstance(2026, 3, 22);
        
       
        Test.setMock(HttpCalloutMock.class, new ServerErrorMock());
        
        Test.startTest();
        List<YachtAvailabilityService.AvailableYachtsInfo> result = YachtAvailabilityService.getAvailability(d, 'Luxury Day Yacht', 35);
        Test.stopTest();
        
        
    }

    /**
     * @description Mock class for simulating HTTP callout exceptions
     */
    private class CalloutErrorMock implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            throw new System.CalloutException('Simulated callout exception for testing purposes');
            
        }
    }
    /**
     * @description Mock class for simulating HTTP server errors
     */
    private class ServerErrorMock implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(500);
            res.setStatus('Internal Server Error');
            return res;            
        }
    }
    /**
     * @description Mock class for simulating Aura exceptions
     */
    private class ExceptionErrorMock implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            throw new AuraHandledException('Simulated exception for testing purposes');
            
        }
    }
//     private class mockWithException implements HttpCalloutMock {
    
    
//     public HTTPResponse respond(HTTPRequest req) {
//         // Validate request method
//         HttpResponse res = new HttpResponse();
        
//         // Throw an exception to test error handling in getAvailability
//         throw new System.CalloutException('Simulated callout exception for testing purposes');
        
//         // Note: The above line will always throw an exception, so this return will never be reached
//         // This is intentional for testing exception handling
//         return res;
//     }
// }

    // @IsTest
    // static void test_queryAvailability_success() {
    //     Date d = Date.newInstance(2026, 3, 22);
        
    //     Test.startTest();
    //     List<YachtAvailabilityService.AvailableYachtsInfo> result = YachtAvailabilityService.queryAvailability(d, 'Luxury Day Yacht', 35);
    //     Test.stopTest();
        
    //     System.assertEquals(1, result.size());
    //     System.assertEquals(true, result[0].isAvailable);
    //     System.assertEquals('2026-03-22', result[0].reservationDate);
    //     System.assertEquals('a01xx0000000001AAA', result[0].yachtId);
    //     System.assertEquals(1234.56, result[0].price);
    // }
    
    // @IsTest
    // static void test_queryAvailability_http_error() {
    //     Date d = Date.newInstance(2026, 3, 22);
        
    //     Test.startTest();
    //     List<YachtAvailabilityService.AvailableYachtsInfo> result = YachtAvailabilityService.queryAvailability(d, 'Luxury Day Yacht', 35);
    //     Test.stopTest();
        
    //     System.assertEquals(0, result.size());
    // }
    
    // @IsTest
    // static void test_queryAvailability_parse_error() {
    //     Date d = Date.newInstance(2026, 3, 22);
        
    //     Test.startTest();
    //     List<YachtAvailabilityService.AvailableYachtsInfo> result = YachtAvailabilityService.queryAvailability(d, 'Luxury Day Yacht', 35);
    //     Test.stopTest();
        
    //     System.assertEquals(0, result.size());
    // }
    
    // @IsTest
    // static void test_input_validation_missing_fields() {
    //     Test.startTest();
    //     List<YachtAvailabilityService.AvailableYachtsInfo> result1 = YachtAvailabilityService.queryAvailability(null, 'Luxury Day Yacht', 35);
    //     List<YachtAvailabilityService.AvailableYachtsInfo> result2 = YachtAvailabilityService.queryAvailability(Date.today(), null, 35);
    //     List<YachtAvailabilityService.AvailableYachtsInfo> result3 = YachtAvailabilityService.queryAvailability(Date.today(), 'Luxury Day Yacht', null);
    //     Test.stopTest();
        
    //     System.assertEquals(0, result1.size());
    //     System.assertEquals(0, result2.size());
    //     System.assertEquals(0, result3.size());
    // }
}
