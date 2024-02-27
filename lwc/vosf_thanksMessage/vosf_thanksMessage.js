import { LightningElement,api } from 'lwc';
import VoSF_Completed_Img from "@salesforce/resourceUrl/VoSF_Completed";
import VOSFResource from "@salesforce/resourceUrl/VOSFResource";
export default class Vosf_thanksMessage extends LightningElement {
    reviewPage=true;
    @api showEndPage;
    VoSF_Completed_Img= VOSFResource+'/image/VoSF_Completed.png';;
    connectedCallback(){
        if (this.showEndPage) {
            this.reviewPage=false;
        }
    }
    saveHandler() {
        this.reviewPage=false;
        this.endpage=true;
        this.dispatchEvent(new CustomEvent('save'));
      
    }
    reviewHandler() {
        this.dispatchEvent(new CustomEvent('review'));
    }
}