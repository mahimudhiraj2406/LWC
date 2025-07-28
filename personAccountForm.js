import { LightningElement } from 'lwc';
import submitPersonEvent from '@salesforce/apex/PersonAccountFormController.submitPersonEvent';

export default class PersonAccountForm extends LightningElement {
    lastName = '';

    handleChange(event) {
        this.lastName = event.target.value;
    }

    handleSubmit() {
        submitPersonEvent({ lastName: this.lastName })
            .then(() => {
                alert('Submitted successfully!');
            })
            .catch(error => {
                console.error('Error submitting:', error);
            });
    }
}
