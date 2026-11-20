import "./style.css";
import { CATS,SUPPLIERS,UNITS,norm,fmtNum,parseNum,catIndex,bxParts,pad,dayKey,dayNum,sortItems,orderSubject,orderMessage,ramautBanner } from "./core.js";
import { isConfigured, initDb, onAuth, login, logout, seedIfEmpty, runMigrations } from "./db.js";
import { setupNotifications, scheduleRamautReminders, beep, webNotify, askWebNotificationPermission, isNative } from "./reminders.js";

/* ===================== TRADUCTIONS (interface uniquement) ===================== */
var T = {
 fr:{title:"Inventaire",order:"Commande",history:"Historique",search:"Rechercher un article ou une référence",
  prio:"★ Priorité",cart:"🛒 Dans la commande",all:"Tout",edit:"✏️ Modifier",done:"✓ Terminer",
  editBar:"Mode modification : touche un article pour le modifier ou le supprimer.",addItem:"+ Ajouter un article",
  seeOrder:"Voir la commande",items1:"article",itemsN:"articles",
  to:"Destinataire",subject:"Objet",message:"Message",copy:"Copier",close:"Fermer",markSent:"Commande envoyée ✓",
  copyMsg:"Copier le message",pasteHint:"Copie le message et colle-le dans WhatsApp ou SMS",
  copied:"Copié !",orderQty:"Quantité à commander",ok:"OK",cancel:"Annuler",
  save:"Enregistrer",del:"Supprimer",confirmDel:"Supprimer définitivement cet article ? Cette action est irréversible.",yesDel:"Oui, supprimer",
  newItem:"Nouvel article",editItem:"Modifier l'article",fName:"Nom en français (avec la marque)",fNameEn:"Nom en anglais (affiché en mode EN)",fOrderName:"Nom de commande (facultatif — sinon le nom est utilisé)",
  fCat:"Catégorie",fSup:"Fournisseur",fUnit:"Unité",fStep:"Pas d'incrément",fNote:"Note (référence Ramaut, précisions)",
  fPrio:"Prioritaire",emptyOrder:"Aucun article dans la commande.",noItems:"Aucun article ici.",noMatch:"Aucun article ne correspond.",
  loading:"Chargement des données partagées…",slow:"Connexion lente : les données ne sont pas encore à jour.",
  readOnly:"Accès refusé par la base de données : reconnecte-toi avec le compte du shop.",
  noDb:"Base de données injoignable. Vérifie la connexion Internet.",
  emailPh:"adresse e-mail de Ramaut",nameReq:"Le nom est obligatoire.",badNum:"Nombre invalide.",saved:"Enregistré",deleted:"Article supprimé",
  writeErr:"Échec de l'enregistrement. Réessayez.",noRight:"Pas d'autorisation pour modifier.",
  allSup:"Tous",today:"Aujourd'hui",yesterday:"Hier",sent:"Envoyée",sentAt:"envoyée à",nth:"n°",sentDone:"Commande envoyée et enregistrée dans l'historique",alreadyToday:"Déjà {n} commande(s) envoyée(s) aujourd'hui chez {s}. Celle-ci sera un complément (n°{m}).",frozen:"Commande envoyée : elle n'est plus modifiable.",complement:"complément",
  noHistory:"Aucune commande pour l'instant.",noHistoryDay:"Aucune commande envoyée ce jour-là.",pickDate:"Choisir une date",allDates:"Toutes les dates",logout:"Se déconnecter",confirmLogout:"Êtes-vous sûr de vouloir vous déconnecter ? Il faudra ressaisir l'e-mail et le mot de passe du shop pour revenir.",yesLogout:"Oui, me déconnecter",notifOff:"⚠️ Les notifications sont bloquées : les rappels Ramaut ne pourront pas sonner. Active-les dans Réglages Android → Applications → Inventaire → Notifications.",loginTitle:"Connexion du shop",email:"E-mail du compte du shop",password:"Mot de passe",signIn:"Se connecter",badLogin:"E-mail ou mot de passe incorrect.",noConfig:"Configuration Firebase manquante : remplis le fichier src/firebase-config.js (voir le guide d'installation).",seeding:"Premier démarrage : chargement des 215 articles…",removed:"(article supprimé)",orderOf:"Commande du",searchIn:"Résultats chez"},
 en:{title:"Inventory",order:"Order",history:"History",search:"Search an item or a reference",
  prio:"★ Priority",cart:"🛒 In the order",all:"All",edit:"✏️ Edit",done:"✓ Done",
  editBar:"Edit mode: tap an item to edit or delete it.",addItem:"+ Add an item",
  seeOrder:"See the order",items1:"item",itemsN:"items",
  to:"To",subject:"Subject",message:"Message",copy:"Copy",close:"Close",markSent:"Order sent ✓",
  copyMsg:"Copy the message",pasteHint:"Copy the message and paste it into WhatsApp or SMS",
  copied:"Copied!",orderQty:"Quantity to order",ok:"OK",cancel:"Cancel",
  save:"Save",del:"Delete",confirmDel:"Delete this item permanently? This cannot be undone.",yesDel:"Yes, delete",
  newItem:"New item",editItem:"Edit item",fName:"French name (with brand)",fNameEn:"English name (shown in EN mode)",fOrderName:"Order name (optional — otherwise the name is used)",
  fCat:"Category",fSup:"Supplier",fUnit:"Unit",fStep:"Increment step",fNote:"Note (Ramaut reference, details)",
  fPrio:"Priority",emptyOrder:"No items in the order.",noItems:"No items here.",noMatch:"No matching items.",
  loading:"Loading shared data…",slow:"Slow connection: data may not be up to date yet.",
  readOnly:"Access denied by the database: sign in again with the shop account.",
  noDb:"Database unreachable. Check the Internet connection.",
  emailPh:"Ramaut e-mail address",nameReq:"Name is required.",badNum:"Invalid number.",saved:"Saved",deleted:"Item deleted",
  writeErr:"Saving failed. Please try again.",noRight:"No permission to make changes.",
  allSup:"All",today:"Today",yesterday:"Yesterday",sent:"Sent",sentAt:"sent at",nth:"#",sentDone:"Order sent and saved in the history",alreadyToday:"{n} order(s) already sent today to {s}. This one will be an extra order (#{m}).",frozen:"Sent order: it can no longer be changed.",complement:"extra",
  noHistory:"No orders yet.",noHistoryDay:"No order sent on that day.",pickDate:"Pick a date",allDates:"All dates",logout:"Sign out",confirmLogout:"Are you sure you want to sign out? You will need the shop e-mail and password to sign back in.",yesLogout:"Yes, sign out",notifOff:"⚠️ Notifications are blocked: Ramaut reminders cannot ring. Turn them on in Android Settings → Apps → Inventaire → Notifications.",loginTitle:"Shop sign-in",email:"Shop account e-mail",password:"Password",signIn:"Sign in",badLogin:"Wrong e-mail or password.",noConfig:"Firebase configuration missing: fill in src/firebase-config.js (see the installation guide).",seeding:"First start: loading the 215 items…",removed:"(deleted item)",orderOf:"Order of",searchIn:"Results at"}
};

