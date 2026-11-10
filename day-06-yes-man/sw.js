"use strict";
const cacheName="yes-man-ux-v3";
const root="/day-06-yes-man/";
const files=[root,root+"yes-man.html",root+"manifest.webmanifest",root+"icon-192.png",root+"icon-512.png"];
self.addEventListener("install",event=>event.waitUntil(
  caches.open(cacheName).then(cache=>cache.addAll(files)).then(()=>self.skipWaiting())
));
self.addEventListener("activate",event=>event.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("yes-man-")&&k!==cacheName).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
));
self.addEventListener("fetch",event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=="GET"||url.origin!==location.origin||!files.includes(url.pathname))return;
  event.respondWith((async()=>{
    const cache=await caches.open(cacheName);
    try{
      const response=await fetch(event.request);
      if(response.ok)await cache.put(url.pathname,response.clone());
      return response;
    }catch{return (await cache.match(url.pathname))||Response.error();}
  })());
});
