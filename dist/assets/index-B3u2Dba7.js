(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&o(a)}).observe(document,{childList:!0,subtree:!0});function e(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerPolicy&&(i.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?i.credentials="include":r.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function o(r){if(r.ep)return;r.ep=!0;const i=e(r);fetch(r.href,i)}})();const v="data:application/json;base64,ew0KICAgICJpMThuIjogew0KICAgICAgICAiZW4iOiAiRW5nbGlzaCINCiAgICB9LA0KICAgICJHQ0RVTGluayI6IHsNCiAgICAgICAgInByZXNzdXJlIjogeyJlbGVtZW50SWQiOiAicHJlc3N1cmVMYWJlbCIsICJ1bml0RWxlbWVudElkIjogInByZXNzdXJlVW5pdCIsICJsYWJlbCI6ICJQcmVzc3VyZSIsICJ1bml0IjogImtQYSIsInRvb2x0aXAiOiAiUHJlc3N1cmUgaW4gdGhlIGh5ZHJhdWxpYyBzeXN0ZW0ifSwNCiAgICAgICAgImZvcmNlIjogeyJlbGVtZW50SWQiOiAiZm9yY2VMYWJlbCIsICJ1bml0RWxlbWVudElkIjogImZvcmNlVW5pdCIsICJsYWJlbCI6ICJGb3JjZSIsICJ1bml0IjogImtOIiwidG9vbHRpcCI6ICJGb3JjZSBhcHBsaWVkIGJ5IHRoZSBoeWRyYXVsaWMgc3lzdGVtIn0sDQogICAgICAgICJkaXN0YW5jZSI6IHsiZWxlbWVudElkIjogImRpc3RhbmNlTGFiZWwiLCAidW5pdEVsZW1lbnRJZCI6ICJkaXN0YW5jZVVuaXQiLCAibGFiZWwiOiAiRGlzdGFuY2UiLCAidW5pdCI6ICJtbSIsInRvb2x0aXAiOiAiRGlzdGFuY2UgbWVhc3VyZWQgYnkgdGhlIHNlbnNvciJ9LA0KICAgICAgICAicHVtcFN0YXRlIjogeyJlbGVtZW50SWQiOiAicHVtcFN0YXRlTGFiZWwiLCAibGFiZWwiOiAiUHVtcCBTdGF0ZSIsInRvb2x0aXAiOiAiQ3VycmVudCBzdGF0ZSBvZiB0aGUgcHVtcCJ9DQogICAgfSwNCiAgICAiTWVhc3VyZW1lbnRUYWJsZSI6IHsNCiAgICAgICAgInRhYmxlSGVhZGVyIjogWw0KICAgICAgICAgICAgeyJsYWJlbCI6ICJTdGVwIiwgInRvb2x0aXAiOiAiU3RlcCBudW1iZXIifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiUGhhc2UiLCAidG9vbHRpcCI6ICJQaGFzZSJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJUYXJnZXQgUHJlc3N1cmUiLCAidW5pdCI6ICJrUGEiLCAidG9vbHRpcCI6ICJEZXNpcmVkIHByZXNzdXJlIGluIGtpbG9wYXNjYWxzIn0sDQogICAgICAgICAgICB7ImxhYmVsIjogIlByZXNzdXJlIiwgInVuaXQiOiAia1BhIiwgInRvb2x0aXAiOiAiT2JzZXJ2ZWQgcHJlc3N1cmUgaW4ga2lsb3Bhc2NhbHMifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiU2V0dGxpbmcgRGlzdGFuY2UiLCAidW5pdCI6ICJtbSIsICJ0b29sdGlwIjogIlNldHRsaW5nIGRpc3RhbmNlIGluIG1pbGxpbWV0ZXJzIn0sDQogICAgICAgICAgICB7ImxhYmVsIjogIlNldHRsaW5nIFNwZWVkIiwgInVuaXQiOiAibW0vbWluIiwgInRvb2x0aXAiOiAiU2V0dGxpbmcgc3BlZWQgaW4gbWlsbGltZXRlcnMgcGVyIG1pbnV0ZSJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJUaW1lIFN0YW1wIiwgInVuaXQiOiAiaGg6bW06c3MiLCAidG9vbHRpcCI6ICJXaGVuIG1lYXN1cmVtZW50IHdhcyB0YWtlbiJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJSZXN1bHQgU3RhdHVzIiwgICJ0b29sdGlwIjogIlRlc3QgcmVzdWx0IHN0YXR1cyJ9DQogICAgICAgIF0NCiAgICB9DQoNCn0NCg==",y="data:application/json;base64,ew0KICAgICJpMThuIjogew0KICAgICAgICAibm8iOiAiTm9yc2siDQogICAgfSwNCiAgICAiR0NEVUxpbmsiOiB7DQogICAgICAgICJwcmVzc3VyZSI6IHsiZWxlbWVudElkIjogInByZXNzdXJlTGFiZWwiLCAidW5pdEVsZW1lbnRJZCI6ICJwcmVzc3VyZVVuaXQiLCAibGFiZWwiOiAiVHJ5a2siLCAidW5pdCI6ICJrUGEiLCJ0b29sdGlwIjogIlRyeWtrIGkgZGV0IGh5ZHJhdWxpc2tlIHN5c3RlbWV0In0sDQogICAgICAgICJmb3JjZSI6IHsiZWxlbWVudElkIjogImZvcmNlTGFiZWwiLCAidW5pdEVsZW1lbnRJZCI6ICJmb3JjZVVuaXQiLCAibGFiZWwiOiAiS3JhZnQiLCAidW5pdCI6ICJrTiIsInRvb2x0aXAiOiAiS3JhZnQgc29tIHDDpWbDuHJlcyBhdiBkZXQgaHlkcmF1bGlza2Ugc3lzdGVtZXQifSwNCiAgICAgICAgImRpc3RhbmNlIjogeyJlbGVtZW50SWQiOiAiZGlzdGFuY2VMYWJlbCIsICJ1bml0RWxlbWVudElkIjogImRpc3RhbmNlVW5pdCIsICJsYWJlbCI6ICJBdnN0YW5kIiwgInVuaXQiOiAibW0iLCJ0b29sdGlwIjogIkF2c3RhbmQgbcOlbHQgYXYgc2Vuc29yZW4ifSwNCiAgICAgICAgInB1bXBTdGF0ZSI6IHsiZWxlbWVudElkIjogInB1bXBTdGF0ZUxhYmVsIiwgImxhYmVsIjogIlB1bXBldGlsc3RhbmQiLCJ0b29sdGlwIjogIk7DpXbDpnJlbmRlIHRpbHN0YW5kIHRpbCBwdW1wZW4ifQ0KICAgIH0sDQogICAgIk1lYXN1cmVtZW50VGFibGUiOiB7DQogICAgICAgICJ0YWJsZUhlYWRlciI6IFsNCiAgICAgICAgICAgIHsibGFiZWwiOiAiU3RlZyIsICJ0b29sdGlwIjogIlN0ZWcgbnVtbWVyIn0sDQogICAgICAgICAgICB7ImxhYmVsIjogIkZhc2UiLCAidG9vbHRpcCI6ICJGYXNlIn0sDQogICAgICAgICAgICB7ImxhYmVsIjogIk3DpWx0cnlrayIsICJ1bml0IjogImtQYSIsICJ0b29sdGlwIjogIsOYbnNrZXQgdHJ5a2sgaSBraWxvcGFzY2FsIn0sDQogICAgICAgICAgICB7ImxhYmVsIjogIlRyeWtrIiwgInVuaXQiOiAia1BhIiwgInRvb2x0aXAiOiAiT2JzZXJ2ZXJ0ZSB0cnlrayBpIGtpbG9wYXNjYWwifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiSW5uc3RpbGxpbmdzYXZzdGFuZCIsICJ1bml0IjogIm1tIiwgInRvb2x0aXAiOiAiSW5uc3RpbGxpbmdzYXZzdGFuZCBpIG1pbGxpbWV0ZXIifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiSW5uc3RpbGxpbmdzaGFzdGlnaGV0IiwgInVuaXQiOiAibW0vbWluIiwgInRvb2x0aXAiOiAiSW5uc3RpbGxpbmdzaGFzdGlnaGV0IGkgbWlsbGltZXRlciBwZXIgbWludXR0In0sDQogICAgICAgICAgICB7ImxhYmVsIjogIlRpZHNzdGVtcGVsIiwgInVuaXQiOiAiaGg6bW06c3MiLCAidG9vbHRpcCI6ICJOw6VyIG3DpWxpbmdlbiBibGUgdGF0dCJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJSZXN1bHRhdHN0YXR1cyIsICAidG9vbHRpcCI6ICJUZXN0cmVzdWx0YXRzdGF0dXMifQ0KICAgICAgICBdICAgDQogICAgfQ0KDQp9DQo=",x=document.createElement("template");x.innerHTML=`
  <style>
    :host {
      display: block;
    }

    article {
      border: 1px solid #c7d2fe;
      background: #ffffffcc;
      backdrop-filter: blur(3px);
      border-radius: 14px;
      padding: 1rem;
      box-shadow: 0 10px 20px -18px #111827;
    }

    h2 {
      margin: 0 0 0.5rem;
      font-size: 1.1rem;
      color: #ff0000;
    }

    .body {
      color: #1f2937;
      line-height: 1.5;
    }
  </style>

  <article>
    <h2 id="title"></h2>
    <div class="body">
      <slot></slot>
    </div>
  </article>
`;class A extends HTMLElement{static get observedAttributes(){return["title"]}constructor(){super();const t=this.attachShadow({mode:"open"});t.append(x.content.cloneNode(!0)),this.titleEl=t.getElementById("title")}connectedCallback(){this.render()}attributeChangedCallback(){this.render()}render(){this.titleEl.textContent=this.getAttribute("title")||"Card"}}customElements.define("x-card",A);const g='html{box-sizing:border-box}*,*:before,*:after{box-sizing:inherit}html{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}body{margin:0}article,aside,details,figcaption,figure,footer,header,main,menu,nav,section,summary{display:block}audio,canvas,progress,video{display:inline-block}progress{vertical-align:baseline}audio:not([controls]){display:none;height:0}[hidden],template{display:none}a{background-color:transparent;-webkit-text-decoration-skip:objects}a:active,a:hover{outline-width:0}abbr[title]{border-bottom:none;text-decoration:underline;text-decoration:underline dotted}dfn{font-style:italic}mark{background:#ff0;color:#000}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}figure{margin:1em 40px}img{border-style:none}svg:not(:root){overflow:hidden}code,kbd,pre,samp{font-family:monospace,monospace;font-size:1em}hr{box-sizing:content-box;height:0;overflow:visible}button,input,select,textarea{font:inherit;margin:0}optgroup{font-weight:700}button,input{overflow:visible}button,select{text-transform:none}button,html [type=button],[type=reset],[type=submit]{-webkit-appearance:button}button::-moz-focus-inner,[type=button]::-moz-focus-inner,[type=reset]::-moz-focus-inner,[type=submit]::-moz-focus-inner{border-style:none;padding:0}button:-moz-focusring,[type=button]:-moz-focusring,[type=reset]:-moz-focusring,[type=submit]:-moz-focusring{outline:1px dotted ButtonText}fieldset{border:1px solid #c0c0c0;margin:0 2px;padding:.35em .625em .75em}legend{color:inherit;display:table;max-width:100%;padding:0;white-space:normal}textarea{overflow:auto}[type=checkbox],[type=radio]{padding:0}[type=number]::-webkit-inner-spin-button,[type=number]::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}[type=search]::-webkit-search-cancel-button,[type=search]::-webkit-search-decoration{-webkit-appearance:none}::-webkit-input-placeholder{color:inherit;opacity:.54}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}html,body{font-family:Verdana,sans-serif;font-size:15px;line-height:1.5}html{overflow-x:hidden}h1{font-size:36px}h2{font-size:30px}h3{font-size:24px}h4{font-size:20px}h5{font-size:18px}h6{font-size:16px}.w3-serif{font-family:serif}h1,h2,h3,h4,h5,h6{font-family:Segoe UI,Arial,sans-serif;font-weight:400;margin:10px 0}.w3-wide{letter-spacing:4px}hr{border:0;border-top:1px solid #eee;margin:20px 0}.w3-image{max-width:100%;height:auto}img{vertical-align:middle}a{color:inherit}.w3-table,.w3-table-all{border-collapse:collapse;border-spacing:0;width:100%;display:table}.w3-table-all{border:1px solid #ccc}.w3-bordered tr,.w3-table-all tr{border-bottom:1px solid #ddd}.w3-striped tbody tr:nth-child(2n){background-color:#f1f1f1}.w3-table-all tr:nth-child(odd){background-color:#fff}.w3-table-all tr:nth-child(2n){background-color:#f1f1f1}.w3-hoverable tbody tr:hover,.w3-ul.w3-hoverable li:hover{background-color:#ccc}.w3-centered tr th,.w3-centered tr td{text-align:center}.w3-table td,.w3-table th,.w3-table-all td,.w3-table-all th{padding:8px;display:table-cell;text-align:left;vertical-align:top}.w3-table th:first-child,.w3-table td:first-child,.w3-table-all th:first-child,.w3-table-all td:first-child{padding-left:16px}.w3-btn,.w3-button{border:none;display:inline-block;padding:8px 16px;vertical-align:middle;overflow:hidden;text-decoration:none;color:inherit;background-color:inherit;text-align:center;cursor:pointer;white-space:nowrap}.w3-btn:hover{box-shadow:0 8px 16px #0003,0 6px 20px #00000030}.w3-btn,.w3-button{-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.w3-disabled,.w3-btn:disabled,.w3-button:disabled{cursor:not-allowed;opacity:.3}.w3-disabled *,:disabled *{pointer-events:none}.w3-btn.w3-disabled:hover,.w3-btn:disabled:hover{box-shadow:none}.w3-badge,.w3-tag{background-color:#000;color:#fff;display:inline-block;padding-left:8px;padding-right:8px;text-align:center}.w3-badge{border-radius:50%}.w3-ul{list-style-type:none;padding:0;margin:0}.w3-ul li{padding:8px 16px;border-bottom:1px solid #ddd}.w3-ul li:last-child{border-bottom:none}.w3-tooltip,.w3-display-container{position:relative}.w3-tooltip .w3-text{display:none}.w3-tooltip:hover .w3-text{display:inline-block}.w3-ripple:active{opacity:.5}.w3-ripple{transition:opacity 0s}.w3-input{padding:8px;display:block;border:none;border-bottom:1px solid #ccc;width:100%}.w3-select{padding:9px 0;width:100%;border:none;border-bottom:1px solid #ccc}.w3-dropdown-click,.w3-dropdown-hover{position:relative;display:inline-block;cursor:pointer}.w3-dropdown-hover:hover .w3-dropdown-content{display:block}.w3-dropdown-hover:first-child,.w3-dropdown-click:hover{background-color:#ccc;color:#000}.w3-dropdown-hover:hover>.w3-button:first-child,.w3-dropdown-click:hover>.w3-button:first-child{background-color:#ccc;color:#000}.w3-dropdown-content{cursor:auto;color:#000;background-color:#fff;display:none;position:absolute;min-width:160px;margin:0;padding:0;z-index:1}.w3-check,.w3-radio{width:24px;height:24px;position:relative;top:6px}.w3-sidebar{height:100%;width:200px;background-color:#fff;position:fixed!important;z-index:1;overflow:auto}.w3-bar-block .w3-dropdown-hover,.w3-bar-block .w3-dropdown-click{width:100%}.w3-bar-block .w3-dropdown-hover .w3-dropdown-content,.w3-bar-block .w3-dropdown-click .w3-dropdown-content{min-width:100%}.w3-bar-block .w3-dropdown-hover .w3-button,.w3-bar-block .w3-dropdown-click .w3-button{width:100%;text-align:left;padding:8px 16px}.w3-main,#main{transition:margin-left .4s}.w3-modal{z-index:3;display:none;padding-top:100px;position:fixed;left:0;top:0;width:100%;height:100%;overflow:auto;background-color:#000;background-color:#0006}.w3-modal-content{margin:auto;background-color:#fff;position:relative;padding:0;outline:0;width:600px}.w3-bar{width:100%;overflow:hidden}.w3-center .w3-bar{display:inline-block;width:auto}.w3-bar .w3-bar-item{padding:8px 16px;float:left;width:auto;border:none;display:block;outline:0}.w3-bar .w3-dropdown-hover,.w3-bar .w3-dropdown-click{position:static;float:left}.w3-bar .w3-button{white-space:normal}.w3-bar-block .w3-bar-item{width:100%;display:block;padding:8px 16px;text-align:left;border:none;white-space:normal;float:none;outline:0}.w3-bar-block.w3-center .w3-bar-item{text-align:center}.w3-block{display:block;width:100%}.w3-responsive{display:block;overflow-x:auto}.w3-container:after,.w3-container:before,.w3-panel:after,.w3-panel:before,.w3-row:after,.w3-row:before,.w3-row-padding:after,.w3-row-padding:before,.w3-cell-row:before,.w3-cell-row:after,.w3-clear:after,.w3-clear:before,.w3-bar:before,.w3-bar:after{content:"";display:table;clear:both}.w3-col,.w3-half,.w3-third,.w3-twothird,.w3-threequarter,.w3-quarter{float:left;width:100%}.w3-col.s1{width:8.33333%}.w3-col.s2{width:16.66666%}.w3-col.s3{width:24.99999%}.w3-col.s4{width:33.33333%}.w3-col.s5{width:41.66666%}.w3-col.s6{width:49.99999%}.w3-col.s7{width:58.33333%}.w3-col.s8{width:66.66666%}.w3-col.s9{width:74.99999%}.w3-col.s10{width:83.33333%}.w3-col.s11{width:91.66666%}.w3-col.s12{width:99.99999%}@media (min-width:601px){.w3-col.m1{width:8.33333%}.w3-col.m2{width:16.66666%}.w3-col.m3,.w3-quarter{width:24.99999%}.w3-col.m4,.w3-third{width:33.33333%}.w3-col.m5{width:41.66666%}.w3-col.m6,.w3-half{width:49.99999%}.w3-col.m7{width:58.33333%}.w3-col.m8,.w3-twothird{width:66.66666%}.w3-col.m9,.w3-threequarter{width:74.99999%}.w3-col.m10{width:83.33333%}.w3-col.m11{width:91.66666%}.w3-col.m12{width:99.99999%}}@media (min-width:993px){.w3-col.l1{width:8.33333%}.w3-col.l2{width:16.66666%}.w3-col.l3{width:24.99999%}.w3-col.l4{width:33.33333%}.w3-col.l5{width:41.66666%}.w3-col.l6{width:49.99999%}.w3-col.l7{width:58.33333%}.w3-col.l8{width:66.66666%}.w3-col.l9{width:74.99999%}.w3-col.l10{width:83.33333%}.w3-col.l11{width:91.66666%}.w3-col.l12{width:99.99999%}}.w3-content{max-width:980px;margin:auto}.w3-rest{overflow:hidden}.w3-cell-row{display:table;width:100%}.w3-cell{display:table-cell}.w3-cell-top{vertical-align:top}.w3-cell-middle{vertical-align:middle}.w3-cell-bottom{vertical-align:bottom}.w3-hide{display:none!important}.w3-show-block,.w3-show{display:block!important}.w3-show-inline-block{display:inline-block!important}@media (max-width:600px){.w3-modal-content{margin:0 10px;width:auto!important}.w3-modal{padding-top:30px}.w3-dropdown-hover.w3-mobile .w3-dropdown-content,.w3-dropdown-click.w3-mobile .w3-dropdown-content{position:relative}.w3-hide-small{display:none!important}.w3-mobile{display:block;width:100%!important}.w3-bar-item.w3-mobile,.w3-dropdown-hover.w3-mobile,.w3-dropdown-click.w3-mobile{text-align:center}.w3-dropdown-hover.w3-mobile,.w3-dropdown-hover.w3-mobile .w3-btn,.w3-dropdown-hover.w3-mobile .w3-button,.w3-dropdown-click.w3-mobile,.w3-dropdown-click.w3-mobile .w3-btn,.w3-dropdown-click.w3-mobile .w3-button{width:100%}}@media (max-width:768px){.w3-modal-content{width:500px}.w3-modal{padding-top:50px}}@media (min-width:993px){.w3-modal-content{width:900px}.w3-hide-large{display:none!important}.w3-sidebar.w3-collapse{display:block!important}}@media (max-width:992px) and (min-width:601px){.w3-hide-medium{display:none!important}}@media (max-width:992px){.w3-sidebar.w3-collapse{display:none}.w3-main{margin-left:0!important;margin-right:0!important}}.w3-top,.w3-bottom{position:fixed;width:100%;z-index:1}.w3-top{top:0}.w3-bottom{bottom:0}.w3-overlay{position:fixed;display:none;width:100%;height:100%;top:0;left:0;right:0;bottom:0;background-color:#00000080;z-index:2}.w3-display-topleft{position:absolute;left:0;top:0}.w3-display-topright{position:absolute;right:0;top:0}.w3-display-bottomleft{position:absolute;left:0;bottom:0}.w3-display-bottomright{position:absolute;right:0;bottom:0}.w3-display-middle{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);-ms-transform:translate(-50%,-50%)}.w3-display-left{position:absolute;top:50%;left:0%;transform:translateY(-50%);-ms-transform:translate(-0%,-50%)}.w3-display-right{position:absolute;top:50%;right:0%;transform:translateY(-50%);-ms-transform:translate(0%,-50%)}.w3-display-topmiddle{position:absolute;left:50%;top:0;transform:translate(-50%);-ms-transform:translate(-50%,0%)}.w3-display-bottommiddle{position:absolute;left:50%;bottom:0;transform:translate(-50%);-ms-transform:translate(-50%,0%)}.w3-display-container:hover .w3-display-hover{display:block}.w3-display-container:hover span.w3-display-hover{display:inline-block}.w3-display-hover{display:none}.w3-display-position{position:absolute}.w3-circle{border-radius:50%}.w3-round-small{border-radius:2px}.w3-round,.w3-round-medium{border-radius:4px}.w3-round-large{border-radius:8px}.w3-round-xlarge{border-radius:16px}.w3-round-xxlarge{border-radius:32px}.w3-row-padding,.w3-row-padding>.w3-half,.w3-row-padding>.w3-third,.w3-row-padding>.w3-twothird,.w3-row-padding>.w3-threequarter,.w3-row-padding>.w3-quarter,.w3-row-padding>.w3-col{padding:0 8px}.w3-container,.w3-panel{padding:.01em 16px}.w3-panel{margin-top:16px;margin-bottom:16px}.w3-code,.w3-codespan{font-family:Consolas,courier new;font-size:16px}.w3-code{width:auto;background-color:#fff;padding:8px 12px;border-left:4px solid #4CAF50;word-wrap:break-word}.w3-codespan{color:#dc143c;background-color:#f1f1f1;padding-left:4px;padding-right:4px;font-size:110%}.w3-card,.w3-card-2{box-shadow:0 2px 5px #00000029,0 2px 10px #0000001f}.w3-card-4,.w3-hover-shadow:hover{box-shadow:0 4px 10px #0003,0 4px 20px #00000030}.w3-spin{animation:w3-spin 2s infinite linear}@keyframes w3-spin{0%{transform:rotate(0)}to{transform:rotate(359deg)}}.w3-animate-fading{animation:fading 10s infinite}@keyframes fading{0%{opacity:0}50%{opacity:1}to{opacity:0}}.w3-animate-opacity{animation:opac .8s}@keyframes opac{0%{opacity:0}to{opacity:1}}.w3-animate-top{position:relative;animation:animatetop .4s}@keyframes animatetop{0%{top:-300px;opacity:0}to{top:0;opacity:1}}.w3-animate-left{position:relative;animation:animateleft .4s}@keyframes animateleft{0%{left:-300px;opacity:0}to{left:0;opacity:1}}.w3-animate-right{position:relative;animation:animateright .4s}@keyframes animateright{0%{right:-300px;opacity:0}to{right:0;opacity:1}}.w3-animate-bottom{position:relative;animation:animatebottom .4s}@keyframes animatebottom{0%{bottom:-300px;opacity:0}to{bottom:0;opacity:1}}.w3-animate-zoom{animation:animatezoom .6s}@keyframes animatezoom{0%{transform:scale(0)}to{transform:scale(1)}}.w3-animate-input{transition:width .4s ease-in-out}.w3-animate-input:focus{width:100%!important}.w3-opacity,.w3-hover-opacity:hover{opacity:.6}.w3-opacity-off,.w3-hover-opacity-off:hover{opacity:1}.w3-opacity-max{opacity:.25}.w3-opacity-min{opacity:.75}.w3-greyscale-max,.w3-grayscale-max,.w3-hover-greyscale:hover,.w3-hover-grayscale:hover{filter:grayscale(100%)}.w3-greyscale,.w3-grayscale{filter:grayscale(75%)}.w3-greyscale-min,.w3-grayscale-min{filter:grayscale(50%)}.w3-sepia{filter:sepia(75%)}.w3-sepia-max,.w3-hover-sepia:hover{filter:sepia(100%)}.w3-sepia-min{filter:sepia(50%)}.w3-tiny{font-size:10px!important}.w3-small{font-size:12px!important}.w3-medium{font-size:15px!important}.w3-large{font-size:18px!important}.w3-xlarge{font-size:24px!important}.w3-xxlarge{font-size:36px!important}.w3-xxxlarge{font-size:48px!important}.w3-jumbo{font-size:64px!important}.w3-left-align{text-align:left!important}.w3-right-align{text-align:right!important}.w3-justify{text-align:justify!important}.w3-center{text-align:center!important}.w3-border-0{border:0!important}.w3-border{border:1px solid #ccc!important}.w3-border-top{border-top:1px solid #ccc!important}.w3-border-bottom{border-bottom:1px solid #ccc!important}.w3-border-left{border-left:1px solid #ccc!important}.w3-border-right{border-right:1px solid #ccc!important}.w3-topbar{border-top:6px solid #ccc!important}.w3-bottombar{border-bottom:6px solid #ccc!important}.w3-leftbar{border-left:6px solid #ccc!important}.w3-rightbar{border-right:6px solid #ccc!important}.w3-section,.w3-code{margin-top:16px!important;margin-bottom:16px!important}.w3-margin{margin:16px!important}.w3-margin-top{margin-top:16px!important}.w3-margin-bottom{margin-bottom:16px!important}.w3-margin-left{margin-left:16px!important}.w3-margin-right{margin-right:16px!important}.w3-padding-small{padding:4px 8px!important}.w3-padding{padding:8px 16px!important}.w3-padding-large{padding:12px 24px!important}.w3-padding-16{padding-top:16px!important;padding-bottom:16px!important}.w3-padding-24{padding-top:24px!important;padding-bottom:24px!important}.w3-padding-32{padding-top:32px!important;padding-bottom:32px!important}.w3-padding-48{padding-top:48px!important;padding-bottom:48px!important}.w3-padding-64{padding-top:64px!important;padding-bottom:64px!important}.w3-left{float:left!important}.w3-right{float:right!important}.w3-button:hover{color:#000!important;background-color:#ccc!important}.w3-transparent,.w3-hover-none:hover{background-color:transparent!important}.w3-hover-none:hover{box-shadow:none!important}.w3-amber,.w3-hover-amber:hover{color:#000!important;background-color:#ffc107!important}.w3-aqua,.w3-hover-aqua:hover{color:#000!important;background-color:#0ff!important}.w3-blue,.w3-hover-blue:hover{color:#fff!important;background-color:#2196f3!important}.w3-light-blue,.w3-hover-light-blue:hover{color:#000!important;background-color:#87ceeb!important}.w3-brown,.w3-hover-brown:hover{color:#fff!important;background-color:#795548!important}.w3-cyan,.w3-hover-cyan:hover{color:#000!important;background-color:#00bcd4!important}.w3-blue-grey,.w3-hover-blue-grey:hover,.w3-blue-gray,.w3-hover-blue-gray:hover{color:#fff!important;background-color:#607d8b!important}.w3-green,.w3-hover-green:hover{color:#fff!important;background-color:#4caf50!important}.w3-light-green,.w3-hover-light-green:hover{color:#000!important;background-color:#8bc34a!important}.w3-indigo,.w3-hover-indigo:hover{color:#fff!important;background-color:#3f51b5!important}.w3-khaki,.w3-hover-khaki:hover{color:#000!important;background-color:khaki!important}.w3-lime,.w3-hover-lime:hover{color:#000!important;background-color:#cddc39!important}.w3-orange,.w3-hover-orange:hover{color:#000!important;background-color:#ff9800!important}.w3-deep-orange,.w3-hover-deep-orange:hover{color:#fff!important;background-color:#ff5722!important}.w3-pink,.w3-hover-pink:hover{color:#fff!important;background-color:#e91e63!important}.w3-purple,.w3-hover-purple:hover{color:#fff!important;background-color:#9c27b0!important}.w3-deep-purple,.w3-hover-deep-purple:hover{color:#fff!important;background-color:#673ab7!important}.w3-red,.w3-hover-red:hover{color:#fff!important;background-color:#f44336!important}.w3-sand,.w3-hover-sand:hover{color:#000!important;background-color:#fdf5e6!important}.w3-teal,.w3-hover-teal:hover{color:#fff!important;background-color:#009688!important}.w3-yellow,.w3-hover-yellow:hover{color:#000!important;background-color:#ffeb3b!important}.w3-white,.w3-hover-white:hover{color:#000!important;background-color:#fff!important}.w3-black,.w3-hover-black:hover{color:#fff!important;background-color:#000!important}.w3-grey,.w3-hover-grey:hover,.w3-gray,.w3-hover-gray:hover{color:#000!important;background-color:#9e9e9e!important}.w3-light-grey,.w3-hover-light-grey:hover,.w3-light-gray,.w3-hover-light-gray:hover{color:#000!important;background-color:#f1f1f1!important}.w3-dark-grey,.w3-hover-dark-grey:hover,.w3-dark-gray,.w3-hover-dark-gray:hover{color:#fff!important;background-color:#616161!important}.w3-pale-red,.w3-hover-pale-red:hover{color:#000!important;background-color:#fdd!important}.w3-pale-green,.w3-hover-pale-green:hover{color:#000!important;background-color:#dfd!important}.w3-pale-yellow,.w3-hover-pale-yellow:hover{color:#000!important;background-color:#ffc!important}.w3-pale-blue,.w3-hover-pale-blue:hover{color:#000!important;background-color:#dff!important}.w3-text-amber,.w3-hover-text-amber:hover{color:#ffc107!important}.w3-text-aqua,.w3-hover-text-aqua:hover{color:#0ff!important}.w3-text-blue,.w3-hover-text-blue:hover{color:#2196f3!important}.w3-text-light-blue,.w3-hover-text-light-blue:hover{color:#87ceeb!important}.w3-text-brown,.w3-hover-text-brown:hover{color:#795548!important}.w3-text-cyan,.w3-hover-text-cyan:hover{color:#00bcd4!important}.w3-text-blue-grey,.w3-hover-text-blue-grey:hover,.w3-text-blue-gray,.w3-hover-text-blue-gray:hover{color:#607d8b!important}.w3-text-green,.w3-hover-text-green:hover{color:#4caf50!important}.w3-text-light-green,.w3-hover-text-light-green:hover{color:#8bc34a!important}.w3-text-indigo,.w3-hover-text-indigo:hover{color:#3f51b5!important}.w3-text-khaki,.w3-hover-text-khaki:hover{color:#b4aa50!important}.w3-text-lime,.w3-hover-text-lime:hover{color:#cddc39!important}.w3-text-orange,.w3-hover-text-orange:hover{color:#ff9800!important}.w3-text-deep-orange,.w3-hover-text-deep-orange:hover{color:#ff5722!important}.w3-text-pink,.w3-hover-text-pink:hover{color:#e91e63!important}.w3-text-purple,.w3-hover-text-purple:hover{color:#9c27b0!important}.w3-text-deep-purple,.w3-hover-text-deep-purple:hover{color:#673ab7!important}.w3-text-red,.w3-hover-text-red:hover{color:#f44336!important}.w3-text-sand,.w3-hover-text-sand:hover{color:#fdf5e6!important}.w3-text-teal,.w3-hover-text-teal:hover{color:#009688!important}.w3-text-yellow,.w3-hover-text-yellow:hover{color:#d2be0e!important}.w3-text-white,.w3-hover-text-white:hover{color:#fff!important}.w3-text-black,.w3-hover-text-black:hover{color:#000!important}.w3-text-grey,.w3-hover-text-grey:hover,.w3-text-gray,.w3-hover-text-gray:hover{color:#757575!important}.w3-text-light-grey,.w3-hover-text-light-grey:hover,.w3-text-light-gray,.w3-hover-text-light-gray:hover{color:#f1f1f1!important}.w3-text-dark-grey,.w3-hover-text-dark-grey:hover,.w3-text-dark-gray,.w3-hover-text-dark-gray:hover{color:#3a3a3a!important}.w3-border-amber,.w3-hover-border-amber:hover{border-color:#ffc107!important}.w3-border-aqua,.w3-hover-border-aqua:hover{border-color:#0ff!important}.w3-border-blue,.w3-hover-border-blue:hover{border-color:#2196f3!important}.w3-border-light-blue,.w3-hover-border-light-blue:hover{border-color:#87ceeb!important}.w3-border-brown,.w3-hover-border-brown:hover{border-color:#795548!important}.w3-border-cyan,.w3-hover-border-cyan:hover{border-color:#00bcd4!important}.w3-border-blue-grey,.w3-hover-border-blue-grey:hover,.w3-border-blue-gray,.w3-hover-border-blue-gray:hover{border-color:#607d8b!important}.w3-border-green,.w3-hover-border-green:hover{border-color:#4caf50!important}.w3-border-light-green,.w3-hover-border-light-green:hover{border-color:#8bc34a!important}.w3-border-indigo,.w3-hover-border-indigo:hover{border-color:#3f51b5!important}.w3-border-khaki,.w3-hover-border-khaki:hover{border-color:khaki!important}.w3-border-lime,.w3-hover-border-lime:hover{border-color:#cddc39!important}.w3-border-orange,.w3-hover-border-orange:hover{border-color:#ff9800!important}.w3-border-deep-orange,.w3-hover-border-deep-orange:hover{border-color:#ff5722!important}.w3-border-pink,.w3-hover-border-pink:hover{border-color:#e91e63!important}.w3-border-purple,.w3-hover-border-purple:hover{border-color:#9c27b0!important}.w3-border-deep-purple,.w3-hover-border-deep-purple:hover{border-color:#673ab7!important}.w3-border-red,.w3-hover-border-red:hover{border-color:#f44336!important}.w3-border-sand,.w3-hover-border-sand:hover{border-color:#fdf5e6!important}.w3-border-teal,.w3-hover-border-teal:hover{border-color:#009688!important}.w3-border-yellow,.w3-hover-border-yellow:hover{border-color:#ffeb3b!important}.w3-border-white,.w3-hover-border-white:hover{border-color:#fff!important}.w3-border-black,.w3-hover-border-black:hover{border-color:#000!important}.w3-border-grey,.w3-hover-border-grey:hover,.w3-border-gray,.w3-hover-border-gray:hover{border-color:#9e9e9e!important}.w3-border-light-grey,.w3-hover-border-light-grey:hover,.w3-border-light-gray,.w3-hover-border-light-gray:hover{border-color:#f1f1f1!important}.w3-border-dark-grey,.w3-hover-border-dark-grey:hover,.w3-border-dark-gray,.w3-hover-border-dark-gray:hover{border-color:#616161!important}.w3-border-pale-red,.w3-hover-border-pale-red:hover{border-color:#ffe7e7!important}.w3-border-pale-green,.w3-hover-border-pale-green:hover{border-color:#e7ffe7!important}.w3-border-pale-yellow,.w3-hover-border-pale-yellow:hover{border-color:#ffc!important}.w3-border-pale-blue,.w3-hover-border-pale-blue:hover{border-color:#e7ffff!important}',I=document.createElement("template");I.innerHTML=`
  <style>
    ${g}

    :host {
      display: block;
    }

    .counter {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 999px;
      border: 1px solid #bae6fd;
      background: #f0f9ff;
      color: #0f172a;
    }

    button {
      border: 0;
      border-radius: 999px;
      padding: 0.45rem 0.85rem;
      font: inherit;
      background: #0ea5e9;
      color: white;
      cursor: pointer;
    }

    button:hover {
      background: #0284c7;
    }

    output {
      min-width: 2ch;
      text-align: right;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }
  </style>

  <div class="w3-card-4 w3-padding">
    <button class="w3-button w3-red" type="button" id="increment">Increment</button>
    <output id="value">0</output>
  </div>
`;class L extends HTMLElement{static sayHello(t){console.log("Hello from XCounter class! Input value:",t)}constructor(){super();const t=this.attachShadow({mode:"open"});t.append(I.content.cloneNode(!0)),this.valueEl=t.getElementById("value"),this.incrementButton=t.getElementById("increment"),this.value=Number(this.getAttribute("start")||0),this.step=Number(this.getAttribute("step")||1),this.onIncrement=this.onIncrement.bind(this)}connectedCallback(){this.incrementButton.addEventListener("click",this.onIncrement),this.render()}disconnectedCallback(){this.incrementButton.removeEventListener("click",this.onIncrement)}onIncrement(){this.value+=this.step,this.dispatchEvent(new CustomEvent("count-change",{detail:{value:this.value},bubbles:!0,composed:!0})),this.render()}render(){this.valueEl.textContent=String(this.value)}sayHello(t){console.log("Hello from XCounter instance! Input value:",t)}}customElements.define("x-counter",L);const C=document.createElement("template");C.innerHTML=`
  <style>
    :host {
      display: block;
      min-height: 100dvh;
      padding: 2rem;
      background: radial-gradient(circle at top left, #f6efe6, #f2f7ff 50%, #eaf7f0);
      color: #1f2937;
      font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    }

    .layout {
      max-width: 820px;
      margin: 0 auto;
      display: grid;
      gap: 1rem;
    }

    h1 {
      margin: 0;
      font-size: clamp(1.7rem, 2vw + 1rem, 2.5rem);
      letter-spacing: 0.02em;
    }

    p {
      margin: 0;
      color: #374151;
      line-height: 1.5;
    }
  </style>

  <main class="layout">
    <h1>Web Components Playground</h1>
    <p>Everything here is built with Custom Elements and Shadow DOM.</p>

    <x-card title="Starter card">
      You can slot any HTML content inside this card.
    </x-card>

    <x-counter start="2" step="1"></x-counter>
  </main>
`;class S extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}).append(C.content.cloneNode(!0))}}customElements.define("app-root",S);const h=new Map,u=new Map;class b extends HTMLElement{static get observedAttributes(){return["title","counter"]}constructor(){super();const t=this.attachShadow({mode:"open"});t.innerHTML=this.getTemplateHtml(),this.titleEl=t.getElementById("openPortButton"),this.buttonLabelEl=t.getElementById("buttonLabel"),this.autoIndicatorEl=t.getElementById("autoIndicator"),this.messageEl=t.getElementById("message"),this.statusLEDEl=t.getElementById("statusLED"),this.counter=0,this.verbose=!1,this.port=null,this.reader=null,this.keepReading=!1,this.isConnecting=!1,this.readBuffer="",this.decoder=new TextDecoder,this.encoder=new TextEncoder,this.autoConnectTimer=null,this.autoConnectEnabled=!1,this.autoReconnectOnLoss=!1,this.currentLanguageCode=null,this.onOpenPortClick=this.onOpenPortClick.bind(this),this.onSerialDisconnect=this.onSerialDisconnect.bind(this),this.onLanguageChange=this.onLanguageChange.bind(this)}getExtraStyles(){return""}processIncomingLine(t){return!1}getStatusState(){return this.port?"green":"red"}getStatusLabel(){return this.port?"Connected":"Disconnected"}getButtonLabelText(){return this.getAttribute("title")||"Serial Port"}getExtraMarkup(){return""}getTitleButtonWidth(){return"10rem"}async onPortConnected(){}async onPortDisconnected(){}afterRender(){}getLocaleComponentKey(){return this.constructor.name}getLocaleElementMap(){return{}}getDefaultLanguageCode(){var e;const t=((e=document.documentElement)==null?void 0:e.lang)||"";return String(t).trim().slice(0,2).toLowerCase()||"en"}normalizeLanguageCode(t){return typeof t!="string"?"":t.trim().slice(0,2).toLowerCase()}async onLanguageChange(t){const e=t==null?void 0:t.detail,o=typeof e=="string"?e:e==null?void 0:e.code;await this.applyLanguage(o)}async loadLocaleCatalog(t){const e=this.normalizeLanguageCode(t);if(!e)return null;if(h.has(e))return h.get(e);if(u.has(e))return u.get(e);const o=(async()=>{try{const r=new URL(Object.assign({"./locale/en_lang.json":v,"./locale/no_lang.json":y})[`./locale/${e}_lang.json`],import.meta.url),i=await fetch(r);if(!i.ok)throw new Error(`Locale file not found: ${e}`);const a=await i.json();return h.set(e,a),a}catch(r){return this.emitAppLog("warn",`Could not load locale '${e}'`),console.warn("Failed to load locale catalog:",e,r),null}finally{u.delete(e)}})();return u.set(e,o),o}applyComponentLocale(t){if(!this.shadowRoot||!t||typeof t!="object")return;const e=this.getLocaleElementMap()||{};for(const[o,r]of Object.entries(t)){if(!r||typeof r!="object")continue;const i=e[o]||{},a=r.elementId||i.labelId||`${o}Label`,c=r.unitElementId||i.unitId||`${o}Unit`,p=r.tooltipElementId||i.tooltipId||a;if(typeof r.label=="string"&&a){const l=this.shadowRoot.getElementById(a);l&&(l.textContent=r.label)}if(typeof r.unit=="string"&&c){const l=this.shadowRoot.getElementById(c);l&&(l.textContent=r.unit)}if(typeof r.tooltip=="string"&&p){const l=this.shadowRoot.getElementById(p);l&&(l.title=r.tooltip,l.setAttribute("aria-label",r.tooltip))}}}async applyLanguage(t){const e=this.normalizeLanguageCode(t||this.getDefaultLanguageCode());if(!e||e===this.currentLanguageCode)return;const o=await this.loadLocaleCatalog(e);if(!o)return;const r=this.getLocaleComponentKey();if(!r||!o[r]){this.currentLanguageCode=e;return}this.applyComponentLocale(o[r]),this.currentLanguageCode=e}emitAppLog(t,e,o={}){this.dispatchEvent(new CustomEvent("app-log",{detail:{level:t,source:this.id||this.tagName.toLowerCase(),message:e,...o},bubbles:!0,composed:!0}))}isAutoConnectRequested(){const t=this.getAttribute("autoconnect");return t==null?!1:t!=="false"}getAutoConnectIntervalMs(){const t=Number.parseInt(this.getAttribute("autoconnect-interval-ms")||"5000",10);return Number.isFinite(t)&&t>=1e3?t:5e3}getAutoConnectStorageScope(){return`${this.tagName.toLowerCase()}:${this.id||this.getAttribute("title")||"default"}`}getRememberedPortStorageKey(){return`gc.serial.rememberedPort.${this.getAutoConnectStorageScope()}`}getRememberedPortHint(){try{const t=localStorage.getItem(this.getRememberedPortStorageKey());if(!t)return null;const e=JSON.parse(t);return e&&typeof e=="object"?e:null}catch{return null}}clearRememberedPortHint(){localStorage.removeItem(this.getRememberedPortStorageKey())}rememberCurrentPortHint(t={}){if(!this.port)return;const e=this.port.getInfo(),o={usbVendorId:e.usbVendorId??null,usbProductId:e.usbProductId??null,updatedAt:new Date().toISOString(),...t};localStorage.setItem(this.getRememberedPortStorageKey(),JSON.stringify(o))}isSamePort(t,e){if(!t||!e)return!1;const o=t.getInfo();return o.usbVendorId===e.usbVendorId&&o.usbProductId===e.usbProductId}async tryAutoConnect(){if(!this.autoConnectEnabled||this.port||this.isConnecting||!navigator.serial)return;const t=this.getRememberedPortHint();if(!t)return;const o=(await navigator.serial.getPorts()).find(r=>this.isSamePort(r,t));o&&await this.connectPort({port:o,requestPortIfMissing:!1})}startAutoConnect(){this.stopAutoConnect(),this.autoConnectEnabled=!0,this.tryAutoConnect(),this.autoConnectTimer=setInterval(()=>{this.tryAutoConnect()},this.getAutoConnectIntervalMs())}stopAutoConnect(){this.autoConnectEnabled=!1,this.autoConnectTimer&&(clearInterval(this.autoConnectTimer),this.autoConnectTimer=null)}enableAutoConnect(){this.setAttribute("autoconnect","true"),this.autoReconnectOnLoss=!0,this.port||this.startAutoConnect()}disableAutoConnect(){this.setAttribute("autoconnect","false"),this.autoReconnectOnLoss=!1,this.stopAutoConnect()}getTemplateHtml(){return`
                    <style>
                        ${g}
                    </style>

                    <style>
                        :host {
                            display: block;
                        }

                        .link-card {
                            display: grid;
                            gap: 0.75rem;
                        }

                        .header-bar {
                            display: flex;
                            align-items: center;
                            gap: 0.5rem;
                            padding: var(--gc-header-padding, 0.5rem);
                            padding-top: var(--gc-header-padding-top, var(--gc-header-padding, 0.5rem));
                        }

                        .title-button {
                            display: inline-flex;
                            align-items: center;
                            justify-content: flex-start;
                            gap: 0.5rem;
                            width: ${this.getTitleButtonWidth()};
                            flex: 0 0 ${this.getTitleButtonWidth()};
                            text-align: left;
                        }

                        .button-label {
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }

                        .message-input {
                            flex: 1 1 auto;
                            min-width: 0;
                        }

                        .auto-indicator {
                            display: none;
                            font-size: 0.68rem;
                            font-weight: 700;
                            letter-spacing: 0.04em;
                            text-transform: uppercase;
                            color: #526071;
                            border: 1px solid #c8d0dc;
                            border-radius: 999px;
                            padding: 0.12rem 0.45rem;
                            background: #f8fafc;
                            user-select: none;
                        }

                        .auto-indicator[data-enabled="true"] {
                            color: #065f46;
                            border-color: #6ee7b7;
                            background: #ecfdf5;
                        }

                        .auto-indicator[data-enabled="false"] {
                            color: #64748b;
                            border-color: #cbd5e1;
                            background: #f8fafc;
                        }

                        .expand-collapse-icon {
                            display: inline-block;
                            width: 0.55rem;
                            height: 0.55rem;
                            border-right: 2px solid currentColor;
                            border-bottom: 2px solid currentColor;
                            transform: rotate(-45deg);
                            transform-origin: center;
                        }

                        .led-indicator {
                            width: 8px;
                            height: 8px;
                            min-width: 8px;
                            border-radius: 50%;
                            border: 1px solid rgba(47, 55, 68, 0.35);
                            background-color: #f0b429;
                            box-shadow: 0 0 0 2px rgba(47, 55, 68, 0.08);
                        }

                        .led-indicator[data-state="green"] {
                            background-color: #1a9b2e;
                        }

                        .led-indicator[data-state="yellow"] {
                            background-color: #f0b429;
                        }

                        .led-indicator[data-state="red"] {
                            background-color: #c0392b;
                        }

                        .body {
                            color: #1f2937;
                            line-height: 1.5;
                            border: 1px solid #ff0000;

                        }

                        ${this.getExtraStyles()}
                    </style>

                        <div id="linkCard" class="w3-container link-card">
                            <div class="header-bar">
                            <i id="expandCollapseButton" class="w3-button w3-border w3-round w3-light-gray w3-hover-gray w3-hide" title="Collapse/Expand" role="button" aria-label="Collapse/Expand"><span class="expand-collapse-icon" aria-hidden="true"></span></i>
                            <button id="openPortButton" class="w3-button w3-border w3-round title-button">
                                <span id="statusLED" class="led-indicator" data-state="red" role="img" aria-label="Link Status" title="Link"></span>
                                <span id="buttonLabel" class="button-label">Title</span>
                            </button>
                            <span id="autoIndicator" class="auto-indicator" data-enabled="false" title="Autoconnect disabled">Auto</span>
                            <input type="text" id="message" class="w3-input w3-border w3-round message-input" placeholder="Port input" readonly>
                        </div>
                        <div class="body">
                            ${this.getExtraMarkup()}
                            <slot></slot>
                        </div>
                    </div>
                `}connectedCallback(){var t;this.titleEl.addEventListener("click",this.onOpenPortClick),(t=navigator.serial)==null||t.addEventListener("disconnect",this.onSerialDisconnect),document.addEventListener("app-language-change",this.onLanguageChange),this.render(),this.applyLanguage(this.getDefaultLanguageCode())}disconnectedCallback(){var t;this.titleEl.removeEventListener("click",this.onOpenPortClick),(t=navigator.serial)==null||t.removeEventListener("disconnect",this.onSerialDisconnect),document.removeEventListener("app-language-change",this.onLanguageChange),this.stopAutoConnect(),this.disconnectPort()}isPortLostError(t){return(t==null?void 0:t.name)==="NetworkError"||/device has been lost/i.test(String((t==null?void 0:t.message)||""))}async handlePortLost(t=null){!this.port&&!this.reader||(t&&(console.warn("Serial device disconnected:",t),this.emitAppLog("warn","Serial device disconnected")),this.keepReading=!1,this.reader=null,this.port=null,await this.onPortDisconnected(),this.autoReconnectOnLoss&&this.startAutoConnect(),this.render())}onSerialDisconnect(t){this.port&&(t==null?void 0:t.port)===this.port&&this.handlePortLost(t)}attributeChangedCallback(){this.render()}async onOpenPortClick(){if(this.port){await this.disconnectPort({intentional:!0});return}await this.connectPort({requestPortIfMissing:!0})}async connectPort(t={}){const{port:e=null,requestPortIfMissing:o=!1}=t;if(!navigator.serial){console.error("Web Serial API is not available in this browser.");return}if(!(this.isConnecting||this.port)){this.isConnecting=!0;try{if(e)this.port=e;else if(o)this.port=await navigator.serial.requestPort();else{this.port=null;return}await this.port.open({baudRate:115200}),this.keepReading=!0,this.readBuffer="",this.readLoop(),this.rememberCurrentPortHint(),this.autoReconnectOnLoss=this.isAutoConnectRequested(),this.stopAutoConnect(),console.log("Serial port opened:",this.port),this.emitAppLog("info","Serial port opened"),await this.onPortConnected(),this.render()}catch(r){this.verbose&&console.error("Error opening serial port:",r),this.emitAppLog("error","Failed to open serial port"),this.port=null,this.keepReading=!1,this.render()}finally{this.isConnecting=!1}}}async disconnectPort(t={}){const{intentional:e=!1}=t;e&&(this.autoReconnectOnLoss=!1,this.stopAutoConnect()),this.keepReading=!1;const o=this.reader;this.reader=null;try{if(o){await o.cancel();try{o.releaseLock()}catch{}}}catch(r){console.error("Error stopping serial reader:",r),this.emitAppLog("warn","Error stopping serial reader")}try{this.port&&await this.port.close()}catch(r){console.error("Error closing serial port:",r),this.emitAppLog("warn","Error closing serial port")}finally{this.port=null,await this.onPortDisconnected(),this.emitAppLog("info","Serial port closed"),this.render()}}async writeLine(t){var o;if(!((o=this.port)!=null&&o.writable))throw new Error("Serial port is not writable.");const e=this.port.writable.getWriter();try{const r=String(t).replace(/[\r\n]+$/,"");console.log("Writing to serial port:",r),this.emitAppLog("debug",`TX ${r}`),await e.write(this.encoder.encode(`${r}\r
`))}finally{e.releaseLock()}}async readLoop(){var e;if(!((e=this.port)!=null&&e.readable))return;let t;try{for(t=this.port.readable.getReader(),this.reader=t;this.keepReading;){const{value:o,done:r}=await t.read();if(r)break;o&&this.pushChunk(o)}}catch(o){this.keepReading&&this.isPortLostError(o)?await this.handlePortLost(o):this.keepReading&&(console.error("Error while reading serial data:",o),this.emitAppLog("error","Error while reading serial data"))}finally{try{t==null||t.releaseLock()}catch{}this.reader===t&&(this.reader=null)}}pushChunk(t){this.readBuffer+=this.decoder.decode(t,{stream:!0});const e=this.readBuffer.split(/\r?\n/);this.readBuffer=e.pop()||"";for(const o of e)this.handleIncoming(o)}handleIncoming(t){this.counter++;const e=this.processIncomingLine(t);e||(console.log("Received unhandled line:",t),this.messageEl.value=t),this.statusLEDEl.setAttribute("counter",this.counter),this.dispatchEvent(new CustomEvent("serial-line",{detail:{line:t,handled:e},bubbles:!0,composed:!0})),this.render()}render(){const t=this.getStatusLabel(),e=this.autoConnectEnabled||this.isAutoConnectRequested();this.buttonLabelEl.textContent=this.getButtonLabelText(),this.statusLEDEl.dataset.state=this.getStatusState(),this.statusLEDEl.title=t,this.statusLEDEl.setAttribute("aria-label",t),this.statusLEDEl.setAttribute("counter",this.counter),this.autoIndicatorEl.dataset.enabled=e?"true":"false",this.autoIndicatorEl.title=e?"Autoconnect enabled":"Autoconnect disabled",this.afterRender()}}customElements.define("gc-serialport",b);class B extends b{static get observedAttributes(){return["title","counter"]}isAutoConnectRequested(){const t=this.getAttribute("autoconnect");return t==null?!0:t!=="false"}getExtraStyles(){return`
        .du-toggle {
                transition: background-color 180ms ease;
            }

        .du-toggle .expand-collapse-icon {
                transition: transform 180ms ease;
            }

        .du-toggle[data-expanded="true"] .expand-collapse-icon {
                transform: rotate(45deg);
            }

      .du-metrics {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 0.75rem;
        padding: 0.75rem;
        overflow: hidden;
        max-height: 56rem;
        opacity: 1;
        transform: scaleY(1);
        transform-origin: top;
        transition: max-height 180ms ease, opacity 180ms ease, transform 180ms ease, padding 180ms ease;
      }

      .du-metrics[data-collapsed="true"] {
        max-height: 0;
        opacity: 0;
        transform: scaleY(0.96);
        padding-top: 0;
        padding-bottom: 0;
        border-width: 0;
      }

      .metric-item {
        padding: 1rem;
        border: 1px solid #d9dee8;
        border-radius: 0.5rem;
        background: #f8fafc;
      }

      .metric-label {
        margin: 0 0 0.35rem;
        font-size: 0.8rem;
        color: #526071;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .metric-value {
        margin: 0;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        font-size: clamp(1.75rem, 2vw + 1rem, 2.20rem);
        font-weight: 700;
        color: #1f2937;
        line-height: 1.1;
      }

      .metric-unit {
        margin-left: 0.35rem;
        font-size: 1rem;
        font-weight: 500;
        color: #526071;
      }

      .message-input {
        display: none;
      }
      
.realtime-pump-controls {
  width: 100%;
  display: flex;
  align-items: stretch;
  justify-content: center;
}

.pump-control-bar {
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 2px;
}

.pump-control-button {
  flex: 1 1 0;
  min-height: 44px;
  padding: 0;
  border-radius: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
  background-color: #2196f3 !important;
  color: #fff !important;
}

.pump-control-bar .pump-control-button:first-child {
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
}

.pump-control-bar .pump-control-button:last-child {
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
}

.pump-control-button:hover,
.pump-control-button:focus,
.pump-control-button:active {
  background-color: #2196f3 !important;
  color: #fff !important;
}

.pump-icon {
  width: 18px;
  height: 18px;
  display: block;
  fill: currentColor;
}

.pump-control-button.is-active {
  background-color: #2196f3 !important;
  border-color: #0f4e82;
  box-shadow: inset 0 0 0 1px #0f4e82;
}

.pump-control-button.is-active:hover,
.pump-control-button.is-active:focus,
.pump-control-button.is-active:active {
  background-color: #2196f3 !important;
  color: #fff !important;
}

.pump-control-button:not(.is-active) {
  opacity: 1;
}

.pump-control-button:not(.is-active):hover,
.pump-control-button:not(.is-active):focus,
.pump-control-button:not(.is-active):active {
  background-color: #2196f3 !important;
  color: #fff !important;
}

.pump-control-button.is-pending {
  border-color: #ffffff;
  box-shadow: inset 0 0 0 2px #ffffff, 0 0 0 2px #0f4e82;
  animation: pump-pending-pulse 700ms ease-in-out infinite;
}

@keyframes pump-pending-pulse {
  0% {
    filter: brightness(1);
  }

  50% {
    filter: brightness(1.12);
  }

  100% {
    filter: brightness(1);
  }
}

    `}getExtraMarkup(){return`
      <div id="duMetrics" class="w3-container w3-card-4 w3-round du-metrics w3-light-gray">
        <div class="metric-item">
          <p class="metric-label" id="pressureLabel">Pressure</p>
          <p class="metric-value"><span id="currentPressure">0,0</span> <span class="metric-unit" id="pressureUnit">kPa</span></p>
        </div>
        <div class="metric-item">
          <p class="metric-label" id="forceLabel">Kraft</p>
          <p class="metric-value"><span id="currentForce">0,00</span> <span class="metric-unit" id="forceUnit">kN</span></p>
        </div>
        <div class="metric-item">
          <p class="metric-label" id="distanceLabel">Setning</p>
          <p class="metric-value"><span id="currentDistance">0,00</span> <span class="metric-unit" id="distanceUnit">mm</span></p>
        </div>
        <div class="metric-item w3-hide">
          <p class="metric-label" id="pumpStateLabel">Pump State</p>
          <p class="metric-value"><span id="pumpState">0</span></p>
        </div>
        <div class="metric-item">
          <div class="realtime-pump-controls" aria-label="Pump controls">
            <div class="pump-control-bar">
              <button class="w3-button w3-blue pump-control-button" id="pumpUPButton" aria-label="Pump up" title="Pump UP">
                <svg class="pump-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M12 4l-7 7h4v9h6v-9h4z"></path>
                </svg>
              </button>
              <button class="w3-button w3-blue pump-control-button" id="pumpSTOPButton" aria-label="Pump stop"
                title="Pump STOP">
                <svg class="pump-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M7 5h4v14H7zm6 0h4v14h-4z"></path>
                </svg>
              </button>
              <button class="w3-button w3-blue pump-control-button" id="pumpDOWNButton" aria-label="Pump down"
                title="Pump DOWN">
                <svg class="pump-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M12 20l7-7h-4V4H9v9H5z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

      </div>
    `}constructor(){super(),this.shadowRoot.getElementById("linkCard").classList.add("w3-quarter"),this.expandCollapseButtonEl=this.shadowRoot.getElementById("expandCollapseButton"),this.expandCollapseButtonEl.classList.remove("w3-hide"),this.expandCollapseButtonEl.classList.add("du-toggle"),this.metricsEl=this.shadowRoot.getElementById("duMetrics"),this.pumpStateEl=this.shadowRoot.getElementById("pumpState"),this.pumpUpButtonEl=this.shadowRoot.getElementById("pumpUPButton"),this.pumpStopButtonEl=this.shadowRoot.getElementById("pumpSTOPButton"),this.pumpDownButtonEl=this.shadowRoot.getElementById("pumpDOWNButton"),this.currentPressureEl=this.shadowRoot.getElementById("currentPressure"),this.currentForceEl=this.shadowRoot.getElementById("currentForce"),this.currentDistanceEl=this.shadowRoot.getElementById("currentDistance"),this.isExpanded=!1,this.deviceInfo={name:null,swVersion:null,hwVersion:null},this.telemetry={force:null,pressure:null,distance:null,pumpState:null},this.onToggleExpanded=this.onToggleExpanded.bind(this),this.onPumpUpClick=this.onPumpUpClick.bind(this),this.onPumpStopClick=this.onPumpStopClick.bind(this),this.onPumpDownClick=this.onPumpDownClick.bind(this),this.pendingPumpState=null,this.pendingPumpStateTimer=null,this.expandCollapseButtonEl.addEventListener("click",this.onToggleExpanded),this.pumpUpButtonEl.addEventListener("click",this.onPumpUpClick),this.pumpStopButtonEl.addEventListener("click",this.onPumpStopClick),this.pumpDownButtonEl.addEventListener("click",this.onPumpDownClick),this.updatePumpButtonState()}disconnectedCallback(){var t,e,o,r;(t=this.expandCollapseButtonEl)==null||t.removeEventListener("click",this.onToggleExpanded),(e=this.pumpUpButtonEl)==null||e.removeEventListener("click",this.onPumpUpClick),(o=this.pumpStopButtonEl)==null||o.removeEventListener("click",this.onPumpStopClick),(r=this.pumpDownButtonEl)==null||r.removeEventListener("click",this.onPumpDownClick),this.clearPendingPumpState(),super.disconnectedCallback()}addTrace(t,e){let o="debug";t==="ERR"&&(o="error"),t==="RX"&&e.startsWith("$version,")&&(o="info"),this.emitAppLog(o,`${t}: ${e}`)}async sendPumpCommand(t,e){if(!this.port)return;const o=`pump=${t}`;try{this.setPendingPumpState(e),this.addTrace("TX",o),await this.writeLine(o)}catch(r){this.clearPendingPumpState(),this.addTrace("ERR",`TX failed: ${o}`),console.error("Failed to send pump command:",o,r)}}onPumpUpClick(){this.sendPumpCommand("up",1)}onPumpStopClick(){this.sendPumpCommand("stop",0)}onPumpDownClick(){this.sendPumpCommand("down",2)}setPendingPumpState(t){this.clearPendingPumpState(),this.pendingPumpState=t,this.pendingPumpStateTimer=setTimeout(()=>{this.clearPendingPumpState(),this.updatePumpButtonState()},2e3),this.updatePumpButtonState()}clearPendingPumpState(){this.pendingPumpStateTimer&&(clearTimeout(this.pendingPumpStateTimer),this.pendingPumpStateTimer=null),this.pendingPumpState=null}onToggleExpanded(){this.port&&(this.isExpanded=!this.isExpanded,this.render())}getButtonLabelText(){return this.deviceInfo.name||this.getAttribute("title")||"DU"}async onPortConnected(){this.isExpanded=!0,this.deviceInfo={name:null,swVersion:null,hwVersion:null};try{await new Promise(e=>setTimeout(e,150));const t="version?";this.addTrace("TX",t),console.log("Requesting DU version with command:",t),await this.writeLine(t)}catch(t){this.addTrace("ERR","TX failed: version?"),console.error("Failed to request DU version:",t)}}async onPortDisconnected(){this.isExpanded=!1,this.clearPendingPumpState(),this.deviceInfo={name:null,swVersion:null,hwVersion:null}}processIncomingLine(t){this.addTrace("RX",t);const e=this.parseVersionResponse(t);if(e)return this.deviceInfo=e,this.rememberCurrentPortHint({deviceType:"du",name:e.name,swVersion:e.swVersion,hwVersion:e.hwVersion}),this.messageEl.value=t,!0;if(!t.startsWith("$GCfpsP"))return!1;const o=this.parsePressureSentence(t);return o?(this.telemetry=o,this.messageEl.value=t,this.updateTelemetryFields(),!0):(this.messageEl.value=t,!0)}parsePressureSentence(t){const o=t.split("*")[0].split(",").map(i=>i.trim());if(o[0]!=="$GCfpsP")return null;const r=o.slice(1,5);return r.length<4?null:{force:this.parseNumber(r[0]),pressure:this.parseNumber(r[1]),distance:this.parseNumber(r[2]),pumpState:this.parsePumpState(r[3])}}parseVersionResponse(t){var p,l,f;const e=t.trim();if(!e)return null;if(e.startsWith("$version,")){const d=e.slice(9);try{const s=JSON.parse(d);return!s||typeof s!="object"?null:{name:typeof s.name=="string"?s.name.toUpperCase():null,swVersion:typeof s.fw=="string"?s.fw:null,hwVersion:typeof s.hw=="string"?s.hw:null}}catch(s){return console.error("Failed to parse DU version response:",s,e),null}}const r=e.split("*")[0].split(",").map(d=>d.trim()).filter(Boolean);if(r.length>=3&&this.looksLikeDeviceName(r[0]))return{name:r[0],swVersion:r[1]||null,hwVersion:r[2]||null};const i=(p=r[0])!=null&&p.toLowerCase().includes("version")?r.slice(1):null;if(i&&i.length>=3&&this.looksLikeDeviceName(i[0]))return{name:i[0],swVersion:i[1]||null,hwVersion:i[2]||null};const a=e.match(/\bDU\d+\b/i);if(!a)return null;const c=[...e.matchAll(/\b(?:sw|hw)[-_ ]?version[:= ]*([^,\s]+)/gi)];return{name:a[0].toUpperCase(),swVersion:((l=c.find(d=>d[0].toLowerCase().startsWith("sw")))==null?void 0:l[1])||null,hwVersion:((f=c.find(d=>d[0].toLowerCase().startsWith("hw")))==null?void 0:f[1])||null}}looksLikeDeviceName(t){return/^DU\d+$/i.test(t)}parseNumber(t){const e=Number.parseFloat(t);return Number.isFinite(e)?e:null}parsePumpState(t){const e=Number.parseInt(t,10);return Number.isInteger(e)?e:null}updateTelemetryFields(){this.pumpStateEl.textContent=this.formatPumpState(this.telemetry.pumpState),this.currentPressureEl.textContent=this.formatMetric(this.telemetry.pressure,2,"0.00"),this.currentForceEl.textContent=this.formatMetric(this.telemetry.force,2,"0.00"),this.currentDistanceEl.textContent=this.formatMetric(this.telemetry.distance,2,"0.00"),this.pendingPumpState!=null&&this.telemetry.pumpState===this.pendingPumpState&&this.clearPendingPumpState(),this.updatePumpButtonState()}updatePumpButtonState(){this.pumpUpButtonEl.classList.toggle("is-active",this.telemetry.pumpState===1),this.pumpStopButtonEl.classList.toggle("is-active",this.telemetry.pumpState===0),this.pumpDownButtonEl.classList.toggle("is-active",this.telemetry.pumpState===2),this.pumpUpButtonEl.classList.toggle("is-pending",this.pendingPumpState===1),this.pumpStopButtonEl.classList.toggle("is-pending",this.pendingPumpState===0),this.pumpDownButtonEl.classList.toggle("is-pending",this.pendingPumpState===2);const t=!this.port;this.pumpUpButtonEl.disabled=t,this.pumpStopButtonEl.disabled=t,this.pumpDownButtonEl.disabled=t}afterRender(){const t=!!(this.port&&this.isExpanded);this.metricsEl.dataset.collapsed=t?"false":"true",this.expandCollapseButtonEl.dataset.expanded=t?"true":"false",this.expandCollapseButtonEl.setAttribute("aria-label",t?"Hide measurements":"Show measurements"),this.expandCollapseButtonEl.title=t?"Hide measurements":"Show measurements",this.buttonLabelEl.title=this.deviceInfo.swVersion||this.deviceInfo.hwVersion?`${this.getStatusLabel()} | SW ${this.deviceInfo.swVersion||"--"} | HW ${this.deviceInfo.hwVersion||"--"}`:this.getStatusLabel(),this.updatePumpButtonState()}formatPumpState(t){return t==null?"0":String(t)}formatMetric(t,e,o){return t==null?o:t.toFixed(e)}}customElements.define("gc-du-link",B);class P extends b{static get observedAttributes(){return["title","counter"]}isAutoConnectRequested(){const t=this.getAttribute("autoconnect");return t==null?!0:t!=="false"}getExtraStyles(){return`
      :host {
        align-self: center;
        --gc-header-padding: 0.1rem 0.25rem;
        --gc-header-padding-top: 12px;
      }

      #openPortButton {
        width: auto;
        flex: 0 1 auto;
        min-width: 6.75rem;
        max-width: 100%;
        min-height: 1.9rem;
        padding: 0.1rem 0.45rem;
        font-size: 0.8rem;
        line-height: 1.1;
        display: inline-flex;
        align-items: center;
        justify-content: flex-start;
        gap: 0.35rem;
        border: 1px solid #cbd5e1;
        border-radius: 0.25rem;
        background: #fff;
        color: #1f2937;
        box-shadow: none;
        cursor: pointer;
      }

      .message-input {
        display: none;
      }

      .header-bar {
        justify-content: flex-end;
        gap: 0.35rem;
      }
    `}getTitleButtonWidth(){return"auto"}constructor(){var t,e;super(),this.position={latitude:null,longitude:null,altitude:null,fixQuality:null,numSatellites:null},(t=this.titleEl)==null||t.classList.remove("w3-button","w3-border","w3-round","w3-light-gray","w3-hover-gray"),(e=this.titleEl)==null||e.classList.add("title-button"),this.debug=!1,this.messageEl.style.display=this.debug?"block":"none"}processIncomingLine(t){return t.startsWith("$GPGGA")&&(this.parseGPGGA(t),this.title=`GPS ${this.toFixed(this.position.latitude,6)}, ${this.toFixed(this.position.longitude,6)}`,this.debug&&(this.messageEl.value=`Lat: ${this.toFixed(this.position.latitude,6)}, Lon: ${this.toFixed(this.position.longitude,6)}, Alt: ${this.toFixed(this.position.altitude,2)}, Fix: ${this.position.fixQuality}, Sats: ${this.position.numSatellites}`)),!0}getStatusState(){return this.port?this.position.fixQuality>0?"green":"yellow":"red"}getStatusLabel(){return this.port?this.position.fixQuality>0?"GPS fix acquired":"Connected, waiting for fix":"Disconnected"}toFixed(t,e){return t==null||Number.isNaN(Number.parseFloat(t))?"--":Number.parseFloat(t).toFixed(e)}parseGPGGA(t){const e=t.split(",");this.position.latitude=this.parseNmeaCoordinate(e[2],e[3]),this.position.longitude=this.parseNmeaCoordinate(e[4],e[5]),this.position.altitude=Number.parseFloat(e[9]),this.position.fixQuality=Number.parseInt(e[6],10),this.position.numSatellites=Number.parseInt(e[7],10)}parseNmeaCoordinate(t,e){if(!t||!e)return null;const o=Number.parseFloat(t);if(!Number.isFinite(o))return null;const r=Math.floor(o/100),i=o-r*100;let a=r+i/60;return(e==="S"||e==="W")&&(a*=-1),Number.isFinite(a)?a:null}}customElements.define("gc-gps-link",P);class R extends HTMLElement{constructor(){super(),this.maxEntries=Number.parseInt(this.getAttribute("max-entries")||"100",10),this.entries=[],this.bufferedEntries=[],this.isFrozen=!1,this.activeLevels=new Set(["debug","info","warn","error"]),this.filtersLoaded=!1,this.onLogEvent=this.onLogEvent.bind(this);const t=this.attachShadow({mode:"open"});t.innerHTML=`
      <style>
        :host {
          display: block;
        }

        .panel {
          border: 1px solid #cbd5e1;
          border-radius: 0.5rem;
          background: #f8fafc;
          overflow: hidden;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0.75rem;
          border-bottom: 1px solid #dbe5f0;
          background: #edf2f7;
        }

        .title {
          margin: 0;
          font-size: 0.9rem;
          font-weight: 700;
          color: #1f2937;
        }

        .tools {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .filters {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .filter-btn {
          border: 1px solid #cbd5e1;
          border-radius: 999px;
          background: white;
          color: #334155;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          padding: 0.12rem 0.45rem;
          cursor: pointer;
        }

        .filter-btn[data-active="false"] {
          opacity: 0.45;
        }

        .counter {
          font-size: 0.75rem;
          color: #64748b;
        }

        .clear-btn {
          border: 1px solid #cbd5e1;
          border-radius: 0.35rem;
          background: white;
          color: #334155;
          font-size: 0.75rem;
          padding: 0.2rem 0.45rem;
          cursor: pointer;
        }

        .freeze-btn[data-frozen="true"] {
          border-color: #2563eb;
          background: #dbeafe;
          color: #1e3a8a;
        }

        .log-list {
          margin: 0;
          padding: 0;
          list-style: none;
          max-height: 12rem;
          overflow: auto;
          background: #0f172a;
          color: #e2e8f0;
          font-family: Consolas, "Courier New", monospace;
          font-size: 0.74rem;
          line-height: 1.35;
        }

        .entry {
          display: grid;
          grid-template-columns: auto auto 1fr;
          gap: 0.5rem;
          padding: 0.35rem 0.65rem;
          border-bottom: 1px solid rgba(148, 163, 184, 0.15);
        }

        .time {
          color: #94a3b8;
        }

        .level {
          min-width: 3.6rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .level.debug {
          color: #93c5fd;
        }

        .level.info {
          color: #86efac;
        }

        .level.warn {
          color: #fcd34d;
        }

        .level.error {
          color: #fca5a5;
        }

        .message {
          white-space: pre-wrap;
          word-break: break-word;
        }
      </style>

      <section class="panel">
        <div class="header">
          <h2 class="title">Messages</h2>
          <div class="tools">
            <div class="filters" role="group" aria-label="Log level filters">
              <button class="filter-btn" data-level="debug" data-active="true" type="button">Debug</button>
              <button class="filter-btn" data-level="info" data-active="true" type="button">Info</button>
              <button class="filter-btn" data-level="warn" data-active="true" type="button">Warn</button>
              <button class="filter-btn" data-level="error" data-active="true" type="button">Error</button>
            </div>
            <span id="counter" class="counter">0</span>
            <button id="freezeButton" class="clear-btn freeze-btn" data-frozen="false" type="button">Freeze</button>
            <button id="clearButton" class="clear-btn" type="button">Clear</button>
          </div>
        </div>
        <ul id="logList" class="log-list" aria-live="polite"></ul>
      </section>
    `,this.logListEl=t.getElementById("logList"),this.counterEl=t.getElementById("counter"),this.clearButtonEl=t.getElementById("clearButton"),this.freezeButtonEl=t.getElementById("freezeButton"),this.filterButtons=Array.from(t.querySelectorAll(".filter-btn")),this.clearButtonEl.addEventListener("click",()=>{this.entries=[],this.bufferedEntries=[],this.render()}),this.freezeButtonEl.addEventListener("click",()=>{this.isFrozen=!this.isFrozen,!this.isFrozen&&this.bufferedEntries.length>0&&(this.entries.push(...this.bufferedEntries),this.bufferedEntries=[],this.trimToMaxEntries()),this.render()}),this.filterButtons.forEach(e=>{e.addEventListener("click",()=>{const o=e.dataset.level;o&&(this.activeLevels.has(o)?this.activeLevels.delete(o):this.activeLevels.add(o),this.saveFilterState(),this.render())})})}connectedCallback(){document.addEventListener("app-log",this.onLogEvent),this.loadFilterState(),this.render()}disconnectedCallback(){document.removeEventListener("app-log",this.onLogEvent)}onLogEvent(t){const e=t.detail||{},o={time:new Date().toLocaleTimeString(),level:e.level||"info",source:e.source||"app",message:e.message||"(no message)"};if(this.isFrozen){this.bufferedEntries.push(o),this.updateHeaderState();return}this.entries.push(o),this.trimToMaxEntries(),this.render()}trimToMaxEntries(){this.entries.length>this.maxEntries&&this.entries.splice(0,this.entries.length-this.maxEntries)}getFilterStorageKey(){return`gc.messageArea.filters.${this.id||this.getAttribute("name")||"default"}`}loadFilterState(){if(!this.filtersLoaded){this.filtersLoaded=!0;try{const t=localStorage.getItem(this.getFilterStorageKey());if(!t)return;const e=JSON.parse(t);if(!Array.isArray(e))return;const o=new Set(["debug","info","warn","error"]);this.activeLevels=new Set(e.filter(r=>o.has(String(r).toLowerCase())).map(r=>String(r).toLowerCase()))}catch{}}}saveFilterState(){try{localStorage.setItem(this.getFilterStorageKey(),JSON.stringify(Array.from(this.activeLevels)))}catch{}}render(){const t=this.entries.filter(e=>this.activeLevels.has(String(e.level).toLowerCase()));this.updateHeaderState(t.length),this.filterButtons.forEach(e=>{const o=e.dataset.level,r=this.activeLevels.has(String(o));e.dataset.active=r?"true":"false"}),this.logListEl.innerHTML=t.map(e=>{const o=String(e.level).toLowerCase(),r=this.escapeHtml(String(e.level).toUpperCase()),i=this.escapeHtml(e.time),a=this.escapeHtml(`[${e.source}] ${e.message}`);return`
          <li class="entry">
            <span class="time">${i}</span>
            <span class="level ${o}">${r}</span>
            <span class="message">${a}</span>
          </li>
        `}).join(""),this.logListEl.scrollTop=this.logListEl.scrollHeight}updateHeaderState(t=null){const e=t??this.entries.filter(r=>this.activeLevels.has(String(r.level).toLowerCase())).length,o=this.bufferedEntries.length;this.counterEl.textContent=o>0?`${e}/${this.entries.length} +${o}`:`${e}/${this.entries.length}`,this.freezeButtonEl.dataset.frozen=this.isFrozen?"true":"false",this.freezeButtonEl.textContent=this.isFrozen?"Frozen":"Freeze",this.freezeButtonEl.title=this.isFrozen?"Resume and append buffered messages":"Pause incoming messages in the list"}escapeHtml(t){return t.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")}}customElements.define("gc-message-area",R);const k=document.createElement("template");k.innerHTML=`
  <style>
    ${g}
  </style>

  <style>
    :host {
      display: block;
    }

    .body {
      color: #1f2937;
      line-height: 1.5;
      width: 100%;
      height: auto;
      overflow: auto;
    }
 
   table {
      font-family: arial, sans-serif;
      font-size: 0.8rem;
      border-collapse: collapse;
      width: 100%;
    }

    .my_table th {
      background: #2f3744;
      color: #fff;
      border: 1px solid #335555;    
      text-align: center;
      padding: 8px;
    }

    .my_table td{
        border: 1px solid #dddddd;
        text-align: center;
        padding: 8px;
    }

  </style>

  <div class="w3-container">
    <div class="body w3-card w3-padding">
    <h2 id="title" class="w3-center w3-text-blue">Table</h2>
    <table class="w3-table w3-hoverable my_table">
        <thead id="tableHeader">
        <tr id="tableHeaderRow"> </tr>
            <!-- Header row will be dynamically added here -->
        </thead>
        <tbody id="tableBody">
            <!-- Measurement rows will be dynamically added here -->
        </tbody>
    </table>

    <slot></slot>
    </div>
  </div>
`;class W extends HTMLElement{static get observedAttributes(){return["title"]}constructor(){super();const t=this.attachShadow({mode:"open"});t.append(k.content.cloneNode(!0)),this.titleElement=t.getElementById("title")}connectedCallback(){this.render()}attributeChangedCallback(){this.render()}disconnectedCallback(){}addTrace(t,e){let o="debug";t==="ERR"&&(o="error"),this.emitAppLog(o,`${t}: ${e}`)}render(){this.titleElement.textContent=this.getAttribute("title")||"Table"}setTableHeader(t){const e=this.shadowRoot.getElementById("tableHeaderRow");e.innerHTML="",t.forEach(o=>{const r=document.createElement("th");r.textContent=o,e.appendChild(r)}),this.render()}setTableHeaderWithUnits(t){const e=this.shadowRoot.getElementById("tableHeaderRow");e.innerHTML="",console.log("Setting table header with units:",t),t.forEach(o=>{const r=document.createElement("th");(o.label===void 0||o.label===null)&&(o.label="????"),o.unit!==null&&o.unit!==void 0?r.innerHTML=o.label+"<br>["+o.unit+"]":r.textContent=o.label,o.tooltip!==void 0&&o.tooltip!==null&&o.tooltip!==""&&(r.title=o.tooltip),e.appendChild(r)}),this.render()}appendRowToTable(t){const e=this.shadowRoot.getElementById("tableBody"),o=document.createElement("tr");t.forEach(r=>{const i=document.createElement("td");i.textContent=r,o.appendChild(i)}),e.appendChild(o)}getRowCount(){return this.shadowRoot.getElementById("tableBody").rows.length}removeRowFromTable(t){const e=this.shadowRoot.getElementById("tableBody");t>=0&&t<e.rows.length&&e.deleteRow(t),this.render()}removeAllRowsFromTable(){const t=this.shadowRoot.getElementById("tableBody");t.innerHTML="",this.render()}parseNumber(t){const e=Number.parseFloat(t);return Number.isFinite(e)?e:null}formatMetric(t,e,o){return t==null?o:t.toFixed(e)}}customElements.define("gc-table",W);async function G(n){const t=String(n||"").trim().slice(0,2).toLowerCase();if(!t)return null;const e=new URL(Object.assign({"./components/locale/en_lang.json":v,"./components/locale/no_lang.json":y})[`./components/locale/${t}_lang.json`],import.meta.url),o=await fetch(e);if(!o.ok)throw new Error(`Failed to load locale '${t}' (${o.status})`);return o.json()}function z(n){var e;const t=(e=n==null?void 0:n.MeasurementTable)==null?void 0:e.tableHeader;return!t||typeof t!="object"?null:Array.isArray(t)?t:Object.values(t)}async function E(n){const t=document.getElementById("gcTestMeasurementTable");if(t)try{const e=await G(n),o=z(e);o&&(console.log("Applying measurement table language for code:",n,"with header data:",o),t.setTableHeaderWithUnits(o),t.render())}catch(e){console.error("Error loading language data:",e)}}window.addEventListener("count-change",n=>{console.log("Count changed:",n.detail.value),document.getElementById("gcDULink").setAttribute("counter","Count: "+n.detail.value)});document.addEventListener("DOMContentLoaded",()=>{const n=document.getElementById("gcLangSelect");n&&([{code:"en",label:"English"},{code:"no",label:"Norsk"}].forEach(o=>{const r=document.createElement("option");r.value=o.code,r.textContent=o.label,n.appendChild(r)}),n.addEventListener("change",o=>{w(o.target.value)}));const t=document.getElementById("gcTestMeasurementTable");if(t){E(document.documentElement.lang||"en");for(let e=0;e<15;e++)t.appendRowToTable([e+1,"Text "+(e+1),10*(e+1),0,0,0,"00:00:00","PASS"]);t.render()}});document.addEventListener("app-language-change",n=>{const t=document.getElementById("gcLangSelect");t&&(t.value=n.detail.code),E(n.detail.code)});function w(n){const t=String(n||"").trim().slice(0,2).toLowerCase();if(t){document.documentElement.lang=t;try{localStorage.setItem("gc.app.language",t)}catch{}document.dispatchEvent(new CustomEvent("app-language-change",{detail:{code:t}}))}}window.setAppLanguage=w;let m="en";try{m=localStorage.getItem("gc.app.language")||document.documentElement.lang||"en"}catch{m=document.documentElement.lang||"en"}w(m);
