function toggleChat(){
    const w=document.getElementById('chatWindow');
    if(w.style.display==='block'){w.style.display='none';if(liveChatUnsubscribe){liveChatUnsubscribe();liveChatUnsubscribe=null;}}
    else{if(!cu){showAlert('🔐 Please login first','error');openAuthModal('login');return;}w.style.display='block';initLiveChat();}
}

function initLiveChat(){
    if(liveChatUnsubscribe)liveChatUnsubscribe();
    currentChatRoom=cu.email.replace(/[.@]/g,'_');
    liveChatUnsubscribe=db.collection('live_chat').where('room','==',currentChatRoom).onSnapshot(snapshot=>{
        const msgs=[];snapshot.forEach(doc=>msgs.push({id:doc.id,...doc.data()}));
        displayMessages(msgs);
    });
}

function displayMessages(msgs){
    const mc=document.getElementById('chatMessages');if(!mc)return;
    if(!msgs.length){mc.innerHTML='<div style="text-align:center;color:#94a3b8;">💬 No messages</div>';return;}
    msgs.sort((a,b)=>(a.localTime||0)-(b.localTime||0));
    mc.innerHTML=msgs.map(m=>{
        const isMe=m.uid===cu.id;
        return `<div class="${isMe?'chat-message-right':'chat-message-left'}"><div class="chat-bubble-text">${m.message}</div></div>`;
    }).join('');
    mc.scrollTop=mc.scrollHeight;
}

function sendLiveChat(){
    const input=document.getElementById('chatInput');const message=input.value.trim();
    if(!message||!cu)return;input.value='';
    db.collection('live_chat').add({room:currentChatRoom,uid:cu.id,email:cu.email,senderName:cu.email.split('@')[0],message:message,isAdmin:cu.isAdmin||false,createdAt:firebase.firestore.FieldValue.serverTimestamp(),localTime:Date.now()});
}
