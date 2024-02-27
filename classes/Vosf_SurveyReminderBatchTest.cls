/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 05-10-2023
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
@IsTest
public class Vosf_SurveyReminderBatchTest {
    @TestSetup static void createTestData() {
        VOSF_TestDataFactory.createSurveySetting(true,true);
        Vosf_Survey__c survey = VOSF_TestDataFactory.createSurvey(true,'Draft','Test Survey');
        Id surveyId = survey.Id;
        
    	Vosf_Survey_Invitation__c surveyInvitation = VOSF_TestDataFactory.createSurveyInvitation(false, surveyId, 'Not Started');
        surveyInvitation.Due_Date__c = Date.today();
        insert surveyInvitation;
    }
    
    @IsTest
    static void sendReminderEmailTest() {
        
        Test.startTest();
        String chron = '0 0 23 * * ?';
        Vosf_SurveyReminderBatch srb=new Vosf_SurveyReminderBatch();
       String jobId= system.schedule('Reminder Batch', chron, srb); 
        CronTrigger ct = [Select id , CronExpression from CronTrigger where id = :jobId];
        System.assertEquals(chron,ct.CronExpression); 
        Test.stopTest();
    }
}