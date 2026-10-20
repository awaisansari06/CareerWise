import {createHash} from 'node:crypto';
export function requestJobId(userId,kind,requestId,input,resumeVersion){
 if(!requestId)return undefined;
 if(typeof requestId!=="string"||!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId))throw new Error("Invalid request identifier.");
 return createHash('sha256').update(JSON.stringify([userId,kind,requestId,resumeVersion?new Date(resumeVersion).toISOString():null,JSON.stringify(input,Object.keys(input).sort())])).digest('hex');
}
