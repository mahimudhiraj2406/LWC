/*
import { LightningElement, wire, track } from 'lwc';
import getAccounts from '@salesforce/apex/CustomObjectController.getAccounts';
import createCustomRecords from '@salesforce/apex/CustomObjectController.createCustomRecords';

const columns = [
    { label: 'Name', fieldName: 'Name', type: 'text' },
    { label: 'Industry', fieldName: 'Industry', type: 'text' },
    { label: 'Type', fieldName: 'Type', type: 'text' },
    {
        label: 'Add',
        type: 'button',
        initialWidth: 70,
        typeAttributes: { label: 'Add', name: 'add', title: 'Add', variant: 'brand' }
    },
    {
        label: 'Block',
        type: 'button',
        initialWidth: 70,
        typeAttributes: { label: 'Block', name: 'block', title: 'Block', variant: 'destructive' }
    }
];

export default class CustomObjectDataTable extends LightningElement {
    @track accounts;
    columns = columns;
    recordIdToAction = {};

    @wire(getAccounts)
    wiredAccounts({ error, data }) {
        if (data) {
            this.accounts = data;
        } else if (error) {
            // handle error
            console.error('Error retrieving accounts:', error);
        }
    }

    handleRowAction(event) {
        const { row, action } = event.detail;
        if (action.name === 'add' || action.name === 'block') {
            this.recordIdToAction[row.Id] = action.name;
        }
    }

    handleSubmit() {
        createCustomRecords({ accounts: this.accounts, recordIdToAction: this.recordIdToAction })
            .then(() => {
                // handle success
                this.recordIdToAction = {};
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Custom records created successfully.',
                        variant: 'success'
                    })
                );
            })
            .catch((error) => {
                // handle error
                console.error('Error creating custom records:', error);
            });
    }
}
*/

/*import { LightningElement, wire, track } from 'lwc';
import getAccounts from '@salesforce/apex/CustomObjectController.getAccounts';
import createCustomRecords from '@salesforce/apex/CustomObjectController.createCustomRecords';

const columns = [
    { label: 'Name', fieldName: 'Name', type: 'text' },
    { label: 'Industry', fieldName: 'Industry', type: 'text' },
    { label: 'Type', fieldName: 'Type', type: 'text' },
    {
        label: 'Add',
        type: 'button',
        initialWidth: 70,
        typeAttributes: { label: 'Add', name: 'add', title: 'Add', variant: 'brand' }
    },
    {
        label: 'Block',
        type: 'button',
        initialWidth: 70,
        typeAttributes: { label: 'Block', name: 'block', title: 'Block', variant: 'destructive' }
    }
];

export default class CustomObjectDataTable extends LightningElement {
    @track accounts;
    columns = columns;
    selectedRows = [];
    recordIdToAction = {};

    @wire(getAccounts)
    wiredAccounts({ error, data }) {
        if (data) {
            this.accounts = data;
        } else if (error) {
            // handle error
            console.error('Error retrieving accounts:', error);
        }
    }

    handleRowAction(event) {
        const { row, action } = event.detail;
        const actionName = action.name;
        const updatedRows = [...this.selectedRows];

        if (actionName === 'add' || actionName === 'block') {
            const existingIndex = updatedRows.findIndex(item => item.Id === row.Id);
            if (existingIndex > -1) {
                updatedRows[existingIndex].Action = actionName;
            } else {
                updatedRows.push({ Id: row.Id, Action: actionName });
            }
            this.recordIdToAction[row.Id] = actionName;
        }

        this.selectedRows = updatedRows;
    }
    
    handleSubmit() {
        console.log('handleSubmit method is being called.');
        const accountIdToAction = {};
        this.selectedRows.forEach(row => {
            accountIdToAction[row.Id] = this.recordIdToAction[row.Id];
        });

        createCustomRecords({ accountIds: Object.keys(accountIdToAction), accountIdToAction })
            .then(() => {
                // handle success
                this.recordIdToAction = {};
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Custom records created successfully.',
                        variant: 'success'
                    })
                );
            })
            .catch((error) => {
                // handle error
                console.error('Error creating custom records:', error);
            });
    }
}
*/

import { LightningElement, wire, track } from 'lwc';
import getAccounts from '@salesforce/apex/CustomObjectController.getAccounts';
import createCustomRecords from '@salesforce/apex/CustomObjectController.createCustomRecords';

const columns = [
    { label: 'Name', fieldName: 'Name', type: 'text' },
    { label: 'Industry', fieldName: 'Industry', type: 'text' },
    { label: 'Type', fieldName: 'Type', type: 'text' },
    {
        label: 'Add',
        type: 'button',
        initialWidth: 70,
        typeAttributes: { label: 'Add', name: 'add', title: 'Add', variant: 'brand' }
    },
    {
        label: 'Block',
        type: 'button',
        initialWidth: 70,
        typeAttributes: { label: 'Block', name: 'block', title: 'Block', variant: 'destructive' }
    }
];

export default class CustomObjectDataTable extends LightningElement {
    @track accounts;
    columns = columns;
    selectedRows = [];
    recordIdToAction = {};

    @wire(getAccounts)
    wiredAccounts({ error, data }) {
        if (data) {
            this.accounts = data;
        } else if (error) {
            // handle error
            console.error('Error retrieving accounts:', error);
        }
    }

    handleRowAction(event) {
        const { row, action } = event.detail;
        const actionName = action.name;
        const updatedRows = [...this.selectedRows];

        if (actionName === 'add' || actionName === 'block') {
            const existingIndex = updatedRows.findIndex(item => item.Id === row.Id);
            if (existingIndex > -1) {
                updatedRows[existingIndex].Action = actionName;
            } else {
                updatedRows.push({ Id: row.Id, Action: actionName });
            }
            this.recordIdToAction[row.Id] = actionName;
        }

        this.selectedRows = updatedRows;
    }

    handleSubmit() {
        console.log('handleSubmit method is being called.'); // Add this line for verification

        const accountIdToAction = {};
        this.selectedRows.forEach(row => {
            accountIdToAction[row.Id] = this.recordIdToAction[row.Id];
        });

        createCustomRecords({ accountIds: Object.keys(accountIdToAction), accountIdToAction })
            .then(() => {
                // handle success
                this.recordIdToAction = {};
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Custom records created successfully.',
                        variant: 'success'
                    })
                );
            })
            .catch((error) => {
                // handle error
                console.error('Error creating custom records:', error);
                console.log('Error details:', error.body); // Log error details
            });
    }
}
