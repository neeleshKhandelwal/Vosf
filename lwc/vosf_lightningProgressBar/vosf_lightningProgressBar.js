import { LightningElement, api } from 'lwc';
export default class Vosf_lightningProgressBar extends LightningElement {
 
    @api currentPage;
    @api totalPage;
    @api recordId;
    
    get progress(){
        if(this.currentPage && this.totalPage && this.currentPage <= this.totalPage){
            return Math.round((Number(this.currentPage - 1)/Number(this.totalPage))*100)
        }
        return 0;
    }
}