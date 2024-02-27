/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 06-01-2023
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public class Vosf_SurveyInvitationController {
    private static final String NOT_STARTED='Not Started';
    public class UsersWrapper{
        @AuraEnabled public User User {get;set;}
        @AuraEnabled public Boolean IsInvited {get;set;}
        @AuraEnabled public Vosf_Survey_Invitation__c Invitation {get;set;}
    }    
    public class FilterWrappr{
        @AuraEnabled public String field {get;set;}
        @AuraEnabled public String label {get;set;}
    } 
    /**
     * @description Return user for sending invitation and users who alredy invited with survey status 
     * @param surveyId 
     * @return  `List<UsersWrapper>`
     */   
    @AuraEnabled(cacheable=true)
    public static List<UsersWrapper> getUsersForThisSurvey(Id surveyId){
        List<UsersWrapper> usersWrapperList=new List<UsersWrapper>();
        Vosf_Survey_Setting__c setting=getCustomSettings();
        String fieldstr='';
        System.debug('Setting: '+ setting);
        System.debug('Setting: '+ setting.Invitation_Filters__c);
        List<FilterWrappr> filterw = (List<FilterWrappr>)JSON.deserialize(setting.Invitation_Filters__c,List<FilterWrappr>.class);
        for (FilterWrappr obj :filterw) {
           fieldstr+=(String)obj.field+',';
        }
        List<User> usersList =  Vosf_UserDAO.getActiveUsers(fieldstr);
        Map<Id, Vosf_Survey_Invitation__c> invitesmap  =  Vosf_UserDAO.getInvitedUsers(surveyId);
        for (User usrobj : usersList) {
            UsersWrapper uwobj=new UsersWrapper();
            uwobj.User=usrobj;
            uwobj.IsInvited=invitesmap.get(usrobj.Id)==null?false:true;
            uwobj.Invitation=invitesmap.get(usrobj.Id);
            usersWrapperList.add(uwobj);
        }
        return usersWrapperList;
    }
 
    @AuraEnabled
    public static List<User> getUsersByRole(Id surveyId,List<String> roles){ 
        return Vosf_UserDAO.getActiveUsersByRole(surveyId, roles);
    }

    /**
     * Returns custom setting for vosf survey
     * @return  `Vosf_Survey_Setting__c`
     */
    @AuraEnabled(cacheable=true) 
    public static Vosf_Survey_Setting__c  getCustomSettings(){
        return Vosf_Survey_Setting__c.getOrgDefaults();
    }
    /**
     * @description returns list of surveys 
     * @return  `List<Vosf_Survey__c>`
     */
@AuraEnabled
public static List<Vosf_Survey__c>  getAllSurvey(){
    return Vosf_SurveyInvitationDAO.getAllSurvey();
}
    
    @AuraEnabled
    public static String sendInvitation(List<Id> participantIds, String surveyId, String emailBody){
        if(participantIds != null && !participantIds.isEmpty()){
            List<Vosf_Survey_Invitation__c> surveyInvitationList = new List<Vosf_Survey_Invitation__c>();
            for(Id participantId : participantIds){
                Vosf_Survey_Invitation__c surveyInvitationObj = new Vosf_Survey_Invitation__c();
                surveyInvitationObj.Participant__c = participantId;
                surveyInvitationObj.Survey__c = surveyId;
                surveyInvitationObj.Status__c = NOT_STARTED;
                surveyInvitationObj.OwnerId = participantId;
                surveyInvitationList.add(surveyInvitationObj);
            }
            if(!surveyInvitationList.isEmpty()){
                Set<Id> surveyInvitationIds = new Set<Id>();
                Database.SaveResult[] srList = Database.insert(surveyInvitationList,false);
                for(Integer i=0;i<srList.size();i++){
                    if (srList.get(i).isSuccess()){
                        surveyInvitationIds.add(srList.get(i).getId());
                    }
                }
                if(!surveyInvitationIds.isEmpty()){
                    sendEmails(surveyInvitationIds,emailBody);
                }
            }
            
            
        }
        return 'success';
    }
    
    public static void sendEmails (Set<Id>surveyInvitationIds,String emailBody ){
        
        List<Messaging.SingleEmailMessage> emailList = new List<Messaging.SingleEmailMessage>();
        List<VOSF_Survey_Invitation__c> invitationList = VOSF_SurveyInvitationDAO.getSurveyInvitationByIDs(surveyInvitationIds);
        for(VOSF_Survey_Invitation__c sIObj : invitationList){
            String emailBodyWithURL = emailBody+'<br/>'+'Survey Link:&nbsp '+sIObj.Survey_Link__c;
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            mail.setSubject('Survey Invitation');
            mail.setHtmlBody(emailBodyWithURL);
            mail.setToAddresses(new String[] {sIObj.Participant__r.Email});
            emailList.add(mail);
        }
        if(!emailList.isEmpty()){
            Messaging.sendEmail(emailList);
        }
    }
    /**
     * @description fetch html body for email template selected in custom setting
     * @return  `String` Returns html email template body
     * 
     */
    @AuraEnabled (cacheable=true)
    public static String getDefaultEmailTemplate(){
        try {
             Vosf_Survey_Setting__c setting=[SELECT Survey_Invitation_Email_Template__c FROM Vosf_Survey_Setting__c LIMIT 1];   
             if(setting==null || String.isBlank(setting.Survey_Invitation_Email_Template__c) ){
                throw new AuraHandledException('Custom setting not found for email template.');  
                }
            List<EmailTemplate> emailTemplateList=[SELECT Name, Subject, Body, uiType,HtmlValue,MarkUp FROM EmailTemplate WHERE DeveloperName=:setting.Survey_Invitation_Email_Template__c];
            if(emailTemplateList!=null && !emailTemplateList.isEmpty()){
                return emailTemplateList[0].Body;
                }
            throw new AuraHandledException('Unable to find default email template');           
        } catch (AurahandledException e) {
            throw e;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        
       

    }    
}