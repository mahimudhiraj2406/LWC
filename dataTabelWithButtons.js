/*import { LightningElement, wire } from 'lwc';
import fetchData from '@salesforce/apex/createButtonClass.fetchData';

import CustomButton1 from 'c/customButton1';
import CustomButton2 from 'c/customButton2';

export default class DataTableWithButtons extends LightningElement {
    data = [];
    columns = [
        { label: 'Name', fieldName: 'Name', type: 'text' },
        { label: 'Button 1', type: 'button', typeAttributes: { label: 'Button 1', name: 'button1', title: 'Button 1', variant: 'base' }, typeAttributes: { cellAttributes: { iconName: 'utility:check', iconPosition: 'left' }, buttonComponent: CustomButton1 } },
        { label: 'Button 2', type: 'button', typeAttributes: { label: 'Button 2', name: 'button2', title: 'Button 2', variant: 'base' }, typeAttributes: { cellAttributes: { iconName: 'utility:check', iconPosition: 'left' }, buttonComponent: CustomButton2 } }
    ];

    @wire(fetchData)
    wiredData({ error, data }) {
        if (data) {
            this.data = data.map(record => ({...record, Id: record.Id}));
        } else if (error) {
            console.error(error);
        }
    }
}*/

import { LightningElement } from 'lwc';  
import fetchAccounts from '@salesforce/apex/createButtonClass.fetchData';  
import { NavigationMixin } from 'lightning/navigation';  
  
const COLUMNS = [  
    { label: 'Id', fieldName: 'Id' },  
    { label: 'Name', fieldName: 'Name' },  
    { label: 'Industry', fieldName: 'Industry' },  
    { type: "button", typeAttributes: {  
        label: 'View',  
        name: 'View',  
        title: 'View',  
        disabled: false,  
        value: 'view',  
        iconPosition: 'left'  
    } },  
    { type: "button", typeAttributes: {  
        label: 'Edit',  
        name: 'Edit',  
        title: 'Edit',  
        disabled: false,  
        value: 'edit',  
        iconPosition: 'left'  
    } }  
];  

export default class accountSearchLWC extends NavigationMixin(LightningElement) {  
  
    accounts;  
    error;  
    columns = COLUMNS;  
  
    handleKeyChange( event ) {  
          
        const searchKey = event.target.value;  
  
        if ( searchKey ) {  
  
            fetchAccounts( { searchKey } )    
            .then(result => {  
  
                this.accounts = result;  
  
            })  
            .catch(error => {  
  
                this.error = error;  
  
            });  
  
        } else  
        this.accounts = undefined;  
  
    }      
      
    callRowAction( event ) {  
          
        const recId =  event.detail.row.Id;  
        const actionName = event.detail.action.name;  
        if ( actionName === 'Edit' ) {  
  
            this[NavigationMixin.Navigate]({  
                type: 'standard__recordPage',  
                attributes: {  
                    recordId: recId,  
                    objectApiName: 'Account',  
                    actionName: 'edit'  
                }  
            })  
  
        } else if ( actionName === 'View') {  
  
            this[NavigationMixin.Navigate]({  
                type: 'standard__recordPage',  
                attributes: {  
                    recordId: recId,  
                    objectApiName: 'Account',  
                    actionName: 'view'  
                }  
            })  
  
        }          
  
    }  
  
}  


/*const COLUMNS = [
    { label: 'Id', fieldName: 'Id' },
    { label: 'Name', fieldName: 'Name' },
    { label: 'Industry', fieldName: 'Industry' },
    { label: 'Action', type: 'button', initialWidth: 135, typeAttributes: {
        label: { fieldName: 'AddOrBlockLabel' }, // Use a new field to store picklist label
        title: 'Action',
        disabled: false,
        value: { fieldName: 'AddOrBlock__c' },
        variant: 'brand'
    }},
];

export default class accountSearchLWC extends NavigationMixin(LightningElement) {
    accounts;
    error;
    columns = COLUMNS;

    handleKeyChange(event) {
        const searchKey = event.target.value;
        if (searchKey) {
            fetchAccounts({ searchKey })
            .then(result => {
                this.accounts = result.map(record => ({
                    ...record,
                    AddOrBlockLabel: this.getLabelForPicklistValue(record.AddOrBlock__c) // Get label for picklist value
                }));
                this.error = undefined; // Reset error if successful
            })
            .catch(error => {
                this.error = error;
                this.accounts = undefined; // Reset accounts if error
                console.error('Error fetching accounts:', error);
            });
        } else {
            this.accounts = undefined;
        }
    }

    // Function to get label for picklist value
    getLabelForPicklistValue(value) {
        if (value === 'Add') {
            return 'Add';
        } else if (value === 'Block') {
            return 'Block';
        }
        // Add more conditions if needed
        return value;
    }

    callRowAction(event) {
        const recId = event.detail.row.Id;
        const actionName = event.detail.action.value;
        if (actionName === 'edit') {
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: recId,
                    objectApiName: 'Account',
                    actionName: 'edit'
                }
            });
        }
    }
}*/
