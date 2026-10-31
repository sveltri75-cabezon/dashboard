/* Service worker del Tablero de Mercados: solo recibe avisos push y los muestra. No guarda nada en caché. */
var ultimoPush=0;
self.addEventListener('install',function(){self.skipWaiting();});
self.addEventListener('activate',function(e){e.waitUntil(self.clients.claim());});
self.addEventListener('push',function(e){
  var d={};
  try{d=e.data?e.data.json():{};}catch(x){d={body:e.data?e.data.text():''};}
  ultimoPush=Date.now();
  var tg=String(d.tag||''),ic=/^lic-/.test(tg)?'i-lic.png':/^res-/.test(tg)?'i-res.png':tg==='pf'?'i-pf.png':tg==='resumen'?'i-barra.png':'';
  var o={body:d.body||'',tag:d.tag||undefined,badge:'badge-96.png',lang:'es-AR',data:{url:d.url||'./',pausa:d.pausa||'',fija:!!d.fija}};
  if(ic)o.icon=ic;
  /* el resumen fijo se reemplaza en silencio: sin sonido, sin vibración y sin volver a avisar */
  if(d.fija){o.silent=true;o.renotify=false;}
  e.waitUntil(self.registration.showNotification(d.title||'Tablero de Mercados',o));
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
/* Si el usuario cierra el resumen fijo, se pausa hasta mañana a las 10. Reemplazar la notificación por la siguiente actualización no cuenta. */
self.addEventListener('notificationclose',function(e){
  var n=e.notification,d=n.data||{};
  if(!d.fija||!d.pausa||Date.now()-ultimoPush<4000)return;
  e.waitUntil(self.registration.pushManager.getSubscription().then(function(s){
    if(!s)return;
    return fetch(d.pausa,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({endpoint:s.endpoint})}).catch(function(){});
  }));
});
