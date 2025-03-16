public with sharing class AccountService {
    
    @AuraEnabled(cacheable=true)
    public static String getProductByStatus(Id accountId, String status) {
        Date today = Date.today();
        // System.debug('[DEBUG] accountId: ' + accountId + ', status: ' + status);
        
        try {
            if (status.equals('입점')) {
                List<OpportunityLineItem> activeProducts = OpportunityLineItemDAO.getActiveProducts(accountId, today);
                if (!activeProducts.isEmpty()) {
                    return activeProducts[0].Product2.Name;
                }
                return null;
            }
            
            if (status.equals('입점준비 중')) {
                List<OpportunityLineItem> latestProducts = OpportunityLineItemDAO.getLatestProducts(accountId);
                if (!latestProducts.isEmpty()) {
                    return latestProducts[0].Product2.Name;
                }
                return null;
            }
            
        } catch (Exception e) {
            throw new AuraHandledException(' 오류 발생: ' + e.getMessage());
        }
        
        return null;
    }
    
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getAccountMap(Id accountId) {
        Date today = Date.today();
        
        Map<String, Object> result = new Map<String, Object>();
        String productNames = null;
        Date displayDate = null;
        Date contStartDate = null;
        Date contEndDate = null;
        
        
        List<OpportunityLineItem> oppLineItems = OpportunityLineItemDAO.getValidOpportunityLineItems(accountId,today);
        
        // System.debug(oppLineItems);
        if(oppLineItems.isEmpty()){
            return null;
        }
        for (OpportunityLineItem oli : oppLineItems) {
            if(oli.Opportunity.Contract_Start_Date__c <= today && oli.Opportunity.Contract_End_Date__c >= today){
                displayDate = today;
                productNames = oli.PricebookEntry.Product2.Name;
                contStartDate = oli.Opportunity.Contract_Start_Date__c;
                contEndDate = oli.Opportunity.Contract_End_Date__c;
                break;
            }
        }
        //여기까지 오면 진행중이진 않지만 예정인 계약이 있다는거임.
        if(displayDate == null){
            displayDate = oppLineItems[0].Opportunity.Contract_Start_Date__c;
            productNames = oppLineItems[0].PricebookEntry.Product2.Name;
            contStartDate = oppLineItems[0].Opportunity.Contract_Start_Date__c;
            contEndDate = oppLineItems[0].Opportunity.Contract_End_Date__c;
        }
        result.put('displayDate',displayDate);
        result.put('productNames',productNames);
        result.put('contStartDate',contStartDate);
        result.put('contEndDate',contEndDate);
        
        return result;
    }
}