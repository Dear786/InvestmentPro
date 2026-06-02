async function updateDashboard(){
    if(!cu)return;
    try{const userDoc=await db.collection('users').doc(cu.id).get();if(userDoc.exists){cu.balance=parseFloat(userDoc.data().balance)||0;sessionStorage.setItem('cu',JSON.stringify(cu));}}catch(e){}
    document.getElementById('dashBalance').innerHTML='$'+(cu.balance||0).toFixed(2);
    document.getElementById('availableBalance').innerHTML='$'+(cu.balance||0).toFixed(2);
    try{
        const invSnap=await db.collection('investments').where('uid','==',cu.id).where('status','==','active').get();
        const ai=invSnap.docs.map(d=>({id:d.id,...d.data()}));
        const tp=ai.reduce((s,i)=>s+(parseFloat(i.earnedProfit)||0),0);
        document.getElementById('dashProfit').innerHTML='$'+tp.toFixed(2);
        document.getElementById('dashInvestments').innerHTML=ai.length;
        const c=document.getElementById('investmentsList');
        c.innerHTML=ai.length?ai.map(i=>`<div class="investment-item"><strong>${i.plan}</strong> - $${i.amount} | +$${i.dailyProfit}/day | ${i.daysRemaining}d left</div>`).join(''):'<p style="color:#64748b;">📊 No active investments</p>';
        const re=await calculateReferralEarnings();document.getElementById('dashReferral').innerHTML='$'+(re||0).toFixed(2);
    }catch(e){}
}

async function calculateReferralEarnings(){
    if(!cu)return 0;
    try{return(await fsGet('referrals')).filter(r=>r.referrerId==cu.id).reduce((s,r)=>s+(parseFloat(r.commission)||0),0);}catch(e){return 0;}
}

async function loadUserTickets(){
    if(!cu)return;const tc=document.getElementById('ticketsList');if(!tc)return;
    const all=await fsGet('tickets');const mt=all.filter(t=>t.uid===cu.id);
    tc.innerHTML=mt.length?mt.map(t=>`<div class="glass-card" style="padding:12px;margin-bottom:8px;"><strong>${t.title}</strong> <span class="status-badge ${t.status==='open'?'status-pending':'status-approved'}">${t.status.toUpperCase()}</span></div>`).join(''):'<p style="color:#64748b;">📭 No tickets</p>';
}

async function submitTicket(e){
    e.preventDefault();if(!cu)return false;
    try{await fsAdd('tickets',{uid:cu.id,ue:cu.email,subject:document.getElementById('ticketSubject').value,title:document.getElementById('ticketTitle').value,message:document.getElementById('ticketMessage').value,status:'open'});showAlert('✅ Submitted!','success');document.getElementById('supportForm').reset();loadUserTickets();}catch(e){}
    return false;
}
