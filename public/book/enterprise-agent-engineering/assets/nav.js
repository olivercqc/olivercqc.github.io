(function(){
  var sb=document.getElementById('sidebar');
  var scrim=document.getElementById('scrim');
  var btn=document.getElementById('tocToggle');
  function close(){ if(sb) sb.classList.remove('open'); if(scrim) scrim.classList.remove('show'); }
  if(btn&&sb&&scrim){
    btn.addEventListener('click',function(){ sb.classList.toggle('open'); scrim.classList.toggle('show'); });
    scrim.addEventListener('click',close);
  }
  var links=Array.prototype.slice.call(document.querySelectorAll('.secs .sec'));
  if(links.length){
    var map={};
    links.forEach(function(a){ map[a.getAttribute('data-id')]=a; });
    var active=null;
    function setActive(id){
      if(!map[id]||active===id) return;
      if(active&&map[active]) map[active].classList.remove('is-current');
      active=id; map[id].classList.add('is-current');
      var r=map[id].getBoundingClientRect();
      if(r.top<90||r.bottom>window.innerHeight-40){
        map[id].scrollIntoView({block:'center'});
      }
    }
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting) setActive(e.target.id); });
    },{rootMargin:'-64px 0px -72% 0px',threshold:0});
    document.querySelectorAll('.prose h2[id], .prose h3[id]').forEach(function(h){ io.observe(h); });
    if(links[0]) setActive(links[0].getAttribute('data-id'));
    document.querySelectorAll('.secs .sec').forEach(function(a){
      a.addEventListener('click',function(){ if(window.innerWidth<=960) close(); });
    });
  }
})();
