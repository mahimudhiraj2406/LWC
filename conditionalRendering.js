import { LightningElement, track } from 'lwc';

export default class ConditionalRendering extends LightningElement {
    @track displayDiv = false;
    @track cityList = ['Hyderabad', 'Secunderabad', 'Banglore'];
    showDivHandler(event){
        this.displayDiv = event.target.checked;
    }
}