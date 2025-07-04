import { RestService } from './../../_service/rest.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LOGIN_MASTER, MessageType, ShowMessage, SystemValues } from '../Models';
import { InAppMessageService } from 'src/app/_service';
import { sm_parameter } from '../Models/sm_parameter';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { CommonServiceService } from '../common-service.service';
// import {WINDOW} from '../../bank-resolver/window.providers'
// import { SampleService } from './services';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers:[DatePipe]
})
export class LoginComponent implements OnInit {

  // private apiUrl = 'https://api.ipify.org/?format=json';
  private apiUrl = 'https://api.ipify.org?format=json';
  // https://api64.ipify.org/?format=json
  // https://api4.ipify.org/?format=json

  loginForm: FormGroup;
  returnUrl: string;
  isError = false;
  brnDtls: any = [];
  // ardbBrnMst: mm_ardb[] = [];
  ardbBrnMst: any = [];
  // ardbBrnMst: any[] = [];
  systemParam: sm_parameter[] = [];
  // genparam=new p_gen_param();
 alertMsgType: string;
   alertMsg: string;
   disabledAll = false;
   showAlert = false;
   isLoading = false;
   showMsg: ShowMessage;
  ipAddress: any;
  showUnlockUsr = false;
  usrToUnlock: any;
  nm: any
  userData: any;
  dtData:any
  getIp:any
  loginStatus:boolean=true;
  filterUser:any=[];
  selectalluser:any=[];
  sys = new SystemValues();
  wrongAttamt:any;
  bankFullName:any;
  footer:any;
  ARBD:any='';
  SBaccCD:any;
  constructor(private router: Router,
    private formBuilder: FormBuilder,
    private rstSvc: RestService,
    private msg: InAppMessageService,
    private http: HttpClient,
    private cms:CommonServiceService
    // @Inject(WINDOW) private window:Window
    ) {

     }

  ngOnInit(): void {
  //  this.getMyIp();
    this.wrongAttamt=localStorage.getItem('W_attempt')
    this.encriptPass();
    localStorage.removeItem('ardb_name');
    localStorage.removeItem('L2L');
    if (this.router.url.includes('/login')) {
      // this.getLogdUser();
      //  this.updateLoginStatus();
    }

    // alert("hii")
    // const getmac = require('getmac')
    // //console.log(getmac)
    // //console.log(window.location.hostname)
  //  this.getPrivateIP()
    this.loginForm = this.formBuilder.group({
      ardbbrMst: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      branch: ['', Validators.required]
    });
    this.loginForm.enable();
    this.msg.sendisLoggedInShowHeader(false);
    this.isLoading = true;

    setTimeout(() => {
      this.GetBranchMaster();
      this.GetARDBMaster();
      const sys = new SystemValues();
      // if (null !== sys.UserId && sys.UserId.length > 0) {
      //   const usr = new LOGIN_MASTER();
      //   usr.brn_cd = sys.BranchCode;
      //   usr.user_id = sys.UserId;
      //   usr.login_status = 'N';

      //   this.updateUsrStatus(usr);
      // }
      localStorage.removeItem('__userId');
      this.isLoading = false
    }, 300);

  }


  encriptPass(){
    const text = "Partha@123";

    // Convert the text to hexadecimal
    const hexText = Array.from(text, char => char.charCodeAt(0).toString(16)).join('');

    console.log(hexText);
    debugger
    }

