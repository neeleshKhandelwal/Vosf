public with sharing class Vosf_QuestionChoiceDAO {
    public static List<Vosf_Question_Choice__c> getByQuestions(List<Id> questionIds){
        return [SELECT Id, IsDeleted, Name, CreatedDate, CreatedById, Sequence_Number__c, IsEditable__c,
                Question__c, Type__c, Question_Choice__c, Description__c, Question_Column__c, Value__c,
                Group_Name__c, Min__c, Max__c, Place_Holder__c, Range_Validation__c 
                FROM Vosf_Question_Choice__c
                WHERE Question__c in : questionIds];
    }
    
    public static List<Vosf_Question_Choice__c> insertChoices(List<Vosf_Question_Choice__c> choiceList){
        insert choiceList;
        return choiceList;
    }
}