/* ===================== ÉTAT ===================== */
function lsGet(k,d){ try{ var v=localStorage.getItem("tch_"+k); return v==null?d:JSON.parse(v);}catch(e){return d;} }
function lsSet(k,v){ try{ localStorage.setItem("tch_"+k,JSON.stringify(v)); }catch(e){} }

var S = {
  lang: lsGet("lang","fr"), view: lsGet("view2","order"), edit:false,
  items:{}, drafts:{}, history:[], settings:{}, loaded:false, slow:false, dbOk:null, canWrite:true,
  sup: lsGet("orderSup","ramaut"), catBySup: lsGet("catBySup",{}), search:"", hSup:"", hDate:"", historyDay:[], notifOk:true,
  today: dayKey()
};
var DB=null;
var pendOrd={}, ordTimers={}, ordBusy={};

function t(k){ return (T[S.lang]||T.fr)[k] || T.fr[k] || k; }
function catName(c){ var i=catIndex(c); return S.lang==="en"?CATS[i][2]:CATS[i][1]; }
function supName(id){ for(var i=0;i<SUPPLIERS.length;i++) if(SUPPLIERS[i][0]===id) return S.lang==="en"?SUPPLIERS[i][2]:SUPPLIERS[i][1]; return id||""; }
function unitName(u){ if(S.lang!=="en") return u; for(var i=0;i<UNITS.length;i++) if(UNITS[i][0]===u) return UNITS[i][1]; return u; }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
function $(id){ return document.getElementById(id); }
function label(it){ return (S.lang==="en" && it.nameEn) ? it.nameEn : it.name; }
function nItems(n){ return n+" "+(n===1?t("items1"):t("itemsN")); }

function draft(sup){ return S.drafts[sup]; }
function orderQty(sup,id){ var p=pendOrd[sup]; if(p && id in p) return p[id]; var o=draft(sup); return (o&&o.lines&&o.lines[id])||0; }
function sentToday(sup){ return S.history.filter(function(h){ return h.supplier===sup && h.date===S.today; }); }
function linesFrom(lines){ // -> [{it,q}] triés
  var out=[]; Object.keys(lines||{}).forEach(function(id){ var q=lines[id]; if(!(q>0)) return; var it=S.items[id];
    out.push({it: it?Object.assign({id:id},it):{id:id,name:t("removed"),cat:"autre",unit:"pcs"}, q:q}); });
  return out.sort(function(a,b){return sortItems(a.it,b.it);});
}
function currentLines(sup){
  var l=Object.assign({}, (draft(sup)||{}).lines||{}, pendOrd[sup]||{});
  return linesFrom(l).filter(function(x){ return S.items[x.it.id]; });
}
function supItems(sup){ return Object.keys(S.items).map(function(id){ return Object.assign({id:id},S.items[id]); }).filter(function(it){ return it.supplier===sup; }).sort(sortItems); }
function currentCat(){ return S.catBySup[S.sup] || null; }

/* ===================== RENDU ===================== */
function renderChrome(){
  document.documentElement.lang=S.lang;
  document.body.classList.toggle("editing",S.edit && S.view==="order");
  $("tTitle").textContent=t("title");
  $("logoutBtn").title=t("logout"); $("logoutBtn").setAttribute("aria-label",t("logout"));
  $("langBtn").innerHTML = S.lang==="fr" ? "<b>FR</b> / EN" : "FR / <b>EN</b>";
  $("editBtn").textContent = S.edit ? t("done") : t("edit");
  $("editBtn").classList.toggle("editon",S.edit);
  $("editBtn").classList.toggle("hidden",S.view!=="order");
  $("tabOrder").textContent=t("order"); $("tabHistory").textContent=t("history");
  $("tabOrder").classList.toggle("on",S.view==="order"); $("tabHistory").classList.toggle("on",S.view==="history");
  $("editBox").innerHTML = (S.edit && S.view==="order") ? '<div class="editbar"><span>'+esc(t("editBar"))+'</span></div>' : "";
}
function renderBanner(){
  var o={sent: sentToday("ramaut").length>0, lines: Object.assign({},(draft("ramaut")||{}).lines||{},pendOrd.ramaut||{})}, b=ramautBanner(new Date(), o);
  if(b && b.cls==="ok" && lsGet("hideSent","")===S.today) b=null;
  $("bannerBox").innerHTML = b ? '<div class="banner '+b.cls+'">'+esc(b.text)+(b.cls==="ok"?'<button class="x" data-act="hideSent" aria-label="Fermer">×</button>':"")+'</div>' : "";
}
function renderNotice(){
  var msg="";
  if(S.dbOk===false) msg=t("noDb");
  else if(!S.loaded) msg=S.slow?t("slow"):t("loading");
  else if(S.slow) msg=t("slow");
  else if(!S.canWrite) msg=t("readOnly");
  else if(!S.notifOk) msg=t("notifOff");
  $("noticeBox").innerHTML = msg ? '<div class="notice">'+esc(msg)+'</div>' : "";
}
function renderBottom(){
  var bb=$("bottomBar");
  if(S.view!=="order"){ bb.innerHTML=""; return; }
  if(S.edit){ bb.innerHTML='<button class="bigbtn add" data-act="add">'+esc(t("addItem"))+'</button>'; return; }
  var n=currentLines(S.sup).length;
  bb.innerHTML='<button class="bigbtn" data-act="preview"><span>'+esc(t("seeOrder"))+'<span class="bsup"> · '+esc(supName(S.sup))+'</span></span><span>'+esc(nItems(n))+' →</span></button>';
}

