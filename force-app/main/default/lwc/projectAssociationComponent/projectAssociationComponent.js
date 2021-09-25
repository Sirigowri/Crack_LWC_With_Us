import { LightningElement,track,api,wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';
import searchEmployees from '@salesforce/apex/ProjectAssociationController.retriveEmployees';
import projectDetails from '@salesforce/apex/ProjectAssociationController.retriveProjectDetails';
import createProjectAssoc from '@salesforce/apex/ProjectAssociationController.saveProjectAssociations';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ProjectAssociationComponent extends NavigationMixin(LightningElement) {
    @api recordId;
    strSearchEmpName = '';
    startDate = null;
    endDate = null;
    reason = '';
    page = 1; //this is initialize for 1st page  
    startingRecord = 1; //start record position per page    
    endingRecord = 0; //end record position per page    
    pageSize = 10; //10 records display per page    
    totalRecountCount = 0;//total count of record received from all retrieved records     
    totalPage = 0; //total number of page is needed to display all records
    openModal = false; // for showing the modal component    
    res;
    error;
    value = '1';
    isLoaded = true;

    projectDetails;
    @track data = []; //To display the data into datatable  
    @track items = []; //it contains all the Product records.
    @track selected = []; //counting selected
    @track prjAssoc;
    @track result;

    //To display the column into the data table
    @track columns = [
        {
            label: 'Name',
            fieldName: 'Name',
            type: 'url',
            typeAttributes: {label: { fieldName: 'Name' },target: '_blank'}
            }, 
        {
            label: 'Email',
            fieldName: 'Email',
            type: 'email',
        },
        {
            label: 'Phone',
            fieldName: 'Phone',
            type: 'Phone',
        },
        {
            label: 'Role',
            fieldName: 'Role__c',
            type: 'text',
        },
        {
            label: 'Total Projects',
            fieldName: 'Count_project_Associations__c',
            type: 'text',
        }        
    ];
    //call the apex method and pass the search string into apex method.
    @wire(projectDetails, {projectId : '$recordId' })
    wiredProjectDetails({ error, data }){
        if (data){
            this.projectDetails = data;
            this.error = undefined;
        } 
        else if(error){
            this.error = error;
            this.data = undefined;
        }
    }
    @wire(searchEmployees, {employeeName : '$strSearchEmpName' })
    wiredProducts({ error, data }){
        if (data){
            this.items = data;
            this.totalRecountCount = data.length; 
            this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize);             
            /*initial data to be displayed 
            slice will take 0th element and ends with 10, but it doesn't include 10th element
            so 0 to 9th rows will be displayed in the table*/
            this.data = this.items.slice(0,this.pageSize); 
            this.endingRecord = this.pageSize;
            this.error = undefined;
            } else if (error) {
            this.error = error;
            this.data = undefined;
        }
    }
    //this method is called when you clicked on the previous button 
    previousHandler(){
        if (this.page > 1){
            this.page = this.page - 1; //decrease page by 1
            this.displayRecordPerPage(this.page);
        }
    }
    //this method is called when you clicked on the next button 
    nextHandler(){
        if((this.page<this.totalPage) && this.page !== this.totalPage){
            this.page = this.page + 1; //increase page by 1
            this.displayRecordPerPage(this.page);            
        }             
    }
    //this method displays records page by page
    displayRecordPerPage(page){
        this.startingRecord = ((page -1) * this.pageSize) ;
        this.endingRecord = (this.pageSize * page);
        this.endingRecord = (this.endingRecord > this.totalRecountCount) ?   this.totalRecountCount : this.endingRecord; 
        this.data = this.items.slice(this.startingRecord,   this.endingRecord);
        this.startingRecord = this.startingRecord + 1;
    }  
    //this method is for passing search key to apex
    handleEmployeeName(event){
        this.strSearchEmpName = event.target.value;
        return refreshApex(this.result);
    }
    handleSelect(){        
        debugger;
        var el = this.template.querySelector('lightning-datatable');
        this.selected = el.getSelectedRows();
        if(this.selected.length < 0){
            this.showToast('Please select one record!!','Error','error');
        }
        else if(this.selected.length > 0){
            this.openModal = true;
        }
        debugger;
    }
    //this method is for closing the modal component
    closeModal() {           
        this.openModal = false;// to close modal window set 'bShowModal' tarck value as false
    }
    //this method is used for displaying toast messages
    showToast(userMessage,userTitle,userVariant){
        // eslint-disable-next-line no-undef
        debugger;
        const event = new ShowToastEvent({
            title:userTitle ,
            message:userMessage ,
            variant:userVariant
        });
        this.dispatchEvent(event);
    }
    
    updateSearchkey(event) {
        debugger;
        const inputboxName = event.target.name;
        if (inputboxName === 'startDate') {
            this.startDate = event.target.value;
            debugger;
        }
        if (inputboxName === 'endDate') {
            this.endDate = event.target.value;
            debugger;
        }
        if (inputboxName === 'reason') {
            this.reason = event.target.value;
            debugger;
        }
    }
    clickModal(){
        debugger;        
        var startDateList = this.startDate.split('-');
        var endDateList = this.endDate.split('-');
        var stDate = new Date(startDateList[0],startDateList[1],startDateList[2]);
        var edDate = new Date(endDateList[0],endDateList[1],endDateList[2]);
        if(stDate>edDate){
            debugger;
            this.showToast('Start Date should be before End Date','Error','error');
        }
        else if(edDate>stDate){
            debugger;
            let tempObj = new Object();
            tempObj.Project_Start_Date__c = stDate;
            tempObj.Project_End_Date__c = edDate;
            tempObj.Reason_for_Mapping__c = this.reason;            
            debugger;
            createProjectAssoc({projectAssoc: tempObj, lstEmployees: this.selected, projectId: this.recordId})
                .then(result => {
                    this.result = result;
                    this.showToast('Projects are successfully Associated','Success','success');
                    this.openModal = false;
                })
                .catch(error => {
                    this.error = error;
                    this.showToast('Something went wrong!','Error','error');
                });
        }
    }
}