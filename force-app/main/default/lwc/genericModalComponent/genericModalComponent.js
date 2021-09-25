import { LightningElement } from 'lwc';

export default class GenericModalComponent extends LightningElement {
    handleFooterChange(){
        const footer = this.template.querySelector('.slds-modal__footer')
        if(footer){
            footer.classList.remove('slds-hide')
        }
    }

    handleHeaderChange(){
        const header = this.template.querySelector('.slds-modal__header')
        if(header){
            header.classList.remove('remove_header')
        }
    }
    closeModal(){
        this.dispatchEvent(new CustomEvent('close'))
    }
}