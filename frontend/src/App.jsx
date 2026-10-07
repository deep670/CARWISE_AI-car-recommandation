import React, {useEffect, useMemo, useState} from "react";
import {Routes, Route, Link, useLocation, useNavigate, useParams} from "react-router-dom";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, BatteryCharging, Bell, Bookmark, Calculator,
  Bot, CalendarDays, CarFront, Check, ChevronDown, ChevronRight, CircleUserRound,
  Compass, Gauge, GitCompare, Heart, House, LogIn, Menu, MessageCircle,
  Moon, Search, ShieldCheck, Sparkles, Star, Sun, UserRound, X, Zap, WalletCards, Fuel, CircleDollarSign
} from "lucide-react";
import api from "./lib/api";
import {brands, cars, popularCars, evCars, luxuryCars, upcoming, heroImage, brandLogo} from "./data";

const fallbackImage = "https://upload.wikimedia.org/wikipedia/commons/6/6e/Car_front_view.jpg";

function getUser(){ try{return JSON.parse(localStorage.getItem("carwise_user")||"null")}catch{return null} }
function getToken(){return localStorage.getItem("carwise_token")}
function money(n){ return n === undefined ? "Price on request" : `₹${Number(n).toFixed(2)} Lakh`; }
function resolveCar(id){
  const direct=cars.find(c=>c.id===id) || luxuryCars.find(c=>c.id===id);
  if(direct) return direct;
  const m=String(id||"").match(/^(.*)-(\d+)$/);
  if(!m) return null;
  const b=brands.find(x=>x.slug===m[1]);
  const idx=Number(m[2]);
  if(!b || !b.models[idx]) return null;
  const model=b.models[idx];
  return {id,brand:b.name,name:model,brandSlug:b.slug,price:undefined,body:"Car",fuel:"Petrol",trans:"Automatic",seats:5,score:8.5,safety:"Safety features vary by variant",wikiTitle:`${b.name} ${model}`,description:`Explore ${model} from ${b.name} with CARWISE model information and buyer-focused context.`,features:["Connected technology","Infotainment","Safety assist"]};
}

