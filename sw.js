/* Service worker del Tablero de Mercados: solo recibe avisos push y los muestra. No guarda nada en caché. */
self.addEventListener('install',function(){self.skipWaiting();});
self.addEventListener('activate',function(e){e.waitUntil(self.clients.claim());});
self.addEventListener('push',function(e){
  var d={};
  try{d=e.data?e.data.json():{};}catch(x){d={body:e.data?e.data.text():''};}
  e.waitUntil(self.registration.showNotification(d.title||'Tablero de Mercados',{
    body:d.body||'',tag:d.tag||undefined,icon:'icon-192.png',badge:'icon-192.png',lang:'es-AR',data:{url:d.url||'./'}
  }));
});
self.addEventListener('notificationclick',function(e){
  e.notification.close();
  var url=(e.notification.data&&e.notification.data.url)||'./';
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(l){
    for(var i=0;i<l.length;i++){
      if(l[i].url.split('#')[0].split('?')[0]===url.split('#')[0]&&'focus' in l[i]){l[i].postMessage({go:url});return l[i].focus();}
    }
    return self.clients.openWindow(url);
  }));
});
