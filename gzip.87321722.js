import{p as n}from"./pako.esm-856454b6.df899be9.js";var o;const s=(o=class{constructor(e=1){if(e<0||e>9)throw new Error("Invalid gzip compression level, it should be between 0 and 9");this.level=e}static fromConfig({level:e}){return new o(e)}encode(e){return n.gzip(e,{level:this.level})}decode(e,r){const i=n.ungzip(e);return r!==void 0?(r.set(i),r):i}},o.codecId="gzip",o);export{s as default};