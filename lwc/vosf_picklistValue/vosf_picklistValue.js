import { LightningElement,api } from 'lwc';

export default class Vosf_picklistValue extends LightningElement {

    @api
    selected = false;
    
    @api
    label;
    
    @api
    value;


    handleSelect(event) {
        //this.selected = true;
        
        if(this.selected){
            this.selected = false;
        }else{
            this.selected = true;
        } 
        
    }
}