import './style.css';
import { DEFAULT_DB } from './data.js';

const $=id=>document.getElementById(id);
const LS=k=>{ try{return JSON.parse(localStorage.getItem(k))}catch{return null} };
const SS=(k,v)=>localStorage.setItem(k,JSON.stringify(v));

// DB: use edited version from localStorage or default
let DB = LS('senigalia_db') || [...DEFAULT_DB];
let adminAuth = false;
const DEFAULT_PASS = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'; // sha256 of "password"

function tc(s){if(!s)return'';return s.replace(/\b\w/g,c=>c.toUpperCase()).replace(/\B\w+/g,w=>w.toLowerCase())}
function gc(g){return g==='Donna'?'do':g==='Uomo'?'uo':'un'}
function gcol(g){return{do:'var(--do)',uo:'var(--uo)',un:'var(--un)'}[gc(g)]||'var(--un)'}

// Apply custom brand color
function applyColor(){
  const c=LS('senigalia_color');
  if(c) document.documentElement.style.setProperty('--go',c);
}

// SHA-256 hash
async function sha(s){const e=new TextEncoder().encode(s);const h=await crypto.subtle.digest('SHA-256',e);return Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,'0')).join('')}

// Check admin password
async function checkPass(pass){
  const stored=LS('senigalia_pass')||DEFAULT_PASS;
  const hash=await sha(pass);
  return hash===stored;
}

const catInfo={
  'Dulces':{emoji:'🍯',desc:'Vainilla, caramelo, tonka y chocolate. Fragancias adictivas y envolventes.'},
  'Frescos':{emoji:'💧',desc:'Cítricos, menta y notas acuáticas. Limpios y energizantes.'},
  'Frutales':{emoji:'🍑',desc:'Frambuesa, pera, manzana y mango. Jugosos y vibrantes.'},
  'Florales':{emoji:'🌸',desc:'Rosa, jazmín, peonía y magnolia. Elegancia clásica.'},
  'Amaderados':{emoji:'🪵',desc:'Sándalo, cedro, vetiver y oud. Profundos y cálidos.'},
  'Orientales':{emoji:'✨',desc:'Ámbar, incienso y azafrán. Exóticos y misteriosos.'},
  'Cítricos':{emoji:'🍋',desc:'Limón, bergamota y mandarina. Frescura pura.'},
  'Especiados':{emoji:'🌶️',desc:'Canela, pimienta y cardamomo. Intensos y con carácter.'},
  'Gourmand':{emoji:'☕',desc:'Café, chocolate y miel. Golosos y envolventes.'},
  'Nocturnos':{emoji:'🌙',desc:'Ámbar, cuero y maderas. Seductores para la noche.'},
  'Sensuales':{emoji:'🔥',desc:'Almizcle, ámbar y vainilla. Magnéticos e imposibles de ignorar.'},
  'Elegantes':{emoji:'💎',desc:'Iris, jazmín y sándalo. Sofisticados y refinados.'},
};

const catMap={
  dulce:'vainilla caramelo chocolate tonka miel dulce gourmand',dulces:'vainilla caramelo chocolate tonka miel dulce gourmand',
  fresco:'bergamota limón menta acuático fresco cítrico marino',frescos:'bergamota limón menta acuático fresco cítrico marino',
  frutal:'frambuesa fresa manzana pera mango frutal grosella',frutales:'frambuesa fresa manzana pera mango frutal grosella',
  floral:'rosa jazmín peonía magnolia nardos lirio floral azahar',florales:'rosa jazmín peonía magnolia nardos lirio floral azahar',
  amaderado:'sándalo cedro vetiver pachulí oud madera cuero',amaderados:'sándalo cedro vetiver pachulí oud madera cuero',
  oriental:'ámbar incienso azafrán cardamomo oriental',orientales:'ámbar incienso azafrán cardamomo oriental',
  'cítrico':'limón bergamota mandarina pomelo naranja','cítricos':'limón bergamota mandarina pomelo naranja',
  especiado:'canela pimienta cardamomo jengibre',especiados:'canela pimienta cardamomo jengibre',
  gourmand:'café chocolate caramelo vainilla cacao miel gourmand',
  nocturno:'intenso ámbar cuero oud nocturno',nocturnos:'intenso ámbar cuero oud nocturno',
  sensual:'almizcle ámbar vainilla cuero sensual',sensuales:'almizcle ámbar vainilla cuero sensual',
  elegante:'iris jazmín rosa sándalo elegante',elegantes:'iris jazmín rosa sándalo elegante',
};

const catLabels={dulces:'Dulces y Adictivos',frescos:'Frescos y Luminosos',frutales:'Frutales y Vibrantes',florales:'Florales y Elegantes',amaderados:'Amaderados e Intensos',orientales:'Orientales y Misteriosos','cítricos':'Cítricos y Energéticos',especiados:'Especiados y Cálidos',gourmand:'Gourmand y Envolventes',nocturnos:'Nocturnos y Seductores',sensuales:'Sensuales y Magnéticos',elegantes:'Elegantes y Sofisticados'};

