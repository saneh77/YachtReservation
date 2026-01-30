# Yacht Reservation Application

This application manages yacht reservations with support for yacht availability, booking, and integration logging.

## Objects and Fields

### Individual Yacht (`Individual_Yacht__c`)

Represents individual yachts in the system.

| Field Name | Label | Type | Description | Required | Precision/Length | Scale |
|------------|-------|------|-------------|----------|------------------|-------|
| Active__c | Active | Checkbox | Indicates if the yacht is currently active | No | - | - |
| Capacity__c | Capacity | Number | Maximum number of guests the yacht can accommodate | No | 18 | 0 |
| Description__c | Description | TextArea | Detailed description of the yacht | No | - | - |
| Image_URL__c | Image URL | Url | URL to the yacht's image | No | - | - |
| length__c | length | Number | Length of the yacht in feet | No | 18 | 0 |
| Yacht_External_ID__c | Yacht External ID | Text | External identifier for the yacht | No | 50 | - |
| Yacht_Image__c | Yacht Image | Text | Formula field displaying yacht image | No | - | - |
| Yacht_Type__c | Yacht Type | Lookup | Reference to the yacht type | Yes | - | - |

### Yacht Reservation (`Yacht_Reservation__c`)

Represents a reservation for a yacht.

| Field Name | Label | Type | Description | Required | Precision/Length | Scale |
|------------|-------|------|-------------|----------|------------------|-------|
| Final_Price__c | Final Price | Currency | The final price of the reservation | No | 18 | 2 |
| Guest_Email__c | Guest Email | Email | Email address of the guest making the reservation | No | - | - |
| Guest_Name__c | Guest Name | Text | Name of the guest making the reservation | No | 255 | - |
| Individual_Yacht__c | Individual Yacht | Lookup | Reference to the individual yacht reserved | Yes | - | - |
| Party_Size__c | Party Size | Number | Number of guests for the reservation | No | 18 | 0 |
| Reservation_Date__c | Reservation Date | Date | Date of the reservation | No | - | - |
| Reservation_External_Id__c | Reservation External Id | Text | External identifier for the reservation | No | 50 | - |
| Status__c | Status | Picklist | Status of the reservation (Pending, Confirmed, Cancelled, Failed) | No | - | - |
| Unique_Key__c | Unique Key | Text | Unique key used for handling duplicate reservations (Yacht Id_reservationDate) | No | 255 | - |
| Yacht_Type__c | Yacht Type | Text | Formula field showing the yacht type | No | - | - |

### Yacht Type (`Yacht_Type__c`)

Represents categories/types of yachts.

| Field Name | Label | Type | Description | Required | Precision/Length | Scale |
|------------|-------|------|-------------|----------|------------------|-------|
| Name | Yacht Name | Text | Standard name field for the yacht type | Yes | - | - |
| Description__c | Description | TextArea | Description of the yacht type | No | - | - |
| Max_Party_Size__c | Max Party Size | Number | Maximum party size allowed for this yacht type | No | 18 | 0 |

### Integration Log (`Integration_Logs__c`)

Tracks integration activities with external systems.

| Field Name | Label | Type | Description |
|------------|-------|------|-------------|
| Error_Code__c | Error Code | Text | Error code from integration |
| Error_Message__c | Error Message | LongTextArea | Detailed error message |
| Integration_Type__c | Integration Type | Picklist | Type of integration (Availability, Reservation) |
| Request_Payload__c | Request Payload | LongTextArea | Request sent to external system |
| Response_Payload__c | Response Payload | LongTextArea | Response received from external system |
| Status__c | Status | Picklist | Status of integration (Success, Failed) |
| Yacht_Reservation__c | Yacht Reservation | Lookup | Reference to the related reservation |

### Yacht Reservation Settings (`YachtReservation__mdt`)

Configuration settings for yacht reservation integrations.

| Field Name | Label | Type | Description | Required | Precision/Length | Scale |
|------------|-------|------|-------------|----------|------------------|-------|
| Endpoint_Path__c | Endpoint Path | LongTextArea | API endpoint path for yacht reservation system | No | 50000 | - |
| Named_Credential__c | Named Credential | Text | Name of the Named Credential for API authentication | No | 255 | - |

## Features

- Yacht search and display
- Reservation management
- Integration logging for external systems
- Support for different yacht types

## Lightning Web Components Structure

### yachtSearch
- **Purpose**: Allows users to search for available yachts based on type, party size, and reservation date
- **Apex Class**: `YachtAvailabilityService.getyachtTypes()` - Retrieves yacht types for dropdown selection
- **Key Functionality**:
  - Form validation for reservation date (prevents past dates)
  - Dynamic dropdown population with yacht types
  - Search button that validates inputs before querying availability

### yachtSearchResults
- **Purpose**: Displays search results in a scrollable grid of yacht tiles
- **Apex Class**: `YachtAvailabilityService.getAvailability()` - Fetches available yachts from external system
- **Key Functionality**:
  - Infinite scroll loading (loads 9 yachts at a time)
  - Real-time updates when yachts are reserved (via message channels)
  - Sorting by availability status (available yachts first)
  - Responsive design with height adjustment based on content

### yachtTile
- **Purpose**: Individual tile representation for each yacht in search results
- **Apex Class**: None (UI-only component)
- **Key Functionality**:
  - Visual indication of yacht availability (color-coded)
  - Background image display for yacht visuals
  - Selection mechanism that communicates with parent components

### yachtDetailView
- **Purpose**: Shows detailed information about a selected yacht and handles reservation submission
- **Apex Class**: `YachtAvailabilityService.createReservation()` - Creates new yacht reservations
- **Key Functionality**:
  - Displays yacht details (name, capacity, price, description)
  - Reservation form with guest information collection
  - Validation for required fields
  - Toast notifications for reservation success/failure
  - Integration with reservation system via message channels

