import { LightningElement, track } from 'lwc';

export default class HelloWorld extends LightningElement {
    @track dynamicComponent = "World";
    greetingChangeHandler(event){
        this.dynamicComponent = event.target.value;
    }
}