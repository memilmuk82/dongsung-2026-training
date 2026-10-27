(() => {
'use strict';
document.addEventListener('error',event=>{
 const node=event.target;
 if(!(node instanceof HTMLImageElement)&&!(node instanceof SVGImageElement))return;
 const attr=node instanceof HTMLImageElement?'src':'href',raw=node.getAttribute(attr);if(!raw)return;
 const url=new URL(raw,location.href);if(url.origin!==location.origin)return;
 if(!node.dataset.imageRetried){node.dataset.imageRetried='1';url.searchParams.set('image-retry','1');node.setAttribute(attr,url.href);return;}
 const capture=node.closest('figure');if(!capture||capture.querySelector('.image-load-error'))return;
 const again=document.createElement('a');again.className='image-load-error';again.href=url.href;again.target='_blank';again.rel='noopener';again.textContent='이미지가 열리지 않으면 원본을 다시 열어 확인하세요 ↗';capture.append(again);
},true);
const page=document.body.dataset.page;
const {prompts,notice,sources}=window.DAESHIN_COMMON, images=window.DAESHIN_IMAGES;
const slides=page==='slides'?window.DAESHIN_PRESENTATION.slides:(window.DAESHIN_GUIDE?.sections||[]);
const routes=window.DAESHIN_LINKS;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link=s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)} ↗</a>`;
const list=arr=>`<ul>${arr.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
const table=rows=>`<div class="table-wrap"><table><thead><tr>${rows[0].map(x=>`<th scope="col">${esc(x)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1).map(row=>`<tr>${row.map(x=>`<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const diagram=arr=>`<div class="diagram"><small>개념도</small><ol>${arr.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></div>`;
const noticeHtml=()=>`<div class="notice"><pre>${esc(notice)}</pre></div>`;
const metadata=im=>`${im.kind} · ${im.service} · ${im.date} · ${im.account} · ${im.version}`;
const figure=(key,compact=false,focus=null)=>{
 const im=images[key];
 const shortScope=/동성고.*(응답|결과).*아님|이전.*인용/.test(im.scope||'')?'이전 조작 예시 · 동성고 생성 결과 아님':/이전|기존 연수/.test(im.scope||'')?'이전 연수의 조작 예시':/공식|매뉴얼/.test(im.scope||'')?'공식 안내의 예시 화면':/교육계획|원문/.test(im.scope||'')?'동성고 교육계획서 원문':im.scope||'';
 const scope=im.scope?`<strong class="capture-scope">${esc(compact?shortScope:im.scope)}</strong>`:'';
 const region=focus?focus.map((v,i)=>v*(i%2?im.height:im.width)):null,clipId=focus?'clip-'+key+'-'+focus.join('-').replaceAll('.','_'):null;
 const media=focus?`<svg class="capture-focus" role="img" aria-label="${esc(im.caption)} 입력 영역 확대" viewBox="${region.join(' ')}" preserveAspectRatio="xMidYMid meet"><defs><clipPath id="${clipId}" clipPathUnits="userSpaceOnUse"><rect x="${region[0]}" y="${region[1]}" width="${region[2]}" height="${region[3]}"/></clipPath></defs><image href="${esc(im.src)}" width="${im.width}" height="${im.height}" clip-path="url(#${clipId})"/></svg>`:`<img src="${esc(im.src)}" alt="${esc(im.caption)}" ${compact?'':'loading="lazy"'}>`;
 const caption=compact?`${scope}<span class="source-caption">${esc(im.caption)}</span>`:`${scope}${focus?'<b class="focus-note">입력·설정 영역 확대 · </b>':''}${esc(im.caption)}<small>${esc(metadata(im))}${im.sourcePage?` · <a href="${esc(im.sourcePage)}" target="_blank" rel="noopener">공식 원문</a>`:''}</small>`;
 return `<figure class="capture${compact?' compact':''}"><button class="image-button" data-image="${esc(key)}" aria-label="${esc(im.caption)} 크게 보기">${media}<span class="enlarge-label">${focus?'영역 확대 · 전체 화면 보기 ＋':'화면 크게 보기 ＋'}</span></button><figcaption>${caption}</figcaption></figure>`;
};
const panelHtml=p=>`<div class="teaching-panel"><div class="panel-label">${esc(p.label)}</div><strong>${esc(p.heading)}</strong><ul>${p.items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`;

const promptHtml=(key,n,short=false)=>{const label=key==='agent'?'에이전트 지시문':key==='schoolCode'?'동성고 가입 인증코드':'실습 문구';const button=key==='agent'?'지시문':key==='schoolCode'?'인증코드':'문구';return `<div class="prompt-box${short?' short':''}${key==='schoolCode'?' school-code':''}"><div class="prompt-head"><strong>${label}</strong><button data-copy="${esc(key)}" data-target="prompt-${n}" aria-label="${button} 복사">${button} 복사</button></div><textarea id="prompt-${n}" readonly aria-label="${label}" rows="${key==='schoolCode'?1:key==='agent'?(short?4:10):3}">${esc(prompts[key])}</textarea><pre class="print-prompt">${esc(prompts[key])}</pre><span class="copy-hint">복사가 막히면 문구를 선택해 Ctrl + C를 누르세요.</span></div>`;};
const independentHelp=s=>{
 const h=s.learning;if(!h)return '';
 const button=x=>`<a class="study-action" href="${esc(x.href)}"${x.type==='newtab'?' target="_blank" rel="noopener"':x.type==='download'?' download':''}>${esc(x.label)}${x.type==='newtab'?' ↗':''}</a>`;
 return `<section class="independent-help"><strong>혼자 시작하기 · ${esc(h.method)}</strong><p class="learning-goal"><b>이 항목의 완료 기준</b><br>${esc(s.check)}</p><p>${esc(h.ready)}</p>${h.prerequisites.length?`<nav class="prerequisite-list" aria-label="먼저 준비할 교안"><span>먼저 확인할 상태</span>${h.prerequisites.map(x=>`<div>${button(x)}<p>${esc(x.check)}</p></div>`).join('')}</nav>`:''}<nav class="learning-links" aria-label="실습 시작 링크">${h.links.map(button).join('')}</nav><p class="study-link-help">필요한 화면은 별도 탭에서 열어 교안과 번갈아 봅니다.${h.links.some(x=>x.type==='download')?' TXT가 화면에 열리면 Ctrl+S로 저장하고, 붙여넣기 방식은 문서명·쪽수·본문 전체를 복사합니다.':''}</p></section>`;
};

const selfStudyHtml=(s,token)=>{
 const p=s.selfStudy;
 const nav=(x,label)=>x?`<a href="#${esc(x.id)}">${label} · ${esc(x.title)}</a>`:'';
 return `<section class="study-start"><span class="study-kind">${esc(p.kind)}</span><h3>이번 항목에서 할 일</h3><p>${esc(s.lead)}</p><p class="study-entry"><strong>시작 위치</strong>${esc(p.start)}</p></section>
 ${independentHelp(s)}<h3>핵심 내용</h3>${list(s.bullets)}<h3>1. 시작 전 준비</h3>${list(p.prepare)}
 <h3>2. 화면에서 찾을 곳</h3>${table([['위치·메뉴','이렇게 읽습니다'],...p.screen])}
 <h3>3. 순서대로 따라 하기</h3><ol class="steps">${s.steps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>
 <div class="study-example"><strong>입력·판단 예</strong><p>${esc(p.example)}</p></div>
 ${s.prompt?`<h3>복사할 전체 문구${s.prompt==='schoolCode'?' · 학교 가입코드':''}</h3>${p.copyHelp?`<p>${esc(p.copyHelp)}</p>`:''}${promptHtml(s.prompt,token)}`:''}
 ${(s.image||s.contextImage||s.detailImage)?`<h3>화면과 대조하기</h3>${s.captureGuidance?`<p class="capture-guidance">${esc(s.captureGuidance)}</p>`:""}<p class="study-image-help">이미지를 누르면 원본이 크게 열립니다. 캡처의 계정·날짜·입력 상태는 촬영 당시의 예이며, 본인 화면에서는 아래 확인 기준으로 판단하세요.</p>${s.contextImage?figure(s.contextImage):''}${s.image?figure(s.image,false,s.guideFocus):''}${s.detailImage?figure(s.detailImage):''}`:''}
 ${s.notice?noticeHtml():''}${s.table?`<h3>내용을 비교해 읽기</h3>${table(s.table)}`:''}${s.diagram?diagram(s.diagram):''}${s.panel?panelHtml(s.panel):''}
 <div class="expected"><strong>예상 결과</strong><p>${esc(s.expected||s.check)}</p></div>
 <h3>4. 혼자 완료 확인</h3><ul class="study-checks">${[s.check,...p.checks].filter((x,i,a)=>a.indexOf(x)===i).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
 <h3>5. 막히면 이렇게 해결</h3>${table([['증상·상황','먼저 확인할 것과 대안'],...p.trouble])}
 ${s.link?`<p class="source-link">${link(s.link)}</p>`:''}${s.source?`<p class="source-link">${link(sources[s.source])}</p>`:''}${p.related?`<p class="study-related"><a href="${esc(p.related.href)}">${esc(p.related.label)} ↗</a></p>`:''}
 ${p.evidence.length?`<details class="study-evidence"><summary>자료의 범위·확인할 점</summary>${list(p.evidence)}</details>`:''}
 ${s.extraGuide?.map((extra,j)=>`<section class="related-guide"><h3>${esc(extra.title)}</h3><p>${esc(extra.lead)}</p>${guideBody(extra,`extra-${token}-${j}`)}</section>`).join('')||''}
 <nav class="study-next" aria-label="교안 순서">${nav(p.previous,'← 앞 항목')}${nav(p.next,'다음 항목 →')}</nav>`;
};

const guideBody=(s,token)=>s.selfStudy?selfStudyHtml(s,token):`${s.captureGuidance?'<p class="capture-guidance">'+esc(s.captureGuidance)+'</p>':''}${s.contextImage?figure(s.contextImage):''}${s.image?figure(s.image,false,s.guideFocus):''}${s.detailImage?figure(s.detailImage):''}${s.notice?noticeHtml():''}${s.table?table(s.table):''}${s.diagram?diagram(s.diagram):''}<div class="expected"><strong>예상 결과</strong><p>${esc(s.expected||s.check)}</p></div><h3>따라 하기</h3><ol class="steps">${s.steps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>${s.prompt?promptHtml(s.prompt,token):''}<div class="check-line"><strong>완료 확인</strong><p>${esc(s.check)}</p></div>${s.tip||fallbacks[s.section]?`<div class="help-line"><strong>함께 확인</strong><p>${esc(s.tip||fallbacks[s.section])}</p></div>`:''}${s.link?`<p class="source-link">${link(s.link)}</p>`:''}${s.source?`<p class="source-link">${link(sources[s.source])}</p>`:''}${s.extraGuide?.map((extra,j)=>`<div class="related-guide"><h3>${esc(extra.title)}</h3><p>${esc(extra.lead)}</p>${guideBody(extra,`extra-${token}-${j}`)}</div>`).join('')||''}`;
const sizeStudyPrompts=()=>{if(page!=='guide')return;document.querySelectorAll('details.guide-section[open] .prompt-box textarea').forEach(a=>{a.style.height='auto';a.style.height=(a.scrollHeight+3)+'px';});};
 document.addEventListener('toggle',e=>{if(e.target.matches?.('details.guide-section')&&e.target.open)requestAnimationFrame(sizeStudyPrompts);},true);
 window.addEventListener('resize',sizeStudyPrompts);
 let evidencePrint=[];
 window.addEventListener('beforeprint',()=>{evidencePrint=[...document.querySelectorAll('.study-evidence')].map(e=>[e,e.open]);evidencePrint.forEach(([e])=>e.open=true);});
 window.addEventListener('afterprint',()=>evidencePrint.forEach(([e,open])=>e.open=open));
 let toastTimer;
function toast(msg){const t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('visible'),4000);}
const fallbacks={
'Windows':'메뉴가 다르면 Windows 설정 검색이나 공식 도움말에서 기능 이름을 찾습니다. 지원되지 않는 OCR·Click to Do는 수동 입력과 캡처로 진행합니다.',
'senedu':'접속이 막히면 로그인 방식과 계정을 먼저 확인합니다. 인증은 본인이 진행하고, 서비스 화면과 오류 내용만 강사에게 알려 주세요.',
'Gemini 교육용':'학교 계정에서 메뉴가 없으면 관리자 활성화·연령·라이선스를 확인합니다. 권한을 임의로 바꾸지 않고 시연과 교안으로 흐름을 살펴봅니다.',
'Microsoft 계정 생성':'학교 선택과 기존 계정 여부부터 확인합니다. 가입·본인 인증·암호 입력은 본인이 진행합니다.',
'Office 365':'앱 설치 메뉴가 없으면 로그인 계정·실제 배정 A3 제품·관리자의 설치 허용을 확인합니다.',
'Copilot':'학교 계정·Copilot 허용 설정·실제 배정 라이선스를 확인합니다. 화면의 메뉴와 한도는 계정에 따라 달라질 수 있습니다.',
'SenGPT · 나만의 에이전트':'버튼이 다르면 같은 기능 이름을 찾습니다. 모델이나 사용량이 부족하면 반복 실행을 멈추고 강사 시연을 봅니다.',
'SenGPT 확인·수정':'원하는 답이 없으면 빠진 조건을 구체적으로 다시 적습니다. 확정하지 않은 사실은 [확인 필요]로 유지합니다.',
'SenGPT · 예약':'예약이 없거나 설정이 다르면 계정·에이전트·시각부터 확인합니다. 실행 여부는 실행 이력에서 읽습니다.',
'NAVER WORKS':'상대가 보이지 않으면 학교 계정과 조직을 확인합니다. 수신자를 정확히 찾기 전에는 보내지 않습니다.',
'Google Drive':'파일이 없으면 업로드 완료와 현재 폴더를 확인합니다. 열리지 않으면 수신자 계정·공유 대상·권한을 확인합니다.',
'WORKS Drive':'공유 항목이 다르면 학교 정책과 권한을 확인합니다. 필요한 공유 방식이 없을 때 공개 범위를 넓혀 해결하지 않습니다.'
};
function addCommon(){
 document.addEventListener('click',async e=>{
  const imageButton=e.target.closest('[data-image]');
  if(imageButton){const im=images[imageButton.dataset.image],d=document.getElementById('image-view'); document.getElementById('zoom-image').src=im.src;document.getElementById('zoom-image').alt=im.caption;document.getElementById('image-title').textContent=im.caption;document.getElementById('image-caption').textContent=metadata(im);d.showModal();return;}
  const close=e.target.closest('.close-dialog');if(close){close.closest('dialog').close();return;}
  const copy=e.target.closest('[data-copy]');if(copy){
   const text=prompts[copy.dataset.copy];
   try{if(!navigator.clipboard?.writeText)throw new Error('No clipboard');await Promise.race([navigator.clipboard.writeText(text),new Promise((_,reject)=>setTimeout(()=>reject(new Error("Clipboard timeout")),1000))]);toast('복사했습니다. 원하는 입력칸에 붙여 넣으세요.');}
   catch{const area=document.getElementById(copy.dataset.target);area.focus();area.select();toast('문구를 선택했습니다. Ctrl + C를 눌러 복사하세요.');}
  }
 });
 document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
}
if(page==='slides'){
 let i=0;
 const stage=document.getElementById('main'),overview=document.getElementById('overview');
 function visual(s){if(s.panel)return panelHtml(s.panel);if(s.image)return figure(s.image,true,s.focus);if(s.notice)return noticeHtml();if(s.table)return table(s.table);if(s.diagram)return diagram(s.diagram);if(s.prompt)return promptHtml(s.prompt,s.n,true);return `<div class="word-visual"><span>${esc(s.section)}</span><strong>${esc(s.bullets[0])}</strong></div>`;}
 function render(){
  const s=slides[i];stage.className=`slide-stage ${s.layout||''} ${s.image?'has-image':''} ${s.image&&['agent-form','schedule-form','schedule-edit','drive-new','works-new','sen-login','sengpt-schedule-form'].includes(s.image)?'portrait':''}`;
  if(s.layout==='institution')stage.innerHTML=`<article class="institution-cover"><div class="institution-image">${figure('jungbu',true)}</div><div class="event-panel"><div class="eyebrow">동성고등학교 교사 연수</div><h1>SENschool과<br>AI·디지털 도구 활용</h1><p class="event-date">2026.10.27.(화)<br><strong>14:00–16:00 · 120분</strong></p><p>종로산업정보학교 <strong>이진선</strong></p><p class="cover-goal">학교의 계획을 근거로,<br>교사가 확인하고 수정하는 수업 자료</p><a href="practice/index.html">실습 자료 바로 열기 ↗</a></div></article>`;
  else if(s.layout==='cover')stage.innerHTML=`<article class="cover-article"><div class="eyebrow">교사를 위한 디지털 도구 실습</div><h1>${esc(s.title)}</h1><p class="cover-lead">${esc(s.lead)}</p>${list(s.bullets)}<div class="cover-mark" aria-hidden="true">SEN<span>학교의 일상을 돕는 도구</span></div></article>`;
  else if(s.layout==='divider')stage.innerHTML=`<article class="divider-article"><div class="eyebrow">${esc(s.section)}</div><h1>${esc(s.title)}</h1><p>${esc(s.lead)}</p>${list(s.bullets)}${s.diagram?diagram(s.diagram):''}</article>`;
  else stage.innerHTML=`<article class="slide-article"><div class="slide-heading"><div class="eyebrow">${esc(s.section)} <span class="mode-badge">${esc(s.mode)}</span><span class="unit-time">${esc(s.time)}</span></div><h1>${esc(s.title)}</h1><p class="slide-lead">${esc(s.lead)}</p></div><div class="slide-body"><div class="slide-text">${list(s.bullets)}<div class="slide-guide-range">상세 교안 · ${s.guideRanges.map(([a,b])=>`<a href="guide.html?slide=${s.id}#s${String(a).padStart(2,"0")}">${a===b?a:a+"–"+b} ↗</a>`).join(" · ")}</div></div><div class="slide-visual">${visual(s)}</div></div></article>`;
  document.getElementById('notes-link').href=`speaker-notes.html#${s.id}`;
  const skip=document.getElementById('skip-unit');skip.hidden=!s.section.startsWith('05');skip.onclick=()=>{location.hash=slides.find(x=>x.section.startsWith('06')).id;};
  document.getElementById('counter').textContent=`${i+1} / ${slides.length}`;
  document.getElementById('progress-fill').style.width=`${(i+1)/slides.length*100}%`;
  document.getElementById('guide-link').href=`guide.html?slide=${s.id}#${s.primaryGuide}`;
  document.getElementById('slide-number').value=s.n;
  document.getElementById('prev').disabled=i===0;document.getElementById('next').disabled=i===slides.length-1;
  document.title=`${i+1} · ${s.title} · 동성고 연수`;
 }
 function hashRead(){const match=location.hash.match(/^#p(\d+)$/);i=match?Math.min(slides.length-1,Math.max(0,Number(match[1])-1)):0;render();}
 function go(n){n=Math.min(slides.length-1,Math.max(0,n));if(n===i)return;location.hash=slides[n].id;}
 document.getElementById('prev').onclick=()=>go(i-1);document.getElementById('next').onclick=()=>go(i+1);
 let section='';document.getElementById('overview-list').innerHTML=slides.map(s=>{const h=s.section!==section?`<h3>${esc(s.section)}</h3>`:'';section=s.section;return `${h}<button data-slide="${s.n}"><span>${String(s.n).padStart(2,'0')}</span>${esc(s.title)}</button>`;}).join('');
 document.getElementById('overview-btn').onclick=()=>overview.showModal();overview.addEventListener('click',e=>{const b=e.target.closest('[data-slide]');if(b){overview.close();go(Number(b.dataset.slide)-1);}});
 async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{toast('브라우저 메뉴의 전체 화면 기능을 사용해 주세요.');}}
 document.getElementById('fullscreen-btn').onclick=fullscreen;document.addEventListener('fullscreenchange',()=>document.getElementById('fullscreen-btn').textContent=document.fullscreenElement?'전체 화면 해제':'전체 화면');
 document.addEventListener('keydown',e=>{
  if(document.querySelector('dialog[open]')||e.ctrlKey||e.metaKey||e.altKey||e.target.matches('textarea,input,select')||e.target.isContentEditable)return;
  if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();go(i+1);}else if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();go(i-1);}else if(e.key==='Home'){e.preventDefault();go(0);}else if(e.key==='End'){e.preventDefault();go(slides.length-1);}else if(e.key.toLowerCase()==='f'){e.preventDefault();fullscreen();}
 });
 const search=document.getElementById('slide-search'),found=document.getElementById('slide-found'),number=document.getElementById('slide-number');
number.max=slides.length;
function filterOverview(){const q=search.value.trim().toLocaleLowerCase('ko-KR');let total=0;document.querySelectorAll('[data-slide]').forEach(b=>{b.hidden=!!q&&![b.textContent,...(slides[Number(b.dataset.slide)-1].bullets||[]),...(slides[Number(b.dataset.slide)-1].table||[]).flat(),...(window.DONGSUNG_RELATIONS?.[slides[Number(b.dataset.slide)-1].id]?.guides||[]).map(x=>x.title)].join(' ').toLocaleLowerCase('ko-KR').includes(q);if(!b.hidden)total++});const hs=[...document.querySelectorAll('#overview-list h3')];for(const h of hs){let x=h.nextElementSibling,any=false;while(x&&x.tagName!=='H3'){if(!x.hidden)any=true;x=x.nextElementSibling}h.hidden=!any;}found.textContent=total+' / '+slides.length+'장';}
search.addEventListener('input',filterOverview);filterOverview();
document.getElementById('jump-slide').onclick=()=>{const n=Number(number.value);if(Number.isInteger(n)&&n>=1&&n<=slides.length)go(n-1);else toast('1~'+slides.length+' 사이의 번호를 입력하세요.');};
number.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();document.getElementById('jump-slide').click();}});