const PROFILES={
  dulce:{name:'Dulce Adictivo',desc:'Amás las fragancias envolventes con vainilla, caramelo y haba tonka.'},
  floral:{name:'Floral Elegante',desc:'Tu estilo es clásico y femenino, con rosa, jazmín y magnolia.'},
  fresco:{name:'Fresco Luminoso',desc:'Buscás frescura, cítricos y notas acuáticas para el día a día.'},
  amaderado:{name:'Amaderado Intenso',desc:'Te atraen las maderas profundas, el oud y las especias cálidas.'},
  sexy:{name:'Sexy Nocturno',desc:'Tu personalidad olfativa es intensa, seductora y magnética.'},
  frutal:{name:'Frutal Vibrante',desc:'Disfrutás de fragancias jugosas, frescas y llenas de energía.'},
  oriental:{name:'Oriental Misterioso',desc:'Te fascinan los aromas exóticos, el ámbar y las resinas.'},
};

function detectProfile(notes){
  const n=notes.join(' ').toLowerCase();
  if(/vainilla|caramelo|cacao|chocolate|tonka|miel|dulce/.test(n))return PROFILES.dulce;
  if(/rosa|jazmín|peonía|magnolia|nardos|flor/.test(n))return PROFILES.floral;
  if(/limón|bergamota|menta|fresc|marino|cítric/.test(n))return PROFILES.fresco;
  if(/sándalo|cedro|vetiver|pachulí|oud|cuero|madera/.test(n))return PROFILES.amaderado;
  if(/ámbar|incienso|almizcle|noche|intenso/.test(n))return PROFILES.sexy;
  if(/frambuesa|fresa|manzana|pera|mango|frutal/.test(n))return PROFILES.frutal;
  if(/azafrán|cardamomo|canela|oriental/.test(n))return PROFILES.oriental;
  return PROFILES.floral;
}

// SEARCH - fixed to handle codes like "donna x115"
function normalizeCode(s){return s.toUpperCase().replace(/\s+/g,'').replace('DOONA','DONNA')}

function search(query){
  if(!query.trim()){$('results').innerHTML='';$('profile').classList.remove('show');$('catDesc').classList.remove('show');showSuggestions();return}
  $('cx').style.display='flex';
  const q=query.toLowerCase().trim();
  const qNorm=normalizeCode(query);

  let matches=DB.map(item=>{
    let score=0;
    const orig=item.original.toLowerCase();
    const brand=item.brand.toLowerCase();
    const notes=(item.allNotes||[]).join(' ').toLowerCase();
    const fam=(item.family||'').toLowerCase();
    const codeNorm=normalizeCode(item.code);

    // Code match (donna x115, DONNA X115, donnax115)
    if(codeNorm===qNorm)score+=100;
    else if(codeNorm.includes(qNorm)||qNorm.includes(codeNorm))score+=70;
    else if(item.code.toLowerCase().includes(q))score+=50;

    if(orig.includes(q)||q.includes(orig))score+=60;
    if(brand.includes(q))score+=30;
    if(notes.includes(q))score+=25;
    if(fam.includes(q))score+=20;

    const keywords=q.split(/\s+/);
    keywords.forEach(kw=>{
      if(orig.includes(kw))score+=15;
      if(notes.includes(kw))score+=10;
      if(fam.includes(kw))score+=8;
      if(brand.includes(kw))score+=8;
      const cn=catMap[kw];
      if(cn)cn.split(' ').forEach(n=>{if(notes.includes(n))score+=12;if(fam.includes(n))score+=8;});
    });
    return{...item,score};
  }).filter(m=>m.score>0).sort((a,b)=>b.score-a.score);

  if(!matches.length){
    $('results').innerHTML='<div class="empty-state"><div style="font-size:28px;opacity:.3;margin-bottom:8px">🔍</div><div style="font-size:12px">No encontramos coincidencias para "'+query+'"</div></div>';
    $('profile').classList.remove('show');return;
  }

  const allNotes=matches.slice(0,5).flatMap(m=>m.allNotes||[]);
  const prof=detectProfile(allNotes);
  $('profile').innerHTML=`<div class="profile-card"><div class="profile-label">Tu perfil olfativo</div><div class="profile-type">${prof.name}</div><div class="profile-desc">${prof.desc}</div></div>`;
  $('profile').classList.add('show');

  const top=matches.slice(0,8);
  const searchedOriginal=catLabels[q]||top[0]?.original||query;

  $('results').innerHTML=`<div class="results-title">Recomendaciones para <span>"${tc(searchedOriginal)}"</span></div>`+
    top.map(m=>{
      const g=gc(m.gender);
      const aff=Math.max(75,Math.min(99,m.score));
      const hasImg=m.imageUrl&&m.imageUrl.length>10;
      const fragUrl=`https://www.fragrantica.com/search/?query=${encodeURIComponent(m.original+' '+m.brand)}`;
      const reason=`Comparte un perfil ${(m.family||'').toLowerCase()} con notas de ${(m.allNotes||[]).slice(0,4).join(', ')}.`;
      return`<div class="rcard" onclick='W.detail("${m.code.replace(/'/g,"\\'")}","${m.category.replace(/'/g,"\\'")}")'>
        <div class="rcard-top">
          ${hasImg?`<img class="rcard-img" src="${m.imageUrl}" loading="lazy" onerror="this.className='rcard-img noimg';this.textContent='🧴'">`:'<div class="rcard-img noimg">🧴</div>'}
          <div class="rcard-info">
            <div class="rcard-head"><span class="rcard-code ${g}">${m.code}</span><span class="aff">${aff}% afinidad</span></div>
            <div class="rcard-name">${tc(m.original)}</div>
            <div class="rcard-brand">${m.brand}</div>
            ${m.price?`<div class="rcard-price">${m.price}</div>`:''}
            <div class="rcard-cat">${m.category} · ${m.gender}</div>
            <div class="rcard-reason">${reason}</div>
            <div class="rcard-notes">${(m.allNotes||[]).slice(0,6).map(n=>`<span class="rcard-note">${n}</span>`).join('')}</div>
          </div>
        </div>
        <div class="rcard-btns">
          <a href="${m.url}" target="_blank" class="rbtn buy" onclick="event.stopPropagation()">🛒 Comprar</a>
          <a href="${fragUrl}" target="_blank" class="rbtn frag" onclick="event.stopPropagation()">🔗 Fragrantica</a>
          <button class="rbtn share" onclick="event.stopPropagation();W.sharePDF('${m.code.replace(/'/g,"\\'")}','${m.category.replace(/'/g,"\\'")}')">📄 PDF</button>
        </div>
      </div>`;
    }).join('');
}

