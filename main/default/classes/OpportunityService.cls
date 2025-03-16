public with sharing class OpportunityService {
    
    // 창환
    public static List<Map<String, String>> getEnterOrNotValues() {
        List<Map<String, String>> options = new List<Map<String, String>>();
        
        Schema.DescribeFieldResult fieldResult = Opportunity.Enter_Or_Not__c.getDescribe();
        // Opportunity의 Enter_Or_Not__c 필드를 설명(Schema) 정보로 가져옴
        
        List<Schema.PicklistEntry> picklistValues = fieldResult.getPicklistValues();
        // 해당 Picklist 필드의 모든 선택지(PicklistEntry 리스트) 가져오기
        
        for (Schema.PicklistEntry entry : picklistValues) {
            
            Map<String, String> picklistItem = new Map<String, String>();
            
            picklistItem.put('label', entry.getLabel());
            picklistItem.put('value', entry.getValue());
            // entry.getLabel() → 사용자에게 보이는 Picklist 항목
            // entry.getValue() → Picklist의 실제 값
            options.add(picklistItem);
        }
        return options;
    }
    
    //
    @AuraEnabled(cacheable=true)
    public static List<Opportunity> getActiveOpportunities(Date selectedDate) {
        try {
            return OpportunityDAO.getActiveOpportunities(selectedDate);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<OpportunityWrapper> getOpportunitiesByProductId(Id productId) {
        List<Opportunity> opps = OpportunityDAO.getOpportunitiesByProductId(productId);
        
        List<OpportunityWrapper> results = new List<OpportunityWrapper>();
        for (Opportunity opp : opps) {
            results.add(new OpportunityWrapper(
                opp.Id,
            opp.Account.Name,
            opp.Contract_Start_Date__c,
            opp.Contract_End_Date__c
                ));
        }
        return results;
    }
    
    public class OpportunityWrapper {
        @AuraEnabled public String id;
        @AuraEnabled public String accountName;
        @AuraEnabled public Date startDate;
        @AuraEnabled public Date endDate;
        
        public OpportunityWrapper(String id, String accountName, Date startDate, Date endDate) {
            this.id = id;
            this.accountName = accountName;
            this.startDate = startDate;
            this.endDate = endDate;
        }
    }
    @AuraEnabled(cacheable=true)
    public static List<Product2> getProductName(Id productId){
        
        return Product2DAO.getProductName(productId);
    }
}