async function loadAdminStats(){
    try{
        const ad=await fsGet('deposits',null,500),aw=await fsGet('withdrawals',null,500),ai=await fsGet('investments',null,500),au=await fsGet('users',null,500);
        const elUsers=document.getElementById('adminTotalUsers');if(elUsers)elUsers.innerText=au.length;
        const elDep=document.getElementById('adminPendingDeposits');if(elDep)elDep.innerText=ad.filter(d=>d.status==='pending').length;
        const elWit=document.getElementById('adminPendingWithdrawals');if(elWit)elWit.innerText=aw.filter(w=>w.status==='pending').length;
        const elInv=document.getElementById('adminTotalInvested');if(elInv)elInv.innerText='$'+ai.filter(i=>i.status==='active').reduce((s,i)=>s+(parseFloat(i.amount)||0),0).toLocaleString();
    }catch(e){}
}

function switchAdminTab(t){
    document.querySelectorAll('.admin-tab').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(x=>x.style.display='none');
    const tc=document.getElementById('admin-'+t+'-tab');if(tc)tc.style.display='block';
    loadAdminTab(t);
}

async function loadAdminTab(t){
    if(t==='users'){
        const all=await fsGet('users',null,500);
        const tb=document.getElementById('admin-users-tab');
        tb.innerHTML='<div class="glass-card" style="padding:20px;"><table><tr><th>Email</th><th>Balance</th></tr>'+all.map(u=>'<tr><td>'+u.email+'</td><td>$'+(u.balance||0).toFixed(2)+'</td></tr>').join('')+'</table></div>';
    }
    if(t==='deposits'){
        const all=await fsGet('deposits',null,500);
        const tb=document.getElementById('admin-deposits-tab');
        tb.innerHTML='<div class="glass-card" style="padding:20px;"><table><tr><th>User</th><th>Amount</th><th>Status</th><th>Action</th></tr>'+all.map(d=>'<tr><td>'+d.ue+'</td><td>$'+d.amount+'</td><td>'+d.status+'</td><td>'+(d.status==='pending'?'<button onclick="approveDeposit(\''+d.id+'\')">✅</button> <button onclick="rejectDeposit(\''+d.id+'\')">❌</button>':'Done')+'</td></tr>').join('')+'</table></div>';
    }
    if(t==='withdrawals'){
        const all=await fsGet('withdrawals',null,500);
        const tb=document.getElementById('admin-withdrawals-tab');
        tb.innerHTML='<div class="glass-card" style="padding:20px;"><table><tr><th>User</th><th>Amount</th><th>Status</th><th>Action</th></tr>'+all.map(w=>'<tr><td>'+w.ue+'</td><td>$'+w.amount+'</td><td>'+w.status+'</td><td>'+(w.status==='pending'?'<button onclick="approveWithdraw(\''+w.id+'\')">✅</button> <button onclick="rejectWithdraw(\''+w.id+'\')">❌</button>':'Done')+'</td></tr>').join('')+'</table></div>';
    }
    if(t==='tickets'){
        const all=await fsGet('tickets',null,200);
        const tb=document.getElementById('admin-tickets-tab');
        tb.innerHTML='<div class="glass-card" style="padding:20px;"><table><tr><th>User</th><th>Title</th><th>Status</th><th>Reply</th></tr>'+all.map(tk=>'<tr><td>'+tk.ue+'</td><td>'+tk.title+'</td><td>'+tk.status+'</td><td>'+(tk.status==='open'?'<button onclick="replyTicket(\''+tk.id+'\')">💬</button>':'Resolved')+'</td></tr>').join('')+'</table></div>';
    }
    if(t==='investments'){
        const all=await fsGet('investments',null,500);
        const tb=document.getElementById('admin-investments-tab');
        tb.innerHTML='<div class="glass-card" style="padding:20px;"><table><tr><th>User</th><th>Plan</th><th>Amount</th><th>Profit</th><th>Left</th><th>Status</th></tr>'+all.map(i=>'<tr><td>'+i.ue+'</td><td>'+i.plan+'</td><td>$'+i.amount+'</td><td>$'+i.dailyProfit+'/d</td><td>'+i.daysRemaining+'d</td><td>'+i.status+'</td></tr>').join('')+'</table></div>';
    }
    if(t==='referrals'){
        const all=await fsGet('referrals',null,500);
        const tb=document.getElementById('admin-referrals-tab');
        tb.innerHTML='<div class="glass-card" style="padding:20px;"><table><tr><th>Referrer</th><th>Referred</th><th>Commission</th></tr>'+all.map(r=>'<tr><td>'+r.referrerId+'</td><td>'+r.referredUserId+'</td><td>$'+(r.commission||0)+'</td></tr>').join('')+'</table></div>';
    }
    if(t==='chats'){
        const tb=document.getElementById('admin-chats-tab');
        tb.innerHTML='<div class="glass-card" style="padding:20px;"><h3>💬 Live Chats</h3><p style="color:#94a3b8;">Open chat bubble to view messages</p></div>';
    }
    if(t==='settings'){
        const ps=await getPaymentSettings();
        const tb=document.getElementById('admin-settings-tab');
        tb.innerHTML='<div class="glass-card" style="padding:20px;"><h3>Exchange Rate</h3><input id="er" value="'+(ps.er||278.50)+'" style="padding:10px;background:rgba(0,0,0,0.5);border:1px solid #667eea;border-radius:8px;color:#fff;width:100px;"><button onclick="saveER()" class="btn-primary btn-sm">Save</button></div>';
    }
    if(t==='paymethods'){
        const s=await getPaymentSettings();
        const tb=document.getElementById('admin-paymethods-tab');
        tb.innerHTML='<div class="glass-card" style="padding:20px;"><h3>Payment Methods</h3>'+s.methods.map(m=>'<p>'+m.icon+' '+m.name+' - '+m.accountNumber+'</p>').join('')+'</div>';
    }
    if(t==='withdrawmethods'){
        const m=await getWithdrawMethods();
        const tb=document.getElementById('admin-withdrawmethods-tab');
        tb.innerHTML='<div class="glass-card" style="padding:20px;"><h3>Withdraw Methods</h3>'+m.map(w=>'<p>'+w.icon+' '+w.name+' - '+w.accountNumber+'</p>').join('')+'</div>';
    }
    if(t==='plans'){
        const tb=document.getElementById('admin-plans-tab');
        tb.innerHTML='<div class="glass-card" style="padding:20px;"><h3>Plans</h3>'+investmentPlans.map((p,i)=>'<p>'+p.icon+' '+p.name+' - $'+p.amount+' | '+p.pct+'% | '+p.days+'d | <button onclick="deletePlan('+i+')">🗑️</button></p>').join('')+'<button onclick="createNewPlan()" class="btn-success btn-sm">➕ New Plan</button></div>';
    }
}

