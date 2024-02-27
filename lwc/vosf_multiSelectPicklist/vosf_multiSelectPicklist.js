import { LightningElement,api,track } from 'lwc';
import { loadStyle } from "lightning/platformResourceLoader";
import VOSFResource from "@salesforce/resourceUrl/VOSFResource";

export default class Vosf_multiSelectPicklist extends LightningElement {  
    @api
    values = [];
    @track
    selectedvalues = [];
    @api
    picklistlabel = '';
    showdropdown;
    @api isDisabled;
    @api   haschoices;
      renderedCallback() {
    Promise.all([loadStyle(this, VOSFResource + '/VOSFResource/Vosf_Design.css')])
      .then(() => {
        console.log("Files loaded");
      })
      .catch((error) => {
        console.log(error.body.message);
      });

    console.log("Connected");
  }
    handleleave(event) {
        
        let sddcheck= this.showdropdown;

        if(sddcheck){
            this.showdropdown = false;
            this.fetchSelectedValues();
        }
    }

    connectedCallback(){
        this.values.forEach(element => element.selected 
                            ? this.selectedvalues.push(element.value) : '');
        console.log(this.selectedvalues);
    }

    fetchSelectedValues() {
        let inputdiv=this.template.querySelector('.selectbox');
        let input=this.template.querySelector('input');
        inputdiv.classList.remove('slds-has-error');
        input.classList.remove('slds-has-error');
        this.selectedvalues = [];

        //get all the selected values
        this.template.querySelectorAll('c-vosf_picklist-value').forEach(
            element => {
                if(element.selected){
                    console.log(element.value);
                    this.selectedvalues.push(element.value);
                }
            }
        );
      
        //refresh original list
        this.refreshOrginalList();
        if(this.selectedvalues!==undefined && this.selectedvalues.length>0){
            this.showError=false;
        const selectedEvent = new CustomEvent('selectedvalues', {
            detail: {
                'value': this.selectedvalues
            }
        });
        this.dispatchEvent(selectedEvent);
        }
    }
    showError=false;
    errorMsg='';
    
   @api
    reportValidity2(){
        let validity=false;
        let inputdiv=this.template.querySelector('.selectbox');
        let input=this.template.querySelector('input');
        if(this.selectedvalues.length==0){
           
            inputdiv.classList.add('slds-has-error');
            input.classList.remove('slds-has-focus');
         this.showError=true;
         this.errorMsg='Please complete this field.';
         validity=false;
        }else
        {inputdiv.classList.add('slds-has-error');
        input.classList.remove('slds-has-error');
            this.showError=false;
            validity=true;
        }
    return validity;
    }
    refreshOrginalList() {
        //update the original value array to shown after close

        const picklistvalues = this.values.map(eachvalue => ({...eachvalue}));

        picklistvalues.forEach((element, index) => {
            if(this.selectedvalues.includes(element.value)){
                picklistvalues[index].selected = true;
            }else{
                picklistvalues[index].selected = false;
            }
        });

        this.values = picklistvalues;
            
    }

    handleShowdropdown(event){
        let sdd = this.showdropdown;
        if(sdd){
            this.showdropdown = false;
            this.fetchSelectedValues();
        }else{
            this.showdropdown = true;
        }
     
    }

    closePill(event){
        console.log(event.target.dataset.value);
        let selection = event.target.dataset.value;
        let selectedpills = this.selectedvalues;
        console.log(selectedpills);
        let pillIndex = selectedpills.indexOf(selection);
        console.log(pillIndex);
        this.selectedvalues.splice(pillIndex, 1);
        const selectedEvent = new CustomEvent('selectedvalues', {
            detail: {
                'value': this.selectedvalues
            }
        });
        this.dispatchEvent(selectedEvent);
        this.refreshOrginalList();
    }

    get selectedmessage() {
        return this.selectedvalues.length + ' values are selected';
    }}