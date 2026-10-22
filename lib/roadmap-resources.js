// Provider URLs are maintained here, never invented by the model.
const entries = [
  ['cs-roadmap','Computer science roadmap','roadmap.sh','https://roadmap.sh/computer-science','Roadmap',['computer science','data structures','algorithms','operating systems']],
  ['cs50','Introduction to computer science','Harvard CS50','https://cs50.harvard.edu/x/','Course',['computer science','programming fundamentals','data structures','algorithms']],
  ['git-book','Pro Git','Git','https://git-scm.com/book/en/v2','Book',['git','version control']],
  ['github-git','Using Git','GitHub Docs','https://docs.github.com/en/get-started/using-git','Guide',['git','version control','github']],
  ['python','Python tutorial','Python Docs','https://docs.python.org/3/tutorial/','Tutorial',['python']],
  ['javascript','JavaScript guide','MDN','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide','Guide',['javascript','ecmascript']],
  ['react','Learn React','React','https://react.dev/learn','Tutorial',['react','reactjs']],
  ['node','Introduction to Node.js','Node.js','https://nodejs.org/learn/getting-started/introduction-to-nodejs','Guide',['node.js','nodejs']],
  ['sql','PostgreSQL tutorial','PostgreSQL','https://www.postgresql.org/docs/current/tutorial.html','Tutorial',['sql','postgresql','dbms','relational databases']],
  ['web','Learn web development','MDN','https://developer.mozilla.org/en-US/docs/Learn_web_development','Learning path',['web development','html','css','frontend','front end']],
  ['statistics','Statistics and probability','Khan Academy','https://www.khanacademy.org/math/statistics-probability','Course',['statistics','probability']],
  ['ml','Machine learning crash course','Google Developers','https://developers.google.com/machine-learning/crash-course','Course',['machine learning']],
  ['excel','Excel help and learning','Microsoft','https://support.microsoft.com/en-us/excel/','Learning library',['excel','spreadsheets']],
  ['powerbi','Power BI documentation','Microsoft Learn','https://learn.microsoft.com/en-us/power-bi/','Learning library',['power bi','powerbi']],
  ['aws','AWS training','AWS','https://aws.amazon.com/training/','Training library',['aws','amazon web services']],
  ['docker','Get started with Docker','Docker Docs','https://docs.docker.com/get-started/','Tutorial',['docker','containerization']],
  ['marketing','Digital marketing certification','HubSpot Academy','https://academy.hubspot.com/courses/digital-marketing','Course · account required',['digital marketing','content marketing']],
  ['analytics','Google product training','Google Skillshop','https://skillshop.withgoogle.com/','Training library',['google analytics','google ads']],
  ['project','Project management learning','PMI','https://www.pmi.org/learning','Learning library · access varies',['project management']],
  ['accounting','Principles of financial accounting','OpenStax','https://openstax.org/details/books/principles-financial-accounting','Textbook',['accounting','financial statements','bookkeeping']],
  ['teaching','Education and development courses','OpenLearn','https://www.open.edu/openlearn/education/free-courses','Course library',['teaching','pedagogy','classroom','education']],
  ['health','Public health learning','OpenWHO','https://openwho.org/','Learning library',['public health','epidemiology','infection prevention']],
  ['writing','Plain language guide','Digital.gov','https://digital.gov/guides/plain-language','Guide',['professional writing','plain language','business writing']],
];
export const RESOURCE_CATALOG = entries.map(([id,title,provider,url,format,topics])=>({id,title,provider,url,format,topics}));
const normalize = value => String(value || '').toLowerCase().replace(/[^\p{L}\p{N}+#.]+/gu,' ').trim();
const contains = (text, phrase) => (` ${normalize(text)} `).includes(` ${normalize(phrase)} `);
function knownUrl(value) {
  try { const url = new URL(value); if(url.protocol!=='https:' || url.username || url.password) return null;
    if(['roadmap.dev','www.roadmap.dev'].includes(url.hostname)) url.hostname='roadmap.sh';
    return RESOURCE_CATALOG.find(item=>item.url.replace(/\/$/,'')===`${url.origin}${url.pathname}`.replace(/\/$/,''));
  } catch { return null; }
}
export function resolveMilestoneResources(node) {
  const data=node?.data || {};
  const scored=RESOURCE_CATALOG.map(item=>({item,score:item.topics.reduce((best,topic)=>Math.max(best,contains(data.label || data.title,topic)?10:contains(data.description,topic)?1:0),0)})).filter(row=>row.score>0).sort((a,b)=>b.score-a.score);
  const known=knownUrl(data.link);
  const ids=[...(Array.isArray(data.resourceIds)?data.resourceIds:[]),...(known?[known.id]:[]),...scored.map(row=>row.item.id)];
  return [...new Set(ids)].map(id=>RESOURCE_CATALOG.find(item=>item.id===id)).filter(Boolean).slice(0,3).map(item=>({...item,health:data.resourceHealth?.[item.id] || {status:'unchecked'}})).sort((a,b)=>Number(['unavailable','reported'].includes(a.health.status))-Number(['unavailable','reported'].includes(b.health.status)));
}
export function repairRoadmapResourceNodes(nodes) {
  return nodes.map(node=>{const resources=resolveMilestoneResources(node); return {...node,data:{...node.data,link:resources[0]?.url || null,resourceIds:resources.map(item=>item.id),resourceVersion:1}};});
}
export function resourceSearchLinks(node, industry='') {
  const query=[node?.data?.label || node?.data?.title || 'Career skills',industry,'learning tutorial'].filter(Boolean).join(' ').slice(0,300);
  return [ {title:'Search learning resources',url:`https://www.google.com/search?${new URLSearchParams({q:query})}`}, {title:'Search video lessons',url:`https://www.youtube.com/results?${new URLSearchParams({search_query:query})}`} ];
}
