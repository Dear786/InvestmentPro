const S = window.location.origin;
const AE = 'admin@investmentpro.com';
const AP = 'admin123456';
let cu = null;
let us = [], dep = [], sm = '', sdm = '', at = 'users', am = 'login';
let cachedPaymentSettings = null, investmentPlans = [];
let selectedScreenshotFile = null, selectedIconFile = null, lastProfitRun = 0;
let liveChatUnsubscribe = null, currentChatRoom = 'general', isAdminOnline = false;

const DEFAULT_METHODS = [
    {id:'default-usdt',type:'crypto',name:'USDT TRC20',icon:'🪙',accountName:'Investment Wallet',accountNumber:'TRu3sSs1oNsYndpmZcZGyAJpGhGttqnRuG',extra:'Send only via TRC20 Network'},
    {id:'default-btc',type:'crypto',name:'Bitcoin BTC',icon:'₿',accountName:'Investment Wallet',accountNumber:'15Gfadd9Qsv7TSpV8yc7pHBxwhi9FhCDEV',extra:'Send only via Bitcoin Network'}
];

async function fsAdd(c,d){try{const r=await db.collection(c).add({...d,createdAt:firebase.firestore.FieldValue.serverTimestamp()});return{success:true,id:r.id};}catch(e){return{error:e.message};}}
async function fsGet(c,w=null,limitCount=100){try{let q=db.collection(c);if(w)q=q.where(w.field,w.op,w.value);q=q.orderBy('createdAt','desc').limit(limitCount);const s=await q.get();return s.docs.map(d=>({id:d.id,...d.data()}));}catch(e){return[];}}
async function fsUpdate(c,id,d){try{await db.collection(c).doc(id).update(d);return{success:true};}catch(e){return{error:e.message};}}

function showAlert(m,t){const c=document.getElementById('alertContainer');const d=document.createElement('div');d.className='alert alert-'+t;d.innerHTML=m;c.appendChild(d);setTimeout(()=>{d.style.opacity='0';setTimeout(()=>d.remove(),300);},4000);}
function showLoader(){const l=document.getElementById('pageLoader');if(l){l.style.display='flex';l.style.opacity='1';}}
function hideLoader(){const l=document.getElementById('pageLoader');if(l){l.style.opacity='0';setTimeout(()=>{l.style.display='none';},200);}}
function saveCurrentPage(p){if(p&&p!=='admin')sessionStorage.setItem('currentPage',p);}
function getCurrentPage(){return sessionStorage.getItem('currentPage')||'home';}
function gRC(e){return(btoa(e).substring(0,8)+Date.now().toString(36)).substring(0,12).toUpperCase();}
function gRL(){if(!cu)return S+'/?ref=XXX';if(!cu.rc)cu.rc=gRC(cu.email);return S+'/?ref='+cu.rc;}
function cRL(){const l=gRL();navigator.clipboard?navigator.clipboard.writeText(l).then(()=>showAlert('✅ Copied!','success')):showAlert('📋 '+l,'error');}
function checkAuth(page){if(!cu){showAlert('🔐 Sign in','error');openAuthModal('login');return;}navigateTo(page);}
function copyToClipboard(t){if(!t)return;const ta=document.createElement('textarea');ta.value=t;ta.style.position='fixed';ta.style.left='-9999px';document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);showAlert('✅ Copied!','success');}
function toggleDropdown(e){e.stopPropagation();const d=document.getElementById('userDropdown');if(d)d.style.display=d.style.display==='block'?'none':'block';}
function closeDropdown(){const d=document.getElementById('userDropdown');if(d)d.style.display='none';}
function logout(){cu=null;sessionStorage.removeItem('cu');localStorage.removeItem('cu_backup');updateUI();navigateTo('home');}
function updateUI(){
    if(cu){
        document.getElementById('auth-buttons').style.display='none';
        document.getElementById('user-menu').style.display='inline-block';
        document.getElementById('userAvatar').innerText=cu.email.charAt(0).toUpperCase();
    }else{
        document.getElementById('auth-buttons').style.display='block';
        document.getElementById('user-menu').style.display='none';
    }
}
document.addEventListener('click',function(e){const m=document.getElementById('user-menu');const d=document.getElementById('userDropdown');if(m&&!m.contains(e.target)&&d)d.style.display='none';});

let btcPrice=null;
async function fetchBTCPrice(){try{const res=await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');const data=await res.json();btcPrice=data.bitcoin.usd;}catch(e){btcPrice=null;}}
function convertToBase64(file){return new Promise(r=>{const rd=new FileReader();rd.onload=()=>r(rd.result);rd.readAsDataURL(file);});}
