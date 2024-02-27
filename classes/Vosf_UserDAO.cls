/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 06-01-2023
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
//AND ID NOT IN (SELECT Participant__c FROM Vosf_Survey_Invitation__c WHERE Survey__c =:surveyId)
public class Vosf_UserDAO {
    public static final String strQuery1='SELECT Id,Email,';
    public static final String strQuery2=' IsActive FROM User WHERE IsActive = TRUE';
/**
 * @param strfield fields to fetch dyanamically 
 * @return  `List<User>`
 */
    public static List<User> getActiveUsers(String strfield){
        return Database.query(strQuery1+strfield+strQuery2);
    }
/**
 * @description return participant of survey
 * @param surveyId 
 * @return  `Map<Id, Vosf_Survey_Invitation__c>`
 */
    public static Map<Id, Vosf_Survey_Invitation__c>  getInvitedUsers(Id surveyId){
        Map<Id, Vosf_Survey_Invitation__c> invitesmap = new Map<Id, Vosf_Survey_Invitation__c>();
        List<Vosf_Survey_Invitation__c> listInvites=[ SELECT Participant__c,Status__c  FROM Vosf_Survey_Invitation__c  WHERE Survey__c=:surveyId];
        for (Vosf_Survey_Invitation__c invobj : listInvites) {
            invitesmap.put(invobj.Participant__c,invobj);
        }
        return invitesmap;
    }
/**
 * @description return user for provided roles
 * @param surveyId 
 * @param roles 
 * @return  `List<User>`
 */
    public static List<User> getActiveUsersByRole(Id surveyId,List<String> roles){
        return [SELECT Id,Name,UserRole.Name,IsActive FROM User WHERE IsActive = TRUE AND ID NOT IN (SELECT Participant__c FROM Vosf_Survey_Invitation__c WHERE Survey__c =:surveyId) AND UserRole.Name IN:roles ];
    }
}