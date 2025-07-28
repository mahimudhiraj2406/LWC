import { LightningElement, track } from 'lwc';

export default class SimpleCalculator extends LightningElement {
    @track currentResult;
    @track previousResult = [];
    @track showPreviousResult = false;

    FirstNumber;
    SecondNumber;

    numberChangeHandler(event) {
        const inputBoxName = event.target.name;
        if (inputBoxName === 'FirstNumber') {
            this.FirstNumber = event.target.value;
        } else if (inputBoxName === 'SecondNumber') {
            this.SecondNumber = event.target.value;
        }
    }

    addHandler() {
        const firstN = parseFloat(this.FirstNumber);
        const secondN = parseFloat(this.SecondNumber);
        this.currentResult = 'Result of ' + firstN + ' + ' + secondN + ' is ' + (firstN + secondN);
        this.previousResult.push(this.currentResult);
    }

    subHandler() {
        const firstN = parseFloat(this.FirstNumber);
        const secondN = parseFloat(this.SecondNumber);
        this.currentResult = 'Result of ' + firstN + ' - ' + secondN + ' is ' + (firstN - secondN);
        this.previousResult.push(this.currentResult);
    }

    mulHandler() {
        const firstN = parseFloat(this.FirstNumber);
        const secondN = parseFloat(this.SecondNumber);
        this.currentResult = 'Result of ' + firstN + ' X ' + secondN + ' is ' + (firstN * secondN);
        this.previousResult.push(this.currentResult);
    }

    divHandler() {
        const firstN = parseFloat(this.FirstNumber);
        const secondN = parseFloat(this.SecondNumber);
        this.currentResult = 'Result of ' + firstN + ' / ' + secondN + ' is ' + (firstN / secondN);
        this.previousResult.push(this.currentResult);
    }

    showPreviousResultToggle(event) {
        this.showPreviousResult = event.target.checked;
    }
}
