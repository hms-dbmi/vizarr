import{BaseDecoder as c}from"./vizarr-D-emMKic.js";class l extends c{decodeBlock(s){const n=new DataView(s),r=[];for(let e=0;e<s.byteLength;++e){let t=n.getInt8(e);if(t<0){const o=n.getUint8(e+1);t=-t;for(let a=0;a<=t;++a)r.push(o);e+=1}else{for(let o=0;o<=t;++o)r.push(n.getUint8(e+o+1));e+=t+1}}return new Uint8Array(r).buffer}}export{l as default};
//# sourceMappingURL=packbits-CRavqUWI.js.map
