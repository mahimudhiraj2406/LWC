import { LightningElement, track, wire, api } from 'lwc';
import getOrdersList from '@salesforce/apex/OrderController.getOrdersList';
export default class OrdersList extends LightningElement {
    @api recordId;
    @track data = {};
    @wire (getOrdersList, { recordId: '$recordId' })
    wiredData(result){
        if (result.data){
            let parsedData = JSON.parse(JSON.stringify(result));
           this.data = parsedData.data;
        }
    }
}