function renderMain(){
  if(S.view==="order") renderOrder(); else renderHistory();
  renderBottom();
}

function renderOrder(){
  var m=$("main");
  if(!$("orderView")){
    m.innerHTML='<div id="orderView"><div class="sups" id="sups"></div>'+
      '<div class="search"><span class="ico">🔍</span><input id="q" type="search" autocomplete="off"><button class="clr hidden" id="qClr" aria-label="x">×</button></div>'+
      '<div class="layout"><nav class="cats" id="cats"></nav><section id="content"></section></div></div>';
  }
  $("q").placeholder=t("search"); if($("q").value!==S.search) $("q").value=S.search;
  $("qClr").classList.toggle("hidden",!S.search);
  $("sups").innerHTML=SUPPLIERS.map(function(s){ var n=currentLines(s[0]).length;
    return '<button class="sup'+(S.sup===s[0]?" on":"")+'" data-act="sup" data-s="'+s[0]+'">'+esc(supName(s[0]))+(n?'<span class="c">'+n+'</span>':"")+'</button>'; }).join("");
  renderOrderBody();
}

function renderOrderBody(){
  if(!$("cats")) return;
  var items=supItems(S.sup), nCart=currentLines(S.sup).length;
  // liste des catégories de ce fournisseur
  var counts={}, nPrio=0;
  items.forEach(function(it){ counts[it.cat]=(counts[it.cat]||0)+1; if(it.prio) nPrio++; });
  var entries=[];
  entries.push({k:"_cart",label:t("cart"),n:nCart,cls:"cart"});
  if(nPrio) entries.push({k:"_prio",label:t("prio"),n:nPrio});
  CATS.forEach(function(c){ if(counts[c[0]]) entries.push({k:c[0],label:catName(c[0]),n:counts[c[0]]}); });
  Object.keys(counts).forEach(function(k){ if(!CATS.some(function(c){return c[0]===k;})) entries.push({k:k,label:k,n:counts[k]}); });
  var cur=currentCat();
  if(!cur || !entries.some(function(e){return e.k===cur;})) cur = nPrio ? "_prio" : (entries[1]?entries[1].k:"_cart");
  var searching=!!S.search.trim();
  $("cats").innerHTML=entries.map(function(e){
    return '<button class="cat'+(e.cls?" "+e.cls:"")+(!searching&&e.k===cur?" on":"")+'" data-act="cat" data-k="'+esc(e.k)+'"><span>'+esc(e.label)+'</span><span class="n">'+e.n+'</span></button>'; }).join("");

  var list, title;
  if(searching){
    list=items.filter(function(it){ return matches(it,S.search); });
    title=t("searchIn")+" "+supName(S.sup);
  } else if(cur==="_cart"){
    list=items.filter(function(it){ return orderQty(S.sup,it.id)>0; }); title=t("cart");
  } else if(cur==="_prio"){
    list=items.filter(function(it){ return it.prio; }); title=t("prio");
  } else {
    list=items.filter(function(it){ return it.cat===cur; }); title=catName(cur);
  }
  var box=$("content");
  if(!S.loaded && !list.length){ box.innerHTML=""; return; }
  box.innerHTML='<div class="ctitle">'+esc(title)+' <small>'+list.length+'</small></div>'+
    (list.length ? '<div class="grid">'+list.map(tileHtml).join("")+'</div>'
                 : '<div class="empty">'+esc(searching?t("noMatch"):cur==="_cart"?t("emptyOrder"):t("noItems"))+'</div>');
}
function matches(it,q){ var n=norm(q.trim()); return norm(it.name).indexOf(n)>=0 || norm(it.nameEn).indexOf(n)>=0 || norm(it.orderName).indexOf(n)>=0 || norm(it.note).indexOf(n)>=0; }
function tileHtml(it){
  var q=orderQty(S.sup,it.id);
  return '<div class="tile'+(q>0?" in":"")+'" data-id="'+esc(it.id)+'" data-act="tile">'+
    '<div class="nm">'+(it.prio?'<span class="st">★</span>':"")+esc(label(it))+'</div>'+
    ((S.lang==="en" && it.nameEn)?'<div class="fr">🇫🇷 '+esc(it.name)+'</div>':"")+
    '<div class="note">'+esc(it.note||"")+'</div>'+
    '<div class="edithint">✏️ '+esc(t("editItem"))+'</div>'+
    '<div class="ctrl"><button class="qb" data-act="dec" aria-label="−">−</button>'+
      '<button class="qv" data-act="qty"><span class="v">'+fmtNum(q)+'</span><span class="u">'+esc(unitName(it.unit))+'</span></button>'+
      '<button class="qb plus" data-act="inc" aria-label="+">+</button></div>'+
  '</div>';
}

