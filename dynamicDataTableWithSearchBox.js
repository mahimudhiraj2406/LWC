import { LightningElement, api, wire } from 'lwc';
import getData from '@salesforce/apex/dynamicApexClass.getData';

export default class DynamicDataTableWithSearchBox extends LightningElement {
    data = [];
    columns = [];
    searchTerm = [];
    filteredData = [];

    @api columnStringData;
    @api objectApiName;
    @api fieldApiNames;   
    @api customLimit;
    @api title; 

    connectedCallback(){
        this.columns = JSON.parse(this.columnStringData)
    }

    @wire(getData, {objectApiName: '$objectApiName', fieldApiNames: '$fieldApiNames', customLimit: '$customLimit'})
    wiredAllData({error, data}){
        if(data){
            this.data = data;
            this.filteredData = data;
        }else if(error){
            console.error(error);
        }
    }
    handleSearchTermChange(event){
        this.searchTerm = event.target.value;
        this.filteredData;
    }

    filtereData(){
        if(!this.searchTerm){
            this.filteredData = this.data;
            return;
        }
        this.filteredData = this.data.filter(account => account[this.filterFieldName].toLowerCase().includes(this.searchTerm.toLowerCase()));
    }
}