## Apex Classes

### YachtAvailabilityService
- **Purpose**: Main service class for yacht availability and reservation operations
- **Key Methods**:
  - `getAvailability()`: Queries available yachts for a given date, type, and capacity
  - `getyachtTypes()`: Retrieves all yacht types for UI dropdowns
  - `createReservation()`: Creates a new yacht reservation and calls external system

### YachtReservationHelperClass
- **Purpose**: Helper class for common reservation operations and integration logging
- **Key Methods**:
  - `createIntegrationlogs()`: Logs integration activities to Integration_Logs__c object
  - `createReservationInExternalSystem()`: Handles communication with external reservation system

### YachtReservationQueueable
- **Purpose**: Queueable class to create Yacht_Reservation__c via REST callout using Named Credential
- **Key Features**:
  - Implements Queueable and Database.AllowsCallouts interfaces
  - Uses Named Credential 'YachtReservation' for external API calls
  - Logs results to Integration_Logs__c object
  - Handles reservation creation and status updates
  - Supports error handling and retry mechanisms
- **Key Methods**:
  - `execute()`: Main execution method that performs the REST callout

## Setup Instructions

1. Deploy the package to your Salesforce org
2. Configure the external credentials for yacht API integration
3. Set up the required permission sets
4. Configure the remote site settings
5. Enable and configure the Experience Site (YachtReservation)
   - Navigate to Setup → Sites and Domains → Sites
   - Select the YachtReservation site
   - Ensure it's active and configured with the correct URL path prefix (vforcesite)
   - Configure authentication settings as needed
   - Publish the site to make it accessible

## Message Channels

### YachtMessageChannel
This Lightning Message Channel is used for communication between components in the Yacht Reservation application. It carries a `recordId` field that represents the record that has changed.

### YachtResultChannel
This Lightning Message Channel is used to notify components when a yacht's availability status has changed. It carries a `recordId` field that identifies which yacht is now unavailable.

## Flows

### YachtReservationEmailNotification
This is an Auto-Launched Flow that sends email notifications to guests when their yacht reservation status changes. The flow:
- Triggers when a Yacht_Reservation__c record is updated
- Checks if the reservation status is either "Confirmed" or "Failed"
- Sends an appropriate email to the guest's email address
- Includes reservation details in the email body

## Sharing Rules

### Individual_Yacht__c Sharing Rules
This sharing rule grants Read access to the YachtReservation guest user for all active yachts (where Active__c = True).

### Yacht_Type__c Sharing Rules
This sharing rule grants Read access to the YachtReservation guest user for all yacht types with a non-empty name.

## Assumptions and Future Enhancements

### Current Implementation Assumptions
1. **Real-time API Integration**: The application assumes direct integration with an external yacht availability API for real-time data
2. **External System Reliability**: The system relies on external systems being available and responding within expected timeframes
3. **Named Credentials**: Uses Salesforce Named Credentials for secure API authentication

### Future Enhancements and Scalability Considerations
1. **Local Availability Object**: For improved performance and scalability, consider implementing a local `Yacht_Availability__c` object that syncs with the external API. This would enable:
   - Near real-time data (within 5 minutes) for better user experience
   - Lazy loading of availability data
   - Better handling of large data volumes
   - Reduced dependency on external API calls for basic queries

2. **Scheduled Sync Process**: Implement a scheduled batch process or queueable job to periodically sync availability data from external systems to the local object

3. **Caching Strategy**: Add intelligent caching for frequently accessed yacht information to reduce API calls

4. **Advanced Filtering**: Extend search capabilities with additional filters like price ranges, amenities, or location

5. **Mobile Optimization**: Further optimize the UI for mobile devices with responsive design improvements

8. **Enhanced Error Handling**: Improve error recovery mechanisms and retry logic for external API calls

## Demo Steps

1. Access the Experience Site using the assigned URL : https://orgfarm-5db03b9578-dev-ed.develop.my.site.com/
2. On the homepage, you'll see the yacht search form
3. Select a yacht type from the dropdown menu : Default all types (for example select Sport yacht)
4. Enter the party size (number of guests) : (for example 20)
5. Select a reservation date (must be in the future) 
6. Click the "Search" button to view available yachts
7. Browse the results and select a yacht to view details
8. Click "Reserve Now" to book the yacht
9. Fill in your guest details (name and email)
10. Submit the reservation form
11. You'll receive a confirmation message and the reservation will be recorded

## Negative Use Cases

1. **Past Date Selection**: Attempting to select a date in the past should be rejected with an error message
2. **Invalid Party Size**: Entering a party size that exceeds the yacht's capacity should be rejected
3. **Duplicate Reservation**: Attempting to reserve the same yacht on the same date twice should result in an error
4. **Missing Required Fields**: Leaving required fields blank in the reservation form should prevent submission
5. **Unavailable Yacht**: Attempting to reserve a yacht that's already booked should show appropriate messaging
6. **Network Issues**: If the external API call fails, the system should log the error and show a user-friendly message

## Tools Used

This project was developed with assistance from:
- **Agentforce**: AI-powered development assistant providing code templates, best practices guidance, and Salesforce expertise
- **ChatGPT**: AI model for documentation generation
- **Salesforce DX**: Development environment for building Salesforce applications
- **Lightning Web Components**: Modern framework for building user interfaces
- **Apex**: Salesforce's object-oriented programming language for business logic

The documentation and code templates were created with the help of AI tools to ensure best practices and maintainability while following Salesforce development standards.
