async function getWithdrawMethods(){
    try{const s=await db.collection('payment_settings').doc('withdraw_settings').get();if(s.exists)return s.data().methods||[];}catch(e){}
    return[{id:'wpm-1',name:'Bank Transfer',icon:'🏦',accountName:'Default',accountNumber:'N/A'}];
}

function updateWithdrawPageMethods(){
    getWithdrawMethods().then(m=>{
        const wc=document.querySelector('#withdraw-page .payment-methods');if(!wc)return;
        wc.innerHTML=m.map(wm=>`<div class="payment-method-card" onclick="selectWithdrawMethod('${wm.id}')"><div class="method-icon">${wm.icon||'💰'}</div><strong>${wm.name}</strong></div>`).join('');
    });
}

function selectWithdrawMethod(id){sm=id;document.querySelectorAll('#withdraw-page .payment-method-card').forEach(c=>c.classList.remove('selected'));document.getElementById('withdrawCustomFields').style.display='block';}

async function submitWithdraw(e){
    e.preventDefault();if(!cu){openAuthModal('login');return false;}if(!sm){showAlert('⚠️ Select method','error');return false;}
    const amt=parseFloat(document.getElementById('withdrawAmount').value);
    if(isNaN(amt)||amt<10){showAlert('⚠️ Min $10','error');return false;}
    if(amt>(cu.balance||0)){showAlert('⚠️ Insufficient balance','error');return false;}
    const det={name:document.getElementById('withdrawName').value.trim(),number:document.getElementById('withdrawNumber').value.trim()};
    if(!det.name||!det.number){showAlert('⚠️ Fill all fields','error');return false;}
    try{
        await fsAdd('withdrawals',{uid:cu.id,ue:cu.email,amount:amt,method:sm,details:det,status:'pending'});
        cu.balance-=amt;await fsUpdate('users',cu.id,{balance:cu.balance});sessionStorage.setItem('cu',JSON.stringify(cu));
        showAlert('✅ Submitted!','success');document.getElementById('withdrawalForm').reset();
        document.getElementById('withdrawCustomFields').style.display='none';sm='';loadWithdrawHistory();
    }catch(err){showAlert('❌ Error','error');}
    return false;
}

async function loadWithdrawHistory(){
    if(!cu)return;const w=(await fsGet('withdrawals')).filter(x=>x.uid===cu.id);
    const c=document.getElementById('withdrawalHistoryList');if(!c)return;
    c.innerHTML=w.length?w.map(x=>`<div class="withdrawal-card ${x.status}"><strong>$${x.amount}</strong> <span class="status-badge status-${x.status}">${x.status.toUpperCase()}</span></div>`).join(''):'<p style="color:#64748b;">No withdrawals</p>';
}
