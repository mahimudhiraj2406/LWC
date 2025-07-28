// import { LightningElement, track, wire } from 'lwc';
// import getFeedbackRecords from '@salesforce/apex/FeedbackDashboardController.getFeedbackRecords';

// const columns = [
//     { label: 'Name', fieldName: 'Name', sortable: true },
//     { label: 'Contact Number', fieldName: 'Contact_Number__c', type: 'tel' },
//     { label: 'Email', fieldName: 'Email__c', type: 'email' },
//     { label: 'Rating', fieldName: 'Rating__c', sortable: true },
//     { label: 'Comments', fieldName: 'Comments__c', type: 'text' },
//     { label: 'Created Date', fieldName: 'CreatedDate', type: 'datetime', sortable: true },
// ];

// export default class FeedbackDashboard extends LightningElement {
//     @track data = [];
//     @track error;
//     @track columns = columns;
//     @track sortBy = 'CreatedDate';
//     @track sortDirection = 'asc';
//     @track ratingFilter = '';

//     @wire(getFeedbackRecords, {rating: '$ratingFilter', sortBy: '$sortBy', sortDirection: '$sortDirection' })
//     wiredFeedbacks({ error, data }) {
//         if (data) {
//             this.data = data;
//             this.error = undefined;
//         } else if (error) {
//             this.error = error;
//             this.data = undefined;
//         }
//     }

//     handleRatingFilterChange(event) {
//         this.ratingFilter = event.target.value;
//         console.log('Rating Filter:', this.ratingFilter);
//     }
    
//     handleSort(event) {
//         this.sortBy = event.detail.fieldName;
//         this.sortDirection = event.detail.sortDirection;
//     }
// }




import { LightningElement, track, wire, api } from 'lwc';
import getFeedbackRecords from '@salesforce/apex/FeedbackDashboardController.getFeedbackRecords';
import { NavigationMixin } from 'lightning/navigation';

const columns = [
    { label: 'Name', fieldName: 'Name', sortable: true },
    { label: 'Contact Number', fieldName: 'Contact_Number__c', type: 'tel' },
    { label: 'Email', fieldName: 'Email__c', type: 'email' },
    { label: 'Rating', fieldName: 'Rating__c', sortable: true },
    { label: 'Comments', fieldName: 'Comments__c', type: 'text' },
    { label: 'Created Date', fieldName: 'CreatedDate', type: 'datetime', sortable: true },
];

export default class FeedbackDashboard extends NavigationMixin(LightningElement) {
    @track data = [];
    @track error;
    @track columns = columns;
    @track sortBy = 'CreatedDate';
    @track sortDirection = 'asc';
    @track ratingFilter = '';

    @wire(getFeedbackRecords, {rating: '$ratingFilter', sortBy: '$sortBy', sortDirection: '$sortDirection' })
    wiredFeedbacks({ error, data }) {
        if (data) {
            this.data = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.data = undefined;
        }
    }

    handleRatingFilterChange(event) {
        this.ratingFilter = event.target.value;
        console.log('Rating Filter:', this.ratingFilter);
    }
    
    handleSort(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
    }
    @api label;

    navitageToLWCUsingAura(event) {
        event.preventDefault();
        this[NavigationMixin.Navigate]({
            type: 'standard__component',
            attributes: {
                componentName: 'c__feedbackAnalyticsAura'//aura component name
            }
        });
    }
}