function showDetail(code,cat){
  const x=DB.find(f=>f.code===code&&(!cat||f.category===cat))||DB.find(f=>f.code===code);
  if(!x)return;
  const g=gc(x.gender);const gc2=gcol(x.gender);
  const hasImg=x.imageUrl&&x.imageUrl.length>10;
  const fragUrl=`https://www.fragrantica.com/search/?query=${encodeURIComponent(x.original+' '+x.brand)}`;
  const lc={'EDP Privé':['#8b2020','#f5c4c1'],'Eau de Parfum':['#5b3a8c','#d4c8f0'],'Edición Limitada':['#9e2d5e','#f0c4d8'],'Eau de Toilette':['#2d6b4a','#c4f0d8']}[x.category]||['#5b3a8c','#d4c8f0'];

  $('mdl').innerHTML=`
    <div style="height:4px;border-radius:16px 16px 0 0;background:linear-gradient(90deg,${gc2},${lc[0]},var(--go))"></div>
    <button class="mcl" onclick="W.closeModal()">✕</button>
    ${hasImg?`<img class="mimg" src="${x.imageUrl}" onerror="this.style.display='none'">`:''}
    <div class="mbod">
      <div class="mtags">
        <span class="mtag" style="background:${gc2}20;color:${gc2}">${x.code}</span>
        <span class="mtag" style="background:${lc[0]}20;color:${lc[1]}">${x.category}</span>
        <span class="mtag" style="border:1px solid ${gc2}40;color:${gc2}">${x.gender}</span>
      </div>
      <div class="minsp">${tc(x.original)}</div>
      <div class="mbra">${x.brand}</div>
      ${x.price?`<div class="mpri">${x.price}</div>`:''}
      ${x.personality?`<div class="mpers">${x.personality}</div>`:''}
      ${x.description?`<div class="mdesc">${x.description}</div>`:''}
      <div class="minfo">
        <div class="minfo-item"><div class="minfo-label">Intensidad</div><div class="minfo-val">${x.intensity||'Media-Alta'}</div></div>
        <div class="minfo-item"><div class="minfo-label">Duración</div><div class="minfo-val">${x.duration||'8-12 hs'}</div></div>
        <div class="minfo-item"><div class="minfo-label">Ocasión</div><div class="minfo-val">${x.occasion||'Versátil'}</div></div>
        <div class="minfo-item"><div class="minfo-label">Estación</div><div class="minfo-val">${x.season||'Todo el año'}</div></div>
      </div>
      <div class="mpyr">
        <div class="mpyr-t">Pirámide Olfativa</div>
        ${(x.notesTop||[]).length?`<div class="mpyr-r"><span class="mpyr-l" style="color:#e8c95a">🔝 Salida</span><div class="mpyr-n">${x.notesTop.map(n=>`<span style="background:#e8c95a12;border:1px solid #e8c95a25">${n}</span>`).join('')}</div></div>`:''}
        ${(x.notesHeart||[]).length?`<div class="mpyr-r"><span class="mpyr-l" style="color:#8b6fd4">💜 Corazón</span><div class="mpyr-n">${x.notesHeart.map(n=>`<span style="background:#8b6fd412;border:1px solid #8b6fd425">${n}</span>`).join('')}</div></div>`:''}
        ${(x.notesBase||[]).length?`<div class="mpyr-r"><span class="mpyr-l" style="color:#888">🌙 Fondo</span><div class="mpyr-n">${x.notesBase.map(n=>`<span style="background:#88888812;border:1px solid #88888825">${n}</span>`).join('')}</div></div>`:''}
      </div>
      <div class="mlnk">
        <a href="${x.url}" target="_blank" class="ml main">🛒 COMPRAR EN SENIGALIA.COM</a>
        <a href="${fragUrl}" target="_blank" class="ml sec">🔗 Ver perfume original en Fragrantica</a>
        <button class="ml sec" onclick="W.sharePDF('${x.code.replace(/'/g,"\\'")}','${x.category.replace(/'/g,"\\'")}')">📄 Compartir como PDF</button>
      </div>
    </div>`;
  $('ov').classList.add('show');document.body.style.overflow='hidden';
}

