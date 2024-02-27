import { LightningElement, api, track } from 'lwc';

export default class Vosf_lightningCheckboxGroup extends LightningElement {

  @api questionData;
  @api isPrimary;
  @api firstIndex;
  @api secondIndex;
  @api thirdIndex;
  @api isDisabled;
  options = [];
  value = [];
  questionStyle;
  indexNumber;
  description;
  connectedCallback() {
    let selectedValues = [];
    if (this.questionData.Responses !== undefined && this.questionData.Responses.length > 0) {
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

  @api
  reportValidity() {
    let element = this.template.querySelector('lightning-checkbox-group');
    element.reportValidity();
    return element.checkValidity();
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
      value = String(value);
      let responsesList = [];
      let selectedValues = value.split(',');
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