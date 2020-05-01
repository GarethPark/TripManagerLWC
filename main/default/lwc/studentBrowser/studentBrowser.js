import { LightningElement, track, wire } from 'lwc';
import getStudents from '@salesforce/apex/StudentBrowser.getStudents';
import { fireEvent } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';
import { NavigationMixin } from 'lightning/navigation';

export default class StudentBrowser extends NavigationMixin(LightningElement) {
    selectedDeliveryId = '';
    selectedInstructorId = '';

    @track students = [];
    @wire(getStudents, { instructorId: '$selectedInstructorId', courseDeliveryId: '$selectedDeliveryId' })

    wired_getStudents(result) {
        if (result.data) {
            this.students = result;
        } else if (result.error) {
            this.error = result.error;
        }
        this.dispatchEvent(new CustomEvent('doneloading',
        {bubbles:true,composed:true}));
    }

    @wire(CurrentPageReference) pageRef;

    handleFilterChange(event){
        this.selectedDeliveryId = event.detail.deliveryId;
        this.selectedInstructorId = event.detail.instructorId; 
        this.dispatchEvent(new CustomEvent('loading', {bubbles:true, 
        composed:true }));
    }
    handleStudentSelected(event){
        const studentId = event.detail.studentId;
        this.updateSelectedStudent(studentId);
    }
    updateSelectedStudent(studentId){
        let grid = this.template.querySelector('c-responsive-datatable'); 
        let gallery = this.template.querySelector('c-student-tiles');
        if (grid) {
            grid.setSelectedRecord(studentId);
        }
        if (gallery) {
            gallery.setSelectedStudent(studentId);
        }
        fireEvent(this.pageRef, 'studentChange', { studentId }); 
    }
    cols = [
        {
          fieldName:"Name",
          label: "Name"
        },
        {
          fieldName:"Title",
          label: "Title",
          hiddenOnMobile: true
        },
        {
            fieldName:"Phone",
            label: "Phone",
            type: "phone"
        },
        {
            fieldName:"Email",
            label: "E-Mail",
            type: "email"
        }
    ];
    handleRowDblClick(event) {
        const studentId = event.detail.pk;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
               recordId: studentId,
               objectApiName: 'Contact',
               actionName: 'edit'
        } 
        });
    }
    handleRowClick(event) {
        let studentId = event.detail.pk;
        this.updateSelectedStudent(studentId);
    }
}



  