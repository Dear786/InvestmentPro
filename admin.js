async function loadAdminStats(){
    try{
        const ad=await fsGet('deposits',null,500),aw=await fsGet('withdrawals',null,500),ai=await fsGet('investments',null,500),au=await fsGet('users',null,500);
        document.getElementById('adminTotalUsers').innerText=au.length;
        document.getElementById('adminPendingDeposits').innerText=ad.filter(d=>d.status==='pending').length;
        document.getElementById('adminPendingWithdrawals').innerText=aw.filter(w=>w.status==='pending').length;
        document.getElementById('adminTotalInvested').innerText='$'+ai.filter(i=>i.status==='active').reduce((s,i)=>s+(parseFloat(i.amount)||0),0).toLocaleString();
    }catch(e){}
}

function switchAdminTab(t){
    at=t;
    document.querySelectorAll('.admin-tab').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(x=>x.style.display='none');
    const tc=document.getElementById('admin-'+t+'-tab');if(tc)tc.style.display='block';
    loadAdminTab(t);
}

async function loadAdminTab(t){
    if(t==='users'){
        const all=await fsGet('users',null,500);us=all;
        const tb=document.getElementById('admin-users-tab');
        tb.innerHTML=`<div class="glass-card" style="padding:20px;"><div class="table-container"><table><thead><tr><th>Email</th><th>Balance</th></tr></thead><tbody>${all.map(u=>`<tr><td>${u.email}</td><td>$${(u.balance||0).toFixed(2)}</td></tr>`).join('')}</tbody></table></div></div>`;
    }
    if(t==='deposits'){
        const all=await fsGet('deposits',null,500);dep=all;
        const tb=document.getElementById('admin-deposits-tab');
        tb.innerHTML=`<div class="glass-card" style="padding:20px;"><div class="table-container"><table><thead><tr><th>User</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody>${all.map(d=>`<tr><td>${d.ue}</td><td>$${d.amount}</td><td>${d.status}</td><td>${d.status==='pending'?`<button class="btn-success btn-sm" onclick="approveDeposit('${d.id}')">✅</button> <button class="btn-danger btn-sm" onclick="rejectDeposit('${d.id}')">❌</button>`:'Done'}</td></tr>`).join('')}</tbody></table></div></div>`;
    }
}

async function approveDeposit(id){
    const d=(await fsGet('deposits')).find(x=>x.id===id);
    if(d){await fsUpdate('deposits',id,{status:'approved'});const u=await db.collection('users').doc(d.uid).get();if(u.exists)await fsUpdate('users',d.uid,{balance:(parseFloat(u.data().balance)||0)+(parseFloat(d.amount)||0)});loadAdminTab('deposits');loadAdminStats();}
}

async function rejectDeposit(id){await fsUpdate('deposits',id,{status:'rejected'});loadAdminTab('deposits');loadAdminStats();}

function logoutAdmin(){cu=null;sessionStorage.removeItem('cu');updateUI();navigateTo('home');}
