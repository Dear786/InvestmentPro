async function getPaymentSettings(fr=false){
    if(fr)cachedPaymentSettings=null;
    if(cachedPaymentSettings)return cachedPaymentSettings;
    const docRef=db.collection('payment_settings').doc('payment_settings_doc');
    try{
        const snap=await docRef.get();
        if(snap.exists){
            const d=snap.data();let methods=Array.isArray(d.methods)?d.methods:[];
            if(methods.length===0){methods=DEFAULT_METHODS;await docRef.update({methods:DEFAULT_METHODS});}
            cachedPaymentSettings={id:'payment_settings_doc',er:d.er||278.50,methods:methods,instructions:d.instructions||'',successMsg:d.successMsg||''};
            return cachedPaymentSettings;
        }
        const dd={er:278.50,methods:DEFAULT_METHODS,instructions:'Send payment to details shown.',successMsg:'✅ Submitted!',createdAt:firebase.firestore.FieldValue.serverTimestamp()};
        await docRef.set(dd);cachedPaymentSettings={id:'payment_settings_doc',...dd};return cachedPaymentSettings;
    }catch(e){return{er:278.50,methods:[],instructions:'',successMsg:''};}
}

function updateUserPaymentMethods(){
    getPaymentSettings(false).then(s=>{
        const dc=document.querySelector('#deposit-page .payment-methods');if(!dc)return;
        dc.innerHTML=s.methods.map(m=>`<div class="payment-method-card" data-method-id="${m.id}" onclick="selectDepositMethod('${m.id}')"><div class="method-icon">${m.icon||'💰'}</div><strong>${m.name}</strong></div>`).join('');
    });
}

async function selectDepositMethod(id){
    const s=await getPaymentSettings(false);const m=s.methods.find(x=>x.id===id);
    if(!m){showAlert('⚠️ Method not found','error');return;}sdm=id;
    document.getElementById('depositStep1').style.display='none';
    document.getElementById('depositStep2').style.display='block';
    const el=document.getElementById('depositInstructionContent');
    el.innerHTML=`<p>📢 ${s.instructions||'Send payment to details above.'}</p><div style="background:rgba(0,0,0,0.3);padding:12px;border-radius:8px;margin:8px 0;"><strong>Name:</strong> ${m.accountName}<br><strong>Account:</strong> ${m.accountNumber}</div><div id="conversionBox" style="background:rgba(102,126,234,0.2);padding:12px;border-radius:10px;margin:8px 0;text-align:center;"><small>🇵🇰 PKR Amount</small><div id="conversionResult" style="font-size:18px;font-weight:700;color:#667eea;">Enter USD amount</div></div>`;
}

function updatePKRAmount(){
    const usd=parseFloat(document.getElementById('depositAmount').value)||0;
    const convResult=document.getElementById('conversionResult');
    if(convResult&&usd>0)convResult.innerHTML=`Rs. ${(usd*278.50).toLocaleString('en-PK')}`;
}

function handleScreenshotPreview(e){
    const f=e.target.files[0],p=document.getElementById('screenshotPreview');
    if(!f)return;selectedScreenshotFile=f;
    const r=new FileReader();
    r.onload=function(ev){p.innerHTML=`<img src="${ev.target.result}" style="max-width:150px;border-radius:8px;border:2px solid #10b981;">`;};
    r.readAsDataURL(f);
}

function backToMethods(){
    document.getElementById('depositStep1').style.display='block';
    document.getElementById('depositStep2').style.display='none';
    document.getElementById('depositForm').reset();
    document.getElementById('screenshotPreview').innerHTML='';
    selectedScreenshotFile=null;sdm='';
}

async function submitDeposit(e){
    e.preventDefault();if(!cu){openAuthModal('login');return false;}
    if(!sdm){showAlert('⚠️ Select payment method','error');return false;}
    const amt=parseFloat(document.getElementById('depositAmount').value);
    if(isNaN(amt)||amt<10){showAlert('⚠️ Minimum $10','error');return false;}
    const txid=document.getElementById('depCustomTxid').value.trim();
    if(!txid){showAlert('⚠️ Enter Transaction ID','error');return false;}
    const btn=document.getElementById('depositSubmitBtn');btn.disabled=true;btn.innerHTML='⏳';
    try{
        const det={name:document.getElementById('depCustomName').value.trim()||cu.email,si:document.getElementById('depCustomSender').value.trim(),txid:txid};
        if(selectedScreenshotFile)det.screenshot=await convertToBase64(selectedScreenshotFile);
        await db.collection('deposits').add({uid:cu.id,ue:cu.email,amount:amt,method:sdm,details:det,status:'pending',createdAt:firebase.firestore.FieldValue.serverTimestamp()});
        showAlert('✅ Submitted!','success');backToMethods();loadDepositHistory();
    }catch(err){showAlert('❌ Error','error');}
    btn.disabled=false;btn.innerHTML='Submit';return false;
}

async function loadDepositHistory(){
    if(!cu)return;const c=document.getElementById('depositHistoryList');if(!c)return;
    const dl=(await fsGet('deposits')).filter(d=>d.uid===cu.id);
    c.innerHTML=dl.length?dl.map(d=>`<div class="deposit-card ${d.status}"><strong>$${d.amount}</strong> <span class="status-badge status-${d.status}">${d.status.toUpperCase()}</span></div>`).join(''):'<p style="color:#64748b;">📭 No deposits</p>';
}
