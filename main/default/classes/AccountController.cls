public with sharing class AccountController {
    
    @AuraEnabled(cacheable=true)
    public static String getProductByStatus(Id accountId, String status) {
        return AccountService.getProductByStatus(accountId, status);
    }
    
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> accountMapController(Id accountId) {
        return AccountService.getAccountMap(accountId);
    }
    
}