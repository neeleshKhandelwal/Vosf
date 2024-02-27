public with sharing class Vosf_QuestionColumnDAO {
	public static List<Vosf_Question_Column__c> getByQuestions(List<Id> questionIds){
        return [SELECT Id,Description__c, IsEditable__c, Label__c,
                Is_Total_Validation_Required__c, Question__c, 
                Required_Total__c, Sequence_Number__c, Type__c 
                FROM Vosf_Question_Column__c
                WHERE Question__c in : questionIds];
    }
    
    public static List<Vosf_Question_Column__c> insertColumns(List<Vosf_Question_Column__c> columnList){
        insert columnList;
        return columnList;
    }
}