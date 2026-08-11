const safeError=error=>({name:error?.name||'Error',message:String(error?.message||'Unknown error').replace(/Bearer\s+[A-Za-z0-9._-]+/gi,'Bearer [REDACTED]').slice(0,500),status:error?.response?.status,requestId:error?.response?.headers?.['x-request-id']});
export const reportError=(context,error)=>{if(process.env.NODE_ENV!=='production')console.error(context,safeError(error));};