window.addEventListener('hashchange',hashRead);hashRead();addCommon();
}
function refreshSlideContext(){
 if(page!=='guide')return;
 const id=location.hash.slice(1),pId=routes.guideToPresentation[id]||new URLSearchParams(location.search).get('slide'),r=window.DONGSUNG_RELATIONS?.[pId];
 let box=document.getElementById('slide-context');
 if(!r){if(box)box.remove();return;}
 if(!box){box=document.createElement('section');box.id='slide-context';box.className='slide-context';}
 const head=document.querySelector('#'+id+' > .guide-detail > .guide-section-head');
 if(head)head.insertAdjacentElement('afterend',box);else document.querySelector('.guide-intro').insertAdjacentElement('afterend',box);
 box.innerHTML=`<div class="eyebrow">이 발표 장의 상세 교안 ${r.guides.length}항목</div><h2>발표 ${r.n} · ${esc(r.title)}</h2><p>${r.guides.length>1?'필요한 항목을 고르면 해당 조작 순서가 펼쳐집니다.':'이 항목과 연결된 발표 장입니다.'}</p><details class="related-sections"${new URLSearchParams(location.search).get("slide")===r.id?" open":""}><summary>관련 교안 ${r.guides.length}항목 보기</summary><ul>${r.guides.map(g=>`<li${g.id===id?' class="current-guide"':''}><a href="?slide=${r.id}#${g.id}">교안 ${g.n} · ${esc(g.title)}</a></li>`).join('')}</ul></details><a href="slides.html#${r.id}">발표 ${r.n}쪽으로 돌아가기 ↗</a>`;
}
if(page==='guide'){
 window.addEventListener('hashchange',refreshSlideContext);
 window.addEventListener('DOMContentLoaded',refreshSlideContext);
}

