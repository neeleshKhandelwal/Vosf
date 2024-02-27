import { LightningElement, api } from 'lwc';
export default class Vosf_welcomeMessage extends LightningElement {
    handleNext() {
        this.dispatchEvent(new CustomEvent('next'));
    }
    @api welcomeMessage;
}