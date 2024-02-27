public class Vosf_SurveyReminderBatch implements Schedulable,Database.Batchable<sObject>{
   VOSF_Survey_Setting__c vosfSetting= [SELECT Id,Survey_Org_Base_URL__c,First_Reminder_Period__c,Second_Reminder_Period__c,Third_Reminder_Period__c,Send_Reminder_Email__c  FROM Vosf_Survey_Setting__c LIMIT 1]; 
    public Database.QueryLocator start(Database.BatchableContext bc){
        Date firstReminder=Date.Today().addDays(- Integer.valueOf(vosfSetting.First_Reminder_Period__c));
        Date secondReminder=Date.Today().addDays(- Integer.valueOf(vosfSetting.Second_Reminder_Period__c));
        Date thirdReminder=Date.Today().addDays(- Integer.valueOf(vosfSetting.Third_Reminder_Period__c));
        String[] status = new String[] {'In Progress','Not Started'}; 

        String query = 'SELECT Id, Participant__r.Email, Survey_Link__c, Participant__r.FirstName, Send_Reminder__c, Due_Date__c  FROM Vosf_Survey_Invitation__c WHERE Send_Reminder__c =true AND Status__c IN :status AND Participant__r.IsActive= true AND (Due_Date__c =TODAY OR Due_Date__c=:firstReminder OR Due_Date__c=:secondReminder OR Due_Date__c=:thirdReminder)';
        return Database.getQueryLocator(query);
    }
    public void execute(Database.BatchableContext bc, List<Vosf_Survey_Invitation__c> scope){
      sendReminderEmail(scope);
       
    }
    public void finish(Database.BatchableContext bc){
    }
    public void execute(SchedulableContext scon) {
        if (vosfSetting.Send_Reminder_Email__c) {
            Database.executeBatch(new Vosf_SurveyReminderBatch());  
        }
       
    }

    public  void  sendReminderEmail(List<Vosf_Survey_Invitation__c> surveyInviteList){
      List<Messaging.SingleEmailMessage> emails = new List<Messaging.SingleEmailMessage>();
      for(Vosf_Survey_Invitation__c vsi:surveyInviteList){
    Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
      String[] toAddresses = new String[] {vsi.Participant__r.Email}; 
      mail.setToAddresses(toAddresses);
      mail.setHtmlBody(createBody(vsi.Participant__r.FirstName,vsi.Survey_Link__c));
      mail.setSubject('Gentle reminder to complete survey');
          emails.add(mail);
      }
      Messaging.sendEmail(emails);
  }
  public  string createBody(string userName,string link){
  return '<p><b> Hi '+userName+',</b></p> <p>This is gentle reminder to complete pending survey. Please find link below:</p><p><b> Survey Link:</b> '+link+'</p>';
 
}
}