if(page==='guide'){
 const byId=new Map(slides.map(s=>[s.id,s]));
 const searchText=new Map(slides.map(s=>[s.id,[s.section,s.title,s.lead,...s.bullets,...s.steps,s.check,s.tip||'',s.prompt?prompts[s.prompt]:''].join(' ').normalize('NFKC').toLocaleLowerCase('ko-KR')]));
 let section='';
 document.getElementById('toc-list').innerHTML=slides.map(s=>{
  const h=s.section!==section?'<h3 data-toc-group="'+esc(s.section)+'">'+esc(s.section)+'</h3>':'';section=s.section;
  return h+'<a href="#'+s.id+'" data-guide-id="'+s.id+'"><span>'+String(s.n).padStart(2,'0')+'</span>'+esc(s.title)+'</a>';
 }).join('');
 const jump=document.getElementById('jump');
 jump.innerHTML='<option value="">항목 선택</option>'+slides.map(s=>'<option value="'+s.id+'">'+s.n+'. '+esc(s.title)+'</option>').join('');
 jump.onchange=()=>{if(jump.value)location.hash=jump.value;};
 section='';
 document.getElementById('guide-content').innerHTML=slides.map(s=>{
  const heading=s.section!==section?'<h2 class="guide-group-title" data-content-group="'+esc(s.section)+'">'+esc(s.section)+'</h2>':'';section=s.section;
  const related=routes.guideToPresentation[s.id];
  const number=Number(related.slice(1));
  return heading+'<details class="guide-section" id="'+s.id+'"><summary><span class="guide-number">'+String(s.n).padStart(2,'0')+'</span><h2>'+esc(s.title)+'</h2></summary><div class="guide-detail"><div class="guide-section-head"><span>'+esc(s.section)+' · '+esc(s.mode)+' · '+esc(s.time)+'</span><a href="slides.html#'+related+'">관련 발표 '+number+' ↗</a></div><p class="guide-lead">'+esc(s.lead)+'</p>'+guideBody(s,'detail-'+s.n)+'</div></details>';
 }).join('');
 const entries=Array.from(document.querySelectorAll('details.guide-section'));
 const entryById=new Map(entries.map(e=>[e.id,e]));
 const navLinks=Array.from(document.querySelectorAll('[data-guide-id]'));
 const input=document.getElementById('guide-search');
 function filterGuide(){
  const query=input.value.trim().normalize('NFKC').toLocaleLowerCase('ko-KR');
  let visible=0;const groups=new Set();
  entries.forEach(e=>{e.hidden=!!query&&!searchText.get(e.id).includes(query);if(!e.hidden){visible++;groups.add(byId.get(e.id).section);}});
  navLinks.forEach(a=>a.hidden=entryById.get(a.dataset.guideId).hidden);
  document.querySelectorAll('[data-toc-group]').forEach(h=>h.hidden=!groups.has(h.dataset.tocGroup));
  document.querySelectorAll('[data-content-group]').forEach(h=>h.hidden=!groups.has(h.dataset.contentGroup));
  document.getElementById('guide-result').textContent=query?visible+'개 항목을 찾았습니다.':slides.length+'개 항목 · 필요한 항목을 펼쳐 보세요.';
 }
 function revealGuide(){
  const id=location.hash.slice(1),entry=entryById.get(id);if(!entry)return;
  if(entry.hidden){input.value='';filterGuide();}
  entry.open=true;jump.value=id;
  navLinks.forEach(a=>a.classList.toggle('active',a.dataset.guideId===id));
  requestAnimationFrame(()=>entry.scrollIntoView({block:'start'}));
 }
 input.addEventListener('input',filterGuide);
 document.getElementById('guide-expand').onclick=()=>entries.filter(e=>!e.hidden).forEach(e=>e.open=true);
 document.getElementById('guide-collapse').onclick=()=>entries.forEach(e=>e.open=false);
 let printState=null;
 function preparePrint(){if(printState)return;printState=entries.map(e=>({entry:e,open:e.open,hidden:e.hidden}));entries.forEach(e=>{e.open=true;e.hidden=false;});}
 function restorePrint(){if(!printState)return;printState.forEach(s=>{s.entry.open=s.open;s.entry.hidden=s.hidden;});printState=null;}
 window.addEventListener('beforeprint',preparePrint);window.addEventListener('afterprint',restorePrint);
 document.getElementById('print-btn').onclick=()=>{preparePrint();window.print();};
 window.addEventListener('hashchange',revealGuide);
 filterGuide();revealGuide();addCommon();
}
if(page==='resources'){
 const google=['plus','editions','notebook','classroom','classnotebook'];
 document.getElementById('google-links').innerHTML=`<ul>${google.map(k=>`<li>${link(sources[k])}</li>`).join('')}</ul>`;
 const microsoft=['msjoin','msapps','msinstall','msactivate','mslicense','copilot','copilotwork','study'];
 document.getElementById('microsoft-links').innerHTML=`<ul>${microsoft.map(k=>`<li>${link(sources[k])}</li>`).join('')}</ul>`;
 document.getElementById('other-links').innerHTML=`<ul>${Object.entries(sources).filter(([k])=>!google.includes(k)&&!microsoft.includes(k)).map(([,s])=>`<li>${link(s)}</li>`).join('')}</ul>`;
 document.getElementById('capture-list').innerHTML=`<div class="table-wrap"><table><thead><tr><th>화면</th><th>서비스·시점</th><th>조건</th></tr></thead><tbody>${Object.values(images).map(im=>`<tr><td><a href="${esc(im.src)}" target="_blank" rel="noopener">${esc(im.caption)}</a></td><td>${esc(im.service)}<br>${esc(im.date)}</td><td>${esc(im.kind)}<br>${esc(im.account)} · ${esc(im.version)}</td></tr>`).join('')}</tbody></table></div>`;
}
})();

