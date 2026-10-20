"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, FileText, Flag, GitBranch } from "lucide-react";
const options = [
 { role:"Business Analyst", fit:"Build on reporting and problem-solving", gap:"Requirements gathering", task:"Turn a reporting project into a case study", detail:"Explain the problem, the data you used, and the decision your work supported." },
 { role:"Operations Lead", fit:"Build on coordination and process improvement", gap:"Team leadership", task:"Document a process you helped improve", detail:"Describe what changed, who you worked with, and how you measured the result." },
];
export default function CareerJourney(){
 const [selected,setSelected]=useState(0); const option=options[selected];
 return <div className="cw-journey" aria-label="Example journey from experience to a career plan"><div className="cw-journey-caption"><span>SEE HOW YOUR EXPERIENCE BECOMES A PLAN</span><span>Illustrative example · not an assessment</span></div><ol className="cw-journey-steps">
 <li className="cw-journey-step"><div className="cw-journey-label"><span>01</span><h2>Your experience</h2><FileText size={20}/></div><div className="cw-journey-body"><p className="cw-journey-kicker">START WITH WHAT YOU KNOW</p><h3>Customer support.<br/>More possibilities.</h3><p>2 years helping customers and making daily work run better.</p><ul className="cw-experience-signals">{["Solving customer problems","Preparing weekly reports","Coordinating across teams"].map(item=><li key={item}><Check size={16}/>{item}</li>)}</ul><div className="cw-journey-bridge">Your transferable strengths <ArrowRight size={17}/></div></div></li>
 <li className="cw-journey-step"><div className="cw-journey-label"><span>02</span><h2>Career options</h2><GitBranch size={20}/></div><div className="cw-journey-body"><p className="cw-journey-kicker">CHOOSE A DIRECTION TO EXPLORE</p><div className="cw-role-decisions" role="group" aria-label="Explore an example career direction">{options.map((item,index)=><button key={item.role} type="button" aria-pressed={selected===index} onClick={()=>setSelected(index)}><span className="cw-decision-marker" aria-hidden="true">{selected===index && <Check size={12}/>}</span><span><strong>{item.role}</strong><small>{item.fit}</small></span><ArrowRight size={16}/></button>)}</div><p className="cw-journey-gap"><span>Skill to develop</span><strong>{option.gap}</strong></p></div></li>
 <li className="cw-journey-step cw-journey-destination"><div className="cw-journey-label"><span>03</span><h2>Your next step</h2><Flag size={20}/></div><div className="cw-journey-body" aria-live="polite" aria-atomic="true"><div key={selected} className="cw-next-step-reveal"><p className="cw-journey-kicker">A PRACTICAL FIRST MILESTONE</p><span className="cw-next-direction">Toward {option.role}</span><h3>{option.task}</h3><p>{option.detail}</p><span className="cw-milestone"><Flag size={15}/> One clear action to start with</span></div><Link href="/dashboard" className="cw-journey-link">Build a plan from my experience <ArrowRight size={17}/></Link></div></li>
 </ol></div>;
}
