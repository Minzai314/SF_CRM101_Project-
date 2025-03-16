public with sharing class OpportunityController {
    
    // 창환
    @AuraEnabled(cacheable=true)    // LWC에서 Apex 호출 가능 & 캐싱 활성화
    public static List<Map<String, String>> getEnterOrNotValues() {
        return OpportunityService.getEnterOrNotValues();
    }
    
    // 창환
    @AuraEnabled(cacheable=true)
    public static List<Opportunity> getOpportunitiesByStatus(String status) {
        return OpportunityRepository.getOpportunitiesByStatus(status);
    }
    
    
    @AuraEnabled(cacheable=true)
    public static List<Opportunity> getActiveOpportunities(Date selectedDate) {
        return OpportunityService.getActiveOpportunities(selectedDate);
    }
    
    @AuraEnabled(cacheable=true)
    public static List<OpportunityService.OpportunityWrapper> getOpportunitiesByProductId(Id productId) {
        return OpportunityService.getOpportunitiesByProductId(productId);
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Product2> getProductName(Id productId) {
        return OpportunityService.getProductName(productId);
    }
}