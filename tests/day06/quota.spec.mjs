import { test, expect } from "@playwright/test";
import vm from "node:vm";
import fs from "node:fs";
import crypto from "node:crypto";
test("invalid output is free and follow-ups share the preparation session",async()=>{
  let payload={bad:true};
  const context=vm.createContext({require:()=>crypto,module:{exports:{}},Buffer,URL,AbortController,setTimeout,clearTimeout,
    console:{warn(){}},process:{env:{TRIAL_SECRET:"test-only",GEMINI_API_KEY:"test-only"}},
    fetch:async()=>({ok:true,json:async()=>({candidates:[{finishReason:"STOP",content:{parts:[{text:JSON.stringify(payload)}]}}]})})
  });
  vm.runInContext(fs.readFileSync("api/yes-man.js","utf8"),context);
  async function call(body,cookie=""){
    const headers={};let status,data;
    const res={setHeader(k,v){headers[k]=v;},status(n){status=n;return this;},json(x){data=x;return this;}};
    await context.module.exports({method:"POST",headers:{cookie,"x-forwarded-for":"192.0.2.1"},body},res);
    return {status,data,cookie:headers["Set-Cookie"]?.split(";")[0]};
  }
  const base={task:"drafts",lang:"en",request:"Can you finish this today?",sessionMode:true};
  const invalid=await call(base);
  expect(invalid.status).toBe(502);expect(invalid.data.left).toBe(3);expect(invalid.cookie).toBeUndefined();
  payload={options:["clarify","negotiate","decline","pause"].map(kind=>({kind,text:"My reply.",effect:"Explicit choice."}))};
  const drafts=await call(base);expect(drafts.status).toBe(200);expect(drafts.data.left).toBe(2);
  payload={line:"Understood.",resolved:true};
  const follow=await call({...base,task:"follow",firstReply:"No.",allowAcceptance:true,sessionToken:drafts.data.sessionToken},drafts.cookie);
  expect(follow.status).toBe(200);expect(follow.data.left).toBe(2);expect(follow.data.callsLeft).toBe(18);
  const changed=await call({...base,request:"Different request",sessionToken:follow.data.sessionToken},follow.cookie);
  expect(changed.status).toBe(429);
});
