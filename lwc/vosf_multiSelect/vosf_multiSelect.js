import { LightningElement,api,track } from 'lwc';

export default class Vosf_multiSelect extends LightningElement {

    @api questionData;
    @api isPrimary;
    @api firstIndex;
    @api secondIndex;
    @api thirdIndex;
    @api isDisabled;
    description;
    options;
    haschoices=false;
    choices;
    @track value;
    connectedCallback() {
        let selectedValues = [];
        if(this.questionData.Responses && this.questionData.Responses.length > 0){
          this.value = [];
          for (const response of this.questionData.Responses) {
            selectedValues.push(response.Response__c);
          }

          this.value = selectedValues;
        }

        if (this.questionData !== undefined) {
        this.description= this.questionData.Question.Description__c;
          this.options = [];
          this.choices=this.questionData.Choices;
          if(this.choices && this.choices.length>0){
          this.haschoices=true;
          for (const list of this.choices) {
            let option = {
              label: list.Choice.Value__c,
              value: list.Choice.Value__c,
              selected : false
            };
            if(this.value && this.value.includes(list.Choice.Value__c)){
              option.selected = true;
            }
            this.options.push(option);
          }
        }
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

    @api
    reportValidity(){
      let element=this.template.querySelector('c-vosf_multi-select-picklist');
      if (element) {
        element.reportValidity2();
        return  element.reportValidity2();
      }
     
      return  true
    }

    handleChange(event) {
    if (this.value != event.detail.value) {
      this.updateResponse(event.detail.value);
    }
    console.log('handle change called');
    }

    updateResponse(value) {
    console.log('this.value' + value);
    if (value) {
      let responsesList = [];
      let selectedValues = value;
      for (let list of this.questionData.Choices) {
        if (selectedValues.includes(list.Choice.Value__c)) {
          let response = new Object();
          response['choiceId'] = list.Choice.Id;
          response['response'] = list.Choice.Value__c;
          response['questionId'] = this.questionData.Question.Id;
          responsesList.push(response);
        }
      }
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