import { LightningElement, api, track } from 'lwc';

export default class Vosf_NonTabularQuestion extends LightningElement {
    @api questionWrapper;
    @track ques;
    @api isPrimary;
    @api firstIndex;
    @api secondIndex;
    @api thirdIndex;
    @api isDisabled;
 
    connectedCallback() {
        this.ques = JSON.parse(JSON.stringify(this.questionWrapper));
        console.log('Question Data',JSON.parse(JSON.stringify(this.ques)))
        this.isTotalValidationRequired = this.ques.Question.Is_Total_Validation_Required__c;
    }
    handleSaveResponses(event) {
        let responsesList = event.detail.response;
        let selectedEvent = new CustomEvent('responses', {
            detail: {
                response: responsesList
            }
        });
        this.dispatchEvent(selectedEvent);
    }
    @api
    inputValue(){
      return  this.template.querySelector('c-vosf_lightning-input').inputValue();
    }

    checkvalidity;
    @api changedata(data){
       
     let  linput= this.template.querySelector("c-vosf_lightning-input");
        if(linput){
            linput.changedata(data);
        }
    }
    @api
    reportValidity(){
        let totalvalidation = false;
        this.checkvalidity = false;
        if (this.ques.IsRadio) {
            let val =  this.template.querySelector('c-vosf_lightning-radio-button-group').reportValidity();
                if (val == true)
                    this.checkvalidity = true;
          
        }
        else if (this.ques.IsCheckbox) {
          let val=  this.template.querySelector('c-vosf_lightning-checkbox-group').reportValidity();
                
                if (val == true)
                    this.checkvalidity = true;
           
        }
        else if (this.ques.IsText || this.ques.IsNumber) {
            let val=  this.template.querySelector('c-vosf_lightning-input').reportValidity();                 
                  if (val == true)
                      this.checkvalidity = true;
             
          }
          else if (this.ques.IsMultiselect) {
            let val = this.template.querySelector('c-vosf_multi-select').reportValidity();

            if (val == true)
                this.checkvalidity = true;

        }
        else if (this.ques.IsTextArea || this.ques.IsComment) {
            let val = this.template.querySelector('c-vosf_lightning-textarea').reportValidityTextArea();


            if (val == true)
                this.checkvalidity = true;

        }
          else if (this.ques.IsCombobox) {
            let val=  this.template.querySelector('c-vosf_lightning-combo-box').reportValidity();
                  
                  if (val == true)
                      this.checkvalidity = true;
             
          }
       
        else if (this.ques.IsSlider) {
            this.template.querySelectorAll('c-vosf_lightning-slider').forEach(element => {
                let val = element.reportSliderValidity();
                if (val == true)
                    this.checkvalidity = true;
            });
        }
        else if (this.ques.IsRating) {
            if(this.template.querySelector('c-vosf_rating').reportValidity()){
                this.checkvalidity = true;
            }
        }
        return this.checkvalidity;
    }
}