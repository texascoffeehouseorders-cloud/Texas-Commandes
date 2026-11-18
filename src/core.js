
/* ===================== DONNÉES FIXES ===================== */
var CATS = [
 ["cafe","Café","Coffee"],["matcha","Matcha","Matcha"],["laits","Laits et crèmes","Milks and creams"],
 ["fromages","Fromages, beurre et œufs","Cheese, butter and eggs"],["viandes","Viandes et charcuterie","Meat and cold cuts"],
 ["poisson","Poisson","Fish"],["surgeles","Surgelés","Frozen"],["purees","Purées de fruits","Fruit purées"],
 ["fruitsleg","Fruits et légumes","Fruit and vegetables"],["boissons","Boissons","Drinks"],
 ["sirops","Sirops et toppings","Syrups and toppings"],["poudres","Poudres","Powders"],["thes","Thés","Teas"],
 ["patisserie","Pâtisserie et épicerie sucrée","Pastry and sweet groceries"],
 ["epicerie","Épicerie salée et conserves","Savoury groceries and tins"],["proteines","Protéines","Protein"],
 ["emballages","Emballages","Packaging"],["entretien","Entretien et hygiène","Cleaning and hygiene"],["autre","Autre","Other"]
];
var SUPPLIERS = [
 ["ramaut","Ramaut","Ramaut"],["maraicher","Maraîcher","Greengrocer (Maraîcher)"],
 ["sirops","Sirops, thés et poudres","Syrups, teas and powders"],["emballages","Emballages","Packaging"]
];
var UNITS = [["pcs","pcs"],["kg","kg"],["packs","packs"],["paquets","packs"],["bouteilles","bottles"],["barquettes","punnets"],
 ["caisses","crates"],["bottes","bunches"],["boîtes","boxes"],["pots","jars"],["sachets","bags"],["cartons","cartons"],["pièces","pieces"]];
var RAMAUT_CLIENT = "C07189";

/* ===================== OUTILS ===================== */
function norm(s){ return String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\u0153/g,"oe").replace(/\u00e6/g,"ae"); }
function fmtNum(n){ if(n==null) return "?"; var r=Math.round(n*100)/100; return String(r).replace(".",","); }
function parseNum(s){ if(s==null) return null; s=String(s).trim().replace(",","."); if(s==="") return null; var n=Number(s); return isFinite(n)?n:NaN; }
function catIndex(c){ for(var i=0;i<CATS.length;i++) if(CATS[i][0]===c) return i; return CATS.length-1; }
function bxParts(d){
  var f=new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Brussels",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"});
  var p={}; f.formatToParts(d||new Date()).forEach(function(x){p[x.type]=x.value;});
  return {y:+p.year,m:+p.month,d:+p.day,h:+p.hour%24,min:+p.minute};
}
function pad(n){ return (n<10?"0":"")+n; }
function dayKey(d){ var p=bxParts(d); return p.y+"-"+pad(p.m)+"-"+pad(p.d); }
function dayNum(d){ var p=bxParts(d); return Math.round(Date.UTC(p.y,p.m-1,p.d)/864e5); }
function tomorrowFR(d){ var p=bxParts(d); var t=new Date(Date.UTC(p.y,p.m-1,p.d+1)); return pad(t.getUTCDate())+"/"+pad(t.getUTCMonth()+1)+"/"+t.getUTCFullYear(); }
function isNotCounted(it){ return it.qty==null; }
function isLow(it){ return it.qty!=null && it.min!=null && it.min!=="" && it.qty<=it.min; }
function sortItems(a,b){ var c=catIndex(a.cat)-catIndex(b.cat); if(c) return c; return (a.ord||0)-(b.ord||0) || String(a.name).localeCompare(b.name,"fr"); }

/* ===================== MESSAGES DE COMMANDE (toujours en français) ===================== */
function orderLine(it,q){ return "- "+((it.orderName&&String(it.orderName).trim())||it.name)+" x"+fmtNum(q)+(it.unit&&it.unit!=="pcs"?" "+it.unit:""); }
function orderSubject(now){ return "Commande Texas Coffee House ("+RAMAUT_CLIENT+") pour le "+tomorrowFR(now); }
function orderMessage(lines){ // lines: [{it,q}]
  return "Bonjour,\n\nNous aimerions effectuer une commande pour demain :\n\n"+
    lines.map(function(l){return orderLine(l.it,l.q);}).join("\n")+
    "\n\nMerci,\nBonne journée,\nLe Savini (Texas Coffee House)";
}
function orderHasLines(o){ if(!o||!o.lines) return false; for(var k in o.lines) if(o.lines[k]>0) return true; return false; }

/* ===================== RAPPELS RAMAUT ===================== */
function ramautBanner(now, order){
  var p=bxParts(now), t=p.h*60+p.min;
  if(order && order.sent) return {cls:"ok",text:"Ramaut order sent today ✓"};
  if(t>=900 && t<930) return {cls:"warn",text:"Ramaut order to place 🔔"};
  if(t>=930 && t<960) return {cls:"urgent",text:"LAST REMINDER: place the Ramaut order now!"};
  if(t>=960 && orderHasLines(order)) return {cls:"late",text:"Ramaut deadline passed"};
  return null;
}

export {CATS,SUPPLIERS,UNITS,RAMAUT_CLIENT,norm,fmtNum,parseNum,catIndex,bxParts,pad,dayKey,dayNum,tomorrowFR,sortItems,orderLine,orderSubject,orderMessage,orderHasLines,ramautBanner};
