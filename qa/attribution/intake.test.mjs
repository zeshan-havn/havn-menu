import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source = readFileSync(new URL('../../intake.js', import.meta.url), 'utf8');
function page({search='', pathname='/welcome', cookie='', storage=new Map(), city='DC'}={}) {
  const sent=[];
  const document={cookie, readyState:'loading', addEventListener(){}};
  const window={location:{search,pathname}, HAVN_CONFIG:{CITY:city,OS_BASE_URL:'https://test.invalid',INTENTS:{order:'order'}},
    Promise, setTimeout, clearTimeout, fetch:async(url,options)=>{sent.push(JSON.parse(options.body));return {ok:true};}};
  vm.runInNewContext(source,{window,document,URLSearchParams,sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)}});
  return {window,document,sent,storage,send:()=>window.HAVN_INTAKE.registerClick('ABCDEF','order')};
}
for(const city of ['DC','SD']) {
  const paid=page({city,search:'?fbclid=first-click&meta_campaign_id=c1&meta_adset_id=s1&meta_ad_id=a1&meta_creative_id=r1'});
  await paid.send();
  const a=paid.sent[0];
  assert.match(a.fbc,/^fb\.1\.\d+\.first-click$/);
  assert.equal(a.meta_creative_id,'r1');assert.equal(a.city,city);
  await paid.send();assert.equal(paid.sent[1].fbc,a.fbc);
  const next=page({city,storage:paid.storage,pathname:'/welcome/quiz'});
  next.document.cookie='_fbp=fb.1.1791000000000.browser-late';
  await next.send();
  assert.equal(next.sent[0].fbc,a.fbc);assert.equal(next.sent[0].fbp,'fb.1.1791000000000.browser-late');
  assert.equal(next.sent[0].session_id,a.session_id);assert.equal(next.sent[0].touch_started_at,a.touch_started_at);
  assert.equal(next.sent[0].meta_ad_id,'a1');
  const newClick=page({city,storage:paid.storage,search:'?fbclid=second-click&meta_ad_id=a2',cookie:'_fbc='+a.fbc});
  await newClick.send();assert.match(newClick.sent[0].fbc,/\.second-click$/);assert.equal(newClick.sent[0].meta_campaign_id,'');
  const cookieOnly=page({city,cookie:'_fbc=fb.1.1791000000000.cookie-click'});await cookieOnly.send();
  assert.equal(cookieOnly.sent[0].fbc,'fb.1.1791000000000.cookie-click');
  const organic=page({city});await organic.send();assert.equal(organic.sent[0].fbc,'');
  const sms=page({city,pathname:city==='SD'?'/sd/welcome/sms/welcome/reminder_1':'/welcome/sms/welcome/reminder_1'});await sms.send();
  assert.equal(sms.sent[0].utm_source,'sms');assert.equal(sms.sent[0].fbc,'');
}
console.log('PASS both cities: stable click timestamp, late cookies, navigation, new campaign isolation, full Meta IDs, organic and SMS');