/* ----- historique ----- */
function dayLabel(key){
  if(key===S.today) return t("today");
  var y=new Date(Date.UTC(+key.slice(0,4),+key.slice(5,7)-1,+key.slice(8,10)));
  var d=dayNum(new Date())-Math.round(y/864e5);
  var s=new Intl.DateTimeFormat(S.lang==="en"?"en-GB":"fr-BE",{weekday:"long",day:"numeric",month:"long",year:"numeric",timeZone:"UTC"}).format(y);
  s=s.charAt(0).toUpperCase()+s.slice(1);
  return d===1 ? t("yesterday")+" · "+s : s;
}
function historyList(){
  var src = S.hDate ? S.historyDay : S.history;
  return src.filter(function(h){ return !S.hSup || h.supplier===S.hSup; }).sort(function(a,b){ return (b.sentAt||0)-(a.sentAt||0); });
}
var unsubDay=null;
function setHistoryDate(d){
  S.hDate=d||""; S.historyDay=[];
  if(unsubDay){ unsubDay(); unsubDay=null; }
  if(S.hDate && DB){
    // requête sur la date choisie (fonctionne aussi pour les commandes très anciennes)
    unsubDay=DB.collection("history").where("date","==",S.hDate).onSnapshot(function(snap){
      S.historyDay=snap.docs.map(function(x){ return Object.assign({_id:x.id},x.data()); }); if(S.view==="history") renderHistory();
    }, function(e){ console.error(e); });
  }
  renderHistory();
}
function supIndex(s){ for(var i=0;i<SUPPLIERS.length;i++) if(SUPPLIERS[i][0]===s) return i; return 9; }
function hTime(h){ var p=bxParts(new Date(h.sentAt||0)); return pad(p.h)+":"+pad(p.min); }
function renderHistory(){
  var m=$("main"), list=historyList(), html="";
  html+='<div class="hfilters">'+[["",t("allSup")]].concat(SUPPLIERS.map(function(s){return [s[0],supName(s[0])];})).map(function(f){
    return '<button class="cat'+(S.hSup===f[0]?" on":"")+'" data-act="hsup" data-s="'+f[0]+'">'+esc(f[1])+'</button>'; }).join("")+'</div>';
  html+='<div class="hdate"><label class="datebox"><span>📅</span><input type="date" id="hDate" max="'+S.today+'" value="'+esc(S.hDate)+'" aria-label="'+esc(t("pickDate"))+'"></label>'+
    (S.hDate?'<button class="cat on" data-act="hdateclear">'+esc(dayLabel(S.hDate))+'  ×</button>':'<span class="hint" style="margin:0">'+esc(t("pickDate"))+'</span>')+'</div>';
  if(!list.length) html+='<div class="empty">'+esc(S.loaded?(S.hDate?t("noHistoryDay"):t("noHistory")):"")+'</div>';
  var lastDay=null;
  list.forEach(function(h){
    if(!S.hDate && h.date!==lastDay){ html+='<div class="hday">'+esc(dayLabel(h.date))+'</div>'; lastDay=h.date; }
    var ls=h.lines||[], sumTxt=ls.slice(0,4).map(function(l){ return ((S.lang==="en"&&l.en)?l.en:l.n)+" x"+fmtNum(l.q); }).join(" · ")+(ls.length>4?" …":"");
    html+='<button class="hcard" data-act="hopen" data-o="'+esc(h._id)+'"><div class="grow"><div class="who">'+esc(supName(h.supplier))+(h.nth>1?' · '+esc(t("nth"))+h.nth:"")+' · '+esc(nItems(ls.length))+'</div><div class="sum">'+esc(sumTxt)+'</div></div>'+
      '<span class="tag sent">✓ '+esc(t("sentAt"))+' '+hTime(h)+'</span></button>';
  });
  m.innerHTML=html;
}

function renderAll(){ renderChrome(); renderBanner(); renderNotice(); renderMain(); }
function refresh(){ // après une modification de données
  if(S.view==="order"){ if($("sups")) renderOrder(); } else renderHistory();
  renderBottom(); renderBanner();
}

/* ===================== TOAST ===================== */
var toastT=null;
function toast(msg){ $("toastBox").innerHTML='<div class="toast">'+esc(msg)+'</div>'; clearTimeout(toastT); toastT=setTimeout(function(){$("toastBox").innerHTML="";},2200); }

/* ===================== ÉCRITURES ===================== */
function handleWriteErr(e){
  console.error(e);
  if(e && e.code==="invalid_argument"){ S.canWrite=false; renderNotice(); toast(t("noRight")); }
  else if(e && e.code==="quota_exceeded") toast(e.message||t("writeErr"));
  else toast(t("writeErr"));
}
function guardWrite(){ if(!DB){ toast(t("noDb")); return false; } if(!S.canWrite){ toast(t("noRight")); return false; } return true; }

