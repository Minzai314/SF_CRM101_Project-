public with sharing class OpportunityLineItemDAO {
    public static List<OpportunityLineItem> getActiveProducts(Id accountId, Date today) {
        return [
            SELECT Product2.Name
            FROM OpportunityLineItem
            WHERE Opportunity.AccountId = :accountId
            AND Opportunity.Contract_Start_Date__c <= :today
            AND Opportunity.Contract_End_Date__c >= :today
            LIMIT 1
        ];
    }
    
    public static List<OpportunityLineItem> getLatestProducts(Id accountId) {
        return [
            SELECT Product2.Name
            FROM OpportunityLineItem
            WHERE Opportunity.AccountId = :accountId
            ORDER BY Opportunity.Contract_Start_Date__c DESC
            LIMIT 1
        ];
    }
    
    public static List<OpportunityLineItem> getValidOpportunityLineItems(Id accountId, Date today) {
        return [
            SELECT Opportunity.Contract_Start_Date__c, Opportunity.Contract_End_Date__c,
                   Opportunity.StageName, Opportunity.AccountId, Opportunity.Id,
                   PricebookEntry.Product2.Name
            FROM OpportunityLineItem
            WHERE Opportunity.AccountId = :accountId
            AND Opportunity.StageName = 'Closed Won'
            AND Opportunity.Contract_End_Date__c >= :today
            ORDER BY Opportunity.Contract_Start_Date__c ASC
        ];
    }
}