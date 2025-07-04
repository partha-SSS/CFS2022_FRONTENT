import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
 
import { p_report_param, SystemValues, tt_cash_cum_trial, tt_gl_trans } from 'src/app/bank-resolver/Models';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RestService } from 'src/app/_service';
// import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { DomSanitizer,SafeResourceUrl } from '@angular/platform-browser';
import Utils from 'src/app/_utility/utils';
import { PageChangedEvent } from "ngx-bootstrap/pagination/public_api";
import { ExportAsService, ExportAsConfig } from 'ngx-export-as';
import { MatTableDataSource } from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import { CommonServiceService } from 'src/app/bank-resolver/common-service.service';
import * as XLSX from 'xlsx';
import 'jspdf-autotable';
@Component({
  selector: 'app-gen-ledger2',
  templateUrl: './gen-ledger2.component.html',
  styleUrls: ['./gen-ledger2.component.css'],
  providers:[ExportAsService]

})
export class GenLedger2Component implements OnInit {
  @ViewChild('content', { static: true }) content: TemplateRef<any>;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  modalRef: BsModalRef;
  isOpenFromDp = false;
  isOpenToDp = false;
  filteredArray:any=[]
  sys = new SystemValues();
  config = {
    keyboard: false, // ensure esc press doesnt close the modal
    backdrop: true, // enable backdrop shaded color
    ignoreBackdropClick: true // disable backdrop click to close the modal
  };
  genLdgerTrans: tt_gl_trans[] = [];
  prp = new p_report_param();
  reportcriteria: FormGroup;
  closeResult = '';
  isLoading = false;
  showAlert = false;
  ReportUrl: SafeResourceUrl;
  UrlString = '';
  urlToCall: '';
  alertMsg = '';
  fd: any;
  td: any;
  dt: any;
  fromdate: Date;
  todate: Date;
  counter=0;
  reportData:any=[]
  itemsPerPage = 2;
  currentPage = 1;
  pageChange: any;
  pagedItems = [];
  exportAsConfig:ExportAsConfig;
  ardbName=localStorage.getItem('ardb_name')
  branchName=this.sys.BranchName
  resultLength=0
  firstAccCD:any
  lastAccCD:any;
  crSum=0;
  drSum=0;
  total=0
  today:any
  openbal:any;
  excelData:any[]=[];
  showExcl:boolean=false;
  // displayedColumns: string[] = ['acc_cd', 'voucher_dt','dr_amt','cr_amt','cum_bal','cum_bal_type'];
  displayedColumns: string[] = ['dis_dtls'];
  dataSource = new MatTableDataSource()
  constructor(private svc: RestService,
              private formBuilder: FormBuilder,
              private modalService: BsModalService,
              private _domSanitizer : DomSanitizer,
              private router: Router, private cd: ChangeDetectorRef,
              private exportAsService: ExportAsService, private comSer:CommonServiceService
              ) { }

  ngOnInit(): void {
    this.resultLength=this.reportData.length
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.fromdate=this.sys.CurrentDate;
    this.todate=this.sys.CurrentDate;
    this.reportcriteria = this.formBuilder.group({
      fromDate: [null, Validators.required],
      toDate: [null, Validators.required],
      fromAcc: [null, Validators.required],
      toAcc: [null, Validators.required],
    });
    this.onLoadScreen(this.content);
    var date = new Date();
    // get the date as a string
       var n = date.toDateString();
    // get the time as a string
       var time = date.toLocaleTimeString();
       this.today= n + " "+ time
  }



  onLoadScreen(content) {
    this.modalRef = this.modalService.show(content, this.config);
  }

  setPage(page: number) {
    this.currentPage = page;
    this.cd.detectChanges();
  }


