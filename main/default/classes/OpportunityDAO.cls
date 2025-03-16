public with sharing class OpportunityDAO {
    // 창환
    public static List<Opportunity> getOpportunitiesByStatus(String status) {
        return [SELECT Account.Name FROM Opportunity 
        WHERE Enter_Or_Not__c = :status
        AND OwnerId = :UserInfo.getUserId()];
    }
    
    //
    @AuraEnabled(cacheable=true)
    public static List<Opportunity> getActiveOpportunities(Date selectedDate) {
        try {
            return [
                    SELECT AccountId, Account.Name,
                        (SELECT Product2Id FROM OpportunityLineItems ) 
                    FROM Opportunity 
                    WHERE Contract_Start_Date__c <= :selectedDate 
                    AND Contract_End_Date__c >= :selectedDate
                    AND StageName = 'Closed Won'
                    AND Id IN (SELECT OpportunityId From OpportunityLineItem)
                    AND Contract_Start_Date__c != NULL
                    AND Contract_End_Date__c != NULL
    
                ];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled(cacheable=true)
    public static List<Opportunity> getOpportunitiesByProductId(Id productId) {
        return [
                    SELECT Id, Account.Name, Contract_Start_Date__c, Contract_End_Date__c
                    FROM Opportunity
                    WHERE Id IN (
                        SELECT OpportunityId
                        FROM OpportunityLineItem
                        WHERE PricebookEntry.Product2Id = :productId
                    )
                    AND StageName = 'Closed Won' AND Contract_End_Date__c > TODAY
                    ORDER BY Contract_Start_Date__c
                ];
    }
    
    public static List<Opportunity> getRelatedOpportunities(Set<Id> opportunityIds) {
        Set<Id> productIds = new Set<Id>();
        
        //새 Oppty들의 Product2Id 찾기
        List<OpportunityLineItem> lineItems = [
            SELECT Product2Id FROM OpportunityLineItem WHERE OpportunityId IN :opportunityIds
        ];
        
        for (OpportunityLineItem oli : lineItems) {
            productIds.add(oli.Product2Id);
        }
        
        //동일 Product2Id를 가진 기존 Oppty들의 찾기
        if (!productIds.isEmpty()) {
            return [
                SELECT Id, Name, Contract_Start_Date__c, Contract_End_Date__c
                FROM Opportunity
                WHERE Id IN (
                    SELECT OpportunityId FROM OpportunityLineItem WHERE Product2Id IN :productIds
                )
                AND Contract_End_Date__c >= TODAY 
                AND StageName != 'Closed Lost'
            ];
        }
        
        return new List<Opportunity>();
    }
    
}