async function loadInvestmentPlans(){
    try{const s=await db.collection('settings').doc('investment_plans').get();
        if(s.exists&&s.data().plans)investmentPlans=s.data().plans;
        else{investmentPlans=[{name:'Micro',amount:50,pct:3,days:30,icon:'🌱'},{name:'Standard',amount:100,pct:3.5,days:30,icon:'⭐'},{name:'Advanced',amount:200,pct:4,days:30,icon:'🔥'},{name:'Premium',amount:250,pct:4.5,days:30,icon:'💎'},{name:'Professional',amount:1500,pct:5,days:60,icon:'🚀'},{name:'Enterprise',amount:5000,pct:7,days:120,icon:'👑'}];}
    }catch(e){}
}

function refreshInvestPage(){
    const c=document.getElementById('investPlansContainer');if(!c)return;
    const cols=['#10b981','#3b82f6','#f59e0b','#8b5cf6','#667eea','#c084fc'];
    c.innerHTML=investmentPlans.map((p,i)=>`<div class="glass-card plan-card" onclick="investInPlan('${p.name}',${p.amount},${p.pct},${p.days})"><div class="plan-icon">${p.icon||'💰'}</div><h3>${p.name}</h3><div class="plan-amount" style="color:${cols[i%6]};">$${p.amount}</div><div class="plan-roi">📅 +$${((p.amount*p.pct)/100).toFixed(2)}/day | ${p.days}d</div><button class="btn-primary plan-btn btn-sm">Invest $${p.amount}</button></div>`).join('');
}

async function investInPlan(name,amt,pct,days){
    if(!cu){openAuthModal('login');return;}if((cu.balance||0)<amt){showAlert('⚠️ Insufficient balance','error');navigateTo('deposit');return;}
    const dp=parseFloat((amt*pct/100).toFixed(2));
    const r=await fsAdd('investments',{uid:cu.id,ue:cu.email,plan:name,amount:amt,dailyPct:pct,dailyProfit:dp,days,daysRemaining:days,earnedProfit:0,status:'active',lastEarningDate:''});
    if(r.id){cu.balance-=amt;await fsUpdate('users',cu.id,{balance:cu.balance});sessionStorage.setItem('cu',JSON.stringify(cu));showAlert('✅ Invested!','success');navigateTo('dashboard');}
}
