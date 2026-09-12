const COACH_CARD_PORTRAITS={
 corey:"assets/coach-cards/corey-coach-card.webp",
 jared:"assets/coach-cards/jared-coach-card.webp",
 saif:"assets/coach-cards/saif-coach-card.webp",
 pete:"assets/coach-cards/pete-coach-card.webp"
};
const COACH_CARD_IDENTITIES={
 corey:{archetype:"Field General",mantra:"BUILD • DEVELOP • WIN"},
 jared:{archetype:"Program Builder",mantra:"LEAD • DEVELOP • COMPETE"},
 saif:{archetype:"The Tactician",mantra:"CULTURE • DISCIPLINE • RESULTS"},
 pete:{archetype:"The Closer",mantra:"RECRUIT • DEVELOP • COMPETE"}
};
function coachCardKey(name){return String(name||"").trim().toLowerCase().split(/\s+/)[0]||"coach"}
function coachCardProgram(c){
 const active=state.programs.find(p=>String(p.person_id)===String(c.person_id));
 const hist=[...(state.allGames||state.games||[])].filter(g=>String(g.person_id)===String(c.person_id)&&g.team_name).sort((a,b)=>Number(b.season_number||0)-Number(a.season_number||0)||Number(b.week_number||0)-Number(a.week_number||0));
 const stop=[...(state.careerStops||[])].filter(x=>String(x.person_id)===String(c.person_id)).sort((a,b)=>Number(b.season_number||0)-Number(a.season_number||0))[0];
 const team=active?.team_name||hist[0]?.team_name||stop?.team_name||"Dynasty Legacy";
 const logo=active?.logo_url||window.CDHQLogoResolver?.knownLogo?.(team)||"";
 return {active:!!active,team,logo,conference:active?.conference||stop?.conference||""};
}
function coachCardSeasonRows(c,games){
 const by=new Map();
 games.filter(g=>String(g.person_id)===String(c.person_id)).forEach(g=>{
   const season=Number(g.season_number||0),team=g.team_name||"Program",key=`${season}|${team}`;
   if(!by.has(key))by.set(key,{season,team,w:0,l:0,pf:0,pa:0,rankedWins:0,otW:0,otL:0});
   const r=by.get(key);if(g.result==="W")r.w++;if(g.result==="L")r.l++;r.pf+=Number(g.points_for||0);r.pa+=Number(g.points_against||0);if(g.result==="W"&&Number(g.opponent_rank)>0)r.rankedWins++;if(g.overtime){if(g.result==="W")r.otW++;if(g.result==="L")r.otL++;}
 });
 return [...by.values()].sort((a,b)=>b.season-a.season||a.team.localeCompare(b.team)).map(r=>({...r,gp:r.w+r.l,pct:(r.w+r.l)?(r.w/(r.w+r.l))*100:0,pd:r.pf-r.pa}));
}
function coachTradingCard(c,index,games){
 const key=coachCardKey(c.coach_name),program=coachCardProgram(c),identity=COACH_CARD_IDENTITIES[key]||{archetype:(typeof storyLore==="function"?storyLore({...c,team_name:program.team}).archetype:"Coach"),mantra:"BUILD • DEVELOP • COMPETE"};
 const portrait=COACH_CARD_PORTRAITS[key]||"assets/saturday-foundry-hero-wordless.webp";
 const rows=coachCardSeasonRows(c,games),gp=Number(c.games_played||((Number(c.wins||0)+Number(c.losses||0)))),pct=gp?((Number(c.wins||0)/gp)*100).toFixed(1):"0.0";
 const winPct=gp?`${pct}%`:"—",pd=Number(c.point_differential||0),record=`${Number(c.wins||0)}-${Number(c.losses||0)}`,ot=`${Number(c.overtime_wins||0)}-${Number(c.overtime_losses||0)}`;
 const quote=key==="saif"?"Discipline creates opportunity.":key==="jared"?"Build people. Win games. Leave a legacy.":key==="corey"?"People. Process. Progress.":key==="pete"?"Pressure creates better people.":"Your dynasty, forged on Saturdays.";
 const seasonMarkup=rows.map(r=>`<tr><td>S${r.season}</td><td>${esc(r.team)}</td><td>${r.w}-${r.l}</td><td>${r.pct.toFixed(1)}%</td><td>${r.pf}</td><td>${r.pa}</td><td class="${r.pd>=0?'pos':'neg'}">${signed(r.pd)}</td><td>${r.rankedWins}</td><td>${r.otW}-${r.otL}</td></tr>`).join("")||'<tr><td colspan="9">No completed season data yet.</td></tr>';
 const lore=(typeof storyLore==="function")?storyLore({...c,team_name:program.team}):null;
 const bio=lore?.bio||`${c.coach_name}'s coaching history is preserved season by season as the dynasty evolves.`;
 return `<article class="coach-trading-card" data-coach-card="${esc(c.person_id)}" aria-label="${esc(c.coach_name)} coach trading card">
   <div class="coach-card-inner">
     <section class="coach-card-face coach-card-front" aria-hidden="false">
       <img class="coach-card-photo" src="${esc(portrait)}" alt="AI-generated Saturday Foundry portrait of ${esc(c.coach_name)}">
       <div class="coach-card-chrome"></div>
       <div class="coach-card-front-top"><div class="coach-card-brand"><img src="assets/saturday-foundry-shield.webp" alt=""><span>SATURDAY<br>FOUNDRY</span></div><div class="coach-card-number">#${String(index+1).padStart(2,"0")}<small>Coach Card</small></div></div>
       <div class="coach-card-front-copy"><span class="coach-card-archetype">${esc(identity.archetype)}</span><div class="coach-card-name">${esc(c.coach_name)}</div><div class="coach-card-team">${program.logo?`<img src="${esc(program.logo)}" alt="">`:''}<span>${esc(program.team)}</span></div><div class="coach-card-mantra">${esc(identity.mantra)}</div><div class="coach-card-front-stats"><div><small>Career Record</small><b>${record}</b></div><span class="coach-card-status ${program.active?'':'retired'}">${program.active?'Active':'Retired'}</span><div><small>Win %</small><b>${winPct}</b></div></div></div>
       <button type="button" class="coach-card-flip" data-coach-card-flip aria-label="View ${esc(c.coach_name)} statistics">Stats ↻</button>
     </section>
     <section class="coach-card-face coach-card-back" aria-hidden="true">
       <div class="coach-card-back-scroll">
         <header class="coach-card-back-head"><span class="coach-card-back-brand">Saturday Foundry · Coach Card #${String(index+1).padStart(2,"0")}</span><h4>${esc(c.coach_name)}</h4><p>${esc(identity.archetype)} · ${esc(program.team)}</p><em>“${esc(quote)}”</em></header>
         <div class="coach-card-back-section"><span>Season-by-Season Record</span><div class="table-wrap"><table class="coach-card-season-table"><thead><tr><th>S</th><th>Team</th><th>Rec</th><th>Win%</th><th>PF</th><th>PA</th><th>PD</th><th>RK W</th><th>OT</th></tr></thead><tbody>${seasonMarkup}</tbody></table></div>
           <div class="coach-card-career-total"><div class="record"><small>Career</small><b>${record}</b></div><div><small>Win%</small><b>${winPct}</b></div><div><small>PF</small><b>${Number(c.points_for||0)}</b></div><div><small>PA</small><b>${Number(c.points_against||0)}</b></div><div><small>PD</small><b class="${pd>=0?'pos':'neg'}">${signed(pd)}</b></div><div><small>RK W</small><b>${Number(c.ranked_wins||0)}</b></div><div><small>OT</small><b>${ot}</b></div></div>
         </div>
         <div class="coach-card-back-section"><span>Coach Chronicle Profile</span><div class="coach-card-back-bio">${esc(bio)}</div></div>
         <div class="coach-card-back-footer">Your dynasty, forged on Saturdays.</div>
       </div>
       <button type="button" class="coach-card-flip" data-coach-card-flip aria-label="Return to ${esc(c.coach_name)} portrait">Portrait ↻</button>
     </section>
   </div>
 </article>`;
}
function initCoachTradingCards(){
 const host=$("coachRecordCards");if(!host)return;
 host.querySelectorAll("[data-coach-card]").forEach(card=>{
   card.querySelectorAll("[data-coach-card-flip]").forEach(btn=>btn.addEventListener("click",e=>{e.stopPropagation();const flipped=card.classList.toggle("is-flipped");card.querySelector(".coach-card-front")?.setAttribute("aria-hidden",String(flipped));card.querySelector(".coach-card-back")?.setAttribute("aria-hidden",String(!flipped));}));
 });
}