function closeModal(){$('ov').classList.remove('show');$('printOv').classList.remove('show');document.body.style.overflow=''}

// SHARE AS PDF
function sharePDF(code,cat){
  const x=DB.find(f=>f.code===code&&(!cat||f.category===cat))||DB.find(f=>f.code===code);
  if(!x)return;
  $('printView').innerHTML=`
    <button class="p-close" onclick="W.closeModal()">✕</button>
    <div class="p-logo">SENIGALIA</div>
    <div class="p-sub">Matching Olfativo</div>
    <div class="p-name">${tc(x.original)}</div>
    <div class="p-brand">${x.brand}</div>
    <div class="p-info">
      <div><strong>Código</strong>${x.code}</div>
      <div><strong>Línea</strong>${x.category}</div>
      <div><strong>Género</strong>${x.gender}</div>
      <div><strong>Precio</strong>${x.price||'Consultar'}</div>
      <div><strong>Intensidad</strong>${x.intensity||'Media-Alta'}</div>
      <div><strong>Duración</strong>${x.duration||'8-12 hs'}</div>
      <div><strong>Ocasión</strong>${x.occasion||'Versátil'}</div>
      <div><strong>Estación</strong>${x.season||'Todo el año'}</div>
    </div>
    <div class="p-notes">
      <div class="p-notes-t">Pirámide Olfativa</div>
      ${(x.notesTop||[]).length?`<div class="p-notes-r"><span class="p-notes-l">Salida:</span> ${x.notesTop.join(', ')}</div>`:''}
      ${(x.notesHeart||[]).length?`<div class="p-notes-r"><span class="p-notes-l">Corazón:</span> ${x.notesHeart.join(', ')}</div>`:''}
      ${(x.notesBase||[]).length?`<div class="p-notes-r"><span class="p-notes-l">Fondo:</span> ${x.notesBase.join(', ')}</div>`:''}
    </div>
    ${x.personality?`<div style="text-align:center;font-size:11px;color:#999;font-style:italic;margin-bottom:8px">${x.personality}</div>`:''}
    <div class="p-link">🌐 <a href="${x.url}" target="_blank">${x.url||'senigalia.com'}</a></div>
    <div class="p-actions">
      <button class="p-btn gold" onclick="window.print()">🖨️ Imprimir / PDF</button>
      <button class="p-btn gray" onclick="W.closeModal()">Cerrar</button>
    </div>`;
  $('ov').classList.remove('show');
  $('printOv').classList.add('show');
}