function setOrder(sup,id,val,immediate){
  if(!guardWrite()) return;
  val=Math.max(0,Math.round(val*100)/100);
  (pendOrd[sup]=pendOrd[sup]||{})[id]=val; refresh();
  clearTimeout(ordTimers[sup]);
  ordTimers[sup]=setTimeout(function(){ flushOrder(sup); }, immediate?0:700);
}
function flushOrder(sup){
  var p=pendOrd[sup]; if(!p||!Object.keys(p).length) return Promise.resolve();
  if(ordBusy[sup]) return new Promise(function(r){ ordTimers[sup]=setTimeout(function(){ flushOrder(sup).then(r); },300); });
  var snap=Object.assign({},p), ref=DB.doc("drafts/"+sup), cur=draft(sup);
  ordBusy[sup]=true;
  var w = cur ? ref.update({lines:snap}) : ref.set({supplier:sup,lines:snap});
  return w.catch(function(e){
    if(cur && e && e.code==="invalid_argument") return ref.set({supplier:sup,lines:Object.assign({},cur.lines||{},snap)});
    throw e;
  }).then(function(){
    var pp=pendOrd[sup]; if(pp) Object.keys(snap).forEach(function(k){ if(pp[k]===snap[k]) delete pp[k]; });
  }).catch(function(e){ delete pendOrd[sup]; handleWriteErr(e); }).then(function(){ ordBusy[sup]=false; refresh(); });
}
/* Envoi : la commande est copiée telle quelle (noms, quantités, message) dans l'historique,
   puis les articles envoyés sont retirés de la commande en cours. L'historique n'est jamais modifié ensuite. */
function markSent(sup,subject,msg){
  if(!guardWrite()) return null;
  clearTimeout(ordTimers[sup]);
  var sentLines;
  return flushOrder(sup).then(function(){
    var lines=currentLines(sup); if(!lines.length) throw {code:"empty"};
    sentLines={}; lines.forEach(function(l){ sentLines[l.it.id]=l.q; });
    var nth=sentToday(sup).length+1, now=Date.now();
    var doc={ supplier:sup, date:S.today, sentAt:now, nth:nth, subject: sup==="ramaut"?subject:"", to: sup==="ramaut"?(S.settings.ramautEmail||""):"", msg:msg,
      lines: lines.map(function(l){ return {id:l.it.id, n:((l.it.orderName&&String(l.it.orderName).trim())||l.it.name), name:l.it.name, en:l.it.nameEn||"", q:l.q, u:l.it.unit||"pcs"}; }) };
    return DB.collection("history").doc(sup+"_"+S.today+"_"+now.toString(36)).set(doc);
  }).then(function(){
    // vider la commande en cours (on garde seulement ce qui aurait été ajouté entre-temps)
    var curL=Object.assign({},(draft(sup)||{}).lines||{}), rest={};
    Object.keys(curL).forEach(function(k){ if(curL[k]>0 && curL[k]!==sentLines[k]) rest[k]=curL[k]; });
    return DB.doc("drafts/"+sup).set({supplier:sup,lines:rest});
  }).then(function(){ toast(t("sentDone")); }).catch(function(e){ if(e&&e.code==="empty"){ toast(t("emptyOrder")); throw e; } handleWriteErr(e); throw e; });
}

/* ===================== DIALOGUES ===================== */
function closeDlg(){ $("dlgBox").innerHTML=""; }
function openDlg(html){ $("dlgBox").innerHTML='<div class="ov" data-act="ovclose">'+html+'</div>'; }

function qtyDialog(id){
  var it=S.items[id]; if(!it) return;
  var cur=orderQty(S.sup,id);
  openDlg('<div class="dlg sm" role="dialog"><div class="dh">'+esc(t("orderQty"))+'</div><div class="db">'+
    '<p class="hint"><b>'+esc(label(it))+'</b>'+((S.lang==="en"&&it.nameEn)?'<br>🇫🇷 '+esc(it.name):"")+'</p>'+
    '<input class="bigin" id="qIn" type="text" inputmode="decimal" autocomplete="off" value="'+(cur?fmtNum(cur):"")+'">'+
    '<p class="hint" style="text-align:center;margin-top:8px">'+esc(unitName(it.unit))+'</p>'+
    '<div id="qErr" class="hint" style="color:var(--red)"></div>'+
    '</div><div class="df"><button class="btn sec" data-act="close">'+esc(t("cancel"))+'</button><button class="btn pri" id="qOk">'+esc(t("ok"))+'</button></div></div>');
  var inp=$("qIn"); setTimeout(function(){ inp.focus(); inp.select(); },50);
  function ok(){ var v=parseNum(inp.value); if(v!==null&&(isNaN(v)||v<0)){ $("qErr").textContent=t("badNum"); return; } closeDlg(); setOrder(S.sup,id,v||0,true); }
  $("qOk").onclick=ok; inp.onkeydown=function(e){ if(e.key==="Enter"){ e.preventDefault(); ok(); } };
}

