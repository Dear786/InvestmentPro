function openAuthModal(m){
    am=m;
    document.getElementById('modalTitle').innerText=m==='login'?'🔐 Sign In':'🚀 Create Account';
    document.getElementById('toggleAuthText').innerText=m==='login'?"Don't have account?":"Already have account?";
    document.getElementById('confirmPasswordField').style.display=m==='register'?'block':'none';
    document.getElementById('authModal').style.display='flex';
    document.getElementById('loginEmail').value='';
    document.getElementById('loginPassword').value='';
    const cf=document.getElementById('loginConfirmPassword');if(cf)cf.value='';
}
function closeAuthModal(){document.getElementById('authModal').style.display='none';}
function toggleAuthMode(e){e.preventDefault();am=am==='login'?'register':'login';openAuthModal(am);}

async function handleAuth(e){
    e.preventDefault();
    const em=document.getElementById('loginEmail').value.trim(),pw=document.getElementById('loginPassword').value;
    if(am==='login'){
        if(!em||!pw){showAlert('⚠️ Fill fields','error');return false;}
        if(em===AE&&pw===AP){
            const r=await fsGet('users',{field:'email',op:'==',value:em});
            cu=r.length>0?{id:r[0].id,...r[0],isAdmin:true}:{id:(await fsAdd('users',{email:em,password:pw,balance:0,refCode:'ADMIN001',isAdmin:true})).id,email:em,balance:0,isAdmin:true};
            sessionStorage.setItem('cu',JSON.stringify(cu));localStorage.setItem('cu_backup',JSON.stringify(cu));
            showAlert('👑 Admin!','success');closeAuthModal();updateUI();navigateTo('admin');return false;
        }
        const r=await fsGet('users',{field:'email',op:'==',value:em});
        if(r.length>0&&r[0].password===pw){
            cu={id:r[0].id,email:r[0].email,balance:parseFloat(r[0].balance)||0,refCode:r[0].refCode||'',rc:r[0].refCode||'',isAdmin:false};
            sessionStorage.setItem('cu',JSON.stringify(cu));localStorage.setItem('cu_backup',JSON.stringify(cu));
            showAlert('👋 Welcome!','success');closeAuthModal();updateUI();navigateTo('dashboard');
        }else{showAlert('❌ Invalid','error');}
    }else{
        if(!em||!pw){showAlert('⚠️ Fill fields','error');return false;}
        if(pw.length<6){showAlert('⚠️ Min 6 chars','error');return false;}
        const cf=document.getElementById('loginConfirmPassword');if(cf&&cf.value!==pw){showAlert('⚠️ Mismatch','error');return false;}
        const ex=await fsGet('users',{field:'email',op:'==',value:em});if(ex.length>0){showAlert('⚠️ Email exists','error');return false;}
        const rf=new URLSearchParams(window.location.search).get('ref'),gr=gRC(em);let rb=null;
        if(rf){const ru=await fsGet('users',{field:'refCode',op:'==',value:rf});if(ru.length>0)rb=ru[0].id;}
        const nr=await fsAdd('users',{email:em,password:pw,balance:0,refCode:gr,referredBy:rb,isAdmin:false});
        cu={id:nr.id,email:em,balance:0,rc:gr,refCode:gr,referredBy:rb};
        if(rb){try{await db.collection('referrals').add({referrerId:rb,referredUserId:nr.id,commission:0,date:new Date().toISOString(),createdAt:firebase.firestore.FieldValue.serverTimestamp()});}catch(e){}}
        sessionStorage.setItem('cu',JSON.stringify(cu));localStorage.setItem('cu_backup',JSON.stringify(cu));
        showAlert('✅ Registered!','success');closeAuthModal();updateUI();navigateTo('dashboard');
    }
    return false;
}
window.onclick=(e)=>{if(e.target===document.getElementById('authModal'))closeAuthModal();};
