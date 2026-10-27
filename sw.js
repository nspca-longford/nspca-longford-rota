// Network first, so staff always get the newest rota; falls back to the last copy when offline.
const C='rota-v4';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
  e.respondWith(fetch(e.request).then(r=>{const k=r.clone();caches.open(C).then(c=>c.put(e.request,k));return r})
    .catch(()=>caches.match(e.request)));
});

self.addEventListener('push',e=>{
  let d={};try{d=e.data?e.data.json():{}}catch(x){d={body:e.data?e.data.text():''}}
  e.waitUntil(self.registration.showNotification(d.title||'NSPCA Longford Rota',{
    body:d.body||'The rota has changed.',icon:'icon-192.png',badge:'badge.png',vibrate:[200,100,200],tag:d.tag||'rota',renotify:true,data:{url:'./'}}));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
    for(const c of list){if('focus' in c){c.navigate?c.navigate('./'):null;return c.focus()}}
    return self.clients.openWindow('./');
  }));
});