  getLogdUser(){
    let login = new LOGIN_MASTER();
    login.user_id = localStorage.getItem('itemUX');
    login.brn_cd = localStorage.getItem('BUX');
    login.ardb_cd=this.sys.ardbCD;

    this.cms.addUpdDel('Sys/GetUserIDStatus', login).subscribe(
      res => {


        this.selectalluser=res
        this.filterUser=this.selectalluser.filter(x => x.login_status == 'Y')

        //console.log(this.filterUser);
        for(let i=0;i<this.filterUser.length;i++){
          if(this.filterUser[i].user_id ==localStorage.getItem('itemUX')){
            this.filterUser[i].login_status='N';

        //console.log(this.filterUser);

        this.filterUser.forEach(e => {
          e.ardb_cd=this.sys.ardbCD
          e.brn_cd=localStorage.getItem('BUX')
         });

         this.cms.addUpdDel('Sys/UpdateUserIdStatus', this.filterUser).subscribe(
          res => {
            //console.log(res)

          },)

        localStorage.removeItem('itemUX')
        localStorage.removeItem('BUX')

          }

       }




      })


 }
  getArdbCode(e: any) {
    this.wrongAttamt=0;
    this.f.username.setValue('')
    this.f.password.setValue('')
    this.f.branch.setValue('')
    if(this.f.ardbbrMst.value=='99'){
      this.ARBD="26";
    }
    else if(this.f.ardbbrMst.value=='100'){
      this.ARBD="2";
    }
    else if(this.f.ardbbrMst.value=='403'||this.f.ardbbrMst.value=='404' ||this.f.ardbbrMst.value=='405'){
      this.ARBD="11";
    }
    else if(this.f.ardbbrMst.value=='111'){
      this.ARBD="25";
    }
    else{
      this.ARBD=this.f.ardbbrMst.value;
    }

    var dt = {
      "ardb_cd": this.ARBD,
      "user_id": this.f.username.value
    }
    this.isLoading=true;
    this.rstSvc.addUpdDel('Mst/GetUserType', dt).subscribe(data => { //console.log(data)

       if(data){
        this.userData = data;
        this.isLoading=false;
        if(this.userData[0]?.user_type=="D"){
          // this.showAlert=true;
          // this.alertMsg='User id was Locked, Contact to Administrator!'
          this.isLoading=false;
        this.HandleMessage(true, MessageType.Error, `User id was Locked, Contact to Administrator!`);

          this.loginForm.invalid;
          return true;
        }

       }
       else{
        // this.showAlert=true;
        // this.alertMsg='Somthing was wrong, try again..'
        this.HandleMessage(true, MessageType.Error, `Somthing was wrong, try again..`);
        this.isLoading=false;
        return
       }

      },
      err => {
        this.isLoading = false;
      })
    debugger
    //console.log(e);
    //console.log(this.ardbBrnMst);
    let bankName=this.ardbBrnMst.filter(x=>x.ardB_CD==this.f.ardbbrMst.value)[0]?.bank_name
   this.bankFullName=this.ardbBrnMst.filter(x=>x.ardB_CD==this.f.ardbbrMst.value)[0]?.full_name
    // let bankName2=this.ardbBrnMst.filter(x=>x.ardB_CD=='100')[0].bank_name
    debugger

    localStorage.setItem('__ardb_cd',this.ARBD);

    localStorage.setItem('__bName', bankName);

    this.router.navigate([bankName + '/login']);
    this.GetBranchMaster();
  }
  get f() { return this.loginForm.controls; }
  onSubmit(): void {
    this.showUnlockUsr = false;
    // this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    if(this.userData[0]?.user_type != 'A' &&  this.userData[0]?.brn_cd!=this.f.branch.value){
        this.f.branch.disable() ;
        // this.showAlert=true;
        // this.alertMsg='User only signed into that branch where they were assigned.'
        this.HandleMessage(true, MessageType.Error, `User only signed into that branch where they were assigned.`);

        return
    }
    else{
      this.isLoading = true;
      const __bName = localStorage.getItem('__bName');
      // this.router.navigate([__bName + '/la']); // TODO remove this it will be after login
      const login = new LOGIN_MASTER();
      const toreturn = false;
      const hexText: string = Array.from(this.f.password.value, (char: string) => char.charCodeAt(0).toString(16)).join('');
      login.ardb_cd = this.ARBD;
      login.user_id = this.f.username.value;
      login.password = hexText;
      login.brn_cd = this.f.branch.value;
      this.nm = this.ardbBrnMst.find(x => x.ardB_CD == this.f.ardbbrMst.value)

      // this.nm.name = this.nm.name.substr(0,this.nm.name.length-10)
      // this.nm.name = this.nm.name +' Co-Operative Agriculture & Rural Development Bank Ltd.'
      localStorage.setItem('ardb_name', this.bankFullName)
      localStorage.setItem('report_footer', 'This Report Is Generated Through CFS-2022 ')

      if( this.f.ardbbrMst.value=='26'){
        let ardb_addrs=` H.O.: Old Court Compound, PO+PS- Burdwan, Purba Bardhaman- 713101
        Contact No: (0342) 2662390/ 9800960007`
        localStorage.setItem('ardb_addr', ardb_addrs)
      }
      if( this.f.ardbbrMst.value=='4'){
        let ardb_addrs=` Ghatal : Kushpata, Paschim Medinipur, WestBengal`
        localStorage.setItem('ardb_addr', ardb_addrs)
      }
      else{
        let ardb_addrs=''
        localStorage.setItem('ardb_addr', ardb_addrs)
      }

      localStorage.setItem('itemUX', this.f.username.value)
      localStorage.setItem('BUX', this.f.branch.value)
      this.rstSvc.addUpdDel<any>('Mst/GetUserDtls', login).subscribe(
        res => {
          //console.log(res.length)
          // this.isLoading = false;
          if (res.length === 0) {
            this.wrongAttamt?this.wrongAttamt:0
            this.wrongAttamt+=1;
            localStorage.setItem('W_attempt',  this.wrongAttamt);


            if(this.wrongAttamt==1){
              // this.showAlert = true;
              this.isLoading=false;
              this.HandleMessage(true, MessageType.Error, `Invalid UserName Or Password, (Wrong Attamt - ${this.wrongAttamt})`);

              // this.alertMsg = `Invalid UserName Or Password,(Wrong Attamt - ${this.wrongAttamt})`;
            }
            else if(this.wrongAttamt==2){
              // this.showAlert = true;
              this.isLoading=false;
              this.HandleMessage(true, MessageType.Error, `Wrong Attamt - ${this.wrongAttamt}, After one more wrong attamt ID will be locked `);

              // this.alertMsg = `Wrong Attamt - ${this.wrongAttamt}, After one more wrong attamt ID will be locked `;
            }
           else if(this.wrongAttamt>2){
              var dc={
                "ardb_cd":this.ARBD,
                "user_id":this.f.username.value
              }
              this.rstSvc.addUpdDel<any>('Sys/DeleteUserMaster', dc).subscribe(
                res => {
                  if(res==0){
                    // this.showAlert = true;
                    this.isLoading=false;
                    this.HandleMessage(true, MessageType.Error, `User id was locked, Contact to Administrator!`);

                    // this.alertMsg = 'User id was locked, Contact to Administrator!';
                  }
                })
            }
            else{
              this.HandleMessage(true, MessageType.Error, `Invalid UserName Or Password,(Wrong Attamt - ${this.wrongAttamt})`);

              // this.showAlert = true;
              this.isLoading=false;
              // this.alertMsg = `Invalid UserName Or Password,(Wrong Attamt - ${this.wrongAttamt})`;
            }

            debugger
          }
          else {
            //console.log(res[0])

            if (res[0].login_status === "Y") {
              // this.showAlert = true;
              this.isLoading=false;
              // this.alertMsg = 'User id already logged in another machine;';
              this.HandleMessage(true, MessageType.Error, 'User id already logged in another machine;');

            
              this.usrToUnlock = res[0];
              return;
            }
            else {
              // this.isLoading=true;
              var dt = this.brnDtls.find(x => x.brn_cd == this.f.branch.value)
             console.log(dt);
             
              this.getBranchIp(dt).then(response => {

                if (response == true) {
                  res[0].login_status = 'Y';
                  res[0].ip = localStorage.getItem('ipAddress');
                  this.getSystemParam();

                }

                else {

                }
              })
            }
          }
        },
        err => {
          this.isLoading = false;
          // this.showAlert = true;
          // this.alertMsg = 'Invalid Credential !!!!!';
          this.HandleMessage(true, MessageType.Error, 'Invalid Credential !!!!!');

        }
      ),
      err => {
        this.isLoading = false;
      };

    }

  }

  closeAlert() {
    this.showAlert = false;
  }

  public unlockUsr(): void {
    this.isLoading = true;
    this.usrToUnlock.login_status = 'N';
    this.rstSvc.addUpdDel('Mst/Updateuserstatus', this.usrToUnlock).subscribe(
      res => {
        this.isLoading = false;
        this.onSubmit();
      },
      err => { this.isLoading = false;}
    );
  }

  private updateUsrStatus(usr: any): void {
    this.rstSvc.addUpdDel('Mst/Updateuserstatus', usr).subscribe(

      res => {
        debugger
      },
      err => { }
    );
  }
  private getSystemParam(): void {
    this.isLoading=true
    var dt={
      "ardb_cd":this.ARBD
    }

    this.rstSvc.addUpdDel('Mst/GetSystemDate',dt).subscribe(data=>
      {
        //console.log(data)
        this.dtData=data
        //console.log(this.dtData.sys_date)
        localStorage.setItem('__currentDate', this.dtData.sys_date); // Day initilaze
        localStorage.setItem('__prevDate',this.dtData.prev_date)

    this.rstSvc.addUpdDel('Mst/GetSystemParameter', null).subscribe(
      sysRes => {
        try {
          //console.log(sysRes);
          const __bName = localStorage.getItem('__bName');
          this.systemParam = sysRes;
          // //console.log(this.systemParam.find(x => x.param_cd === '206').param_value)

          this.router.navigate([__bName + '/la']);
          this.http.get<{ ip: string }>(this.apiUrl).subscribe(
            data => {
              debugger
              const getIP =  data.ip;
             localStorage.setItem('ipAddress', getIP);
            })
            this.SBaccCD=RestService.bankconfigurationList.filter(e=>e.bank_name==__bName)[0].sms_provider
            localStorage.setItem('sbAccType', this.SBaccCD);

          localStorage.setItem('L2L', 'true');
          // //console.log(localStorage.getItem('ipAddress'))
          // localStorage.setItem('__ardb_cd', this.f.ardbbrMst.value);
          localStorage.setItem('__dist_cd', this.ardbBrnMst.find(x=>x.ardB_CD == this.f.ardbbrMst.value)?.dist_code)
          localStorage.setItem('__brnCd', this.f.branch.value); // "101"
          localStorage.setItem('__brnName', this.brnDtls.find(x => x.brn_cd === this.f.branch.value)?.brn_name); // "101"
          // localStorage.setItem('__currentDate', this.systemParam.find(x => x.param_cd === '206').param_value); // Day initilaze
          localStorage.setItem('__cashaccountCD', this.systemParam.find(x => x.param_cd === '213')?.param_value); // 28101
          localStorage.setItem('__ddsPeriod', this.systemParam.find(x => x.param_cd === '220')?.param_value); // 12
          localStorage.setItem('__userId', this.f.username.value); // feather
          localStorage.setItem('__minBalWdChq', this.systemParam.find(x => x.param_cd === '301')?.param_value);
          localStorage.setItem('__minBalNoChq', this.systemParam.find(x => x.param_cd === '302')?.param_value);
          localStorage.setItem('__dpstBnsRt', this.systemParam.find(x => x.param_cd === '805')?.param_value);
          localStorage.setItem('__pnlIntRtFrAccPreMatClos', this.systemParam.find(x => x.param_cd === '802')?.param_value);
          localStorage.setItem('__curFinyr', this.systemParam.find(x => x.param_cd === '207')?.param_value);
          // zlocalStorage.setItem('__neftPayDrAcc', this.systemParam.find(x => x.param_cd === '820').param_value);
          localStorage.setItem('__sbInttCalTilDt', this.systemParam.find(x => x.param_cd === '799')?.param_value);
          localStorage.setItem('__lastDt', this.systemParam.find(x => x.param_cd === '210')?.param_value);
          localStorage.setItem('__PrevStatus', this.systemParam.find(x => x.param_cd === '215')?.param_value);
          localStorage.setItem('__FinYearClose', this.systemParam.find(x => x.param_cd === '214')?.param_value);

          this.f.ardbbrMst.value=='26'?localStorage.setItem('__neftPayDrAcc','401101000283' ):localStorage.setItem('__neftPayDrAcc','0' )

    //  //console.log(this.dtData.sys_date)
        //  //console.log(localStorage.getItem('__currentDate'))
          this.msg.sendisLoggedInShowHeader(true);
          this.loginForm.disable();
        }

        catch (exception) {
          this.isLoading = false;
          // this.showAlert = true;
          this.HandleMessage(true, MessageType.Error, 'Initialization Failed. Contact Administrator !');

          // this.alertMsg = 'Initialization Failed. Contact Administrator !';
        }
      },
      sysErr => { }
    );
  },
  error=>{
    this.isLoading = false;
  }
  )

  }

  cancel() {
    // localStorage.clear();
    // localStorage.removeItem('__bName');
    localStorage.removeItem('__brnName');
    localStorage.removeItem('__brnCd');
    localStorage.removeItem('__currentDate');
    localStorage.removeItem('__cashaccountCD');
    localStorage.removeItem('__ddsPeriod');
    localStorage.removeItem('__userId');
    localStorage.removeItem('ardb_name');
    localStorage.removeItem('__ardb_cd');
    localStorage.removeItem('ardb_addr');
    localStorage.removeItem('L2L');
    localStorage.removeItem('sbAccType');

    this.brnDtls.length = 0;
    this.loginForm.reset();
    this.loginForm.enable();
  }

  private GetBranchMaster() {
    this.isLoading = true;
    var dt = { "ardb_cd": this.f.ardbbrMst.value ?this.f.ardbbrMst.value:null };
    //console.log(dt)
    // https://cfs2022.in/CTARDBUX/api/Mst/GetBranchMaster
    this.rstSvc.addUpdDel('Mst/GetBranchMaster', dt).subscribe(
      res => {
        //console.log(res)
        this.isLoading = false;
        this.brnDtls = res;
        this.brnDtls.sort((a, b) => a.brn_cd - b.brn_cd);
      },
      err => {
        this.isLoading = false;
       }
    );
  }

  private GetARDBMaster() {
    this.rstSvc.getlbr(environment.ardbUrl,null).subscribe(data=>{
      // //console.log(data
      if(data){
        console.log(RestService.bankconfigurationList)
        this.ardbBrnMst = data;
      }

    })
  }
  onfocusOut(e: any) {

    var dt = {
      "ardb_cd": this.ARBD,
      "user_id": e.target.value
    }
    this.isLoading=true;
    this.rstSvc.addUpdDel('Mst/GetUserType', dt).subscribe(data => { //console.log(data)
       this.userData = data;
       if(this.userData){
        if(this.userData[0]?.user_type=="D"){
          this.HandleMessage(true, MessageType.Error, 'User id was Locked, Contact to Administrator!');
          this.isLoading=false;
          this.loginForm.disable();
          return true;
        }
        this.isLoading=false;
        localStorage.setItem('userType',this.userData[0]?.user_type)
       this.loginForm.patchValue({branch:this.userData[0]?.user_type != 'A' ?  this.userData[0]?.brn_cd : ''})
       this.userData[0]?.user_type != 'A' ? this.f.branch.disable() : this.f.branch.enable();
      this.HandleMessage(this.userData[0]?.login_status == 'Y', MessageType.Error, this.userData[0]?.login_status == 'Y' ? 'User id already logged into another machine' : '');
       
      }
       // if (this.userData[0].user_type != 'A') {
      //   this.loginForm.patchValue({
      //     branch: this.userData[0].brn_cd
      //   })
      // }

      // else{
      //   this.loginForm.patchValue({
      //     branch: ''
      //   })
      //   this.f.branch.enable();
      // }
      // if (this.userData[0].login_status == 'Y') {
      //   this.showAlert = true;

      //   this.alertMsg = 'User id already logged in another machine;';
      // }
    },
    error=>{
      this.isLoading=false;
    })
  }
  
  public getBranchIp(e: any) {
    this.loginForm.disable();
    return new Promise((resolve, reject) =>
     {
      fetch("https://ipinfo.io/json?token=033f76199faab6").then(
            (response) => response.json()
          ).then(
            (data) => {
            this.ipAddress = data.ip;
            debugger
          // console.log(data)

          const myIP =  this.ipAddress.split(",");
          localStorage.setItem('ipAddress',this.ipAddress)
          // localStorage.setItem('ipAddress',myIP[0])
          this.isLoading = false;

          // this.loginForm.enable();
          // resolve(true);

          let ipMatched = false;
          if (e.ip_address.indexOf(myIP[0]) !== -1) {
             ipMatched = true;
            }

          if (!ipMatched) {
            // this.showAlert = true;
              this.HandleMessage(true, MessageType.Error, 'IP not allowed to access, contact support.');
           
            this.loginForm.disable();
            resolve(false);
          } else {
            this.loginForm.enable();
            resolve(true);
          }
          });
        
     }
    )

  }
  getAlertClass(type: MessageType): string {
  switch (type) {
    case MessageType.Sucess:
      return 'alert-success';
    case MessageType.Warning:
      return 'alert-warning';
    case MessageType.Info:
      return 'alert-info';
    case MessageType.Error:
      return 'alert-danger';
    default:
      return 'alert-info';
  }
}
private HandleMessage(show: boolean, type: MessageType = null, message: string = null) {
  this.showMsg = new ShowMessage();
  this.showMsg.Show = show;
  this.showMsg.Type = type;
  this.showMsg.Message = message;

  if (show) {
    setTimeout(() => {
      this.showMsg.Show = false;
    }, 5000); // auto-close after 4 sec
  }
}

getAlertIcon(type: MessageType): string {
  switch (type) {
    case MessageType.Sucess:
      return '✅';
    case MessageType.Warning:
      return '⚠️';
    case MessageType.Info:
      return 'ℹ️';
    case MessageType.Error:
      return '❌';
    default:
      return '🔔';
  }
}

}