  public SubmitReport() {
    //this.isLoading = true;
    if (this.reportcriteria.invalid) {
      this.showAlert = true;
      this.alertMsg = 'Invalid Input.';
      return false;
    }
    else if (new Date(this.reportcriteria.value['fromDate']) > new Date(this.reportcriteria.value['toDate'])) {
      this.showAlert = true;
      this.alertMsg = 'To Date cannot be greater than From Date!';
      return false;
    }
    else {
      this.showAlert = false;
      this.fromdate=this.reportcriteria.value['fromDate'];
      this.todate=this.reportcriteria.value['toDate'];
      this.modalRef.hide();
      this.reportData.length=0
      this.pagedItems.length=0
      this.crSum=0;
      this.drSum=0;
      this.total=0
      //this.isLoading=true;
      //this.onReportComplete();
      // this.modalService.dismissAll(this.content);
      var dt={
        "ardb_cd": this.sys.ardbCD,
        "brn_cd": this.sys.BranchCode,
        "from_dt": this.fromdate.toISOString(),
        "to_dt": this.todate.toISOString(),
        "ad_from_acc_cd": this.reportcriteria.controls.fromAcc.value,
        "ad_to_acc_cd": this.reportcriteria.controls.toAcc.value


       
      }
      this.svc.addUpdDel('Finance/GetGLTransDtls',dt).subscribe(data=>{console.log(data)
      this.reportData=data
      this.resultLength=this.reportData.length
      if(!this.reportData){
        this.comSer.SnackBar_Nodata()
          this.isLoading=false
      }
      else{
        // console.log(this.reportData,"ppp")
        // for(let i=0;i<this.reportData.length;i++){
        //   for(let j=0;j<this.reportData[i].ttgltrans.length;j++)
        //   this.reportData[i].ttgltransa[j].voucher_dt=this.comSer.getFormatedDate(this.reportData[0].ttgltransa[i].voucher_dt);
        // }
       if(this.reportcriteria.controls.fromAcc.value==this.reportcriteria.controls.toAcc.value) {
        this.showExcl=true;
        this.excelData=this.reportData[0].ttgltrans;
       
       }
      this.isLoading=false
      
      this.modalRef.hide();
      this.dataSource.data=this.reportData
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.itemsPerPage=this.reportData.length % 50 <=0 ? this.reportData.length: this.reportData.length % 50
      this.firstAccCD=this.reportData[0].acc_cd;
      this.lastAccCD=this.reportData[this.reportData.length-1].acc_cd  
      this.reportData.forEach(e=>{
       
      //   this.opdrSum+=e.opng_dr;
      //   this.opcrSum+=e.opng_cr;
        this.crSum+=e.cr_amt;
        this.drSum+=e.dr_amt;
        this.total+=e.cum_bal
      //   this.clsdrSum+=e.clos_dr;
      //   this.clscrSum+=e.clos_cr;
      })
      } 

      // for(let i=0;i<this.reportData.length;i++){
      //   this.openbal=this.reportData[i].acctype.acc_name
      // }
      // console.log(this.openbal)
      
      // this.lastAccCD=this.reportData[this.reportData.length-1].acc_cd
      },
      err => {
         this.isLoading = false;
         this.comSer.SnackBar_Error(); 
        })
      
      // this.UrlString=this.svc.getReportUrl()
      // this.UrlString=this.UrlString+"WebForm/Fin/cashcumtrail?" + 'ardb_cd=' + this.sys.ardbCD+"&brn_cd="+this.sys.BranchCode+"&from_dt="+Utils.convertDtToString(this.fromdate)+"&to_dt="+Utils.convertDtToString(this.todate)
      ;
     
      this.isLoading = true;
      this.ReportUrl=this._domSanitizer.bypassSecurityTrustResourceUrl(this.UrlString)
      // setTimeout(() => {
      //   this.isLoading = false;
      // }, 10000);
    }
  }
exportExcel(): void {
  // Step 1: Define the custom headers for the columns you want
  const header = [
    { voucher_id: 'Voucher ID', voucher_dt: 'Voucher Date', narration: 'Narration', opp_gl: 'Opp GL', dr_amt: 'Debit Amount', cr_amt: 'Credit Amount', cum_bal: 'Cumulative Balance' }
  ];

  // Step 2: Combine the header and the data array
  const dataWithHeader = [...header, ...this.excelData.map(item => ({
    voucher_id: item.voucher_id,
    voucher_dt: item.voucher_dt,
    narration: item.narration,
    opp_gl: item.opp_gl,
    dr_amt: item.dr_amt,
    cr_amt: item.cr_amt,
    cum_bal: item.cum_bal
  }))];

  // Step 3: Create a new worksheet from the data array with the custom headers
  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataWithHeader, { skipHeader: true });

  // Step 4: Create a new workbook and append the worksheet
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'GLTransactions');

  // Step 5: Save to Excel file
  const fileName = 'GLtransactions.xlsx';
  XLSX.writeFile(wb, fileName);
}
  public oniframeLoad(): void {
    this.counter++
    if(this.counter==2){
      this.isLoading=false;
      this.counter=0;
    }
    else{
      this.isLoading=true
    }
    this.modalRef.hide();
  }

  public closeAlert() {
    this.showAlert = false;
  }
 

 
  closeScreen()
  {
    this.router.navigate([localStorage.getItem('__bName') + '/la']);
  }
  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.pagedItems = this.reportData.slice(startItem, endItem); //Retrieve items for page
    this.cd.detectChanges();
  }
  downloadexcel(){
    this.exportAsConfig = {
      type: 'xlsx',
      // elementId: 'hiddenTab', 
      elementIdOrContent:'mattable'
    }
    this.exportAsService.save(this.exportAsConfig, 'GenLedger').subscribe(() => {
      // save started
      console.log("hello")
    });
  }
  applyFilter(event: Event) {
    console.log(event)
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
    this.getTotal()
  }
  getTotal(){
    this.drSum=0;
    this.crSum=0;
    this.total=0;
    
    console.log(this.dataSource.filteredData)
    this.filteredArray=this.dataSource.filteredData
    for(let i=0;i<this.filteredArray.length;i++){
      // console.log(this.filteredArray[i].dr_amt)
      this.drSum+=this.filteredArray[i].dr_amt
      this.crSum+=this.filteredArray[i].cr_amt
      this.total+=this.filteredArray[i].cum_bal
    }
  }
}
