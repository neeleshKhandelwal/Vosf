import { LightningElement, api, track } from 'lwc';

export default class Vosf_lightningComboBox extends LightningElement {

  @api questionData;
  @api isPrimary;
  @api firstIndex;
  @api secondIndex;
  @api thirdIndex;
@api isDisabled;
  options = [];
description;
questionLabel;
  questionStyle;
  indexNumber;

  @api
  reportValidity() {
    let element = this.template.querySelector('lightning-combobox');
    element.reportValidity();
    return element.checkValidity();

  }

  connectedCallback() {
    let selectedValues = [];
    if (this.questionData.Responses && this.questionData.Responses.length > 0) {
      this.value = [];
      for (const response of this.questionData.Responses) {
        selectedValues.push(response.Response__c);
      }

      this.value = selectedValues.join(',');
    }

    if (this.questionData !== undefined) {
      this.description= this.questionData.Question.Description__c;
      this.options = [];
      for (const list of this.questionData.Choices) {
        const option = {
          label: list.Choice.Value__c,
          value: list.Choice.Value__c
        };
        this.options.push(option);
      }
    }

    if (this.thirdIndex || this.thirdIndex == 0) {
      this.indexNumber = this.firstIndex + "." + (parseInt(this.secondIndex) + 1) + "." + (parseInt(this.thirdIndex) + 1) + "." + " ";
    }
    else if (this.secondIndex || this.secondIndex == 0) {
      this.indexNumber = this.firstIndex + "." + (parseInt(this.secondIndex) + 1) + "." + " ";
    }
    else if (this.firstIndex) {
      this.indexNumber = (parseInt(this.firstIndex)) + "." + " ";
    }


    if (this.isPrimary) {
      this.questionStyle = "font-size: 16px;font-weight: bold;";
    } else {
      this.questionStyle = "font-size: 16px;";
    }
  }

  handleChange(event) {
    if (this.value != event.target.value) {
      this.updateResponse(event.target.value);
    }
    console.log('handle change called');
  }

  updateResponse(value) {
    console.log('this.value' + value);
    if (value) {
      let responsesList = [];
      var response = new Object();
      response['response'] = value;
      response['questionId'] = this.questionData.Question.Id;
      response['isText'] = true;
      for (let list of this.questionData.Choices) {
        if(value == list.Choice.Value__c){
          response['choiceId'] = list.Choice.Id;
        }
      }
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