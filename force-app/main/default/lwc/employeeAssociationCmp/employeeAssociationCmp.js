import { LightningElement,api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
export default class EmployeeAssociationCmp extends LightningElement {
    @api recordId;
    projectAssocId;
    handleSuccess(event){
        this.projectAssocId = event.detail.id;
        if(this.projectAssocId.length ===18){
            this.fireGenericToasts('Success','Project Association Created!','success');
        }
        else{
            this.fireGenericToasts('Error','Something Went Wrong','error');
        }
    }
    fireGenericToasts(title,msg,variant){
        const event = new ShowToastEvent({
            "title": title,
            "message": msg,
            "variant":variant
        });
        this.dispatchEvent(event);
    }
}