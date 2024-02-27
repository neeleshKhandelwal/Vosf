import { LightningElement, track, api, wire } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';
import NAME_FIELD from '@salesforce/schema/Vosf_Survey__c.Name';
import getUsers from '@salesforce/apex/Vosf_SurveyInvitationController.getUsersForThisSurvey';
import getUsersByRole from '@salesforce/apex/Vosf_SurveyInvitationController.getUsersByRole';
import getCustomSettings from '@salesforce/apex/Vosf_SurveyInvitationController.getCustomSettings';
import getDefaultEmailTemplate from '@salesforce/apex/Vosf_SurveyInvitationController.getDefaultEmailTemplate';
import sendInvitation from '@salesforce/apex/Vosf_SurveyInvitationController.sendInvitation';
import getAllSurvey from '@salesforce/apex/Vosf_SurveyInvitationController.getAllSurvey';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import USER_OBJECT from '@salesforce/schema/User';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';

export default class Vosf_SurveyInvitation extends LightningElement {
    @api recordId;
    @api surveyName;
    nameField = NAME_FIELD;
    @api objectApiName;
    @track error;
    @track users = [];
    @track showUserLookup = false;
    @track selectedUserIds = [];
    showEmailTemplate = false;
    toastMessage = '';
    email;
    userobjectdata;
    @wire(getObjectInfo, { objectApiName: USER_OBJECT })
    oppInfo({ data, error }) {
        if (data)
            this.userobjectdata = data;
    }
    @wire(getDefaultEmailTemplate)
    emailTemplate({ error, data }) {
        if (data) {
            this.email = data;
        } else {
            this.error = error;
            console.log('in here this.error ' + this.error);
        }
    }
    surveyoptions;
    @track
    usersdata = [];
    orginalUsersData = [];
    rolesOptions = [];
    filters;
    @track
    currectSurveyName;
    getSurveys() {
        getAllSurvey()
            .then(result => {
                let options = [];
                result.forEach((elem) => {
                    options.push({
                        label: elem.Name,
                        value: elem.Id
                    });
                    if (elem.Id == this.recordId) {
                        this.currectSurveyName = elem.Name;
                    }
                });
                this.surveyDefaultValue = this.recordId;
                this.surveyoptions = options;

                this.getCustomSetting();
            })
            .catch(error => {
                console.error('Error', error);

            })
    }
    connectedCallback() {
        this.getSurveys();
    }
    handleSurveyChange(event) {
        if (event.detail.length > 0) {
            this.recordId = event.detail;
            let option = this.surveyoptions.find(
                (opt) => opt.value === this.recordId
            );
            this.surveyName = option.label;
            this.getUsersdata();
        }
    }
    getUsersdata() {
        getUsers({ surveyId: this.recordId })
            .then(data => {
                this.showUserLookup = true;
                let filtervalue = [];
                this.orginalUsersData = data;
                this.usersdata = data;
                if (this.myCustomSettings) {
                    filtervalue = JSON.parse(this.myCustomSettings.Invitation_Filters__c);
                    filtervalue.forEach((item, index) => {
                        let options = [];
                        let valuesSet = new Set();
                        this.usersdata.forEach(element => {
                            if (item.field.includes('.')) {
                                let split = item.field.split(".");
                                if (element.User[split[0]]) {
                                    let s1 = element.User[split[0]];
                                    valuesSet.add(s1[split[1]]);
                                }
                            }
                            else if (element.User[item.field]) {
                                valuesSet.add(element.User[item.field]);
                            }
                        });
                        valuesSet.forEach((elem) => {
                            options.push({
                                label: elem,
                                value: elem,
                            });
                        });
                        filtervalue[index].options = options;
                        this.filters = filtervalue;
                    });
                }
            }).catch(error => {
                console.error('Error', error);

            })
    }
    myCustomSettings;
    getCustomSetting() {
        getCustomSettings({ surveyId: this.recordId })
            .then(data => {
                this.myCustomSettings = data;
                this.getUsersdata();
            }).catch(error => {
                console.error('Error', error);

            })
    }
    options = [];
    selectedRoles = [];
    allCheckboxChangeHandler(event) {
        let value = event.target.checked;
        let chks = this.template.querySelectorAll('lightning-input');
        chks.forEach((item) => {
            if (!item.disabled)
                item.checked = value;
        });
    }
    userids = [];
    showemailtemplate() {

        let chks = this.template.querySelectorAll('lightning-input');
        chks.forEach((item) => {
            let userid = item.getAttribute('data-userid');
            if (!item.disabled && item.checked && userid != null)
                this.userids.push(userid);
        });
        console.log('userid' + this.userids);
        this.showEmailTemplate = true;
    }
    handleLookupChange(event) {
        let picvalues = [];
        if (event.detail.length > 0) {
            picvalues.push(event.detail);
            let field = event.target.dataset.field;
            let filteredUserData = [];
            if (field.includes('.')) {
                this.usersdata.forEach(element => {
                    let split = field.split(".");
                    if (element.User[split[0]]) {
                        let s1 = element.User[split[0]];
                        let val = s1[split[1]];
                        if (picvalues.includes(val)) {
                            filteredUserData.push(element);
                        }
                    }
                });
                this.usersdata = undefined;
                this.usersdata = filteredUserData;
            } else {
                this.usersdata.forEach(element => {
                    if (picvalues.includes(element.User[field])) {
                        filteredUserData.push(element);
                    }
                });
                this.usersdata = undefined;
                this.usersdata = filteredUserData;
            }
        } else {
            this.template.querySelectorAll('c-vosf_custom-lookup').forEach(element => {
                element.clearsearch();
            });
            this.usersdata = this.orginalUsersData;
        }
    }
    Selectedusers = [];
    getUsersByRole() {
        getUsersByRole({ surveyId: this.surveyId, roles: this.selectedRoles })
            .then((result) => {
                this.Selectedusers = result;
            })
            .catch((error) => {
                console.error(error);
            });
    }
    handleUserChange(event) {
        let users = event.detail;
        let indvusers = [];
        this.selectedUserIds = [];
        users.forEach(user => {
            this.selectedUserIds.push(user.value);
            indvusers.push(JSON.parse(JSON.stringify(user.obj)));
        });
        this.Selectedusers = [...this.Selectedusers, indvusers];
    }
    @track
    showsuccess=false;
    showError=false;
    handleSendInvitation() {
        if (this.userids == null || this.userids.length == 0) {
            this.toastMessage = 'Please select participants';
            this.showWarningToast();
            return;
        }
        
        sendInvitation({
            participantIds: this.userids,
            surveyId: this.recordId,
            emailBody: this.email
        })
            .then(result => {
                this.showsuccess = true;
                this.showError=false;
            })
            .catch(error => {
                this.showsuccess = false;
                this.showError=true;
                console.error('Error', error)
                this.error = error;
            })
    }
    handleClose() {
        window.open(
            "/lightning/o/Vosf_Survey__c/list",
            "_self"
        );
    }
    handleChange(event) {
        this.email = event.target.value;
    }
    showSuccessToast() {
        const event = new ShowToastEvent({
            title: 'Success',
            message: this.toastMessage,
            variant: 'success',
            mode: 'dismissable'
        });
        this.dispatchEvent(event);
    }
    showWarningToast() {
        const event = new ShowToastEvent({
            title: 'Information',
            message: this.toastMessage,
            variant: 'warning',
            mode: 'dismissable'
        });
        this.dispatchEvent(event);
    }
    closeModal() {
        this.showEmailTemplate = false;
        this.getUsersdata();
    }
}