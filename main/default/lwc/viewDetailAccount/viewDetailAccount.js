import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import ACCOUNT_NAME_FIELD from '@salesforce/schema/Account.Name';
import ACCOUNT_STORE_TYPE_FIELD from '@salesforce/schema/Account.Store_Type__c';
import ACCOUNT_PHONE_FIELD from '@salesforce/schema/Account.Phone';
import ACCOUNT_BRAND_CATEGOTY_FIELD from '@salesforce/schema/Account.Brand_Category__c';
import ACCOUNT_DESCRIPTION_FIELD from '@salesforce/schema/Account.Description';
import ACCOUNT_OWNER_FIELD from '@salesforce/schema/Account.OwnerId';
import { NavigationMixin } from 'lightning/navigation';


export default class ViewDetailAccount extends NavigationMixin(LightningElement) {
    
    @api storeId;
    data;
    error;

    fields = [ACCOUNT_NAME_FIELD,ACCOUNT_STORE_TYPE_FIELD,ACCOUNT_BRAND_CATEGOTY_FIELD,ACCOUNT_PHONE_FIELD,ACCOUNT_DESCRIPTION_FIELD,ACCOUNT_OWNER_FIELD ];

    handleClickDetailBtn(){
        // console.log(this.storeId);
 
        if (this.storeId) {
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: this.storeId,
                    actionName: 'view'
                }
            });
        } else {
            console.log('클릭 위치에서 id값 얻어올 수 없음');

        }
    }
}