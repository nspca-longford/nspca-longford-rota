// Network first, so staff always get the newest rota; falls back to the last copy when offline.
const C='rota-v7';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
  e.respondWith(fetch(e.request).then(r=>{const k=r.clone();caches.open(C).then(c=>c.put(e.request,k));return r})
    .catch(()=>caches.match(e.request)));
});

self.addEventListener('push',e=>{
  let d={};try{d=e.data?e.data.json():{}}catch(x){d={body:e.data?e.data.text():''}}
  // a new change request: put a dot on the admin's app icon until they open the app
  if(self.navigator&&self.navigator.setAppBadge&&String(d.url||'').includes('#requests')){try{self.navigator.setAppBadge()}catch(x){}}
  e.waitUntil(self.registration.showNotification(d.title||'NSPCA Longford Rota',{
    body:d.body||'The rota has changed.',icon:'icon-192.png',badge:'badge.png',vibrate:[200,100,200],
    tag:d.tag||'rota',renotify:true,data:{url:d.url||'./'}}));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const url=new URL((e.notification.data&&e.notification.data.url)||'./',self.registration.scope).href;
  e.waitUntil((async()=>{
    const list=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    const c=list.find(x=>x.url.startsWith(self.registration.scope))||list[0];
    if(c){
      try{await c.focus()}catch(_){}
      // Jump straight to the right page; if the phone won't allow that, tell the open app where to go.
      try{if(c.navigate&&new URL(c.url).hash!==new URL(url).hash){await c.navigate(url);return}}catch(_){}
      c.postMessage({open:url});return;
    }
    await self.clients.openWindow(url);
  })());
});
