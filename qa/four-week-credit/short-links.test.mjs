import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const decode=readFileSync(new URL('../../menu-link.js',import.meta.url),'utf8');
const pricing=readFileSync(new URL('../../pricing.js',import.meta.url),'utf8');
function resolve(pathname){
 const window={location:{pathname,search:''},atob:s=>Buffer.from(s,'base64').toString('binary'),btoa:s=>Buffer.from(s,'binary').toString('base64')};
 vm.runInNewContext(decode,{window});vm.runInNewContext(pricing,{window,URLSearchParams});return window;
}
for(const [code,city,campaign] of [['gCY0AB_QlN0GZA','DC','01fd094dd0664'],['hCY0CvciF2jtlA','SD','af7221768ed94']]){
 for(const prefix of ['/c/','/sd/c/']){
  const w=resolve(prefix+code);
  assert.equal(w.HAVN_MENU_MODE,'in');assert.equal(w.HAVN_MENU_CITY,city);
  assert.equal(w.HAVN_FOUR_WEEK.start,'2026-10-11');assert.equal(w.HAVN_FOUR_WEEK.week,1);
  assert.equal(w.HAVN_SHORT_MENU.campaign,campaign);assert.equal(w.HAVN_SHORT_MENU.kind,'menu_blast');
 }
}
for(let week=1;week<=4;week++){
 const bytes=Buffer.from('hCY0CvciF2jtlA','base64url');bytes[0]=0x84+(week-1);
 const w=resolve('/c/'+bytes.toString('base64url'));assert.equal(w.HAVN_FOUR_WEEK.week,week);
}
for(const path of ['/c/garbage','/c/AAAAAAAAAAAAAA','/c/hCY0CvciF2jtlB','/in','/welcome','/oct11/sd/in/100/2026-10-11/1']){
 const w=resolve(path);assert.equal(w.HAVN_SHORT_MENU,undefined,path);
}
assert.equal(resolve('/oct11/sd/in/100/2026-10-11/1').HAVN_FOUR_WEEK.week,1);
console.log('PASS compact contexts: DC/SD, shim prefix, four weeks, campaign/source, invalid codes and old-link compatibility');
