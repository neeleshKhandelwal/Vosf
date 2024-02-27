/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 05-10-2023
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
@IsTest
private class Vosf_SurveyStartPageControllerTest {
	@IsTest
    private static void testGetStartPage() {
        Test.startTest();
        Vosf_Survey__c survey = VOSF_TestDataFactory.createSurvey(true,'Draft','Test Survey');
        Id surveyId = survey.Id; 
    	Vosf_Survey_Invitation__c surveyInvitation = VOSF_TestDataFactory.createSurveyInvitation(true, surveyId, 'Not Started');
   		Id surveyInvitationId = surveyInvitation.Id;
           System.assertEquals(1,Vosf_SurveyStartPageController.getStartPage(surveyInvitationId).size());
        Test.stopTest();   
    }
}