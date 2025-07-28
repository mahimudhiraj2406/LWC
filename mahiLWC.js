import { LightningElement } from 'lwc';

export default class MahiLWC extends LightningElement {
    fullName = "Mahi"
    title = "Aura"

    changeHandler(event){
        this.title = event.target.value
    }
}