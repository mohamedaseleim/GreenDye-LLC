export const parseCsv = input => {
  const rows=[];let row=[],field='',quoted=false;
  for(let i=0;i<input.length;i+=1){const char=input[i],next=input[i+1];if(quoted){if(char==='"'&&next==='"'){field+='"';i+=1}else if(char==='"'){quoted=false}else{field+=char}}else if(char==='"'){quoted=true}else if(char===','){row.push(field);field=''}else if(char==='\n'){row.push(field.replace(/\r$/,''));rows.push(row);row=[];field=''}else{field+=char}}
  if(quoted)throw new Error('CSV contains an unterminated quoted field');
  if(field.length||row.length){row.push(field.replace(/\r$/,''));rows.push(row)}
  return rows.filter(values=>values.some(value=>value.trim()!==''));
};
export const downloadBlob=(data,filename,type='text/csv;charset=utf-8')=>{const blob=data instanceof Blob?data:new Blob([data],{type});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=filename;document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url)};