// BROWSE
let bLine='',bSearch='';
function renderBrowse(){
  const lines=['','Eau de Parfum','Edición Limitada','Eau de Toilette','EDP Privé'];
  // Build filters HTML
  let filtersHtml='<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px">';
  lines.forEach(l=>{filtersHtml+='<button class="bf'+(bLine===l?' on':'')+'" onclick="W.setBLine(\''+l+'\')">'+( l||'Todas')+'</button>';});
  filtersHtml+='</div>';
  // Search input
  filtersHtml+='<div style="position:relative;margin-bottom:10px"><span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:12px;color:#444">🔍</span><input type="text" id="browseQ" placeholder="Buscar código o nombre... (ej: UOMO X64)" style="width:100%;padding:10px 10px 10px 32px;background:var(--c1);border:1px solid #1e1e1e;border-radius:10px;color:var(--tx);font-size:12px;font-family:Outfit,sans-serif;outline:none"></div>';
  $('bfilters').innerHTML=filtersHtml;
  // Wire search event
  var bq=$('browseQ');
  if(bq){bq.value=bSearch||'';bq.oninput=function(){bSearch=this.value;renderBrowseGrid();};}
  renderBrowseGrid();
}
function renderBrowseGrid(){
  let items=DB;
  if(bLine)items=items.filter(f=>f.category===bLine);
  if(bSearch&&bSearch.trim()){
    var q=bSearch.trim().toLowerCase();
    var qNoSpace=q.replace(/\s+/g,'');
    items=items.filter(function(f){
      var codeL=f.code.toLowerCase();
      var codeNoSpace=codeL.replace(/\s+/g,'');
      var origL=(f.original||'').toLowerCase();
      var brandL=(f.brand||'').toLowerCase();
      return codeL.indexOf(q)>=0 || codeNoSpace.indexOf(qNoSpace)>=0 || origL.indexOf(q)>=0 || brandL.indexOf(q)>=0;
    });
  }
  $('bcount').textContent=`${items.length} fragancias`;
  $('bgrid').innerHTML=items.map(x=>{
    const hasImg=x.imageUrl&&x.imageUrl.length>10;
    const g=gc(x.gender);
    return`<div class="bcard" onclick='W.detail("${x.code.replace(/'/g,"\\'")}","${x.category.replace(/'/g,"\\'")}")'>
      ${hasImg?`<img class="bcard-img" src="${x.imageUrl}" loading="lazy" onerror="this.style.display='none'">`:'<div class="bcard-img" style="display:flex;align-items:center;justify-content:center;font-size:24px;opacity:.1">🧴</div>'}
      <div class="bcard-body">
        <div class="bcard-code" style="color:${gcol(x.gender)}">${x.code}</div>
        <div class="bcard-name">${tc(x.original)}</div>
        <div class="bcard-brand">${x.brand}</div>
        ${x.price?`<div class="bcard-price">${x.price}</div>`:''}
      </div>
      <a href="${x.url}" target="_blank" class="bcard-buy" onclick="event.stopPropagation()">🛒 Comprar</a>
    </div>`;
  }).join('');
}

// ADMIN PANEL
function renderAdmin(){
  if(!adminAuth){
    $('adminPanel').innerHTML=`<div class="admin-login">
      <div style="font-size:28px;margin-bottom:12px">🔐</div>
      <div style="font-size:14px;margin-bottom:16px;color:#888">Ingresá la clave de administración</div>
      <input type="password" id="adminPass" placeholder="Clave..." onkeydown="if(event.key==='Enter')W.login()">
      <br><button onclick="W.login()">Ingresar</button>
    </div>`;
    return;
  }

  const currentColor=getComputedStyle(document.documentElement).getPropertyValue('--go').trim();
  $('adminPanel').innerHTML=`
    <div class="admin-section">
      <div class="admin-title">🎨 Color de Marca</div>
      <div class="admin-row">
        <label>Color actual</label>
        <input type="color" id="brandColor" value="${currentColor}" style="width:50px;height:34px;padding:2px;cursor:pointer" onchange="W.setColor(this.value)">
        <button class="admin-btn" onclick="W.setColor('#c9a94e')">Restaurar dorado</button>
      </div>
    </div>

    <div class="admin-section">
      <div class="admin-title">🧴 Fragancias (${DB.length})</div>
      <div style="margin-bottom:8px;display:flex;gap:6px">
        <input type="text" id="fragSearch" placeholder="Buscar por código..." style="padding:6px 10px;background:var(--c1);border:1px solid #222;border-radius:6px;color:var(--tx);font-size:10px;flex:1;outline:none" oninput="W.filterAdminFrags()">
        <button class="admin-btn primary" onclick="W.addFrag()">+ Agregar</button>
      </div>
      <div class="admin-frag-list" id="fragList"></div>
    </div>

    <div class="admin-section">
      <div class="admin-title">💰 Actualizar Precios desde Wix</div>
      <div style="font-size:10px;color:#666;margin-bottom:8px;line-height:1.5">Exportá el CSV desde tu panel de Wix (Productos → Exportar). Subilo acá para actualizar precios e imágenes automáticamente.</div>
      <div class="admin-row">
        <button class="admin-btn primary" onclick="document.getElementById('csvFile').click()">📄 Importar CSV de Wix</button>
        <input type="file" id="csvFile" accept=".csv" style="display:none" onchange="W.updateFromCSV(event)">
      </div>
    </div>

    <div class="admin-section">
      <div class="admin-title">💾 Backup y Restauración</div>
      <div class="admin-row">
        <button class="admin-btn primary" onclick="W.backup()">📥 Descargar Backup</button>
        <button class="admin-btn" onclick="document.getElementById('restoreFile').click()">📤 Restaurar Backup</button>
        <input type="file" id="restoreFile" accept=".json" style="display:none" onchange="W.restore(event)">
      </div>
      <div class="admin-row" style="margin-top:8px">
        <button class="admin-btn danger" onclick="W.resetDB()">🗑️ Restaurar base original</button>
      </div>
    </div>

    <div class="admin-section">
      <div class="admin-title">🔑 Cambiar Clave</div>
      <div class="admin-row">
        <input type="password" id="newPass" placeholder="Nueva clave...">
        <input type="password" id="newPass2" placeholder="Repetir...">
        <button class="admin-btn" onclick="W.changePass()">Cambiar</button>
      </div>
    </div>

    <div style="text-align:center;margin-top:20px">
      <button class="admin-btn danger" onclick="W.logout()">Cerrar sesión admin</button>
    </div>`;
  
  filterAdminFrags();
}

