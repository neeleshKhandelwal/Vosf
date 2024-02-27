import { LightningElement,api } from 'lwc';
export default class Vosf_lightningTextarea extends LightningElement {
    @api questionData;
    @api isPrimary;
    @api firstIndex;
    @api secondIndex;
    @api thirdIndex;
   @api isDisabled;
    value;
    questionStyle;
    indexNumber;
    description;
    connectedCallback() {
      this.description= this.questionData.Question.Description__c;
        if(this.questionData.Responses && this.questionData.Responses.length > 0){
            this.value = this.questionData.Responses[0].Response__c;
        }

        if(this.thirdIndex || this.thirdIndex == 0){
          this.indexNumber = this.firstIndex + "." + (parseInt(this.secondIndex)+1) + "." + (parseInt(this.thirdIndex)+1) + "." + " ";
        }
        else if(this.secondIndex || this.secondIndex == 0){
          this.indexNumber = this.firstIndex + "." + (parseInt(this.secondIndex)+1) + "." + " ";
        }
        else if(this.firstIndex){
          this.indexNumber = (parseInt(this.firstIndex)) + "." + " ";
        }


        if(this.isPrimary){
          this.questionStyle = "font-size: 16px;font-weight: bold;";
        }else{
          this.questionStyle = "font-size: 16px;";
        }
    }

    handleOnBlur(event) {
      if(this.value != event.target.value){
        this.updateResponse(event.target.value);
      }
      console.log('handle change called');
    }
    @api
    reportValidityTextArea(){
        let element=this.template.querySelector('lightning-textarea ');
        let validity=true;
       
        if(element && element.value && element.value.length>0){
            validity=true;
            element.setCustomValidity('');
        }else{
          element.setCustomValidity('Please complete this field');
            element.reportValidity();
            validity=false;
        }
        
        return validity;
    }
    updateResponse(value) {
        // console.log('this.value' + this.value);
        if (value) {
            let responsesList = [];
            var response = new Object();
            response['response'] = value;
            response['questionId'] = this.questionData.Question.Id;
            response['responseId'] = this.questionData.Responses != null && this.questionData.Responses.length > 0 ? 
            this.questionData.Responses[0].Id : null;
            responsesList.push(response);

            this.responses = responsesList;

            console.log('responsesList', JSON.stringify(responsesList));

            let selectedEvent = new CustomEvent('responses', {
                detail: {
                    response: responsesList
                }
            });
            this.dispatchEvent(selectedEvent);
        }
    }

}