function WikiImage({car,className="",eager=false}){
  const [src,setSrc]=useState(car?.img||"");
  useEffect(()=>{
    let live=true;
    if(!src && car?.wikiTitle){
      fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(car.wikiTitle)}`)
        .then(r=>r.ok?r.json():null)
        .then(d=>{if(live && d?.originalimage?.source) setSrc(d.originalimage.source)})
        .catch(()=>{});
    }
    return ()=>{live=false};
  },[car?.wikiTitle]);
  return <img
    className={className}
    src={src||fallbackImage}
    alt={`${car?.brand||""} ${car?.name||"car"}`}
    loading={eager?"eager":"lazy"}
    onError={e=>{if(e.currentTarget.src!==fallbackImage)e.currentTarget.src=fallbackImage}}
  />;
}

function RequireAuth({children}){
  const nav=useNavigate();
  const location=useLocation();
  useEffect(()=>{
    if(!getToken()){
      const next=`${location.pathname}${location.search||""}`;
      nav(`/login?redirect=${encodeURIComponent(next)}`,{replace:true});
    }
  },[nav,location.pathname,location.search]);
  return getToken()?children:null;
}

function Nav({mobile,setMobile}){
  const user=getUser();
  const location=useLocation();
  const links=[
    ["/","Home",false],["/cars","Cars",true],["/brands","Brands",true],["/compare","Compare",true],
    ["/ai-advisor","AI Advisor",true],["/ev","EV Cars",true],["/upcoming","Upcoming",true],
    ["/reviews","Reviews",true],["/news","News",true]
  ];
  const nav=useNavigate();
  function go(path,protectedPage){
    if(protectedPage && !getToken()) return nav(`/login?redirect=${encodeURIComponent(path)}`);
    nav(path);
    setMobile(false);
  }
  return <header className="nav">
    <div className="container navInner">
      <Link className="logo" to="/" onClick={()=>setMobile(false)} aria-label="CARWISE home">
        <span className="logoIcon"><CarFront size={23}/></span>
        <span className="logoWord">CAR<span>WISE</span></span>
        <em>Find the Right Car, Not Just a Car.</em>
      </Link>
      <nav className={`navLinks ${mobile?"open":""}`}>
        {links.map(([path,label,prot])=><button key={label} className={location.pathname===path?"active":""} onClick={()=>go(path,prot)}>{label}</button>)}
      </nav>
      <div className="navRight">
        <button className="navSearchIcon" onClick={()=>go("/cars",true)} aria-label="Search cars"><Search size={18}/></button>
        <button className="navLogin" onClick={()=>go(user?"/dashboard":"/login",false)}>{user?"Account":"Login"}</button>
        {!user && <button className="navRegister" onClick={()=>go("/register",false)}>Register</button>}
        {user && <button className="navUser" onClick={()=>go("/dashboard",false)}><span className="avatar">{user?.name?user.name.slice(0,1).toUpperCase():"U"}</span></button>}
        <button className="navIcon" onClick={()=>go("/wishlist",true)} aria-label="Wishlist"><Heart size={17}/></button>
        <button className="hamb" onClick={()=>setMobile(!mobile)}>{mobile?<X/>:<Menu/>}</button>
      </div>
    </div>
  </header>;
}

function Page({children, className=""}){return <main className={`page ${className}`}><div className="container">{children}</div></main>}
function SectionHead({eyebrow,title,sub,link,to="/cars"}){return <div className="sectionHead"><div><div className="eyebrow">{eyebrow}</div><h2>{title}</h2>{sub&&<p>{sub}</p>}</div>{link&&<Link className="seeAll" to={getToken()?to:"/login"}>{link}<ChevronRight size={16}/></Link>}</div>}

function CarCard({car,home=false}){
  const [saved,setSaved]=useState(()=>JSON.parse(localStorage.getItem("carwise_wishlist")||"[]").includes(car.id));
  const nav=useNavigate();
  async function toggleSave(){
    if(!getToken()){nav("/login");return}
    let ids=JSON.parse(localStorage.getItem("carwise_wishlist")||"[]");
    ids=ids.includes(car.id)?ids.filter(x=>x!==car.id):[...ids,car.id];
    localStorage.setItem("carwise_wishlist",JSON.stringify(ids));
    setSaved(!saved);
    try{await api.post(`/wishlist/${car.id}`)}catch{}
  }
  return <article className="carCard">
    <div className="carImage">
      <WikiImage car={car} eager={home}/>
      <button className={`heart ${saved?"saved":""}`} onClick={toggleSave}>{saved?<Heart fill="currentColor" size={17}/>:<Heart size={17}/>}</button>
      <div className="scoreBadge"><Star size={11}/> {car.score}</div>
    </div>
    <div className="carBody">
      <div className="carBrand">{car.brand}</div>
      <div className="carTitleRow"><h3>{car.name}</h3><span className="tinyTag">{car.body}</span></div>
      <div className="carPrice">{money(car.price)} <small>onwards</small></div>
      <div className="metaRow"><span>{car.fuel}</span><span>{car.trans}</span><span>{car.seats} Seats</span></div>
      <div className="scoreRow"><span className="scorePill">CARWISE {car.score}</span><span className="matchPill">{car.fuel==="EV"?"EV":"Smart Pick"}</span></div>
      <div className="cardActions">
        <button onClick={()=>getToken()?nav(`/cars/${car.id}`):nav("/login")}>View Details</button>
        <button onClick={()=>getToken()?nav("/compare"):nav("/login")}><GitCompare size={13}/>Compare</button>
      </div>
    </div>
  </article>
}

function Home(){
  const nav=useNavigate();
  const logged=!!getToken();
  const trending=popularCars.slice(0,10);
  const [brandFilter,setBrandFilter]=useState("All");
  const filteredMore=useMemo(()=>{
    const list=brandFilter==="All"?cars:cars.filter(c=>c.brand===brandFilter);
    return list.slice(0,8);
  },[brandFilter]);
  const protect=(path)=>nav(logged?path:`/login?redirect=${encodeURIComponent(path)}`);
  return <>
    <section className="hero">
      <div className="container heroGrid">
        <div className="heroCopy">
          <div className="heroMiniNav"><span>DISCOVER</span><span>EXPLORE</span><span>COMPARE</span></div>
          <div className="badge"><Sparkles size={13}/> AI-POWERED CAR DISCOVERY</div>
          <h1>Find the Right Car,<br/><span>Not Just a Car.</span></h1>
          <p>Explore cars, compare features, discover AI recommendations and make a smarter car decision — all in one premium experience.</p>
          <div className="heroButtons">
            <button className="primary" onClick={()=>protect("/cars")}><CarFront size={15}/> Explore Cars <ArrowRight size={15}/></button>
            <button className="secondary" onClick={()=>protect("/ai-advisor")}><Bot size={15}/> Ask AI <ArrowRight size={15}/></button>
          </div>
          <div className="trustStats">
            <div><b>{cars.length}+</b><span>Cars</span></div><div><b>{brands.length}+</b><span>Brands</span></div><div><b>{evCars.length}+</b><span>EV Models</span></div><div><b>AI</b><span>Smart Picks</span></div>
          </div>
        </div>
        <div className="heroCarStage">
          <img src={heroImage} alt="Bugatti Chiron"/>
          <div className="heroCarLabel"><span>FEATURED SUPERCAR</span><b>Bugatti Chiron</b><small>Performance · Luxury · Innovation</small></div>
          <div className="heroDots"><span className="active"></span><span></span><span></span><button>‹</button><button>›</button></div>
        </div>
      </div>
    </section>

    <div className="container quickNavStrip">
      {[
        [CarFront,"Cars","Explore the catalogue","/cars"],[House,"Brands","All popular brands","/brands"],[GitCompare,"Compare","Compare your shortlist","/compare"],
        [Bot,"AI Advisor","Get expert advice","/ai-advisor"],[Zap,"EV Cars","Explore electric cars","/ev"],[CalendarDays,"Upcoming","Future launches","/upcoming"],
        [Star,"Reviews","Expert & user reviews","/reviews"],[Bookmark,"News","Latest auto news","/news"]
      ].map(([I,t,d,to])=><button key={t} className="quickNavCard" onClick={()=>protect(to)}><span className="quickIcon"><I size={19}/></span><span className="quickText"><b>{t}</b><small>{d}</small></span><ArrowRight size={14}/></button>)}
    </div>

    <Page>
      <section>
        <div className="sectionHead"><div><div className="eyebrow">TRENDING NOW</div><h2>Top Trending Cars</h2><p>10 popular models to start exploring.</p></div><button className="viewAllBtn" onClick={()=>protect("/cars")}>View All <ArrowRight size={15}/></button></div>
        <div className="carGrid homeCars">{trending.map(c=><CarCard key={c.id} car={c} home/>)}</div>
      </section>

      <section className="overviewSection">
        <div className="sectionHead"><div><div className="eyebrow">SHOP BY BUDGET</div><h2>Find cars around your budget</h2><p>Quick starting points for your next search.</p></div></div>
        <div className="budgetGrid">
          {[5,10,15,20,30,50].map(v=><button className="budgetCard" key={v} onClick={()=>protect(`/cars?budget=${v}`)}><span>Cars</span><b>{v<50?`Under ₹${v} Lakh`:`₹50 Lakh+`}</b><ArrowUpRight size={15}/></button>)}
        </div>
      </section>

      <section id="brandsPreview">
        <div className="sectionHead"><div><div className="eyebrow">BRANDS</div><h2>Explore by brand</h2><p>20+ marques, all in one place.</p></div><button className="viewAllBtn" onClick={()=>protect("/brands")}>All Brands <ArrowRight size={15}/></button></div>
        <div className="brandGrid homeBrandGrid">{brands.slice(0,20).map(b=><button className="brandCard" key={b.slug} onClick={()=>protect(`/brands/${b.slug}`)}><img src={brandLogo(b.icon)} alt="" onError={e=>e.currentTarget.style.display="none"}/><div className="brandFallback">{b.name.slice(0,2).toUpperCase()}</div><b>{b.name}</b><small>{b.models.length}+ models</small></button>)}</div>
      </section>

      <section className="homePromoGrid">
        <div className="promoCard promoEV" onClick={()=>protect("/ev")}>
          <div><div className="eyebrow green">ELECTRIC CARS</div><h3>Electric cars,<br/>explained simply.</h3><button className="secondary">Explore EV Cars <ArrowRight size={14}/></button></div>
          <div className="promoVisual evVisual"><div className="promoCarShape evShape"></div></div>
        </div>
        <div className="promoCard promoUpcoming" onClick={()=>protect("/upcoming")}>
          <div><div className="eyebrow">UPCOMING CARS</div><h3>See what's<br/>coming next.</h3><button className="secondary">View Upcoming <ArrowRight size={14}/></button></div>
          <div className="promoVisual"><div className="coveredCar"></div></div>
        </div>
        <div className="promoCard promoAI" onClick={()=>protect("/ai-advisor")}>
          <div><div className="eyebrow">CARWISE AI</div><h3>Personalized<br/>cars for you.</h3><button className="primary">Try AI Advisor <ArrowRight size={14}/></button></div>
          <div className="aiBotVisual"><div className="botHead">●‿●</div><div className="botBody"></div></div>
        </div>
      </section>

      <section className="overviewSection">
        <div className="sectionHead"><div><div className="eyebrow">WHY CARWISE</div><h2>More than a car catalogue</h2><p>Every tool is designed around the decision, not just the vehicle.</p></div></div>
        <div className="featureGrid">
          <button className="miniFeature" onClick={()=>protect("/ai-recommendations")}><Sparkles size={22}/><div><b>AI Recommendations</b><span>Match cars to your real priorities.</span></div><ArrowUpRight size={14}/></button>
          <button className="miniFeature" onClick={()=>protect("/compare")}><GitCompare size={22}/><div><b>Smart Comparison</b><span>Compare 2–4 cars side by side.</span></div><ArrowUpRight size={14}/></button>
          <button className="miniFeature" onClick={()=>protect("/tools/emi-calculator")}><Calculator size={22}/><div><b>EMI & Ownership Tools</b><span>Estimate EMI, running cost and ownership.</span></div><ArrowUpRight size={14}/></button>
          <button className="miniFeature" onClick={()=>protect("/dashboard")}><WalletCards size={22}/><div><b>My CARWISE</b><span>Wishlist, shortlist, history and Premium Garage.</span></div><ArrowUpRight size={14}/></button>
        </div>
      </section>

      {logged && <>
        <section className="memberSection">
          <div className="memberBanner"><div><div className="eyebrow">WELCOME BACK</div><h2>Your CARWISE experience is unlocked.</h2><p>Explore the full catalogue, AI tools and personalized recommendations.</p></div><button className="primary" onClick={()=>protect("/dashboard")}>Open Dashboard <ArrowUpRight size={14}/></button></div>
        </section>
        <section>
          <div className="sectionHead"><div><div className="eyebrow">FOR YOU</div><h2>More cars to explore</h2><p>Browse a larger slice of the CARWISE catalogue.</p></div><button className="viewAllBtn" onClick={()=>protect("/cars")}>Full Catalogue <ArrowRight size={15}/></button></div>
          <div className="luxTabs homeFilterTabs"><button className={brandFilter==="All"?"active":""} onClick={()=>setBrandFilter("All")}>All</button>{brands.slice(0,8).map(b=><button key={b.name} className={brandFilter===b.name?"active":""} onClick={()=>setBrandFilter(b.name)}>{b.name}</button>)}</div>
          <div className="carGrid catalogGrid">{filteredMore.map(c=><CarCard key={c.id} car={c}/>)}</div>
        </section>
        <section className="toolSection">
          <div className="sectionHead"><div><div className="eyebrow">CARWISE TOOLS</div><h2>Make the decision easier</h2><p>Useful calculations, all inside your account.</p></div></div>
          <div className="toolTiles">
            {[[Calculator,"EMI Calculator","Monthly EMI, interest and total payable","/tools/emi-calculator"],[WalletCards,"Affordability","Work out a comfortable price range","/tools/affordability"],[Fuel,"Running Cost","Estimate daily, monthly and annual cost","/tools/running-cost"],[CircleDollarSign,"Ownership Cost","Compare estimated 3–7 year cost","/tools/ownership-cost"],[BatteryCharging,"EV Tools","Range, charging cost and EV vs petrol","/tools/ev-tools"],[CarFront,"On-Road Price","Estimate city-based on-road cost","/tools/on-road-price"]].map(([I,t,d,to])=><button className="toolTile" key={t} onClick={()=>protect(to)}><span><I size={18}/></span><div><b>{t}</b><small>{d}</small></div><ArrowUpRight size={14}/></button>)}
          </div>
        </section>
      </>}

      {!logged && <section className="loginOverview"><div><div className="eyebrow">CARWISE MEMBERSHIP</div><h3>Unlock the complete car experience after sign in.</h3><p>AI recommendations, full catalogue, compare, wishlist, EV tools, reviews, news and Premium Garage.</p></div><button className="primary" onClick={()=>nav("/login")}>Login / Register <ArrowUpRight size={15}/></button></section>}
    </Page>
  </>
}

function NewsCard({title,cat,img}){return <article className="newsCard"><img className="newsImg" src={img} alt=""/><div className="newsBody"><small>{cat}</small><h3>{title}</h3><p>Practical context and buyer-focused information from the CARWISE editorial experience.</p></div></article>}

function CarsPage(){
  const [query,setQuery]=useState(""); const [body,setBody]=useState("All"); const [fuel,setFuel]=useState("All"); const [max,setMax]=useState(()=>{const n=Number(new URLSearchParams(window.location.search).get("budget"));return n||200;});
  const result=useMemo(()=>cars.filter(c=>
    (!query || `${c.brand} ${c.name}`.toLowerCase().includes(query.toLowerCase())) &&
    (body==="All"||c.body===body)&&(fuel==="All"||c.fuel===fuel)&&(c.price<=max)
  ).slice(0,80),[query,body,fuel,max]);
  return <RequireAuth><Page><section className="catalogHero"><div className="eyebrow">ALL CARS</div><h1>Explore cars your way.</h1><p>Search hundreds of models, then open a detailed car view when you are ready.</p><div className="catalogSearch"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search brand or car name..."/></div></section>
    <div className="filterBar">
      {["All","Hatchback","Sedan","SUV","MPV"].map(x=><button className={body===x?"active":""} key={x} onClick={()=>setBody(x)}>{x}</button>)}
      {["All","Petrol","Diesel","CNG","Hybrid","EV"].map(x=><button className={fuel===x?"active":""} key={x} onClick={()=>setFuel(x)}>{x}</button>)}
      <label className="priceFilter">Up to ₹{max}L<input type="range" min="5" max="900" value={max} onChange={e=>setMax(+e.target.value)}/></label>
    </div>
    <div className="resultBar"><span>{result.length} cars found</span><span>Updated catalogue</span></div>
    <div className="carGrid catalogGrid">{result.map(c=><CarCard key={c.id} car={c}/>)}</div>
  </Page></RequireAuth>
}

function CarPage(){
  const {id}=useParams(); const car=resolveCar(id);
  if(!car) return <Page><div className="empty"><CarFront/><h2>Car not found</h2><Link className="primary linkbtn" to="/cars">Back to Cars</Link></div></Page>;
  return <RequireAuth><Page><Link className="backLink" to="/cars"><ArrowLeft size={15}/> Back to cars</Link>
    <div className="detailHero">
      <div className="detailImage"><WikiImage car={car}/><div className="detailScore"><Star size={13}/> {car.score}</div></div>
      <div className="detailSummary"><div className="carBrand">{car.brand}</div><h1>{car.name}</h1><p>{car.description}</p><div className="detailPrice">{money(car.price)} <small>onwards</small></div><div className="metaRow big"><span>{car.body}</span><span>{car.fuel}</span><span>{car.trans}</span><span>{car.seats} seats</span></div><div className="detailActions"><button className="primary" onClick={()=>window.dispatchEvent(new CustomEvent("carwise:ai",{detail:car}))}><Sparkles size={15}/> Ask CARWISE AI</button><Link className="secondary linkbtn" to="/compare"><GitCompare size={15}/> Compare</Link></div></div>
    </div>
    <div className="specGrid">{[["Mileage / Range",car.fuel==="EV"?car.range||"Electric":"15–22 km/l"],["Power",car.power],["Transmission",car.trans],["Safety",car.safety],["Seating",`${car.seats} Seats`],["CARWISE Score",`${car.score}/10`]].map(([a,b])=><div className="spec" key={a}><small>{a}</small><b>{b}</b></div>)}</div>
    <section className="detailSection"><SectionHead eyebrow="Variants" title="Choose the right variant"/><div className="variantGrid">{["Base","Mid","Top"].map((v,i)=><div className="variantCard" key={v}><span>{v}</span><b>{money(car.price+(i*1.75))}</b><small>{i===0?"Core essentials":i===1?"Best balance":"Maximum features"}</small><button onClick={()=>alert(`${v} variant selected for ${car.name}`)}>Select</button></div>)}</div></section>
    <section className="detailSection"><div className="aiVerdict"><div className="eyebrow">CARWISE VERDICT</div><h2>Is {car.name} right for you?</h2><p>Use your saved preferences and ask CARWISE AI for a personalized answer. This page keeps core information and buyer-focused context together.</p><button className="primary" onClick={()=>window.dispatchEvent(new CustomEvent("carwise:ai",{detail:car}))}>Ask about this car <ArrowUpRight size={14}/></button></div></section>
  </Page></RequireAuth>
}


function ToolsPage({kind="emi"}){
  const configs={
    emi:{eyebrow:"FINANCE TOOL",title:"EMI Calculator",sub:"Estimate monthly EMI and total payable for your selected car.",fields:["Car Price (₹ Lakh)","Down Payment (₹ Lakh)","Interest Rate (%)","Tenure (Years)"]},
    affordability:{eyebrow:"SMART BUDGET",title:"Affordability Calculator",sub:"Estimate a comfortable car budget from your monthly numbers.",fields:["Monthly Income (₹)","Monthly Expenses (₹)","Existing EMI (₹)","Down Payment (₹)"]},
    "on-road":{eyebrow:"CITY PRICING",title:"On-Road Price",sub:"Estimate the total outlay with configurable city charges.",fields:["Ex-showroom (₹ Lakh)","RTO %","Insurance (₹)","Other Charges (₹)"]},
    "running-cost":{eyebrow:"RUNNING COST",title:"Running Cost",sub:"See your daily, monthly and annual fuel cost.",fields:["Daily KM","Mileage (km/l)","Fuel Price (₹/l)","Days per Month"]},
    "ownership-cost":{eyebrow:"OWNERSHIP",title:"Ownership Cost",sub:"Compare estimated running and ownership cost over time.",fields:["Car Price (₹ Lakh)","Annual KM","Mileage (km/l)","Annual Maintenance (₹)"]},
    "ev-tools":{eyebrow:"EV INTELLIGENCE",title:"EV Tools",sub:"Estimate EV running cost, practical range and savings.",fields:["Battery (kWh)","Electricity (₹/kWh)","Efficiency (km/kWh)","Monthly KM"]}
  };
  const cfg=configs[kind]||configs.emi;
  const [vals,setVals]=useState(cfg.fields.map((_,i)=>i===0?"12":""));
  const [result,setResult]=useState(null);
  function calc(){
    const n=vals.map(v=>Number(v)||0);
    if(kind==="emi"){
      const P=Math.max(0,(n[0]-n[1])*100000),r=n[2]/1200,months=n[3]*12;
      const emi=r&&months?P*r*Math.pow(1+r,months)/(Math.pow(1+r,months)-1):months?P/months:0;
      setResult({title:`₹${Math.round(emi).toLocaleString("en-IN")}/month`,lines:[`Total payable: ₹${Math.round(emi*months).toLocaleString("en-IN")}`,`Total interest: ₹${Math.max(0,Math.round(emi*months-P)).toLocaleString("en-IN")}`]});
    }else if(kind==="affordability"){
      const comfortable=Math.max(0,(n[0]-n[1]-n[2])*12*0.25 + n[3]);
      setResult({title:`₹${comfortable.toFixed(1)} Lakh estimated budget`,lines:["Calculated as a planning estimate, not financial advice."]});
    }else if(kind==="on-road"){
      const base=n[0]*100000, rto=base*(n[1]/100), total=base+rto+n[2]+n[3];
      setResult({title:`₹${(total/100000).toFixed(2)} Lakh estimated on-road`,lines:[`RTO estimate: ₹${Math.round(rto).toLocaleString("en-IN")}`,`Insurance + other charges: ₹${Math.round(n[2]+n[3]).toLocaleString("en-IN")}`]});
    }else if(kind==="running-cost"){
      const day=n[1]?n[0]/n[1]*n[2]:0,month=day*(n[3]||30);
      setResult({title:`₹${Math.round(month).toLocaleString("en-IN")}/month`,lines:[`Daily: ₹${Math.round(day).toLocaleString("en-IN")}`,`Annual: ₹${Math.round(month*12).toLocaleString("en-IN")}`]});
    }else if(kind==="ownership-cost"){
      const annualFuel=n[1]&&n[2]?n[1]/n[2]*100:0, fuelCost=annualFuel*100;
      const five=n[0]*100000 + fuelCost*5 + n[3]*5;
      setResult({title:`₹${(five/100000).toFixed(1)} Lakh estimated 5-year cost`,lines:[`Estimated annual running cost: ₹${Math.round(fuelCost).toLocaleString("en-IN")}`,`Includes annual maintenance estimate.`]});
    }else{
      const full=n[0]*n[1], monthly=n[2]?((n[3]/n[2])*n[1]*n[0]):0, practical=n[0]*4.2;
      setResult({title:`${Math.round(practical)} km estimated range`,lines:[`Approx. monthly charging cost: ₹${Math.round(monthly).toLocaleString("en-IN")}`,`Estimated using entered assumptions.`]});
    }
  }
  return <RequireAuth><Page><section className="catalogHero toolHero"><div className="eyebrow">{cfg.eyebrow}</div><h1>{cfg.title}</h1><p>{cfg.sub}</p></section><div className="toolWorkspace"><div className="toolForm panel"><div className="formGrid">{cfg.fields.map((f,i)=><label key={f}>{f}<input value={vals[i]} onChange={e=>{const a=[...vals];a[i]=e.target.value;setVals(a)}} placeholder="Enter value" type="number"/></label>)}</div><button className="primary" onClick={calc}>Calculate <ArrowRight size={15}/></button></div><div className="toolResult panel"><div className="eyebrow">RESULT</div>{result?<><h2>{result.title}</h2>{result.lines.map((x,i)=><p key={i}>{x}</p>)}</>:<div className="toolEmpty"><Calculator size={28}/><b>Enter your numbers</b><span>Your estimate will appear here.</span></div>}</div></div></Page></RequireAuth>
}

function BrandsPage(){return <RequireAuth><Page><SectionHead eyebrow="Brands" title="Explore brands" sub="Browse the model lineup for every brand in CARWISE."/><div className="brandGrid large">{brands.map(b=><Link className="brandCard" to={`/brands/${b.slug}`} key={b.slug}><img src={brandLogo(b.icon)} alt="" onError={e=>{e.currentTarget.style.display="none";e.currentTarget.nextElementSibling.style.display="grid"}}/><div className="brandFallback">{b.name.slice(0,2).toUpperCase()}</div><b>{b.name}</b><small>{Math.min(15,b.models.length)}+ models</small></Link>)}</div></Page></RequireAuth>}
function BrandPage(){const{name}=useParams();const b=brands.find(x=>x.slug===name);if(!b)return <Page><div className="empty"><h2>Brand not found</h2></div></Page>;const existing=cars.filter(c=>c.brandSlug===b.slug);const byName=new Map(existing.map(c=>[c.name.toLowerCase(),c]));const list=b.models.slice(0,15).map((model,i)=>byName.get(model.toLowerCase())||({id:`${b.slug}-${i}`,brand:b.name,name:model,brandSlug:b.slug,price:undefined,body:"Car",fuel:"Petrol",trans:"Automatic",seats:5,score:8.5,description:`Explore ${model} in the ${b.name} lineup.`,wikiTitle:`${b.name} ${model}`}));return <RequireAuth><Page><div className="brandHero"><div className="brandMarkBig"><img src={brandLogo(b.icon)} alt={`${b.name} logo`} onError={e=>e.currentTarget.style.display="none"}/></div><div><div className="eyebrow">BRAND</div><h1>{b.name}</h1><p>{Math.max(existing.length,b.models.length)} models available in the CARWISE lineup.</p></div></div><SectionHead eyebrow="Lineup" title={`${b.name} cars`} sub="Open a model to explore specs, variants and CARWISE insights."/><div className="carGrid catalogGrid">{list.map(c=><CarCard key={c.id} car={c}/>)}</div></Page></RequireAuth>}

function ComparePage(){const [selected,setSelected]=useState([]);const choices=popularCars;function add(id){setSelected(x=>x.includes(id)?x.filter(y=>y!==id):x.length<3?[...x,id]:x)}const items=selected.map(id=>cars.find(c=>c.id===id)).filter(Boolean);return <RequireAuth><Page><SectionHead eyebrow="Smart comparison" title="Compare up to 3 cars" sub="Pick your shortlist and CARWISE will keep the decision focused."/><div className="comparePicker">{choices.map(c=><button className={selected.includes(c.id)?"selected":""} key={c.id} onClick={()=>add(c.id)}><span>{selected.includes(c.id)?"✓":"+"}</span>{c.name}</button>)}</div>{items.length?<div className="compareTable"><div className="compareRow header"><b>Metric</b>{items.map(c=><b key={c.id}>{c.name}</b>)}</div>{[
["Price",...items.map(c=>money(c.price))],["Body",...items.map(c=>c.body)],["Fuel",...items.map(c=>c.fuel)],["Mileage / Range",...items.map(c=>c.fuel==="EV"?c.range:"15–22 km/l")],["Seats",...items.map(c=>c.seats)],["Safety",...items.map(c=>c.safety)],["CARWISE Score",...items.map(c=>`${c.score}/10`)]
].map(row=><div className="compareRow" key={row[0]}>{row.map((v,i)=><span key={i}>{v}</span>)}</div>)}</div>:<div className="empty"><GitCompare size={32}/><b>Add cars to compare.</b><span>Select 2–3 cars above.</span></div>} {items.length>=2&&<div className="aiVerdict compareVerdict"><div><div className="eyebrow">AI COMPARISON</div><h3>Let CARWISE decide based on your priorities.</h3><p>Login-based AI can explain the trade-offs and choose a winner for you.</p></div><Link className="primary linkbtn" to="/ai-advisor">Get AI Verdict <ArrowUpRight size={14}/></Link></div>}</Page></RequireAuth>}

function AIAdvisor(){const [messages,setMessages]=useState([{role:"ai",text:"Hi — I’m CARWISE AI. Tell me your budget, family size, driving pattern and what matters most."}]);const [input,setInput]=useState("");async function send(){if(!input.trim())return;const q=input.trim();setMessages(m=>[...m,{role:"user",text:q}]);setInput("");try{const r=await api.post("/ai/chat",{message:q});setMessages(m=>[...m,{role:"ai",text:r.data.reply||"I can help compare cars from the CARWISE catalogue."}])}catch{setMessages(m=>[...m,{role:"ai",text:"I can help with budget, fuel type, body style, mileage, safety and comparison. Try: “Best SUV under ₹15 lakh?”"}])}}return <RequireAuth><Page><SectionHead eyebrow="CARWISE AI" title="Your personal car advisor" sub="Ask naturally. No complicated filters needed."/><div className="chatShell"><div className="suggestions">{["Best SUV under ₹15 lakh?","Which EV fits city driving?","Creta vs Seltos?","Which variant should I buy?"].map(x=><button key={x} onClick={()=>setInput(x)}>{x}</button>)}</div><div className="chatWindow">{messages.map((m,i)=><div key={i} className={`bubble ${m.role==="ai"?"aiBubble":"userBubble"}`}>{m.text}</div>)}</div><div className="chatInput"><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask CARWISE anything..."/><button className="primary" onClick={send}><ArrowRight size={15}/></button></div></div></Page></RequireAuth>}

function AIRecommendations(){const [budget,setBudget]=useState(15);const [fuel,setFuel]=useState("Any");const [body,setBody]=useState("SUV");const [priority,setPriority]=useState("Safety");const results=useMemo(()=>cars.filter(c=>c.price<=budget&&(fuel==="Any"||c.fuel===fuel)&&(body==="Any"||c.body===body)).sort((a,b)=>b.score-a.score).slice(0,6),[budget,fuel,body]);return <RequireAuth><Page><SectionHead eyebrow="AI recommendation engine" title="Your personalized shortlist" sub="Adjust a few preferences and CARWISE ranks the best matches."/><div className="wizard"><label>Budget<select value={budget} onChange={e=>setBudget(+e.target.value)}><option value="10">₹10 Lakh</option><option value="15">₹15 Lakh</option><option value="20">₹20 Lakh</option><option value="30">₹30 Lakh</option><option value="100">₹1 Crore</option></select></label><label>Powertrain<select value={fuel} onChange={e=>setFuel(e.target.value)}><option>Any</option><option>Petrol</option><option>Diesel</option><option>Hybrid</option><option>EV</option></select></label><label>Body type<select value={body} onChange={e=>setBody(e.target.value)}><option>Any</option><option>SUV</option><option>Sedan</option><option>Hatchback</option><option>MPV</option></select></label><label>Top priority<select value={priority} onChange={e=>setPriority(e.target.value)}><option>Safety</option><option>Mileage</option><option>Value</option><option>Performance</option><option>Features</option></select></label></div><div className="recommendGrid">{results.map((c,i)=><article className="recommendCard" key={c.id}><WikiImage car={c}/><div><small>{i===0?"BEST MATCH · ":""}{c.brand}</small><h3>{c.name}</h3><strong>{Math.min(98,88+Math.round(c.score))}% Match</strong><p>Strong fit for a ₹{budget} lakh budget with {priority.toLowerCase()} as a key priority.</p><div className="cardActions"><Link to={`/cars/${c.id}`}>View Details</Link><Link to="/compare">Compare</Link></div></div></article>)}</div></Page></RequireAuth>}

function EVPage(){return <RequireAuth><Page><section className="catalogHero evHero"><div className="eyebrow green">TOP 10 EVS</div><h1>Electric cars, compared intelligently.</h1><p>Explore a focused EV collection with range, battery, charging and running-cost context.</p></section><SectionHead eyebrow="Top EV picks" title="10 EVs to explore"/><div className="carGrid catalogGrid">{evCars.map(c=><CarCard key={c.id} car={c}/>)}</div></Page></RequireAuth>}
function UpcomingPage(){return <RequireAuth><Page><SectionHead eyebrow="COMING NEXT" title="Upcoming cars" sub="Expected information is always labelled clearly."/><div className="newsGrid">{upcoming.map(u=><article className="upCard" key={u.id}><WikiImage car={{brand:u.brand,name:u.name,wikiTitle:u.wikiTitle}}/><div className="upBody"><span className="tinyTag">EXPECTED</span><h3>{u.name}</h3><p>{u.brand} · {u.fuel}</p><b>{u.price}</b><Link to="/ai-advisor" className="secondary linkbtn">Ask AI about it</Link></div></article>)}</div></Page></RequireAuth>}
function ReviewsPage(){return <RequireAuth><Page><SectionHead eyebrow="OWNER VOICE" title="Reviews, simplified" sub="A clean place for community feedback and AI summaries."/><div className="reviewGrid">{["Easy to shortlist cars without endless tabs.","Comparison is clear and the AI explanation is useful.","The ownership tools helped me think about total cost.","I like that the AI tells me why a car matches. ","The EV section makes charging costs easier to understand.","Variant guidance is much more practical than a raw spec sheet."].map((x,i)=><article className="reviewCard" key={i}><div className="stars">★★★★★</div><p>“{x}”</p><small>CARWISE community · demo review</small></article>)}</div></Page></RequireAuth>}
function NewsPage(){return <RequireAuth><Page><SectionHead eyebrow="AUTO INTELLIGENCE" title="Latest car stories" sub="Launches, EV news, buying guides and comparison-led insights."/><NewsCards/><div className="panel quickRead"><div className="eyebrow">AI QUICK READ</div><h3>Summaries should always be generated from verified source material.</h3><p>CARWISE keeps buyer-focused context short, clear and easy to scan.</p></div></Page></RequireAuth>}
function NewsCards(){return <div className="newsGrid"><NewsCard title="How to choose a car around your real monthly budget" cat="BUYING GUIDE" img="https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=85"/><NewsCard title="Why EV range is only one part of the decision" cat="EV" img="https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&w=1200&q=85"/><NewsCard title="What changes when you compare three cars instead of two?" cat="COMPARISON" img="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=85"/></div>}

function WishlistPage(){const ids=JSON.parse(localStorage.getItem("carwise_wishlist")||"[]");const list=ids.map(resolveCar).filter(Boolean);return <RequireAuth><Page><SectionHead eyebrow="MY CARWISE" title="Saved cars"/>{list.length?<div className="carGrid catalogGrid">{list.map(c=><CarCard key={c.id} car={c}/>)}</div>:<div className="empty"><Heart size={32}/><h3>No saved cars yet.</h3><span>Save a car from the catalogue to build your shortlist.</span><Link className="primary linkbtn" to="/cars">Explore Cars</Link></div>}</Page></RequireAuth>}

function PremiumGarage(){
  const [brand,setBrand]=useState("All");
  const premiumBrands=["Audi","BMW","Mercedes-Benz","Range Rover / Land Rover","Porsche","Lexus","Jaguar","Volvo","Maserati","Bentley","Rolls-Royce","Ferrari","Lamborghini"];
  const list=useMemo(()=>luxuryCars.filter(c=>(brand==="All"||c.brand===brand)),[brand]);
  return <section className="premiumGarage">
    <div className="garageHeader"><div><div className="eyebrow">EXCLUSIVE COLLECTION</div><h2>Premium Garage</h2><p>Luxury cars, elevated. Explore premium models from the marques that define automotive aspiration.</p></div><div className="garageCount"><b>{luxuryCars.length}+</b><span>Luxury cars</span></div></div>
    <div className="luxTabs"><button className={brand==="All"?"active":""} onClick={()=>setBrand("All")}>All</button>{premiumBrands.map(b=><button key={b} className={brand===b?"active":""} onClick={()=>setBrand(b)}>{b}</button>)}</div>
    <div className="garageBrandGrid">{premiumBrands.map(b=>{const icon=brands.find(x=>x.name===b);return <button className="garageBrand" key={b} onClick={()=>setBrand(b)}><div className="garageLogo">{icon?<img src={brandLogo(icon.icon)} alt=""/>:<span>{b.slice(0,2)}</span>}</div><div><b>{b}</b><small>{luxuryCars.filter(c=>c.brand===b).length}+ models</small></div></button>})}</div>
    <div className="luxGrid">{list.map(c=><article className="luxCard" key={c.id}><div className="luxImage"><WikiImage car={c}/><span className="luxBadge">PREMIUM</span><button onClick={()=>{let a=JSON.parse(localStorage.getItem("carwise_wishlist")||"[]");if(!a.includes(c.id)){a.push(c.id);localStorage.setItem("carwise_wishlist",JSON.stringify(a));}}}><Heart size={16}/></button></div><div className="luxBody"><small>{c.brand}</small><h3>{c.name}</h3><b>{money(c.price)}</b><div className="metaRow"><span>{c.body}</span><span>{c.fuel}</span><span>{c.seats} seats</span></div><div className="luxActions"><Link className="primary linkbtn" to={`/cars/${c.id}`}>Explore <ArrowUpRight size={13}/></Link><Link className="secondary linkbtn" to="/compare">Compare</Link></div></div></article>)}</div>
    <div className="garageAI"><div className="garageAIIcon"><Sparkles size={21}/></div><div><div className="eyebrow">CARWISE AI</div><h3>Not sure which luxury car fits you?</h3><p>Ask CARWISE to rank premium cars around your priorities, budget and lifestyle.</p></div><Link className="primary linkbtn" to="/ai-recommendations">Find My Luxury Car <ArrowUpRight size={14}/></Link></div>
  </section>
}

function Dashboard(){
  const nav=useNavigate(); const user=getUser();
  function logout(){localStorage.removeItem("carwise_token");localStorage.removeItem("carwise_user");nav("/");}
  return <RequireAuth><Page><section className="dashHero"><div><div className="eyebrow">MY CARWISE</div><h1>Welcome{user?.name?`, ${user.name}`:""}.</h1><p>Your saved cars, comparisons, recommendations and premium discoveries in one place.</p></div><button className="secondary logoutBtn" onClick={logout}>Log out</button></section><div className="dashGrid">{[[Heart,"Saved Cars","Build your shortlist","/wishlist"],[GitCompare,"Compare","Review up to 3 cars","/compare"],[Sparkles,"AI Recommendations","Refresh your picks","/ai-recommendations"],[MessageCircle,"AI Advisor","Continue the conversation","/ai-advisor"],[CarFront,"Explore Cars","Browse the catalogue","/cars"],[BatteryCharging,"EV Zone","See the top EVs","/ev"],[Calculator,"EMI Calculator","Estimate monthly payment","/tools/emi-calculator"],[WalletCards,"Affordability","Plan a comfortable budget","/tools/affordability"],[Fuel,"Running Cost","Estimate daily and monthly cost","/tools/running-cost"],[CircleDollarSign,"Ownership Cost","Compare 3–7 year cost","/tools/ownership-cost"]].map(([I,t,d,to])=><Link className="dashCard" to={to} key={t}><div className="dashIcon"><I size={19}/></div><div><b>{t}</b><span>{d}</span></div><ArrowUpRight size={15}/></Link>)}</div><PremiumGarage/></Page></RequireAuth>
}

function AuthPage({register=false}){
  const nav=useNavigate(); const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
  async function submit(e){e.preventDefault();setError("");setLoading(true);try{const endpoint=register?"/auth/register":"/auth/login";const r=await api.post(endpoint,register?{name,email,password}:{email,password});localStorage.setItem("carwise_token",r.data.token);localStorage.setItem("carwise_user",JSON.stringify(r.data.user));const redirect=new URLSearchParams(window.location.search).get("redirect");nav(redirect&&redirect.startsWith("/")?redirect:"/dashboard");}catch(e){setError(e?.response?.data?.message||"Something went wrong.");}finally{setLoading(false)}}
  return <div className="authWrap"><div className="authVisual"><img src={heroImage} alt="Bugatti Chiron"/><div className="authVisualShade"/><div className="authVisualText"><span>CARWISE</span><b>Choose smarter.<br/>Drive wiser.</b></div></div><div className="authPanel"><Link className="logo center" to="/">CAR<span>WISE</span><em>Find the Right Car, Not Just a Car.</em></Link><div className="authCopy"><div className="eyebrow">{register?"JOIN CARWISE":"WELCOME BACK"}</div><h1>{register?"Create your account":"Sign in"}</h1><p>{register?"Save cars and unlock AI.":"Continue your CARWISE journey."}</p></div><form onSubmit={submit}>{register&&<input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} required/>}<input placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/><input placeholder="Password" type="password" minLength="6" value={password} onChange={e=>setPassword(e.target.value)} required/>{error&&<div className="error">{error}</div>}<button className="primary authBtn" disabled={loading}>{loading?"Please wait...":register?"Create account":"Sign in"} <ArrowUpRight size={15}/></button></form><div className="authSwitch">{register?"Already have an account?":"New to CARWISE?"} <Link to={register?"/login":"/register"}>{register?"Sign in":"Create account"}</Link></div><div className="authNote"><ShieldCheck size={13}/> Secure account access</div></div></div>
}

function Layout(){
  const [mobile,setMobile]=useState(false);
  const [aiOpen,setAiOpen]=useState(false);
  const [aiCar,setAiCar]=useState(null);
  useEffect(()=>{const fn=e=>{setAiCar(e.detail||null);setAiOpen(true)};window.addEventListener("carwise:ai",fn);return()=>window.removeEventListener("carwise:ai",fn)},[]);
  return <div className="appShell"><Nav mobile={mobile} setMobile={setMobile}/><Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/cars" element={<CarsPage/>}/>
    <Route path="/cars/:id" element={<CarPage/>}/>
    <Route path="/brands" element={<BrandsPage/>}/>
    <Route path="/brands/:name" element={<BrandPage/>}/>
    <Route path="/compare" element={<ComparePage/>}/>
    <Route path="/ai-advisor" element={<AIAdvisor/>}/>
    <Route path="/ai-recommendations" element={<AIRecommendations/>}/>
    <Route path="/ev" element={<EVPage/>}/>
    <Route path="/upcoming" element={<UpcomingPage/>}/>
    <Route path="/reviews" element={<ReviewsPage/>}/>
    <Route path="/news" element={<NewsPage/>}/>
    <Route path="/wishlist" element={<WishlistPage/>}/>
    <Route path="/tools/emi-calculator" element={<ToolsPage kind="emi"/>}/>
    <Route path="/tools/affordability" element={<ToolsPage kind="affordability"/>}/>
    <Route path="/tools/on-road-price" element={<ToolsPage kind="on-road"/>}/>
    <Route path="/tools/running-cost" element={<ToolsPage kind="running-cost"/>}/>
    <Route path="/tools/ownership-cost" element={<ToolsPage kind="ownership-cost"/>}/>
    <Route path="/tools/ev-tools" element={<ToolsPage kind="ev-tools"/>}/>
    <Route path="/dashboard" element={<Dashboard/>}/>
    <Route path="/login" element={<AuthPage/>}/>
    <Route path="/register" element={<AuthPage register/>}/>
    <Route path="*" element={<Home/>}/>
  </Routes><Footer/>{aiOpen&&<AIModal car={aiCar} close={()=>setAiOpen(false)}/>}</div>
}

function AIModal({car,close}){const [q,setQ]=useState("");const [reply,setReply]=useState("");async function ask(){if(!q.trim()&&!car)return;try{const r=await api.post("/ai/chat",{message:q||`Tell me if ${car.name} by ${car.brand} is a good fit and what to consider.`});setReply(r.data.reply||"CARWISE AI response ready.");}catch{setReply("Preview mode: tell me your budget, daily driving and top priority for a better answer.")}}return <div className="modal" onClick={e=>e.target.className==="modal"&&close()}><div className="modalCard"><div className="modalHead"><div><div className="eyebrow">CARWISE AI</div><h3>{car?`Ask about ${car.name}`:"Your car question"}</h3></div><button className="navIcon" onClick={close}><X size={17}/></button></div><p className="muted">{car?`${car.brand} · ${money(car.price)} · ${car.body}`:"Ask about budget, fuel, safety, comparison or variants."}</p><div className="aiAnswer">{reply||"Ask your question and CARWISE AI will respond using the CARWISE catalogue context."}</div><div className="chatInput"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="e.g. Should I buy this for a 5-member family?"/><button className="primary" onClick={ask}>Ask</button></div></div></div>}

function Footer(){return <footer><div className="container footerGrid"><div><div className="logo">CAR<span>WISE</span></div><p>Find the Right Car, Not Just a Car.</p></div><div><b>Explore</b><Link to="/cars">Cars</Link><Link to="/brands">Brands</Link><Link to="/compare">Compare</Link><Link to="/ev">EV Cars</Link></div><div><b>AI</b><Link to="/ai-advisor">AI Advisor</Link><Link to="/upcoming">Upcoming</Link><Link to="/reviews">Reviews</Link></div><div><b>Company</b><Link to="/news">News</Link><Link to="/login">Sign in</Link><Link to="/register">Create account</Link></div></div><div className="copyright">© 2026 CARWISE. Built for smarter car decisions.</div></footer>}

export default function App(){return <Layout/>}