function filterAdminFrags(){
  const q=($('fragSearch')?.value||'').toLowerCase();
  const list=$('fragList');if(!list)return;
  const filtered=q?DB.filter(f=>f.code.toLowerCase().includes(q)||f.original.toLowerCase().includes(q)):DB;
  list.innerHTML=filtered.slice(0,50).map((f,i)=>`
    <div class="admin-frag-item">
      <span class="code">${f.code}</span>
      <span class="name">${tc(f.original)} — ${f.brand}</span>
      <span class="actions">
        <button onclick="W.editFrag('${f.code.replace(/'/g,"\\'")}','${f.category.replace(/'/g,"\\'")}')" title="Editar">✏️</button>
        <button onclick="W.deleteFrag('${f.code.replace(/'/g,"\\'")}','${f.category.replace(/'/g,"\\'")}')" title="Eliminar">🗑️</button>
      </span>
    </div>`).join('')+(filtered.length>50?`<div style="text-align:center;padding:8px;font-size:9px;color:#555">+${filtered.length-50} más...</div>`:'');
}

function editFrag(code,cat){
  const idx=DB.findIndex(f=>f.code===code&&f.category===cat);
  const x=idx>=0?DB[idx]:null;
  if(!x)return;

  $('mdl').innerHTML=`
    <div style="height:4px;background:var(--go);border-radius:16px 16px 0 0"></div>
    <button class="mcl" onclick="W.closeModal()">✕</button>
    <div class="mbod">
      <div style="font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:700;margin-bottom:12px">✏️ Editar: ${x.code}</div>
      <div class="admin-row"><label>Código</label><input id="e_code" value="${x.code}"></div>
      <div class="admin-row"><label>Original</label><input id="e_original" value="${x.original}"></div>
      <div class="admin-row"><label>Marca</label><input id="e_brand" value="${x.brand}"></div>
      <div class="admin-row"><label>Categoría</label><select id="e_category"><option ${x.category==='Eau de Parfum'?'selected':''}>Eau de Parfum</option><option ${x.category==='Edición Limitada'?'selected':''}>Edición Limitada</option><option ${x.category==='Eau de Toilette'?'selected':''}>Eau de Toilette</option><option ${x.category==='EDP Privé'?'selected':''}>EDP Privé</option></select></div>
      <div class="admin-row"><label>Género</label><select id="e_gender"><option ${x.gender==='Donna'?'selected':''}>Donna</option><option ${x.gender==='Uomo'?'selected':''}>Uomo</option><option ${x.gender==='Unisex'?'selected':''}>Unisex</option></select></div>
      <div class="admin-row"><label>Familia</label><input id="e_family" value="${x.family||''}"></div>
      <div class="admin-row"><label>Precio</label><input id="e_price" value="${x.price||''}"></div>
      <div class="admin-row"><label>URL Producto</label><input id="e_url" value="${x.url||''}"></div>
      <div class="admin-row"><label>URL Imagen</label><input id="e_imageUrl" value="${x.imageUrl||''}"></div>
      <div class="admin-row"><label>Notas Salida</label><input id="e_notesTop" value="${(x.notesTop||[]).join(', ')}"></div>
      <div class="admin-row"><label>Notas Corazón</label><input id="e_notesHeart" value="${(x.notesHeart||[]).join(', ')}"></div>
      <div class="admin-row"><label>Notas Fondo</label><input id="e_notesBase" value="${(x.notesBase||[]).join(', ')}"></div>
      <div class="admin-row"><label>Personalidad</label><input id="e_personality" value="${x.personality||''}"></div>
      <div class="admin-row"><label>Descripción</label><textarea id="e_description">${x.description||''}</textarea></div>
      <div class="admin-row"><label>Intensidad</label><input id="e_intensity" value="${x.intensity||''}"></div>
      <div class="admin-row"><label>Duración</label><input id="e_duration" value="${x.duration||''}"></div>
      <div class="admin-row"><label>Ocasión</label><input id="e_occasion" value="${x.occasion||''}"></div>
      <div class="admin-row"><label>Estación</label><input id="e_season" value="${x.season||''}"></div>
      <div style="display:flex;gap:8px;margin-top:12px">
        <button class="admin-btn primary" onclick="W.saveFrag(${idx})" style="flex:1">💾 Guardar</button>
        <button class="admin-btn" onclick="W.closeModal()">Cancelar</button>
      </div>
    </div>`;
  $('ov').classList.add('show');document.body.style.overflow='hidden';
}

