/*
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createFeedback from '@salesforce/apex/FeedbackController.createFeedback';

export default class FeedbackForm extends LightningElement {
    @track name = '';
    @track contactNumber = '';
    @track mail = '';
    @track comment = '';
    @track rating = 0;

    changeHandler(event) {
        const field = event.target.dataset.id;
        const value = event.target.value;

        if (field === 'name') {
            if (/^[a-zA-Z ]*$/.test(value)) {
                this.name = value;
                event.target.setCustomValidity(''); // clear any previous error
            } else {
                event.target.setCustomValidity('Name should only contain alphabets.');
            }
        } else if (field === 'contactNumber') {
            if (/^\d{10}$/.test(value)) {
                this.contactNumber = value;
                event.target.setCustomValidity(''); // clear any previous error
            } else {
                event.target.setCustomValidity('Contact number should be a 10 digit number.');
            }
        } else if (field === 'mail') {
            if (/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(value)) {
                this.mail = value;
                event.target.setCustomValidity(''); // clear any previous error
            } else {
                event.target.setCustomValidity("Email should be a valid address and end with '@gmail.com'.");
            }
        } else if (field === 'comment') {
            this.comment = value;
        }
        event.target.reportValidity();
    }

    selectRating(event) {
        const rating = event.target.dataset.value;
        this.rating = rating;
        this.highlightStars(rating);
        this.hideRatingError();
    }

    highlightStars(rating) {
        const stars = this.template.querySelectorAll('.star');
        stars.forEach(star => {
            if (star.dataset.value <= rating) {
                star.classList.add('selected');
            } else {
                star.classList.remove('selected');
            }
        });
    }

    showRatingError() {
        const errorElement = this.template.querySelector('.rating-error');
        errorElement.classList.remove('slds-hide');
    }

    hideRatingError() {
        const errorElement = this.template.querySelector('.rating-error');
        errorElement.classList.add('slds-hide');
    }

    handleClick() {
        // Validate required fields
        const allValid = [...this.template.querySelectorAll('lightning-input')]
            .reduce((validSoFar, inputCmp) => {
                inputCmp.reportValidity();
                return validSoFar && inputCmp.checkValidity();
            }, true);

        if (!allValid) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Please fill in all required fields correctly.',
                    variant: 'error'
                })
            );
            return;
        }

        // Validate rating
        if (this.rating === 0) {
            this.showRatingError();
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Please provide a rating.',
                    variant: 'error'
                })
            );
            return;
        }

        const fields = {
            Name: this.name,
            Contact_Number__c: this.contactNumber,
            Email__c: this.mail,
            Comments__c: this.comment,
            Rating__c: this.rating
        };
        createFeedback({ feedback: fields })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Feedback submitted successfully',
                        variant: 'success'
                    })
                );
                this.clearForm();
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Error submitting feedback',
                        variant: 'error'
                    })
                );
            });
    }

    clearForm() {
        this.name = '';
        this.contactNumber = '';
        this.mail = '';
        this.comment = '';
        this.rating = 0;
        this.highlightStars(0);
        this.hideRatingError();
    }
}
*/


import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createFeedback from '@salesforce/apex/FeedbackController.createFeedback';
import { NavigationMixin } from 'lightning/navigation';

export default class FeedbackForm extends NavigationMixin(LightningElement) {
    @track name = '';
    @track contactNumber = '';
    @track email = '';
    @track comments = '';
    @track rating = 0;

    stars = [
        { value: 1 },
        { value: 2 },
        { value: 3 },
        { value: 4 },
        { value: 5 }
    ];

    handleInputChange(event) {
        const field = event.target.dataset.id;
        const value = event.target.value;

        if (field === 'name') {
            const nameRegex = /^[A-Za-z\s]+$/;
            if (!nameRegex.test(value)) {
                event.target.setCustomValidity('Name should contain only alphabets');
            } else {
                event.target.setCustomValidity('');
                this.name = value;
            }
        } else if (field === 'contactNumber') {
            const contactNumberRegex = /^\d{10}$/;
            if (!contactNumberRegex.test(value)) {
                event.target.setCustomValidity('Contact Number should be a 10-digit number');
            } else {
                event.target.setCustomValidity('');
                this.contactNumber = value;
            }
        } else if (field === 'email') {
            const emailRegex = /^[a-z]+@gmail\.com$/;
            if (!emailRegex.test(value)) {
                event.target.setCustomValidity('Email should be in the format: name@gmail.com');
            } else {
                event.target.setCustomValidity('');
                this.email = value;
            }
        } else if (field === 'comments') {
            this.comments = value;
        }

        event.target.reportValidity();
    }

    handleRatingClick(event) {
        this.rating = event.target.dataset.value;
        this.updateStarStyles(this.rating);
        this.hideRatingError();
    }

    handleHover(event) {
        this.updateStarStyles(event.target.dataset.value);
    }

    handleHoverOut() {
        this.updateStarStyles(this.rating);
    }

    updateStarStyles(rating) {
        const stars = this.template.querySelectorAll('.stars span');
        stars.forEach(star => {
            star.style.color = star.dataset.value <= rating ? '#ffd700' : '#d3d3d3';
        });
    }

    showRatingError() {
        const errorElement = this.template.querySelector('.rating-error');
        errorElement.classList.remove('slds-hide');
    }

    hideRatingError() {
        const errorElement = this.template.querySelector('.rating-error');
        errorElement.classList.add('slds-hide');
    }

    handleSubmit() {
        const allValid = [...this.template.querySelectorAll('lightning-input')]
            .reduce((validSoFar, inputCmp) => {
                inputCmp.reportValidity();
                return validSoFar && inputCmp.checkValidity();
            }, true);

        if (!allValid || this.rating === 0) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Please fill in all required fields.',
                    variant: 'error'
                })
            );
            if (this.rating === 0) {
                this.showRatingError();
            }
            return;
        }

        const fields = {
            Name: this.name,
            Contact_Number__c: this.contactNumber,
            Email__c: this.email,
            Comments__c: this.comments,
            Rating__c: this.rating
        };

        createFeedback({ feedback: fields })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Feedback submitted successfully',
                        variant: 'success'
                    })
                );
                this.clearForm();
            })
            .catch(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Error submitting feedback',
                        variant: 'error'
                    })
                );
            });
    }

    clearForm() {
        this.name = '';
        this.contactNumber = '';
        this.email = '';
        this.comments = '';
        this.rating = 0;
        this.updateStarStyles(0);
        this.hideRatingError();
    }

    navitageToLWCUsingAura(event) {
        event.preventDefault();
        this[NavigationMixin.Navigate]({
            type: 'standard__component',
            attributes: {
                componentName: 'c__feedbackDashboardAura'//aura component name
            }
        });
    }
    @api label;
}
