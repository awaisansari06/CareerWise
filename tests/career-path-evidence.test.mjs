import test from "node:test";
import assert from "node:assert/strict";
import { getRoleEvidence } from "../lib/career-path-evidence.js";
test("role evidence uses actual listed skills and preserves the evidence scope",()=>{
 assert.deepEqual(getRoleEvidence({skills:["Research","Accessibility"]},[" research "],["Planning"]),{scope:"role",transferable:["Research"],toExplore:["Accessibility"],listed:["research"]});
});
test("legacy role data explicitly falls back to industry evidence",()=>{
 const evidence=getRoleEvidence({title:"Designer"},["Research"],["Research","Strategy"]);
 assert.equal(evidence.scope,"industry"); assert.deepEqual(evidence.transferable,["Research"]); assert.deepEqual(evidence.toExplore,["Strategy"]);
 assert.deepEqual(getRoleEvidence(null,null,null).toExplore,[]);
});
