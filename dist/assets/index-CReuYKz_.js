(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))i(o);new MutationObserver(o=>{for(const r of o)if(r.type==="childList")for(const n of r.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&i(n)}).observe(document,{childList:!0,subtree:!0});function t(o){const r={};return o.integrity&&(r.integrity=o.integrity),o.referrerPolicy&&(r.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?r.credentials="include":o.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(o){if(o.ep)return;o.ep=!0;const r=t(o);fetch(o.href,r)}})();class M extends HTMLElement{constructor(){super(),this.maxEntries=Number.parseInt(this.getAttribute("max-entries")||"100",10),this.entries=[],this.bufferedEntries=[],this.isFrozen=!1,this.activeLevels=new Set(["debug","info","warn","error"]),this.filtersLoaded=!1,this.onLogEvent=this.onLogEvent.bind(this),this.renderFrameId=null,this.hasPendingRender=!1,this.fullRenderRequested=!1,this.pendingEntries=[],this.pendingRemovedVisibleCount=0,this.displayedEntries=[];const e=this.attachShadow({mode:"open"});e.innerHTML=`
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
    `,this.logListEl=e.getElementById("logList"),this.counterEl=e.getElementById("counter"),this.clearButtonEl=e.getElementById("clearButton"),this.freezeButtonEl=e.getElementById("freezeButton"),this.filterButtons=Array.from(e.querySelectorAll(".filter-btn")),this.clearButtonEl.addEventListener("click",()=>{this.entries=[],this.bufferedEntries=[],this.pendingEntries=[],this.pendingRemovedVisibleCount=0,this.displayedEntries=[],this.requestRender(!0)}),this.freezeButtonEl.addEventListener("click",()=>{this.isFrozen=!this.isFrozen,!this.isFrozen&&this.bufferedEntries.length>0&&(this.entries.push(...this.bufferedEntries),this.bufferedEntries=[],this.trimToMaxEntries()),this.requestRender(!0)}),this.filterButtons.forEach(t=>{t.addEventListener("click",()=>{const i=t.dataset.level;i&&(this.activeLevels.has(i)?this.activeLevels.delete(i):this.activeLevels.add(i),this.saveFilterState(),this.requestRender(!0))})})}connectedCallback(){document.addEventListener("app-log",this.onLogEvent),this.loadFilterState(),this.renderFull()}disconnectedCallback(){document.removeEventListener("app-log",this.onLogEvent),this.renderFrameId!==null&&(cancelAnimationFrame(this.renderFrameId),this.renderFrameId=null,this.hasPendingRender=!1)}onLogEvent(e){const t=e.detail||{},i={time:new Date().toLocaleTimeString(),level:t.level||"info",source:t.source||"app",message:t.message||"(no message)"};if(this.isFrozen){this.bufferedEntries.push(i),this.requestRender();return}this.entries.push(i),this.pendingEntries.push(i);const o=this.trimToMaxEntries();if(o.length>0){let r=0;o.forEach(n=>{this.activeLevels.has(String(n.level).toLowerCase())&&(r+=1)}),this.pendingRemovedVisibleCount+=r}this.requestRender()}requestRender(e=!1){e&&(this.fullRenderRequested=!0),!this.hasPendingRender&&(this.hasPendingRender=!0,this.renderFrameId=requestAnimationFrame(()=>{if(this.hasPendingRender=!1,this.renderFrameId=null,this.fullRenderRequested){this.fullRenderRequested=!1,this.pendingEntries=[],this.pendingRemovedVisibleCount=0,this.renderFull();return}this.renderIncremental()}))}trimToMaxEntries(){return this.entries.length>this.maxEntries?this.entries.splice(0,this.entries.length-this.maxEntries):[]}getFilterStorageKey(){return`gc.messageArea.filters.${this.id||this.getAttribute("name")||"default"}`}loadFilterState(){if(!this.filtersLoaded){this.filtersLoaded=!0;try{const e=localStorage.getItem(this.getFilterStorageKey());if(!e)return;const t=JSON.parse(e);if(!Array.isArray(t))return;const i=new Set(["debug","info","warn","error"]);this.activeLevels=new Set(t.filter(o=>i.has(String(o).toLowerCase())).map(o=>String(o).toLowerCase()))}catch{}}}saveFilterState(){try{localStorage.setItem(this.getFilterStorageKey(),JSON.stringify(Array.from(this.activeLevels)))}catch{}}renderFull(){const e=this.entries.filter(i=>this.activeLevels.has(String(i.level).toLowerCase()));this.updateHeaderState(e.length),this.filterButtons.forEach(i=>{const o=i.dataset.level,r=this.activeLevels.has(String(o));i.dataset.active=r?"true":"false"});const t=document.createDocumentFragment();e.forEach(i=>{t.appendChild(this.createEntryElement(i))}),this.logListEl.replaceChildren(t),this.displayedEntries=e.slice(),this.logListEl.scrollTop=Number.MAX_SAFE_INTEGER}renderIncremental(){let e=!1;if(this.pendingRemovedVisibleCount>0){let t=this.pendingRemovedVisibleCount;for(;t>0&&this.logListEl.firstElementChild;)this.logListEl.removeChild(this.logListEl.firstElementChild),this.displayedEntries.shift(),t-=1;this.pendingRemovedVisibleCount=0,e=!0}if(this.pendingEntries.length>0){const t=this.pendingEntries;this.pendingEntries=[];const i=document.createDocumentFragment();t.forEach(o=>{this.activeLevels.has(String(o.level).toLowerCase())&&(this.displayedEntries.push(o),i.appendChild(this.createEntryElement(o)))}),i.childNodes.length>0&&(this.logListEl.appendChild(i),e=!0)}this.updateHeaderState(this.displayedEntries.length),e&&(this.logListEl.scrollTop=Number.MAX_SAFE_INTEGER)}createEntryElement(e){const t=String(e.level).toLowerCase(),i=this.escapeHtml(String(e.level).toUpperCase()),o=this.escapeHtml(e.time),r=this.escapeHtml(`[${e.source}] ${e.message}`),n=document.createElement("li");return n.className="entry",n.innerHTML=`
      <span class="time">${o}</span>
      <span class="level ${t}">${i}</span>
      <span class="message">${r}</span>
    `,n}updateHeaderState(e=null){const t=e??this.entries.filter(o=>this.activeLevels.has(String(o.level).toLowerCase())).length,i=this.bufferedEntries.length;this.counterEl.textContent=i>0?`${t}/${this.entries.length} +${i}`:`${t}/${this.entries.length}`,this.freezeButtonEl.dataset.frozen=this.isFrozen?"true":"false",this.freezeButtonEl.textContent=this.isFrozen?"Frozen":"Freeze",this.freezeButtonEl.title=this.isFrozen?"Resume and append buffered messages":"Pause incoming messages in the list"}escapeHtml(e){return e.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")}}customElements.define("gc-message-area",M);const p='html{box-sizing:border-box}*,*:before,*:after{box-sizing:inherit}html{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}body{margin:0}article,aside,details,figcaption,figure,footer,header,main,menu,nav,section,summary{display:block}audio,canvas,progress,video{display:inline-block}progress{vertical-align:baseline}audio:not([controls]){display:none;height:0}[hidden],template{display:none}a{background-color:transparent;-webkit-text-decoration-skip:objects}a:active,a:hover{outline-width:0}abbr[title]{border-bottom:none;text-decoration:underline;text-decoration:underline dotted}dfn{font-style:italic}mark{background:#ff0;color:#000}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}figure{margin:1em 40px}img{border-style:none}svg:not(:root){overflow:hidden}code,kbd,pre,samp{font-family:monospace,monospace;font-size:1em}hr{box-sizing:content-box;height:0;overflow:visible}button,input,select,textarea{font:inherit;margin:0}optgroup{font-weight:700}button,input{overflow:visible}button,select{text-transform:none}button,html [type=button],[type=reset],[type=submit]{-webkit-appearance:button}button::-moz-focus-inner,[type=button]::-moz-focus-inner,[type=reset]::-moz-focus-inner,[type=submit]::-moz-focus-inner{border-style:none;padding:0}button:-moz-focusring,[type=button]:-moz-focusring,[type=reset]:-moz-focusring,[type=submit]:-moz-focusring{outline:1px dotted ButtonText}fieldset{border:1px solid #c0c0c0;margin:0 2px;padding:.35em .625em .75em}legend{color:inherit;display:table;max-width:100%;padding:0;white-space:normal}textarea{overflow:auto}[type=checkbox],[type=radio]{padding:0}[type=number]::-webkit-inner-spin-button,[type=number]::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}[type=search]::-webkit-search-cancel-button,[type=search]::-webkit-search-decoration{-webkit-appearance:none}::-webkit-input-placeholder{color:inherit;opacity:.54}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}html,body{font-family:Verdana,sans-serif;font-size:15px;line-height:1.5}html{overflow-x:hidden}h1{font-size:36px}h2{font-size:30px}h3{font-size:24px}h4{font-size:20px}h5{font-size:18px}h6{font-size:16px}.w3-serif{font-family:serif}h1,h2,h3,h4,h5,h6{font-family:Segoe UI,Arial,sans-serif;font-weight:400;margin:10px 0}.w3-wide{letter-spacing:4px}hr{border:0;border-top:1px solid #eee;margin:20px 0}.w3-image{max-width:100%;height:auto}img{vertical-align:middle}a{color:inherit}.w3-table,.w3-table-all{border-collapse:collapse;border-spacing:0;width:100%;display:table}.w3-table-all{border:1px solid #ccc}.w3-bordered tr,.w3-table-all tr{border-bottom:1px solid #ddd}.w3-striped tbody tr:nth-child(2n){background-color:#f1f1f1}.w3-table-all tr:nth-child(odd){background-color:#fff}.w3-table-all tr:nth-child(2n){background-color:#f1f1f1}.w3-hoverable tbody tr:hover,.w3-ul.w3-hoverable li:hover{background-color:#ccc}.w3-centered tr th,.w3-centered tr td{text-align:center}.w3-table td,.w3-table th,.w3-table-all td,.w3-table-all th{padding:8px;display:table-cell;text-align:left;vertical-align:top}.w3-table th:first-child,.w3-table td:first-child,.w3-table-all th:first-child,.w3-table-all td:first-child{padding-left:16px}.w3-btn,.w3-button{border:none;display:inline-block;padding:8px 16px;vertical-align:middle;overflow:hidden;text-decoration:none;color:inherit;background-color:inherit;text-align:center;cursor:pointer;white-space:nowrap}.w3-btn:hover{box-shadow:0 8px 16px #0003,0 6px 20px #00000030}.w3-btn,.w3-button{-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.w3-disabled,.w3-btn:disabled,.w3-button:disabled{cursor:not-allowed;opacity:.3}.w3-disabled *,:disabled *{pointer-events:none}.w3-btn.w3-disabled:hover,.w3-btn:disabled:hover{box-shadow:none}.w3-badge,.w3-tag{background-color:#000;color:#fff;display:inline-block;padding-left:8px;padding-right:8px;text-align:center}.w3-badge{border-radius:50%}.w3-ul{list-style-type:none;padding:0;margin:0}.w3-ul li{padding:8px 16px;border-bottom:1px solid #ddd}.w3-ul li:last-child{border-bottom:none}.w3-tooltip,.w3-display-container{position:relative}.w3-tooltip .w3-text{display:none}.w3-tooltip:hover .w3-text{display:inline-block}.w3-ripple:active{opacity:.5}.w3-ripple{transition:opacity 0s}.w3-input{padding:8px;display:block;border:none;border-bottom:1px solid #ccc;width:100%}.w3-select{padding:9px 0;width:100%;border:none;border-bottom:1px solid #ccc}.w3-dropdown-click,.w3-dropdown-hover{position:relative;display:inline-block;cursor:pointer}.w3-dropdown-hover:hover .w3-dropdown-content{display:block}.w3-dropdown-hover:first-child,.w3-dropdown-click:hover{background-color:#ccc;color:#000}.w3-dropdown-hover:hover>.w3-button:first-child,.w3-dropdown-click:hover>.w3-button:first-child{background-color:#ccc;color:#000}.w3-dropdown-content{cursor:auto;color:#000;background-color:#fff;display:none;position:absolute;min-width:160px;margin:0;padding:0;z-index:1}.w3-check,.w3-radio{width:24px;height:24px;position:relative;top:6px}.w3-sidebar{height:100%;width:200px;background-color:#fff;position:fixed!important;z-index:1;overflow:auto}.w3-bar-block .w3-dropdown-hover,.w3-bar-block .w3-dropdown-click{width:100%}.w3-bar-block .w3-dropdown-hover .w3-dropdown-content,.w3-bar-block .w3-dropdown-click .w3-dropdown-content{min-width:100%}.w3-bar-block .w3-dropdown-hover .w3-button,.w3-bar-block .w3-dropdown-click .w3-button{width:100%;text-align:left;padding:8px 16px}.w3-main,#main{transition:margin-left .4s}.w3-modal{z-index:3;display:none;padding-top:100px;position:fixed;left:0;top:0;width:100%;height:100%;overflow:auto;background-color:#000;background-color:#0006}.w3-modal-content{margin:auto;background-color:#fff;position:relative;padding:0;outline:0;width:600px}.w3-bar{width:100%;overflow:hidden}.w3-center .w3-bar{display:inline-block;width:auto}.w3-bar .w3-bar-item{padding:8px 16px;float:left;width:auto;border:none;display:block;outline:0}.w3-bar .w3-dropdown-hover,.w3-bar .w3-dropdown-click{position:static;float:left}.w3-bar .w3-button{white-space:normal}.w3-bar-block .w3-bar-item{width:100%;display:block;padding:8px 16px;text-align:left;border:none;white-space:normal;float:none;outline:0}.w3-bar-block.w3-center .w3-bar-item{text-align:center}.w3-block{display:block;width:100%}.w3-responsive{display:block;overflow-x:auto}.w3-container:after,.w3-container:before,.w3-panel:after,.w3-panel:before,.w3-row:after,.w3-row:before,.w3-row-padding:after,.w3-row-padding:before,.w3-cell-row:before,.w3-cell-row:after,.w3-clear:after,.w3-clear:before,.w3-bar:before,.w3-bar:after{content:"";display:table;clear:both}.w3-col,.w3-half,.w3-third,.w3-twothird,.w3-threequarter,.w3-quarter{float:left;width:100%}.w3-col.s1{width:8.33333%}.w3-col.s2{width:16.66666%}.w3-col.s3{width:24.99999%}.w3-col.s4{width:33.33333%}.w3-col.s5{width:41.66666%}.w3-col.s6{width:49.99999%}.w3-col.s7{width:58.33333%}.w3-col.s8{width:66.66666%}.w3-col.s9{width:74.99999%}.w3-col.s10{width:83.33333%}.w3-col.s11{width:91.66666%}.w3-col.s12{width:99.99999%}@media (min-width:601px){.w3-col.m1{width:8.33333%}.w3-col.m2{width:16.66666%}.w3-col.m3,.w3-quarter{width:24.99999%}.w3-col.m4,.w3-third{width:33.33333%}.w3-col.m5{width:41.66666%}.w3-col.m6,.w3-half{width:49.99999%}.w3-col.m7{width:58.33333%}.w3-col.m8,.w3-twothird{width:66.66666%}.w3-col.m9,.w3-threequarter{width:74.99999%}.w3-col.m10{width:83.33333%}.w3-col.m11{width:91.66666%}.w3-col.m12{width:99.99999%}}@media (min-width:993px){.w3-col.l1{width:8.33333%}.w3-col.l2{width:16.66666%}.w3-col.l3{width:24.99999%}.w3-col.l4{width:33.33333%}.w3-col.l5{width:41.66666%}.w3-col.l6{width:49.99999%}.w3-col.l7{width:58.33333%}.w3-col.l8{width:66.66666%}.w3-col.l9{width:74.99999%}.w3-col.l10{width:83.33333%}.w3-col.l11{width:91.66666%}.w3-col.l12{width:99.99999%}}.w3-content{max-width:980px;margin:auto}.w3-rest{overflow:hidden}.w3-cell-row{display:table;width:100%}.w3-cell{display:table-cell}.w3-cell-top{vertical-align:top}.w3-cell-middle{vertical-align:middle}.w3-cell-bottom{vertical-align:bottom}.w3-hide{display:none!important}.w3-show-block,.w3-show{display:block!important}.w3-show-inline-block{display:inline-block!important}@media (max-width:600px){.w3-modal-content{margin:0 10px;width:auto!important}.w3-modal{padding-top:30px}.w3-dropdown-hover.w3-mobile .w3-dropdown-content,.w3-dropdown-click.w3-mobile .w3-dropdown-content{position:relative}.w3-hide-small{display:none!important}.w3-mobile{display:block;width:100%!important}.w3-bar-item.w3-mobile,.w3-dropdown-hover.w3-mobile,.w3-dropdown-click.w3-mobile{text-align:center}.w3-dropdown-hover.w3-mobile,.w3-dropdown-hover.w3-mobile .w3-btn,.w3-dropdown-hover.w3-mobile .w3-button,.w3-dropdown-click.w3-mobile,.w3-dropdown-click.w3-mobile .w3-btn,.w3-dropdown-click.w3-mobile .w3-button{width:100%}}@media (max-width:768px){.w3-modal-content{width:500px}.w3-modal{padding-top:50px}}@media (min-width:993px){.w3-modal-content{width:900px}.w3-hide-large{display:none!important}.w3-sidebar.w3-collapse{display:block!important}}@media (max-width:992px) and (min-width:601px){.w3-hide-medium{display:none!important}}@media (max-width:992px){.w3-sidebar.w3-collapse{display:none}.w3-main{margin-left:0!important;margin-right:0!important}}.w3-top,.w3-bottom{position:fixed;width:100%;z-index:1}.w3-top{top:0}.w3-bottom{bottom:0}.w3-overlay{position:fixed;display:none;width:100%;height:100%;top:0;left:0;right:0;bottom:0;background-color:#00000080;z-index:2}.w3-display-topleft{position:absolute;left:0;top:0}.w3-display-topright{position:absolute;right:0;top:0}.w3-display-bottomleft{position:absolute;left:0;bottom:0}.w3-display-bottomright{position:absolute;right:0;bottom:0}.w3-display-middle{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);-ms-transform:translate(-50%,-50%)}.w3-display-left{position:absolute;top:50%;left:0%;transform:translateY(-50%);-ms-transform:translate(-0%,-50%)}.w3-display-right{position:absolute;top:50%;right:0%;transform:translateY(-50%);-ms-transform:translate(0%,-50%)}.w3-display-topmiddle{position:absolute;left:50%;top:0;transform:translate(-50%);-ms-transform:translate(-50%,0%)}.w3-display-bottommiddle{position:absolute;left:50%;bottom:0;transform:translate(-50%);-ms-transform:translate(-50%,0%)}.w3-display-container:hover .w3-display-hover{display:block}.w3-display-container:hover span.w3-display-hover{display:inline-block}.w3-display-hover{display:none}.w3-display-position{position:absolute}.w3-circle{border-radius:50%}.w3-round-small{border-radius:2px}.w3-round,.w3-round-medium{border-radius:4px}.w3-round-large{border-radius:8px}.w3-round-xlarge{border-radius:16px}.w3-round-xxlarge{border-radius:32px}.w3-row-padding,.w3-row-padding>.w3-half,.w3-row-padding>.w3-third,.w3-row-padding>.w3-twothird,.w3-row-padding>.w3-threequarter,.w3-row-padding>.w3-quarter,.w3-row-padding>.w3-col{padding:0 8px}.w3-container,.w3-panel{padding:.01em 16px}.w3-panel{margin-top:16px;margin-bottom:16px}.w3-code,.w3-codespan{font-family:Consolas,courier new;font-size:16px}.w3-code{width:auto;background-color:#fff;padding:8px 12px;border-left:4px solid #4CAF50;word-wrap:break-word}.w3-codespan{color:#dc143c;background-color:#f1f1f1;padding-left:4px;padding-right:4px;font-size:110%}.w3-card,.w3-card-2{box-shadow:0 2px 5px #00000029,0 2px 10px #0000001f}.w3-card-4,.w3-hover-shadow:hover{box-shadow:0 4px 10px #0003,0 4px 20px #00000030}.w3-spin{animation:w3-spin 2s infinite linear}@keyframes w3-spin{0%{transform:rotate(0)}to{transform:rotate(359deg)}}.w3-animate-fading{animation:fading 10s infinite}@keyframes fading{0%{opacity:0}50%{opacity:1}to{opacity:0}}.w3-animate-opacity{animation:opac .8s}@keyframes opac{0%{opacity:0}to{opacity:1}}.w3-animate-top{position:relative;animation:animatetop .4s}@keyframes animatetop{0%{top:-300px;opacity:0}to{top:0;opacity:1}}.w3-animate-left{position:relative;animation:animateleft .4s}@keyframes animateleft{0%{left:-300px;opacity:0}to{left:0;opacity:1}}.w3-animate-right{position:relative;animation:animateright .4s}@keyframes animateright{0%{right:-300px;opacity:0}to{right:0;opacity:1}}.w3-animate-bottom{position:relative;animation:animatebottom .4s}@keyframes animatebottom{0%{bottom:-300px;opacity:0}to{bottom:0;opacity:1}}.w3-animate-zoom{animation:animatezoom .6s}@keyframes animatezoom{0%{transform:scale(0)}to{transform:scale(1)}}.w3-animate-input{transition:width .4s ease-in-out}.w3-animate-input:focus{width:100%!important}.w3-opacity,.w3-hover-opacity:hover{opacity:.6}.w3-opacity-off,.w3-hover-opacity-off:hover{opacity:1}.w3-opacity-max{opacity:.25}.w3-opacity-min{opacity:.75}.w3-greyscale-max,.w3-grayscale-max,.w3-hover-greyscale:hover,.w3-hover-grayscale:hover{filter:grayscale(100%)}.w3-greyscale,.w3-grayscale{filter:grayscale(75%)}.w3-greyscale-min,.w3-grayscale-min{filter:grayscale(50%)}.w3-sepia{filter:sepia(75%)}.w3-sepia-max,.w3-hover-sepia:hover{filter:sepia(100%)}.w3-sepia-min{filter:sepia(50%)}.w3-tiny{font-size:10px!important}.w3-small{font-size:12px!important}.w3-medium{font-size:15px!important}.w3-large{font-size:18px!important}.w3-xlarge{font-size:24px!important}.w3-xxlarge{font-size:36px!important}.w3-xxxlarge{font-size:48px!important}.w3-jumbo{font-size:64px!important}.w3-left-align{text-align:left!important}.w3-right-align{text-align:right!important}.w3-justify{text-align:justify!important}.w3-center{text-align:center!important}.w3-border-0{border:0!important}.w3-border{border:1px solid #ccc!important}.w3-border-top{border-top:1px solid #ccc!important}.w3-border-bottom{border-bottom:1px solid #ccc!important}.w3-border-left{border-left:1px solid #ccc!important}.w3-border-right{border-right:1px solid #ccc!important}.w3-topbar{border-top:6px solid #ccc!important}.w3-bottombar{border-bottom:6px solid #ccc!important}.w3-leftbar{border-left:6px solid #ccc!important}.w3-rightbar{border-right:6px solid #ccc!important}.w3-section,.w3-code{margin-top:16px!important;margin-bottom:16px!important}.w3-margin{margin:16px!important}.w3-margin-top{margin-top:16px!important}.w3-margin-bottom{margin-bottom:16px!important}.w3-margin-left{margin-left:16px!important}.w3-margin-right{margin-right:16px!important}.w3-padding-small{padding:4px 8px!important}.w3-padding{padding:8px 16px!important}.w3-padding-large{padding:12px 24px!important}.w3-padding-16{padding-top:16px!important;padding-bottom:16px!important}.w3-padding-24{padding-top:24px!important;padding-bottom:24px!important}.w3-padding-32{padding-top:32px!important;padding-bottom:32px!important}.w3-padding-48{padding-top:48px!important;padding-bottom:48px!important}.w3-padding-64{padding-top:64px!important;padding-bottom:64px!important}.w3-left{float:left!important}.w3-right{float:right!important}.w3-button:hover{color:#000!important;background-color:#ccc!important}.w3-transparent,.w3-hover-none:hover{background-color:transparent!important}.w3-hover-none:hover{box-shadow:none!important}.w3-amber,.w3-hover-amber:hover{color:#000!important;background-color:#ffc107!important}.w3-aqua,.w3-hover-aqua:hover{color:#000!important;background-color:#0ff!important}.w3-blue,.w3-hover-blue:hover{color:#fff!important;background-color:#2196f3!important}.w3-light-blue,.w3-hover-light-blue:hover{color:#000!important;background-color:#87ceeb!important}.w3-brown,.w3-hover-brown:hover{color:#fff!important;background-color:#795548!important}.w3-cyan,.w3-hover-cyan:hover{color:#000!important;background-color:#00bcd4!important}.w3-blue-grey,.w3-hover-blue-grey:hover,.w3-blue-gray,.w3-hover-blue-gray:hover{color:#fff!important;background-color:#607d8b!important}.w3-green,.w3-hover-green:hover{color:#fff!important;background-color:#4caf50!important}.w3-light-green,.w3-hover-light-green:hover{color:#000!important;background-color:#8bc34a!important}.w3-indigo,.w3-hover-indigo:hover{color:#fff!important;background-color:#3f51b5!important}.w3-khaki,.w3-hover-khaki:hover{color:#000!important;background-color:khaki!important}.w3-lime,.w3-hover-lime:hover{color:#000!important;background-color:#cddc39!important}.w3-orange,.w3-hover-orange:hover{color:#000!important;background-color:#ff9800!important}.w3-deep-orange,.w3-hover-deep-orange:hover{color:#fff!important;background-color:#ff5722!important}.w3-pink,.w3-hover-pink:hover{color:#fff!important;background-color:#e91e63!important}.w3-purple,.w3-hover-purple:hover{color:#fff!important;background-color:#9c27b0!important}.w3-deep-purple,.w3-hover-deep-purple:hover{color:#fff!important;background-color:#673ab7!important}.w3-red,.w3-hover-red:hover{color:#fff!important;background-color:#f44336!important}.w3-sand,.w3-hover-sand:hover{color:#000!important;background-color:#fdf5e6!important}.w3-teal,.w3-hover-teal:hover{color:#fff!important;background-color:#009688!important}.w3-yellow,.w3-hover-yellow:hover{color:#000!important;background-color:#ffeb3b!important}.w3-white,.w3-hover-white:hover{color:#000!important;background-color:#fff!important}.w3-black,.w3-hover-black:hover{color:#fff!important;background-color:#000!important}.w3-grey,.w3-hover-grey:hover,.w3-gray,.w3-hover-gray:hover{color:#000!important;background-color:#9e9e9e!important}.w3-light-grey,.w3-hover-light-grey:hover,.w3-light-gray,.w3-hover-light-gray:hover{color:#000!important;background-color:#f1f1f1!important}.w3-dark-grey,.w3-hover-dark-grey:hover,.w3-dark-gray,.w3-hover-dark-gray:hover{color:#fff!important;background-color:#616161!important}.w3-pale-red,.w3-hover-pale-red:hover{color:#000!important;background-color:#fdd!important}.w3-pale-green,.w3-hover-pale-green:hover{color:#000!important;background-color:#dfd!important}.w3-pale-yellow,.w3-hover-pale-yellow:hover{color:#000!important;background-color:#ffc!important}.w3-pale-blue,.w3-hover-pale-blue:hover{color:#000!important;background-color:#dff!important}.w3-text-amber,.w3-hover-text-amber:hover{color:#ffc107!important}.w3-text-aqua,.w3-hover-text-aqua:hover{color:#0ff!important}.w3-text-blue,.w3-hover-text-blue:hover{color:#2196f3!important}.w3-text-light-blue,.w3-hover-text-light-blue:hover{color:#87ceeb!important}.w3-text-brown,.w3-hover-text-brown:hover{color:#795548!important}.w3-text-cyan,.w3-hover-text-cyan:hover{color:#00bcd4!important}.w3-text-blue-grey,.w3-hover-text-blue-grey:hover,.w3-text-blue-gray,.w3-hover-text-blue-gray:hover{color:#607d8b!important}.w3-text-green,.w3-hover-text-green:hover{color:#4caf50!important}.w3-text-light-green,.w3-hover-text-light-green:hover{color:#8bc34a!important}.w3-text-indigo,.w3-hover-text-indigo:hover{color:#3f51b5!important}.w3-text-khaki,.w3-hover-text-khaki:hover{color:#b4aa50!important}.w3-text-lime,.w3-hover-text-lime:hover{color:#cddc39!important}.w3-text-orange,.w3-hover-text-orange:hover{color:#ff9800!important}.w3-text-deep-orange,.w3-hover-text-deep-orange:hover{color:#ff5722!important}.w3-text-pink,.w3-hover-text-pink:hover{color:#e91e63!important}.w3-text-purple,.w3-hover-text-purple:hover{color:#9c27b0!important}.w3-text-deep-purple,.w3-hover-text-deep-purple:hover{color:#673ab7!important}.w3-text-red,.w3-hover-text-red:hover{color:#f44336!important}.w3-text-sand,.w3-hover-text-sand:hover{color:#fdf5e6!important}.w3-text-teal,.w3-hover-text-teal:hover{color:#009688!important}.w3-text-yellow,.w3-hover-text-yellow:hover{color:#d2be0e!important}.w3-text-white,.w3-hover-text-white:hover{color:#fff!important}.w3-text-black,.w3-hover-text-black:hover{color:#000!important}.w3-text-grey,.w3-hover-text-grey:hover,.w3-text-gray,.w3-hover-text-gray:hover{color:#757575!important}.w3-text-light-grey,.w3-hover-text-light-grey:hover,.w3-text-light-gray,.w3-hover-text-light-gray:hover{color:#f1f1f1!important}.w3-text-dark-grey,.w3-hover-text-dark-grey:hover,.w3-text-dark-gray,.w3-hover-text-dark-gray:hover{color:#3a3a3a!important}.w3-border-amber,.w3-hover-border-amber:hover{border-color:#ffc107!important}.w3-border-aqua,.w3-hover-border-aqua:hover{border-color:#0ff!important}.w3-border-blue,.w3-hover-border-blue:hover{border-color:#2196f3!important}.w3-border-light-blue,.w3-hover-border-light-blue:hover{border-color:#87ceeb!important}.w3-border-brown,.w3-hover-border-brown:hover{border-color:#795548!important}.w3-border-cyan,.w3-hover-border-cyan:hover{border-color:#00bcd4!important}.w3-border-blue-grey,.w3-hover-border-blue-grey:hover,.w3-border-blue-gray,.w3-hover-border-blue-gray:hover{border-color:#607d8b!important}.w3-border-green,.w3-hover-border-green:hover{border-color:#4caf50!important}.w3-border-light-green,.w3-hover-border-light-green:hover{border-color:#8bc34a!important}.w3-border-indigo,.w3-hover-border-indigo:hover{border-color:#3f51b5!important}.w3-border-khaki,.w3-hover-border-khaki:hover{border-color:khaki!important}.w3-border-lime,.w3-hover-border-lime:hover{border-color:#cddc39!important}.w3-border-orange,.w3-hover-border-orange:hover{border-color:#ff9800!important}.w3-border-deep-orange,.w3-hover-border-deep-orange:hover{border-color:#ff5722!important}.w3-border-pink,.w3-hover-border-pink:hover{border-color:#e91e63!important}.w3-border-purple,.w3-hover-border-purple:hover{border-color:#9c27b0!important}.w3-border-deep-purple,.w3-hover-border-deep-purple:hover{border-color:#673ab7!important}.w3-border-red,.w3-hover-border-red:hover{border-color:#f44336!important}.w3-border-sand,.w3-hover-border-sand:hover{border-color:#fdf5e6!important}.w3-border-teal,.w3-hover-border-teal:hover{border-color:#009688!important}.w3-border-yellow,.w3-hover-border-yellow:hover{border-color:#ffeb3b!important}.w3-border-white,.w3-hover-border-white:hover{border-color:#fff!important}.w3-border-black,.w3-hover-border-black:hover{border-color:#000!important}.w3-border-grey,.w3-hover-border-grey:hover,.w3-border-gray,.w3-hover-border-gray:hover{border-color:#9e9e9e!important}.w3-border-light-grey,.w3-hover-border-light-grey:hover,.w3-border-light-gray,.w3-hover-border-light-gray:hover{border-color:#f1f1f1!important}.w3-border-dark-grey,.w3-hover-border-dark-grey:hover,.w3-border-dark-gray,.w3-hover-border-dark-gray:hover{border-color:#616161!important}.w3-border-pale-red,.w3-hover-border-pale-red:hover{border-color:#ffe7e7!important}.w3-border-pale-green,.w3-hover-border-pale-green:hover{border-color:#e7ffe7!important}.w3-border-pale-yellow,.w3-hover-border-pale-yellow:hover{border-color:#ffc!important}.w3-border-pale-blue,.w3-hover-border-pale-blue:hover{border-color:#e7ffff!important}',L=document.createElement("template");L.innerHTML=`
  <style>
    ${p}
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
      border: 1px solid #3f4754;    
      text-align: center;
      padding: 8px;
    }

    .my_table td{
        border: 1px solid #dddddd;
        text-align: center;
        padding: 8px;
    }

  </style>

  <div class="w3-container w3-margin-bottom">
    <div class="body">
        <div id="headSlot">    
            <h2 id="title" class="w3-center w3-text-blue w3-medium w3-left">Table</h2>
            <span id="available"></span>
        </div>
        <table class="w3-table w3-hoverable my_table">
            <thead id="tableHeader">
                <tr id="tableHeaderRow"> </tr>
                <!-- Header row will be dynamically added here -->
            </thead>
            <tbody id="tableBody">
                <!-- Measurement rows will be dynamically added here -->
            </tbody>
        </table>
        <slot id="footSlot"></slot>
    </div>
  </div>
`;class k extends HTMLElement{static get observedAttributes(){return["title","componentIdentifier"]}constructor(){super();const e=this.attachShadow({mode:"open"});e.append(L.content.cloneNode(!0)),this.titleElement=e.getElementById("title"),this.onLanguageChange=this.onLanguageChange.bind(this),this.componentIdentifier=this.getAttribute("componentIdentifier")||"MeasurementTable"}connectedCallback(){document.addEventListener("new-language-selected",this.onLanguageChange);let e=this.componentIdentifier;document.addEventListener(e+"-add-row",this.onAddRow.bind(this)),this.render()}initBlankLines(e){const t=this.shadowRoot.getElementById("tableHeaderRow").children.length;for(let i=0;i<e;i++)this.appendRowToTable(new Array(t).fill(""))}attributeChangedCallback(){this.componentIdentifier=this.getAttribute("componentIdentifier")||"MeasurementTable",this.render()}disconnectedCallback(){document.removeEventListener("new-language-selected",this.onLanguageChange);let e=this.componentIdentifier;document.removeEventListener(e+"-add-row",this.onAddRow.bind(this))}async onAddRow(e){const t=e==null?void 0:e.detail;t&&Array.isArray(t.rowData)&&this.appendRowToTable(t.rowData)}async onLanguageChange(e){const t=e==null?void 0:e.detail;typeof t=="string"||t==null||t.code;const i=t==null?void 0:t.catalog;i&&await this.applyLanguageChange(i)}async applyLanguageChange(e){var r,n;const t=((r=e==null?void 0:e[this.componentIdentifier])==null?void 0:r.title)||"Table";this.titleElement.textContent=t;const i=this.getTableHeader(e);i&&this.setTableHeaderWithUnits(i);const o=((n=e==null?void 0:e[this.componentIdentifier])==null?void 0:n.blankRows)||5;this.getRowCount()!=o&&this.initBlankLines(o-this.getRowCount())}getTableHeader(e){var i;const t=(i=e==null?void 0:e[this.componentIdentifier])==null?void 0:i.tableHeader;return!t||typeof t!="object"?null:Array.isArray(t)?t:Object.values(t)}addTrace(e,t){let i="debug";e==="ERR"&&(i="error"),this.emitAppLog(i,`${e}: ${t}`)}render(){this.titleElement.textContent=this.getAttribute("title")||"Table"}setTableHeader(e){const t=this.shadowRoot.getElementById("tableHeaderRow");t.innerHTML="",e.forEach(i=>{const o=document.createElement("th");o.textContent=i,t.appendChild(o)})}setTableHeaderWithUnits(e){const t=this.shadowRoot.getElementById("tableHeaderRow");t.innerHTML="",e.forEach(i=>{const o=document.createElement("th");(i.label===void 0||i.label===null)&&(i.label="????"),i.unit!==null&&i.unit!==void 0?o.innerHTML=i.label+"<br>["+i.unit+"]":o.textContent=i.label,i.tooltip!==void 0&&i.tooltip!==null&&i.tooltip!==""&&(o.title=i.tooltip),t.appendChild(o)})}updateRowData(e,t){const i=this.shadowRoot.getElementById("tableBody");if(e===i.rows.length){this.appendRowToTable(t);return}let o=null;if(e>=0&&e<i.rows.length&&(o=i.rows[e]),o==null)return;let r=0;t.forEach(n=>{o.children[r++].textContent=n})}getTableRow(e){const t=this.shadowRoot.getElementById("tableBody");return e>=0&&e<t.rows.length?t.rows[e]:null}appendRowToTable(e){const t=this.shadowRoot.getElementById("tableBody"),i=document.createElement("tr");e.forEach(o=>{const r=document.createElement("td");r.textContent=o,i.appendChild(r)}),t.appendChild(i)}getRowCount(){return this.shadowRoot.getElementById("tableBody").rows.length}removeRowFromTable(e){const t=this.shadowRoot.getElementById("tableBody");e>=0&&e<t.rows.length&&t.deleteRow(e)}removeAllRowsFromTable(){const e=this.shadowRoot.getElementById("tableBody");e.innerHTML="",this.render()}parseNumber(e){const t=Number.parseFloat(e);return Number.isFinite(t)?t:null}formatMetric(e,t,i){return e==null?i:e.toFixed(t)}}customElements.define("gc-table",k);const R=document.createElement("template");R.innerHTML=`
  <style>
    ${p}
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


    .metric-item {
        margin-bottom: 10px;
    }

    .metric-item:last-child {
        margin-bottom: 0;
    }

    .metric-label {
        margin: 0;
        font-size: 12px;
        font-weight: 600;
        color: #616F76;
        white-space: nowrap;
    }

    .metric-value {
        margin: 2px 0 0;
        font-size: 40px;
        line-height: 1;
        font-weight: 700;
        color: #313F46;
        white-space: nowrap;
    }

    .metric-unit {
        display: inline-block;
        font-size: 0.6em;
        font-weight: 500;
        white-space: nowrap;
    }

  </style>

    <div class="body">
        <div class="metric-item" id="title">
          <p class="metric-label" id="labelId">Kraft</p>
          <p class="metric-value"><span id="valueId">0.0</span> <span class="metric-unit" id="unitId">kN</span></p>
        </div>     
        <slot></slot>
        </div>
    </div>
`;class D extends HTMLElement{static get observedAttributes(){return["label","value","unit","decimals","componentIdentifier"]}constructor(){super();const e=this.attachShadow({mode:"open"});e.append(R.content.cloneNode(!0)),this.labelElement=e.getElementById("labelId"),this.valueElement=e.getElementById("valueId"),this.unitElement=e.getElementById("unitId"),this.componentIdentifier=this.getAttribute("componentIdentifier")||"Realtime",this.updateComponent=this.updateComponent.bind(this)}connectedCallback(){this.render()}disconnectedCallback(){}attributeChangedCallback(e,t,i){t!==i&&(e==="componentIdentifier"&&(this.componentIdentifier=i||"Realtime"),this.render())}get label(){return this.getAttribute("label")||""}set label(e){this.setAttribute("label",e??"")}get value(){return this.getAttribute("value")||""}set value(e){this.setAttribute("value",e??"")}get unit(){return this.getAttribute("unit")||""}set unit(e){this.setAttribute("unit",e??"")}get decimals(){const e=this.getAttribute("decimals");if(e==null||e==="")return null;const t=Number.parseInt(e,10);return Number.isInteger(t)&&t>=0?t:null}set decimals(e){this.setAttribute("decimals",e??"")}updateComponent(e){this.label=e.label,this.unit=e.unit}formatValue(){const e=this.value,t=this.decimals;if(t==null)return e;const i=Number.parseFloat(e);return Number.isFinite(i)?i.toFixed(t):e}render(){this.labelElement.textContent=this.label,this.valueElement.textContent=this.formatValue(),this.unitElement.textContent=this.unit}}customElements.define("gc-realtime",D);const w="__gc_select_edit__",B=document.createElement("template");B.innerHTML=`
  <style>
    ${p}
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


    .metric-item {
        margin-bottom: 10px;
    }

    .metric-item:last-child {
        margin-bottom: 0;
    }

    .metric-label {
        margin: 0;
        font-size: 0.7em;
        font-weight: 600;
        color: #616F76;
        white-space: nowrap;
    }

    .metric-value {
        margin: 2px 0 0;
        font-size: 1.0em;
        line-height: 1;
        font-weight: 700;
        color: #313F46;
        white-space: nowrap;
    }

    .select-field {
        width: 100%;
    }

    .editor {
        display: grid;
        gap: 6px;
        width: 100%;
    }

    .editor[hidden] {
        display: none !important;
    }

    .editor textarea {
        width: 100%;
        min-height: 8rem;
        resize: vertical;
        font-size: 0.9em;
        line-height: 1.4;
        padding: 6px;
    }

    .editor-actions {
        display: flex;
        gap: 6px;
        justify-content: flex-end;
    }

    .metric-unit {
        display: inline-block;
        font-size: 0.6em;
        font-weight: 500;
        white-space: nowrap;
    }

  </style>

    <div class="body">
        <div class="metric-item" id="title">
          <p class="metric-label" id="labelId">Label</p>
                    <p class="metric-value">
                        <select id="valueId" class="w3-select select-field"></select>
                        <div id="editor" class="editor" hidden>
                            <textarea id="editorText" class="w3-input" spellcheck="false"></textarea>
                            <div class="editor-actions">
                                <button id="cancelBtn" class="w3-button w3-border">Cancel</button>
                                <button id="saveBtn" class="w3-button w3-blue">Save</button>
                            </div>
                        </div>
                    </p>
        </div>     
        <slot></slot>
        </div>
    </div>
`;class U extends HTMLElement{static get observedAttributes(){return["label","value","key","editable","options","placeholder"]}constructor(){super();const e=this.attachShadow({mode:"open"});e.append(B.content.cloneNode(!0)),this.labelElement=e.getElementById("labelId"),this.selectElement=e.getElementById("valueId"),this.editorElement=e.getElementById("editor"),this.editorTextElement=e.getElementById("editorText"),this.saveButton=e.getElementById("saveBtn"),this.cancelButton=e.getElementById("cancelBtn"),this.key=this.getAttribute("key")||"Select",this.items=[],this.isEditing=!1,this.updateComponent=this.updateComponent.bind(this),this.onSelectChange=this.onSelectChange.bind(this),this.onSaveClick=this.onSaveClick.bind(this),this.onCancelClick=this.onCancelClick.bind(this),this.updateComponent=this.updateComponent.bind(this)}connectedCallback(){this.selectElement.addEventListener("change",this.onSelectChange),this.saveButton.addEventListener("click",this.onSaveClick),this.cancelButton.addEventListener("click",this.onCancelClick),this.render()}disconnectedCallback(){this.selectElement.removeEventListener("change",this.onSelectChange),this.saveButton.removeEventListener("click",this.onSaveClick),this.cancelButton.removeEventListener("click",this.onCancelClick)}attributeChangedCallback(e,t,i){t!==i&&(e==="key"&&(this.key=i||"Select"),this.render())}updateComponent(e){this.label=e.label,this.placeholder=e.placeHolder,this.edit=e.edit||"Edit..."}get label(){return this.getAttribute("label")||""}set label(e){this.setAttribute("label",e??"")}get value(){return this.getAttribute("value")||""}set value(e){this.setAttribute("value",e??"")}get editable(){return this.getAttribute("editable")!=="false"}set editable(e){this.setAttribute("editable",e?"true":"false")}get placeholder(){return this.getAttribute("placeholder")||""}set placeholder(e){this.setAttribute("placeholder",e??"")}get options(){return[...this.items]}normalizeItems(e){const t=[],i=new Set;for(const o of Array.isArray(e)?e:[]){const r=String(o).trim();!r||i.has(r)||(i.add(r),t.push(r))}return t}set options(e){const t=this.normalizeItems(e);this.items=t,this.setAttribute("options",t.join(`
`)),this.render()}parseOptionsAttribute(){const e=this.getAttribute("options");if(!e)return[];const t=e.replace(/,/g,`
`);return this.normalizeItems(t.split(/\r?\n/).map(i=>i.trim()).filter(i=>i.length>0))}ensureOptions(){this.items=this.parseOptionsAttribute(),this.items.length===0&&this.value&&(this.items=[this.value]);const e=this.value;e&&!this.items.includes(e)&&this.items.push(e)}ensureSelectedValue(){!this.value&&this.items.length>0&&!this.placeholder&&(this.value=this.items[0])}populateSelectOptions(){if(this.selectElement.replaceChildren(),this.placeholder){const e=document.createElement("option");e.value="",e.textContent=this.placeholder,e.disabled=!0,this.selectElement.appendChild(e)}for(const e of this.items){const t=document.createElement("option");t.value=e,t.textContent=e,this.selectElement.appendChild(t)}if(this.editable){const e=document.createElement("option");e.value=w,e.textContent=this.edit||"Edit...",this.selectElement.appendChild(e)}}updateComponent(e){if(e==null)return;this.label=e.label,this.placeholder=e.placeHolder,this.edit=e.edit||"Edit...";const t=this.selectElement.querySelector(`option[value="${w}"]`);t&&(t.textContent=this.edit||"Edit...")}emitValueChange(e){this.dispatchEvent(new CustomEvent("change",{detail:{value:e,key:this.key,source:this.id||this.tagName.toLowerCase()},bubbles:!0,composed:!0}))}emitOptionsChange(e){this.dispatchEvent(new CustomEvent("options-change",{detail:{options:e,key:this.key,source:this.id||this.tagName.toLowerCase()},bubbles:!0,composed:!0}))}onSelectChange(){const e=this.selectElement.value;if(e===w){this.enterEditMode();return}this.value=e,this.emitValueChange(e)}enterEditMode(){this.editable&&(this.isEditing=!0,this.editorTextElement.value=this.items.join(`
`),this.render(),this.editorTextElement.focus(),this.editorTextElement.select())}exitEditMode(){this.isEditing=!1,this.render()}onSaveClick(){const e=this.normalizeItems(this.editorTextElement.value.split(/\r?\n/).map(t=>t.trim()).filter(t=>t.length>0));this.items=e,this.setAttribute("options",e.join(`
`)),e.length===0?this.value="":e.includes(this.value)||(this.value=e[0]),this.emitOptionsChange([...e]),this.emitValueChange(this.value),this.exitEditMode()}onCancelClick(){this.exitEditMode()}render(){this.ensureOptions(),this.ensureSelectedValue(),this.labelElement.textContent=this.label,this.populateSelectOptions(),this.value?this.selectElement.value=this.value:this.placeholder&&(this.selectElement.value=""),this.selectElement.hidden=this.isEditing,this.editorElement.hidden=!this.isEditing,this.selectElement.disabled=this.items.length===0&&!this.editable}}customElements.define("gc-select",U);const Q="data:application/json;base64,ew0KICAgICJpMThuIjogew0KICAgICAgICAiZW4iOiAiRW5nbGlzaCINCiAgICB9LA0KICAgICJQcm9jZWR1cmVCYXIiOiB7DQogICAgICAgICJ0aXRsZSI6ICJUZXN0OiINCiAgICB9LA0KICAgICJTZXR0aW5nc1BhZ2UiOiB7DQogICAgICAgICJ0aXRsZSI6ICJTZXR0aW5ncyIsDQogICAgICAgICJwcm9wZXJ0aWVzIjogWw0KICAgICAgICAgICAgeyJsYWJlbCI6ICJMYW5ndWFnZSIsImtleSI6Imxhbmd1YWdlIn0NCiAgICAgICAgXQ0KICAgIH0sDQogICAgIkpvYlBsYW5uZXIiOiB7DQogICAgICAgICJ0aXRsZSI6ICJQcm9qZWN0IFBsYW5uZXIiLA0KICAgICAgICAicHJvcGVydGllcyI6IFsNCiAgICAgICAgICAgIHsibGFiZWwiOiAiUHJvamVjdCBOYW1lIiwia2V5IjoicHJvamVjdE5hbWUiLCJlZGl0IjoiRWRpdC4uLiIsInBsYWNlSG9sZGVyIjogIkNob29zZSBvciBlZGl0Li4uIiwgInRvb2x0aXAiOiAiTmFtZSBvZiB0aGUgcHJvamVjdCJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJTdWIgUHJvamVjdCBOYW1lIiwia2V5Ijoic3ViUHJvamVjdE5hbWUiLCJlZGl0IjoiRWRpdC4uLiIsInBsYWNlSG9sZGVyIjogIkNob29zZSBvciBlZGl0Li4uIiwgInRvb2x0aXAiOiAiTmFtZSBvZiB0aGUgc3ViIHByb2plY3QifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiQ2xpZW50IE5hbWUiLCJrZXkiOiJjbGllbnROYW1lIiwiZWRpdCI6IkVkaXQuLi4iLCJwbGFjZUhvbGRlciI6ICJDaG9vc2Ugb3IgZWRpdC4uLiIsICJ0b29sdGlwIjogIk5hbWUgb2YgdGhlIGNsaWVudCJ9DQogICAgICAgIF0NCiAgICB9LA0KICAgICJEYXRhVW5pdCI6IHsNCiAgICAgICAgInRpdGxlIjogIkRhdGEgVW5pdCIsDQogICAgICAgICJwcm9wZXJ0aWVzIjogWw0KICAgICAgICAgICAgeyJsYWJlbCI6ICJUYXJnZXQgUHJlc3N1cmUiLCJrZXkiOiJ0YXJnZXRQcmVzc3VyZSIsInVuaXQiOiAia1BhIiwgInRvb2x0aXAiOiAiRGVzaXJlZCBwcmVzc3VyZSBpbiBraWxvcGFzY2FscyJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJQcmVzc3VyZSIsImtleSI6InByZXNzdXJlIiwgICAgICAidW5pdCI6ICJrUGEiLCAidG9vbHRpcCI6ICJPYnNlcnZlZCBwcmVzc3VyZSBpbiBraWxvcGFzY2FscyJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJGb3JjZSIsICAgImtleSI6ImZvcmNlIiwgICAgICAgICAidW5pdCI6ICJrTiIsICAidG9vbHRpcCI6ICJGb3JjZSBpbiBraWxvbmV3dG9uIn0sDQogICAgICAgICAgICB7ImxhYmVsIjogIlNldHRsaW5nIiwia2V5IjoiZGlzdGFuY2UiLCAgICAgICJ1bml0IjogIm1tIiwgInRvb2x0aXAiOiAiU2V0dGxpbmcgZGlzdGFuY2UgaW4gbWlsbGltZXRlcnMifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiU3BlZWQiLCAgICJrZXkiOiJ2ZWxvY2l0eSIsICAgICAgInVuaXQiOiAibW0vbWluIiwgInRvb2x0aXAiOiAiU2V0dGxpbmcgc3BlZWQgaW4gbWlsbGltZXRlcnMgcGVyIG1pbnV0ZSJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJUaW1lIiwgICAgImtleSI6ImhobW1zcyIsICAgICAgICAidW5pdCI6ICJoaDptbTpzcyIsICJ0b29sdGlwIjogIldoZW4gbWVhc3VyZW1lbnQgd2FzIHRha2VuIn0NCiAgICAgICAgXQ0KICAgIH0sDQogICAgIk1lYXN1cmVtZW50R3JhcGgiOiB7DQogICAgICAgICJ0aXRsZSI6ICJNZWFzdXJlbWVudCBHcmFwaCIsDQogICAgICAgICJ0YWJsZUhlYWRlciI6IFsNCiAgICAgICAgICAgIHsibGFiZWwiOiAiWCBBeGlzIiwgInVuaXQiOiAibW0iLCAidG9vbHRpcCI6ICJYIGF4aXMgbGFiZWwifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiWSBBeGlzIiwgInVuaXQiOiAia1BhIiwgInRvb2x0aXAiOiAiWSBheGlzIGxhYmVsIn0NCiAgICAgICAgXQ0KICAgIH0sDQogICAgIk1lYXN1cmVtZW50VGFibGUiOiB7DQogICAgICAgICJ0aXRsZSI6ICJNZWFzdXJlbWVudCBUYWJsZSIsDQogICAgICAgICJibGFua1Jvd3MiOiAxMCwgDQogICAgICAgICJ0YWJsZUhlYWRlciI6IFsNCiAgICAgICAgICAgIHsibGFiZWwiOiAiU3RlcCIsICJ0b29sdGlwIjogIlN0ZXAgbnVtYmVyIn0sDQogICAgICAgICAgICB7ImxhYmVsIjogIlBoYXNlIiwgInRvb2x0aXAiOiAiUGhhc2UifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiVGFyZ2V0IFByZXNzdXJlIiwgInVuaXQiOiAia1BhIiwgInRvb2x0aXAiOiAiRGVzaXJlZCBwcmVzc3VyZSBpbiBraWxvcGFzY2FscyJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJQZWFrIFByZXNzdXJlIiwgInVuaXQiOiAia1BhIiwgInRvb2x0aXAiOiAiT2JzZXJ2ZWQgcHJlc3N1cmUgaW4ga2lsb3Bhc2NhbHMifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiU2V0dGxpbmciLCAidW5pdCI6ICJtbSIsICJ0b29sdGlwIjogIlNldHRsaW5nIGRpc3RhbmNlIGluIG1pbGxpbWV0ZXJzIn0sDQogICAgICAgICAgICB7ImxhYmVsIjogIlNwZWVkIiwgInVuaXQiOiAibW0vbWluIiwgInRvb2x0aXAiOiAiU2V0dGxpbmcgc3BlZWQgaW4gbWlsbGltZXRlcnMgcGVyIG1pbnV0ZSJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJUaW1lIiwgInVuaXQiOiAiaGg6bW06c3MiLCAidG9vbHRpcCI6ICJXaGVuIG1lYXN1cmVtZW50IHdhcyB0YWtlbiJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJSZXN1bHQiLCAgInRvb2x0aXAiOiAiUmVzdWx0IG9mIHN0YWJpbGl0eSB0ZXN0In0NCiAgICAgICAgXQ0KICAgIH0sDQogICAgIlN1bW1hcnlUYWJsZSI6IHsNCiAgICAgICAgInRpdGxlIjogIlN1bW1hcnkgVGFibGUiLA0KICAgICAgICAiYmxhbmtSb3dzIjogNCwNCiAgICAgICAgInRhYmxlSGVhZGVyIjogWw0KICAgICAgICAgICAgeyJsYWJlbCI6ICJUZXN0ICMiLCAidG9vbHRpcCI6ICJUZXN0IG51bWJlciJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJFdjEiLCAidW5pdCI6ICJNUGEiLCAidG9vbHRpcCI6ICJFdjEgaW4gbWVnYXBhc2NhbHMifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiRXYyIiwgInVuaXQiOiAiTVBhIiwgInRvb2x0aXAiOiAiRXYyIGluIG1lZ2FwYXNjYWxzIn0sDQogICAgICAgICAgICB7ImxhYmVsIjogIkV2Mi9FdjEiLCAidG9vbHRpcCI6ICJFdjIgZGl2aWRlZCBieSBFdjEifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiUm9hZCBSZWYiLCAidG9vbHRpcCI6ICJSb2FkIHJlZmVyZW5jZSJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJMb2NhdGlvbiIsICJ0b29sdGlwIjogIkxvY2F0aW9uIG9mIHRoZSB0ZXN0In0sDQogICAgICAgICAgICB7ImxhYmVsIjogIlN0YXJ0IFRpbWUiLCAidG9vbHRpcCI6ICJTdGFydCB0aW1lIG9mIHRoZSB0ZXN0In0sDQogICAgICAgICAgICB7ImxhYmVsIjogIkVuZCBUaW1lIiwgInRvb2x0aXAiOiAiRW5kIHRpbWUgb2YgdGhlIHRlc3QifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiUmVwb3J0IiwgInRvb2x0aXAiOiAiVGVzdCByZXBvcnQifQ0KICAgICAgICBdDQogICAgfQ0KDQp9DQo=",$="data:application/json;base64,ew0KICAgICJpMThuIjogew0KICAgICAgICAibm8iOiAiTm9yc2siDQogICAgfSwNCiAgICAiUHJvY2VkdXJlQmFyIjogew0KICAgICAgICAidGl0bGUiOiAiVGVzdDoiDQogICAgfSwNCiAgICAiU2V0dGluZ3NQYWdlIjogew0KICAgICAgICAidGl0bGUiOiAiSW5uc3RpbGxpbmdlciIsDQogICAgICAgICJwcm9wZXJ0aWVzIjogWw0KICAgICAgICAgICAgeyJsYWJlbCI6ICJMYW5ndWFnZSIsImtleSI6Imxhbmd1YWdlIn0NCiAgICAgICAgXQ0KICAgIH0sDQogICAgIkpvYlBsYW5uZXIiOiB7DQogICAgICAgICJ0aXRsZSI6ICJKb2IgUGxhbmxlZ2dlciIsDQogICAgICAgICJwcm9wZXJ0aWVzIjogWw0KICAgICAgICAgICAgeyJsYWJlbCI6ICJIb3ZlZHByb3NqZWt0Iiwia2V5IjoicHJvamVjdE5hbWUiLCJlZGl0IjoiRWRpdGVyLi4uIiwicGxhY2VIb2xkZXIiOiAiVmVsZyBlbGxlciBlZGl0ZXIuLi4iLCAidG9vbHRpcCI6ICJOYXZuIHDDpSBwcm9zamVrdGV0In0sDQogICAgICAgICAgICB7ImxhYmVsIjogIlVuZGVycHJvc2pla3QiLCJrZXkiOiJzdWJQcm9qZWN0TmFtZSIsImVkaXQiOiJFZGl0ZXIuLi4iLCJwbGFjZUhvbGRlciI6ICJWZWxnIGVsbGVyIGVkaXRlci4uLiIsICJ0b29sdGlwIjogIk5hdm4gcMOlIHVuZGVycHJvc2pla3RldCJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJPcHBkcmFnc2dpdmVyIiwia2V5IjoiY2xpZW50TmFtZSIsImVkaXQiOiJFZGl0ZXIuLi4iLCJwbGFjZUhvbGRlciI6ICJWZWxnIGVsbGVyIGVkaXRlci4uLiIsICJ0b29sdGlwIjogIk5hdm4gcMOlIGt1bmRlbiJ9DQogICAgICAgIF0NCiAgICB9LA0KICAgICJEYXRhVW5pdCI6IHsNCiAgICAgICAgInRpdGxlIjogIkRhdGFtb2R1bCIsDQogICAgICAgICJwcm9wZXJ0aWVzIjogWw0KICAgICAgICAgICAgeyJsYWJlbCI6ICJNw6VsdHJ5a2siLCAgICJrZXkiOiJ0YXJnZXRQcmVzc3VyZSIsInVuaXQiOiAia1BhIiwgInRvb2x0aXAiOiAiw5huc2tldCB0cnlrayBpIGtpbG9wYXNjYWwifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiVHJ5a2siLCAgICAgICJrZXkiOiJwcmVzc3VyZSIsICAgICAgInVuaXQiOiAia1BhIiwgInRvb2x0aXAiOiAiT2JzZXJ2ZXJ0ZSB0cnlrayBpIGtpbG9wYXNjYWwifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiS3JhZnQiLCAgICAgICJrZXkiOiJmb3JjZSIsICAgICAgICAgInVuaXQiOiAia04iLCAgInRvb2x0aXAiOiAiS3JhZnQgaSBraWxvbmV3dG9uIn0sDQogICAgICAgICAgICB7ImxhYmVsIjogIlNldG5pbmciLCAgICAia2V5IjoiZGlzdGFuY2UiLCAgICAgICJ1bml0IjogIm1tIiwgInRvb2x0aXAiOiAiU2V0bmluZyBhdiBiYWtrZW4gaSBtaWxsaW1ldGVyIn0sDQogICAgICAgICAgICB7ImxhYmVsIjogIkhhc3RpZ2hldCIsICAia2V5IjoidmVsb2NpdHkiLCAgICAgICJ1bml0IjogIm1tL21pbiIsICJ0b29sdGlwIjogIlNpZ2hhc3RpZ2hldCBpIG1pbGxpbWV0ZXIgcGVyIG1pbnV0dCJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJUaWQiLCAgICAgICAgImtleSI6ImhobW1zcyIsICAgICAgICAidW5pdCI6ICJoaDptbTpzcyIsICJ0b29sdGlwIjogIk7DpXIgbcOlbGluZ2VuIGJsZSB0YXR0In0NCiAgICAgXQ0KICAgIH0sDQogICAgIk1lYXN1cmVtZW50R3JhcGgiOiB7DQogICAgICAgICJ0aXRsZSI6ICJNw6VsZSBncmFmIiwNCiAgICAgICAgImJsYW5rUm93cyI6IDUsDQogICAgICAgICJ0YWJsZUhlYWRlciI6IFsNCiAgICAgICAgICAgIHsibGFiZWwiOiAiWC1ha3NlIiwgInVuaXQiOiAibW0iLCAidG9vbHRpcCI6ICJYLWFrc2UgZXRpa2V0dCJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJZLWFrc2UiLCAidW5pdCI6ICJrUGEiLCAidG9vbHRpcCI6ICJZLWFrc2UgZXRpa2V0dCJ9DQogICAgICAgIF0NCiAgICB9LA0KICAgICJNZWFzdXJlbWVudFRhYmxlIjogew0KICAgICAgICAidGl0bGUiOiAiTcOlbGVyZXN1bHRhdCIsDQogICAgICAgICJibGFua1Jvd3MiOiAxMCwNCiAgICAgICAgInRhYmxlSGVhZGVyIjogWw0KICAgICAgICAgICAgeyJsYWJlbCI6ICJTdGVnIiwgInRvb2x0aXAiOiAiU3RlZyBudW1tZXIifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiRmFzZSIsICJ0b29sdGlwIjogIkZhc2UifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiTcOlbHRyeWtrIiwgInVuaXQiOiAia1BhIiwgInRvb2x0aXAiOiAiw5huc2tldCB0cnlrayBpIGtpbG9wYXNjYWwifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiVHJ5a2siLCAidW5pdCI6ICJrUGEiLCAidG9vbHRpcCI6ICJPYnNlcnZlcnRlIHRyeWtrIGkga2lsb3Bhc2NhbCJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJTZXRuaW5nIiwgInVuaXQiOiAibW0iLCAidG9vbHRpcCI6ICJTZXRuaW5nIGF2IGJha2tlbiBpIG1pbGxpbWV0ZXIifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiSGFzdGlnaGV0IiwgInVuaXQiOiAibW0vbWluIiwgInRvb2x0aXAiOiAiU2lnaGFzdGlnaGV0IGkgbWlsbGltZXRlciBwZXIgbWludXR0In0sDQogICAgICAgICAgICB7ImxhYmVsIjogIlRpZCIsICJ1bml0IjogImhoOm1tOnNzIiwgInRvb2x0aXAiOiAiTsOlciBtw6VsaW5nZW4gYmxlIHRhdHQifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiUmVzdWx0YXQiLCAgInRvb2x0aXAiOiAiUmVzdWx0YXQgYXYgc3RhYmlsaXRldHN0ZXN0In0NCiAgICAgICAgXSAgIA0KICAgIH0sDQogICAgIlN1bW1hcnlUYWJsZSI6IHsNCiAgICAgICAgInRpdGxlIjogIlNhbW1lbmRyYWdzdGFiZWxsIiwNCiAgICAgICAgImJsYW5rUm93cyI6IDQsDQogICAgICAgICJ0YWJsZUhlYWRlciI6IFsNCiAgICAgICAgICAgIHsibGFiZWwiOiAiVGVzdCAjIiwgInRvb2x0aXAiOiAiVGVzdCBudW1tZXIifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiRXYxIiwgInVuaXQiOiAiTVBhIiwgInRvb2x0aXAiOiAiRXYxIGkgbWVnYXBhc2NhbHMifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiRXYyIiwgInVuaXQiOiAiTVBhIiwgInRvb2x0aXAiOiAiRXYyIGkgbWVnYXBhc2NhbHMifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiRXYyL0V2MSIsICJ0b29sdGlwIjogIkV2MiBkZWx0IHDDpSBFdjEifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiVmVpcmVmZXJhbnNlIiwgInRvb2x0aXAiOiAiVmVpcmVmZXJhbnNlIn0sDQogICAgICAgICAgICB7ImxhYmVsIjogIkxva2Fzam9uIiwgInRvb2x0aXAiOiAiTG9rYXNqb24gYXYgdGVzdGVuIn0sDQogICAgICAgICAgICB7ImxhYmVsIjogIlN0YXJ0dGlkIiwgInRvb2x0aXAiOiAiU3RhcnR0aWQgZm9yIHRlc3RlbiJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJTbHV0dGlkIiwgInRvb2x0aXAiOiAiU2x1dHRpZCBmb3IgdGVzdGVuIn0sDQogICAgICAgICAgICB7ImxhYmVsIjogIlJhcHBvcnQiLCAidG9vbHRpcCI6ICJUZXN0cmFwcG9ydCJ9DQogICAgICAgIF0NCiAgICB9DQoNCg0KfQ0K",q="data:application/json;base64,ew0KICAgICJpMThuIjogew0KICAgICAgICAicGwiOiAiUG9sc2tpIg0KICAgIH0sDQogICAgIlByb2NlZHVyZUJhciI6IHsNCiAgICAgICAgInRpdGxlIjogIlRlc3R1OiINCiAgICB9LA0KICAgICJTZXR0aW5nc1BhZ2UiOiB7DQogICAgICAgICJ0aXRsZSI6ICJVc3Rhd2llbmlhIiwNCiAgICAgICAgInByb3BlcnRpZXMiOiBbDQogICAgICAgICAgICB7ImxhYmVsIjogIkxhbmd1YWdlIiwia2V5IjoibGFuZ3VhZ2UifQ0KICAgICAgICBdDQogICAgfSwNCiAgICAiSm9iUGxhbm5lciI6IHsNCiAgICAgICAgInRpdGxlIjogIlBsYW5pc3RhIFByb2pla3R1IiwNCiAgICAgICAgInByb3BlcnRpZXMiOiBbDQogICAgICAgICAgICB7ImxhYmVsIjogIlByb2pla3QgZ8WCw7N3bnkiLCJrZXkiOiJwcm9qZWN0TmFtZSIsICJlZGl0IjoiRWR5dHVqLi4uIiwicGxhY2VIb2xkZXIiOiAiV3liaWVyeiBsdWIgZWR5dHVqLi4uIiwgInRvb2x0aXAiOiAiTmF6d2EgcHJvamVrdHUifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiUG9kcHJvamVrdCIsImtleSI6InN1YlByb2plY3ROYW1lIiwiZWRpdCI6IkVkeXR1ai4uLiIsInBsYWNlSG9sZGVyIjogIld5YmllcnogbHViIGVkeXR1ai4uLiIsICJ0b29sdGlwIjogIk5hendhIHBvZHByb2pla3R1In0sDQogICAgICAgICAgICB7ImxhYmVsIjogIk5hendhIGtsaWVudGEiLCJrZXkiOiJjbGllbnROYW1lIiwiZWRpdCI6IkVkeXR1ai4uLiIsInBsYWNlSG9sZGVyIjogIld5YmllcnogbHViIGVkeXR1ai4uLiIsICJ0b29sdGlwIjogIk5hendhIGtsaWVudGEifQ0KICAgICAgICBdDQogICAgfSwNCiAgICAiRGF0YVVuaXQiOiB7DQogICAgICAgICJ0aXRsZSI6ICJKZWRub3N0a2EgZGFueWNoIiwNCiAgICAgICAgInByb3BlcnRpZXMiOiBbDQogICAgICAgICAgICB7ImxhYmVsIjogIkNlbCIsICAgICAgICJrZXkiOiJ0YXJnZXRQcmVzc3VyZSIsICAidW5pdCI6ICJrUGEiLCAidG9vbHRpcCI6ICJEb2NlbG93ZSBjacWbbmllbmllIHcga2lsb3Bhc2thbGFjaCJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJDacWbbmllbmllIiwgImtleSI6InByZXNzdXJlIiwgICAidW5pdCI6ICJrUGEiLCAidG9vbHRpcCI6ICJPYnNlcndvd2FuZSBjacWbbmllbmllIHcga2lsb3Bhc2thbGFjaCJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJTacWCYSIsICAgICAgImtleSI6ImZvcmNlIiwgICAidW5pdCI6ICJrTiIsICAidG9vbHRpcCI6ICJTacWCYSB3IGtpbG9uaXV0b25hY2gifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiT3NhZHplbmllIiwgImtleSI6ImRpc3RhbmNlIiwgICAidW5pdCI6ICJtbSIsICJ0b29sdGlwIjogIk9kbGVnxYJvxZvEhyBvc2FkemVuaWEgdyBtaWxpbWV0cmFjaCJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJQcsSZZGtvxZvEhyIsICAia2V5IjoidmVsb2NpdHkiLCAgICJ1bml0IjogIm1tL21pbiIsICJ0b29sdGlwIjogIlByxJlka2/Fm8SHIG9zYWR6ZW5pYSB3IG1pbGltZXRyYWNoIG5hIG1pbnV0xJkifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiQ3phcyIsICAgICAgImtleSI6ImhobW1zcyIsICAgInVuaXQiOiAiaGg6bW06c3MiLCAidG9vbHRpcCI6ICJDemFzIHd5a29uYW5pYSBwb21pYXJ1In0NCiAgICAgICAgXQ0KICAgIH0sDQogICAgIk1lYXN1cmVtZW50R3JhcGgiOiB7DQogICAgICAgICJ0aXRsZSI6ICJXeWtyZXMgcG9taWFyb3d5IiwNCiAgICAgICAgImJsYW5rUm93cyI6IDUsDQogICAgICAgICJ0YWJsZUhlYWRlciI6IFsNCiAgICAgICAgICAgIHsibGFiZWwiOiAiT8WbIFgiLCAidW5pdCI6ICJtbSIsICJ0b29sdGlwIjogIkV0eWtpZXRhIG9zaSBYIn0sDQogICAgICAgICAgICB7ImxhYmVsIjogIk/FmyBZIiwgInVuaXQiOiAia1BhIiwgInRvb2x0aXAiOiAiRXR5a2lldGEgb3NpIFkifQ0KICAgICAgICBdDQogICAgfSwNCiAgICAiTWVhc3VyZW1lbnRUYWJsZSI6IHsNCiAgICAgICAgInRpdGxlIjogIlRhYmVsYSBwb21pYXJvd2EiLA0KICAgICAgICAiYmxhbmtSb3dzIjogMTAsDQogICAgICAgICJ0YWJsZUhlYWRlciI6IFsNCiAgICAgICAgICAgIHsibGFiZWwiOiAiS3JvayIsICJ0b29sdGlwIjogIk51bWVyIGtyb2t1In0sDQogICAgICAgICAgICB7ImxhYmVsIjogIkZhemEiLCAidG9vbHRpcCI6ICJGYXphIn0sDQogICAgICAgICAgICB7ImxhYmVsIjogIkNlbCIsICJ1bml0IjogImtQYSIsICJ0b29sdGlwIjogIkRvY2Vsb3dlIGNpxZtuaWVuaWUgdyBraWxvcGFza2FsYWNoIn0sDQogICAgICAgICAgICB7ImxhYmVsIjogIkNpxZtuaWVuaWUiLCAidW5pdCI6ICJrUGEiLCAidG9vbHRpcCI6ICJPYnNlcndvd2FuZSBjacWbbmllbmllIHcga2lsb3Bhc2thbGFjaCJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJPc2FkemVuaWUiLCAidW5pdCI6ICJtbSIsICJ0b29sdGlwIjogIk9kbGVnxYJvxZvEhyBvc2FkemVuaWEgdyBtaWxpbWV0cmFjaCJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJQcsSZZGtvxZvEhyIsICJ1bml0IjogIm1tL21pbiIsICJ0b29sdGlwIjogIlByxJlka2/Fm8SHIG9zYWR6ZW5pYSB3IG1pbGltZXRyYWNoIG5hIG1pbnV0xJkifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiQ3phcyIsICJ1bml0IjogImhoOm1tOnNzIiwgInRvb2x0aXAiOiAiQ3phcyB3eWtvbmFuaWEgcG9taWFydSJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJXeW5payIsICAidG9vbHRpcCI6ICJXeW5payB0ZXN0dSBzdGFiaWxub8WbY2kifQ0KICAgICAgICBdDQogICAgfSwNCiAgICAiU3VtbWFyeVRhYmxlIjogew0KICAgICAgICAidGl0bGUiOiAiVGFiZWxhIHBvZHN1bW93dWrEhWNhIiwNCiAgICAgICAgImJsYW5rUm93cyI6IDQsDQogICAgICAgICJ0YWJsZUhlYWRlciI6IFsNCiAgICAgICAgICAgIHsibGFiZWwiOiAiVGVzdCAjIiwgInRvb2x0aXAiOiAiTnVtZXIgdGVzdHUifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiRXYxIiwgInVuaXQiOiAiTVBhIiwgInRvb2x0aXAiOiAiRXYxIHcgbWVnYXBhc2thbGFjaCJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJFdjIiLCAidW5pdCI6ICJNUGEiLCAidG9vbHRpcCI6ICJFdjIgdyBtZWdhcGFza2FsYWNoIn0sDQogICAgICAgICAgICB7ImxhYmVsIjogIkV2Mi9FdjEiLCAidG9vbHRpcCI6ICJFdjIgcG9kemllbG9uZSBwcnpleiBFdjEifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiT2RuaWVzaWVuaWUgZG8gZHJvZ2kiLCAidG9vbHRpcCI6ICJPZG5pZXNpZW5pZSBkbyBkcm9naSJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJMb2thbGl6YWNqYSIsICJ0b29sdGlwIjogIkxva2FsaXphY2phIHRlc3R1In0sDQogICAgICAgICAgICB7ImxhYmVsIjogIkN6YXMgcm96cG9jesSZY2lhIiwgInRvb2x0aXAiOiAiQ3phcyByb3pwb2N6xJljaWEgdGVzdHUifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiQ3phcyB6YWtvxYRjemVuaWEiLCAidG9vbHRpcCI6ICJDemFzIHpha2/FhGN6ZW5pYSB0ZXN0dSJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJSYXBvcnQiLCAidG9vbHRpcCI6ICJSYXBvcnQgeiB0ZXN0dSJ9DQogICAgICAgIF0NCiAgICB9DQoNCn0NCg==",J=document.createElement("template");J.innerHTML=`
  <style>
    ${p}
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


    .metric-item {
        margin-bottom: 10px;
    }

    .metric-item:last-child {
        margin-bottom: 0;
    }

    .metric-label {
        margin: 0;
        font-size: 0.7em;
        font-weight: 600;
        color: #616F76;
        white-space: nowrap;
    }

    .metric-value {
        margin: 2px 0 0;
        font-size: 1.0em;
        line-height: 1;
        font-weight: 700;
        color: #313F46;
        white-space: nowrap;
    }

  </style>

    <div class="body">
        <div class="metric-item" id="title">
            <p class="metric-label" id="labelId">Label</p>
            <p class="metric-value">
                <select id="selectId" class="w3-select"></select>
            </p>
        </div>     
        <slot></slot>
        </div>
    </div>
`;class K extends HTMLElement{static get observedAttributes(){return["label","key"]}constructor(){super();const e=this.attachShadow({mode:"open"});e.append(J.content.cloneNode(!0)),this.labelElement=e.getElementById("labelId"),this.selectElement=e.getElementById("selectId"),this.key=this.getAttribute("key")||"LanguageSelect",this.updateComponentOptions=this.updateComponentOptions.bind(this),this.emitNewCountryCodeSelected=this.emitNewCountryCodeSelected.bind(this),this.appStore=null}setAppStore(e){if(!e||typeof e.setLanguage!="function")throw new TypeError("appStore must provide setLanguage()");this.appStore=e,this.isConnected&&!this.optionsInitialized&&this.initializeOptions()}connectedCallback(){this.selectElement.addEventListener("change",e=>{const t=e.target.value;this.value=t,this.emitNewCountryCodeSelected(t)}),this.render()}disconnectedCallback(){this.selectElement.replaceWith(this.selectElement.cloneNode(!0))}initializeOptions(){if(this.optionsInitialized)return;this.optionsInitialized=!0;const e=new URL("data:application/json;base64,eyANCiAgICAibGFiZWwiOiAiTGFuZ3VhZ2UiLA0KICAgICJpY29uIiA6ICJsYW5ndWFnZSIsDQogICAgInN1cHBvcnRlZExhbmd1YWdlcyI6IFsNCiAgICAgICAgeyAiY29kZSI6ICJlbiIsICJsYWJlbCI6ICJFbmdsaXNoIiB9LA0KICAgICAgICB7ICJjb2RlIjogInBsIiwgImxhYmVsIjogIlBvbHNraSIgfSwgICAgDQogICAgICAgIHsgImNvZGUiOiAibm8iLCAibGFiZWwiOiAiTm9yc2siIH0NCiAgICBdDQp9",import.meta.url);fetch(e).then(t=>t.json()).then(t=>{this.updateComponentOptions(t)}).catch(t=>{this.optionsInitialized=!1,console.error("Error loading languages2.json:",t)})}updateComponentOptions(e){this.labelElement.textContent=(e==null?void 0:e.label)||"Language";let t=(e==null?void 0:e.supportedLanguages)||[];this.selectElement.innerHTML="",t.forEach(i=>{const o=document.createElement("option");o.value=i.code,o.textContent=i.label,this.selectElement.appendChild(o)}),this.value=t.length>0?t[0].code:"",this.selectElement.value=this.value,this.emitNewCountryCodeSelected(this.value)}async emitNewCountryCodeSelected(e){const t=new URL(Object.assign({"./locale/en_lang.json":Q,"./locale/no_lang.json":$,"./locale/pl_lang.json":q})[`./locale/${e}_lang.json`],import.meta.url);let o=await(await fetch(t)).json();if(!this.appStore)throw new Error("Language select requires an injected appStore");this.appStore.setLanguage(e,o),this.dispatchEvent(new CustomEvent("new-language-selected",{detail:{code:e,catalog:o,key:this.key,source:this.id||this.tagName.toLowerCase()},bubbles:!0,composed:!0}))}render(){this.labelElement.textContent=this.label}}customElements.define("gc-language-select",K);class _ extends k{constructor(){super(),this.onProcedureStoreChange=this.onProcedureStoreChange.bind(this),this.onMeasurementStoreChange=this.onMeasurementStoreChange.bind(this),this.appStore=null;const e={};this.summary=e}setAppStore(e){if(!e||typeof e.getProcedure!="function"||typeof e.getMeasurements!="function")throw new TypeError("appStore must provide procedure and measurement accessors");this.appStore=e,this.isConnected&&(this.appStore.addEventListener("procedure-changed",this.onProcedureStoreChange),this.appStore.addEventListener("measurement-recorded",this.onMeasurementStoreChange),this.syncProcedureFromStore(),this.syncMeasurementsFromStore())}connectedCallback(){var e,t;super.connectedCallback(),(e=this.appStore)==null||e.addEventListener("procedure-changed",this.onProcedureStoreChange),(t=this.appStore)==null||t.addEventListener("measurement-recorded",this.onMeasurementStoreChange),this.syncProcedureFromStore(),this.syncMeasurementsFromStore()}disconnectedCallback(){var e,t;super.disconnectedCallback(),(e=this.appStore)==null||e.removeEventListener("procedure-changed",this.onProcedureStoreChange),(t=this.appStore)==null||t.removeEventListener("measurement-recorded",this.onMeasurementStoreChange)}renderMeasurement(e){let t=[];t[0]=e.nr,t[1]=e.name,t[2]=e.targetPressure.toFixed(1),t[3]=e.pressure.toFixed(1),t[4]=e.distance.toFixed(3),t[5]=e.velocity.toFixed(3),t[6]=e.hhmmss,t[7]=e.passed==!0?"PASS":"FAIL",this.updateRowData(e.nr,t),this.render()}async onProcedureStoreChange(e){await this.applyTestProcedureChange(e.detail.procedure)}onMeasurementStoreChange(e){this.renderMeasurement(e.detail.measurement)}async syncProcedureFromStore(){var t;const e=(t=this.appStore)==null?void 0:t.getProcedure();e&&await this.applyTestProcedureChange(e)}syncMeasurementsFromStore(){var e;(e=this.appStore)==null||e.getMeasurements().forEach(t=>this.renderMeasurement(t))}async applyTestProcedureChange(e){const t={};t.nr=0,t.name="Test",t.targetPressure=0,t.pressure=0,t.force=0,t.distance=0,t.velocity=0,t.vMax=.02,t.dt=0,t.tMax=60,t.hhmmss="00:00:00",t.passed=!1,this.summary.delta1=e.delta1,this.summary.delta2=e.delta2;let i=e.content,o=[];i.forEach(r=>{o[0]=r.step,o[1]=r.phase,o[2]=r.targetPressure.toFixed(1),o[3]=t.pressure.toFixed(1),o[4]=t.distance.toFixed(3),o[5]=r.vMax,o[6]=r.tMax,o[7]="?",this.updateRowData(r.step,o)})}calculateSummaryResults(){Math.max(...this.measurements.map(z=>z.targetPressure));let e=.3,t=this.summary.delta1.p1Index,i=this.summary.delta1.p2Index,o=this.measurements[t].targetPressure,r=this.measurements[i].targetPressure,n=this.measurements[t].distance,s=this.measurements[i].distance,l=r-o,h=s-n,d=.75*(l/h)*e,u=this.summary.delta2.p1Index,m=this.summary.delta2.p2Index,O=this.measurements[u].targetPressure,H=this.measurements[m].targetPressure,X=this.measurements[u].distance,Y=this.measurements[m].distance,A=H-O,v=Y-X,I=.75*(A/v)*e;return console.log(`E1 calculation: dp1=${l}, ds1=${h}, D=${e}, E1=${d}`),console.log(`E2 calculation: dp2=${A}, ds2=${v}, D=${e}, E2=${I}`),console.log(`E ratio calculation: E2/E1=${I/d}`),{E1:d,E2:I,ratio:I/d}}}customElements.define("gc-measurements-table",_);const W=document.createElement("template");W.innerHTML=`
  <style>
    ${p}
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

    .gc-select-row {
        width: 100%;
        display: flex;
        flex-direction: row;
        gap: 6px;
        justify-content: left;
        margin: 6px;
        padding: 6px;
    }

  </style>

    <div class="body">
        <div class="w3-container w3-padding">
            <div class="control-bar w3-text-blue w3-medium w3-left" id="title">Title</div>
            <div class="w3-row gc-select-row">
                <div class="w3-col s12 m6 l6">
                    <div class="w3-half">
                        <gc-language-select id="languageSelect" key="languageSelect"></gc-language-select>
                    </div>

                </div>
            </div>
        <slot></slot>
        </div>
    </div>
`;class ee extends HTMLElement{static get prefix(){return"SettingsPage"}static get observedAttributes(){return["title","key"]}constructor(){super();const e=this.attachShadow({mode:"closed"});e.append(W.content.cloneNode(!0)),this.titleElement=e.getElementById("title"),this.onLanguageChange=this.onLanguageChange.bind(this),this.key=this.getAttribute("key")||this.constructor.prefix,this.languageSelectElement=e.getElementById("languageSelect"),this.appStore=null}connectedCallback(){var e;(e=this.appStore)==null||e.addEventListener("language-changed",this.onLanguageChange),this.render()}disconnectedCallback(){var e;(e=this.appStore)==null||e.removeEventListener("language-changed",this.onLanguageChange)}attributeChangedCallback(){this.key=this.getAttribute("key")||this.constructor.prefix,this.render()}setAppStore(e){var t;if(!e||typeof e.getLanguage!="function")throw new TypeError("appStore must provide getLanguage()");if((t=this.appStore)==null||t.removeEventListener("language-changed",this.onLanguageChange),this.appStore=e,this.languageSelectElement.setAppStore(e),this.isConnected){this.appStore.addEventListener("language-changed",this.onLanguageChange);const i=e.getLanguage();i&&this.onLanguageChange({detail:i})}}async onLanguageChange(e){const t=e==null?void 0:e.detail;typeof t=="string"||t==null||t.code;const i=t==null?void 0:t.catalog;i&&await this.applyLanguageChange(i)}async applyLanguageChange(e){var i;const t=((i=e==null?void 0:e[this.key])==null?void 0:i.title)||this.constructor.prefix;this.titleElement.textContent=t}render(){this.titleElement.textContent=this.getAttribute("title")||this.constructor.prefix}}customElements.define("gc-settings-page",ee);const G=document.createElement("template");G.innerHTML=`
  <style>
    ${p}
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

    .gc-select-row {
        width: 100%;
        display: flex;
        flex-direction: row;
        gap: 6px;
        justify-content: left;
        margin: 6px;
        padding: 6px;
    }

  </style>

    <div class="body">
        <div class="w3-container w3-padding">
            <div class="control-bar w3-text-blue w3-medium w3-left" id="title">Title</div>
            <div class="w3-row gc-select-row">
                <div class="w3-col s12 m6 l6">
                    <div class="w3-half">
                        <gc-select id="clientName" key="clientName" label="Client Name"></gc-select>
                    </div>
                    <div class="w3-half">
                        <gc-select id="projectName" key="projectName" label="Project Name"></gc-select>
                    </div>
                    <div class="w3-half">
                        <gc-select id="subProjectName" key="subProjectName" label="Sub Project Name"></gc-select>
                    </div>
                    <div class="w3-half">
                        <gc-select id="jobName" key="jobName" label="Job Name" value="Nr 1"></gc-select>
                    </div>
                    <div class="w3-half">
                        <gc-procedure-bar></gc-procedure-bar>
                    </div>

                </div>
            </div>
        <slot></slot>
        </div>
    </div>
`;class te extends HTMLElement{static get observedAttributes(){return["title"]}constructor(){super(),this.key="JobPlanner";const e=this.attachShadow({mode:"closed"});e.append(G.content.cloneNode(!0)),this.titleElement=e.getElementById("title"),this.onLanguageChange=this.onLanguageChange.bind(this),this.projectNameElement=e.getElementById("projectName"),this.subProjectNameElement=e.getElementById("subProjectName"),this.clientNameElement=e.getElementById("clientName"),this.operatorNameElement=e.getElementById("operatorName")||null,this.procedureBarElement=e.querySelector("gc-procedure-bar"),this.loadDataFromJson=this.loadDataFromJson.bind(this)}setAppStore(e){this.procedureBarElement.setAppStore(e)}connectedCallback(){document.addEventListener("new-language-selected",this.onLanguageChange),this.loadDataFromJson(),this.render()}disconnectedCallback(){document.removeEventListener("new-language-selected",this.onLanguageChange)}attributeChangedCallback(){this.render()}async loadDataFromJson(){var e;try{const t=await fetch("data/Master.json");if(!t.ok)throw new Error(`HTTP error! status: ${t.status}`);const i=await t.json();let r=(i.projects||[]).map(d=>d.name).join(`
`);this.projectNameElement.setAttribute("options",r);let s=(i.clients||[]).map(d=>d.name).join(`
`);this.clientNameElement.setAttribute("options",s);let h=(((e=i.projects[0])==null?void 0:e.subProjects)||[]).map(d=>d.name).join(`
`);this.subProjectNameElement.setAttribute("options",h),this.render()}catch(t){console.error("Failed to load data from JSON:",t)}}async onLanguageChange(e){const t=e==null?void 0:e.detail;typeof t=="string"||t==null||t.code;const i=t==null?void 0:t.catalog;i&&await this.applyLanguageChange(i)}async applyLanguageChange(e){var i,o,r,n,s,l,h;this.title=((i=e==null?void 0:e[this.key])==null?void 0:i.title)||this.key;let t=(r=(o=e==null?void 0:e[this.key])==null?void 0:o.properties)==null?void 0:r.find(d=>d.key==="projectName");this.projectNameElement.updateComponent(t),t=(s=(n=e==null?void 0:e[this.key])==null?void 0:n.properties)==null?void 0:s.find(d=>d.key==="subProjectName"),this.subProjectNameElement.updateComponent(t),t=(h=(l=e==null?void 0:e[this.key])==null?void 0:l.properties)==null?void 0:h.find(d=>d.key==="clientName"),this.clientNameElement.updateComponent(t),this.render()}render(){this.titleElement.textContent=this.getAttribute("title")||this.key}}customElements.define("gc-job-planner",te);class T extends EventTarget{constructor(e={}){super(),this.counter=0,this.verbose=!1,this.port=null,this.reader=null,this.keepReading=!1,this.isConnecting=!1,this.readBuffer="",this.decoder=new TextDecoder,this.encoder=new TextEncoder,this.autoConnectTimer=null,this.autoConnectEnabled=!1,this.autoReconnectOnLoss=!1,this.autoConnectRequested=this.normalizeBooleanOption(e.autoconnect),this.autoConnectIntervalMs=this.normalizeAutoConnectIntervalMs(e.autoconnectIntervalMs),this.storageScope=e.storageScope||e.componentIdentifier||"default",this.componentIdentifier=e.componentIdentifier||"GcUsbLink",this.isMonitoring=!1,this.linkState="disconnected",this.onSerialDisconnect=this.onSerialDisconnect.bind(this),this.configure(e)}configure(e={}){Object.prototype.hasOwnProperty.call(e,"autoconnect")&&(this.autoConnectRequested=this.normalizeBooleanOption(e.autoconnect)),Object.prototype.hasOwnProperty.call(e,"autoconnectIntervalMs")&&(this.autoConnectIntervalMs=this.normalizeAutoConnectIntervalMs(e.autoconnectIntervalMs)),Object.prototype.hasOwnProperty.call(e,"storageScope")&&(this.storageScope=e.storageScope||"default"),Object.prototype.hasOwnProperty.call(e,"componentIdentifier")&&(this.componentIdentifier=e.componentIdentifier||"GcUsbLink")}normalizeBooleanOption(e){return e===!0||e==="true"||e===1}normalizeAutoConnectIntervalMs(e){const t=Number.parseInt(String(e??"5000"),10);return Number.isFinite(t)&&t>=1e3?t:5e3}async onPortConnected(){}async onPortDisconnected(){}emitAppLog(e,t,i={}){this.dispatchEvent(new CustomEvent("app-log",{detail:{level:e,source:this.componentIdentifier||"GcUsbLink",message:t,...i},bubbles:!0,composed:!0}))}getPortStatus(){var e,t;return{state:this.linkState,isConnected:!!this.port,isConnecting:this.isConnecting,autoConnectEnabled:this.autoConnectEnabled||this.isAutoConnectRequested(),counter:this.counter,portInfo:((t=(e=this.port)==null?void 0:e.getInfo)==null?void 0:t.call(e))||null}}updateLinkState(e){this.linkState!==e&&(this.linkState=e,this.dispatchEvent(new CustomEvent("port-status-change",{detail:this.getPortStatus(),bubbles:!0,composed:!0})))}isAutoConnectRequested(){return this.autoConnectRequested}getAutoConnectIntervalMs(){return this.autoConnectIntervalMs}getAutoConnectStorageScope(){return this.storageScope||this.componentIdentifier||"default"}getRememberedPortStorageKey(){return`gc.serial.rememberedPort.${this.getAutoConnectStorageScope()}`}getRememberedPortHint(){try{const e=localStorage.getItem(this.getRememberedPortStorageKey());if(!e)return null;const t=JSON.parse(e);return t&&typeof t=="object"?t:null}catch{return null}}clearRememberedPortHint(){localStorage.removeItem(this.getRememberedPortStorageKey())}rememberCurrentPortHint(e={}){if(!this.port)return;const t=this.port.getInfo(),i={usbVendorId:t.usbVendorId??null,usbProductId:t.usbProductId??null,updatedAt:new Date().toISOString(),...e};localStorage.setItem(this.getRememberedPortStorageKey(),JSON.stringify(i))}isSamePort(e,t){if(!e||!t)return!1;const i=e.getInfo();return i.usbVendorId===t.usbVendorId&&i.usbProductId===t.usbProductId}async tryAutoConnect(){if(!this.autoConnectEnabled||this.port||this.isConnecting||!navigator.serial)return;const e=this.getRememberedPortHint();if(!e)return;const i=(await navigator.serial.getPorts()).find(o=>this.isSamePort(o,e));i&&await this.connectPort({port:i,requestPortIfMissing:!1})}startAutoConnect(){this.stopAutoConnect(),this.autoConnectEnabled=!0,this.tryAutoConnect(),this.autoConnectTimer=setInterval(()=>{this.tryAutoConnect()},this.getAutoConnectIntervalMs())}stopAutoConnect(){this.autoConnectEnabled=!1,this.autoConnectTimer&&(clearInterval(this.autoConnectTimer),this.autoConnectTimer=null)}startMonitoring(){var e;this.isMonitoring||((e=navigator.serial)==null||e.addEventListener("disconnect",this.onSerialDisconnect),this.isMonitoring=!0,this.isAutoConnectRequested()&&!this.port?this.startAutoConnect():this.updateLinkState(this.port?"connected":"disconnected"))}stopMonitoring(){var e;this.isMonitoring&&((e=navigator.serial)==null||e.removeEventListener("disconnect",this.onSerialDisconnect),this.isMonitoring=!1,this.stopAutoConnect())}enableAutoConnect(){this.autoConnectRequested=!0,this.autoReconnectOnLoss=!0,this.port||this.startAutoConnect()}disableAutoConnect(){this.autoConnectRequested=!1,this.autoReconnectOnLoss=!1,this.stopAutoConnect()}isPortLostError(e){return(e==null?void 0:e.name)==="NetworkError"||/device has been lost/i.test(String((e==null?void 0:e.message)||""))}async handlePortLost(e=null){!this.port&&!this.reader||(e&&(console.warn("Serial device disconnected:",e),this.emitAppLog("warn","Serial device disconnected")),this.keepReading=!1,this.reader=null,this.port=null,this.updateLinkState(this.autoReconnectOnLoss?"reconnecting":"disconnected"),await this.onPortDisconnected(),this.autoReconnectOnLoss&&this.startAutoConnect())}onSerialDisconnect(e){this.port&&(e==null?void 0:e.port)===this.port&&this.handlePortLost(e)}async connectPort(e={}){const{port:t=null,requestPortIfMissing:i=!0}=e;if(!navigator.serial){console.error("Web Serial API is not available in this browser."),this.updateLinkState("error");return}if(!(this.isConnecting||this.port)){this.isConnecting=!0,this.updateLinkState("connecting");try{if(t)this.port=t;else if(i)this.port=await navigator.serial.requestPort();else{this.port=null;return}await this.port.open({baudRate:115200}),this.keepReading=!0,this.readBuffer="",this.readLoop(),this.rememberCurrentPortHint(),this.autoReconnectOnLoss=this.isAutoConnectRequested(),this.stopAutoConnect(),this.emitAppLog("info","Serial port opened"),await this.onPortConnected(),this.updateLinkState("connected")}catch(o){this.verbose&&console.error("Error opening serial port:",o),this.emitAppLog("error","Failed to open serial port"),this.port=null,this.keepReading=!1,this.updateLinkState("error")}finally{this.isConnecting=!1,!this.port&&this.linkState==="connecting"&&this.updateLinkState("disconnected")}}}async disconnectPort(e={}){const{intentional:t=!1}=e;t&&(this.autoReconnectOnLoss=!1,this.stopAutoConnect()),this.keepReading=!1;const i=this.reader;this.reader=null;try{if(i){await i.cancel();try{i.releaseLock()}catch{}}}catch(o){console.error("Error stopping serial reader:",o),this.emitAppLog("warn","Error stopping serial reader")}try{this.port&&await this.port.close()}catch(o){console.error("Error closing serial port:",o),this.emitAppLog("warn","Error closing serial port")}finally{this.port=null,await this.onPortDisconnected(),this.emitAppLog("info","Serial port closed"),this.updateLinkState("disconnected")}}async writeLine(e){var i;if(!((i=this.port)!=null&&i.writable))throw new Error("Serial port is not writable.");const t=this.port.writable.getWriter();try{const o=String(e).replace(/[\r\n]+$/,"");this.emitAppLog("debug",`TX ${o}`),await t.write(this.encoder.encode(`${o}\r
`))}finally{t.releaseLock()}}async readLoop(){var t;if(!((t=this.port)!=null&&t.readable))return;let e;try{for(e=this.port.readable.getReader(),this.reader=e;this.keepReading;){const{value:i,done:o}=await e.read();if(o)break;i&&this.pushChunk(i)}}catch(i){this.keepReading&&this.isPortLostError(i)?await this.handlePortLost(i):this.keepReading&&(console.error("Error while reading serial data:",i),this.emitAppLog("error","Error while reading serial data"),this.updateLinkState("error"))}finally{try{e==null||e.releaseLock()}catch{}this.reader===e&&(this.reader=null)}}pushChunk(e){this.readBuffer+=this.decoder.decode(e,{stream:!0});const t=this.readBuffer.split(/\r?\n/);this.readBuffer=t.pop()||"";for(const i of t)this.handleIncoming(i)}handleIncoming(e){this.counter++,this.dispatchEvent(new CustomEvent("serial-line",{detail:{line:e,counter:this.counter},bubbles:!0,composed:!0}));const t=String(e||"").trim();t.startsWith("$F,")||this.emitAppLog("debug",`RX ${t}`)}}let y="6e400001-b5a3-f393-e0a9-e50e24dcca9e";class P extends EventTarget{constructor(e={}){super(),this.serviceUuid=e.serviceUuid||y,this.componentIdentifier=e.componentIdentifier||"GCBLELink",this.decoder=new TextDecoder,this.encoder=new TextEncoder,this.readBuffer="",this.counter=0,this.isConnecting=!1,this.linkState="disconnected",this.device=null,this.server=null,this.service=null,this.notifyCharacteristic=null,this.writeCharacteristic=null,this.notificationsEnabled=!1,this.onGattDisconnected=this.onGattDisconnected.bind(this),this.onCharacteristicValueChanged=this.onCharacteristicValueChanged.bind(this)}configure(e={}){Object.prototype.hasOwnProperty.call(e,"serviceUuid")&&(this.serviceUuid=e.serviceUuid||y),Object.prototype.hasOwnProperty.call(e,"componentIdentifier")&&(this.componentIdentifier=e.componentIdentifier||"GCBLELink")}rememberCurrentPortHint(){}get port(){var e;return(e=this.server)!=null&&e.connected?this.server:null}emitAppLog(e,t,i={}){this.dispatchEvent(new CustomEvent("app-log",{detail:{level:e,source:this.componentIdentifier,message:t,...i},bubbles:!0,composed:!0}))}getPortStatus(){var e,t;return{state:this.linkState,isConnected:this.isConnected(),isConnecting:this.isConnecting,autoConnectEnabled:!1,counter:this.counter,transport:"ble",serviceUuid:this.serviceUuid,deviceName:((e=this.device)==null?void 0:e.name)||null,deviceId:((t=this.device)==null?void 0:t.id)||null}}updateLinkState(e){this.linkState!==e&&(this.linkState=e,this.dispatchEvent(new CustomEvent("port-status-change",{detail:this.getPortStatus(),bubbles:!0,composed:!0})))}isConnected(){var e;return!!((e=this.server)!=null&&e.connected&&this.writeCharacteristic)}normalizeUuid(e){return String(e||"").trim().toLowerCase()}async findPrimaryService(e){const t=await e.getPrimaryServices(),i=t.map(n=>n.uuid);this.emitAppLog("info",`Discovered BLE services: ${i.join(", ")||"(none)"}`);const o=this.normalizeUuid(this.serviceUuid),r=t.find(n=>this.normalizeUuid(n.uuid)===o);if(r)return r;throw new Error(`BLE UART service ${this.serviceUuid} not found on device`)}async onPortConnected(){}async onPortDisconnected(){}async connectPort(e={}){const{device:t=null,requestPortIfMissing:i=!0}=e;if(!navigator.bluetooth){this.emitAppLog("error","Web Bluetooth API is not available in this browser"),this.updateLinkState("error");return}if(!(this.isConnecting||this.isConnected())){this.isConnecting=!0,this.updateLinkState("connecting"),console.log("Connecting to BLE link...");try{if(t)this.device=t,console.log(`Using provided Bluetooth device: ${t.name||t.id}`);else if(i)this.emitAppLog("info","Requesting Bluetooth LE device"),this.device=await navigator.bluetooth.requestDevice({filters:[{namePrefix:"du-"}],optionalServices:[this.serviceUuid]}),this.emitAppLog("info",`Selected Bluetooth device: ${this.device.name||this.device.id}`);else{this.updateLinkState("disconnected");return}this.device.addEventListener("gattserverdisconnected",this.onGattDisconnected),this.emitAppLog("info","Connecting to BLE GATT server"),this.server=await this.device.gatt.connect(),this.emitAppLog("info","Discovering BLE primary services"),this.service=await this.findPrimaryService(this.server),this.emitAppLog("info",`Using BLE service ${this.service.uuid}`);const o=await this.service.getCharacteristics();this.emitAppLog("info",`Discovered ${o.length} BLE characteristic(s)`);for(const r of o)this.emitAppLog("debug",`Characteristic ${r.uuid} notify=${!!r.properties.notify} write=${!!r.properties.write} writeWithoutResponse=${!!r.properties.writeWithoutResponse}`),!this.notifyCharacteristic&&r.properties.notify&&(this.notifyCharacteristic=r),!this.writeCharacteristic&&(r.properties.write||r.properties.writeWithoutResponse)&&(this.writeCharacteristic=r);if(!this.notifyCharacteristic||!this.writeCharacteristic)throw new Error("BLE UART characteristics not found");this.emitAppLog("info",`Using notify characteristic ${this.notifyCharacteristic.uuid}`),this.emitAppLog("info",`Using write characteristic ${this.writeCharacteristic.uuid}`),this.emitAppLog("info","Enabling BLE notifications"),this.notifyCharacteristic.addEventListener("characteristicvaluechanged",this.onCharacteristicValueChanged);try{this.notificationsEnabled=!0,this.emitAppLog("info","Starting BLE notifications"),await this.notifyCharacteristic.startNotifications(),this.emitAppLog("info","BLE notifications started")}catch(r){if((r==null?void 0:r.name)==="InvalidModificationError")this.emitAppLog("warn","BLE notifications could not be enabled; continuing with write-only connection attempt",{error:String((r==null?void 0:r.message)||r)});else throw r}this.readBuffer="",this.emitAppLog("info","Bluetooth LE UART connected"),this.emitAppLog("info","Calling host onPortConnected hook"),await this.onPortConnected(),this.emitAppLog("info","Host onPortConnected hook completed"),this.updateLinkState("connected")}catch(o){if((o==null?void 0:o.name)==="NotFoundError"){this.emitAppLog("warn","Bluetooth device selection was cancelled or no device was chosen"),await this.cleanupConnectionState(),this.updateLinkState("disconnected");return}console.error("Error connecting BLE link:",o),this.emitAppLog("error","Failed to connect BLE link",{error:String((o==null?void 0:o.message)||o)}),await this.cleanupConnectionState(),this.updateLinkState("error")}finally{this.isConnecting=!1,!this.isConnected()&&this.linkState==="connecting"&&this.updateLinkState("disconnected")}}}async disconnectPort(e={}){var i;const{intentional:t=!1}=e;if(!this.device&&!this.server){this.updateLinkState("disconnected");return}try{if(this.notifyCharacteristic)try{this.notifyCharacteristic.removeEventListener("characteristicvaluechanged",this.onCharacteristicValueChanged),this.notificationsEnabled&&await this.notifyCharacteristic.stopNotifications()}catch{}this.device&&this.device.removeEventListener("gattserverdisconnected",this.onGattDisconnected),(i=this.server)!=null&&i.connected&&this.server.disconnect()}catch(o){console.error("Error disconnecting BLE link:",o),this.emitAppLog("warn","Error disconnecting BLE link")}finally{await this.cleanupConnectionState(),await this.onPortDisconnected(),t&&this.emitAppLog("info","Bluetooth LE UART disconnected"),this.updateLinkState("disconnected")}}async cleanupConnectionState(){this.notifyCharacteristic=null,this.writeCharacteristic=null,this.notificationsEnabled=!1,this.service=null,this.server=null,this.device=null,this.readBuffer=""}async writeLine(e){if(!this.writeCharacteristic)throw new Error("BLE link is not writable.");const t=String(e).replace(/[\r\n]+$/,""),i=this.encoder.encode(`${t}\r
`);this.emitAppLog("debug",`TX ${t}`),await this.writeCharacteristic.writeValue(i)}async write(e){if(!this.writeCharacteristic)throw new Error("BLE link is not writable.");const t=typeof e=="string"?this.encoder.encode(e):e;await this.writeCharacteristic.writeValue(t)}onGattDisconnected(){this.handlePortLost()}async handlePortLost(e=null){!this.device&&!this.server&&!this.notifyCharacteristic&&!this.writeCharacteristic||(e?this.emitAppLog("warn","Bluetooth LE device disconnected",{error:String((e==null?void 0:e.message)||e)}):this.emitAppLog("warn","Bluetooth LE device disconnected"),await this.cleanupConnectionState(),await this.onPortDisconnected(),this.updateLinkState("disconnected"))}onCharacteristicValueChanged(e){var o;const t=(o=e==null?void 0:e.target)==null?void 0:o.value;if(!t)return;const i=t.buffer?new Uint8Array(t.buffer,t.byteOffset,t.byteLength):t;this.pushChunk(i)}pushChunk(e){this.readBuffer+=this.decoder.decode(e,{stream:!0});const t=this.readBuffer.split(/\r?\n/);this.readBuffer=t.pop()||"";for(const i of t)this.handleIncoming(i)}handleIncoming(e){this.counter+=1,this.dispatchEvent(new CustomEvent("serial-line",{detail:{line:e,counter:this.counter},bubbles:!0,composed:!0}))}}const N=document.createElement("template");N.innerHTML=`
  <style>
    ${p}
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

    .top-bar {
        width: 90%;
        display: flex;
        flex-direction: row;
        gap: 6px;
        justify-content: left;
        margin: 6px;
        padding: 6px;
    }

  </style>

    <div class="body">
        <div class="top-bar ">
            <div class="" id="title" hidden>Title</div>
            <select class="" id="selectTestProcedure"></select>
            <select class="" id="selectPlateDiameter"></select>
        <slot></slot>
        </div>
    </div>
`;class ie extends HTMLElement{static get observedAttributes(){return["title","componentIdentifier"]}constructor(){super();const e=this.attachShadow({mode:"open"});e.append(N.content.cloneNode(!0)),this.titleElement=e.getElementById("title"),this.onLanguageChange=this.onLanguageChange.bind(this),this.componentIdentifier=this.getAttribute("componentIdentifier")||"ProcedureBar",this.selectTestProcedureElement=e.getElementById("selectTestProcedure"),this.onTestProcedureChange=this.onTestProcedureChange.bind(this),this.selectPlateDiameterElement=e.getElementById("selectPlateDiameter"),this.onPlateDiameterChange=this.onPlateDiameterChange.bind(this),this.appStore=null}setAppStore(e){if(!e||typeof e.setProcedure!="function")throw new TypeError("appStore must provide setProcedure()");this.appStore=e,this.isConnected&&!this.proceduresInitialized&&this.initTestProcedures()}connectedCallback(){document.addEventListener("new-language-selected",this.onLanguageChange),this.selectTestProcedureElement.addEventListener("change",this.onTestProcedureChange),this.selectPlateDiameterElement.addEventListener("change",this.onPlateDiameterChange),this.render()}attributeChangedCallback(){this.componentIdentifier=this.getAttribute("componentIdentifier")||"ProcedureBar",this.render()}disconnectedCallback(){document.removeEventListener("new-language-selected",this.onLanguageChange),this.selectTestProcedureElement.removeEventListener("change",this.onTestProcedureChange),this.selectPlateDiameterElement.removeEventListener("change",this.onPlateDiameterChange)}async onLanguageChange(e){const t=e==null?void 0:e.detail;typeof t=="string"||t==null||t.code;const i=t==null?void 0:t.catalog;i&&await this.applyLanguageChange(i)}async applyLanguageChange(e){var i;const t=((i=e==null?void 0:e[this.componentIdentifier])==null?void 0:i.title)||"ProcedureBar";this.titleElement.textContent=t}onTestProcedureChange(e){let t=this.selectTestProcedureElement.value;this.loadTestProcedure(t)}onPlateDiameterChange(e){console.log(e)}async initTestProcedures(){if(this.proceduresInitialized)return;this.proceduresInitialized=!0;const e="/wc/test_procedures/procedures.json";let t,i;try{t=await fetch(e),i=await t.json()}catch(n){throw this.proceduresInitialized=!1,n}let o=this.selectTestProcedureElement;for(;o.hasChildNodes();)o.removeChild(o.firstChild);let r=i.options;for(let n=0;n<r.length;n++){let s=document.createElement("option");s.text=r[n].label,s.value=r[n].fileName,i.factoryDefault==s.value&&(s.selected=!0),this.selectTestProcedureElement.add(s)}this.loadTestProcedure(i.factoryDefault)}async loadTestProcedure(e){const t=`/wc/test_procedures/${e}`,o=await(await fetch(t)).json();let r=o.plateDiameterOptions,n=this.selectPlateDiameterElement;for(;n.hasChildNodes();)n.removeChild(n.firstChild);for(let s=0;s<r.length;s++){let l=document.createElement("option");l.text=r[s],l.value=r[s],o.plateDiameter_mm==l.value&&(l.selected=!0),this.selectPlateDiameterElement.add(l)}if(!this.appStore)throw new Error("Procedure bar requires an injected appStore");this.appStore.setProcedure(o)}render(){this.titleElement.textContent=this.getAttribute("title")||"ProcedureBar"}}customElements.define("gc-procedure-bar",ie);const Z=document.createElement("template");Z.innerHTML=`
  <style>
    ${p}
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

    .control-bar {
        width: 100%;
        display: flex;
        flex-direction: row;
        gap: 2px;
        margin-bottom: 4px;
    }

    .control-button {
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
        font-size:12px;
    }

    .control-bar .control-button:first-child {
        border-top-left-radius: 6px;
        border-bottom-left-radius: 6px;
    }

    .control-bar .control-button:last-child {
        border-top-right-radius: 6px;
        border-bottom-right-radius: 6px;
    }

    .control-button.is-active {
        background-color: #2196f3 !important;
        border-color: #0f4e82;
        box-shadow: inset 0 0 0 1px #0f4e82;
    }

  </style>

    <div class="body">
        <div class="top-bar">
            <div class="" id="title" hidden>Title</div>
            <div class="w3-full">
                <div class="control-bar btn-group">
                    <button id="upButton"   class="w3-button control-button">⇑</button>
                    <button id="offButton" class="w3-button control-button is-active" >⏹︎</button>
                    <button id="downButton" class="w3-button control-button">⇓</button>
                </div>      
            </div>
        <slot></slot>
        </div>
    </div>
`;class oe extends HTMLElement{static get observedAttributes(){return["title","componentIdentifier","pumpState"]}constructor(){super();const e=this.attachShadow({mode:"closed"});e.append(Z.content.cloneNode(!0)),this.titleElement=e.getElementById("title"),this.onLanguageChange=this.onLanguageChange.bind(this),this.componentIdentifier=this.getAttribute("componentIdentifier")||"Pump",this.upButtonElement=e.getElementById("upButton"),this.onPumpUpClick=this.onPumpUpClick.bind(this),this.offButtonElement=e.getElementById("offButton"),this.onPumpOffClick=this.onPumpOffClick.bind(this),this.downButtonElement=e.getElementById("downButton"),this.onPumpDownClick=this.onPumpDownClick.bind(this),this.transportService=null}setTransportService(e){if(!e||typeof e.sendCommand!="function")throw new TypeError("transportService must provide sendCommand()");this.transportService=e}connectedCallback(){document.addEventListener("app-language-change",this.onLanguageChange),this.upButtonElement.addEventListener("click",this.onPumpUpClick),this.offButtonElement.addEventListener("click",this.onPumpOffClick),this.downButtonElement.addEventListener("click",this.onPumpDownClick),this.pState=0,this.pumpState=this.getAttribute("pumpState")||"0",this.render()}disconnectedCallback(){document.removeEventListener("app-language-change",this.onLanguageChange),this.upButtonElement.removeEventListener("click",this.onPumpUpClick),this.offButtonElement.removeEventListener("click",this.onPumpOffClick),this.downButtonElement.removeEventListener("click",this.onPumpDownClick)}attributeChangedCallback(){console.log("Attr changed"),this.componentIdentifier=this.getAttribute("componentIdentifier")||"Pump",this.render()}get pumpState(){return this.pState}set pumpState(e){e!=this.pState&&(console.log("SetPumpState "+e),this.pState=e,this.updatePumpState(this.pState))}updatePumpState(e){this.downButtonElement.classList.remove("is-active"),this.offButtonElement.classList.remove("is-active"),this.upButtonElement.classList.remove("is-active"),e===0&&this.offButtonElement.classList.add("is-active"),e===1&&this.upButtonElement.classList.add("is-active"),e===2&&this.downButtonElement.classList.add("is-active")}async onLanguageChange(e){const t=e==null?void 0:e.detail;typeof t=="string"||t==null||t.code;const i=t==null?void 0:t.catalog;i&&await this.applyLanguageChange(i)}async applyLanguageChange(e){var i;const t=((i=e==null?void 0:e[this.componentIdentifier])==null?void 0:i.title)||"Pump";this.titleElement.textContent=t}onPumpUpClick(e){this.sendCmd("pump=up")}onPumpOffClick(e){this.sendCmd("pump=off")}onPumpDownClick(e){this.sendCmd("pump=down")}render(){this.titleElement.textContent=this.getAttribute("title")||"Pump"}sendCmd(e){var t;return((t=this.transportService)==null?void 0:t.sendCommand(e))||!1}}customElements.define("gc-pump-control",oe);const c=Object.freeze({IDLE:0,WAIT_FOR_TARGET_PRESSURE:1,EVALUATE_Z_SPEED:2,EVALUATION_PASSED:3,EVALUATION_FAILED:4,TEST_COMPLETED:5});class re extends EventTarget{constructor({now:e=()=>Date.now()}={}){super(),this.now=e,this.phase=c.IDLE,this.procedure=null,this.steps=[],this.stepIndex=-1,this.procedureRunning=!1,this.velocity=0,this.targetPressureReached=!1,this.secondsElapsed=0,this.secondsPause=0,this.nextStateMachineUpdate=this.now()+1e3,this.testResult=this.createEmptyMeasurement()}setProcedure(e){this.procedure=e}start(){if(this.procedureRunning||this.phase!==c.IDLE)throw new Error("A test is already running");this.steps=this.normalizeSteps(this.procedure),this.stepIndex=-1,this.procedureRunning=!0,this.startNextStep()}stop(){this.procedureRunning=!1,this.steps=[],this.stepIndex=-1,this.phase=c.IDLE,this.secondsPause=0,this.targetPressureReached=!1,this.requestCommand("pump=off"),this.emitStatus("TEST STOPPED")}recordFastMeasurement({pressure:e,force:t,distance:i,velocity:o}){Number.isFinite(o)&&(this.velocity=o),this.phase===c.EVALUATE_Z_SPEED&&e>this.testResult.pressure&&(this.testResult.pressure=e),this.update()}recordTargetRequested(e){Number.isFinite(e)&&(this.testResult.targetPressure=e,this.testResult.dt=0,this.phase=c.WAIT_FOR_TARGET_PRESSURE,this.emit("target-requested",{targetPressure:e}),this.update())}recordTargetReached({targetPressure:e,pressure:t,force:i,distance:o}){Number.isFinite(e)&&(this.testResult.targetPressure=e,this.testResult.pressure=t,this.testResult.force=i,this.testResult.distance=o,this.targetPressureReached=!0,this.emit("target-reached",{targetPressure:e,pressure:t,force:i,distance:o}),this.update())}update(){if(!(this.now()<this.nextStateMachineUpdate)){if(this.nextStateMachineUpdate=this.now()+1e3,this.secondsPause>0){this.secondsPause--;return}switch(this.phase){case c.WAIT_FOR_TARGET_PRESSURE:this.targetPressureReached&&(this.phase=c.EVALUATE_Z_SPEED,this.testResult.hhmmss=new Date().toLocaleTimeString("en-GB"),this.secondsElapsed=0,this.secondsPause=1,this.emitStatus("TARGET PRESSURE REACHED"));break;case c.EVALUATE_Z_SPEED:this.testResult.velocity=this.velocity,this.testResult.dt=this.secondsElapsed,this.emitStatus(`EVAL v = ${this.velocity.toFixed(3)} mm/min [${this.secondsElapsed}/${this.testResult.tMax}]`),Math.abs(this.velocity)<=this.testResult.vMax&&(this.phase=c.EVALUATION_PASSED),this.secondsElapsed>=this.testResult.tMax&&(this.phase=c.EVALUATION_FAILED),this.secondsElapsed++;break;case c.EVALUATION_PASSED:this.completeMeasurement(!0);break;case c.EVALUATION_FAILED:this.completeMeasurement(!1);break;case c.TEST_COMPLETED:this.phase=c.IDLE,this.targetPressureReached=!1,this.procedureRunning?this.startNextStep():(this.secondsPause=2,this.emitStatus("TEST COMPLETED"));break}}}normalizeSteps(e){const i=(Array.isArray(e==null?void 0:e.content)?e.content:[]).map((o,r)=>{const n=this.parseNumber(o.targetPressure),s=this.parseNumber(o.vMax),l=this.parseNumber(o.tMax);if(n===null||s===null||l===null||l<0)throw new Error(`Invalid values in procedure step ${o.step??r}`);return{...o,targetPressure:n,vMax:s,tMax:l}});if(i.length===0)throw new Error("The procedure contains no measurement steps");return i}startNextStep(){if(this.stepIndex++,this.stepIndex>=this.steps.length){this.procedureRunning=!1,this.emitStatus("TEST PROCEDURE COMPLETED"),this.emit("procedure-complete");return}const e=this.steps[this.stepIndex];this.secondsElapsed=0,this.secondsPause=0,this.targetPressureReached=!1,this.testResult={nr:e.step??this.stepIndex,name:e.phase||`Step ${this.stepIndex+1}`,targetPressure:e.targetPressure,pressure:0,force:0,distance:0,velocity:0,vMax:e.vMax,dt:0,tMax:e.tMax,hhmmss:"00:00:00",passed:!1},this.emit("step-started",{step:this.testResult,stepIndex:this.stepIndex,stepCount:this.steps.length}),this.emitStatus(`STEP ${this.stepIndex+1}/${this.steps.length}: REQUEST ${e.targetPressure} kPa`),this.requestCommand(`pump:target=${e.targetPressure}`)||(this.procedureRunning=!1,this.emitStatus("TEST STOPPED: COMMAND COULD NOT BE SENT"),this.emit("procedure-complete"))}completeMeasurement(e){this.testResult.velocity=this.velocity,this.testResult.dt=this.secondsElapsed,this.testResult.passed=e;const t=e?"<":">",i=e?"PASS":"FAIL";this.emit("measurement-complete",{measurement:structuredClone(this.testResult)}),this.emitStatus(`${i} ${this.velocity.toFixed(3)} ${t} ${this.testResult.vMax} mm/min after ${this.secondsElapsed} s`),this.phase=c.TEST_COMPLETED,this.secondsPause=4,e&&this.stepIndex===1&&(this.requestCommand(`distance=zero\r
`),this.emit("distance-reset-requested"))}requestCommand(e){const t={command:e,accepted:!1};return this.emit("command-requested",t),t.accepted}emitStatus(e){this.emit("status",{message:e})}emit(e,t={}){this.dispatchEvent(new CustomEvent(e,{detail:t}))}createEmptyMeasurement(){return{nr:1,name:"Forbelastning",targetPressure:0,pressure:0,force:0,distance:0,velocity:0,vMax:.02,dt:0,tMax:60,hhmmss:"00:00:00",passed:!1}}parseNumber(e){const t=Number.parseFloat(e);return Number.isFinite(t)?t:null}}class f extends EventTarget{constructor({transports:e={}}={}){super(),this.transports=new Map,this.listeners=new Map,Object.entries(e).forEach(([t,i])=>this.register(t,i))}register(e,t){if(!t||typeof t.addEventListener!="function")throw new TypeError(`Transport ${e} must be an EventTarget`);if(this.transports.has(e))throw new Error(`Transport ${e} is already registered`);const i=r=>n=>{this.dispatchEvent(new CustomEvent(r,{detail:{transport:e,...n.detail}}))},o={"app-log":i("app-log"),"port-status-change":i("port-status-change"),"serial-line":i("serial-line")};Object.entries(o).forEach(([r,n])=>t.addEventListener(r,n)),this.transports.set(e,t),this.listeners.set(e,o)}start(){this.transports.forEach(e=>{var t;return(t=e.startMonitoring)==null?void 0:t.call(e)})}stop({disconnect:e=!0}={}){this.transports.forEach(t=>{var i,o;(i=t.stopMonitoring)==null||i.call(t),e&&((o=t.disconnectPort)==null||o.call(t,{intentional:!0}))})}enableAutoConnect(e){var t,i;(i=(t=this.getTransport(e)).enableAutoConnect)==null||i.call(t)}connect(e){return this.getTransport(e).connectPort()}disconnect(e){return this.getTransport(e).disconnectPort({intentional:!0})}getStatus(e){return this.getTransport(e).getPortStatus()}sendCommand(e,{target:t="auto"}={}){const i=typeof e=="string"?e.trim():"";if(!i)return!1;const r=this.resolveTargets(t).filter(n=>this.getStatus(n).state==="connected");return r.length===0?!1:(r.forEach(n=>{this.getTransport(n).writeLine(i).catch(s=>{this.dispatchEvent(new CustomEvent("app-log",{detail:{transport:n,level:"error",source:"TransportService",message:`Failed to send command over ${n.toUpperCase()}`,command:i,error:String((s==null?void 0:s.message)||s)}}))})}),!0)}resolveTargets(e){const t=String(e||"auto").trim().toLowerCase();if(t==="all"||t==="any"||t==="both")return[...this.transports.keys()];if(this.transports.has(t))return[t];const i=[...this.transports.keys()].find(o=>this.getStatus(o).state==="connected");return i?[i]:[]}getTransport(e){const t=this.transports.get(e);if(!t)throw new Error(`Unknown transport: ${e}`);return t}}const V=document.createElement("template");V.innerHTML=`
  <style>
    ${p}
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
 
    #realtimeUpdates {
        --row-height: 56px;
        font-size: 36px;
        font-weight: bold;
    }

    #realtimeUpdates li {
        height: var(--row-height);
        min-height: var(--row-height);
        display: flex;
        align-items: center;            
    }

    #realtimeUpdates li:empty::before {
        content: "\\00a0";
    }

