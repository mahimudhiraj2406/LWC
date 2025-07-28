import { LightningElement, track, wire } from 'lwc';
import retreieveObjects from '@salesforce/apex/DescribeObjectHelper.retreieveObjects';
import getListOfFields from '@salesforce/apex/DescribeObjectHelper.getListOfFields';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const DELAY = 300;


const columns = [
    { label: 'Field Label', fieldName: 'FieldLabel' }, 
    { label: 'Field API Name', fieldName: 'FieldAPIName' },       
];

let i=0;
export default class DisplayObjectsAndFields extends LightningElement {

    _title = 'Retrieve Records Error';
    message = 'Select atleast one field';
    variant = 'error';
    variantOptions = [
        { label: 'error', value: 'error' },
        { label: 'warning', value: 'warning' },
        { label: 'success', value: 'success' },
        { label: 'info', value: 'info' },
    ];
    
    @track value = '';  
    @track items = []; 
    @track fieldItems = [];    
    @track columns = columns;  
    @track selectedFieldsValue=''; 
    @track tableData;   
    
    
    @wire(retreieveObjects)
    wiredObjects({ error, data }) {
        if (data) {
            data.map(element=>{
                this.items = [...this.items ,{value: element.QualifiedApiName, 
                    label: element.MasterLabel}];  
            });
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.data = undefined;
        }
    }

    get statusOptions() {
        return this.items;
    }

    @wire(getListOfFields,{objectAPIName: '$value'})
    wiredFields({ error, data }) {
        if (data) {            
            let objStr = JSON.parse(data);            
            for(i of Object.keys(objStr)){
                console.log('FieldAPIName=' +i + 'FieldLabel=' + objStr[i]);
                this.fieldItems = [
                    {FieldLabel: objStr[i], FieldAPIName: i},...this.fieldItems];  
            }
            this.tableData = this.fieldItems;
            this.error = undefined;            
        } else if (error) {
            this.error = error;
            this.data = undefined;
        }
    }

    handleChange(event) {
        const selectedOption = event.detail.value;
        this.value = selectedOption;
        this.fieldItems = [];  
        this.tableData = [];  

        window.clearTimeout(this.delayTimeout);
        
        this.delayTimeout = setTimeout(() => {
            this.value = selectedOption;
        }, DELAY);
        
    }

    handleRowAction(event){
        const selectedRows = event.detail.selectedRows;        
        this.selectedFieldsValue = '';  
        selectedRows.map(element=>{
            if(this.selectedFieldsValue !=='' ){
                this.selectedFieldsValue = this.selectedFieldsValue + ',' + element.FieldAPIName;
            }
            else{
                this.selectedFieldsValue = element.FieldAPIName;
            }
        });
    }

    handleClick(event){        
        const valueParam = this.value;
        const selectedFieldsValueParam = this.selectedFieldsValue;
        if(selectedFieldsValueParam ===null || selectedFieldsValueParam===''){
            const evt = new ShowToastEvent({
                title: this._title,
                message: this.message,
                variant: this.variant,
            });
            this.dispatchEvent(evt);
        }
        else {
            const evtCustomEvent = new CustomEvent('retreive', {   
                detail: {valueParam, selectedFieldsValueParam}
                });
            this.dispatchEvent(evtCustomEvent);
        }        
    } 
    
    handleResetClick(event){
        this.value = '';
        this.tableData = [];
        const evtCustomEvent = new CustomEvent('reset');
        this.dispatchEvent(evtCustomEvent);
    }
}