/* Local PDF Writer v1.0 for classroom text-response exports.
   Self-contained, no external network or dependencies. Exports all responses in readable pages.
   Copyright 2026. Permission granted for classroom use, modification, and redistribution.
*/
(function(){'use strict';
const enc=new TextEncoder();
const ascii=s=>String(s).replace(/[\u2018\u2019]/g,"'").replace(/[\u201C\u201D]/g,'"').replace(/[\u2013\u2014]/g,'-').replace(/\u2026/g,'...').replace(/[^\x20-\x7e\n]/g,'?');
const esc=s=>ascii(s).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)');
function pdf(doc){const width=612,height=792,margin=43,bottom=42,leading=15;let pages=[[]],y=height-52;
function newPage(){pages.push([]);y=height-52;}
function draw(t,size=11,bold=false){const font=bold?'F2':'F1';const line=`BT /${font} ${size} Tf ${margin} ${y} Td (${esc(t)}) Tj ET`;pages[pages.length-1].push(line);y-=size*1.34+2;}
function wrap(s,max=96){const words=ascii(s).split(/\s+/),out=[];let line='';for(const word of words){if(word.length>max){if(line){out.push(line);line='';}for(let i=0;i<word.length;i+=max)out.push(word.slice(i,i+max));continue;}if((line+' '+word).trim().length>max){out.push(line);line=word;}else line=(line+' '+word).trim();}if(line)out.push(line);return out.length?out:[' '];}
function block(s,size=11,bold=false){for(const raw of String(s).split('\n')){for(const line of wrap(raw,size>=14?67:92)){if(y<bottom+size*2)newPage();draw(line,size,bold);}if(!raw)y-=6;}}
block(doc.title,17,true);block('Student alias: '+doc.alias,12,true);block('Completion grade: '+doc.completion,13,true);block('Date: '+doc.date,10);block('Historical source: '+doc.source,9);y-=16;
for(let i=0;i<doc.answers.length;i++){if(y<110)newPage();block(`${i+1}. ${doc.answers[i].label}`,12,true);y-=4;block(doc.answers[i].text,11);y-=17;}
const objects=[];const add=s=>(objects.push(s),objects.length);
const catalog=add('');const pagesObj=add('');const f1=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');const f2=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');const pids=[];
for(const commands of pages){const stream=commands.join('\n')+'\n';const streamLength=enc.encode(stream).length;const c=add(`<< /Length ${streamLength} >>\nstream\n${stream}endstream`);const p=add(`<< /Type /Page /Parent ${pagesObj} 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >> /Contents ${c} 0 R >>`);pids.push(p);}
objects[catalog-1]=`<< /Type /Catalog /Pages ${pagesObj} 0 R >>`;
objects[pagesObj-1]=`<< /Type /Pages /Kids [${pids.map(v=>v+' 0 R').join(' ')}] /Count ${pids.length} >>`;
let result='%PDF-1.4\n',positions=[0];for(let i=0;i<objects.length;i++){positions.push(enc.encode(result).length);result+=`${i+1} 0 obj\n${objects[i]}\nendobj\n`;}const xref=enc.encode(result).length;result+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;for(let i=1;i<positions.length;i++)result+=String(positions[i]).padStart(10,'0')+' 00000 n \n';result+=`trailer\n<< /Size ${objects.length+1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF`;return enc.encode(result);}
window.LocalPDF={download(doc,filename){const data=pdf(doc);const link=document.createElement('a');link.href=URL.createObjectURL(new Blob([data],{type:'application/pdf'}));link.download=filename;document.body.appendChild(link);link.click();setTimeout(()=>{URL.revokeObjectURL(link.href);link.remove()},3000);}};
})();