.realtime-controls {
  width: 100%;
  display: flex;
  align-items: stretch;
  justify-content: center;
}

.top-bar {
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 12px;
  justify-content: left;
  margin: 6px;
}

.control-bar {
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 2px;
  margin-bottom: 4px;
}

.control-button {
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
  font-size:12px;
}

.control-bar .control-button:first-child {
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
}

.control-bar .control-button:last-child {
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
}

.control-button.is-active {
  background-color: #2196f3 !important;
  border-color: #0f4e82;
  box-shadow: inset 0 0 0 1px #0f4e82;
}

       
</style>
   
  <div class="w3-container w3-margin-bottom">
    <div class="body">
        <h2 id="title" class="w3-center w3-text-blue w3-medium w3-left">Table</h2>
        <div class="w3-container w3-padding">
        <gc-realtime id="targetPressure" label="Target Pressure" value=0.0 unit="kPa" decimals=1 componentIdentifier="targetPressure"></gc-realtime>
        <gc-realtime id="pressure" label="Pressure" value=0.0 unit="kPa" decimals=1 componentIdentifier="pressure"></gc-realtime>
        <gc-realtime id="force" label="Force" value=0.0 unit="kN" decimals=2 componentIdentifier="force"></gc-realtime>
        <gc-realtime id="distance" label="Distance" value=0.000 unit="mm" decimals=3 componentIdentifier="distance"></gc-realtime>
        <gc-realtime id="velocity" label="Velocity" value=0.000 unit="mm/min" decimals=3 componentIdentifier="velocity"></gc-realtime>
        <div id="message" style="font-size:16px;"></div>
         
            <ul id="realtimeUpdates" class="w3-ul">
                <li><input id="targetPressureField" type="number" class="w3-input w3-medium"></input></li>
            </ul>
            <div class="realtime-controls">
                <div class="control-bar btn-group">
                    <button id="startTestBtn" class="w3-button control-button">START<br>TEST</button>
                    <button id="tareBtn"      class="w3-button control-button">TARE</button>
                    <button id="stopTestBtn"  class="w3-button control-button">STOP<br>TEST</button>
                </div>      
            </div>
            <gc-pump-control id= "pumpControl"></gc-pump-control>
            <slot></slot>
        </div>        
    </div>
  </div>