function itemForm(id){
  var it = id ? S.items[id] : null;
  var cc=currentCat();
  var defSup = it ? it.supplier : S.sup;
  var defCat = it ? it.cat : (cc && cc.charAt(0)!=="_" ? cc : ({maraicher:"fruitsleg",sirops:"sirops",emballages:"emballages"}[defSup]||"autre"));
  var unit = it ? it.unit : "pcs", step = it ? (it.step||1) : 1;
  var supOpts=SUPPLIERS.map(function(s){return '<button type="button" data-v="'+s[0]+'" class="'+(s[0]===defSup?"on":"")+'">'+esc(supName(s[0]))+'</button>';}).join("");
  var catOpts=CATS.map(function(c){return '<option value="'+c[0]+'"'+(c[0]===defCat?" selected":"")+'>'+esc(catName(c[0]))+'</option>';}).join("");
  var unitOpts=UNITS.map(function(u){return '<option value="'+esc(u[0])+'"'+(u[0]===unit?" selected":"")+'>'+esc(S.lang==="en"?u[1]+(u[1]!==u[0]?" ("+u[0]+")":""):u[0])+'</option>';}).join("");
  if(!UNITS.some(function(u){return u[0]===unit;})) unitOpts+='<option value="'+esc(unit)+'" selected>'+esc(unit)+'</option>';
  openDlg('<div class="dlg" role="dialog"><div class="dh">'+esc(it?t("editItem"):t("newItem"))+'</div><div class="db">'+
    '<div class="field"><label>'+esc(t("fSup"))+'</label><div class="seg" id="fSup">'+supOpts+'</div></div>'+
    '<div class="field"><label>'+esc(t("fName"))+'</label><input id="fName" value="'+esc(it?it.name:"")+'" autocomplete="off"></div>'+
    '<div class="field"><label>'+esc(t("fNameEn"))+'</label><input id="fNameEn" value="'+esc(it?it.nameEn:"")+'" autocomplete="off"></div>'+
    '<div class="field"><label>'+esc(t("fOrderName"))+'</label><input id="fOrder" value="'+esc(it?it.orderName:"")+'" autocomplete="off"></div>'+
    '<div class="field"><label>'+esc(t("fNote"))+'</label><input id="fNote" value="'+esc(it?it.note:"")+'" autocomplete="off"></div>'+
    '<div class="row2"><div class="field"><label>'+esc(t("fCat"))+'</label><select id="fCat">'+catOpts+'</select></div>'+
    '<div class="field"><label>'+esc(t("fUnit"))+'</label><select id="fUnit">'+unitOpts+'</select></div></div>'+
    '<div class="field"><label>'+esc(t("fStep"))+'</label><div class="seg" id="fStep"><button type="button" data-v="1" class="'+(step!==0.5?"on":"")+'">1</button><button type="button" data-v="0.5" class="'+(step===0.5?"on":"")+'">0,5</button></div></div>'+
    '<label class="chk"><input type="checkbox" id="fPrio"'+(it&&it.prio?" checked":"")+'> ★ '+esc(t("fPrio"))+'</label>'+
    '<div id="fErr" class="hint" style="color:var(--red)"></div>'+
    '</div><div class="df">'+(it?'<button class="btn danger" id="fDel" style="margin-right:auto">'+esc(t("del"))+'</button>':"")+
    '<button class="btn sec" data-act="close">'+esc(t("cancel"))+'</button><button class="btn pri" id="fSave">'+esc(t("save"))+'</button></div></div>');
  if(!it) setTimeout(function(){ $("fName").focus(); },50);
  var touchedCat=!!it;
  $("fCat").onchange=function(){ touchedCat=true; };
  function segClick(el,cb){ el.onclick=function(e){ var b=e.target.closest("button"); if(!b) return; [].forEach.call(el.children,function(x){x.classList.toggle("on",x===b);}); if(cb) cb(b.dataset.v); }; }
  segClick($("fSup"),function(v){ if(!touchedCat){ var c={maraicher:"fruitsleg",sirops:"sirops",emballages:"emballages"}[v]; if(c) $("fCat").value=c; } });
  segClick($("fStep"));
  function segVal(el,d){ var b=el.querySelector(".on"); return b?b.dataset.v:d; }
  $("fSave").onclick=function(){
    if(!guardWrite()) return;
    var name=$("fName").value.trim(); if(!name){ $("fErr").textContent=t("nameReq"); return; }
    var data={ name:name, nameEn:$("fNameEn").value.trim(), orderName:$("fOrder").value.trim(), cat:$("fCat").value, supplier:segVal($("fSup"),defSup), unit:$("fUnit").value,
      step:Number(segVal($("fStep"),1)), note:$("fNote").value.trim(), prio:$("fPrio").checked };
    var btn=this; btn.disabled=true; var p;
    if(it){ p=DB.doc("items/"+id).update(data); } // update : ne touche jamais aux autres champs
    else {
      var maxOrd=0; Object.keys(S.items).forEach(function(k){ maxOrd=Math.max(maxOrd,S.items[k].ord||0); });
      data.ord=maxOrd+1;
      p=DB.collection("items").doc("n"+Date.now().toString(36)+Math.random().toString(36).slice(2,6)).set(data);
    }
    p.then(function(){ closeDlg(); toast(t("saved")); }).catch(function(e){ btn.disabled=false; handleWriteErr(e); });
  };
  if(it) $("fDel").onclick=function(){
    var b=this; if(!b.dataset.armed){ b.dataset.armed="1"; $("fErr").textContent=t("confirmDel"); b.textContent=t("yesDel"); return; }
    if(!guardWrite()) return; b.disabled=true;
    DB.doc("items/"+id).delete().then(function(){ closeDlg(); toast(t("deleted")); }).catch(function(e){ b.disabled=false; handleWriteErr(e); });
  };
}

function copyText(text, ta){
  function fallback(){ try{ var el=ta; if(!el){ el=document.createElement("textarea"); el.value=text; el.style.position="fixed"; el.style.opacity="0"; document.body.appendChild(el); }
    el.removeAttribute("readonly"); el.select(); el.setSelectionRange(0,text.length); var ok=document.execCommand("copy"); el.setAttribute("readonly",""); if(!ta) el.remove(); return ok; }catch(e){ return false; } }
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(function(){ toast(t("copied")); }, function(){ if(fallback()) toast(t("copied")); });
  } else if(fallback()) toast(t("copied"));
}