function saveFrag(idx){
  const parseNotes=v=>(v||'').split(',').map(n=>n.trim()).filter(Boolean);
  const obj={
    code:$('e_code').value.trim(),
    original:$('e_original').value.trim(),
    brand:$('e_brand').value.trim(),
    category:$('e_category').value,
    gender:$('e_gender').value,
    family:$('e_family').value.trim(),
    price:$('e_price').value.trim(),
    url:$('e_url').value.trim(),
    imageUrl:$('e_imageUrl').value.trim(),
    notesTop:parseNotes($('e_notesTop').value),
    notesHeart:parseNotes($('e_notesHeart').value),
    notesBase:parseNotes($('e_notesBase').value),
    allNotes:[...parseNotes($('e_notesTop').value),...parseNotes($('e_notesHeart').value),...parseNotes($('e_notesBase').value)].map(n=>n.toLowerCase()),
    personality:$('e_personality').value.trim(),
    description:$('e_description').value.trim(),
    intensity:$('e_intensity').value.trim(),
    duration:$('e_duration').value.trim(),
    occasion:$('e_occasion').value.trim(),
    season:$('e_season').value.trim(),
    collection:DB[idx]?.collection||'',
  };
  if(idx>=0&&idx<DB.length)DB[idx]=obj;else DB.push(obj);
  SS('senigalia_db',DB);
  closeModal();renderAdmin();
  alert('✅ Fragancia guardada');
}

function addFrag(){editFrag('','');
  // Override for new
  const idx=DB.length;
  const saveBtn=$('mdl').querySelector('[onclick*="saveFrag"]');
  if(saveBtn)saveBtn.setAttribute('onclick',`W.saveFrag(${idx})`);
  $('mdl').querySelector('div[style*="font-family"]').textContent='➕ Nueva fragancia';
}

function deleteFrag(code,cat){
  if(!confirm(`¿Eliminar ${code}?`))return;
  const idx=DB.findIndex(f=>f.code===code&&f.category===cat);
  if(idx>=0){DB.splice(idx,1);SS('senigalia_db',DB);renderAdmin();}
}

function setColor(c){
  document.documentElement.style.setProperty('--go',c);
  SS('senigalia_color',c);
}