`;class ne extends HTMLElement{static get observedAttributes(){return["title","componentIdentifier"]}constructor(){super();const e=this.attachShadow({mode:"open"});e.append(V.content.cloneNode(!0)),this.titleElement=e.getElementById("title"),this.componentIdentifier=this.getAttribute("componentIdentifier")||"DataUnit",this.onLanguageChange=this.onLanguageChange.bind(this),this.usbButton=null,this.onTransportLog=this.onTransportLog.bind(this),this.onTransportStatus=this.onTransportStatus.bind(this),this.onTransportSerialLine=this.onTransportSerialLine.bind(this),this.toggleUsbConnection=this.toggleUsbConnection.bind(this),this.bleButton=null,this.batteryIcon=null,this.toggleBleConnection=this.toggleBleConnection.bind(this),this.transportService=null,this.transportInitialized=!1,this.appStore=null,this.onProcedureStoreChange=this.onProcedureStoreChange.bind(this),this.message=e.getElementById("message"),this.startTestButton=e.getElementById("startTestBtn"),this.stopTestButton=e.getElementById("stopTestBtn"),this.onStartTest=this.onStartTest.bind(this),this.onStopTest=this.onStopTest.bind(this),this.procedureController=new re,this.onProcedureCommandRequested=this.onProcedureCommandRequested.bind(this),this.onProcedureStatus=this.onProcedureStatus.bind(this),this.onProcedureStepStarted=this.onProcedureStepStarted.bind(this),this.onProcedureTargetRequested=this.onProcedureTargetRequested.bind(this),this.onProcedureMeasurementComplete=this.onProcedureMeasurementComplete.bind(this),this.onProcedureComplete=this.onProcedureComplete.bind(this),this.onDistanceResetRequested=this.onDistanceResetRequested.bind(this);const t=20,i={};i.z=0,i.t=0,this.history=new Array(t).fill(i),this.velocity=0,this.targetPressureElement=e.getElementById("targetPressure"),this.pressureElement=e.getElementById("pressure"),this.forceElement=e.getElementById("force"),this.distanceElement=e.getElementById("distance"),this.velocityElement=e.getElementById("velocity"),this.pumpControlElement=e.getElementById("pumpControl"),this.targetPressureField=e.getElementById("targetPressureField"),this.targetPressureField.addEventListener("change",o=>{this.targetPressure=this.targetPressureField.value;let r=`pump:target=${this.targetPressure}`;this.sendCmd(r),this.message.textContent=`REQUEST ${this.targetPressure} kPa`})}setTransportService(e){if(!(e instanceof f))throw new TypeError("transportService must be a TransportService");if(this.transportInitialized)throw new Error("TransportService cannot be replaced after initialization");this.transportService=e,this.pumpControlElement.setTransportService(e)}setConnectionControls({usbButton:e=null,bleButton:t=null,batteryIcon:i=null}={}){var o,r,n,s;(o=this.usbButton)==null||o.removeEventListener("click",this.toggleUsbConnection),(r=this.bleButton)==null||r.removeEventListener("click",this.toggleBleConnection),this.usbButton=e,this.bleButton=t,this.batteryIcon=i,this.isConnected&&((n=this.usbButton)==null||n.addEventListener("click",this.toggleUsbConnection),(s=this.bleButton)==null||s.addEventListener("click",this.toggleBleConnection))}setAppStore(e){if(!e||typeof e.getProcedure!="function")throw new TypeError("appStore must provide getProcedure()");this.appStore=e,this.isConnected&&(this.appStore.addEventListener("procedure-changed",this.onProcedureStoreChange),this.syncProcedureFromStore())}connectedCallback(){var e,t,i;document.addEventListener("new-language-selected",this.onLanguageChange),(e=this.appStore)==null||e.addEventListener("procedure-changed",this.onProcedureStoreChange),this.syncProcedureFromStore(),this.startTestButton.addEventListener("click",this.onStartTest),this.stopTestButton.addEventListener("click",this.onStopTest),this.procedureController.addEventListener("command-requested",this.onProcedureCommandRequested),this.procedureController.addEventListener("status",this.onProcedureStatus),this.procedureController.addEventListener("step-started",this.onProcedureStepStarted),this.procedureController.addEventListener("target-requested",this.onProcedureTargetRequested),this.procedureController.addEventListener("measurement-complete",this.onProcedureMeasurementComplete),this.procedureController.addEventListener("procedure-complete",this.onProcedureComplete),this.procedureController.addEventListener("distance-reset-requested",this.onDistanceResetRequested),(t=this.usbButton)==null||t.addEventListener("click",this.toggleUsbConnection),(i=this.bleButton)==null||i.addEventListener("click",this.toggleBleConnection),queueMicrotask(()=>this.initializeTransportService()),this.targetPressure=0,this.render()}disconnectedCallback(){var e,t,i;document.removeEventListener("new-language-selected",this.onLanguageChange),(e=this.appStore)==null||e.removeEventListener("procedure-changed",this.onProcedureStoreChange),this.startTestButton.removeEventListener("click",this.onStartTest),this.stopTestButton.removeEventListener("click",this.onStopTest),this.procedureController.removeEventListener("command-requested",this.onProcedureCommandRequested),this.procedureController.removeEventListener("status",this.onProcedureStatus),this.procedureController.removeEventListener("step-started",this.onProcedureStepStarted),this.procedureController.removeEventListener("target-requested",this.onProcedureTargetRequested),this.procedureController.removeEventListener("measurement-complete",this.onProcedureMeasurementComplete),this.procedureController.removeEventListener("procedure-complete",this.onProcedureComplete),this.procedureController.removeEventListener("distance-reset-requested",this.onDistanceResetRequested),(t=this.usbButton)==null||t.removeEventListener("click",this.toggleUsbConnection),(i=this.bleButton)==null||i.removeEventListener("click",this.toggleBleConnection),this.transportInitialized&&(this.transportService.removeEventListener("app-log",this.onTransportLog),this.transportService.removeEventListener("port-status-change",this.onTransportStatus),this.transportService.removeEventListener("serial-line",this.onTransportSerialLine),this.transportService.stop(),this.transportInitialized=!1)}initializeTransportService(){if(!(!this.isConnected||this.transportInitialized)){if(!this.transportService){const e=new T({componentIdentifier:this.componentIdentifier,storageScope:this.id||this.componentIdentifier||"default"}),t=new P({componentIdentifier:this.componentIdentifier,serviceUuid:"6e400001-b5a3-f393-e0a9-e50e24dcca9e"});this.transportService=new f({transports:{usb:e,ble:t}}),this.pumpControlElement.setTransportService(this.transportService)}this.transportService.addEventListener("app-log",this.onTransportLog),this.transportService.addEventListener("port-status-change",this.onTransportStatus),this.transportService.addEventListener("serial-line",this.onTransportSerialLine),this.transportService.start(),this.transportService.enableAutoConnect("usb"),this.transportInitialized=!0}}setBatteryState(e,t){const i=this.batteryIcon;i&&(i.classList.remove("fa-battery-0"),i.classList.remove("fa-battery-1"),i.classList.remove("fa-battery-2"),i.classList.remove("fa-battery-3"),i.classList.add(`fa-battery-${t}`),i.title=`Batt ${e} V`)}toggleUsbConnection(){this.transportService.getStatus("usb").state==="connected"?this.transportService.disconnect("usb"):this.transportService.connect("usb")}toggleBleConnection(){this.transportService.getStatus("ble").state==="connected"?this.transportService.disconnect("ble"):this.transportService.connect("ble")}getJsObject(e,t){const i=String(e||"").trim().split(",");var o="{",r=0;for(let n=0;n<i.length;n++){const s=i[n];let l=s.indexOf(":"),h=s,d="";if(l!=-1){h=s.substring(0,l),d=s.substring(l+1);let u=`"${h}": ${d}`;if(r==0?o+=u:o+=","+u,r++,t){let m=this.shadowRoot.getElementById(h);m!=null&&(m.textContent=d)}}}o+="}";try{return JSON.parse(o)}catch{return null}}addNewDistanceToHistory(e){let t=this.history.length;for(let n=t-1;n>0;n--)this.history[n]=this.history[n-1];const i={};i.z=e,i.t=Date.now(),this.history[0]=i;let o=this.history[0].z-this.history[t-1].z,r=this.history[0].t-this.history[t-1].t;return r>0&&(this.velocity=6e4*o/r),this.velocity=Math.round(this.velocity*1e3)/1e3,this.velocity}processIncomingLine(e){let t=String(e);if(t.startsWith("$F,")){let i=this.getJsObject(e,!1);if(i===null)return;let o=i.p/100,r=i.f/100,n=i.z/1e3;this.pressureElement.value=o,this.forceElement.value=r,this.distanceElement.value=n,Date.now()-this.history[0].t>=500&&(this.velocityElement.value=this.addNewDistanceToHistory(n)),this.pumpControlElement.pumpState=i.h,this.procedureController.recordFastMeasurement({pressure:o,force:r,distance:n,velocity:this.velocity})}else if(t.startsWith("$GC_BATT,")){let i=this.getJsObject(e,!0);if(i==null)return;this.setBatteryState(i.voltage,i.level)}else if(t.startsWith("$REQUESTED,target")){let i=this.getJsObject(e,!0);if(i==null)return;this.targetPressureElement.value=i.target,this.procedureController.recordTargetRequested(i.target)}else if(t.startsWith("$REACHED,target")){let i=this.getJsObject(e,!0);if(i==null)return;this.targetPressureElement.value=i.target,this.procedureController.recordTargetReached({targetPressure:i.target,pressure:i.p,force:i.f,distance:i.z})}}attributeChangedCallback(){var e,t,i;this.componentIdentifier=this.getAttribute("componentIdentifier")||"DataUnit",(i=(e=this.transportService)==null?void 0:(t=e.getTransport("usb")).configure)==null||i.call(t,{componentIdentifier:this.componentIdentifier,storageScope:this.id||this.componentIdentifier||"default"}),this.render()}onProcedureStoreChange(e){this.procedureController.setProcedure(e.detail.procedure)}syncProcedureFromStore(){var t;const e=(t=this.appStore)==null?void 0:t.getProcedure();e&&this.procedureController.setProcedure(e)}async onStartTest(){this.startTestButton.disabled=!0;try{if(!this.procedureController.procedure){const t=await fetch("/wc/test_procedures/R211_2.2.4.json");if(!t.ok)throw new Error(`Unable to load procedure (${t.status})`);this.procedureController.setProcedure(await t.json())}this.procedureController.start()}catch(e){this.startTestButton.disabled=!1,this.message.textContent=`TEST START FAILED: ${e.message}`,this.emitAppLog("error",e.message)}}onStopTest(){this.procedureController.stop(),this.startTestButton.disabled=!1}onProcedureCommandRequested(e){e.detail.accepted=this.sendCmd(e.detail.command)}onProcedureStatus(e){this.message.textContent=e.detail.message}onProcedureStepStarted(e){this.targetPressure=e.detail.step.targetPressure,this.targetPressureField.value=e.detail.step.targetPressure}onProcedureTargetRequested(e){this.targetPressureField.value=e.detail.targetPressure}onProcedureMeasurementComplete(e){var t;if(!((t=this.appStore)!=null&&t.addMeasurement))throw new Error("Data unit requires an appStore to record measurements");this.appStore.addMeasurement(e.detail.measurement)}onProcedureComplete(){this.startTestButton.disabled=!1}onDistanceResetRequested(){const e={z:0,t:0};this.history.fill(e)}onTransportLog(e){const t=(e==null?void 0:e.detail)||{},i=t.level||"info",o=t.source||t.transport||"Transport",r=t.message||"(no message)";this.emitAppLog(i,`[${o}] ${r}`)}onTransportStatus(e){var r,n;const t=(r=e==null?void 0:e.detail)==null?void 0:r.transport,i=(n=e==null?void 0:e.detail)==null?void 0:n.state,o=t==="usb"?this.usbButton:t==="ble"?this.bleButton:null;!o||!i||(o.style.color=i==="connected"?"green":"black",i==="connected"&&this.sendCmd("du:batt?",{target:t}))}sendCmd(e,t={}){return this.transportService.sendCommand(e,t)}onTransportSerialLine(e){var i;const t=(i=e==null?void 0:e.detail)==null?void 0:i.line;if(typeof t=="string"){const o=t.trim();o.startsWith("$")?this.processIncomingLine(o):this.emitAppLog("debug",`RX line: ${o}`)}}async onLanguageChange(e){var o;const t=e==null?void 0:e.detail;typeof t=="string"||t==null||t.code;const i=t==null?void 0:t.catalog;if(i){if(this.titleElement!=null){const s=((o=i==null?void 0:i[this.componentIdentifier])==null?void 0:o.title)||"Data Unit";this.titleElement.textContent=s}let r=[this.targetPressureElement,this.pressureElement,this.forceElement,this.distanceElement,this.velocityElement],n=i==null?void 0:i[this.componentIdentifier].properties;for(let s=0;s<n.length;s++){let l=n[s];r.forEach(h=>{h.componentIdentifier===l.key&&h.updateComponent(l)})}}}addTrace(e,t){let i="debug";e==="ERR"&&(i="error"),this.emitAppLog(i,`${e}: ${t}`)}emitAppLog(e,t,i={}){this.dispatchEvent(new CustomEvent("app-log",{detail:{level:e,source:this.id||this.tagName.toLowerCase(),message:t,...i},bubbles:!0,composed:!0}))}render(){this.titleElement!=null&&(this.titleElement.textContent=this.getAttribute("title")||"DU")}parseNumber(e){const t=Number.parseFloat(e);return Number.isFinite(t)?t:null}formatMetric(e,t,i){return e==null?i:e.toFixed(t)}}customElements.define("gc-dataunit",ne);const F=document.createElement("template");F.innerHTML=`
  <style>
    ${p}
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

    <div class="w3-container w3-margin-bottom">
        <div class="body">
            <h2 id="title" class="w3-center w3-text-blue w3-medium w3-left">Graph</h2>
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
`;class se extends HTMLElement{static get observedAttributes(){return["title","componentIdentifier"]}constructor(){super();const e=this.attachShadow({mode:"open"});e.append(F.content.cloneNode(!0)),this.titleElement=e.getElementById("title"),this.onLanguageChange=this.onLanguageChange.bind(this),this.componentIdentifier=this.getAttribute("componentIdentifier")||"MeasurementGraph"}connectedCallback(){document.addEventListener("new-language-selected",this.onLanguageChange);let e=this.componentIdentifier;document.addEventListener(e+"-add-row",this.onAddRow.bind(this)),this.render()}attributeChangedCallback(){this.componentIdentifier=this.getAttribute("componentIdentifier")||"MeasurementGraph",this.render()}disconnectedCallback(){document.removeEventListener("new-language-selected",this.onLanguageChange);let e=this.componentIdentifier;document.removeEventListener(e+"-add-row",this.onAddRow.bind(this))}async onAddRow(e){const t=e==null?void 0:e.detail;t&&Array.isArray(t.rowData)&&this.appendRowToTable(t.rowData)}async onLanguageChange(e){const t=e==null?void 0:e.detail;typeof t=="string"||t==null||t.code;const i=t==null?void 0:t.catalog;i&&await this.applyLanguageChange(i)}async applyLanguageChange(e){var r,n;const t=((r=e==null?void 0:e[this.componentIdentifier])==null?void 0:r.title)||"Graph";this.titleElement.textContent=t;const i=this.getMeasurementTableHeader(e);i&&this.setTableHeaderWithUnits(i);const o=((n=e==null?void 0:e[this.componentIdentifier])==null?void 0:n.blankRows)||5;this.getRowCount()!=o&&this.initBlankLines(o-this.getRowCount())}initBlankLines(e){const t=this.shadowRoot.getElementById("tableHeaderRow").children.length;for(let i=0;i<e;i++)this.appendRowToTable(new Array(t).fill(""))}getMeasurementTableHeader(e){var i;const t=(i=e==null?void 0:e[this.componentIdentifier])==null?void 0:i.tableHeader;return!t||typeof t!="object"?null:Array.isArray(t)?t:Object.values(t)}addTrace(e,t){let i="debug";e==="ERR"&&(i="error"),this.emitAppLog(i,`${e}: ${t}`)}render(){this.titleElement.textContent=this.getAttribute("title")||"Graph"}setTableHeader(e){const t=this.shadowRoot.getElementById("tableHeaderRow");t.innerHTML="",e.forEach(i=>{const o=document.createElement("th");o.textContent=i,t.appendChild(o)})}setTableHeaderWithUnits(e){const t=this.shadowRoot.getElementById("tableHeaderRow");t.innerHTML="",e.forEach(i=>{const o=document.createElement("th");(i.label===void 0||i.label===null)&&(i.label="????"),i.unit!==null&&i.unit!==void 0?o.innerHTML=i.label+"<br>["+i.unit+"]":o.textContent=i.label,i.tooltip!==void 0&&i.tooltip!==null&&i.tooltip!==""&&(o.title=i.tooltip),t.appendChild(o)})}appendRowToTable(e){const t=this.shadowRoot.getElementById("tableBody"),i=document.createElement("tr");e.forEach(o=>{const r=document.createElement("td");r.textContent=o,i.appendChild(r)}),t.appendChild(i)}getRowCount(){return this.shadowRoot.getElementById("tableBody").rows.length}removeRowFromTable(e){const t=this.shadowRoot.getElementById("tableBody");e>=0&&e<t.rows.length&&t.deleteRow(e)}removeAllRowsFromTable(){const e=this.shadowRoot.getElementById("tableBody");e.innerHTML="",this.render()}parseNumber(e){const t=Number.parseFloat(e);return Number.isFinite(t)?t:null}formatMetric(e,t,i){return e==null?i:e.toFixed(t)}}customElements.define("gc-graph",se);function b(a){return structuredClone(a)}class ae extends EventTarget{constructor({surveyModelUrl:e="/wc/data/SurveyModel.json",appStore:t=null}={}){super(),this.surveyModelUrl=e,this.appStore=t,this.surveyModel=null,this.activeJobIndex=-1}async loadSurveyModel(e=this.surveyModelUrl){const t=await fetch(e);if(!t.ok)throw new Error(`Unable to load survey model (${t.status})`);const i=await t.json();return this.validateSurveyModel(i),this.surveyModel=i,i.jobs.length>0&&this.setActiveJob(0),this.emitChange("survey-loaded"),this.getSurveyModel()}validateSurveyModel(e){if(!e||typeof e!="object"||Array.isArray(e))throw new Error("Survey model must be a JSON object");if(!Array.isArray(e.jobs))throw new Error("Survey model must contain a jobs array");e.jobs.forEach((t,i)=>{if(!t||typeof t!="object"||Array.isArray(t))throw new Error(`Job ${i} must be an object`);if(!Array.isArray(t.measurements))throw new Error(`Job ${i} must contain a measurements array`)})}setActiveJob(e){var t;if(this.assertSurveyLoaded(),!Number.isInteger(e)||e<0||e>=this.surveyModel.jobs.length)throw new RangeError(`Job index ${e} is out of range`);return this.activeJobIndex=e,(t=this.appStore)==null||t.setActiveJob(e,this.surveyModel.jobs[e]),this.emitChange("active-job-changed"),this.getActiveJob()}getSurveyModel(){return this.assertSurveyLoaded(),b(this.surveyModel)}getActiveJob(){return this.assertSurveyLoaded(),this.activeJobIndex<0?null:b(this.surveyModel.jobs[this.activeJobIndex])}addMeasurement(e){if(this.assertSurveyLoaded(),!e||typeof e!="object"||Array.isArray(e))throw new TypeError("Measurement must be an object");const t=this.surveyModel.jobs[this.activeJobIndex];if(!t)throw new Error("Select an active job before adding a measurement");const i=b(e),o=this.getMeasurementKey(i),r=t.measurements.findIndex(n=>this.getMeasurementKey(n)===o);return r>=0?t.measurements[r]=i:t.measurements.push(i),this.emitChange("measurement-saved",{measurement:i}),b(i)}getMeasurementKey(e){return(e==null?void 0:e.step)??(e==null?void 0:e.nr)}exportSurveyModel(){return this.assertSurveyLoaded(),JSON.stringify(this.surveyModel,null,2)}assertSurveyLoaded(){if(!this.surveyModel)throw new Error("Load the survey model before accessing survey data")}emitChange(e,t={}){this.dispatchEvent(new CustomEvent("survey-state-change",{detail:{type:e,activeJobIndex:this.activeJobIndex,...t}}))}}class le extends EventTarget{constructor(){super(),this.procedure=null,this.measurements=[],this.activeJobIndex=-1,this.activeJob=null,this.language=null}setProcedure(e){if(!e||typeof e!="object"||Array.isArray(e))throw new TypeError("Procedure must be an object");this.procedure=structuredClone(e),this.dispatchEvent(new CustomEvent("procedure-changed",{detail:{procedure:this.getProcedure()}}))}getProcedure(){return this.procedure?structuredClone(this.procedure):null}setActiveJob(e,t){if(!Number.isInteger(e)||e<0)throw new RangeError("Active job index must be a non-negative integer");if(!t||typeof t!="object"||Array.isArray(t))throw new TypeError("Active job must be an object");this.activeJobIndex=e,this.activeJob=structuredClone(t),this.measurements=structuredClone(t.measurements||[]),this.dispatchEvent(new CustomEvent("active-job-changed",{detail:{index:e,job:this.getActiveJob()}})),this.dispatchEvent(new CustomEvent("measurements-replaced",{detail:{measurements:this.getMeasurements()}}))}getActiveJob(){return this.activeJob?structuredClone(this.activeJob):null}setLanguage(e,t){const i=String(e||"").trim().slice(0,2).toLowerCase();if(!i||!t||typeof t!="object"||Array.isArray(t))throw new TypeError("Language requires a code and catalog object");this.language={code:i,catalog:structuredClone(t)},this.dispatchEvent(new CustomEvent("language-changed",{detail:this.getLanguage()}))}getLanguage(){return this.language?structuredClone(this.language):null}addMeasurement(e){if(!e||typeof e!="object"||Array.isArray(e))throw new TypeError("Measurement must be an object");const t=structuredClone(e),i=this.getMeasurementKey(t),o=this.measurements.findIndex(r=>this.getMeasurementKey(r)===i);o>=0?this.measurements[o]=t:this.measurements.push(t),this.activeJob&&(this.activeJob.measurements=structuredClone(this.measurements)),this.dispatchEvent(new CustomEvent("measurement-recorded",{detail:{measurement:structuredClone(t)}}))}getMeasurements(){return structuredClone(this.measurements)}getMeasurementKey(e){return(e==null?void 0:e.step)??(e==null?void 0:e.nr)}}const g=new le,j=new ae({appStore:g}),de=new f({transports:{usb:new T({componentIdentifier:"DataUnit",storageScope:"DataUnit"}),ble:new P({componentIdentifier:"DataUnit",serviceUuid:"6e400001-b5a3-f393-e0a9-e50e24dcca9e"})}}),C=document.getElementById("DataUnit");C&&(C.setTransportService(de),C.setConnectionControls({usbButton:document.getElementById("usbButton"),bleButton:document.getElementById("bleButton"),batteryIcon:document.getElementById("batteryIcon")}),C.setAppStore(g));const E=document.getElementById("JobPlanner");E&&E.setAppStore(g);const x=document.getElementById("SettingsPage");x&&x.setAppStore(g);const S=document.getElementById("MeasurementTable");S&&S.setAppStore(g);const ce=j.loadSurveyModel().catch(a=>{throw console.error("Failed to initialize the survey model:",a),a});g.addEventListener("measurement-recorded",async a=>{try{await ce,j.addMeasurement(a.detail.measurement)}catch(e){console.error("Failed to save test measurement:",e)}});
