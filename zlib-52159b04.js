import{p as n}from"./pako.esm-856454b6-07ace062.js";var t;const s=(t=class{constructor(e=1){if(e<-1||e>9)throw new Error("Invalid zlib compression level, it should be between -1 and 9");this.level=e}static fromConfig({level:e}){return new t(e)}encode(e){return n.deflate(e,{level:this.level})}decode(e,r){const o=n.inflate(e);return r!==void 0?(r.set(o),r):o}},t.codecId="zlib",t);export{s as default};