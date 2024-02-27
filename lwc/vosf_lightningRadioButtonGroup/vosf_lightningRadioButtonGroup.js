import { LightningElement, api, track } from "lwc";

export default class Vosf_radioButtonGroup extends LightningElement {
  @api choices;
  @api label;
  @api  isRequired;
  @api isDisabled;
  @api questionData;
  @api isPrimary;
  @api firstIndex;
  @api secondIndex;
  @api thirdIndex;
  @track value;
  description;
  optionval = [];
connectedCallback(){
  this.description= this.questionData.Question.Description__c;
}
  get indexNumber(){
      console.log('indexNumber'+this.firstIndex);
      if(this.thirdIndex || this.thirdIndex == 0){
          return this.firstIndex + "." + (parseInt(this.secondIndex)+1) + "." + (parseInt(this.thirdIndex)+1) + "." + " ";
      }
      else if(this.secondIndex || this.secondIndex == 0){
          return this.firstIndex + "." + (parseInt(this.secondIndex)+1) + "." + " ";
      }
      else if(this.firstIndex){
          return (parseInt(this.firstIndex)) + "." + " ";
      }
  }

  get questionStyle(){
      if(this.isPrimary){
          return "font-size: 16px;font-weight: bold;";
      }else{
            return "font-size: 16px;";
      }
  }

  get response(){
      if(this.questionData.Responses && this.questionData.Responses.length > 0){
          return this.questionData.Responses[0].Response__c;
      }
      else 
      return null;
  }
  @api
  reportValidity(){
     let element= this.template.querySelector('lightning-radio-group');
     element.reportValidity();
     return element.checkValidity();
  }
  get options() {
    if (this.questionData !== undefined) {
      for (const list of this.questionData.Choices) {
        const option = {
          label: list.Choice.Value__c,
          value: list.Choice.Value__c
        };
        this.optionval.push(option);
      }
    }
    return this.optionval;
  }
    handleChange(event) {
    if (this.response != event.target.value) {
      this.updateResponse(event.target.value);
    }
    console.log('handle change called');
  }
  updateResponse(value) {
    console.log('this.value' + value);
    if (value) {
      let responsesList = [];
      for (let list of this.questionData.Choices) {
        if (value == list.Choice.Value__c) {
          let response = new Object();
          response['choiceId'] = list.Choice.Id;
          response['response'] = value;
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