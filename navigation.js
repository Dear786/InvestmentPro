function navigateTo(page){
    showLoader();
    document.querySelectorAll('#main-content > div').forEach(p=>p.style.display='none');
    const target=document.getElementById(page+'-page');
    if(target)target.style.display='block';
    saveCurrentPage(page);
    if(page==='admin'&&(!cu||!cu.isAdmin)){showAlert('🔒 Access denied','error');navigateTo('home');hideLoader();return;}
    setTimeout(async()=>{
        try{
            if(cu&&page==='dashboard')await updateDashboard();
            if(page==='invest'&&cu){if(!investmentPlans.length)await loadInvestmentPlans();refreshInvestPage();}
            if(page==='deposit'&&cu){document.getElementById('depositStep1').style.display='block';document.getElementById('depositStep2').style.display='none';updateUserPaymentMethods();loadDepositHistory();}
            if(page==='withdraw'&&cu){updateWithdrawPageMethods();loadWithdrawHistory();}
            if(page==='referral'&&cu){
                if(document.getElementById('referralLink'))document.getElementById('referralLink').innerText=gRL();
                calculateReferralEarnings().then(e=>{if(document.getElementById('referralEarnings'))document.getElementById('referralEarnings').innerText='$'+(e||0).toFixed(2);});
                fsGet('referrals').then(ar=>{const mr=ar.filter(r=>r.referrerId==cu.id);if(document.getElementById('totalReferrals'))document.getElementById('totalReferrals').innerText=mr.length;});
            }
            if(page==='support'&&cu){loadUserTickets();}
            if(page==='admin'&&cu&&cu.isAdmin){loadAdminStats();switchAdminTab(at||'users');}
        }catch(e){}
        hideLoader();
    },200);
    window.scrollTo({top:0,behavior:'instant'});
}