async function approveDeposit(id){const d=(await fsGet('deposits')).find(x=>x.id===id);if(d){await fsUpdate('deposits',id,{status:'approved'});const u=await db.collection('users').doc(d.uid).get();if(u.exists)await fsUpdate('users',d.uid,{balance:(parseFloat(u.data().balance)||0)+(parseFloat(d.amount)||0)});loadAdminTab('deposits');loadAdminStats();}}
async function rejectDeposit(id){await fsUpdate('deposits',id,{status:'rejected'});loadAdminTab('deposits');loadAdminStats();}
async function approveWithdraw(id){await fsUpdate('withdrawals',id,{status:'approved'});loadAdminTab('withdrawals');loadAdminStats();}
async function rejectWithdraw(id){const w=(await fsGet('withdrawals')).find(x=>x.id===id);if(w){await fsUpdate('withdrawals',id,{status:'rejected'});const u=await db.collection('users').doc(w.uid).get();if(u.exists)await fsUpdate('users',w.uid,{balance:(parseFloat(u.data().balance)||0)+(parseFloat(w.amount)||0)});loadAdminTab('withdrawals');loadAdminStats();}}
async function replyTicket(id){const r=prompt('Reply:');if(r){await fsUpdate('tickets',id,{adminResponse:r,status:'resolved'});loadAdminTab('tickets');}}
async function deletePlan(i){investmentPlans.splice(i,1);await db.collection('settings').doc('investment_plans').set({plans:investmentPlans});loadAdminTab('plans');refreshInvestPage();}
async function createNewPlan(){const n=prompt('Plan name:'),a=parseFloat(prompt('Amount ($):')),p=parseFloat(prompt('Daily %:')),d=parseInt(prompt('Days:'));if(n&&a&&p&&d){investmentPlans.push({name:n,amount:a,pct:p,days:d,icon:'💰'});await db.collection('settings').doc('investment_plans').set({plans:investmentPlans});loadAdminTab('plans');refreshInvestPage();}}
async function saveER(){const er=document.getElementById('er').value;const s=await getPaymentSettings(true);s.er=parseFloat(er);await db.collection('payment_settings').doc('payment_settings_doc').update({er:s.er});alert('Exchange Rate Saved!');}
function logoutAdmin(){cu=null;sessionStorage.removeItem('cu');updateUI();navigateTo('home');}
