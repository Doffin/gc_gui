(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))i(o);new MutationObserver(o=>{for(const n of o)if(n.type==="childList")for(const r of n.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function e(o){const n={};return o.integrity&&(n.integrity=o.integrity),o.referrerPolicy&&(n.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?n.credentials="include":o.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(o){if(o.ep)return;o.ep=!0;const n=e(o);fetch(o.href,n)}})();class F extends HTMLElement{constructor(){super(),this.maxEntries=Number.parseInt(this.getAttribute("max-entries")||"100",10),this.entries=[],this.bufferedEntries=[],this.isFrozen=!1,this.activeLevels=new Set(["debug","info","warn","error"]),this.filtersLoaded=!1,this.onLogEvent=this.onLogEvent.bind(this),this.renderFrameId=null,this.hasPendingRender=!1,this.fullRenderRequested=!1,this.pendingEntries=[],this.pendingRemovedVisibleCount=0,this.displayedEntries=[];const t=this.attachShadow({mode:"open"});t.innerHTML=`
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
    `,this.logListEl=t.getElementById("logList"),this.counterEl=t.getElementById("counter"),this.clearButtonEl=t.getElementById("clearButton"),this.freezeButtonEl=t.getElementById("freezeButton"),this.filterButtons=Array.from(t.querySelectorAll(".filter-btn")),this.clearButtonEl.addEventListener("click",()=>{this.entries=[],this.bufferedEntries=[],this.pendingEntries=[],this.pendingRemovedVisibleCount=0,this.displayedEntries=[],this.requestRender(!0)}),this.freezeButtonEl.addEventListener("click",()=>{this.isFrozen=!this.isFrozen,!this.isFrozen&&this.bufferedEntries.length>0&&(this.entries.push(...this.bufferedEntries),this.bufferedEntries=[],this.trimToMaxEntries()),this.requestRender(!0)}),this.filterButtons.forEach(e=>{e.addEventListener("click",()=>{const i=e.dataset.level;i&&(this.activeLevels.has(i)?this.activeLevels.delete(i):this.activeLevels.add(i),this.saveFilterState(),this.requestRender(!0))})})}connectedCallback(){document.addEventListener("app-log",this.onLogEvent),this.loadFilterState(),this.renderFull()}disconnectedCallback(){document.removeEventListener("app-log",this.onLogEvent),this.renderFrameId!==null&&(cancelAnimationFrame(this.renderFrameId),this.renderFrameId=null,this.hasPendingRender=!1)}onLogEvent(t){const e=t.detail||{},i={time:new Date().toLocaleTimeString(),level:e.level||"info",source:e.source||"app",message:e.message||"(no message)"};if(this.isFrozen){this.bufferedEntries.push(i),this.requestRender();return}this.entries.push(i),this.pendingEntries.push(i);const o=this.trimToMaxEntries();if(o.length>0){let n=0;o.forEach(r=>{this.activeLevels.has(String(r.level).toLowerCase())&&(n+=1)}),this.pendingRemovedVisibleCount+=n}this.requestRender()}requestRender(t=!1){t&&(this.fullRenderRequested=!0),!this.hasPendingRender&&(this.hasPendingRender=!0,this.renderFrameId=requestAnimationFrame(()=>{if(this.hasPendingRender=!1,this.renderFrameId=null,this.fullRenderRequested){this.fullRenderRequested=!1,this.pendingEntries=[],this.pendingRemovedVisibleCount=0,this.renderFull();return}this.renderIncremental()}))}trimToMaxEntries(){return this.entries.length>this.maxEntries?this.entries.splice(0,this.entries.length-this.maxEntries):[]}getFilterStorageKey(){return`gc.messageArea.filters.${this.id||this.getAttribute("name")||"default"}`}loadFilterState(){if(!this.filtersLoaded){this.filtersLoaded=!0;try{const t=localStorage.getItem(this.getFilterStorageKey());if(!t)return;const e=JSON.parse(t);if(!Array.isArray(e))return;const i=new Set(["debug","info","warn","error"]);this.activeLevels=new Set(e.filter(o=>i.has(String(o).toLowerCase())).map(o=>String(o).toLowerCase()))}catch{}}}saveFilterState(){try{localStorage.setItem(this.getFilterStorageKey(),JSON.stringify(Array.from(this.activeLevels)))}catch{}}renderFull(){const t=this.entries.filter(i=>this.activeLevels.has(String(i.level).toLowerCase()));this.updateHeaderState(t.length),this.filterButtons.forEach(i=>{const o=i.dataset.level,n=this.activeLevels.has(String(o));i.dataset.active=n?"true":"false"});const e=document.createDocumentFragment();t.forEach(i=>{e.appendChild(this.createEntryElement(i))}),this.logListEl.replaceChildren(e),this.displayedEntries=t.slice(),this.logListEl.scrollTop=Number.MAX_SAFE_INTEGER}renderIncremental(){let t=!1;if(this.pendingRemovedVisibleCount>0){let e=this.pendingRemovedVisibleCount;for(;e>0&&this.logListEl.firstElementChild;)this.logListEl.removeChild(this.logListEl.firstElementChild),this.displayedEntries.shift(),e-=1;this.pendingRemovedVisibleCount=0,t=!0}if(this.pendingEntries.length>0){const e=this.pendingEntries;this.pendingEntries=[];const i=document.createDocumentFragment();e.forEach(o=>{this.activeLevels.has(String(o.level).toLowerCase())&&(this.displayedEntries.push(o),i.appendChild(this.createEntryElement(o)))}),i.childNodes.length>0&&(this.logListEl.appendChild(i),t=!0)}this.updateHeaderState(this.displayedEntries.length),t&&(this.logListEl.scrollTop=Number.MAX_SAFE_INTEGER)}createEntryElement(t){const e=String(t.level).toLowerCase(),i=this.escapeHtml(String(t.level).toUpperCase()),o=this.escapeHtml(t.time),n=this.escapeHtml(`[${t.source}] ${t.message}`),r=document.createElement("li");return r.className="entry",r.innerHTML=`
      <span class="time">${o}</span>
      <span class="level ${e}">${i}</span>
      <span class="message">${n}</span>
    `,r}updateHeaderState(t=null){const e=t??this.entries.filter(o=>this.activeLevels.has(String(o.level).toLowerCase())).length,i=this.bufferedEntries.length;this.counterEl.textContent=i>0?`${e}/${this.entries.length} +${i}`:`${e}/${this.entries.length}`,this.freezeButtonEl.dataset.frozen=this.isFrozen?"true":"false",this.freezeButtonEl.textContent=this.isFrozen?"Frozen":"Freeze",this.freezeButtonEl.title=this.isFrozen?"Resume and append buffered messages":"Pause incoming messages in the list"}escapeHtml(t){return t.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")}}customElements.define("gc-message-area",F);const u='html{box-sizing:border-box}*,*:before,*:after{box-sizing:inherit}html{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}body{margin:0}article,aside,details,figcaption,figure,footer,header,main,menu,nav,section,summary{display:block}audio,canvas,progress,video{display:inline-block}progress{vertical-align:baseline}audio:not([controls]){display:none;height:0}[hidden],template{display:none}a{background-color:transparent;-webkit-text-decoration-skip:objects}a:active,a:hover{outline-width:0}abbr[title]{border-bottom:none;text-decoration:underline;text-decoration:underline dotted}dfn{font-style:italic}mark{background:#ff0;color:#000}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}figure{margin:1em 40px}img{border-style:none}svg:not(:root){overflow:hidden}code,kbd,pre,samp{font-family:monospace,monospace;font-size:1em}hr{box-sizing:content-box;height:0;overflow:visible}button,input,select,textarea{font:inherit;margin:0}optgroup{font-weight:700}button,input{overflow:visible}button,select{text-transform:none}button,html [type=button],[type=reset],[type=submit]{-webkit-appearance:button}button::-moz-focus-inner,[type=button]::-moz-focus-inner,[type=reset]::-moz-focus-inner,[type=submit]::-moz-focus-inner{border-style:none;padding:0}button:-moz-focusring,[type=button]:-moz-focusring,[type=reset]:-moz-focusring,[type=submit]:-moz-focusring{outline:1px dotted ButtonText}fieldset{border:1px solid #c0c0c0;margin:0 2px;padding:.35em .625em .75em}legend{color:inherit;display:table;max-width:100%;padding:0;white-space:normal}textarea{overflow:auto}[type=checkbox],[type=radio]{padding:0}[type=number]::-webkit-inner-spin-button,[type=number]::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}[type=search]::-webkit-search-cancel-button,[type=search]::-webkit-search-decoration{-webkit-appearance:none}::-webkit-input-placeholder{color:inherit;opacity:.54}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}html,body{font-family:Verdana,sans-serif;font-size:15px;line-height:1.5}html{overflow-x:hidden}h1{font-size:36px}h2{font-size:30px}h3{font-size:24px}h4{font-size:20px}h5{font-size:18px}h6{font-size:16px}.w3-serif{font-family:serif}h1,h2,h3,h4,h5,h6{font-family:Segoe UI,Arial,sans-serif;font-weight:400;margin:10px 0}.w3-wide{letter-spacing:4px}hr{border:0;border-top:1px solid #eee;margin:20px 0}.w3-image{max-width:100%;height:auto}img{vertical-align:middle}a{color:inherit}.w3-table,.w3-table-all{border-collapse:collapse;border-spacing:0;width:100%;display:table}.w3-table-all{border:1px solid #ccc}.w3-bordered tr,.w3-table-all tr{border-bottom:1px solid #ddd}.w3-striped tbody tr:nth-child(2n){background-color:#f1f1f1}.w3-table-all tr:nth-child(odd){background-color:#fff}.w3-table-all tr:nth-child(2n){background-color:#f1f1f1}.w3-hoverable tbody tr:hover,.w3-ul.w3-hoverable li:hover{background-color:#ccc}.w3-centered tr th,.w3-centered tr td{text-align:center}.w3-table td,.w3-table th,.w3-table-all td,.w3-table-all th{padding:8px;display:table-cell;text-align:left;vertical-align:top}.w3-table th:first-child,.w3-table td:first-child,.w3-table-all th:first-child,.w3-table-all td:first-child{padding-left:16px}.w3-btn,.w3-button{border:none;display:inline-block;padding:8px 16px;vertical-align:middle;overflow:hidden;text-decoration:none;color:inherit;background-color:inherit;text-align:center;cursor:pointer;white-space:nowrap}.w3-btn:hover{box-shadow:0 8px 16px #0003,0 6px 20px #00000030}.w3-btn,.w3-button{-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.w3-disabled,.w3-btn:disabled,.w3-button:disabled{cursor:not-allowed;opacity:.3}.w3-disabled *,:disabled *{pointer-events:none}.w3-btn.w3-disabled:hover,.w3-btn:disabled:hover{box-shadow:none}.w3-badge,.w3-tag{background-color:#000;color:#fff;display:inline-block;padding-left:8px;padding-right:8px;text-align:center}.w3-badge{border-radius:50%}.w3-ul{list-style-type:none;padding:0;margin:0}.w3-ul li{padding:8px 16px;border-bottom:1px solid #ddd}.w3-ul li:last-child{border-bottom:none}.w3-tooltip,.w3-display-container{position:relative}.w3-tooltip .w3-text{display:none}.w3-tooltip:hover .w3-text{display:inline-block}.w3-ripple:active{opacity:.5}.w3-ripple{transition:opacity 0s}.w3-input{padding:8px;display:block;border:none;border-bottom:1px solid #ccc;width:100%}.w3-select{padding:9px 0;width:100%;border:none;border-bottom:1px solid #ccc}.w3-dropdown-click,.w3-dropdown-hover{position:relative;display:inline-block;cursor:pointer}.w3-dropdown-hover:hover .w3-dropdown-content{display:block}.w3-dropdown-hover:first-child,.w3-dropdown-click:hover{background-color:#ccc;color:#000}.w3-dropdown-hover:hover>.w3-button:first-child,.w3-dropdown-click:hover>.w3-button:first-child{background-color:#ccc;color:#000}.w3-dropdown-content{cursor:auto;color:#000;background-color:#fff;display:none;position:absolute;min-width:160px;margin:0;padding:0;z-index:1}.w3-check,.w3-radio{width:24px;height:24px;position:relative;top:6px}.w3-sidebar{height:100%;width:200px;background-color:#fff;position:fixed!important;z-index:1;overflow:auto}.w3-bar-block .w3-dropdown-hover,.w3-bar-block .w3-dropdown-click{width:100%}.w3-bar-block .w3-dropdown-hover .w3-dropdown-content,.w3-bar-block .w3-dropdown-click .w3-dropdown-content{min-width:100%}.w3-bar-block .w3-dropdown-hover .w3-button,.w3-bar-block .w3-dropdown-click .w3-button{width:100%;text-align:left;padding:8px 16px}.w3-main,#main{transition:margin-left .4s}.w3-modal{z-index:3;display:none;padding-top:100px;position:fixed;left:0;top:0;width:100%;height:100%;overflow:auto;background-color:#000;background-color:#0006}.w3-modal-content{margin:auto;background-color:#fff;position:relative;padding:0;outline:0;width:600px}.w3-bar{width:100%;overflow:hidden}.w3-center .w3-bar{display:inline-block;width:auto}.w3-bar .w3-bar-item{padding:8px 16px;float:left;width:auto;border:none;display:block;outline:0}.w3-bar .w3-dropdown-hover,.w3-bar .w3-dropdown-click{position:static;float:left}.w3-bar .w3-button{white-space:normal}.w3-bar-block .w3-bar-item{width:100%;display:block;padding:8px 16px;text-align:left;border:none;white-space:normal;float:none;outline:0}.w3-bar-block.w3-center .w3-bar-item{text-align:center}.w3-block{display:block;width:100%}.w3-responsive{display:block;overflow-x:auto}.w3-container:after,.w3-container:before,.w3-panel:after,.w3-panel:before,.w3-row:after,.w3-row:before,.w3-row-padding:after,.w3-row-padding:before,.w3-cell-row:before,.w3-cell-row:after,.w3-clear:after,.w3-clear:before,.w3-bar:before,.w3-bar:after{content:"";display:table;clear:both}.w3-col,.w3-half,.w3-third,.w3-twothird,.w3-threequarter,.w3-quarter{float:left;width:100%}.w3-col.s1{width:8.33333%}.w3-col.s2{width:16.66666%}.w3-col.s3{width:24.99999%}.w3-col.s4{width:33.33333%}.w3-col.s5{width:41.66666%}.w3-col.s6{width:49.99999%}.w3-col.s7{width:58.33333%}.w3-col.s8{width:66.66666%}.w3-col.s9{width:74.99999%}.w3-col.s10{width:83.33333%}.w3-col.s11{width:91.66666%}.w3-col.s12{width:99.99999%}@media (min-width:601px){.w3-col.m1{width:8.33333%}.w3-col.m2{width:16.66666%}.w3-col.m3,.w3-quarter{width:24.99999%}.w3-col.m4,.w3-third{width:33.33333%}.w3-col.m5{width:41.66666%}.w3-col.m6,.w3-half{width:49.99999%}.w3-col.m7{width:58.33333%}.w3-col.m8,.w3-twothird{width:66.66666%}.w3-col.m9,.w3-threequarter{width:74.99999%}.w3-col.m10{width:83.33333%}.w3-col.m11{width:91.66666%}.w3-col.m12{width:99.99999%}}@media (min-width:993px){.w3-col.l1{width:8.33333%}.w3-col.l2{width:16.66666%}.w3-col.l3{width:24.99999%}.w3-col.l4{width:33.33333%}.w3-col.l5{width:41.66666%}.w3-col.l6{width:49.99999%}.w3-col.l7{width:58.33333%}.w3-col.l8{width:66.66666%}.w3-col.l9{width:74.99999%}.w3-col.l10{width:83.33333%}.w3-col.l11{width:91.66666%}.w3-col.l12{width:99.99999%}}.w3-content{max-width:980px;margin:auto}.w3-rest{overflow:hidden}.w3-cell-row{display:table;width:100%}.w3-cell{display:table-cell}.w3-cell-top{vertical-align:top}.w3-cell-middle{vertical-align:middle}.w3-cell-bottom{vertical-align:bottom}.w3-hide{display:none!important}.w3-show-block,.w3-show{display:block!important}.w3-show-inline-block{display:inline-block!important}@media (max-width:600px){.w3-modal-content{margin:0 10px;width:auto!important}.w3-modal{padding-top:30px}.w3-dropdown-hover.w3-mobile .w3-dropdown-content,.w3-dropdown-click.w3-mobile .w3-dropdown-content{position:relative}.w3-hide-small{display:none!important}.w3-mobile{display:block;width:100%!important}.w3-bar-item.w3-mobile,.w3-dropdown-hover.w3-mobile,.w3-dropdown-click.w3-mobile{text-align:center}.w3-dropdown-hover.w3-mobile,.w3-dropdown-hover.w3-mobile .w3-btn,.w3-dropdown-hover.w3-mobile .w3-button,.w3-dropdown-click.w3-mobile,.w3-dropdown-click.w3-mobile .w3-btn,.w3-dropdown-click.w3-mobile .w3-button{width:100%}}@media (max-width:768px){.w3-modal-content{width:500px}.w3-modal{padding-top:50px}}@media (min-width:993px){.w3-modal-content{width:900px}.w3-hide-large{display:none!important}.w3-sidebar.w3-collapse{display:block!important}}@media (max-width:992px) and (min-width:601px){.w3-hide-medium{display:none!important}}@media (max-width:992px){.w3-sidebar.w3-collapse{display:none}.w3-main{margin-left:0!important;margin-right:0!important}}.w3-top,.w3-bottom{position:fixed;width:100%;z-index:1}.w3-top{top:0}.w3-bottom{bottom:0}.w3-overlay{position:fixed;display:none;width:100%;height:100%;top:0;left:0;right:0;bottom:0;background-color:#00000080;z-index:2}.w3-display-topleft{position:absolute;left:0;top:0}.w3-display-topright{position:absolute;right:0;top:0}.w3-display-bottomleft{position:absolute;left:0;bottom:0}.w3-display-bottomright{position:absolute;right:0;bottom:0}.w3-display-middle{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);-ms-transform:translate(-50%,-50%)}.w3-display-left{position:absolute;top:50%;left:0%;transform:translateY(-50%);-ms-transform:translate(-0%,-50%)}.w3-display-right{position:absolute;top:50%;right:0%;transform:translateY(-50%);-ms-transform:translate(0%,-50%)}.w3-display-topmiddle{position:absolute;left:50%;top:0;transform:translate(-50%);-ms-transform:translate(-50%,0%)}.w3-display-bottommiddle{position:absolute;left:50%;bottom:0;transform:translate(-50%);-ms-transform:translate(-50%,0%)}.w3-display-container:hover .w3-display-hover{display:block}.w3-display-container:hover span.w3-display-hover{display:inline-block}.w3-display-hover{display:none}.w3-display-position{position:absolute}.w3-circle{border-radius:50%}.w3-round-small{border-radius:2px}.w3-round,.w3-round-medium{border-radius:4px}.w3-round-large{border-radius:8px}.w3-round-xlarge{border-radius:16px}.w3-round-xxlarge{border-radius:32px}.w3-row-padding,.w3-row-padding>.w3-half,.w3-row-padding>.w3-third,.w3-row-padding>.w3-twothird,.w3-row-padding>.w3-threequarter,.w3-row-padding>.w3-quarter,.w3-row-padding>.w3-col{padding:0 8px}.w3-container,.w3-panel{padding:.01em 16px}.w3-panel{margin-top:16px;margin-bottom:16px}.w3-code,.w3-codespan{font-family:Consolas,courier new;font-size:16px}.w3-code{width:auto;background-color:#fff;padding:8px 12px;border-left:4px solid #4CAF50;word-wrap:break-word}.w3-codespan{color:#dc143c;background-color:#f1f1f1;padding-left:4px;padding-right:4px;font-size:110%}.w3-card,.w3-card-2{box-shadow:0 2px 5px #00000029,0 2px 10px #0000001f}.w3-card-4,.w3-hover-shadow:hover{box-shadow:0 4px 10px #0003,0 4px 20px #00000030}.w3-spin{animation:w3-spin 2s infinite linear}@keyframes w3-spin{0%{transform:rotate(0)}to{transform:rotate(359deg)}}.w3-animate-fading{animation:fading 10s infinite}@keyframes fading{0%{opacity:0}50%{opacity:1}to{opacity:0}}.w3-animate-opacity{animation:opac .8s}@keyframes opac{0%{opacity:0}to{opacity:1}}.w3-animate-top{position:relative;animation:animatetop .4s}@keyframes animatetop{0%{top:-300px;opacity:0}to{top:0;opacity:1}}.w3-animate-left{position:relative;animation:animateleft .4s}@keyframes animateleft{0%{left:-300px;opacity:0}to{left:0;opacity:1}}.w3-animate-right{position:relative;animation:animateright .4s}@keyframes animateright{0%{right:-300px;opacity:0}to{right:0;opacity:1}}.w3-animate-bottom{position:relative;animation:animatebottom .4s}@keyframes animatebottom{0%{bottom:-300px;opacity:0}to{bottom:0;opacity:1}}.w3-animate-zoom{animation:animatezoom .6s}@keyframes animatezoom{0%{transform:scale(0)}to{transform:scale(1)}}.w3-animate-input{transition:width .4s ease-in-out}.w3-animate-input:focus{width:100%!important}.w3-opacity,.w3-hover-opacity:hover{opacity:.6}.w3-opacity-off,.w3-hover-opacity-off:hover{opacity:1}.w3-opacity-max{opacity:.25}.w3-opacity-min{opacity:.75}.w3-greyscale-max,.w3-grayscale-max,.w3-hover-greyscale:hover,.w3-hover-grayscale:hover{filter:grayscale(100%)}.w3-greyscale,.w3-grayscale{filter:grayscale(75%)}.w3-greyscale-min,.w3-grayscale-min{filter:grayscale(50%)}.w3-sepia{filter:sepia(75%)}.w3-sepia-max,.w3-hover-sepia:hover{filter:sepia(100%)}.w3-sepia-min{filter:sepia(50%)}.w3-tiny{font-size:10px!important}.w3-small{font-size:12px!important}.w3-medium{font-size:15px!important}.w3-large{font-size:18px!important}.w3-xlarge{font-size:24px!important}.w3-xxlarge{font-size:36px!important}.w3-xxxlarge{font-size:48px!important}.w3-jumbo{font-size:64px!important}.w3-left-align{text-align:left!important}.w3-right-align{text-align:right!important}.w3-justify{text-align:justify!important}.w3-center{text-align:center!important}.w3-border-0{border:0!important}.w3-border{border:1px solid #ccc!important}.w3-border-top{border-top:1px solid #ccc!important}.w3-border-bottom{border-bottom:1px solid #ccc!important}.w3-border-left{border-left:1px solid #ccc!important}.w3-border-right{border-right:1px solid #ccc!important}.w3-topbar{border-top:6px solid #ccc!important}.w3-bottombar{border-bottom:6px solid #ccc!important}.w3-leftbar{border-left:6px solid #ccc!important}.w3-rightbar{border-right:6px solid #ccc!important}.w3-section,.w3-code{margin-top:16px!important;margin-bottom:16px!important}.w3-margin{margin:16px!important}.w3-margin-top{margin-top:16px!important}.w3-margin-bottom{margin-bottom:16px!important}.w3-margin-left{margin-left:16px!important}.w3-margin-right{margin-right:16px!important}.w3-padding-small{padding:4px 8px!important}.w3-padding{padding:8px 16px!important}.w3-padding-large{padding:12px 24px!important}.w3-padding-16{padding-top:16px!important;padding-bottom:16px!important}.w3-padding-24{padding-top:24px!important;padding-bottom:24px!important}.w3-padding-32{padding-top:32px!important;padding-bottom:32px!important}.w3-padding-48{padding-top:48px!important;padding-bottom:48px!important}.w3-padding-64{padding-top:64px!important;padding-bottom:64px!important}.w3-left{float:left!important}.w3-right{float:right!important}.w3-button:hover{color:#000!important;background-color:#ccc!important}.w3-transparent,.w3-hover-none:hover{background-color:transparent!important}.w3-hover-none:hover{box-shadow:none!important}.w3-amber,.w3-hover-amber:hover{color:#000!important;background-color:#ffc107!important}.w3-aqua,.w3-hover-aqua:hover{color:#000!important;background-color:#0ff!important}.w3-blue,.w3-hover-blue:hover{color:#fff!important;background-color:#2196f3!important}.w3-light-blue,.w3-hover-light-blue:hover{color:#000!important;background-color:#87ceeb!important}.w3-brown,.w3-hover-brown:hover{color:#fff!important;background-color:#795548!important}.w3-cyan,.w3-hover-cyan:hover{color:#000!important;background-color:#00bcd4!important}.w3-blue-grey,.w3-hover-blue-grey:hover,.w3-blue-gray,.w3-hover-blue-gray:hover{color:#fff!important;background-color:#607d8b!important}.w3-green,.w3-hover-green:hover{color:#fff!important;background-color:#4caf50!important}.w3-light-green,.w3-hover-light-green:hover{color:#000!important;background-color:#8bc34a!important}.w3-indigo,.w3-hover-indigo:hover{color:#fff!important;background-color:#3f51b5!important}.w3-khaki,.w3-hover-khaki:hover{color:#000!important;background-color:khaki!important}.w3-lime,.w3-hover-lime:hover{color:#000!important;background-color:#cddc39!important}.w3-orange,.w3-hover-orange:hover{color:#000!important;background-color:#ff9800!important}.w3-deep-orange,.w3-hover-deep-orange:hover{color:#fff!important;background-color:#ff5722!important}.w3-pink,.w3-hover-pink:hover{color:#fff!important;background-color:#e91e63!important}.w3-purple,.w3-hover-purple:hover{color:#fff!important;background-color:#9c27b0!important}.w3-deep-purple,.w3-hover-deep-purple:hover{color:#fff!important;background-color:#673ab7!important}.w3-red,.w3-hover-red:hover{color:#fff!important;background-color:#f44336!important}.w3-sand,.w3-hover-sand:hover{color:#000!important;background-color:#fdf5e6!important}.w3-teal,.w3-hover-teal:hover{color:#fff!important;background-color:#009688!important}.w3-yellow,.w3-hover-yellow:hover{color:#000!important;background-color:#ffeb3b!important}.w3-white,.w3-hover-white:hover{color:#000!important;background-color:#fff!important}.w3-black,.w3-hover-black:hover{color:#fff!important;background-color:#000!important}.w3-grey,.w3-hover-grey:hover,.w3-gray,.w3-hover-gray:hover{color:#000!important;background-color:#9e9e9e!important}.w3-light-grey,.w3-hover-light-grey:hover,.w3-light-gray,.w3-hover-light-gray:hover{color:#000!important;background-color:#f1f1f1!important}.w3-dark-grey,.w3-hover-dark-grey:hover,.w3-dark-gray,.w3-hover-dark-gray:hover{color:#fff!important;background-color:#616161!important}.w3-pale-red,.w3-hover-pale-red:hover{color:#000!important;background-color:#fdd!important}.w3-pale-green,.w3-hover-pale-green:hover{color:#000!important;background-color:#dfd!important}.w3-pale-yellow,.w3-hover-pale-yellow:hover{color:#000!important;background-color:#ffc!important}.w3-pale-blue,.w3-hover-pale-blue:hover{color:#000!important;background-color:#dff!important}.w3-text-amber,.w3-hover-text-amber:hover{color:#ffc107!important}.w3-text-aqua,.w3-hover-text-aqua:hover{color:#0ff!important}.w3-text-blue,.w3-hover-text-blue:hover{color:#2196f3!important}.w3-text-light-blue,.w3-hover-text-light-blue:hover{color:#87ceeb!important}.w3-text-brown,.w3-hover-text-brown:hover{color:#795548!important}.w3-text-cyan,.w3-hover-text-cyan:hover{color:#00bcd4!important}.w3-text-blue-grey,.w3-hover-text-blue-grey:hover,.w3-text-blue-gray,.w3-hover-text-blue-gray:hover{color:#607d8b!important}.w3-text-green,.w3-hover-text-green:hover{color:#4caf50!important}.w3-text-light-green,.w3-hover-text-light-green:hover{color:#8bc34a!important}.w3-text-indigo,.w3-hover-text-indigo:hover{color:#3f51b5!important}.w3-text-khaki,.w3-hover-text-khaki:hover{color:#b4aa50!important}.w3-text-lime,.w3-hover-text-lime:hover{color:#cddc39!important}.w3-text-orange,.w3-hover-text-orange:hover{color:#ff9800!important}.w3-text-deep-orange,.w3-hover-text-deep-orange:hover{color:#ff5722!important}.w3-text-pink,.w3-hover-text-pink:hover{color:#e91e63!important}.w3-text-purple,.w3-hover-text-purple:hover{color:#9c27b0!important}.w3-text-deep-purple,.w3-hover-text-deep-purple:hover{color:#673ab7!important}.w3-text-red,.w3-hover-text-red:hover{color:#f44336!important}.w3-text-sand,.w3-hover-text-sand:hover{color:#fdf5e6!important}.w3-text-teal,.w3-hover-text-teal:hover{color:#009688!important}.w3-text-yellow,.w3-hover-text-yellow:hover{color:#d2be0e!important}.w3-text-white,.w3-hover-text-white:hover{color:#fff!important}.w3-text-black,.w3-hover-text-black:hover{color:#000!important}.w3-text-grey,.w3-hover-text-grey:hover,.w3-text-gray,.w3-hover-text-gray:hover{color:#757575!important}.w3-text-light-grey,.w3-hover-text-light-grey:hover,.w3-text-light-gray,.w3-hover-text-light-gray:hover{color:#f1f1f1!important}.w3-text-dark-grey,.w3-hover-text-dark-grey:hover,.w3-text-dark-gray,.w3-hover-text-dark-gray:hover{color:#3a3a3a!important}.w3-border-amber,.w3-hover-border-amber:hover{border-color:#ffc107!important}.w3-border-aqua,.w3-hover-border-aqua:hover{border-color:#0ff!important}.w3-border-blue,.w3-hover-border-blue:hover{border-color:#2196f3!important}.w3-border-light-blue,.w3-hover-border-light-blue:hover{border-color:#87ceeb!important}.w3-border-brown,.w3-hover-border-brown:hover{border-color:#795548!important}.w3-border-cyan,.w3-hover-border-cyan:hover{border-color:#00bcd4!important}.w3-border-blue-grey,.w3-hover-border-blue-grey:hover,.w3-border-blue-gray,.w3-hover-border-blue-gray:hover{border-color:#607d8b!important}.w3-border-green,.w3-hover-border-green:hover{border-color:#4caf50!important}.w3-border-light-green,.w3-hover-border-light-green:hover{border-color:#8bc34a!important}.w3-border-indigo,.w3-hover-border-indigo:hover{border-color:#3f51b5!important}.w3-border-khaki,.w3-hover-border-khaki:hover{border-color:khaki!important}.w3-border-lime,.w3-hover-border-lime:hover{border-color:#cddc39!important}.w3-border-orange,.w3-hover-border-orange:hover{border-color:#ff9800!important}.w3-border-deep-orange,.w3-hover-border-deep-orange:hover{border-color:#ff5722!important}.w3-border-pink,.w3-hover-border-pink:hover{border-color:#e91e63!important}.w3-border-purple,.w3-hover-border-purple:hover{border-color:#9c27b0!important}.w3-border-deep-purple,.w3-hover-border-deep-purple:hover{border-color:#673ab7!important}.w3-border-red,.w3-hover-border-red:hover{border-color:#f44336!important}.w3-border-sand,.w3-hover-border-sand:hover{border-color:#fdf5e6!important}.w3-border-teal,.w3-hover-border-teal:hover{border-color:#009688!important}.w3-border-yellow,.w3-hover-border-yellow:hover{border-color:#ffeb3b!important}.w3-border-white,.w3-hover-border-white:hover{border-color:#fff!important}.w3-border-black,.w3-hover-border-black:hover{border-color:#000!important}.w3-border-grey,.w3-hover-border-grey:hover,.w3-border-gray,.w3-hover-border-gray:hover{border-color:#9e9e9e!important}.w3-border-light-grey,.w3-hover-border-light-grey:hover,.w3-border-light-gray,.w3-hover-border-light-gray:hover{border-color:#f1f1f1!important}.w3-border-dark-grey,.w3-hover-border-dark-grey:hover,.w3-border-dark-gray,.w3-hover-border-dark-gray:hover{border-color:#616161!important}.w3-border-pale-red,.w3-hover-border-pale-red:hover{border-color:#ffe7e7!important}.w3-border-pale-green,.w3-hover-border-pale-green:hover{border-color:#e7ffe7!important}.w3-border-pale-yellow,.w3-hover-border-pale-yellow:hover{border-color:#ffc!important}.w3-border-pale-blue,.w3-hover-border-pale-blue:hover{border-color:#e7ffff!important}',k=document.createElement("template");k.innerHTML=`
  <style>
    ${u}
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
        <h2 id="title" class="w3-center w3-text-blue w3-medium w3-left">Table</h2>
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
`;class R extends HTMLElement{static get observedAttributes(){return["title","componentIdentifier"]}constructor(){super();const t=this.attachShadow({mode:"open"});t.append(k.content.cloneNode(!0)),this.titleElement=t.getElementById("title"),this.onLanguageChange=this.onLanguageChange.bind(this),this.componentIdentifier=this.getAttribute("componentIdentifier")||"MeasurementTable"}connectedCallback(){document.addEventListener("app-language-change",this.onLanguageChange);let t=this.componentIdentifier;document.addEventListener(t+"-add-row",this.onAddRow.bind(this)),this.render()}initBlankLines(t){const e=this.shadowRoot.getElementById("tableHeaderRow").children.length;for(let i=0;i<t;i++)this.appendRowToTable(new Array(e).fill(""))}attributeChangedCallback(){this.componentIdentifier=this.getAttribute("componentIdentifier")||"MeasurementTable",this.render()}disconnectedCallback(){document.removeEventListener("app-language-change",this.onLanguageChange);let t=this.componentIdentifier;document.removeEventListener(t+"-add-row",this.onAddRow.bind(this))}async onAddRow(t){const e=t==null?void 0:t.detail;e&&Array.isArray(e.rowData)&&this.appendRowToTable(e.rowData)}async onLanguageChange(t){const e=t==null?void 0:t.detail;typeof e=="string"||e==null||e.code;const i=e==null?void 0:e.catalog;i&&await this.applyLanguageChange(i)}async applyLanguageChange(t){var n,r;const e=((n=t==null?void 0:t[this.componentIdentifier])==null?void 0:n.title)||"Table";this.titleElement.textContent=e;const i=this.getTableHeader(t);i&&this.setTableHeaderWithUnits(i);const o=((r=t==null?void 0:t[this.componentIdentifier])==null?void 0:r.blankRows)||5;this.getRowCount()!=o&&this.initBlankLines(o-this.getRowCount())}getTableHeader(t){var i;const e=(i=t==null?void 0:t[this.componentIdentifier])==null?void 0:i.tableHeader;return!e||typeof e!="object"?null:Array.isArray(e)?e:Object.values(e)}addTrace(t,e){let i="debug";t==="ERR"&&(i="error"),this.emitAppLog(i,`${t}: ${e}`)}render(){this.titleElement.textContent=this.getAttribute("title")||"Table"}setTableHeader(t){const e=this.shadowRoot.getElementById("tableHeaderRow");e.innerHTML="",t.forEach(i=>{const o=document.createElement("th");o.textContent=i,e.appendChild(o)})}setTableHeaderWithUnits(t){const e=this.shadowRoot.getElementById("tableHeaderRow");e.innerHTML="",t.forEach(i=>{const o=document.createElement("th");(i.label===void 0||i.label===null)&&(i.label="????"),i.unit!==null&&i.unit!==void 0?o.innerHTML=i.label+"<br>["+i.unit+"]":o.textContent=i.label,i.tooltip!==void 0&&i.tooltip!==null&&i.tooltip!==""&&(o.title=i.tooltip),e.appendChild(o)})}updateRowData(t,e){const i=this.shadowRoot.getElementById("tableBody");let o=null;if(t>=0&&t<i.rows.length&&(o=i.rows[t]),o==null)return;let n=0;e.forEach(r=>{o.children[n++].textContent=r})}getTableRow(t){const e=this.shadowRoot.getElementById("tableBody");return t>=0&&t<e.rows.length?e.rows[t]:null}appendRowToTable(t){const e=this.shadowRoot.getElementById("tableBody"),i=document.createElement("tr");t.forEach(o=>{const n=document.createElement("td");n.textContent=o,i.appendChild(n)}),e.appendChild(i)}getRowCount(){return this.shadowRoot.getElementById("tableBody").rows.length}removeRowFromTable(t){const e=this.shadowRoot.getElementById("tableBody");t>=0&&t<e.rows.length&&e.deleteRow(t)}removeAllRowsFromTable(){const t=this.shadowRoot.getElementById("tableBody");t.innerHTML="",this.render()}parseNumber(t){const e=Number.parseFloat(t);return Number.isFinite(e)?e:null}formatMetric(t,e,i){return t==null?i:t.toFixed(e)}}customElements.define("gc-table",R);const S=document.createElement("template");S.innerHTML=`
  <style>
    ${u}
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
          <p class="metric-value"><span id="valueId">84.9</span> <span class="metric-unit" id="unitId">kN</span></p>
        </div>     
        <slot></slot>
        </div>
    </div>
`;class V extends HTMLElement{static get observedAttributes(){return["label","value","unit","decimals","componentIdentifier"]}constructor(){super();const t=this.attachShadow({mode:"open"});t.append(S.content.cloneNode(!0)),this.onLanguageChange=this.onLanguageChange.bind(this),this.labelElement=t.getElementById("labelId"),this.valueElement=t.getElementById("valueId"),this.unitElement=t.getElementById("unitId"),this.componentIdentifier=this.getAttribute("componentIdentifier")||"Realtime"}connectedCallback(){document.addEventListener("app-language-change",this.onLanguageChange),this.render()}attributeChangedCallback(t,e,i){e!==i&&(t==="componentIdentifier"&&(this.componentIdentifier=i||"Realtime"),this.render())}disconnectedCallback(){document.removeEventListener("app-language-change",this.onLanguageChange)}get label(){return this.getAttribute("label")||""}set label(t){this.setAttribute("label",t??"")}get value(){return this.getAttribute("value")||""}set value(t){this.setAttribute("value",t??"")}get unit(){return this.getAttribute("unit")||""}set unit(t){this.setAttribute("unit",t??"")}get decimals(){const t=this.getAttribute("decimals");if(t==null||t==="")return null;const e=Number.parseInt(t,10);return Number.isInteger(e)&&e>=0?e:null}set decimals(t){this.setAttribute("decimals",t??"")}formatValue(){const t=this.value,e=this.decimals;if(e==null)return t;const i=Number.parseFloat(t);return Number.isFinite(i)?i.toFixed(e):t}async onLanguageChange(t){var i;const e=(i=t==null?void 0:t.detail)==null?void 0:i.catalog;e&&await this.applyLanguageChange(e)}async applyLanguageChange(t){var i;const e=(i=t==null?void 0:t[this.componentIdentifier])==null?void 0:i.title;if(typeof e=="string"&&e.length>0){this.labelElement.textContent=e;return}this.labelElement.textContent=this.label}render(){this.labelElement.textContent=this.label,this.valueElement.textContent=this.formatValue(),this.unitElement.textContent=this.unit}}customElements.define("gc-realtime",V);class P extends R{constructor(){super(),this.onTestMeasurement=this.onTestMeasurement.bind(this)}connectedCallback(){super.connectedCallback(),document.addEventListener("test-measurement",this.onTestMeasurement)}async onTestMeasurement(t){const i=(t==null?void 0:t.detail).measurement;console.log("New test-measurement "+i.targetPressure);let o=[];o[0]=i.nr,o[1]=i.name,o[2]=i.targetPressure.toFixed(1),o[3]=i.pressure.toFixed(1),o[4]=i.distance.toFixed(3),o[5]=i.velocity.toFixed(3),o[6]=i.hhmmss,o[7]=i.passed==!0?"PASS":"FAIL",i.nr>0&&this.updateRowData(i.nr-1,o),i.nr==0&&this.updateRowData(i.nr,o),this.render()}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("test-measurement",this.onTestMeasurement)}}customElements.define("gc-measurements-table",P);class N extends EventTarget{constructor(t={}){super(),this.counter=0,this.verbose=!1,this.port=null,this.reader=null,this.keepReading=!1,this.isConnecting=!1,this.readBuffer="",this.decoder=new TextDecoder,this.encoder=new TextEncoder,this.autoConnectTimer=null,this.autoConnectEnabled=!1,this.autoReconnectOnLoss=!1,this.autoConnectRequested=this.normalizeBooleanOption(t.autoconnect),this.autoConnectIntervalMs=this.normalizeAutoConnectIntervalMs(t.autoconnectIntervalMs),this.storageScope=t.storageScope||t.componentIdentifier||"default",this.componentIdentifier=t.componentIdentifier||"GcUsbLink",this.isMonitoring=!1,this.linkState="disconnected",this.onSerialDisconnect=this.onSerialDisconnect.bind(this),this.onSendCommandEvent=this.onSendCommandEvent.bind(this),this.configure(t)}configure(t={}){Object.prototype.hasOwnProperty.call(t,"autoconnect")&&(this.autoConnectRequested=this.normalizeBooleanOption(t.autoconnect)),Object.prototype.hasOwnProperty.call(t,"autoconnectIntervalMs")&&(this.autoConnectIntervalMs=this.normalizeAutoConnectIntervalMs(t.autoconnectIntervalMs)),Object.prototype.hasOwnProperty.call(t,"storageScope")&&(this.storageScope=t.storageScope||"default"),Object.prototype.hasOwnProperty.call(t,"componentIdentifier")&&(this.componentIdentifier=t.componentIdentifier||"GcUsbLink")}normalizeBooleanOption(t){return t===!0||t==="true"||t===1}normalizeAutoConnectIntervalMs(t){const e=Number.parseInt(String(t??"5000"),10);return Number.isFinite(e)&&e>=1e3?e:5e3}async onPortConnected(){}async onPortDisconnected(){}emitAppLog(t,e,i={}){this.dispatchEvent(new CustomEvent("app-log",{detail:{level:t,source:this.componentIdentifier||"GcUsbLink",message:e,...i},bubbles:!0,composed:!0}))}getPortStatus(){var t,e;return{state:this.linkState,isConnected:!!this.port,isConnecting:this.isConnecting,autoConnectEnabled:this.autoConnectEnabled||this.isAutoConnectRequested(),counter:this.counter,portInfo:((e=(t=this.port)==null?void 0:t.getInfo)==null?void 0:e.call(t))||null}}updateLinkState(t){this.linkState!==t&&(this.linkState=t,this.dispatchEvent(new CustomEvent("port-status-change",{detail:this.getPortStatus(),bubbles:!0,composed:!0})))}isAutoConnectRequested(){return this.autoConnectRequested}getAutoConnectIntervalMs(){return this.autoConnectIntervalMs}getAutoConnectStorageScope(){return this.storageScope||this.componentIdentifier||"default"}getRememberedPortStorageKey(){return`gc.serial.rememberedPort.${this.getAutoConnectStorageScope()}`}getRememberedPortHint(){try{const t=localStorage.getItem(this.getRememberedPortStorageKey());if(!t)return null;const e=JSON.parse(t);return e&&typeof e=="object"?e:null}catch{return null}}clearRememberedPortHint(){localStorage.removeItem(this.getRememberedPortStorageKey())}rememberCurrentPortHint(t={}){if(!this.port)return;const e=this.port.getInfo(),i={usbVendorId:e.usbVendorId??null,usbProductId:e.usbProductId??null,updatedAt:new Date().toISOString(),...t};localStorage.setItem(this.getRememberedPortStorageKey(),JSON.stringify(i))}isSamePort(t,e){if(!t||!e)return!1;const i=t.getInfo();return i.usbVendorId===e.usbVendorId&&i.usbProductId===e.usbProductId}async tryAutoConnect(){if(!this.autoConnectEnabled||this.port||this.isConnecting||!navigator.serial)return;const t=this.getRememberedPortHint();if(!t)return;const i=(await navigator.serial.getPorts()).find(o=>this.isSamePort(o,t));i&&await this.connectPort({port:i,requestPortIfMissing:!1})}startAutoConnect(){this.stopAutoConnect(),this.autoConnectEnabled=!0,this.tryAutoConnect(),this.autoConnectTimer=setInterval(()=>{this.tryAutoConnect()},this.getAutoConnectIntervalMs())}stopAutoConnect(){this.autoConnectEnabled=!1,this.autoConnectTimer&&(clearInterval(this.autoConnectTimer),this.autoConnectTimer=null)}startMonitoring(){var t;this.isMonitoring||((t=navigator.serial)==null||t.addEventListener("disconnect",this.onSerialDisconnect),typeof document<"u"&&document.addEventListener("gc-send-cmd",this.onSendCommandEvent),this.isMonitoring=!0,this.isAutoConnectRequested()&&!this.port?this.startAutoConnect():this.updateLinkState(this.port?"connected":"disconnected"))}stopMonitoring(){var t;this.isMonitoring&&((t=navigator.serial)==null||t.removeEventListener("disconnect",this.onSerialDisconnect),typeof document<"u"&&document.removeEventListener("gc-send-cmd",this.onSendCommandEvent),this.isMonitoring=!1,this.stopAutoConnect())}onSendCommandEvent(t){var o;const e=t==null?void 0:t.detail,i=typeof e=="string"?e:e==null?void 0:e.textLine;if(this.linkState!=="connected"||!((o=this.port)!=null&&o.writable)){this.emitAppLog("warn","Ignoring gc-send-cmd: USB link is not connected",{command:i});return}this.writeLine(i).catch(n=>{this.emitAppLog("error","Failed to send gc-send-cmd over USB",{command:i,error:String((n==null?void 0:n.message)||n)})})}enableAutoConnect(){this.autoConnectRequested=!0,this.autoReconnectOnLoss=!0,this.port||this.startAutoConnect()}disableAutoConnect(){this.autoConnectRequested=!1,this.autoReconnectOnLoss=!1,this.stopAutoConnect()}isPortLostError(t){return(t==null?void 0:t.name)==="NetworkError"||/device has been lost/i.test(String((t==null?void 0:t.message)||""))}async handlePortLost(t=null){!this.port&&!this.reader||(t&&(console.warn("Serial device disconnected:",t),this.emitAppLog("warn","Serial device disconnected")),this.keepReading=!1,this.reader=null,this.port=null,this.updateLinkState(this.autoReconnectOnLoss?"reconnecting":"disconnected"),await this.onPortDisconnected(),this.autoReconnectOnLoss&&this.startAutoConnect())}onSerialDisconnect(t){this.port&&(t==null?void 0:t.port)===this.port&&this.handlePortLost(t)}async connectPort(t={}){const{port:e=null,requestPortIfMissing:i=!0}=t;if(!navigator.serial){console.error("Web Serial API is not available in this browser."),this.updateLinkState("error");return}if(!(this.isConnecting||this.port)){this.isConnecting=!0,this.updateLinkState("connecting");try{if(e)this.port=e;else if(i)this.port=await navigator.serial.requestPort();else{this.port=null;return}await this.port.open({baudRate:115200}),this.keepReading=!0,this.readBuffer="",this.readLoop(),this.rememberCurrentPortHint(),this.autoReconnectOnLoss=this.isAutoConnectRequested(),this.stopAutoConnect(),this.emitAppLog("info","Serial port opened"),await this.onPortConnected(),this.updateLinkState("connected")}catch(o){this.verbose&&console.error("Error opening serial port:",o),this.emitAppLog("error","Failed to open serial port"),this.port=null,this.keepReading=!1,this.updateLinkState("error")}finally{this.isConnecting=!1,!this.port&&this.linkState==="connecting"&&this.updateLinkState("disconnected")}}}async disconnectPort(t={}){const{intentional:e=!1}=t;e&&(this.autoReconnectOnLoss=!1,this.stopAutoConnect()),this.keepReading=!1;const i=this.reader;this.reader=null;try{if(i){await i.cancel();try{i.releaseLock()}catch{}}}catch(o){console.error("Error stopping serial reader:",o),this.emitAppLog("warn","Error stopping serial reader")}try{this.port&&await this.port.close()}catch(o){console.error("Error closing serial port:",o),this.emitAppLog("warn","Error closing serial port")}finally{this.port=null,await this.onPortDisconnected(),this.emitAppLog("info","Serial port closed"),this.updateLinkState("disconnected")}}async writeLine(t){var i;if(!((i=this.port)!=null&&i.writable))throw new Error("Serial port is not writable.");const e=this.port.writable.getWriter();try{const o=String(t).replace(/[\r\n]+$/,"");this.emitAppLog("debug",`TX ${o}`),await e.write(this.encoder.encode(`${o}\r
`))}finally{e.releaseLock()}}async readLoop(){var e;if(!((e=this.port)!=null&&e.readable))return;let t;try{for(t=this.port.readable.getReader(),this.reader=t;this.keepReading;){const{value:i,done:o}=await t.read();if(o)break;i&&this.pushChunk(i)}}catch(i){this.keepReading&&this.isPortLostError(i)?await this.handlePortLost(i):this.keepReading&&(console.error("Error while reading serial data:",i),this.emitAppLog("error","Error while reading serial data"),this.updateLinkState("error"))}finally{try{t==null||t.releaseLock()}catch{}this.reader===t&&(this.reader=null)}}pushChunk(t){this.readBuffer+=this.decoder.decode(t,{stream:!0});const e=this.readBuffer.split(/\r?\n/);this.readBuffer=e.pop()||"";for(const i of e)this.handleIncoming(i)}handleIncoming(t){this.counter++,this.dispatchEvent(new CustomEvent("serial-line",{detail:{line:t,counter:this.counter},bubbles:!0,composed:!0}));const e=String(t||"").trim();e.startsWith("$F,")||this.emitAppLog("debug",`RX ${e}`)}}let x="6e400001-b5a3-f393-e0a9-e50e24dcca9e";class T extends EventTarget{constructor(t={}){super(),this.serviceUuid=t.serviceUuid||x,this.componentIdentifier=t.componentIdentifier||"GCBLELink",this.decoder=new TextDecoder,this.encoder=new TextEncoder,this.readBuffer="",this.counter=0,this.isConnecting=!1,this.linkState="disconnected",this.device=null,this.server=null,this.service=null,this.notifyCharacteristic=null,this.writeCharacteristic=null,this.notificationsEnabled=!1,this.onGattDisconnected=this.onGattDisconnected.bind(this),this.onCharacteristicValueChanged=this.onCharacteristicValueChanged.bind(this),this.onSendCommandEvent=this.onSendCommandEvent.bind(this)}configure(t={}){Object.prototype.hasOwnProperty.call(t,"serviceUuid")&&(this.serviceUuid=t.serviceUuid||x),Object.prototype.hasOwnProperty.call(t,"componentIdentifier")&&(this.componentIdentifier=t.componentIdentifier||"GCBLELink")}startMonitoring(){typeof document<"u"&&document.addEventListener("gc-send-cmd",this.onSendCommandEvent)}stopMonitoring(){typeof document<"u"&&document.removeEventListener("gc-send-cmd",this.onSendCommandEvent)}onSendCommandEvent(t){const e=t==null?void 0:t.detail,i=typeof e=="string"?e:e==null?void 0:e.textLine;if(!(typeof i!="string"||!i.trim())){if(!this.isConnected()){this.emitAppLog("warn","Ignoring gc-send-cmd: BLE link is not connected",{command:i});return}this.writeLine(i).catch(o=>{this.emitAppLog("error","Failed to send gc-send-cmd over BLE",{command:i,error:String((o==null?void 0:o.message)||o)})})}}rememberCurrentPortHint(){}get port(){var t;return(t=this.server)!=null&&t.connected?this.server:null}emitAppLog(t,e,i={}){this.dispatchEvent(new CustomEvent("app-log",{detail:{level:t,source:this.componentIdentifier,message:e,...i},bubbles:!0,composed:!0}))}getPortStatus(){var t,e;return{state:this.linkState,isConnected:this.isConnected(),isConnecting:this.isConnecting,autoConnectEnabled:!1,counter:this.counter,transport:"ble",serviceUuid:this.serviceUuid,deviceName:((t=this.device)==null?void 0:t.name)||null,deviceId:((e=this.device)==null?void 0:e.id)||null}}updateLinkState(t){this.linkState!==t&&(this.linkState=t,this.dispatchEvent(new CustomEvent("port-status-change",{detail:this.getPortStatus(),bubbles:!0,composed:!0})))}isConnected(){var t;return!!((t=this.server)!=null&&t.connected&&this.writeCharacteristic)}normalizeUuid(t){return String(t||"").trim().toLowerCase()}async findPrimaryService(t){const e=await t.getPrimaryServices(),i=e.map(r=>r.uuid);this.emitAppLog("info",`Discovered BLE services: ${i.join(", ")||"(none)"}`);const o=this.normalizeUuid(this.serviceUuid),n=e.find(r=>this.normalizeUuid(r.uuid)===o);if(n)return n;throw new Error(`BLE UART service ${this.serviceUuid} not found on device`)}async onPortConnected(){}async onPortDisconnected(){}async connectPort(t={}){const{device:e=null,requestPortIfMissing:i=!0}=t;if(!navigator.bluetooth){this.emitAppLog("error","Web Bluetooth API is not available in this browser"),this.updateLinkState("error");return}if(!(this.isConnecting||this.isConnected())){this.isConnecting=!0,this.updateLinkState("connecting"),console.log("Connecting to BLE link...");try{if(e)this.device=e,console.log(`Using provided Bluetooth device: ${e.name||e.id}`);else if(i)this.emitAppLog("info","Requesting Bluetooth LE device"),this.device=await navigator.bluetooth.requestDevice({filters:[{namePrefix:"du-"}],optionalServices:[this.serviceUuid]}),this.emitAppLog("info",`Selected Bluetooth device: ${this.device.name||this.device.id}`);else{this.updateLinkState("disconnected");return}this.device.addEventListener("gattserverdisconnected",this.onGattDisconnected),this.emitAppLog("info","Connecting to BLE GATT server"),this.server=await this.device.gatt.connect(),this.emitAppLog("info","Discovering BLE primary services"),this.service=await this.findPrimaryService(this.server),this.emitAppLog("info",`Using BLE service ${this.service.uuid}`);const o=await this.service.getCharacteristics();this.emitAppLog("info",`Discovered ${o.length} BLE characteristic(s)`);for(const n of o)this.emitAppLog("debug",`Characteristic ${n.uuid} notify=${!!n.properties.notify} write=${!!n.properties.write} writeWithoutResponse=${!!n.properties.writeWithoutResponse}`),!this.notifyCharacteristic&&n.properties.notify&&(this.notifyCharacteristic=n),!this.writeCharacteristic&&(n.properties.write||n.properties.writeWithoutResponse)&&(this.writeCharacteristic=n);if(!this.notifyCharacteristic||!this.writeCharacteristic)throw new Error("BLE UART characteristics not found");this.emitAppLog("info",`Using notify characteristic ${this.notifyCharacteristic.uuid}`),this.emitAppLog("info",`Using write characteristic ${this.writeCharacteristic.uuid}`),this.emitAppLog("info","Enabling BLE notifications"),this.notifyCharacteristic.addEventListener("characteristicvaluechanged",this.onCharacteristicValueChanged);try{this.notificationsEnabled=!0,this.emitAppLog("info","Starting BLE notifications"),await this.notifyCharacteristic.startNotifications(),this.emitAppLog("info","BLE notifications started")}catch(n){if((n==null?void 0:n.name)==="InvalidModificationError")this.emitAppLog("warn","BLE notifications could not be enabled; continuing with write-only connection attempt",{error:String((n==null?void 0:n.message)||n)});else throw n}this.readBuffer="",this.emitAppLog("info","Bluetooth LE UART connected"),this.emitAppLog("info","Calling host onPortConnected hook"),await this.onPortConnected(),this.emitAppLog("info","Host onPortConnected hook completed"),this.updateLinkState("connected")}catch(o){if((o==null?void 0:o.name)==="NotFoundError"){this.emitAppLog("warn","Bluetooth device selection was cancelled or no device was chosen"),await this.cleanupConnectionState(),this.updateLinkState("disconnected");return}console.error("Error connecting BLE link:",o),this.emitAppLog("error","Failed to connect BLE link",{error:String((o==null?void 0:o.message)||o)}),await this.cleanupConnectionState(),this.updateLinkState("error")}finally{this.isConnecting=!1,!this.isConnected()&&this.linkState==="connecting"&&this.updateLinkState("disconnected")}}}async disconnectPort(t={}){var i;const{intentional:e=!1}=t;if(!this.device&&!this.server){this.updateLinkState("disconnected");return}try{if(this.notifyCharacteristic)try{this.notifyCharacteristic.removeEventListener("characteristicvaluechanged",this.onCharacteristicValueChanged),this.notificationsEnabled&&await this.notifyCharacteristic.stopNotifications()}catch{}this.device&&this.device.removeEventListener("gattserverdisconnected",this.onGattDisconnected),(i=this.server)!=null&&i.connected&&this.server.disconnect()}catch(o){console.error("Error disconnecting BLE link:",o),this.emitAppLog("warn","Error disconnecting BLE link")}finally{await this.cleanupConnectionState(),await this.onPortDisconnected(),e&&this.emitAppLog("info","Bluetooth LE UART disconnected"),this.updateLinkState("disconnected")}}async cleanupConnectionState(){this.notifyCharacteristic=null,this.writeCharacteristic=null,this.notificationsEnabled=!1,this.service=null,this.server=null,this.device=null,this.readBuffer=""}async writeLine(t){if(!this.writeCharacteristic)throw new Error("BLE link is not writable.");const e=String(t).replace(/[\r\n]+$/,""),i=this.encoder.encode(`${e}\r
`);this.emitAppLog("debug",`TX ${e}`),await this.writeCharacteristic.writeValue(i)}async write(t){if(!this.writeCharacteristic)throw new Error("BLE link is not writable.");const e=typeof t=="string"?this.encoder.encode(t):t;await this.writeCharacteristic.writeValue(e)}onGattDisconnected(){this.handlePortLost()}async handlePortLost(t=null){!this.device&&!this.server&&!this.notifyCharacteristic&&!this.writeCharacteristic||(t?this.emitAppLog("warn","Bluetooth LE device disconnected",{error:String((t==null?void 0:t.message)||t)}):this.emitAppLog("warn","Bluetooth LE device disconnected"),await this.cleanupConnectionState(),await this.onPortDisconnected(),this.updateLinkState("disconnected"))}onCharacteristicValueChanged(t){var o;const e=(o=t==null?void 0:t.target)==null?void 0:o.value;if(!e)return;const i=e.buffer?new Uint8Array(e.buffer,e.byteOffset,e.byteLength):e;this.pushChunk(i)}pushChunk(t){this.readBuffer+=this.decoder.decode(t,{stream:!0});const e=this.readBuffer.split(/\r?\n/);this.readBuffer=e.pop()||"";for(const i of e)this.handleIncoming(i)}handleIncoming(t){this.counter+=1,this.dispatchEvent(new CustomEvent("serial-line",{detail:{line:t,counter:this.counter},bubbles:!0,composed:!0}))}}const B=document.createElement("template");B.innerHTML=`
  <style>
    ${u}
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
        <div class="top-bar">
            <div class="" id="title">Title</div>
            <div class=""><select class="" id="selectTestProcedure"></select></div>
            <div class=""><select class="" id="selectPlateDiameter"></select></div>
        <slot></slot>
        </div>
    </div>
`;class Z extends HTMLElement{static get observedAttributes(){return["title","componentIdentifier"]}constructor(){super();const t=this.attachShadow({mode:"open"});t.append(B.content.cloneNode(!0)),this.titleElement=t.getElementById("title"),this.onLanguageChange=this.onLanguageChange.bind(this),this.componentIdentifier=this.getAttribute("componentIdentifier")||"ProcedureBar",this.selectTestProcedureElement=t.getElementById("selectTestProcedure"),this.onTestProcedureChange=this.onTestProcedureChange.bind(this),this.selectPlateDiameterElement=t.getElementById("selectPlateDiameter"),this.onPlateDiameterChange=this.onPlateDiameterChange.bind(this)}connectedCallback(){document.addEventListener("app-language-change",this.onLanguageChange),this.selectTestProcedureElement.addEventListener("change",this.onTestProcedureChange),this.selectPlateDiameterElement.addEventListener("change",this.onPlateDiameterChange),this.initTestProcedures(),this.render()}attributeChangedCallback(){this.componentIdentifier=this.getAttribute("componentIdentifier")||"ProcedureBar",this.render()}disconnectedCallback(){document.removeEventListener("app-language-change",this.onLanguageChange),this.selectTestProcedureElement.removeEventListener("change",this.onTestProcedureChange),this.selectPlateDiameterElement.removeEventListener("change",this.onPlateDiameterChange)}async onLanguageChange(t){const e=t==null?void 0:t.detail;typeof e=="string"||e==null||e.code;const i=e==null?void 0:e.catalog;i&&await this.applyLanguageChange(i)}async applyLanguageChange(t){var i;const e=((i=t==null?void 0:t[this.componentIdentifier])==null?void 0:i.title)||"ProcedureBar";this.titleElement.textContent=e}onTestProcedureChange(t){console.log(t);let e=this.selectTestProcedureElement.value;this.loadTestProcedure(e)}onPlateDiameterChange(t){console.log(t)}async initTestProcedures(){const i=await(await fetch("/wc/test_procedures/procedures.json")).json();let o=this.selectTestProcedureElement;for(;o.hasChildNodes();)o.removeChild(o.firstChild);let n=i.options;for(let r=0;r<n.length;r++){let d=document.createElement("option");d.text=n[r].label,d.value=n[r].fileName,i.factoryDefault==d.value&&(d.selected=!0),this.selectTestProcedureElement.add(d)}this.loadTestProcedure(i.factoryDefault)}async loadTestProcedure(t){const e=`/wc/test_procedures/${t}`,o=await(await fetch(e)).json();let n=o.plateDiameterOptions,r=this.selectPlateDiameterElement;for(;r.hasChildNodes();)r.removeChild(r.firstChild);for(let d=0;d<n.length;d++){let g=document.createElement("option");g.text=n[d],g.value=n[d],o.plateDiameter_mm==g.value&&(g.selected=!0),this.selectPlateDiameterElement.add(g)}}render(){this.titleElement.textContent=this.getAttribute("title")||"ProcedureBar"}}customElements.define("gc-procedure-bar",Z);const G=document.createElement("template");G.innerHTML=`
  <style>
    ${u}
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
`;class H extends HTMLElement{static get observedAttributes(){return["title","componentIdentifier","pumpState"]}constructor(){super();const t=this.attachShadow({mode:"closed"});t.append(G.content.cloneNode(!0)),this.titleElement=t.getElementById("title"),this.onLanguageChange=this.onLanguageChange.bind(this),this.componentIdentifier=this.getAttribute("componentIdentifier")||"Pump",this.upButtonElement=t.getElementById("upButton"),this.onPumpUpClick=this.onPumpUpClick.bind(this),this.offButtonElement=t.getElementById("offButton"),this.onPumpOffClick=this.onPumpOffClick.bind(this),this.downButtonElement=t.getElementById("downButton"),this.onPumpDownClick=this.onPumpDownClick.bind(this)}connectedCallback(){document.addEventListener("app-language-change",this.onLanguageChange),this.upButtonElement.addEventListener("click",this.onPumpUpClick),this.offButtonElement.addEventListener("click",this.onPumpOffClick),this.downButtonElement.addEventListener("click",this.onPumpDownClick),this.pState=0,this.pumpState=this.getAttribute("pumpState")||"0",this.render()}disconnectedCallback(){document.removeEventListener("app-language-change",this.onLanguageChange),this.upButtonElement.removeEventListener("click",this.onPumpUpClick),this.offButtonElement.removeEventListener("click",this.onPumpOffClick),this.downButtonElement.removeEventListener("click",this.onPumpDownClick)}attributeChangedCallback(){console.log("Attr changed"),this.componentIdentifier=this.getAttribute("componentIdentifier")||"Pump",this.render()}get pumpState(){return this.pState}set pumpState(t){t!=this.pState&&(console.log("SetPumpState "+t),this.pState=t,this.updatePumpState(this.pState))}updatePumpState(t){this.downButtonElement.classList.remove("is-active"),this.offButtonElement.classList.remove("is-active"),this.upButtonElement.classList.remove("is-active"),t===0&&this.offButtonElement.classList.add("is-active"),t===1&&this.upButtonElement.classList.add("is-active"),t===2&&this.downButtonElement.classList.add("is-active")}async onLanguageChange(t){const e=t==null?void 0:t.detail;typeof e=="string"||e==null||e.code;const i=e==null?void 0:e.catalog;i&&await this.applyLanguageChange(i)}async applyLanguageChange(t){var i;const e=((i=t==null?void 0:t[this.componentIdentifier])==null?void 0:i.title)||"Pump";this.titleElement.textContent=e}onPumpUpClick(t){this.sendCmd("pump=up")}onPumpOffClick(t){this.sendCmd("pump=off")}onPumpDownClick(t){this.sendCmd("pump=down")}render(){this.titleElement.textContent=this.getAttribute("title")||"Pump"}sendCmd(t){return document.dispatchEvent(new CustomEvent("gc-send-cmd",{detail:{textLine:t,componentIdentifier:this.componentIdentifier}})),!0}}customElements.define("gc-pump-control",H);const J=document.createElement("template");J.innerHTML=`
  <style>
    ${u}
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
`;const c={IDLE:0,WAIT_FOR_TARGET_PRESSURE:1,EVALUATE_Z_SPEED:2,EVALUATION_PASSED:3,EVALUATION_FAILED:4,TEST_COMPLETED:5};class Y extends HTMLElement{static get observedAttributes(){return["title","componentIdentifier"]}constructor(){super();const t=this.attachShadow({mode:"open"});t.append(J.content.cloneNode(!0)),this.titleElement=t.getElementById("title"),this.componentIdentifier=this.getAttribute("componentIdentifier")||"DataUnit",this.onLanguageChange=this.onLanguageChange.bind(this),this.usbButton=document.getElementById("usbButton"),this.onUsbLinkLog=this.onUsbLinkLog.bind(this),this.onUsbLinkStatus=this.onUsbLinkStatus.bind(this),this.onUsbSerialLine=this.onUsbSerialLine.bind(this),this.toggleUsbConnection=this.toggleUsbConnection.bind(this),this.bleButton=document.getElementById("bleButton"),this.onBleLinkLog=this.onBleLinkLog.bind(this),this.onBleLinkStatus=this.onBleLinkStatus.bind(this),this.onBleSerialLine=this.onBleSerialLine.bind(this),this.toggleBleConnection=this.toggleBleConnection.bind(this),this.usbLink=new N({componentIdentifier:this.componentIdentifier,storageScope:this.id||this.componentIdentifier||"default"}),this.bleLink=new T({componentIdentifier:this.componentIdentifier,serviceUuid:"6e400001-b5a3-f393-e0a9-e50e24dcca9e"}),this.message=t.getElementById("message");const e=20,i={};i.z=0,i.t=0,this.history=new Array(e).fill(i),this.phase=c.IDLE;const o={};o.nr=1,o.name="Forbelastning",o.targetPressure=0,o.pressure=0,o.force=0,o.distance=0,o.velocity=0,o.vMax=.02,o.dt=0,o.tMax=60,o.hhmmss="00:00:00",o.passed=!1,this.testResult=o,this.deltaPressure=0,this.currentPressure=0,this.currentTarget=0,this.velocity=0,this.vMax=.02,this.secondsElapsed=0,this.tMax=60,this.nextStateMachineUpdate=Date.now()+1e3,this.secondsPause=0,this.nyTargetPressureElement=t.getElementById("targetPressure"),this.nyPressureElement=t.getElementById("pressure"),this.nyForceElement=t.getElementById("force"),this.nyDistanceElement=t.getElementById("distance"),this.nyVelocityElement=t.getElementById("velocity"),this.pumpControlElement=t.getElementById("pumpControl"),this.targetPressureField=t.getElementById("targetPressureField"),this.targetPressureField.addEventListener("change",n=>{this.targetPressure=this.targetPressureField.value;let r=`pump:target=${this.targetPressure}`;this.sendCmd(r),this.message.textContent=`REQUEST ${this.targetPressure} kPa`,this.secondsPause=2})}connectedCallback(){document.addEventListener("app-language-change",this.onLanguageChange),this.usbButton.addEventListener("click",this.toggleUsbConnection),this.usbLink.addEventListener("app-log",this.onUsbLinkLog),this.usbLink.addEventListener("port-status-change",this.onUsbLinkStatus),this.usbLink.addEventListener("serial-line",this.onUsbSerialLine),this.usbLink.startMonitoring(),this.usbLink.enableAutoConnect(),this.bleButton.addEventListener("click",this.toggleBleConnection),this.bleLink.addEventListener("app-log",this.onUsbLinkLog),this.bleLink.addEventListener("port-status-change",this.onBleLinkStatus),this.bleLink.addEventListener("serial-line",this.onBleSerialLine),this.bleLink.startMonitoring(),this.targetPressure=0,this.render()}disconnectedCallback(){document.removeEventListener("app-language-change",this.onLanguageChange),this.usbButton.removeEventListener("click",this.toggleUsbConnection),this.usbLink.removeEventListener("app-log",this.onUsbLinkLog),this.usbLink.removeEventListener("port-status-change",this.onUsbLinkStatus),this.usbLink.removeEventListener("serial-line",this.onUsbSerialLine),this.usbLink.stopMonitoring(),this.usbLink.disconnectPort({intentional:!0}),this.bleButton.removeEventListener("click",this.toggleBleConnection),this.bleLink.removeEventListener("port-status-change",this.onBleLinkStatus),this.bleLink.removeEventListener("serial-line",this.onBleSerialLine),this.bleLink.stopMonitoring(),this.bleLink.disconnectPort({intentional:!0})}setBatteryState(t,e){var i=document.getElementById("batteryIcon");i.classList.remove("fa-battery-0"),i.classList.remove("fa-battery-1"),i.classList.remove("fa-battery-2"),i.classList.remove("fa-battery-3"),i.classList.add(`fa-battery-${e}`),i.title=`Batt ${t} V`}toggleUsbConnection(){this.usbLink.getPortStatus().state==="connected"?this.usbLink.disconnectPort({intentional:!0}):this.usbLink.connectPort()}toggleBleConnection(){this.bleLink.getPortStatus().state==="connected"?this.bleLink.disconnectPort({intentional:!0}):this.bleLink.connectPort()}getJsObject(t,e){const i=String(t||"").trim().split(",");var o="{",n=0;for(let r=0;r<i.length;r++){const d=i[r];let g=d.indexOf(":"),b=d,a="";if(g!=-1){b=d.substring(0,g),a=d.substring(g+1);let l=`"${b}": ${a}`;if(n==0?o+=l:o+=","+l,n++,e){let h=this.shadowRoot.getElementById(b);h!=null&&(h.textContent=a)}}}o+="}";try{return JSON.parse(o)}catch{return null}}addNewDistanceToHistory(t){let e=this.history.length;for(let r=e-1;r>0;r--)this.history[r]=this.history[r-1];const i={};i.z=t,i.t=Date.now(),this.history[0]=i;let o=this.history[0].z-this.history[e-1].z,n=this.history[0].t-this.history[e-1].t;return n>0&&(this.velocity=6e4*o/n),this.velocity=Math.round(this.velocity*1e3)/1e3,this.velocity}updateStateMachine(){let t="";if(!(Date.now()<this.nextStateMachineUpdate)){if(this.nextStateMachineUpdate=Date.now()+1e3,this.secondsPause>0){this.secondsPause--;return}switch(this.phase){case c.IDLE:break;case c.WAIT_FOR_TARGET_PRESSURE:this.targetPressureReached&&(t="TARGET PRESSURE REACHED",this.message.textContent=t,this.phase=c.EVALUATE_Z_SPEED,this.testResult.hhmmss=new Date().toLocaleTimeString("en-GB"),this.secondsElapsed=0,this.secondsPause=1);break;case c.EVALUATE_Z_SPEED:this.testResult.velocity=this.velocity,this.testResult.dt=this.secondsElapsed,t=`EVAL v = ${this.velocity.toFixed(3)} mm/min [${this.secondsElapsed}/${this.tMax}]`,this.message.textContent=t,Math.abs(this.velocity)<this.vMax&&(this.phase=c.EVALUATION_PASSED),this.secondsElapsed>=this.tMax&&(this.phase=c.EVALUATION_FAILED),this.secondsElapsed++;break;case c.EVALUATION_PASSED:this.testResult.velocity=this.velocity,this.testResult.dt=this.secondsElapsed,this.testResult.passed=!0,this.emitTestMeasurement("new-measurement",this.testResult),console.log(this.testResult),t=`PASS v = ${this.velocity.toFixed(3)} < ${this.vMax} mm/min after ${this.secondsElapsed} s`,this.message.textContent=t,this.phase=c.TEST_COMPLETED,this.secondsPause=4;break;case c.EVALUATION_FAILED:this.testResult.velocity=this.velocity,this.testResult.dt=this.secondsElapsed,this.testResult.passed=!1,this.emitTestMeasurement("new-measurement",this.testResult),console.log(this.testResult),t=`FAIL v = ${this.velocity.toFixed(3)} > ${this.vMax} mm/min after ${this.secondsElapsed} s`,this.message.textContent=t,this.phase=c.TEST_COMPLETED,this.secondsPause=4;break;case c.TEST_COMPLETED:this.phase=c.IDLE,this.targetPressureReached=!1,this.message.textContent="TEST COMPLETED",this.secondsPause=2;break}}}processIncomingLine(t){let e=String(t);if(e.startsWith("$F,")){let i=this.getJsObject(t,!1);if(i===null)return;let o=i.p/100,n=i.f/100,r=i.z/1e3;this.nyPressureElement.value=o,this.nyForceElement.value=n,this.nyDistanceElement.value=r,Date.now()-this.history[0].t>=500&&(this.nyVelocityElement.value=this.addNewDistanceToHistory(r)),this.pumpControlElement.pumpState=i.h,this.phase==c.EVALUATE_Z_SPEED&&o>this.testResult.pressure&&(this.testResult.pressure=o)}else if(e.startsWith("$GC_BATT,")){let i=this.getJsObject(t,!0);if(i==null)return;this.setBatteryState(i.voltage,i.level)}else if(e.startsWith("$REQUESTED,target")){let i=this.getJsObject(t,!0);if(i==null)return;this.testResult.targetPressure=i.target,this.nyTargetPressureElement.value=i.target,this.testResult.dt=0,this.targetPressureField.value=this.testResult.targetPressure,this.phase=c.WAIT_FOR_TARGET_PRESSURE}else if(e.startsWith("$REACHED,target")){let i=this.getJsObject(t,!0);if(i==null)return;this.testResult.targetPressure=i.target,this.nyTargetPressureElement.value=i.target,this.testResult.pressure=i.p,this.testResult.force=i.f,this.testResult.distance=i.z,this.targetPressureReached=!0}this.updateStateMachine()}attributeChangedCallback(){this.componentIdentifier=this.getAttribute("componentIdentifier")||"DataUnit",this.usbLink.configure({componentIdentifier:this.componentIdentifier,storageScope:this.id||this.componentIdentifier||"default"}),this.render()}onUsbLinkLog(t){const e=(t==null?void 0:t.detail)||{},i=e.level||"info",o=e.source||"UsbLink",n=e.message||"(no message)";this.emitAppLog(i,`[${o}] ${n}`)}onUsbLinkStatus(t){var i;const e=(i=t==null?void 0:t.detail)==null?void 0:i.state;e&&(e==="connected"?(this.usbButton.style.color="green",this.sendCmd("du:batt?",{target:"usb"})):this.usbButton.style.color="black")}onBleLinkLog(t){const e=(t==null?void 0:t.detail)||{},i=e.level||"info",o=e.source||"BleLink",n=e.message||"(no message)";this.emitAppLog(i,`[${o}] ${n}`)}resolveSendTarget(t="auto"){var i,o;const e=String(t||"auto").trim().toLowerCase();return e==="usb"||e==="ble"||e==="any"||e==="both"||e==="all"?e:((i=this.usbLink)==null?void 0:i.linkState)==="connected"?"usb":((o=this.bleLink)==null?void 0:o.linkState)==="connected"?"ble":"any"}dispatchSendCmdEvent(t,e={}){const i=typeof t=="string"?t.trim():"";if(!i)return!1;const o=this.resolveSendTarget(e.target);return document.dispatchEvent(new CustomEvent("gc-send-cmd",{detail:{textLine:i,target:o,componentIdentifier:this.componentIdentifier}})),!0}sendCmd(t,e={}){return this.dispatchSendCmdEvent(t,e)}onBleLinkStatus(t){var i;const e=(i=t==null?void 0:t.detail)==null?void 0:i.state;e&&(e==="connected"?(this.bleButton.style.color="green",this.sendCmd("du:batt?",{target:"ble"})):this.bleButton.style.color="black")}onUsbSerialLine(t){var i;const e=(i=t==null?void 0:t.detail)==null?void 0:i.line;if(typeof e=="string"){const o=e.trim();o.startsWith("$")?this.processIncomingLine(o):this.emitAppLog("debug",`RX line: ${o}`)}}onBleSerialLine(t){var i;const e=(i=t==null?void 0:t.detail)==null?void 0:i.line;if(typeof e=="string"){const o=e.trim();o.startsWith("$")?this.processIncomingLine(o):this.emitAppLog("debug",`RX line: ${o}`)}}async onLanguageChange(t){var o;const e=t==null?void 0:t.detail;typeof e=="string"||e==null||e.code;const i=e==null?void 0:e.catalog;if(i&&this.titleElement!=null){const n=((o=i==null?void 0:i[this.componentIdentifier])==null?void 0:o.title)||"Data Unit";this.titleElement.textContent=n}}addTrace(t,e){let i="debug";t==="ERR"&&(i="error"),this.emitAppLog(i,`${t}: ${e}`)}emitAppLog(t,e,i={}){this.dispatchEvent(new CustomEvent("app-log",{detail:{level:t,source:this.id||this.tagName.toLowerCase(),message:e,...i},bubbles:!0,composed:!0}))}emitTestMeasurement(t,e,i={}){this.dispatchEvent(new CustomEvent("test-measurement",{detail:{action:t,source:this.id||this.tagName.toLowerCase(),measurement:e,...i},bubbles:!0,composed:!0}))}render(){this.titleElement!=null&&(this.titleElement.textContent=this.getAttribute("title")||"DU")}parseNumber(t){const e=Number.parseFloat(t);return Number.isFinite(e)?e:null}formatMetric(t,e,i){return t==null?i:t.toFixed(e)}}customElements.define("gc-dataunit",Y);const W=document.createElement("template");W.innerHTML=`
  <style>
    ${u}
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
`;class O extends HTMLElement{static get observedAttributes(){return["title","componentIdentifier"]}constructor(){super();const t=this.attachShadow({mode:"open"});t.append(W.content.cloneNode(!0)),this.titleElement=t.getElementById("title"),this.onLanguageChange=this.onLanguageChange.bind(this),this.componentIdentifier=this.getAttribute("componentIdentifier")||"MeasurementGraph"}connectedCallback(){document.addEventListener("app-language-change",this.onLanguageChange);let t=this.componentIdentifier;document.addEventListener(t+"-add-row",this.onAddRow.bind(this)),this.render()}attributeChangedCallback(){this.componentIdentifier=this.getAttribute("componentIdentifier")||"MeasurementGraph",this.render()}disconnectedCallback(){document.removeEventListener("app-language-change",this.onLanguageChange);let t=this.componentIdentifier;document.removeEventListener(t+"-add-row",this.onAddRow.bind(this))}async onAddRow(t){const e=t==null?void 0:t.detail;e&&Array.isArray(e.rowData)&&this.appendRowToTable(e.rowData)}async onLanguageChange(t){const e=t==null?void 0:t.detail;typeof e=="string"||e==null||e.code;const i=e==null?void 0:e.catalog;i&&await this.applyLanguageChange(i)}async applyLanguageChange(t){var n,r;const e=((n=t==null?void 0:t[this.componentIdentifier])==null?void 0:n.title)||"Graph";this.titleElement.textContent=e;const i=this.getMeasurementTableHeader(t);i&&this.setTableHeaderWithUnits(i);const o=((r=t==null?void 0:t[this.componentIdentifier])==null?void 0:r.blankRows)||5;this.getRowCount()!=o&&this.initBlankLines(o-this.getRowCount())}initBlankLines(t){const e=this.shadowRoot.getElementById("tableHeaderRow").children.length;for(let i=0;i<t;i++)this.appendRowToTable(new Array(e).fill(""))}getMeasurementTableHeader(t){var i;const e=(i=t==null?void 0:t[this.componentIdentifier])==null?void 0:i.tableHeader;return!e||typeof e!="object"?null:Array.isArray(e)?e:Object.values(e)}addTrace(t,e){let i="debug";t==="ERR"&&(i="error"),this.emitAppLog(i,`${t}: ${e}`)}render(){this.titleElement.textContent=this.getAttribute("title")||"Graph"}setTableHeader(t){const e=this.shadowRoot.getElementById("tableHeaderRow");e.innerHTML="",t.forEach(i=>{const o=document.createElement("th");o.textContent=i,e.appendChild(o)})}setTableHeaderWithUnits(t){const e=this.shadowRoot.getElementById("tableHeaderRow");e.innerHTML="",t.forEach(i=>{const o=document.createElement("th");(i.label===void 0||i.label===null)&&(i.label="????"),i.unit!==null&&i.unit!==void 0?o.innerHTML=i.label+"<br>["+i.unit+"]":o.textContent=i.label,i.tooltip!==void 0&&i.tooltip!==null&&i.tooltip!==""&&(o.title=i.tooltip),e.appendChild(o)})}appendRowToTable(t){const e=this.shadowRoot.getElementById("tableBody"),i=document.createElement("tr");t.forEach(o=>{const n=document.createElement("td");n.textContent=o,i.appendChild(n)}),e.appendChild(i)}getRowCount(){return this.shadowRoot.getElementById("tableBody").rows.length}removeRowFromTable(t){const e=this.shadowRoot.getElementById("tableBody");t>=0&&t<e.rows.length&&e.deleteRow(t)}removeAllRowsFromTable(){const t=this.shadowRoot.getElementById("tableBody");t.innerHTML="",this.render()}parseNumber(t){const e=Number.parseFloat(t);return Number.isFinite(e)?e:null}formatMetric(t,e,i){return t==null?i:t.toFixed(e)}}customElements.define("gc-graph",O);const X="data:application/json;base64,ew0KICAgICJpMThuIjogew0KICAgICAgICAiZW4iOiAiRW5nbGlzaCINCiAgICB9LA0KICAgICJQcm9jZWR1cmVCYXIiOiB7DQogICAgICAgICJ0aXRsZSI6ICJUZXN0OiINCiAgICB9LA0KICAgICJEYXRhVW5pdCI6IHsNCiAgICAgICAgInRpdGxlIjogIkRhdGEgVW5pdCIsDQogICAgICAgICJwcm9wZXJ0aWVzIjogWw0KICAgICAgICAgICAgeyJsYWJlbCI6ICJUYXJnZXQiLCAgImtleSI6InRwIiwgInVuaXQiOiAia1BhIiwgInRvb2x0aXAiOiAiRGVzaXJlZCBwcmVzc3VyZSBpbiBraWxvcGFzY2FscyJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJQcmVzc3VyZSIsImtleSI6InAiLCAgInVuaXQiOiAia1BhIiwgInRvb2x0aXAiOiAiT2JzZXJ2ZWQgcHJlc3N1cmUgaW4ga2lsb3Bhc2NhbHMifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiRm9yY2UiLCAgICJrZXkiOiJmIiwgICJ1bml0IjogImtOIiwgICJ0b29sdGlwIjogIkZvcmNlIGluIGtpbG9uZXd0b24ifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiU2V0dGxpbmciLCJrZXkiOiJ6IiwgICJ1bml0IjogIm1tIiwgInRvb2x0aXAiOiAiU2V0dGxpbmcgZGlzdGFuY2UgaW4gbWlsbGltZXRlcnMifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiU3BlZWQiLCAgICJrZXkiOiJ2IiwgICJ1bml0IjogIm1tL21pbiIsICJ0b29sdGlwIjogIlNldHRsaW5nIHNwZWVkIGluIG1pbGxpbWV0ZXJzIHBlciBtaW51dGUifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiVGltZSIsICAgICJrZXkiOiJ0IiwgICJ1bml0IjogImhoOm1tOnNzIiwgInRvb2x0aXAiOiAiV2hlbiBtZWFzdXJlbWVudCB3YXMgdGFrZW4ifQ0KICAgICAgICBdDQogICAgfSwNCiAgICAiTWVhc3VyZW1lbnRHcmFwaCI6IHsNCiAgICAgICAgInRpdGxlIjogIk1lYXN1cmVtZW50IEdyYXBoIiwNCiAgICAgICAgInRhYmxlSGVhZGVyIjogWw0KICAgICAgICAgICAgeyJsYWJlbCI6ICJYIEF4aXMiLCAidW5pdCI6ICJtbSIsICJ0b29sdGlwIjogIlggYXhpcyBsYWJlbCJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJZIEF4aXMiLCAidW5pdCI6ICJrUGEiLCAidG9vbHRpcCI6ICJZIGF4aXMgbGFiZWwifQ0KICAgICAgICBdDQogICAgfSwNCiAgICAiTWVhc3VyZW1lbnRUYWJsZSI6IHsNCiAgICAgICAgInRpdGxlIjogIk1lYXN1cmVtZW50IFRhYmxlIiwNCiAgICAgICAgImJsYW5rUm93cyI6IDEwLCANCiAgICAgICAgInRhYmxlSGVhZGVyIjogWw0KICAgICAgICAgICAgeyJsYWJlbCI6ICJTdGVwIiwgInRvb2x0aXAiOiAiU3RlcCBudW1iZXIifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiUGhhc2UiLCAidG9vbHRpcCI6ICJQaGFzZSJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJUYXJnZXQgUHJlc3N1cmUiLCAidW5pdCI6ICJrUGEiLCAidG9vbHRpcCI6ICJEZXNpcmVkIHByZXNzdXJlIGluIGtpbG9wYXNjYWxzIn0sDQogICAgICAgICAgICB7ImxhYmVsIjogIlBlYWsgUHJlc3N1cmUiLCAidW5pdCI6ICJrUGEiLCAidG9vbHRpcCI6ICJPYnNlcnZlZCBwcmVzc3VyZSBpbiBraWxvcGFzY2FscyJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJTZXR0bGluZyIsICJ1bml0IjogIm1tIiwgInRvb2x0aXAiOiAiU2V0dGxpbmcgZGlzdGFuY2UgaW4gbWlsbGltZXRlcnMifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiU3BlZWQiLCAidW5pdCI6ICJtbS9taW4iLCAidG9vbHRpcCI6ICJTZXR0bGluZyBzcGVlZCBpbiBtaWxsaW1ldGVycyBwZXIgbWludXRlIn0sDQogICAgICAgICAgICB7ImxhYmVsIjogIlRpbWUiLCAidW5pdCI6ICJoaDptbTpzcyIsICJ0b29sdGlwIjogIldoZW4gbWVhc3VyZW1lbnQgd2FzIHRha2VuIn0sDQogICAgICAgICAgICB7ImxhYmVsIjogIlJlc3VsdCIsICAidG9vbHRpcCI6ICJSZXN1bHQgb2Ygc3RhYmlsaXR5IHRlc3QifQ0KICAgICAgICBdDQogICAgfSwNCiAgICAiU3VtbWFyeVRhYmxlIjogew0KICAgICAgICAidGl0bGUiOiAiU3VtbWFyeSBUYWJsZSIsDQogICAgICAgICJibGFua1Jvd3MiOiA0LA0KICAgICAgICAidGFibGVIZWFkZXIiOiBbDQogICAgICAgICAgICB7ImxhYmVsIjogIlRlc3QgIyIsICJ0b29sdGlwIjogIlRlc3QgbnVtYmVyIn0sDQogICAgICAgICAgICB7ImxhYmVsIjogIkV2MSIsICJ1bml0IjogIk1QYSIsICJ0b29sdGlwIjogIkV2MSBpbiBtZWdhcGFzY2FscyJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJFdjIiLCAidW5pdCI6ICJNUGEiLCAidG9vbHRpcCI6ICJFdjIgaW4gbWVnYXBhc2NhbHMifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiRXYyL0V2MSIsICJ0b29sdGlwIjogIkV2MiBkaXZpZGVkIGJ5IEV2MSJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJSb2FkIFJlZiIsICJ0b29sdGlwIjogIlJvYWQgcmVmZXJlbmNlIn0sDQogICAgICAgICAgICB7ImxhYmVsIjogIkxvY2F0aW9uIiwgInRvb2x0aXAiOiAiTG9jYXRpb24gb2YgdGhlIHRlc3QifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiU3RhcnQgVGltZSIsICJ0b29sdGlwIjogIlN0YXJ0IHRpbWUgb2YgdGhlIHRlc3QifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiRW5kIFRpbWUiLCAidG9vbHRpcCI6ICJFbmQgdGltZSBvZiB0aGUgdGVzdCJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJSZXBvcnQiLCAidG9vbHRpcCI6ICJUZXN0IHJlcG9ydCJ9DQogICAgICAgIF0NCiAgICB9DQoNCn0NCg==",U="data:application/json;base64,ew0KICAgICJpMThuIjogew0KICAgICAgICAibm8iOiAiTm9yc2siDQogICAgfSwNCiAgICAiUHJvY2VkdXJlQmFyIjogew0KICAgICAgICAidGl0bGUiOiAiVGVzdDoiDQogICAgfSwNCiAgICAiRGF0YVVuaXQiOiB7DQogICAgICAgICJ0aXRsZSI6ICJEYXRhbW9kdWwiLA0KICAgICAgICAicHJvcGVydGllcyI6IFsNCiAgICAgICAgICAgIHsibGFiZWwiOiAiTcOlbHRyeWtrIiwgICAia2V5IjoidHAiLCAidW5pdCI6ICJrUGEiLCAidG9vbHRpcCI6ICLDmG5za2V0IHRyeWtrIGkga2lsb3Bhc2NhbCJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJUcnlrayIsICAgICAgImtleSI6InAiLCAgInVuaXQiOiAia1BhIiwgInRvb2x0aXAiOiAiT2JzZXJ2ZXJ0ZSB0cnlrayBpIGtpbG9wYXNjYWwifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiS3JhZnQiLCAgICAgICJrZXkiOiJmIiwgICJ1bml0IjogImtOIiwgICJ0b29sdGlwIjogIktyYWZ0IGkga2lsb25ld3RvbiJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJTZXRuaW5nIiwgICAgImtleSI6InoiLCAgInVuaXQiOiAibW0iLCAidG9vbHRpcCI6ICJTZXRuaW5nIGF2IGJha2tlbiBpIG1pbGxpbWV0ZXIifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiSGFzdGlnaGV0IiwgICJrZXkiOiJ2IiwgICJ1bml0IjogIm1tL21pbiIsICJ0b29sdGlwIjogIlNpZ2hhc3RpZ2hldCBpIG1pbGxpbWV0ZXIgcGVyIG1pbnV0dCJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJUaWQiLCAgICAgICAgImtleSI6InQiLCAgInVuaXQiOiAiaGg6bW06c3MiLCAidG9vbHRpcCI6ICJOw6VyIG3DpWxpbmdlbiBibGUgdGF0dCJ9DQogICAgICAgIF0NCiAgICB9LA0KICAgICJNZWFzdXJlbWVudEdyYXBoIjogew0KICAgICAgICAidGl0bGUiOiAiTcOlbGUgZ3JhZiIsDQogICAgICAgICJibGFua1Jvd3MiOiA1LA0KICAgICAgICAidGFibGVIZWFkZXIiOiBbDQogICAgICAgICAgICB7ImxhYmVsIjogIk/FmyBYIiwgInVuaXQiOiAibW0iLCAidG9vbHRpcCI6ICJFdHlraWV0YSBvc2kgWCJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJPxZsgWSIsICJ1bml0IjogImtQYSIsICJ0b29sdGlwIjogIkV0eWtpZXRhIG9zaSBZIn0NCiAgICAgICAgXQ0KICAgIH0sDQogICAgIk1lYXN1cmVtZW50VGFibGUiOiB7DQogICAgICAgICJ0aXRsZSI6ICJNw6VsaW5nc3RhYmVsbCIsDQogICAgICAgICJibGFua1Jvd3MiOiAxMCwNCiAgICAgICAgInRhYmxlSGVhZGVyIjogWw0KICAgICAgICAgICAgeyJsYWJlbCI6ICJTdGVnIiwgInRvb2x0aXAiOiAiU3RlZyBudW1tZXIifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiRmFzZSIsICJ0b29sdGlwIjogIkZhc2UifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiTcOlbHRyeWtrIiwgInVuaXQiOiAia1BhIiwgInRvb2x0aXAiOiAiw5huc2tldCB0cnlrayBpIGtpbG9wYXNjYWwifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiVHJ5a2siLCAidW5pdCI6ICJrUGEiLCAidG9vbHRpcCI6ICJPYnNlcnZlcnRlIHRyeWtrIGkga2lsb3Bhc2NhbCJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJTZXRuaW5nIiwgInVuaXQiOiAibW0iLCAidG9vbHRpcCI6ICJTZXRuaW5nIGF2IGJha2tlbiBpIG1pbGxpbWV0ZXIifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiSGFzdGlnaGV0IiwgInVuaXQiOiAibW0vbWluIiwgInRvb2x0aXAiOiAiU2lnaGFzdGlnaGV0IGkgbWlsbGltZXRlciBwZXIgbWludXR0In0sDQogICAgICAgICAgICB7ImxhYmVsIjogIlRpZCIsICJ1bml0IjogImhoOm1tOnNzIiwgInRvb2x0aXAiOiAiTsOlciBtw6VsaW5nZW4gYmxlIHRhdHQifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiUmVzdWx0YXQiLCAgInRvb2x0aXAiOiAiUmVzdWx0YXQgYXYgc3RhYmlsaXRldHN0ZXN0In0NCiAgICAgICAgXSAgIA0KICAgIH0sDQogICAgIlN1bW1hcnlUYWJsZSI6IHsNCiAgICAgICAgInRpdGxlIjogIlNhbW1lbmRyYWdzdGFiZWxsIiwNCiAgICAgICAgImJsYW5rUm93cyI6IDQsDQogICAgICAgICJ0YWJsZUhlYWRlciI6IFsNCiAgICAgICAgICAgIHsibGFiZWwiOiAiVGVzdCAjIiwgInRvb2x0aXAiOiAiVGVzdCBudW1tZXIifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiRXYxIiwgInVuaXQiOiAiTVBhIiwgInRvb2x0aXAiOiAiRXYxIGkgbWVnYXBhc2NhbHMifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiRXYyIiwgInVuaXQiOiAiTVBhIiwgInRvb2x0aXAiOiAiRXYyIGkgbWVnYXBhc2NhbHMifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiRXYyL0V2MSIsICJ0b29sdGlwIjogIkV2MiBkZWx0IHDDpSBFdjEifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiVmVpcmVmZXJhbnNlIiwgInRvb2x0aXAiOiAiVmVpcmVmZXJhbnNlIn0sDQogICAgICAgICAgICB7ImxhYmVsIjogIkxva2Fzam9uIiwgInRvb2x0aXAiOiAiTG9rYXNqb24gYXYgdGVzdGVuIn0sDQogICAgICAgICAgICB7ImxhYmVsIjogIlN0YXJ0dGlkIiwgInRvb2x0aXAiOiAiU3RhcnR0aWQgZm9yIHRlc3RlbiJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJTbHV0dGlkIiwgInRvb2x0aXAiOiAiU2x1dHRpZCBmb3IgdGVzdGVuIn0sDQogICAgICAgICAgICB7ImxhYmVsIjogIlJhcHBvcnQiLCAidG9vbHRpcCI6ICJUZXN0cmFwcG9ydCJ9DQogICAgICAgIF0NCiAgICB9DQoNCg0KfQ0K",z="data:application/json;base64,ew0KICAgICJpMThuIjogew0KICAgICAgICAicGwiOiAiUG9sc2tpIg0KICAgIH0sDQogICAgIlByb2NlZHVyZUJhciI6IHsNCiAgICAgICAgInRpdGxlIjogIlRlc3R1OiINCiAgICB9LA0KICAgICJEYXRhVW5pdCI6IHsNCiAgICAgICAgInRpdGxlIjogIkplZG5vc3RrYSBkYW55Y2giLA0KICAgICAgICAicHJvcGVydGllcyI6IFsNCiAgICAgICAgICAgIHsibGFiZWwiOiAiQ2VsIiwgICAgICAgImtleSI6InRwIiwgICJ1bml0IjogImtQYSIsICJ0b29sdGlwIjogIkRvY2Vsb3dlIGNpxZtuaWVuaWUgdyBraWxvcGFza2FsYWNoIn0sDQogICAgICAgICAgICB7ImxhYmVsIjogIkNpxZtuaWVuaWUiLCAia2V5IjoicCIsICAgInVuaXQiOiAia1BhIiwgInRvb2x0aXAiOiAiT2JzZXJ3b3dhbmUgY2nFm25pZW5pZSB3IGtpbG9wYXNrYWxhY2gifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiRm9yY2UiLCAgICAgImtleSI6ImYiLCAgICJ1bml0IjogImtOIiwgICJ0b29sdGlwIjogIkZvcmNlIGluIGtpbG9uZXd0b24ifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiT3NhZHplbmllIiwgImtleSI6InoiLCAgICJ1bml0IjogIm1tIiwgInRvb2x0aXAiOiAiT2RsZWfFgm/Fm8SHIG9zYWR6ZW5pYSB3IG1pbGltZXRyYWNoIn0sDQogICAgICAgICAgICB7ImxhYmVsIjogIlByxJlka2/Fm8SHIiwgICJrZXkiOiJ2IiwgICAidW5pdCI6ICJtbS9taW4iLCAidG9vbHRpcCI6ICJQcsSZZGtvxZvEhyBvc2FkemVuaWEgdyBtaWxpbWV0cmFjaCBuYSBtaW51dMSZIn0sDQogICAgICAgICAgICB7ImxhYmVsIjogIkN6YXMiLCAgICAgICJrZXkiOiJ0IiwgICAidW5pdCI6ICJoaDptbTpzcyIsICJ0b29sdGlwIjogIkN6YXMgd3lrb25hbmlhIHBvbWlhcnUifQ0KICAgICAgICBdDQogICAgfSwNCiAgICAiTWVhc3VyZW1lbnRHcmFwaCI6IHsNCiAgICAgICAgInRpdGxlIjogIld5a3JlcyBwb21pYXJvd3kiLA0KICAgICAgICAiYmxhbmtSb3dzIjogNSwNCiAgICAgICAgInRhYmxlSGVhZGVyIjogWw0KICAgICAgICAgICAgeyJsYWJlbCI6ICJPxZsgWCIsICJ1bml0IjogIm1tIiwgInRvb2x0aXAiOiAiRXR5a2lldGEgb3NpIFgifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiT8WbIFkiLCAidW5pdCI6ICJrUGEiLCAidG9vbHRpcCI6ICJFdHlraWV0YSBvc2kgWSJ9DQogICAgICAgIF0NCiAgICB9LA0KICAgICJNZWFzdXJlbWVudFRhYmxlIjogew0KICAgICAgICAidGl0bGUiOiAiVGFiZWxhIHBvbWlhcm93YSIsDQogICAgICAgICJibGFua1Jvd3MiOiAxMCwNCiAgICAgICAgInRhYmxlSGVhZGVyIjogWw0KICAgICAgICAgICAgeyJsYWJlbCI6ICJLcm9rIiwgInRvb2x0aXAiOiAiTnVtZXIga3Jva3UifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiRmF6YSIsICJ0b29sdGlwIjogIkZhemEifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiQ2VsIiwgInVuaXQiOiAia1BhIiwgInRvb2x0aXAiOiAiRG9jZWxvd2UgY2nFm25pZW5pZSB3IGtpbG9wYXNrYWxhY2gifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiQ2nFm25pZW5pZSIsICJ1bml0IjogImtQYSIsICJ0b29sdGlwIjogIk9ic2Vyd293YW5lIGNpxZtuaWVuaWUgdyBraWxvcGFza2FsYWNoIn0sDQogICAgICAgICAgICB7ImxhYmVsIjogIk9zYWR6ZW5pZSIsICJ1bml0IjogIm1tIiwgInRvb2x0aXAiOiAiT2RsZWfFgm/Fm8SHIG9zYWR6ZW5pYSB3IG1pbGltZXRyYWNoIn0sDQogICAgICAgICAgICB7ImxhYmVsIjogIlByxJlka2/Fm8SHIiwgInVuaXQiOiAibW0vbWluIiwgInRvb2x0aXAiOiAiUHLEmWRrb8WbxIcgb3NhZHplbmlhIHcgbWlsaW1ldHJhY2ggbmEgbWludXTEmSJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJDemFzIiwgInVuaXQiOiAiaGg6bW06c3MiLCAidG9vbHRpcCI6ICJDemFzIHd5a29uYW5pYSBwb21pYXJ1In0sDQogICAgICAgICAgICB7ImxhYmVsIjogIld5bmlrIiwgICJ0b29sdGlwIjogIld5bmlrIHRlc3R1IHN0YWJpbG5vxZtjaSJ9DQogICAgICAgIF0NCiAgICB9LA0KICAgICJTdW1tYXJ5VGFibGUiOiB7DQogICAgICAgICJ0aXRsZSI6ICJUYWJlbGEgcG9kc3Vtb3d1asSFY2EiLA0KICAgICAgICAiYmxhbmtSb3dzIjogNCwNCiAgICAgICAgInRhYmxlSGVhZGVyIjogWw0KICAgICAgICAgICAgeyJsYWJlbCI6ICJUZXN0ICMiLCAidG9vbHRpcCI6ICJOdW1lciB0ZXN0dSJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJFdjEiLCAidW5pdCI6ICJNUGEiLCAidG9vbHRpcCI6ICJFdjEgdyBtZWdhcGFza2FsYWNoIn0sDQogICAgICAgICAgICB7ImxhYmVsIjogIkV2MiIsICJ1bml0IjogIk1QYSIsICJ0b29sdGlwIjogIkV2MiB3IG1lZ2FwYXNrYWxhY2gifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiRXYyL0V2MSIsICJ0b29sdGlwIjogIkV2MiBwb2R6aWVsb25lIHByemV6IEV2MSJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJPZG5pZXNpZW5pZSBkbyBkcm9naSIsICJ0b29sdGlwIjogIk9kbmllc2llbmllIGRvIGRyb2dpIn0sDQogICAgICAgICAgICB7ImxhYmVsIjogIkxva2FsaXphY2phIiwgInRvb2x0aXAiOiAiTG9rYWxpemFjamEgdGVzdHUifSwNCiAgICAgICAgICAgIHsibGFiZWwiOiAiQ3phcyByb3pwb2N6xJljaWEiLCAidG9vbHRpcCI6ICJDemFzIHJvenBvY3rEmWNpYSB0ZXN0dSJ9LA0KICAgICAgICAgICAgeyJsYWJlbCI6ICJDemFzIHpha2/FhGN6ZW5pYSIsICJ0b29sdGlwIjogIkN6YXMgemFrb8WEY3plbmlhIHRlc3R1In0sDQogICAgICAgICAgICB7ImxhYmVsIjogIlJhcG9ydCIsICJ0b29sdGlwIjogIlJhcG9ydCB6IHRlc3R1In0NCiAgICAgICAgXQ0KICAgIH0NCg0KfQ0K",D=[{code:"en",label:"English"},{code:"pl",label:"Polski"},{code:"no",label:"Norsk"}],w={supportedLanguages:D},A=new Map,f=new Map;function M(s){return typeof s!="string"?"":s.trim().slice(0,2).toLowerCase()}async function j(s){const t=M(s);if(!t)return null;if(A.has(t))return A.get(t);if(f.has(t))return f.get(t);const e=(async()=>{try{const i=new URL(Object.assign({"./en_lang.json":X,"./no_lang.json":U,"./pl_lang.json":z})[`./${t}_lang.json`],import.meta.url),o=await fetch(i);if(!o.ok)throw new Error(`Locale file not found: ${t}`);const n=await o.json();return A.set(t,n),n}finally{f.delete(t)}})();return f.set(t,e),e}let v=()=>{};document.addEventListener("DOMContentLoaded",()=>{const s=document.getElementById("gcLangSelect"),t=document.getElementById("langButton");if(s){const e=Array.isArray(w==null?void 0:w.supportedLanguages)?w.supportedLanguages:[];e.forEach(i=>{const o=document.createElement("option");o.value=i.code,o.textContent=i.label,s.appendChild(o)}),v=Q(s,t,e),v(),s.addEventListener("change",i=>{L(i.target.value)})}});document.addEventListener("app-language-change",s=>{const t=document.getElementById("gcLangSelect");t&&(t.value=s.detail.code,v())});function Q(s,t,e){if(!s)return()=>{};if(s.classList.add("gc-hidden-lang-select"),!t)return()=>{};const i=document.createElement("div");i.className="gc-lang-menu",i.hidden=!0,i.setAttribute("role","listbox"),i.setAttribute("aria-label","Select language"),(Array.isArray(e)?e:[]).forEach(a=>{const l=document.createElement("button");l.type="button",l.className="gc-lang-menu-item",l.dataset.langCode=a.code,l.textContent=a.label,l.addEventListener("click",()=>{const h=String(a.code||"").trim().slice(0,2).toLowerCase();h&&(s.value!==h&&(s.value=h),s.dispatchEvent(new Event("change",{bubbles:!0})),n())}),i.appendChild(l)}),document.body.appendChild(i),t.setAttribute("aria-haspopup","listbox"),t.setAttribute("aria-expanded","false");function n(){i.hidden||(i.hidden=!0,t.setAttribute("aria-expanded","false"))}function r(){const a=t.getBoundingClientRect(),l=8;i.style.left="0px",i.style.top="0px";const h=i.getBoundingClientRect();let p=a.right-h.width;p=Math.max(l,p),p=Math.min(p,window.innerWidth-h.width-l);let m=a.bottom+6;const I=window.innerHeight-h.height-l;m>I&&(m=Math.max(l,a.top-h.height-6)),i.style.left=`${Math.round(p)}px`,i.style.top=`${Math.round(m)}px`}function d(){i.hidden&&(i.hidden=!1,r(),t.setAttribute("aria-expanded","true"))}function g(){i.hidden?d():n()}function b(){var m,I;const a=((m=s.selectedOptions)==null?void 0:m[0])||null,l=((I=a==null?void 0:a.textContent)==null?void 0:I.trim())||"Language",h=(a==null?void 0:a.value)||s.value||"";t.title=l,t.setAttribute("aria-label",l),i.querySelectorAll(".gc-lang-menu-item").forEach(C=>{const E=String(C.dataset.langCode||"")===String(h||"");C.classList.toggle("is-active",E),C.setAttribute("aria-selected",E?"true":"false")})}return t.addEventListener("click",a=>{a.preventDefault(),a.stopPropagation(),g()}),i.addEventListener("click",a=>{a.stopPropagation()}),document.addEventListener("click",a=>{const l=a.target;!t.contains(l)&&!i.contains(l)&&n()}),window.addEventListener("resize",()=>{i.hidden||r()}),window.addEventListener("scroll",()=>{i.hidden||r()},!0),document.addEventListener("keydown",a=>{a.key==="Escape"&&n()}),b}async function L(s){const t=String(s||"").trim().slice(0,2).toLowerCase();if(!t)return;document.documentElement.lang=t;try{localStorage.setItem("gc.app.language",t)}catch{}const e=await j(t);document.dispatchEvent(new CustomEvent("app-language-change",{detail:{code:t,catalog:e}}))}window.setAppLanguage=L;let y="en";try{y=localStorage.getItem("gc.app.language")||document.documentElement.lang||"en"}catch{y=document.documentElement.lang||"en"}L(y);
