public without sharing class Vosf_SurveyStartPageController {
    @AuraEnabled
    public static List<Vosf_Survey_Invitation__c> getStartPage(Id surveyInvitationId)
    {
        try
        {
            List<Vosf_Survey_Invitation__c> svList
                =Vosf_SurveyInvitationDAO.getSurveyInvitationByID(surveyInvitationId);
            return svList;
        }
        catch(Exception e){  throw new AuraHandledException(e.getMessage());
        }
    }
}