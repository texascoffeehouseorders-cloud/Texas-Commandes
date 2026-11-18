/* Rappels Ramaut.
   - Application Android : notifications programmées chaque jour à 15 h 00 et 15 h 30 (heure de Belgique),
     même application fermée. Il n'existe aucun réglage dans l'application pour les couper.
     Dès que la commande Ramaut du jour est envoyée, les rappels restants du jour sont annulés.
   - Version web ouverte : son + notification du navigateur au moment du rappel. */
import { Capacitor } from "@capacitor/core";
import { bxParts, pad } from "./core.js";

const SLOTS = [
  { h:15, m:0,  title:"Ramaut order to place 🔔", body:"Place the Ramaut order before 4 pm." },
  { h:15, m:30, title:"LAST REMINDER: place the Ramaut order now!", body:"Deadline: 4 pm." }
];
const DAYS_AHEAD = 10;

function isNative(){ try{ return Capacitor.isNativePlatform(); }catch(e){ return false; } }

// Date absolue correspondant à une heure de Bruxelles
function brusselsDate(y, mo, d, h, mi){
  let guess = Date.UTC(y, mo-1, d, h, mi);
  for(let i=0;i<3;i++){
    const p = bxParts(new Date(guess));
    const asUTC = Date.UTC(p.y, p.m-1, p.d, p.h, p.min);
    guess += Date.UTC(y, mo-1, d, h, mi) - asUTC;
  }
  return new Date(guess);
}

let LN = null;
async function plugin(){
  if(!isNative()) return null;
  if(!LN){ LN = (await import("@capacitor/local-notifications")).LocalNotifications; }
  return LN;
}

export async function setupNotifications(){
  const ln = await plugin(); if(!ln) return { native:false, granted:false };
  let perm = await ln.checkPermissions();
  if(perm.display !== "granted") perm = await ln.requestPermissions();
  try{
    await ln.createChannel({ id:"ramaut", name:"Rappels Ramaut", description:"Rappels de commande Ramaut (15 h et 15 h 30)",
      importance:5, visibility:1, vibration:true, lights:true, lightColor:"#d9822b" });
  }catch(e){}
  try{
    if(ln.checkExactNotificationSetting){
      const ex = await ln.checkExactNotificationSetting();
      if(ex && ex.exact_alarm && ex.exact_alarm !== "granted" && ln.changeExactNotificationSetting) await ln.changeExactNotificationSetting();
    }
  }catch(e){}
  return { native:true, granted: perm.display === "granted" };
}

let lastKey = "";
export async function scheduleRamautReminders(sentToday){
  const ln = await plugin(); if(!ln) return;
  const now = Date.now(), p = bxParts(new Date());
  const key = p.y+"-"+p.m+"-"+p.d+"-"+(sentToday?1:0);
  if(key === lastKey) return;            // rien n'a changé
  lastKey = key;
  try{
    const pending = await ln.getPending();
    const mine = (pending.notifications||[]).filter(n => n.extra && n.extra.kind === "ramaut");
    if(mine.length) await ln.cancel({ notifications: mine.map(n => ({ id:n.id })) });
  }catch(e){}
  const list = [];
  for(let i=0;i<DAYS_AHEAD;i++){
    if(i===0 && sentToday) continue;
    const base = new Date(Date.UTC(p.y, p.m-1, p.d + i));
    const y=base.getUTCFullYear(), mo=base.getUTCMonth()+1, d=base.getUTCDate();
    SLOTS.forEach((s, k) => {
      const at = brusselsDate(y, mo, d, s.h, s.m);
      if(at.getTime() <= now + 5000) return;
      list.push({ id: Number(String(y)+pad(mo)+pad(d)+k) % 2147483647, title:s.title, body:s.body, channelId:"ramaut",
        schedule:{ at, allowWhileIdle:true }, extra:{ kind:"ramaut" }, autoCancel:true });
    });
  }
  if(list.length) await ln.schedule({ notifications: list });
}

/* ---------- Version web : alerte sonore quand l'application est ouverte ---------- */
let audioCtx = null;
export function beep(){
  try{
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const t0 = audioCtx.currentTime;
    [0, 0.35, 0.7].forEach(dt => {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = "sine"; o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, t0+dt); g.gain.exponentialRampToValueAtTime(0.4, t0+dt+0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0+dt+0.28);
      o.connect(g); g.connect(audioCtx.destination); o.start(t0+dt); o.stop(t0+dt+0.3);
    });
  }catch(e){}
}
export function webNotify(title){
  if(isNative()) return;
  try{ if("Notification" in window && Notification.permission === "granted") new Notification(title, { icon:"icon-192.png" }); }catch(e){}
}
export function askWebNotificationPermission(){
  if(isNative()) return;
  try{ if("Notification" in window && Notification.permission === "default") Notification.requestPermission(); }catch(e){}
}
export { isNative };
