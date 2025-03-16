public with sharing class Product2DAO {
    
    @AuraEnabled(cacheable=true)
    public static List<Product2> getProductName(Id productId){
        
        return [SELECT NAME FROM Product2 WHERE Id = :productId LIMIT 1];
    }
}