function updateFromCSV(event){
  var file=event.target.files[0];if(!file)return;
  var reader=new FileReader();
  reader.onload=function(e){
    try{
      var lines=e.target.result.split('\n');
      var header=lines[0].split(',').map(function(h){return h.replace(/"/g,'').trim()});
      var nameIdx=header.indexOf('name');
      var priceIdx=header.indexOf('price');
      var imgIdx=header.indexOf('productImageUrl');
      var typeIdx=header.indexOf('fieldType');
      if(priceIdx<0){alert('No se encontró columna "price"');return;}
      var updated=0;
      for(var i=1;i<lines.length;i++){
        var row=[];var field='';var inQ=false;
        for(var c=0;c<lines[i].length;c++){
          var ch=lines[i][c];
          if(ch==='"')inQ=!inQ;
          else if(ch===','&&!inQ){row.push(field.trim());field='';}
          else field+=ch;
        }
        row.push(field.trim());
        if(typeIdx>=0&&row[typeIdx]&&row[typeIdx].indexOf('Product')<0)continue;
        var csvName=(row[nameIdx]||'').replace(/"/g,'').trim().toUpperCase();
        var csvPrice=(row[priceIdx]||'').replace(/"/g,'').trim();
        var csvImg=imgIdx>=0?(row[imgIdx]||'').replace(/"/g,'').trim():'';
        if(!csvName||!csvPrice)continue;
        var csvNorm=csvName.replace(/\s+/g,'');
        for(var j=0;j<DB.length;j++){
          var dbCode=DB[j].code.toUpperCase().replace(/DOONA/g,'DONNA');
          var dbNorm=dbCode.replace(/\s+/g,'');
          var match=false;
          if(dbNorm===csvNorm)match=true;
          if(!match){
            var m1=csvName.match(/^(DONNA|UOMO)\s*X?(\d+)/);
            var m2=dbCode.match(/^(DONNA|UOMO)\s*X?(\d+)/);
            if(m1&&m2&&m1[1]===m2[1]&&m1[2]===m2[2]){
              var csvX=/\bX\d/.test(csvName);
              var dbEDT=DB[j].category==='Eau de Toilette';
              if((csvX&&!dbEDT)||(!csvX&&dbEDT))match=true;
              if(csvX===/\bX\d/.test(dbCode))match=true;
            }
          }
          if(!match){
            var ux1=csvName.match(/(XX\d+|XXX)/);
            var ux2=dbCode.match(/(XX\d+|XXX)/);
            if(ux1&&ux2&&ux1[1]===ux2[1])match=true;
          }
          if(match){
            try{DB[j].price='$'+Math.round(parseFloat(csvPrice)).toLocaleString('es-AR');}catch(ex){}
            if(csvImg){
              var fi=csvImg.split(';')[0].trim();
              if(fi)DB[j].imageUrl=fi.indexOf('http')===0?fi:'https://static.wixstatic.com/media/'+fi;
            }
            updated++;break;
          }
        }
      }
      SS('senigalia_db',DB);renderAdmin();
      alert('Actualizados: '+updated+' productos de '+DB.length);
    }catch(err){alert('Error: '+err.message);}
  };
  reader.readAsText(file);event.target.value='';
}

function backup(){
  const data={db:DB,color:LS('senigalia_color'),version:'2.0',date:new Date().toISOString()};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download=`senigalia_backup_${new Date().toISOString().slice(0,10)}.json`;a.click();
}

function restore(event){
  const file=event.target.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    try{
      const data=JSON.parse(e.target.result);
      if(data.db&&Array.isArray(data.db)){
        DB=data.db;SS('senigalia_db',DB);
        if(data.color){SS('senigalia_color',data.color);applyColor();}
        renderAdmin();
        alert(`✅ Backup restaurado: ${DB.length} fragancias`);
      }else{alert('❌ Archivo inválido');}
    }catch{alert('❌ Error al leer el archivo');}
  };
  reader.readAsText(file);
}

function resetDB(){
  if(!confirm('¿Restaurar toda la base de datos original? Se perderán los cambios.'))return;
  DB=[...DEFAULT_DB];localStorage.removeItem('senigalia_db');
  renderAdmin();alert('✅ Base restaurada');
}

async function login(){
  const pass=$('adminPass').value;
  if(!pass){alert('Ingresá una clave');return;}
  const ok=await checkPass(pass);
  if(ok){adminAuth=true;renderAdmin();}
  else{alert('❌ Clave incorrecta');}
}

function logout(){adminAuth=false;renderAdmin();}

async function changePass(){
  const p1=$('newPass').value,p2=$('newPass2').value;
  if(!p1||p1.length<4){alert('La clave debe tener al menos 4 caracteres');return;}
  if(p1!==p2){alert('Las claves no coinciden');return;}
  SS('senigalia_pass',await sha(p1));
  alert('✅ Clave actualizada');
}

// TABS
function switchTab(tab){
  ['match','browse','admin'].forEach(t=>{
    const el=$('tab'+t.charAt(0).toUpperCase()+t.slice(1));
    if(el)el.classList.toggle('on',t===tab);
    const view=$(t+'View');
    if(view)view.style.display=t===tab?'block':'none';
  });
  if(tab==='browse')renderBrowse();
  if(tab==='admin')renderAdmin();
}

function showSuggestions(){
  $('sugs').innerHTML=Object.entries(catInfo).map(([s,c])=>
    `<button class="sug" onclick="W.catSearch('${s}')">${c.emoji} ${s}</button>`
  ).join('');
}

function catSearch(cat){
  const c=catInfo[cat];
  if(c){
    $('catDesc').innerHTML=`<div class="cat-desc-card"><div class="cat-desc-emoji">${c.emoji}</div><div class="cat-desc-title">${cat}</div><div class="cat-desc-text">${c.desc}</div></div>`;
    $('catDesc').classList.add('show');
  }
  $('q').value=cat;
  search(cat);
}

function clearSearch(){$('q').value='';$('cx').style.display='none';$('results').innerHTML='';$('profile').classList.remove('show');$('catDesc').classList.remove('show');showSuggestions();}

// Expose to global
const W=window.W={search,detail:showDetail,closeModal,sharePDF,switchTab,setBLine:l=>{bLine=l;renderBrowse()},setBSearch:v=>{bSearch=v;renderBrowse()},
  login,logout,changePass,setColor,backup,restore,resetDB,editFrag,saveFrag,addFrag,deleteFrag,
  filterAdminFrags,updateFromCSV,catSearch,clearSearch:clearSearch};

// Wire events
function init(){
  applyColor();
  const br=new Set(DB.map(f=>f.brand));
  $('stats').innerHTML=[[DB.length,'Fragancias'],[br.size,'Marcas'],[DB.filter(f=>f.gender==='Donna').length,'Donna'],[DB.filter(f=>f.gender==='Uomo').length,'Uomo']].map(([n,l])=>`<div><div class="sn">${n}</div><div class="sl">${l}</div></div>`).join('');

  $('cx').onclick=clearSearch;
  let t;$('q').addEventListener('input',e=>{clearTimeout(t);t=setTimeout(()=>search(e.target.value),250);});
  $('ov').onclick=closeModal;$('mdl').onclick=e=>e.stopPropagation();
  $('printOv').onclick=closeModal;$('printView').onclick=e=>e.stopPropagation();
  document.querySelectorAll('.tab').forEach(tab=>tab.addEventListener('click',()=>switchTab(tab.dataset.tab)));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});
  showSuggestions();
  var gear=$('gearBtn');
  if(gear)gear.onclick=function(){switchTab('admin');};
}

init();
