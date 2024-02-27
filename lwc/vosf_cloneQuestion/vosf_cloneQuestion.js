import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import cloneQuestionData from '@salesforce/apex/Vosf_Questions.cloneQuestionData';

export default class Vosf_CloneQuestion extends NavigationMixin(LightningElement) {
    @api recordId;
    clonedQues;
    hasRendered = false;

    renderedCallback() {
        if (this.hasRendered) {
            this.cloneQues();
        } else {
            this.hasRendered = true;
        }
    }

    cloneQues() {
        cloneQuestionData({'questionId':this.recordId}).then(result => {
            this.clonedQues = result;
            this.navigateNext();
        })
        .catch(error => {
            this.showError(error);
        });
    }

    navigateNext() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.clonedQues,
                apiName: 'Vosf_Question__c',
                actionName: 'view'
            },
        });
        this.showSuccess();
    }

    showError(error){
        const evt = new ShowToastEvent({
            title: 'Error!',
            message: error,
            variant: 'error'
        });
        this.dispatchEvent(evt);
    }
    showSuccess(){
        const evt = new ShowToastEvent({
            title: 'Success!',
            message: 'Question successfully cloned',
            variant: 'success'
        });
        this.dispatchEvent(evt);
    }
}