function messageDialog(opts){ // {title, sup, subject, msg, live, empty, note, frozen}
  var isR=opts.sup==="ramaut";
  var body = (opts.note?'<div class="tip">'+esc(opts.note)+'</div>':"")+(opts.frozen?'<div class="tip">🔒 '+esc(t("frozen"))+'</div>':"");
  if(isR) body+='<div class="field"><label>'+esc(t("to"))+'</label>'+(opts.live?'<input id="pTo" type="email" placeholder="'+esc(t("emailPh"))+'" value="'+esc(S.settings.ramautEmail||"")+'">':'<div class="ro">'+esc(opts.to||"—")+'</div>')+'</div>'+
      '<div class="field"><label>'+esc(t("subject"))+'</label><div class="ro">'+esc(opts.subject)+'</div></div>';
  else if(opts.live) body+='<div class="tip">'+esc(t("pasteHint"))+'</div>';
  var foot='<button class="btn sec" data-act="close">'+esc(t("close"))+'</button><button class="btn '+(opts.live?"sec":"pri")+'" id="pCopy">'+esc(isR?t("copy"):t("copyMsg"))+'</button>';
  if(opts.live) foot+='<button class="btn ok" id="pSent"'+(opts.empty?" disabled":"")+'>'+esc(t("markSent"))+'</button>';
  openDlg('<div class="dlg" role="dialog"><div class="dh">'+esc(opts.title)+'</div><div class="db">'+body+
    (opts.empty?'<p class="hint">'+esc(t("emptyOrder"))+'</p>':"")+
    '<div class="field"><label>'+esc(t("message"))+'</label><textarea id="pMsg" readonly>'+esc(opts.msg)+'</textarea></div>'+
    '</div><div class="df">'+foot+'</div></div>');
  $("pCopy").onclick=function(){ copyText(isR ? (t("to")+" : "+(opts.live?(S.settings.ramautEmail||""):(opts.to||""))+"\n"+t("subject")+" : "+opts.subject+"\n\n"+opts.msg) : opts.msg, isR?null:$("pMsg")); };
  if($("pTo")) $("pTo").onchange=function(){ var v=this.value.trim(); if(v===(S.settings.ramautEmail||"")) return; if(!guardWrite()) return;
      DB.doc("settings/main").set(Object.assign({},S.settings,{ramautEmail:v})).then(function(){toast(t("saved"));}).catch(handleWriteErr); };
  if($("pSent")) $("pSent").onclick=function(){ var b=this; b.disabled=true; var r=markSent(opts.sup,opts.subject,opts.msg);
      if(r) r.then(function(){ closeDlg(); }, function(){ b.disabled=false; }); else b.disabled=false; };
}
function previewDialog(){
  var sup=S.sup, lines=currentLines(sup), done=sentToday(sup).length;
  var subject=orderSubject(new Date())+(done&&sup==="ramaut"?" – "+t("complement"):"");
  var note=done ? t("alreadyToday").replace("{n}",done).replace("{s}",supName(sup)).replace("{m}",done+1) : "";
  messageDialog({title:t("order")+" · "+supName(sup), sup:sup, subject:subject, msg:orderMessage(lines), live:true, empty:!lines.length, note:note});
}
function historyDialog(hid){
  var h=S.history.concat(S.historyDay).filter(function(x){return x._id===hid;})[0]; if(!h) return;
  messageDialog({title:supName(h.supplier)+(h.nth>1?" "+t("nth")+h.nth:"")+" · "+dayLabel(h.date)+" · "+hTime(h), sup:h.supplier, subject:h.subject||"", msg:h.msg||"", to:h.to||"", live:false, frozen:true});
}

function logoutDialog(){
  openDlg('<div class="dlg sm" role="dialog"><div class="dh">'+esc(t("logout"))+'</div><div class="db"><p style="margin:0;font-weight:700">'+esc(t("confirmLogout"))+'</p></div>'+
    '<div class="df"><button class="btn sec" data-act="close">'+esc(t("cancel"))+'</button><button class="btn danger" id="doLogout">'+esc(t("yesLogout"))+'</button></div></div>');
  $("doLogout").onclick=function(){ this.disabled=true; flushAll(); logout().then(function(){ location.reload(); }).catch(function(){ location.reload(); }); };
}

/* ===================== ÉVÉNEMENTS ===================== */
document.addEventListener("click",function(e){
  var el=e.target.closest("[data-act]"); if(!el) return;
  var act=el.dataset.act, tile=el.closest(".tile"), id=tile&&tile.dataset.id;
  if(S.edit && tile){ itemForm(id); return; }       // mode modification : toucher = modifier
  switch(act){
    case "ovclose": if(e.target===el) closeDlg(); break;
    case "close": closeDlg(); break;
    case "hideSent": lsSet("hideSent",S.today); renderBanner(); break;
    case "sup": S.sup=el.dataset.s; lsSet("orderSup",S.sup); S.search=""; renderOrder(); renderBottom(); window.scrollTo(0,0); break;
    case "cat": S.catBySup[S.sup]=el.dataset.k; lsSet("catBySup",S.catBySup); if(S.search){ S.search=""; $("q").value=""; $("qClr").classList.add("hidden"); } renderOrderBody(); if(window.innerWidth<900) window.scrollTo({top:0}); break;
    case "hsup": S.hSup=el.dataset.s; renderHistory(); break;
    case "hdateclear": setHistoryDate(""); break;
    case "logout": logoutDialog(); break;
    case "hopen": historyDialog(el.dataset.o); break;
    case "add": itemForm(null); break;
    case "preview": previewDialog(); break;
    case "inc": { var a=S.items[id]; setOrder(S.sup,id,orderQty(S.sup,id)+(a.step||1)); break; }
    case "dec": { var b=S.items[id]; setOrder(S.sup,id,Math.max(0,orderQty(S.sup,id)-(b.step||1))); break; }
    case "qty": qtyDialog(id); break;
  }
});
document.addEventListener("change",function(e){ if(e.target.id==="hDate") setHistoryDate(e.target.value); });
document.addEventListener("input",function(e){
  if(e.target.id==="q"){ S.search=e.target.value; $("qClr").classList.toggle("hidden",!S.search); renderOrderBody(); }
});
document.addEventListener("click",function(e){
  if(e.target.id==="qClr"){ S.search=""; $("q").value=""; $("qClr").classList.add("hidden"); renderOrderBody(); $("q").focus(); }
});
$("editBtn").onclick=function(){ S.edit=!S.edit; renderChrome(); renderBottom(); };
$("langBtn").onclick=function(){ S.lang=S.lang==="fr"?"en":"fr"; lsSet("lang",S.lang); renderAll(); };
[].forEach.call(document.querySelectorAll(".tab"),function(b){ b.onclick=function(){ S.view=b.dataset.view; lsSet("view2",S.view); if(S.view!=="order") S.edit=false; $("main").innerHTML=""; renderAll(); window.scrollTo(0,0); }; });
document.addEventListener("keydown",function(e){ if(e.key==="Escape") closeDlg(); });
function flushAll(){ Object.keys(pendOrd).forEach(function(s){ clearTimeout(ordTimers[s]); flushOrder(s); }); }
window.addEventListener("beforeunload",flushAll);
document.addEventListener("visibilitychange",function(){ if(document.hidden) flushAll(); });

/* ===================== HORLOGE ===================== */
var alerted=lsGet("alerted","");
function tick(){
  var k=dayKey(); if(k!==S.today){ S.today=k; renderAll(); } else renderBanner();
  var sent=sentToday("ramaut").length>0;
  var b=ramautBanner(new Date(),{sent:sent,lines:{}});
  if(b && (b.cls==="warn"||b.cls==="urgent")){
    var key=S.today+"_"+b.cls;
    if(alerted!==key){ alerted=key; lsSet("alerted",key); beep(); webNotify(b.text); }
  }
  if(S.loaded) scheduleRamautReminders(sent).catch(function(){});
}
setInterval(tick, 20000);
document.addEventListener("visibilitychange",function(){ if(!document.hidden) tick(); });

/* ===================== SYNCHRONISATION ===================== */
function startSync(){
  var timer=setTimeout(function(){ S.slow=true; renderNotice(); },10000);
  DB.collection("items").onSnapshot(function(snap){
    var m={}; snap.docs.forEach(function(d){ var v=d.data(); if(v&&v.name) m[d.id]=v; });
    S.items=m;
    if(!snap.metadata.fromCache){ S.loaded=true; S.slow=false; clearTimeout(timer); }
    else if(snap.size) S.loaded=true;
    renderNotice(); refresh();
  }, function(e){ clearTimeout(timer); S.loaded=true; S.slow=true; renderNotice(); console.error(e); });
  DB.collection("drafts").onSnapshot(function(snap){
    var o={}; snap.docs.forEach(function(d){ var v=d.data(); if(v) o[d.id]=v; });
    S.drafts=o; refresh();
  }, function(e){ console.error(e); });
  DB.collection("history").orderBy("sentAt","desc").limit(1000).onSnapshot(function(snap){
    S.history=snap.docs.map(function(d){ return Object.assign({_id:d.id},d.data()); }).filter(function(h){ return h.supplier && h.date; });
    refresh(); tick();
  }, function(e){ console.error(e); });
  DB.doc("settings/main").onSnapshot(function(d){ S.settings=(d.exists&&d.data())||{}; }, function(){});
}

/* ===================== DÉMARRAGE ===================== */
function showGate(html){ $("gate").innerHTML=html; $("gate").classList.remove("hidden"); $("app").classList.add("hidden"); }
function hideGate(){ $("gate").classList.add("hidden"); $("app").classList.remove("hidden"); }
function loginScreen(err){
  showGate('<div class="gatebox"><div class="glogo">☕</div><h1>Texas Coffee House</h1><p class="hint" style="text-align:center">'+esc(t("loginTitle"))+'</p>'+
    '<form id="loginForm"><div class="field"><label>'+esc(t("email"))+'</label><input id="lEmail" type="email" autocomplete="username" required></div>'+
    '<div class="field"><label>'+esc(t("password"))+'</label><input id="lPass" type="password" autocomplete="current-password" required></div>'+
    '<div class="hint" style="color:var(--red)">'+esc(err||"")+'</div>'+
    '<button class="btn pri" style="width:100%" type="submit">'+esc(t("signIn"))+'</button></form>'+
    '<div style="text-align:center;margin-top:16px"><button class="hbtn dark" id="gLang">'+(S.lang==="fr"?"<b>FR</b> / EN":"FR / <b>EN</b>")+'</button></div></div>');
  $("gLang").onclick=function(){ S.lang=S.lang==="fr"?"en":"fr"; lsSet("lang",S.lang); loginScreen(); };
  $("loginForm").onsubmit=function(e){ e.preventDefault(); var b=this.querySelector("button[type=submit]"); b.disabled=true;
    login($("lEmail").value,$("lPass").value).catch(function(){ loginScreen(t("badLogin")); }); };
}
var synced=false;
async function afterLogin(){
  hideGate(); renderAll();
  if(synced) return; synced=true;
  try{ S.dbOk=true; await seedIfEmpty(); }catch(e){ console.error(e); }
  try{ await runMigrations(); }catch(e){ console.error(e); }
  startSync();
  setupNotifications().then(function(r){ if(r.native){ S.notifOk=r.granted; renderNotice(); } }).catch(function(){});
  askWebNotificationPermission();
}
(async function boot(){
  if(window.__MOCK_DB){ DB=window.__MOCK_DB; S.dbOk=true; hideGate(); renderAll(); startSync(); return; }
  if(!isConfigured()){ showGate('<div class="gatebox"><div class="glogo">☕</div><h1>Texas Coffee House</h1><p class="notice" style="margin:0">'+esc(t("noConfig"))+'</p></div>'); return; }
  try{ DB=await initDb(); }catch(e){ console.error(e); showGate('<div class="gatebox"><p class="notice">'+esc(t("noDb"))+'</p></div>'); return; }
  onAuth(function(user){ if(user) afterLogin(); else { synced=false; loginScreen(); } });
})();
